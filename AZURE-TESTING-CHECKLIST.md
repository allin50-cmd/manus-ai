# Azure Deployment Testing Checklist

## Prerequisites (On Your Local Machine)

### 1. Install Azure CLI
```bash
# Ubuntu/Debian
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# macOS
brew install azure-cli

# Windows
# Download from: https://aka.ms/installazurecliwindows

# Verify installation
az --version
```

### 2. Install Docker
```bash
# Ubuntu
sudo apt-get update
sudo apt-get install docker.io
sudo systemctl start docker
sudo usermod -aG docker $USER

# macOS
brew install --cask docker
# Then start Docker Desktop

# Windows
# Download Docker Desktop from: https://www.docker.com/products/docker-desktop

# Verify installation
docker --version
docker ps
```

### 3. Install jq (for validation script)
```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq

# Windows
choco install jq
```

### 4. Install PostgreSQL client (optional, for database testing)
```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install postgresql

# Windows
# Included with PostgreSQL installation
```

---

## Step-by-Step Testing Process

### Phase 1: Prerequisites Check (5 minutes)

#### 1.1 Login to Azure
```bash
az login
```
- Browser will open for authentication
- Select your subscription
- Verify you have appropriate permissions (Contributor or Owner)

#### 1.2 Set Subscription (if you have multiple)
```bash
# List subscriptions
az account list --output table

# Set active subscription
az account set --subscription "Your-Subscription-Name"

# Verify
az account show
```

#### 1.3 Check Docker
```bash
# Verify Docker is running
docker ps

# If not running, start Docker daemon
sudo systemctl start docker  # Linux
# or start Docker Desktop      # Windows/Mac
```

#### 1.4 Navigate to Project
```bash
cd /path/to/manus-ai
```

---

### Phase 2: Deployment (15-20 minutes)

#### 2.1 Start Deployment
```bash
# Deploy to development environment
./deploy-ultracore-optimized-v2.sh development
```

**What to expect:**
- Script will run for 15-20 minutes
- You'll see progress messages for each step
- Script creates ~10 Azure resources
- At the end, you'll get service URLs and credentials

**Watch for:**
- ✅ Green checkmarks = success
- ⚠️ Yellow warnings = non-critical issues
- ❌ Red errors = deployment failed (check troubleshooting)

#### 2.2 Save Deployment Info
```bash
# Deployment info file is auto-generated
ls -lh deployment-development-*.json

# View deployment details
cat deployment-development-*.json | jq '.'
```

#### 2.3 Note Service URLs
The deployment script will output URLs like:
```
Actions API: https://uc-actions-123456.uksouth.azurecontainerapps.io
Jobe AI API:  https://uc-jobe-123456.uksouth.azurecontainerapps.io
```

**Copy these URLs** - you'll need them for testing.

---

### Phase 3: Validation (5 minutes)

#### 3.1 Run Automated Validation
```bash
./validate-deployment.sh deployment-development-*.json
```

**Expected results:**
- 12+ tests should run
- All tests should PASS (green checkmarks)
- If any tests fail, check the error messages

#### 3.2 Manual Testing

**Test Actions API:**
```bash
# Replace with your actual URL
ACTIONS_URL="https://uc-actions-123456.uksouth.azurecontainerapps.io"

# Health check
curl $ACTIONS_URL/health

# Expected response:
# {
#   "status": "healthy",
#   "service": "UltraCore Actions API",
#   "connections": {
#     "database": "connected",
#     "redis": "connected"
#   }
# }
```

**Test List Bundles:**
```bash
curl -X POST $ACTIONS_URL/api/actions \
  -H "Content-Type: application/json" \
  -d '{"action":"bundles.list","payload":{}}' | jq '.'

# Expected: List of 3 bundles (intake-stack, ultraengage-stack, analytics-stack)
```

**Test Deployment (Dry Run):**
```bash
curl -X POST $ACTIONS_URL/api/actions \
  -H "Content-Type: application/json" \
  -d '{
    "action": "deploy.bundle",
    "payload": {
      "tenant": "TEST",
      "bundle": "intake-stack",
      "dryRun": true,
      "sequential": true
    }
  }' | jq '.'

# Expected: Success with dryRun=true in response
```

**Test Jobe AI:**
```bash
JOBE_URL="https://uc-jobe-123456.uksouth.azurecontainerapps.io"

# Health check
curl $JOBE_URL/health

# Tenant insights
curl -X POST $JOBE_URL/api/jobe/tenant-insights \
  -H "Content-Type: application/json" \
  -d '{"tenant":"TEST"}' | jq '.'

# Expected: AI-generated insights and recommendations
```

---

### Phase 4: Monitoring (2 minutes)

#### 4.1 Run Monitoring Dashboard
```bash
# One-time check
./monitor-azure-deployment.sh deployment-development-*.json --once
```

**Expected output:**
```
CONTAINER APPS
Actions API:
  Status:          ✅ Healthy
  Replicas:        1
  Provisioning:    Succeeded
  Running:         Running

Jobe AI API:
  Status:          ✅ Healthy
  Replicas:        1
  Provisioning:    Succeeded
  Running:         Running

HTTP ENDPOINTS
Actions API Health: ✅ UP (HTTP 200)
Jobe AI Health:     ✅ UP (HTTP 200)

DATA SERVICES
PostgreSQL:
  Status:          ✅ Ready
  Storage:         32 GB

Redis Cache:
  Status:          ✅ Running
```

#### 4.2 Continuous Monitoring (Optional)
```bash
# Live monitoring (refreshes every 10 seconds)
./monitor-azure-deployment.sh deployment-development-*.json

# Press Ctrl+C to exit
```

---

### Phase 5: Database Testing (5 minutes)

#### 5.1 Get Database Credentials
```bash
# Get Key Vault name from deployment file
KV_NAME=$(jq -r '.services.keyVault.name' deployment-development-*.json)

# Retrieve PostgreSQL password
POSTGRES_PASSWORD=$(az keyvault secret show \
  --vault-name $KV_NAME \
  --name postgres-password \
  --query value -o tsv)

echo "Password: $POSTGRES_PASSWORD"
```

#### 5.2 Connect to Database
```bash
# Get connection details
POSTGRES_HOST=$(jq -r '.services.postgresql.host' deployment-development-*.json)
POSTGRES_USER=$(jq -r '.services.postgresql.username' deployment-development-*.json)
POSTGRES_DB=$(jq -r '.services.postgresql.database' deployment-development-*.json)

# Connect
PGPASSWORD="$POSTGRES_PASSWORD" psql \
  -h $POSTGRES_HOST \
  -U $POSTGRES_USER \
  -d $POSTGRES_DB
```

#### 5.3 Verify Database Schema
```sql
-- List tables
\dt

-- Expected tables:
-- deployments
-- tenants
-- bundles

-- Check deployments
SELECT * FROM deployments ORDER BY created_at DESC LIMIT 10;

-- Check table structure
\d deployments

-- Exit
\q
```

---

### Phase 6: Azure Portal Verification (5 minutes)

#### 6.1 Open Azure Portal
1. Go to https://portal.azure.com
2. Navigate to Resource Groups
3. Find: `ultracore-development-rg`

#### 6.2 Verify Resources Created
You should see approximately 10 resources:
- ✅ 1 Container Apps Environment
- ✅ 2 Container Apps (actions, jobe)
- ✅ 1 Container Registry (ACR)
- ✅ 1 PostgreSQL Flexible Server
- ✅ 1 Redis Cache
- ✅ 1 Key Vault
- ✅ 1 Storage Account
- ✅ 1 Application Insights
- ✅ 1 Log Analytics Workspace (auto-created)

#### 6.3 Check Application Insights
1. Open Application Insights resource
2. Navigate to "Live Metrics"
3. Make some API calls (use curl commands from above)
4. Watch requests appear in real-time

#### 6.4 Check Container Registry
1. Open ACR resource
2. Navigate to "Repositories"
3. Verify images:
   - ✅ `actions-api:latest`
   - ✅ `actions-api:<timestamp>`
   - ✅ `jobe-api:latest`
   - ✅ `jobe-api:<timestamp>`

---

### Phase 7: Cost Analysis (2 minutes)

#### 7.1 Check Current Costs
```bash
# Get resource group name
RESOURCE_GROUP=$(jq -r '.resourceGroup' deployment-development-*.json)

# Check costs (may take a few hours to appear)
az consumption usage list \
  --start-date $(date -d '1 day ago' +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d) \
  --query "[].{name:instanceName,cost:pretaxCost}" \
  --output table
```

#### 7.2 Review Budget Alert
```bash
# Check if budget alert was created
az consumption budget list \
  --resource-group $RESOURCE_GROUP \
  --output table
```

**Expected daily cost:**
- Development mode: ~$1-2 per day
- Can scale to zero to reduce costs further

---

### Phase 8: Cleanup Decision

⚠️ **IMPORTANT: Decide how long to keep the deployment**

#### Option A: Keep for Development (Cost: ~$30-50/month)
```bash
# Scale to zero to minimize costs when not in use
az containerapp update \
  --name uc-actions-* \
  --resource-group ultracore-development-rg \
  --min-replicas 0 \
  --max-replicas 0

az containerapp update \
  --name uc-jobe-* \
  --resource-group ultracore-development-rg \
  --min-replicas 0 \
  --max-replicas 0
```

#### Option B: Delete Immediately (Cost: ~$1-2 total)
```bash
# Get resource group name
RESOURCE_GROUP=$(jq -r '.resourceGroup' deployment-development-*.json)

# Delete everything
az group delete --name $RESOURCE_GROUP --yes --no-wait

# Verify deletion (may take a few minutes)
az group list --query "[?name=='$RESOURCE_GROUP']" --output table
```

#### Option C: Keep for Testing (Cost: ~$2-5 per day)
- Leave deployment running
- Use for testing and validation
- Delete when done (within 1-3 days)

---

## Testing Checklist

### Prerequisites
- [ ] Azure CLI installed and logged in
- [ ] Docker installed and running
- [ ] jq installed
- [ ] PostgreSQL client installed (optional)
- [ ] Subscription selected
- [ ] Sufficient permissions (Contributor/Owner)

### Deployment
- [ ] Deployment script executed successfully
- [ ] No error messages during deployment
- [ ] Deployment info file created
- [ ] Service URLs obtained

### Validation
- [ ] Automated validation script passes all tests
- [ ] Actions API health check returns 200
- [ ] Jobe AI health check returns 200
- [ ] Can list bundles successfully
- [ ] Can deploy bundle (dry run) successfully
- [ ] Can get tenant insights from Jobe AI

### Monitoring
- [ ] Monitoring script shows all services healthy
- [ ] Container apps show "Running" status
- [ ] Replicas count is correct (0 or 1+)
- [ ] PostgreSQL shows "Ready" status
- [ ] Redis shows "Running" status

### Database
- [ ] Can retrieve PostgreSQL password from Key Vault
- [ ] Can connect to database
- [ ] All tables created (deployments, tenants, bundles)
- [ ] Can query deployments table
- [ ] Indexes created

### Azure Portal
- [ ] All expected resources visible
- [ ] Container Registry has images
- [ ] Application Insights receiving data
- [ ] No failed resources
- [ ] Budget alert created

### Cost Management
- [ ] Understand current costs
- [ ] Budget alert configured
- [ ] Know how to scale to zero
- [ ] Cleanup plan decided

---

## Troubleshooting

### Deployment Fails

**Check logs:**
```bash
# View last 50 lines of deployment output
tail -50 deployment.log

# Check Azure activity log
az monitor activity-log list \
  --resource-group ultracore-development-rg \
  --offset 1h
```

**Common issues:**
1. **Docker not running**: Start Docker Desktop or daemon
2. **Azure login expired**: Run `az login` again
3. **Quota exceeded**: Try different region or request increase
4. **Name conflicts**: Script uses timestamp, should be unique

### Validation Fails

**Check individual services:**
```bash
# Test each URL manually
curl -v https://uc-actions-*.azurecontainerapps.io/health

# Check container logs
az containerapp logs show \
  --name uc-actions-* \
  --resource-group ultracore-development-rg \
  --follow
```

### Database Connection Fails

**Check firewall rules:**
```bash
# List firewall rules
az postgres flexible-server firewall-rule list \
  --resource-group ultracore-development-rg \
  --server-name uc-pg-*

# If needed, allow all IPs (development only!)
az postgres flexible-server firewall-rule create \
  --resource-group ultracore-development-rg \
  --server-name uc-pg-* \
  --name AllowAll \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 255.255.255.255
```

---

## Expected Results Summary

### What Should Work ✅

1. **Deployment completes in 15-20 minutes**
2. **All 12+ validation tests pass**
3. **Actions API responds to health checks**
4. **Jobe AI generates insights**
5. **Database is accessible and has schema**
6. **Container Registry has 2 images**
7. **Application Insights shows metrics**
8. **All resources visible in Azure Portal**
9. **Costs are within expected range (~$1-2/day)**
10. **Monitoring dashboard shows green status**

### What Success Looks Like

```
✅ Actions API: https://uc-actions-123456.uksouth.azurecontainerapps.io
✅ Jobe AI API: https://uc-jobe-123456.uksouth.azurecontainerapps.io
✅ Database: Connected, schema initialized
✅ Redis: Connected
✅ ACR: 2 images (actions-api, jobe-api)
✅ Monitoring: All services healthy
✅ Validation: 12/12 tests passed
✅ Costs: ~$1-2/day (development mode)
```

---

## Time Estimate

- **Prerequisites**: 5-10 minutes (if already installed: 2 minutes)
- **Deployment**: 15-20 minutes
- **Validation**: 5 minutes
- **Monitoring**: 2 minutes
- **Database Testing**: 5 minutes
- **Portal Verification**: 5 minutes
- **Total**: ~40-50 minutes (or ~30 minutes if prerequisites ready)

---

## Cost Estimate

- **Testing only (delete immediately)**: $1-2
- **Keep 1 day**: $2-5
- **Keep 1 week**: $10-15
- **Keep 1 month**: $30-50

**Recommendation**: Test and delete same day = $1-2 total cost

---

## Questions?

If you encounter issues:

1. Check `AZURE-DEPLOYMENT-GUIDE.md` troubleshooting section
2. Review deployment script output for errors
3. Check Azure Portal for failed resources
4. Review Application Insights for application errors

---

**Good luck with your deployment! 🚀**
