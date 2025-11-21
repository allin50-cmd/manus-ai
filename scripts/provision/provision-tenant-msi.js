#!/usr/bin/env node

/**
 * UltraCore Tenant Provisioning with Managed Identity
 *
 * Provisions a tenant in the database using Azure AD authentication (no SQL password required).
 * Requires: Azure Managed Identity with database writer role and Key Vault permissions.
 *
 * Usage:
 *   node provision-tenant-msi.js \
 *     --server <server>.database.windows.net \
 *     --database <db> \
 *     --tenantSlug stork-nhs \
 *     --tenantName "Stork Maternity (NHS)" \
 *     --storageAcct ultaivaultstore \
 *     --keyVaultName ultracore-kv \
 *     --plan pro
 */

import { DefaultAzureCredential } from '@azure/identity';
import sql from 'mssql';
import axios from 'axios';
import minimist from 'minimist';

const argv = minimist(process.argv.slice(2));

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Validate required arguments
function validateArgs() {
  const required = ['server', 'database', 'tenantSlug', 'tenantName', 'storageAcct', 'keyVaultName'];
  const missing = required.filter(arg => !argv[arg]);

  if (missing.length > 0) {
    log('red', '❌ Missing required arguments: ' + missing.join(', '));
    console.log('');
    log('cyan', 'Usage:');
    console.log('  node provision-tenant-msi.js \\');
    console.log('    --server <server>.database.windows.net \\');
    console.log('    --database <db> \\');
    console.log('    --tenantSlug <slug> \\');
    console.log('    --tenantName "<name>" \\');
    console.log('    --storageAcct <storage-account> \\');
    console.log('    --keyVaultName <key-vault> \\');
    console.log('    [--plan essentials|pro|enterprise] \\');
    console.log('    [--email <contact-email>]');
    console.log('');
    log('cyan', 'Example:');
    console.log('  node provision-tenant-msi.js \\');
    console.log('    --server ultracore-sql.database.windows.net \\');
    console.log('    --database ultracore_db \\');
    console.log('    --tenantSlug stork-nhs \\');
    console.log('    --tenantName "Stork Maternity (NHS)" \\');
    console.log('    --storageAcct ultaivaultstore \\');
    console.log('    --keyVaultName ultracore-kv \\');
    console.log('    --plan pro');
    process.exit(2);
  }
}

validateArgs();

const config = {
  server: argv.server,
  database: argv.database,
  tenantSlug: argv.tenantSlug,
  tenantName: argv.tenantName,
  contactEmail: argv.email || `${argv.tenantSlug}@${argv.keyVaultName}.ultracore.io`,
  plan: argv.plan || 'essentials',
  storageAccount: argv.storageAcct,
  keyVaultName: argv.keyVaultName,
  note: argv.note || 'Provisioned via MSI script',
};

log('cyan', '╔═══════════════════════════════════════════════════════╗');
log('cyan', '║     UltraCore Tenant Provisioning (MSI)              ║');
log('cyan', '╚═══════════════════════════════════════════════════════╝');
console.log('');
log('blue', 'Configuration:');
console.log(`  Server:        ${config.server}`);
console.log(`  Database:      ${config.database}`);
console.log(`  Tenant Slug:   ${config.tenantSlug}`);
console.log(`  Tenant Name:   ${config.tenantName}`);
console.log(`  Plan:          ${config.plan}`);
console.log(`  Storage:       ${config.storageAccount}`);
console.log(`  Key Vault:     ${config.keyVaultName}`);
console.log('');

// Initialize Azure credentials (uses managed identity or Azure CLI)
const credential = new DefaultAzureCredential();
const sqlTokenScope = 'https://database.windows.net/.default';
const keyVaultTokenScope = 'https://vault.azure.net/.default';

/**
 * Get Azure AD access token for SQL Database
 */
async function getSqlAccessToken() {
  try {
    log('blue', '🔐 Obtaining SQL access token from Azure AD...');
    const tokenResponse = await credential.getToken(sqlTokenScope);
    log('green', '✅ SQL access token obtained');
    return tokenResponse.token;
  } catch (error) {
    log('red', '❌ Failed to obtain SQL access token');
    throw error;
  }
}

/**
 * Get Azure AD access token for Key Vault
 */
async function getKeyVaultAccessToken() {
  try {
    log('blue', '🔐 Obtaining Key Vault access token from Azure AD...');
    const tokenResponse = await credential.getToken(keyVaultTokenScope);
    log('green', '✅ Key Vault access token obtained');
    return tokenResponse.token;
  } catch (error) {
    log('red', '❌ Failed to obtain Key Vault access token');
    throw error;
  }
}

/**
 * Connect to SQL Database using Azure AD token
 */
async function connectToDatabase(accessToken) {
  const sqlConfig = {
    server: config.server,
    database: config.database,
    options: {
      encrypt: true,
      enableArithAbort: true,
      trustServerCertificate: false,
    },
    authentication: {
      type: 'azure-active-directory-access-token',
      options: {
        token: accessToken,
      },
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };

  try {
    log('blue', '🔌 Connecting to SQL Database using MSI token...');
    const pool = await sql.connect(sqlConfig);
    log('green', '✅ Connected to SQL Database');
    return pool;
  } catch (error) {
    log('red', '❌ Failed to connect to SQL Database');
    throw error;
  }
}

/**
 * Create tenant record in database
 */
async function createTenantRecord(pool) {
  const insertTenantQuery = `
    INSERT INTO Tenants (TenantSlug, TenantName, ContactEmail, Plan, Status, Note, CreatedDate)
    OUTPUT INSERTED.TenantID, INSERTED.TenantSlug, INSERTED.CreatedDate
    VALUES (@slug, @name, @email, @plan, 'active', @note, GETUTCDATE());
  `;

  try {
    log('blue', '📝 Creating tenant record in database...');

    const result = await pool
      .request()
      .input('slug', sql.NVarChar, config.tenantSlug)
      .input('name', sql.NVarChar, config.tenantName)
      .input('email', sql.NVarChar, config.contactEmail)
      .input('plan', sql.NVarChar, config.plan)
      .input('note', sql.NVarChar, config.note)
      .query(insertTenantQuery);

    const tenant = result.recordset[0];
    log('green', `✅ Tenant created: ID=${tenant.TenantID}`);

    return tenant;
  } catch (error) {
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      log('yellow', `⚠️  Tenant ${config.tenantSlug} already exists`);
      // Query existing tenant
      const existingResult = await pool
        .request()
        .input('slug', sql.NVarChar, config.tenantSlug)
        .query('SELECT TenantID, TenantSlug, CreatedDate FROM Tenants WHERE TenantSlug = @slug');

      return existingResult.recordset[0];
    }
    throw error;
  }
}

/**
 * Create provision audit entry
 */
async function createProvisionAudit(pool, tenantId) {
  const auditQuery = `
    INSERT INTO ProvisionAudit (TenantSlug, TenantID, Action, Details, Timestamp)
    VALUES (@slug, @tenantId, @action, @details, GETUTCDATE());
  `;

  const details = JSON.stringify({
    tenantSlug: config.tenantSlug,
    tenantName: config.tenantName,
    plan: config.plan,
    storageAccount: config.storageAccount,
    keyVault: config.keyVaultName,
    provisionedBy: 'MSI',
    timestamp: new Date().toISOString(),
  });

  try {
    log('blue', '📋 Writing provision audit...');

    await pool
      .request()
      .input('slug', sql.NVarChar, config.tenantSlug)
      .input('tenantId', sql.Int, tenantId)
      .input('action', sql.NVarChar, 'TenantProvision')
      .input('details', sql.NVarChar, details)
      .query(auditQuery);

    log('green', '✅ Audit entry written');
  } catch (error) {
    log('yellow', '⚠️  Failed to write audit entry (non-fatal)');
    console.error(error.message);
  }
}

/**
 * Store tenant metadata in Key Vault
 */
async function storeKeyVaultSecret(kvToken, tenantId) {
  const secretName = `tenant-${config.tenantSlug}-db-meta`;
  const secretValue = JSON.stringify({
    tenantId,
    slug: config.tenantSlug,
    name: config.tenantName,
    plan: config.plan,
    contactEmail: config.contactEmail,
    storageAccount: config.storageAccount,
    containerName: `tenant-${config.tenantSlug}`,
    backupContainerName: `tenant-${config.tenantSlug}-backups`,
    provisionedDate: new Date().toISOString(),
    provisionedBy: 'MSI',
  });

  const kvUrl = `https://${config.keyVaultName}.vault.azure.net/secrets/${secretName}?api-version=7.4`;

  try {
    log('blue', '🔑 Storing tenant metadata in Key Vault...');

    await axios.put(
      kvUrl,
      {
        value: secretValue,
        contentType: 'application/json',
        attributes: {
          enabled: true,
        },
        tags: {
          tenantSlug: config.tenantSlug,
          provisionedBy: 'MSI',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    log('green', `✅ Key Vault secret created: ${secretName}`);
  } catch (error) {
    log('yellow', '⚠️  Failed to store Key Vault secret (non-fatal)');
    console.error(error.response?.data || error.message);
  }
}

/**
 * Main provisioning flow
 */
async function run() {
  const startTime = Date.now();
  let pool;

  try {
    // Step 1: Get access tokens
    const [sqlToken, kvToken] = await Promise.all([
      getSqlAccessToken(),
      getKeyVaultAccessToken(),
    ]);

    // Step 2: Connect to database
    pool = await connectToDatabase(sqlToken);

    // Step 3: Create tenant record
    const tenant = await createTenantRecord(pool);

    // Step 4: Create audit entry
    await createProvisionAudit(pool, tenant.TenantID);

    // Step 5: Store metadata in Key Vault
    await storeKeyVaultSecret(kvToken, tenant.TenantID);

    // Success summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('');
    log('cyan', '═══════════════════════════════════════════════════════');
    log('green', '✅ TENANT PROVISIONING COMPLETE');
    log('cyan', '═══════════════════════════════════════════════════════');
    console.log('');
    log('blue', 'Tenant Details:');
    console.log(`  Tenant ID:     ${tenant.TenantID}`);
    console.log(`  Slug:          ${config.tenantSlug}`);
    console.log(`  Name:          ${config.tenantName}`);
    console.log(`  Plan:          ${config.plan}`);
    console.log(`  Status:        active`);
    console.log(`  Created:       ${tenant.CreatedDate || 'just now'}`);
    console.log('');
    log('blue', 'Storage Resources:');
    console.log(`  Container:     tenant-${config.tenantSlug}`);
    console.log(`  Backup:        tenant-${config.tenantSlug}-backups`);
    console.log(`  Storage URL:   https://${config.storageAccount}.blob.core.windows.net/tenant-${config.tenantSlug}`);
    console.log('');
    log('blue', 'Key Vault:');
    console.log(`  Secret:        tenant-${config.tenantSlug}-db-meta`);
    console.log(`  Vault URL:     https://${config.keyVaultName}.vault.azure.net`);
    console.log('');
    log('blue', `Duration:        ${duration}s`);
    console.log('');
    log('yellow', 'Next Steps:');
    console.log('  1. Configure custom domain (if needed):');
    console.log(`     ./scripts/provision-tenant-domain.sh ${config.tenantSlug} ${config.tenantSlug}.yourdomain.com ultracore-frontdoor <resource-group>`);
    console.log('  2. Test tenant access:');
    console.log(`     curl https://api.ultracore.io/api/tenants/${config.tenantSlug}`);
    console.log('');

    process.exit(0);
  } catch (error) {
    log('red', '❌ PROVISIONING FAILED');
    console.error(error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

// Run provisioning
run().catch((err) => {
  log('red', '❌ Fatal error during provisioning');
  console.error(err);
  process.exit(1);
});
