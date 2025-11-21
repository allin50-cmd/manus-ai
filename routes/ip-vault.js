/**
 * IP Vault Upload & Audit Routes
 *
 * Provides secure blob upload endpoints with:
 * - Time-limited SAS token generation (user delegation key)
 * - Post-upload verification and SHA-256 hashing
 * - Audit logging to VaultLine.AuditLog
 * - Optional Key Vault encryption for metadata
 *
 * Prerequisites:
 * - Azure Storage Account with containers per tenant
 * - Managed identity with Storage Blob Data Contributor role
 * - Key Vault with CMK for encryption (optional)
 * - SQL database with VaultLine schema
 *
 * Usage:
 *   const ipVaultRouter = require('./routes/ip-vault');
 *   app.use('/api/ip-vault', ipVaultRouter);
 *
 * Environment Variables:
 *   STORAGE_ACCOUNT    - Storage account name (e.g., ultaivaultstore)
 *   KEYVAULT_NAME      - Key Vault name for metadata encryption
 *   VAULT_KEY_NAME     - Key Vault key name for encryption (optional)
 *   SQL_SERVER         - Azure SQL server FQDN
 *   SQL_DATABASE       - Database name
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Azure SDK imports
const { DefaultAzureCredential } = require('@azure/identity');
const {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  StorageSharedKeyCredential
} = require('@azure/storage-blob');
const { CryptographyClient } = require('@azure/keyvault-keys');
const sql = require('mssql');

// Configuration from environment
const STORAGE_ACCOUNT = process.env.STORAGE_ACCOUNT || 'ultaivaultstore';
const KV_NAME = process.env.KEYVAULT_NAME || 'ultai-rg-prod-kv';
const KEY_NAME = process.env.VAULT_KEY_NAME || 'vaultline-cmk';
const SQL_SERVER = process.env.SQL_SERVER;
const SQL_DATABASE = process.env.SQL_DATABASE || 'ultai_db';

// Initialize Azure credential
const credential = new DefaultAzureCredential();
const blobServiceClient = new BlobServiceClient(
  `https://${STORAGE_ACCOUNT}.blob.core.windows.net`,
  credential
);

// SQL connection pool (reusable)
let sqlPool = null;

/**
 * Initialize SQL connection pool
 */
async function getSqlPool() {
  if (sqlPool && sqlPool.connected) {
    return sqlPool;
  }

  const SQL_TOKEN_SCOPE = "https://database.windows.net/.default";
  const token = await credential.getToken(SQL_TOKEN_SCOPE);

  const config = {
    server: SQL_SERVER,
    database: SQL_DATABASE,
    options: {
      encrypt: true,
      enableArithAbort: true,
      trustServerCertificate: false
    },
    authentication: {
      type: 'azure-active-directory-access-token',
      options: {
        token: token.token
      }
    },
    pool: {
      max: 10,
      min: 2,
      idleTimeoutMillis: 30000
    }
  };

  sqlPool = await sql.connect(config);
  return sqlPool;
}

/**
 * POST /request-sas
 *
 * Issues a short-lived SAS token for client-side blob upload
 *
 * Request body:
 *   {
 *     "tenantSlug": "stork-nhs",
 *     "filename": "contract.pdf",
 *     "contentType": "application/pdf"  (optional)
 *   }
 *
 * Response:
 *   {
 *     "uploadUrl": "https://...blob.core.windows.net/tenant-stork-nhs/1234567890-contract.pdf?sv=...",
 *     "blobName": "1234567890-contract.pdf",
 *     "expiresAt": "2024-01-15T12:30:00Z"
 *   }
 */
router.post('/request-sas', async (req, res) => {
  try {
    const { tenantSlug, filename, contentType } = req.body;

    // Validation
    if (!tenantSlug || !filename) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['tenantSlug', 'filename']
      });
    }

    // Sanitize filename
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const containerName = `tenant-${tenantSlug}`;
    const timestamp = Date.now();
    const blobName = `${timestamp}-${sanitizedFilename}`;

    console.log(`[IP-Vault] SAS request: tenant=${tenantSlug}, file=${blobName}`);

    // Get container client
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Ensure container exists
    await containerClient.createIfNotExists({
      access: 'private',
      metadata: {
        tenant: tenantSlug,
        createdBy: 'ip-vault-api'
      }
    });

    // Generate user delegation SAS (recommended - no account key needed)
    const now = new Date();
    const expiresOn = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
    const userDelegationKey = await blobServiceClient.getUserDelegationKey(now, expiresOn);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("cw"), // create, write
        startsOn: now,
        expiresOn: expiresOn,
        contentType: contentType || undefined
      },
      userDelegationKey,
      STORAGE_ACCOUNT
    ).toString();

    const blobClient = containerClient.getBlockBlobClient(blobName);
    const uploadUrl = `${blobClient.url}?${sasToken}`;

    // Log SAS issuance
    console.log(`[IP-Vault] SAS issued: ${blobName} (expires ${expiresOn.toISOString()})`);

    res.json({
      uploadUrl,
      blobName,
      containerName,
      expiresAt: expiresOn.toISOString(),
      instructions: {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': contentType || 'application/octet-stream'
        }
      }
    });

  } catch (error) {
    console.error('[IP-Vault] SAS request error:', error);
    res.status(500).json({
      error: 'Failed to generate SAS token',
      message: error.message
    });
  }
});

/**
 * POST /upload-callback
 *
 * Called by client after successful upload to:
 * 1. Verify blob exists
 * 2. Compute SHA-256 hash
 * 3. Write audit log
 * 4. (Optional) Encrypt metadata in Key Vault
 *
 * Request body:
 *   {
 *     "tenantSlug": "stork-nhs",
 *     "blobName": "1234567890-contract.pdf",
 *     "uploader": "user@example.com",  (optional)
 *     "metadata": { ... }               (optional custom metadata)
 *   }
 *
 * Response:
 *   {
 *     "ok": true,
 *     "sha256": "abc123...",
 *     "blobUrl": "https://...blob.core.windows.net/tenant-stork-nhs/...",
 *     "sizeBytes": 102400,
 *     "auditId": "uuid"
 *   }
 */
router.post('/upload-callback', async (req, res) => {
  try {
    const { tenantSlug, blobName, uploader, metadata } = req.body;

    if (!tenantSlug || !blobName) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['tenantSlug', 'blobName']
      });
    }

    const containerName = `tenant-${tenantSlug}`;
    console.log(`[IP-Vault] Upload callback: tenant=${tenantSlug}, blob=${blobName}`);

    // Step 1: Verify blob exists and get properties
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(blobName);

    let blobProperties;
    try {
      blobProperties = await blobClient.getProperties();
    } catch (error) {
      if (error.statusCode === 404) {
        return res.status(404).json({
          error: 'Blob not found',
          message: 'Upload may have failed or blob was deleted'
        });
      }
      throw error;
    }

    const sizeBytes = blobProperties.contentLength;
    console.log(`[IP-Vault] Blob verified: ${blobName} (${sizeBytes} bytes)`);

    // Step 2: Download and compute SHA-256
    const downloadResponse = await blobClient.download();
    const hash = crypto.createHash('sha256');

    await new Promise((resolve, reject) => {
      downloadResponse.readableStreamBody
        .on('data', chunk => hash.update(chunk))
        .on('end', resolve)
        .on('error', reject);
    });

    const sha256 = hash.digest('hex');
    console.log(`[IP-Vault] SHA-256 computed: ${sha256}`);

    // Step 3: Write audit log to database
    const pool = await getSqlPool();
    const auditDetails = JSON.stringify({
      blobName,
      sha256,
      sizeBytes,
      uploader: uploader || 'anonymous',
      contentType: blobProperties.contentType,
      metadata: metadata || {},
      timestamp: new Date().toISOString()
    });

    const auditQuery = `
      INSERT INTO VaultLine.AuditLog (ActionType, EntityType, EntityID, Details, UserAgent, IPAddress, Timestamp)
      OUTPUT INSERTED.AuditID
      VALUES (@action, @etype, @eid, @details, @ua, @ip, GETUTCDATE());
    `;

    const auditResult = await pool.request()
      .input('action', sql.NVarChar, 'IPVaultUpload')
      .input('etype', sql.NVarChar, 'Blob')
      .input('eid', sql.NVarChar, blobName)
      .input('details', sql.NVarChar, auditDetails)
      .input('ua', sql.NVarChar, req.headers['user-agent'] || null)
      .input('ip', sql.NVarChar, req.ip || req.connection.remoteAddress || null)
      .query(auditQuery);

    const auditId = auditResult.recordset[0]?.AuditID;
    console.log(`[IP-Vault] Audit logged: ID=${auditId}`);

    // Step 4: (Optional) Encrypt and store metadata in Key Vault
    let kvSecretName = null;
    if (KEY_NAME && KV_NAME) {
      try {
        const keyUrl = `https://${KV_NAME}.vault.azure.net/keys/${KEY_NAME}`;
        const cryptoClient = new CryptographyClient(keyUrl, credential);

        const metadataPayload = Buffer.from(JSON.stringify({
          tenantSlug,
          blobName,
          sha256,
          sizeBytes,
          uploader,
          metadata,
          auditId,
          timestamp: new Date().toISOString()
        }));

        const encryptResult = await cryptoClient.encrypt({
          algorithm: "RSA-OAEP-256",
          plaintext: metadataPayload
        });

        // Store encrypted data in database
        const encryptQuery = `
          INSERT INTO VaultLine.EncryptedData (DataID, DataType, EncryptedContent, EncryptionKeyName, CreatedDate)
          VALUES (NEWID(), @type, @content, @keyname, GETUTCDATE());
        `;

        await pool.request()
          .input('type', sql.NVarChar, 'ipvault-metadata')
          .input('content', sql.VarBinary, Buffer.from(encryptResult.result))
          .input('keyname', sql.NVarChar, KEY_NAME)
          .query(encryptQuery);

        console.log(`[IP-Vault] Metadata encrypted with Key Vault key: ${KEY_NAME}`);
      } catch (kvError) {
        console.warn('[IP-Vault] Key Vault encryption failed (non-critical):', kvError.message);
        // Continue without encryption
      }
    }

    // Step 5: Success response
    res.json({
      ok: true,
      sha256,
      blobUrl: blobClient.url,
      sizeBytes,
      auditId,
      uploadedAt: new Date().toISOString(),
      tenant: tenantSlug
    });

  } catch (error) {
    console.error('[IP-Vault] Upload callback error:', error);
    res.status(500).json({
      error: 'Upload verification failed',
      message: error.message
    });
  }
});

/**
 * GET /blobs/:tenantSlug
 *
 * List all blobs for a tenant
 *
 * Query params:
 *   ?prefix=2024/  - Filter by prefix
 *   ?limit=100     - Max results (default 100)
 *
 * Response:
 *   {
 *     "tenant": "stork-nhs",
 *     "blobs": [
 *       {
 *         "name": "1234567890-contract.pdf",
 *         "url": "https://...",
 *         "size": 102400,
 *         "createdAt": "2024-01-15T10:00:00Z",
 *         "contentType": "application/pdf"
 *       }
 *     ],
 *     "count": 42
 *   }
 */
router.get('/blobs/:tenantSlug', async (req, res) => {
  try {
    const { tenantSlug } = req.params;
    const { prefix, limit = 100 } = req.query;

    const containerName = `tenant-${tenantSlug}`;
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Check if container exists
    const exists = await containerClient.exists();
    if (!exists) {
      return res.status(404).json({
        error: 'Tenant container not found',
        tenant: tenantSlug
      });
    }

    // List blobs
    const blobs = [];
    const iterator = containerClient.listBlobsFlat({ prefix });

    for await (const blob of iterator) {
      blobs.push({
        name: blob.name,
        url: `${containerClient.url}/${blob.name}`,
        size: blob.properties.contentLength,
        createdAt: blob.properties.createdOn,
        contentType: blob.properties.contentType
      });

      if (blobs.length >= parseInt(limit)) {
        break;
      }
    }

    res.json({
      tenant: tenantSlug,
      containerName,
      blobs,
      count: blobs.length
    });

  } catch (error) {
    console.error('[IP-Vault] List blobs error:', error);
    res.status(500).json({
      error: 'Failed to list blobs',
      message: error.message
    });
  }
});

/**
 * GET /audit/:tenantSlug
 *
 * Retrieve audit logs for a tenant
 *
 * Query params:
 *   ?limit=50  - Max results (default 50)
 *
 * Response:
 *   {
 *     "tenant": "stork-nhs",
 *     "logs": [
 *       {
 *         "auditId": "uuid",
 *         "action": "IPVaultUpload",
 *         "entityId": "1234567890-contract.pdf",
 *         "timestamp": "2024-01-15T10:00:00Z",
 *         "details": { ... }
 *       }
 *     ]
 *   }
 */
router.get('/audit/:tenantSlug', async (req, res) => {
  try {
    const { tenantSlug } = req.params;
    const { limit = 50 } = req.query;

    const pool = await getSqlPool();
    const query = `
      SELECT TOP (@limit)
        AuditID,
        ActionType,
        EntityType,
        EntityID,
        Details,
        UserAgent,
        IPAddress,
        Timestamp
      FROM VaultLine.AuditLog
      WHERE EntityID LIKE @pattern
        OR Details LIKE @pattern
      ORDER BY Timestamp DESC;
    `;

    const result = await pool.request()
      .input('limit', sql.Int, parseInt(limit))
      .input('pattern', sql.NVarChar, `%${tenantSlug}%`)
      .query(query);

    const logs = result.recordset.map(row => ({
      auditId: row.AuditID,
      action: row.ActionType,
      entityType: row.EntityType,
      entityId: row.EntityID,
      details: row.Details ? JSON.parse(row.Details) : null,
      userAgent: row.UserAgent,
      ipAddress: row.IPAddress,
      timestamp: row.Timestamp
    }));

    res.json({
      tenant: tenantSlug,
      logs,
      count: logs.length
    });

  } catch (error) {
    console.error('[IP-Vault] Audit query error:', error);
    res.status(500).json({
      error: 'Failed to retrieve audit logs',
      message: error.message
    });
  }
});

/**
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    const checks = {
      storage: false,
      database: false,
      keyVault: false
    };

    // Check storage
    try {
      await blobServiceClient.getAccountInfo();
      checks.storage = true;
    } catch (e) {
      console.error('[IP-Vault] Storage health check failed:', e.message);
    }

    // Check database
    try {
      const pool = await getSqlPool();
      await pool.request().query('SELECT 1 AS healthy');
      checks.database = true;
    } catch (e) {
      console.error('[IP-Vault] Database health check failed:', e.message);
    }

    // Check Key Vault (optional)
    if (KEY_NAME && KV_NAME) {
      try {
        const keyUrl = `https://${KV_NAME}.vault.azure.net/keys/${KEY_NAME}`;
        const cryptoClient = new CryptographyClient(keyUrl, credential);
        await cryptoClient.encrypt({
          algorithm: "RSA-OAEP-256",
          plaintext: Buffer.from("health-check")
        });
        checks.keyVault = true;
      } catch (e) {
        console.error('[IP-Vault] Key Vault health check failed:', e.message);
      }
    } else {
      checks.keyVault = 'not_configured';
    }

    const healthy = checks.storage && checks.database;
    res.status(healthy ? 200 : 503).json({
      status: healthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
