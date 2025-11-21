# Quick Start: Tenant Provisioning

**Goal:** Provision a new tenant in under 5 minutes.

## Prerequisites Checklist

- [ ] Azure subscription with contributor access
- [ ] Azure CLI installed and logged in (`az login`)
- [ ] Node.js 18+ installed
- [ ] Git repository cloned locally

## Step 1: Environment Setup (One-time)

```bash
# Install dependencies
npm install
cd scripts && npm install && cd ..

# Set environment variables
export STORAGE_ACCOUNT=ultaivaultstore
export KEYVAULT_NAME=ultai-rg-prod-kv
export SQL_SERVER=ultai-sql-prod.database.windows.net
export SQL_DATABASE=ultai_db
```

## Step 2: Provision New Tenant

### Option A: Using Node.js Script (Recommended)

```bash
cd scripts
node provision-tenant-msi.js \
  --server $SQL_SERVER \
  --database $SQL_DATABASE \
  --tenantSlug acme-corp \
  --tenantName "ACME Corporation" \
  --storageAcct $STORAGE_ACCOUNT \
  --keyVaultName $KEYVAULT_NAME \
  --plan enterprise \
  --email admin@acme.com
```

**Expected Output:**
```
🚀 Starting tenant provisioning...
📋 Tenant Details:
   Slug:    acme-corp
   Name:    ACME Corporation
   Plan:    enterprise
   Email:   admin@acme.com

🔑 Acquiring Azure AD token for SQL...
🔌 Connecting to SQL: ultai-sql-prod.database.windows.net/ultai_db
✅ SQL connection established

💾 Creating tenant record...
✅ Tenant created: ID=550e8400-e29b-41d4-a716-446655440000

📝 Writing audit entry...
✅ Audit entry created

📝 Writing to Key Vault: tenant-acme-corp-meta
✅ Key Vault secret created: tenant-acme-corp-meta

🎉 Tenant provisioning completed successfully!
```

### Option B: Using Terraform + Script

```bash
# 1. Add tenant module to Terraform
cd iac/terraform

# 2. Create tenant.tf (or add to existing)
cat > tenant-acme.tf <<EOF
module "tenant_acme" {
  source = "./modules/tenant-provision"

  resource_group_name  = "ultai-rg-prod"
  storage_account_name = "ultaivaultstore"
  key_vault_id         = "/subscriptions/<SUB_ID>/resourceGroups/ultai-rg-prod/providers/Microsoft.KeyVault/vaults/ultai-rg-prod-kv"

  tenant_slug = "acme-corp"
  tenant_name = "ACME Corporation"
  tenant_plan = "enterprise"
}

output "acme_container_url" {
  value = module.tenant_acme.container_url
}
EOF

# 3. Apply infrastructure
terraform init
terraform apply -target=module.tenant_acme

# 4. Provision database
cd ../../scripts
node provision-tenant-msi.js \
  --server $SQL_SERVER \
  --database $SQL_DATABASE \
  --tenantSlug acme-corp \
  --tenantName "ACME Corporation" \
  --storageAcct $STORAGE_ACCOUNT \
  --keyVaultName $KEYVAULT_NAME \
  --plan enterprise
```

## Step 3: Verify Provisioning

### Check Database

```bash
# Using Azure Data Studio or sqlcmd
sqlcmd -S $SQL_SERVER -d $SQL_DATABASE -G

SELECT TenantSlug, TenantName, Plan, Status, CreatedDate
FROM ultai.Tenants
WHERE TenantSlug = 'acme-corp';
```

### Check Storage Container

```bash
az storage container show \
  --account-name ultaivaultstore \
  --name tenant-acme-corp \
  --auth-mode login
```

### Check Key Vault Secret

```bash
az keyvault secret show \
  --vault-name ultai-rg-prod-kv \
  --name tenant-acme-corp-meta
```

### Check Audit Log

```sql
SELECT TOP 5 *
FROM VaultLine.ProvisionAudit
WHERE TenantSlug = 'acme-corp'
ORDER BY Timestamp DESC;
```

## Step 4: (Optional) Configure Custom Domain

```bash
cd scripts
./provision-tenant-domain.sh \
  acme-corp \
  acme.yourdomain.com \
  ultai-frontdoor \
  ultai-rg-prod
```

**Manual DNS Step:**
```
Create CNAME record:
  Name:  acme.yourdomain.com
  Value: ultai-frontdoor.azurefd.net
  TTL:   3600
```

Wait 5-10 minutes for certificate provisioning.

## Step 5: Test Tenant

### Test API Access

```bash
# List tenants
curl http://localhost:3000/api/tenants

# Get specific tenant
curl http://localhost:3000/api/tenants/acme-corp

# Request upload SAS
curl -X POST http://localhost:3000/api/ip-vault/request-sas \
  -H "Content-Type: application/json" \
  -d '{
    "tenantSlug": "acme-corp",
    "filename": "test.pdf",
    "contentType": "application/pdf"
  }'
```

### Test Upload Flow

```bash
# 1. Get SAS token
SAS_RESPONSE=$(curl -s -X POST http://localhost:3000/api/ip-vault/request-sas \
  -H "Content-Type: application/json" \
  -d '{"tenantSlug":"acme-corp","filename":"test.txt"}')

UPLOAD_URL=$(echo $SAS_RESPONSE | jq -r '.uploadUrl')
BLOB_NAME=$(echo $SAS_RESPONSE | jq -r '.blobName')

# 2. Upload file
echo "Test content" > test.txt
curl -X PUT "$UPLOAD_URL" \
  -H "x-ms-blob-type: BlockBlob" \
  -H "Content-Type: text/plain" \
  --data-binary @test.txt

# 3. Trigger callback
curl -X POST http://localhost:3000/api/ip-vault/upload-callback \
  -H "Content-Type: application/json" \
  -d "{
    \"tenantSlug\": \"acme-corp\",
    \"blobName\": \"$BLOB_NAME\",
    \"uploader\": \"test@example.com\"
  }"
```

## Common Issues & Quick Fixes

### "Login failed for user"

**Fix:** Grant managed identity SQL access:
```sql
CREATE USER [ultai-provisioner] FROM EXTERNAL PROVIDER;
ALTER ROLE db_datawriter ADD MEMBER [ultai-provisioner];
```

### "Key Vault 403 Forbidden"

**Fix:**
```bash
az role assignment create \
  --assignee $(az identity show -n ultai-provisioner -g ultai-rg-prod --query principalId -o tsv) \
  --role "Key Vault Secrets Officer" \
  --scope $(az keyvault show -n ultai-rg-prod-kv --query id -o tsv)
```

### "Container already exists"

**Expected:** Script will update metadata in Key Vault only. No action needed.

### "Tenant slug already exists"

**Fix:** Choose a different slug or delete existing tenant:
```sql
DELETE FROM ultai.Tenants WHERE TenantSlug = 'acme-corp';
-- Also delete storage container manually if needed
```

## Batch Provisioning

Provision multiple tenants from CSV:

```bash
# Create tenants.csv
cat > tenants.csv <<EOF
slug,name,plan,email
acme-corp,ACME Corporation,enterprise,admin@acme.com
beta-inc,Beta Inc,pro,contact@beta.com
gamma-llc,Gamma LLC,essentials,info@gamma.com
EOF

# Run batch script
while IFS=, read -r slug name plan email; do
  [ "$slug" = "slug" ] && continue  # Skip header
  echo "Provisioning: $slug"
  node provision-tenant-msi.js \
    --server $SQL_SERVER \
    --database $SQL_DATABASE \
    --tenantSlug "$slug" \
    --tenantName "$name" \
    --storageAcct $STORAGE_ACCOUNT \
    --keyVaultName $KEYVAULT_NAME \
    --plan "$plan" \
    --email "$email"
done < tenants.csv
```

## Next Steps

1. **Configure tenant settings** in Admin UI
2. **Set up monitoring** with Application Insights
3. **Enable alerting** for provisioning failures
4. **Document tenant onboarding** for customers
5. **Automate with CI/CD** (GitHub Actions, Azure DevOps)

## Admin UI Access

```bash
# Start API server
npm start &

# Start Admin UI
cd admin-tenant-ui
npm start
```

Open: http://localhost:3001

**Features:**
- Visual tenant list with filtering
- One-click provisioning
- Status management
- Storage and audit log links

---

**Time to provision:** ~30 seconds per tenant (excluding DNS)

**Questions?** See [TENANT-PROVISIONING.md](./TENANT-PROVISIONING.md) for detailed documentation.
