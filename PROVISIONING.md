# UltraCore Tenant Provisioning Guide

Complete guide for provisioning and managing tenants in the UltraCore platform.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Provisioning Workflow](#provisioning-workflow)
- [Component Details](#component-details)
- [Security](#security)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Overview

UltraCore tenant provisioning creates a complete, isolated environment for each customer including:

- **Infrastructure**: Storage containers, Key Vault secrets, database records
- **Security**: Managed identities, RBAC, encrypted secrets
- **Networking**: Custom domains, HTTPS certificates, Front Door routing
- **Storage**: IP vault containers with SAS-based secure uploads
- **Audit**: Complete audit trail of all provisioning activities

### Tenant Tiers

| Tier | Price | Storage | Features |
|------|-------|---------|----------|
| **Essentials** | ~$30-50/mo | 100GB | Basic features, community support |
| **Pro** | ~$100-150/mo | 500GB | Advanced features, priority support |
| **Enterprise** | Custom | Unlimited | Full features, SLA, dedicated support |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Tenant Provisioning Flow                     │
└─────────────────────────────────────────────────────────────┘

1. Admin UI / API Request
   │
   ├──> Terraform Module
   │    ├─> Storage Container (tenant-{slug})
   │    ├─> Backup Container (tenant-{slug}-backups)
   │    └─> Key Vault Secret (tenant-{slug}-meta)
   │
   ├──> MSI Provisioning Script
   │    ├─> Database Record (tenants table)
   │    ├─> Audit Entry (provision_audit table)
   │    └─> Key Vault Secret (DB metadata)
   │
   └──> Domain Provisioning (Optional)
        ├─> Front Door Endpoint
        ├─> Custom Domain CNAME
        ├─> Managed HTTPS Certificate
        └─> Routing Rule
```

### Data Flow

1. **Request** → Admin UI or API endpoint
2. **Infrastructure** → Terraform creates Azure resources
3. **Database** → MSI script inserts tenant record
4. **Security** → Secrets stored in Key Vault
5. **Network** → Custom domain configured (optional)
6. **Activation** → Tenant ready for use

---

## Prerequisites

### Required Software

```bash
# Azure CLI
az --version  # >= 2.50.0

# Terraform
terraform --version  # >= 1.0

# Node.js
node --version  # >= 18.0.0

# PostgreSQL client (for testing)
psql --version
```

### Azure Resources

Must exist before provisioning:

- **Resource Group**: `ultracore-prod-rg`
- **Storage Account**: `ultaivaultstore`
- **Key Vault**: `ultracore-kv`
- **SQL Database**: `ultracore_db`
- **Front Door**: `ultracore-frontdoor` (optional)

### Permissions

#### Azure RBAC
- Storage Blob Data Contributor
- Key Vault Secrets Officer
- SQL DB Contributor

#### Database Roles
```sql
ALTER ROLE db_datawriter ADD MEMBER [managed-identity-principal-id];
ALTER ROLE db_datareader ADD MEMBER [managed-identity-principal-id];
```

### Environment Variables

```bash
# Required
export STORAGE_ACCOUNT="ultaivaultstore"
export KEYVAULT_NAME="ultracore-kv"
export POSTGRES_HOST="ultracore-sql.database.windows.net"
export POSTGRES_DB="ultracore_db"

# Optional
export POSTGRES_USER="postgres"
export POSTGRES_PASSWORD="<secure-password>"
export VAULT_KEY_NAME="vaultline-cmk"
```

---

## Provisioning Workflow

### Method 1: Full Automated Provisioning

Complete end-to-end provisioning using all components.

#### Step 1: Terraform Infrastructure

```bash
cd iac/terraform

# Initialize
terraform init

# Plan
terraform plan \
  -var="tenant_slug=stork-nhs" \
  -var="tenant_name=Stork Maternity (NHS)" \
  -var="tenant_plan=pro"

# Apply
terraform apply \
  -var="tenant_slug=stork-nhs" \
  -var="tenant_name=Stork Maternity (NHS)" \
  -var="tenant_plan=pro"
```

**Output:**
```
container_name = "tenant-stork-nhs"
container_url = "https://ultaivaultstore.blob.core.windows.net/tenant-stork-nhs"
kv_secret_name = "tenant-stork-nhs-meta"
```

#### Step 2: Database Provisioning (MSI)

```bash
cd scripts/provision

# Install dependencies (first time only)
npm install

# Run provisioning
node provision-tenant-msi.js \
  --server ultracore-sql.database.windows.net \
  --database ultracore_db \
  --tenantSlug stork-nhs \
  --tenantName "Stork Maternity (NHS)" \
  --storageAcct ultaivaultstore \
  --keyVaultName ultracore-kv \
  --plan pro \
  --email contact@stork-nhs.example.com
```

**Output:**
```
✅ TENANT PROVISIONING COMPLETE
Tenant ID:     42
Slug:          stork-nhs
Name:          Stork Maternity (NHS)
Status:        active
Container:     tenant-stork-nhs
```

#### Step 3: Custom Domain (Optional)

```bash
./provision-tenant-domain.sh \
  stork-nhs \
  stork.ultracore.io \
  ultracore-frontdoor \
  ultracore-prod-rg
```

**Manual DNS Step Required:**
```
Create CNAME record:
  stork.ultracore.io → ultracore-frontdoor.azurefd.net
```

### Method 2: UI-Based Provisioning

Use the Admin UI for simple provisioning.

#### Step 1: Start Admin UI

```bash
cd admin-tenant-ui
npm install
npm start
```

#### Step 2: Fill Form

Navigate to [http://localhost:3000](http://localhost:3000):

1. Enter **Tenant Slug**: `stork-nhs`
2. Enter **Tenant Name**: `Stork Maternity (NHS)`
3. Enter **Contact Email**: `contact@stork-nhs.example.com`
4. Select **Plan**: Pro
5. Click **"🚀 Provision Tenant"**

#### Step 3: Complete Infrastructure

The UI creates the database record but you still need to run:

```bash
# Terraform for storage
terraform apply -var="tenant_slug=stork-nhs" ...

# Domain setup (optional)
./provision-tenant-domain.sh stork-nhs stork.ultracore.io ...
```

### Method 3: API-Based Provisioning

Programmatic provisioning via REST API.

```bash
curl -X POST http://localhost:4000/api/tenants/provision \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "stork-nhs",
    "name": "Stork Maternity (NHS)",
    "email": "contact@stork-nhs.example.com",
    "plan": "pro"
  }'
```

**Response:**
```json
{
  "ok": true,
  "tenant": {
    "tenant_code": "stork-nhs",
    "tenant_name": "Stork Maternity (NHS)",
    "status": "active"
  },
  "nextSteps": {
    "terraform": "terraform apply -var=\"tenant_slug=stork-nhs\"",
    "msi": "node scripts/provision/provision-tenant-msi.js --tenantSlug stork-nhs ...",
    "domain": "./scripts/provision/provision-tenant-domain.sh stork-nhs ..."
  }
}
```

---

## Component Details

### 1. Terraform Module

**Location**: `iac/terraform/modules/tenant-provision/`

**Creates:**
- Storage container for IP vault
- Backup container with lifecycle policy
- Key Vault secret with tenant metadata

**Usage:**
```hcl
module "tenant_example" {
  source = "./modules/tenant-provision"

  resource_group_name  = "ultracore-prod-rg"
  storage_account_name = "ultaivaultstore"
  key_vault_id         = "/subscriptions/.../vaults/ultracore-kv"

  tenant_slug = "example-tenant"
  tenant_name = "Example Corporation"
  tenant_plan = "pro"

  tags = {
    Environment = "production"
    Industry    = "healthcare"
  }
}
```

**Outputs:**
```hcl
output "container_name" { ... }
output "container_url" { ... }
output "kv_secret_name" { ... }
output "provisioning_metadata" { ... }
```

### 2. MSI Provisioning Script

**Location**: `scripts/provision/provision-tenant-msi.js`

**Features:**
- Azure AD token authentication (no SQL password)
- Database record creation
- Audit logging
- Key Vault secret storage
- Error handling and retries

**Configuration:**
```javascript
// Uses DefaultAzureCredential which tries:
// 1. Environment variables
// 2. Managed Identity
// 3. Azure CLI
// 4. Visual Studio Code
```

**Database Schema:**
```sql
-- Tenants table
CREATE TABLE tenants (
  id SERIAL PRIMARY KEY,
  tenant_code VARCHAR(255) UNIQUE NOT NULL,
  tenant_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit table
CREATE TABLE provision_audit (
  id SERIAL PRIMARY KEY,
  tenant_slug VARCHAR(255) NOT NULL,
  tenant_id INTEGER,
  action VARCHAR(255) NOT NULL,
  details JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

### 3. Domain Provisioning Script

**Location**: `scripts/provision/provision-tenant-domain.sh`

**Features:**
- Front Door endpoint creation
- Custom domain configuration
- Managed HTTPS certificate
- DNS validation
- Routing rule setup

**DNS Requirements:**
```
Type:   CNAME
Name:   tenant-slug.yourdomain.com
Value:  frontdoor-name.azurefd.net
TTL:    3600
```

### 4. IP Vault Routes

**Location**: `routes/ip-vault.js`

**Endpoints:**

#### Request SAS Upload Token
```bash
POST /api/ip-vault/request-sas
{
  "tenantSlug": "stork-nhs",
  "filename": "contract.pdf",
  "contentType": "application/pdf"
}
```

**Response:**
```json
{
  "ok": true,
  "uploadUrl": "https://...blob.core.windows.net/tenant-stork-nhs/123456-contract.pdf?sv=...",
  "blobName": "123456-contract.pdf",
  "expiresAt": "2024-01-21T11:00:00Z",
  "expiresInMinutes": 10
}
```

#### Upload Callback
```bash
POST /api/ip-vault/upload-callback
{
  "tenantSlug": "stork-nhs",
  "blobName": "123456-contract.pdf",
  "uploader": "user@example.com"
}
```

**Response:**
```json
{
  "ok": true,
  "sha256": "a7f8d9e...",
  "sizeBytes": 245760,
  "auditLogged": true
}
```

### 5. Admin UI

**Location**: `admin-tenant-ui/`

**Features:**
- Tenant listing with filtering
- Quick provisioning form
- Status/plan badges
- Responsive design
- Error handling

**Deployment:**
```bash
npm run build
# Deploy build/ directory to static hosting
```

---

## Security

### Authentication & Authorization

#### Azure AD Integration
```javascript
// MSI authentication (production)
const credential = new DefaultAzureCredential();
const token = await credential.getToken('https://database.windows.net/.default');
```

#### RBAC Roles
- **Storage Blob Data Contributor** - For container operations
- **Key Vault Secrets Officer** - For secret management
- **SQL DB Contributor** - For database operations

### Data Protection

#### Encryption at Rest
- Storage: Microsoft-managed keys or customer-managed keys (CMK)
- SQL: Transparent Data Encryption (TDE)
- Key Vault: HSM-backed keys

#### Encryption in Transit
- All traffic over HTTPS/TLS 1.2+
- SAS tokens with HTTPS-only policy
- Front Door SSL/TLS termination

#### Secret Management
```javascript
// Store sensitive data in Key Vault
await axios.put(`https://${KV_NAME}.vault.azure.net/secrets/${secretName}`, {
  value: JSON.stringify(sensitiveData),
  contentType: 'application/json'
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Audit Trail

All operations logged:
- Tenant provisioning
- File uploads (with SHA-256 hash)
- Configuration changes
- API access

```sql
-- Audit log query
SELECT * FROM provision_audit
WHERE tenant_slug = 'stork-nhs'
ORDER BY timestamp DESC;
```

---

## Monitoring

### Health Checks

```bash
# Actions API
curl http://localhost:4000/health

# IP Vault
curl http://localhost:4000/api/ip-vault/health

# Jobe AI
curl http://localhost:3000/health
```

### Metrics to Track

1. **Provisioning Success Rate**
   ```sql
   SELECT
     COUNT(*) FILTER (WHERE status = 'active') * 100.0 / COUNT(*) as success_rate
   FROM tenants
   WHERE created_at > NOW() - INTERVAL '30 days';
   ```

2. **Storage Usage per Tenant**
   ```bash
   az storage blob list \
     --account-name ultaivaultstore \
     --container-name tenant-stork-nhs \
     --query "[].{name:name,size:properties.contentLength}" \
     --output table
   ```

3. **API Response Times**
   ```bash
   # Using Application Insights
   az monitor app-insights metrics show \
     --app ultracore-insights \
     --metric requests/duration
   ```

### Alerts

Configure Azure Monitor alerts:

```bash
# High provisioning failure rate
az monitor metrics alert create \
  --name "High Provisioning Failures" \
  --resource-group ultracore-prod-rg \
  --condition "count provisioning_failures > 5" \
  --window-size 5m

# Storage quota exceeded
az monitor metrics alert create \
  --name "Storage Quota Exceeded" \
  --resource-group ultracore-prod-rg \
  --condition "avg storage_usage > 90" \
  --window-size 15m
```

---

## Troubleshooting

### Common Issues

#### Issue: "Failed to obtain SQL access token"

**Cause**: Managed identity not configured or lacks permissions

**Solution:**
```bash
# Enable managed identity on App Service
az webapp identity assign \
  --name ultracore-api \
  --resource-group ultracore-prod-rg

# Grant SQL permissions
az sql server ad-admin set \
  --resource-group ultracore-prod-rg \
  --server-name ultracore-sql \
  --display-name ultracore-api \
  --object-id <managed-identity-object-id>
```

#### Issue: "Container already exists"

**Cause**: Tenant was previously provisioned

**Solution:**
```bash
# Check existing tenant
terraform state show module.tenant_stork.azurerm_storage_container.tenant_container

# Import existing resource
terraform import module.tenant_stork.azurerm_storage_container.tenant_container \
  /subscriptions/.../storageAccounts/ultaivaultstore/containers/tenant-stork-nhs
```

#### Issue: "DNS not propagated"

**Cause**: DNS changes take time

**Solution:**
```bash
# Check DNS propagation
nslookup stork.ultracore.io
dig stork.ultracore.io

# Force DNS flush (local)
sudo systemd-resolve --flush-caches

# Wait 5-10 minutes for global propagation
```

#### Issue: "Key Vault access denied"

**Cause**: Missing RBAC permissions

**Solution:**
```bash
# Grant Key Vault access
az keyvault set-policy \
  --name ultracore-kv \
  --object-id <managed-identity-object-id> \
  --secret-permissions get set list
```

### Debugging Commands

```bash
# Check Terraform state
terraform show

# View Key Vault secrets
az keyvault secret list --vault-name ultracore-kv

# List storage containers
az storage container list \
  --account-name ultaivaultstore \
  --output table

# Check Front Door endpoints
az network front-door frontend-endpoint list \
  --resource-group ultracore-prod-rg \
  --front-door-name ultracore-frontdoor \
  --output table

# Query database
psql -h ultracore-sql.database.windows.net \
     -U postgres \
     -d ultracore_db \
     -c "SELECT * FROM tenants ORDER BY created_at DESC LIMIT 10;"
```

### Logs

```bash
# Application logs
az webapp log tail --name ultracore-api --resource-group ultracore-prod-rg

# Storage logs
az storage logging show --services b --account-name ultaivaultstore

# SQL audit logs
az sql db audit-policy show \
  --resource-group ultracore-prod-rg \
  --server ultracore-sql \
  --name ultracore_db
```

---

## Best Practices

### 1. Naming Conventions

- **Tenant Slugs**: lowercase, alphanumeric, hyphens only (`stork-nhs`, `accuracy-corp`)
- **Containers**: `tenant-{slug}` and `tenant-{slug}-backups`
- **Secrets**: `tenant-{slug}-meta`, `tenant-{slug}-db-meta`

### 2. Resource Tagging

```hcl
tags = {
  Environment  = "production"
  Tenant       = "stork-nhs"
  CostCenter   = "CC-1001"
  DataClass    = "confidential"
  ManagedBy    = "Terraform"
  Compliance   = "HIPAA,SOC2"
}
```

### 3. Backup Strategy

```bash
# Automated backups every 6 hours
# Retention: 30 days for Pro, 90 days for Enterprise
# Storage: GRS (geo-redundant) for Enterprise

# Manual backup
az storage blob copy start-batch \
  --source-container tenant-stork-nhs \
  --destination-container tenant-stork-nhs-backups \
  --account-name ultaivaultstore
```

### 4. Capacity Planning

| Tier | Tenants/Account | Storage/Tenant | Database Size |
|------|----------------|----------------|---------------|
| Essentials | 1000 | 100GB | 50GB |
| Pro | 500 | 500GB | 200GB |
| Enterprise | 100 | Unlimited | 1TB+ |

### 5. Disaster Recovery

```bash
# 1. Backup Key Vault
az keyvault secret backup --vault-name ultracore-kv --name tenant-stork-nhs-meta --file backup.blob

# 2. Backup Database
./scripts/db-manager.sh backup

# 3. Backup Storage
az storage blob snapshot --container-name tenant-stork-nhs --name * --account-name ultaivaultstore

# 4. Export Terraform state
terraform state pull > terraform.tfstate.backup
```

---

## Migration & Decommissioning

### Tenant Migration

```bash
# 1. Create new tenant in target region
terraform apply -var="tenant_slug=stork-nhs-eu" ...

# 2. Copy data
az storage blob copy start-batch \
  --source-container tenant-stork-nhs \
  --destination-container tenant-stork-nhs-eu \
  --account-name ultaivaultstore-eu

# 3. Update database
UPDATE tenants SET metadata = jsonb_set(metadata, '{region}', '"EU"')
WHERE tenant_code = 'stork-nhs';

# 4. Update DNS
# Point stork.ultracore.io to EU Front Door

# 5. Decommission old tenant
```

### Tenant Decommissioning

```bash
# 1. Soft delete (recommended)
curl -X DELETE http://localhost:4000/api/tenants/stork-nhs

# 2. Backup data
az storage blob copy start-batch \
  --source-container tenant-stork-nhs \
  --destination-container archived-stork-nhs

# 3. Hard delete (after retention period)
terraform destroy -target=module.tenant_stork
az storage container delete --name tenant-stork-nhs

# 4. Clean up database (after backup!)
DELETE FROM tenants WHERE tenant_code = 'stork-nhs';
```

---

## Support & Resources

- **Documentation**: [README.md](./README.md)
- **Developer Tools**: [TOOLS.md](./TOOLS.md)
- **Local Development**: [LOCAL-DEVELOPMENT.md](./LOCAL-DEVELOPMENT.md)
- **GitHub Issues**: [Report an issue](https://github.com/your-org/ultracore/issues)

---

**Built with ❤️ for enterprise-grade multi-tenancy**
