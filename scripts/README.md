# Tenant Provisioning Scripts

Azure-native scripts for multi-tenant provisioning using Managed Identity authentication.

## Prerequisites

### 1. Install Dependencies

```bash
cd scripts
npm install
```

### 2. Azure Setup

**Managed Identity Requirements:**
- System or User-assigned managed identity on your VM/App Service/Cloud Shell
- SQL Server role: `db_datawriter` or `db_owner`
- Key Vault role: `Key Vault Secrets Officer`

**Grant SQL Access:**
```sql
-- Connect to your Azure SQL database as admin
CREATE USER [your-managed-identity-name] FROM EXTERNAL PROVIDER;
ALTER ROLE db_datawriter ADD MEMBER [your-managed-identity-name];
ALTER ROLE db_ddladmin ADD MEMBER [your-managed-identity-name];
```

**Grant Key Vault Access:**
```bash
az keyvault set-policy \
  --name ultai-rg-prod-kv \
  --object-id <managed-identity-object-id> \
  --secret-permissions get set list delete
```

## Usage

### Provision New Tenant

```bash
node provision-tenant-msi.js \
  --server ultai-sql-prod.database.windows.net \
  --database ultai_db \
  --tenantSlug stork-nhs \
  --tenantName "Stork Maturity (NHS)" \
  --storageAcct ultaivaultstore \
  --keyVaultName ultai-rg-prod-kv \
  --plan pro \
  --email stork@nhs.uk
```

**Parameters:**
| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `--server` | Yes | Azure SQL server FQDN | `ultai-sql.database.windows.net` |
| `--database` | Yes | Database name | `ultai_db` |
| `--tenantSlug` | Yes | Unique tenant identifier | `stork-nhs` |
| `--tenantName` | Yes | Display name | `"Stork Maturity (NHS)"` |
| `--storageAcct` | Yes | Storage account name | `ultaivaultstore` |
| `--keyVaultName` | Yes | Key Vault name | `ultai-rg-prod-kv` |
| `--plan` | No | Subscription plan | `essentials`, `pro`, `enterprise` |
| `--email` | No | Contact email | `stork@nhs.uk` |

### Provision Custom Domain

After tenant database provisioning, configure custom domain:

```bash
./provision-tenant-domain.sh \
  stork-nhs \
  stork.yourdomain.com \
  ultai-frontdoor \
  ultai-rg-prod
```

## Script Behavior

### provision-tenant-msi.js

1. ✅ Validates required parameters
2. 🔑 Acquires Azure AD token using Managed Identity
3. 🔌 Connects to Azure SQL with token-based auth
4. 🔍 Checks if tenant already exists
5. 💾 Inserts tenant record into `ultai.Tenants`
6. 📝 Writes audit entry to `VaultLine.ProvisionAudit`
7. 🔐 Stores encrypted metadata in Key Vault
8. 📊 Outputs provisioning summary

**Error Handling:**
- Duplicate tenant: Warns and updates Key Vault only
- SQL auth failure: Provides troubleshooting steps
- Key Vault 403: Suggests RBAC role assignment

### provision-tenant-domain.sh

1. Creates Azure Front Door frontend endpoint
2. Prompts for DNS CNAME configuration
3. Enables managed HTTPS certificate
4. Waits for certificate provisioning

## Integration with Terraform

**Recommended workflow:**

```bash
# 1. Provision infrastructure with Terraform
cd iac/terraform
terraform apply -target=module.tenant_stork_nhs

# 2. Run database provisioning script
cd ../../scripts
node provision-tenant-msi.js \
  --server $SQL_SERVER \
  --database ultai_db \
  --tenantSlug stork-nhs \
  --tenantName "Stork Maturity (NHS)" \
  --storageAcct ultaivaultstore \
  --keyVaultName ultai-rg-prod-kv

# 3. (Optional) Configure custom domain
./provision-tenant-domain.sh stork-nhs stork.nhs.uk ultai-frontdoor ultai-rg-prod
```

## Troubleshooting

### "ELOGIN: Login failed for user"
**Cause:** Managed identity not granted SQL access

**Fix:**
```sql
CREATE USER [your-managed-identity] FROM EXTERNAL PROVIDER;
ALTER ROLE db_datawriter ADD MEMBER [your-managed-identity];
```

### "Key Vault 403 Forbidden"
**Cause:** Missing Key Vault RBAC permissions

**Fix:**
```bash
az keyvault set-policy \
  --name ultai-rg-prod-kv \
  --object-id $(az identity show -n <identity> -g <rg> --query principalId -o tsv) \
  --secret-permissions get set
```

### "Tenant already exists"
**Expected:** Script will skip DB insert and update Key Vault metadata only

### Azure AD token acquisition fails
**Cause:** Running outside Azure environment without managed identity

**Fix:** Run from:
- Azure Cloud Shell (recommended for testing)
- Azure VM with system-assigned identity
- Azure App Service with system-assigned identity
- Local with `az login` (uses DefaultAzureCredential)

## Security Notes

✅ **What this does right:**
- Zero secrets in code (managed identity auth)
- Azure AD token-based SQL authentication
- Least-privilege RBAC roles
- Audit trail for all provisioning
- Encrypted metadata in Key Vault

⚠️ **Production hardening:**
- Implement rate limiting for provisioning API
- Add approval workflow for enterprise tenants
- Enable Azure SQL auditing and Advanced Threat Protection
- Use Private Endpoints for SQL and Key Vault
- Rotate managed identity credentials regularly

## Testing

Test with a development tenant:

```bash
node provision-tenant-msi.js \
  --server ultai-sql-dev.database.windows.net \
  --database ultai_db_dev \
  --tenantSlug test-tenant-$(date +%s) \
  --tenantName "Test Tenant" \
  --storageAcct ultaivaultdev \
  --keyVaultName ultai-dev-kv \
  --plan essentials
```

Verify:
```bash
# Check SQL record
sqlcmd -S ultai-sql-dev.database.windows.net -d ultai_db_dev -Q "SELECT * FROM ultai.Tenants WHERE TenantSlug LIKE 'test-tenant%'"

# Check Key Vault secret
az keyvault secret show --vault-name ultai-dev-kv --name tenant-test-tenant-*

# Check storage container
az storage container list --account-name ultaivaultdev --prefix tenant-test-tenant
```
