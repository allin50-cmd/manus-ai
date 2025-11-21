/**
 * IP Vault Routes
 * Secure upload and audit endpoints for intellectual property vault
 *
 * Features:
 * - User-delegation SAS token generation for secure client uploads
 * - SHA-256 hash verification after upload
 * - Audit logging to database
 * - Optional Key Vault encryption for metadata
 */

import express from 'express';
import {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  ContainerSASPermissions,
  SASProtocol,
} from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { CryptographyClient } from '@azure/keyvault-keys';
import crypto from 'crypto';
import pkg from 'pg';
const { Pool } = pkg;

const router = express.Router();

// Configuration from environment
const STORAGE_ACCOUNT = process.env.STORAGE_ACCOUNT || 'ultaivaultstore';
const KV_NAME = process.env.KEYVAULT_NAME || 'ultracore-kv';
const KEY_NAME = process.env.VAULT_KEY_NAME || 'vaultline-cmk';
const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
const POSTGRES_PORT = process.env.POSTGRES_PORT || 5432;
const POSTGRES_DB = process.env.POSTGRES_DB || 'ultracore';
const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'postgres';

// Azure credential (uses managed identity in production)
const credential = new DefaultAzureCredential();
const blobServiceClient = new BlobServiceClient(
  `https://${STORAGE_ACCOUNT}.blob.core.windows.net`,
  credential
);

// PostgreSQL connection pool
const pool = new Pool({
  host: POSTGRES_HOST,
  port: POSTGRES_PORT,
  database: POSTGRES_DB,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Logging helper
function log(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  console.log(
    JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
    })
  );
}

/**
 * POST /api/ip-vault/request-sas
 *
 * Request a SAS token for uploading a file to the tenant's IP vault
 *
 * Body:
 *   - tenantSlug: string (required)
 *   - filename: string (required)
 *   - contentType: string (optional)
 *   - expiryMinutes: number (optional, default 10)
 */
router.post('/request-sas', async (req, res) => {
  try {
    const { tenantSlug, filename, contentType, expiryMinutes = 10 } = req.body;

    if (!tenantSlug || !filename) {
      return res.status(400).json({
        ok: false,
        error: 'tenantSlug and filename are required',
      });
    }

    // Validate tenant slug format
    if (!/^[a-z0-9-]+$/.test(tenantSlug)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid tenant slug format',
      });
    }

    const containerName = `tenant-${tenantSlug}`;
    const blobName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    log('info', 'Generating SAS token for upload', {
      tenantSlug,
      containerName,
      blobName,
      contentType,
    });

    // Get container client
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Ensure container exists
    await containerClient.createIfNotExists({
      metadata: {
        tenantSlug,
        purpose: 'ip-vault',
      },
    });

    // Get user delegation key (short-lived, recommended for security)
    const now = new Date();
    const expiry = new Date(now.getTime() + expiryMinutes * 60 * 1000);
    const userDelegationKey = await blobServiceClient.getUserDelegationKey(now, expiry);

    // Generate SAS token with limited permissions
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: ContainerSASPermissions.parse('cw'), // create, write only
        startsOn: now,
        expiresOn: expiry,
        protocol: SASProtocol.Https, // HTTPS only
        contentType: contentType || 'application/octet-stream',
      },
      userDelegationKey,
      STORAGE_ACCOUNT
    ).toString();

    const blobClient = containerClient.getBlockBlobClient(blobName);
    const uploadUrl = `${blobClient.url}?${sasToken}`;

    log('info', 'SAS token generated successfully', {
      tenantSlug,
      blobName,
      expiresIn: `${expiryMinutes} minutes`,
    });

    res.json({
      ok: true,
      uploadUrl,
      blobName,
      containerName,
      expiresAt: expiry.toISOString(),
      expiresInMinutes: expiryMinutes,
      instructions: {
        method: 'PUT',
        url: uploadUrl,
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': contentType || 'application/octet-stream',
        },
        note: 'After upload completes, call /api/ip-vault/upload-callback with blobName',
      },
    });
  } catch (error) {
    log('error', 'Failed to generate SAS token', {
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ip-vault/upload-callback
 *
 * Callback after client completes upload
 * Computes SHA-256 hash and creates audit log
 *
 * Body:
 *   - tenantSlug: string (required)
 *   - blobName: string (required)
 *   - uploader: string (optional, user identifier)
 *   - metadata: object (optional, additional metadata)
 */
router.post('/upload-callback', async (req, res) => {
  try {
    const { tenantSlug, blobName, uploader, metadata = {} } = req.body;

    if (!tenantSlug || !blobName) {
      return res.status(400).json({
        ok: false,
        error: 'tenantSlug and blobName are required',
      });
    }

    const containerName = `tenant-${tenantSlug}`;

    log('info', 'Processing upload callback', {
      tenantSlug,
      containerName,
      blobName,
      uploader,
    });

    // Get blob client
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(blobName);

    // Check if blob exists
    const exists = await blobClient.exists();
    if (!exists) {
      return res.status(404).json({
        ok: false,
        error: 'Blob not found - upload may have failed',
      });
    }

    // Get blob properties
    const properties = await blobClient.getProperties();

    // Download blob to compute SHA-256 hash
    const downloadResponse = await blobClient.download();
    const hash = crypto.createHash('sha256');

    await new Promise((resolve, reject) => {
      downloadResponse.readableStreamBody.on('data', (chunk) => hash.update(chunk));
      downloadResponse.readableStreamBody.on('end', () => resolve());
      downloadResponse.readableStreamBody.on('error', reject);
    });

    const sha256 = hash.digest('hex');

    log('info', 'SHA-256 hash computed', {
      tenantSlug,
      blobName,
      sha256,
      sizeBytes: properties.contentLength,
    });

    // Insert audit record in database
    const auditDetails = JSON.stringify({
      blobName,
      containerName,
      sha256,
      sizeBytes: properties.contentLength,
      contentType: properties.contentType,
      uploader: uploader || 'unknown',
      uploadedAt: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
      metadata,
    });

    await pool.query(
      `INSERT INTO deployments (tenant, bundle, action, status, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        tenantSlug,
        'ip-vault-upload',
        'file_upload',
        'completed',
        auditDetails,
      ]
    );

    log('info', 'Audit log entry created', {
      tenantSlug,
      blobName,
      sha256,
    });

    // Optionally: Encrypt metadata and store in Key Vault
    if (KEY_NAME && KV_NAME) {
      try {
        const keyUrl = `https://${KV_NAME}.vault.azure.net/keys/${KEY_NAME}`;
        const cryptoClient = new CryptographyClient(keyUrl, credential);

        const metadataJson = JSON.stringify({
          blobName,
          sha256,
          uploader,
          timestamp: new Date().toISOString(),
          ...metadata,
        });

        const plaintext = Buffer.from(metadataJson, 'utf8');
        const encryptResult = await cryptoClient.encrypt('RSA-OAEP', plaintext);

        // Store encrypted metadata (you could save this to a dedicated table)
        log('info', 'Metadata encrypted with Key Vault', {
          tenantSlug,
          blobName,
          keyName: KEY_NAME,
        });

        // Note: In production, store encryptResult.result in a varbinary column
        // This example just logs it
      } catch (kvError) {
        log('warn', 'Failed to encrypt metadata (non-fatal)', {
          error: kvError.message,
        });
      }
    }

    // Return success response
    res.json({
      ok: true,
      sha256,
      blobName,
      containerName,
      sizeBytes: properties.contentLength,
      contentType: properties.contentType,
      auditLogged: true,
      blobUrl: blobClient.url,
    });
  } catch (error) {
    log('error', 'Upload callback failed', {
      error: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/ip-vault/:tenantSlug/files
 *
 * List files in tenant's IP vault
 */
router.get('/:tenantSlug/files', async (req, res) => {
  try {
    const { tenantSlug } = req.params;
    const { limit = 100, prefix } = req.query;

    const containerName = `tenant-${tenantSlug}`;
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Check if container exists
    const exists = await containerClient.exists();
    if (!exists) {
      return res.status(404).json({
        ok: false,
        error: 'Tenant vault not found',
      });
    }

    const files = [];
    const options = {
      prefix,
    };

    for await (const blob of containerClient.listBlobsFlat(options)) {
      files.push({
        name: blob.name,
        size: blob.properties.contentLength,
        contentType: blob.properties.contentType,
        lastModified: blob.properties.lastModified,
        etag: blob.properties.etag,
      });

      if (files.length >= limit) break;
    }

    res.json({
      ok: true,
      tenantSlug,
      containerName,
      files,
      count: files.length,
    });
  } catch (error) {
    log('error', 'Failed to list files', {
      error: error.message,
    });

    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

/**
 * GET /health
 *
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');

    res.json({
      ok: true,
      service: 'IP Vault API',
      database: 'connected',
      storage: STORAGE_ACCOUNT,
      keyVault: KV_NAME,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      service: 'IP Vault API',
      database: 'error',
      error: error.message,
    });
  }
});

export default router;
