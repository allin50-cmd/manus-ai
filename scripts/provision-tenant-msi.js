#!/usr/bin/env node
/**
 * Tenant Provisioning Script with Managed Identity
 *
 * Uses Azure AD authentication (no SQL password required) to:
 * 1. Insert tenant row into ultai.Tenants table
 * 2. Write audit entry to VaultLine.ProvisionAudit
 * 3. Store encrypted metadata in Key Vault
 *
 * Prerequisites:
 * - Run from Azure Cloud Shell, VM, or App Service with managed identity
 * - Identity must have SQL db_datawriter role
 * - Identity must have Key Vault Secrets Officer role
 *
 * Usage:
 *   node provision-tenant-msi.js \
 *     --server ultai-sql-prod.database.windows.net \
 *     --database ultai_db \
 *     --tenantSlug stork-nhs \
 *     --tenantName "Stork Maturity (NHS)" \
 *     --storageAcct ultaivaultstore \
 *     --keyVaultName ultai-rg-prod-kv \
 *     --plan pro \
 *     --email stork@nhs.uk
 */

const { DefaultAzureCredential } = require('@azure/identity');
const sql = require('mssql');
const axios = require('axios');
const minimist = require('minimist');

const argv = minimist(process.argv.slice(2));

// Validate required arguments
const required = ['server', 'database', 'tenantSlug', 'tenantName', 'storageAcct', 'keyVaultName'];
const missing = required.filter(arg => !argv[arg]);

if (missing.length > 0) {
  console.error('❌ Missing required arguments:', missing.join(', '));
  console.error('\nUsage:');
  console.error('  node provision-tenant-msi.js \\');
  console.error('    --server <sql-server>.database.windows.net \\');
  console.error('    --database <database-name> \\');
  console.error('    --tenantSlug <slug> \\');
  console.error('    --tenantName "<display-name>" \\');
  console.error('    --storageAcct <storage-account> \\');
  console.error('    --keyVaultName <key-vault-name> \\');
  console.error('    --plan <essentials|pro|enterprise> \\  (optional, default: essentials)');
  console.error('    --email <contact-email>  (optional)');
  process.exit(2);
}

const credential = new DefaultAzureCredential();
const SQL_TOKEN_SCOPE = "https://database.windows.net/.default";
const KV_TOKEN_SCOPE = "https://vault.azure.net/.default";

/**
 * Get Azure AD access token for SQL Server
 */
async function getSqlAccessToken() {
  const token = await credential.getToken(SQL_TOKEN_SCOPE);
  return token.token;
}

/**
 * Get Azure AD access token for Key Vault
 */
async function getKeyVaultAccessToken() {
  const token = await credential.getToken(KV_TOKEN_SCOPE);
  return token.token;
}

/**
 * Store tenant metadata in Azure Key Vault
 */
async function storeInKeyVault(tenantId, slug, name, plan) {
  try {
    const kvToken = await getKeyVaultAccessToken();
    const secretName = `tenant-${slug}-meta`;
    const secretValue = JSON.stringify({
      tenantId,
      slug,
      name,
      plan,
      created: new Date().toISOString(),
      storageAccount: argv.storageAcct,
      containerName: `tenant-${slug}`
    });

    const kvUrl = `https://${argv.keyVaultName}.vault.azure.net/secrets/${secretName}?api-version=7.4`;

    console.log(`📝 Writing to Key Vault: ${secretName}`);
    await axios.put(
      kvUrl,
      { value: secretValue },
      { headers: { Authorization: `Bearer ${kvToken}` } }
    );

    console.log(`✅ Key Vault secret created: ${secretName}`);
    return secretName;
  } catch (error) {
    console.error('❌ Key Vault error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Main provisioning workflow
 */
async function provisionTenant() {
  console.log('🚀 Starting tenant provisioning...\n');

  const slug = argv.tenantSlug;
  const name = argv.tenantName;
  const email = argv.email || `${slug}@${argv.keyVaultName}.com`;
  const plan = argv.plan || 'essentials';
  const note = 'Provisioned via MSI script';

  console.log('📋 Tenant Details:');
  console.log(`   Slug:    ${slug}`);
  console.log(`   Name:    ${name}`);
  console.log(`   Plan:    ${plan}`);
  console.log(`   Email:   ${email}`);
  console.log(`   Storage: ${argv.storageAcct}/tenant-${slug}\n`);

  try {
    // Step 1: Connect to SQL using Azure AD token
    console.log('🔑 Acquiring Azure AD token for SQL...');
    const accessToken = await getSqlAccessToken();

    const config = {
      server: argv.server,
      database: argv.database,
      options: {
        encrypt: true,
        enableArithAbort: true,
        trustServerCertificate: false
      },
      authentication: {
        type: 'azure-active-directory-access-token',
        options: {
          token: accessToken
        }
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
      }
    };

    console.log(`🔌 Connecting to SQL: ${argv.server}/${argv.database}`);
    const pool = await sql.connect(config);
    console.log('✅ SQL connection established\n');

    // Step 2: Check if tenant already exists
    console.log('🔍 Checking for existing tenant...');
    const existingCheck = await pool.request()
      .input('slug', sql.NVarChar, slug)
      .query('SELECT TenantID, TenantSlug FROM ultai.Tenants WHERE TenantSlug = @slug');

    if (existingCheck.recordset.length > 0) {
      const existing = existingCheck.recordset[0];
      console.log(`⚠️  Tenant already exists: ${existing.TenantSlug} (ID: ${existing.TenantID})`);
      console.log('   Skipping database insert, updating Key Vault only...\n');

      await storeInKeyVault(existing.TenantID, slug, name, plan);
      await pool.close();

      console.log('\n✅ Provisioning completed (tenant existed)');
      return existing.TenantID;
    }

    // Step 3: Insert tenant record
    console.log('💾 Creating tenant record...');
    const insertQuery = `
      INSERT INTO ultai.Tenants (TenantSlug, TenantName, ContactEmail, Plan, Note, Status, CreatedDate)
      OUTPUT INSERTED.TenantID, INSERTED.TenantSlug, INSERTED.CreatedDate
      VALUES (@slug, @name, @email, @plan, @note, 'active', GETUTCDATE());
    `;

    const result = await pool.request()
      .input('slug', sql.NVarChar, slug)
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('plan', sql.NVarChar, plan)
      .input('note', sql.NVarChar, note)
      .query(insertQuery);

    const tenant = result.recordset[0];
    const tenantId = tenant.TenantID;

    console.log(`✅ Tenant created: ID=${tenantId}, Created=${tenant.CreatedDate}\n`);

    // Step 4: Write audit entry
    console.log('📝 Writing audit entry...');
    const auditQuery = `
      INSERT INTO VaultLine.ProvisionAudit (TenantSlug, Action, Details, Timestamp)
      VALUES (@slug, @action, @details, GETUTCDATE());
    `;

    const auditDetails = JSON.stringify({
      tenantId,
      slug,
      plan,
      storageAccount: argv.storageAcct,
      containerName: `tenant-${slug}`,
      method: 'msi-script',
      executor: process.env.USER || 'system'
    });

    await pool.request()
      .input('slug', sql.NVarChar, slug)
      .input('action', sql.NVarChar, 'TenantProvision')
      .input('details', sql.NVarChar, auditDetails)
      .query(auditQuery);

    console.log('✅ Audit entry created\n');

    // Step 5: Store metadata in Key Vault
    await storeInKeyVault(tenantId, slug, name, plan);

    // Close SQL connection
    await pool.close();
    console.log('\n🎉 Tenant provisioning completed successfully!');
    console.log(`\n📦 Next steps:`);
    console.log(`   1. Verify storage container: https://${argv.storageAcct}.blob.core.windows.net/tenant-${slug}`);
    console.log(`   2. Configure custom domain (optional): ./scripts/provision-tenant-domain.sh ${slug} ${slug}.yourdomain.com`);
    console.log(`   3. Test tenant access via API`);

    return tenantId;

  } catch (error) {
    console.error('\n❌ Provisioning failed:', error.message);

    if (error.code === 'ELOGIN') {
      console.error('\n🔍 Authentication troubleshooting:');
      console.error('   1. Ensure managed identity is assigned to this resource');
      console.error('   2. Grant SQL role: ALTER ROLE db_datawriter ADD MEMBER [your-managed-identity]');
      console.error('   3. Verify server allows Azure AD authentication');
    } else if (error.number === 2627) {
      console.error('\n🔍 Duplicate key: Tenant slug already exists');
    } else if (error.response?.status === 403) {
      console.error('\n🔍 Key Vault access denied:');
      console.error('   Grant "Key Vault Secrets Officer" role to managed identity');
    }

    process.exit(1);
  }
}

// Execute provisioning
if (require.main === module) {
  provisionTenant()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

module.exports = { provisionTenant };
