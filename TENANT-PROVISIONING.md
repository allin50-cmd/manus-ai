# Multi-Tenant Provisioning System

Complete end-to-end tenant provisioning system for Azure with Managed Identity authentication, Infrastructure as Code, and secure IP Vault storage.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Components](#components)
3. [Prerequisites](#prerequisites)
4. [Quick Start](#quick-start)
5. [Provisioning Workflow](#provisioning-workflow)
6. [Security Model](#security-model)
7. [Monitoring & Auditing](#monitoring--auditing)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Tenant Admin UI (React)                  │
│             Browse, Filter, Provision Tenants               │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Express API Server                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Tenants    │  │  IP Vault    │  │  Audit Logs     │  │
│  │   Routes     │  │  Routes      │  │  Routes         │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└──────────┬──────────────────┬──────────────────┬───────────┘
           │                  │                  │
           │ Azure AD Token   │ User Delegation  │ Token Auth
           ▼                  ▼                  ▼
┌──────────────────┐ ┌──────────────────┐ ┌─────────────────┐
│  Azure SQL DB    │ │ Azure Blob       │ │ Key Vault       │
│  - Tenants       │ │ Storage          │ │ - Secrets       │
│  - Audit Logs    │ │ - Per-tenant     │ │ - Encrypted     │
│  - Encrypted     │ │   containers     │ │   metadata      │
│    Data          │ │                  │ │ - CMK keys      │
└──────────────────┘ └──────────────────┘ └─────────────────┘
           ▲                  ▲                  ▲
           │                  │                  │
           │ Terraform (IaC)  │                  │
           └──────────────────┴──────────────────┘
```

**Key Principles:**
- ✅ **Zero Secrets**: Managed Identity for all Azure services
- ✅ **Immutable Audit**: All actions logged to append-only tables
- ✅ **Encryption at Rest**: CMK for storage and SQL TDE
- ✅ **Least Privilege**: RBAC roles scoped per service
- ✅ **Infrastructure as Code**: Terraform modules for repeatability

---

## 🧩 Components

### 1. Terraform Module (`iac/terraform/modules/tenant-provision`)

**Purpose:** Provision Azure infrastructure per tenant

**Creates:**
- Private blob storage container (`tenant-{slug}`)
- Key Vault secret with tenant metadata
- Storage lifecycle policy (cool/archive tiers)

**Usage:**
```hcl
module "tenant_stork" {
  source = "./modules/tenant-provision"

  resource_group_name  = "ultai-rg-prod"
  storage_account_name = "ultaivaultstore"
  key_vault_id         = "/subscriptions/.../Microsoft.KeyVault/vaults/ultai-kv"

  tenant_slug = "stork-nhs"
  tenant_name = "Stork Maturity (NHS)"
  tenant_plan = "pro"
}
```

**Outputs:**
- `container_name` - Storage container name
- `container_url` - Full HTTPS URL
- `kv_secret_name` - Key Vault secret name

---

### 2. Managed Identity Provisioning Script (`scripts/provision-tenant-msi.js`)

**Purpose:** Database provisioning with Azure AD authentication (no SQL password)

**Actions:**
1. Acquire Azure AD token for SQL Server
2. Insert tenant record into `ultai.Tenants`
3. Write audit entry to `VaultLine.ProvisionAudit`
4. Store encrypted metadata in Key Vault

**Prerequisites:**
- Managed identity with `db_datawriter` role
- Key Vault `Secrets Officer` role

**Usage:**
```bash
node scripts/provision-tenant-msi.js \
  --server ultai-sql-prod.database.windows.net \
  --database ultai_db \
  --tenantSlug stork-nhs \
  --tenantName "Stork Maturity (NHS)" \
  --storageAcct ultaivaultstore \
  --keyVaultName ultai-rg-prod-kv \
  --plan pro
```

**Exit Codes:**
- `0` - Success
- `1` - Runtime error
- `2` - Invalid arguments

---

### 3. DNS + Front Door Script (`scripts/provision-tenant-domain.sh`)

**Purpose:** Configure custom domains with managed HTTPS

**Actions:**
1. Create Azure Front Door frontend endpoint
2. Prompt for DNS CNAME configuration
3. Verify DNS propagation
4. Enable managed HTTPS certificate

**Usage:**
```bash
./scripts/provision-tenant-domain.sh \
  stork-nhs \
  stork.yourdomain.com \
  ultai-frontdoor \
  ultai-rg-prod
```

**DNS Record Required:**
```
Type:  CNAME
Name:  stork.yourdomain.com
Value: ultai-frontdoor.azurefd.net
TTL:   3600
```

---

### 4. IP Vault API Routes (`routes/ip-vault.js`)

**Purpose:** Secure blob upload with audit trail

**Endpoints:**

#### POST `/api/ip-vault/request-sas`
Issues short-lived SAS token for client upload

**Request:**
```json
{
  "tenantSlug": "stork-nhs",
  "filename": "contract.pdf",
  "contentType": "application/pdf"
}
```

**Response:**
```json
{
  "uploadUrl": "https://...blob.core.windows.net/tenant-stork-nhs/1234-contract.pdf?sv=...",
  "blobName": "1234-contract.pdf",
  "expiresAt": "2024-01-15T12:30:00Z"
}
```

#### POST `/api/ip-vault/upload-callback`
Verify upload, compute SHA-256, write audit

**Request:**
```json
{
  "tenantSlug": "stork-nhs",
  "blobName": "1234-contract.pdf",
  "uploader": "user@example.com"
}
```

**Response:**
```json
{
  "ok": true,
  "sha256": "abc123...",
  "sizeBytes": 102400,
  "auditId": "uuid"
}
```

#### GET `/api/ip-vault/blobs/:tenantSlug`
List all blobs for tenant

#### GET `/api/ip-vault/audit/:tenantSlug`
Retrieve audit logs

---

### 5. Tenant Management Routes (`routes/tenants.js`)

**Purpose:** CRUD operations for tenants

**Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tenants` | List all tenants (filterable) |
| GET | `/api/tenants/:slug` | Get tenant details |
| POST | `/api/tenants/provision` | Provision new tenant |
| PUT | `/api/tenants/:slug` | Update tenant |
| DELETE | `/api/tenants/:slug` | Deactivate tenant |

---

### 6. Admin UI (`admin-tenant-ui/`)

**Purpose:** Web dashboard for tenant management

**Features:**
- List/sort/filter tenants
- Provision new tenants via form
- Update tenant status (active/suspended/deactivated)
- View storage and audit logs
- Responsive design

**Tech Stack:**
- React 18
- CSS3 (no external dependencies)
- Proxy to Express API

**Run:**
```bash
cd admin-tenant-ui
npm install
npm start  # Opens http://localhost:3001
```

---

## 🔐 Prerequisites

### Azure Resources

1. **Resource Group**
   ```bash
   az group create --name ultai-rg-prod --location eastus2
   ```

2. **Storage Account**
   ```bash
   az storage account create \
     --name ultaivaultstore \
     --resource-group ultai-rg-prod \
     --sku Standard_LRS \
     --encryption-services blob \
     --https-only true
   ```

3. **Key Vault**
   ```bash
   az keyvault create \
     --name ultai-rg-prod-kv \
     --resource-group ultai-rg-prod \
     --enable-rbac-authorization true
   ```

4. **Azure SQL Server**
   ```bash
   az sql server create \
     --name ultai-sql-prod \
     --resource-group ultai-rg-prod \
     --admin-user sqladmin \
     --admin-password <secure-password> \
     --enable-ad-only-auth false
   ```

5. **SQL Database**
   ```bash
   az sql db create \
     --name ultai_db \
     --server ultai-sql-prod \
     --resource-group ultai-rg-prod \
     --edition Standard \
     --capacity 10
   ```

### Managed Identity Setup

1. **Create User-Assigned Identity**
   ```bash
   az identity create \
     --name ultai-provisioner \
     --resource-group ultai-rg-prod
   ```

2. **Grant SQL Access**
   ```sql
   -- Connect as SQL admin
   CREATE USER [ultai-provisioner] FROM EXTERNAL PROVIDER;
   ALTER ROLE db_datawriter ADD MEMBER [ultai-provisioner];
   ALTER ROLE db_ddladmin ADD MEMBER [ultai-provisioner];
   ```

3. **Grant Key Vault Access**
   ```bash
   PRINCIPAL_ID=$(az identity show -n ultai-provisioner -g ultai-rg-prod --query principalId -o tsv)

   az role assignment create \
     --assignee $PRINCIPAL_ID \
     --role "Key Vault Secrets Officer" \
     --scope /subscriptions/.../resourceGroups/ultai-rg-prod/providers/Microsoft.KeyVault/vaults/ultai-rg-prod-kv
   ```

4. **Grant Storage Access**
   ```bash
   az role assignment create \
     --assignee $PRINCIPAL_ID \
     --role "Storage Blob Data Contributor" \
     --scope /subscriptions/.../resourceGroups/ultai-rg-prod/providers/Microsoft.Storage/storageAccounts/ultaivaultstore
   ```

### Database Schema

Run the following SQL to create required tables:

```sql
-- Tenants table
CREATE SCHEMA ultai;
GO

CREATE TABLE ultai.Tenants (
    TenantID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    TenantSlug NVARCHAR(100) UNIQUE NOT NULL,
    TenantName NVARCHAR(200) NOT NULL,
    ContactEmail NVARCHAR(200),
    Plan NVARCHAR(50) DEFAULT 'essentials',
    Status NVARCHAR(50) DEFAULT 'active',
    Note NVARCHAR(MAX),
    CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
    LastUpdated DATETIME2 DEFAULT GETUTCDATE()
);

-- VaultLine schema
CREATE SCHEMA VaultLine;
GO

CREATE TABLE VaultLine.ProvisionAudit (
    AuditID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    TenantSlug NVARCHAR(100) NOT NULL,
    Action NVARCHAR(100) NOT NULL,
    Details NVARCHAR(MAX),
    Timestamp DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE VaultLine.AuditLog (
    AuditID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ActionType NVARCHAR(100) NOT NULL,
    EntityType NVARCHAR(100) NOT NULL,
    EntityID NVARCHAR(200) NOT NULL,
    Details NVARCHAR(MAX),
    UserAgent NVARCHAR(500),
    IPAddress NVARCHAR(50),
    Timestamp DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE VaultLine.EncryptedData (
    DataID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    DataType NVARCHAR(100) NOT NULL,
    EncryptedContent VARBINARY(MAX) NOT NULL,
    EncryptionKeyName NVARCHAR(200) NOT NULL,
    CreatedDate DATETIME2 DEFAULT GETUTCDATE()
);
```

---

## 🚀 Quick Start

### End-to-End Provisioning (Single Tenant)

```bash
# 1. Clone repository
git clone <repo-url>
cd manus-ai

# 2. Install dependencies
npm install
cd scripts && npm install && cd ..
cd admin-tenant-ui && npm install && cd ..

# 3. Set environment variables
export STORAGE_ACCOUNT=ultaivaultstore
export KEYVAULT_NAME=ultai-rg-prod-kv
export SQL_SERVER=ultai-sql-prod.database.windows.net
export SQL_DATABASE=ultai_db

# 4. Provision infrastructure with Terraform
cd iac/terraform
terraform init
terraform apply -target=module.tenant_stork_nhs

# 5. Provision database records
cd ../../scripts
node provision-tenant-msi.js \
  --server $SQL_SERVER \
  --database $SQL_DATABASE \
  --tenantSlug stork-nhs \
  --tenantName "Stork Maturity (NHS)" \
  --storageAcct $STORAGE_ACCOUNT \
  --keyVaultName $KEYVAULT_NAME \
  --plan pro \
  --email stork@nhs.uk

# 6. (Optional) Configure custom domain
./provision-tenant-domain.sh \
  stork-nhs \
  stork.yourdomain.com \
  ultai-frontdoor \
  ultai-rg-prod

# 7. Start API server
cd ..
node actions-server.js &

# 8. Start Admin UI
cd admin-tenant-ui
npm start
```

**Access:** http://localhost:3001

---

## 🔄 Provisioning Workflow

### Automated Workflow (Recommended)

1. **User fills form** in Admin UI
2. **API receives request** at `/api/tenants/provision`
3. **Database insert** creates tenant record + audit
4. **Background job** triggers Terraform module (optional)
5. **Confirmation** returned to user with next steps

### Manual Workflow

1. **Run Terraform** to create infrastructure
   ```bash
   terraform apply -target=module.tenant_newcorp
   ```

2. **Run provisioning script** for database
   ```bash
   node scripts/provision-tenant-msi.js --tenantSlug newcorp ...
   ```

3. **Configure custom domain** (if needed)
   ```bash
   ./scripts/provision-tenant-domain.sh newcorp newcorp.com ...
   ```

4. **Verify in Admin UI**
   - Check tenant appears in list
   - Test storage link
   - Review audit logs

---

## 🔐 Security Model

### Authentication Flow

```
1. Client Request
   ↓
2. Express API authenticates via DefaultAzureCredential
   ↓
3. Acquire Azure AD token for target service:
   - SQL:     https://database.windows.net/.default
   - Storage: User delegation key (auto)
   - Vault:   https://vault.azure.net/.default
   ↓
4. Service validates token via Azure AD
   ↓
5. Action performed with RBAC authorization
```

### RBAC Roles Required

| Identity | Service | Role | Purpose |
|----------|---------|------|---------|
| `ultai-provisioner` | SQL | `db_datawriter` | Insert tenants |
| `ultai-provisioner` | Key Vault | `Secrets Officer` | Store metadata |
| `ultai-provisioner` | Storage | `Blob Data Contributor` | Create containers |
| App Service | SQL | `db_datareader` | Read tenants |
| App Service | Storage | `Blob Delegator` | Issue SAS tokens |

### Secret-Free Architecture

**Traditional (❌ Avoid):**
```javascript
const sql = require('mssql');
await sql.connect({
  server: 'server.database.windows.net',
  user: 'sqladmin',
  password: process.env.SQL_PASSWORD  // ❌ Secret in environment
});
```

**Managed Identity (✅ Use):**
```javascript
const { DefaultAzureCredential } = require('@azure/identity');
const credential = new DefaultAzureCredential();
const token = await credential.getToken("https://database.windows.net/.default");

await sql.connect({
  server: 'server.database.windows.net',
  authentication: {
    type: 'azure-active-directory-access-token',
    options: { token: token.token }
  }
});
```

---

## 📊 Monitoring & Auditing

### Audit Tables

**VaultLine.ProvisionAudit:**
- Tenant creation/updates
- Provisioning method (API, script, Terraform)
- Timestamp and executor

**VaultLine.AuditLog:**
- IP Vault uploads
- SHA-256 hashes
- User agent and IP address
- Immutable append-only log

### Queries

**List recent provisioning events:**
```sql
SELECT TOP 10
  TenantSlug,
  Action,
  JSON_VALUE(Details, '$.method') AS Method,
  Timestamp
FROM VaultLine.ProvisionAudit
ORDER BY Timestamp DESC;
```

**Find uploads by tenant:**
```sql
SELECT
  EntityID AS BlobName,
  JSON_VALUE(Details, '$.sha256') AS SHA256,
  JSON_VALUE(Details, '$.sizeBytes') AS SizeBytes,
  Timestamp
FROM VaultLine.AuditLog
WHERE ActionType = 'IPVaultUpload'
  AND Details LIKE '%stork-nhs%'
ORDER BY Timestamp DESC;
```

### Application Insights Integration

Add to Express app:

```javascript
const appInsights = require('applicationinsights');
appInsights.setup(process.env.APPINSIGHTS_CONNECTION_STRING)
  .setAutoDependencyCorrelation(true)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .start();
```

**Tracked Events:**
- API request latency
- SQL query duration
- Storage operation metrics
- Exception telemetry

---

## 🔧 Troubleshooting

### SQL Authentication Fails

**Error:**
```
Login failed for user '<token-identified principal>'
```

**Fix:**
1. Verify managed identity exists:
   ```bash
   az identity show -n ultai-provisioner -g ultai-rg-prod
   ```

2. Grant SQL access:
   ```sql
   CREATE USER [ultai-provisioner] FROM EXTERNAL PROVIDER;
   ALTER ROLE db_datawriter ADD MEMBER [ultai-provisioner];
   ```

3. Test from Cloud Shell:
   ```bash
   sqlcmd -S ultai-sql-prod.database.windows.net -d ultai_db -G -U ultai-provisioner
   ```

### Key Vault 403 Forbidden

**Error:**
```
Caller is not authorized to perform action on resource
```

**Fix:**
```bash
PRINCIPAL_ID=$(az identity show -n ultai-provisioner -g ultai-rg-prod --query principalId -o tsv)

az role assignment create \
  --assignee $PRINCIPAL_ID \
  --role "Key Vault Secrets Officer" \
  --scope $(az keyvault show -n ultai-rg-prod-kv --query id -o tsv)
```

### SAS Token Expired

**Error:**
```
Server failed to authenticate the request
```

**Fix:**
- SAS tokens have 15-minute TTL
- Request new SAS via `/api/ip-vault/request-sas`
- For long uploads, use multipart upload with SAS renewal

### DNS Not Propagating

**Error:**
```
DNS propagation not detected
```

**Fix:**
1. Verify CNAME record:
   ```bash
   dig CNAME stork.yourdomain.com
   ```

2. Wait 5-10 minutes for global propagation

3. Manually test:
   ```bash
   nslookup stork.yourdomain.com 8.8.8.8
   ```

4. Continue script with manual confirmation

### Terraform State Conflicts

**Error:**
```
Error: Error acquiring the state lock
```

**Fix:**
```bash
# View lock info
terraform force-unlock <lock-id>

# Or use local state for testing
terraform apply -state=local.tfstate
```

---

## 📚 Additional Resources

- [Azure Managed Identity Docs](https://learn.microsoft.com/azure/active-directory/managed-identities-azure-resources/)
- [SQL Server Azure AD Auth](https://learn.microsoft.com/azure/azure-sql/database/authentication-aad-overview)
- [User Delegation SAS](https://learn.microsoft.com/azure/storage/blobs/storage-blob-user-delegation-sas-create-javascript)
- [Key Vault Best Practices](https://learn.microsoft.com/azure/key-vault/general/best-practices)
- [Front Door Custom Domains](https://learn.microsoft.com/azure/frontdoor/front-door-custom-domain)

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/new-provisioning-mode`
3. Commit changes: `git commit -m "Add batch provisioning"`
4. Push to branch: `git push origin feature/new-provisioning-mode`
5. Open Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

**Questions?** Open an issue in the repository or contact the UltraCore team.
