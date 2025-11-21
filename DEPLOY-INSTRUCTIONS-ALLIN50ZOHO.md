# Deployment Instructions for allin50zoho Azure Account

## Your Azure Account Details

- **Account Name**: allin50zoho
- **Tenant ID**: 3b31cccf-408c-4b4e-b12f-c2aeee74d40b
- **Primary Domain**: allin50zoho.onmicrosoft.com

---

## ⚠️ Important: Environment Requirements

**This deployment CANNOT run in this Claude Code environment** because:
- ❌ Azure CLI not installed
- ❌ Docker not available

**Solution**: Run on your **local machine** (Windows, macOS, or Linux)

---

## 🚀 Quick Start (On Your Local Machine)

### Prerequisites (One-Time Setup)

#### 1. Install Azure CLI

**Ubuntu/Debian:**
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

**macOS:**
```bash
brew install azure-cli
```

**Windows:**
Download from: https://aka.ms/installazurecliwindows

#### 2. Install Docker

**Ubuntu:**
```bash
sudo apt-get update
sudo apt-get install docker.io
sudo systemctl start docker
sudo usermod -aG docker $USER
# Logout and login for group changes
```

**macOS:**
```bash
brew install --cask docker
# Then start Docker Desktop
```

**Windows:**
Download Docker Desktop from: https://www.docker.com/products/docker-desktop

#### 3. Verify Installation

```bash
az --version
docker --version
docker ps
```

---

## 📥 Get the Code

### Option 1: Clone from GitHub
```bash
git clone https://github.com/allin50-cmd/manus-ai.git
cd manus-ai
git checkout claude/implement-option-2-017a6BstYEAhGEu8MDC84xg2
```

### Option 2: Download from Current Session
If you can access the files from this Claude Code session, copy them to your local machine.

---

## 🎯 Deployment Steps

### Step 1: Navigate to Project
```bash
cd /path/to/manus-ai
```

### Step 2: Run Personalized Deployment Script
```bash
./deploy-to-azure.sh
```

This script will:
1. ✅ Check prerequisites (Azure CLI, Docker)
2. ✅ Login to your Azure account (Tenant: 3b31cccf-408c-4b4e-b12f-c2aeee74d40b)
3. ✅ Show available subscriptions
4. ✅ Let you choose development or production
5. ✅ Run the full deployment
6. ✅ Validate with automated tests
7. ✅ Show you the service URLs

**Time**: ~15-20 minutes
**Cost**: ~$1-2 (if deleted immediately after testing)

---

## 🔐 Login Process

When the script runs, it will open your browser for authentication:

1. Browser opens automatically
2. Login with your allin50zoho Microsoft account
3. Grant permissions if requested
4. Return to terminal - script continues automatically

**Tenant ID will be automatically used**: 3b31cccf-408c-4b4e-b12f-c2aeee74d40b

---

## 📊 What Gets Deployed

### Development Mode (Recommended for Testing)
- **Cost**: ~$30-50/month (or ~$1-2 if deleted immediately)
- **Features**: Scale-to-zero, Burstable database
- **Resources**:
  - Azure Container Registry (custom images)
  - 2 Container Apps (Actions API, Jobe AI)
  - PostgreSQL Flexible Server (B1ms)
  - Redis Cache (C0 Basic)
  - Key Vault (secrets)
  - Application Insights (monitoring)
  - Storage Account

### Production Mode
- **Cost**: ~$100-200/month
- **Features**: Always-on, High availability
- **Resources**: Same as development but larger tiers

---

## ✅ After Deployment

### 1. Get Service URLs

The deployment script outputs URLs like:
```
Actions API: https://uc-actions-123456.uksouth.azurecontainerapps.io
Jobe AI API:  https://uc-jobe-123456.uksouth.azurecontainerapps.io
```

### 2. Validate Deployment

Automated validation runs automatically, or run manually:
```bash
./validate-deployment.sh deployment-development-*.json
```

Expected: **12/12 tests PASSED** ✅

### 3. Test Manually

**Health Check:**
```bash
curl https://uc-actions-XXXXXX.uksouth.azurecontainerapps.io/health
```

**List Bundles:**
```bash
curl -X POST https://uc-actions-XXXXXX.uksouth.azurecontainerapps.io/api/actions \
  -H "Content-Type: application/json" \
  -d '{"action":"bundles.list","payload":{}}'
```

### 4. Monitor Services

```bash
# One-time check
./monitor-azure-deployment.sh deployment-development-*.json --once

# Continuous monitoring
./monitor-azure-deployment.sh deployment-development-*.json
```

### 5. View in Azure Portal

1. Go to: https://portal.azure.com
2. Login with allin50zoho account
3. Navigate to Resource Groups
4. Open: `ultracore-development-rg`
5. See all deployed resources

---

## 💰 Cost Management

### Check Current Costs
```bash
az consumption usage list \
  --start-date $(date -d '1 day ago' +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d)
```

### Scale to Zero (When Not Using)
```bash
az containerapp update \
  --name uc-actions-XXXXXX \
  --resource-group ultracore-development-rg \
  --min-replicas 0 \
  --max-replicas 0
```

### Delete Deployment (Stop All Costs)
```bash
# Get resource group name
RESOURCE_GROUP=$(jq -r '.resourceGroup' deployment-development-*.json)

# Delete everything
az group delete --name $RESOURCE_GROUP --yes --no-wait

# Verify deletion
az group list --query "[?name=='$RESOURCE_GROUP']"
```

**Recommendation**: If just testing, delete immediately after testing to minimize costs (~$1-2 total).

---

## 🐛 Troubleshooting

### Issue: "az: command not found"
**Solution**: Azure CLI not installed. Follow installation steps above.

### Issue: "docker: command not found"
**Solution**: Docker not installed or not in PATH. Follow installation steps above.

### Issue: "Cannot connect to Docker daemon"
**Solution**: Docker is not running.
- Linux: `sudo systemctl start docker`
- macOS/Windows: Start Docker Desktop

### Issue: "Login failed"
**Solution**:
- Check internet connection
- Verify you have access to allin50zoho account
- Try manual login: `az login --tenant 3b31cccf-408c-4b4e-b12f-c2aeee74d40b`

### Issue: "Subscription not found"
**Solution**:
```bash
# List all subscriptions
az account list --output table

# Set active subscription
az account set --subscription "Your-Subscription-Name"
```

### Issue: "Quota exceeded"
**Solution**: Try different region or request quota increase in Azure Portal.

### Issue: Deployment fails mid-way
**Solution**:
```bash
# Check what was created
az resource list --resource-group ultracore-development-rg

# Delete and retry
az group delete --name ultracore-development-rg --yes
./deploy-to-azure.sh
```

---

## 📚 Additional Documentation

- **[AZURE-DEPLOYMENT-GUIDE.md](./AZURE-DEPLOYMENT-GUIDE.md)** - Complete deployment guide
- **[AZURE-TESTING-CHECKLIST.md](./AZURE-TESTING-CHECKLIST.md)** - Detailed testing checklist
- **[OPTION-2-IMPROVEMENTS.md](./OPTION-2-IMPROVEMENTS.md)** - What's new in v2.0

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Prerequisites (first time) | 10-15 minutes |
| Prerequisites (already installed) | 2 minutes |
| Deployment | 15-20 minutes |
| Validation | 2 minutes |
| Testing | 5-10 minutes |
| **Total** | **~30-50 minutes** |

---

## 💵 Cost Estimates

| Duration | Cost |
|----------|------|
| Testing (delete immediately) | $1-2 |
| 1 day | $2-5 |
| 1 week | $10-15 |
| 1 month (development) | $30-50 |
| 1 month (production) | $100-200 |

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Deployment script completed without errors
- [ ] Validation shows 12/12 tests passed
- [ ] Actions API health check returns HTTP 200
- [ ] Jobe AI health check returns HTTP 200
- [ ] Can list bundles successfully
- [ ] All resources visible in Azure Portal
- [ ] Container Registry has 2 images
- [ ] Database is accessible
- [ ] Monitoring dashboard shows healthy status

---

## 🎯 Quick Command Reference

```bash
# Deploy
./deploy-to-azure.sh

# Validate
./validate-deployment.sh deployment-development-*.json

# Monitor
./monitor-azure-deployment.sh deployment-development-*.json --once

# Test health
ACTIONS_URL="<your-url>"
curl $ACTIONS_URL/health

# Scale to zero
az containerapp update --name uc-actions-* --resource-group ultracore-development-rg --min-replicas 0

# Delete everything
az group delete --name ultracore-development-rg --yes --no-wait

# Logout
az logout
```

---

## 🆘 Need Help?

1. Check troubleshooting section above
2. Review [AZURE-DEPLOYMENT-GUIDE.md](./AZURE-DEPLOYMENT-GUIDE.md)
3. Check Azure Portal for resource status
4. Review script output for specific error messages

---

**Account**: allin50zoho
**Tenant**: 3b31cccf-408c-4b4e-b12f-c2aeee74d40b
**Ready to deploy!** 🚀
