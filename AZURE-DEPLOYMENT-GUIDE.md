# UltraCore Azure Cloud Deployment Guide (Option 2)

Complete guide for deploying UltraCore to Azure using the optimized v2.0 deployment script.

## Table of Contents

- [Overview](#overview)
- [What's New in v2.0](#whats-new-in-v20)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Deployment Process](#deployment-process)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Cost Optimization](#cost-optimization)
- [Troubleshooting](#troubleshooting)
- [Cleanup](#cleanup)

---

## Overview

The UltraCore Azure deployment v2.0 provides a complete, production-ready cloud infrastructure featuring:

- **Real Applications**: Deploys actual Actions API and Jobe AI services (not placeholders)
- **Azure Container Registry**: Custom Docker images built and hosted in ACR
- **PostgreSQL Database**: Azure Database for PostgreSQL Flexible Server
- **Redis Cache**: Azure Cache for Redis for high-performance caching
- **Application Insights**: Full application logging and monitoring
- **Key Vault**: Secure secret management
- **Auto-scaling**: Scale-to-zero in development, auto-scale in production
- **Cost Optimization**: Development mode costs ~$30-50/month

---

## What's New in v2.0

### Fixed Issues from v1.0

1. ✅ **Real Container Images**: Builds and deploys actual applications instead of placeholders
2. ✅ **Azure Container Registry**: Creates ACR and pushes custom images
3. ✅ **PostgreSQL Instead of Cosmos DB**: Uses PostgreSQL to match local development
4. ✅ **Database Schema Initialization**: Automatically creates required tables
5. ✅ **Application Insights**: Integrated monitoring and logging
6. ✅ **Validation Script**: Automated testing of deployed services
7. ✅ **Monitoring Dashboard**: Real-time monitoring script

### New Features

- **Automatic Docker Image Build**: Builds from existing Dockerfiles
- **Secure Credential Management**: All secrets stored in Key Vault
- **Deployment Information Export**: JSON file with all deployment details
- **Health Checks**: Built-in health monitoring for all services
- **Comprehensive Testing**: 12+ automated validation tests

---

## Prerequisites

### Required Software

```bash
# Azure CLI (version 2.50.0 or later)
az --version

# Docker (for building images)
docker --version

# jq (for validation script)
sudo apt-get install jq  # Ubuntu/Debian
brew install jq          # macOS

# PostgreSQL client (optional, for database testing)
psql --version
```

### Azure Requirements

1. **Active Azure Subscription**
   - Contributor or Owner role
   - Ability to create resources
   - Budget for ~$30-50/month (development) or ~$100-200/month (production)

2. **Azure Login**
   ```bash
   az login

   # Set subscription (if you have multiple)
   az account set --subscription "Your-Subscription-Name"
   ```

3. **Docker Running**
   ```bash
   # Verify Docker is running
   docker ps
   ```

---

## Quick Start

### 1. Deploy to Azure (Development Mode)

```bash
./deploy-ultracore-optimized-v2.sh development
```

This will:
- Create all Azure resources
- Build Docker images
- Push images to Azure Container Registry
- Deploy containerized applications
- Configure monitoring and alerts
- Generate deployment information file

**Deployment time**: 15-20 minutes

### 2. Validate Deployment

```bash
# Find your deployment info file
ls deployment-*.json

# Run validation
./validate-deployment.sh deployment-development-123456.json
```

### 3. Monitor Deployment

```bash
# Continuous monitoring
./monitor-azure-deployment.sh deployment-development-123456.json

# One-time check
./monitor-azure-deployment.sh deployment-development-123456.json --once
```

---

## Deployment Process

### Step-by-Step Breakdown

#### Step 1: Prerequisites Check
- Verifies Azure CLI installation
- Verifies Docker installation
- Checks Azure login status
- Validates subscription access

#### Step 2: Resource Group
- Creates dedicated resource group
- Tags with environment and project metadata

#### Step 3: Azure Container Registry (ACR)
- Creates private container registry
- Enables admin access for authentication
- Retrieves credentials for Docker push

#### Step 4: Docker Image Build
- Logs into ACR
- Builds Actions API image from `Dockerfile.actions`
- Builds Jobe AI image from `Dockerfile.jobe`
- Tags images with `latest` and timestamp
- Pushes all images to ACR

#### Step 5: Core Infrastructure
Creates the following resources:

| Resource | Purpose | Development SKU | Production SKU |
|----------|---------|-----------------|----------------|
| Application Insights | Monitoring/Logging | Standard | Standard |
| Key Vault | Secret Management | Standard | Premium |
| Storage Account | General Storage | Standard_LRS | Standard_GRS |
| Redis Cache | Caching Layer | Basic C0 | Standard C1 |
| PostgreSQL | Primary Database | Burstable B1ms | General Purpose D2s |

#### Step 6: Secret Storage
Stores the following secrets in Key Vault:
- PostgreSQL connection string
- Redis access key
- Storage connection string
- Application Insights key
- ACR credentials

#### Step 7: Container Apps Environment
- Creates managed environment for containers
- Configures networking and scaling policies

#### Step 8: Container Apps Deployment

**Actions API Container:**
- Image: `<acr>.azurecr.io/actions-api:latest`
- Port: 4000
- External ingress enabled
- Min replicas: 0 (dev) / 1 (prod)
- Max replicas: 5 (dev) / 10 (prod)
- Environment variables: Database, Redis, App Insights

**Jobe AI Container:**
- Image: `<acr>.azurecr.io/jobe-api:latest`
- Port: 3000
- External ingress enabled
- Min replicas: 0 (dev) / 1 (prod)
- Max replicas: 5 (dev) / 10 (prod)
- Environment variables: Database, App Insights

#### Step 9: Monitoring & Alerts
- Creates budget alerts ($100/month)
- Configures Application Insights
- Sets up log analytics

#### Step 10: Deployment Information
- Generates JSON file with all deployment details
- Includes URLs, credentials, resource names
- Used by validation and monitoring scripts

---

## Post-Deployment

### Access Your Services

After deployment completes, you'll see:

```
🌐 SERVICE ENDPOINTS
==========================================
Actions API:      https://uc-actions-123456.region.azurecontainerapps.io
Jobe AI API:      https://uc-jobe-123456.region.azurecontainerapps.io
ACR:              ultracore123456.azurecr.io
PostgreSQL:       uc-pg-123456.postgres.database.azure.com
Redis:            uc-cache-123456.redis.cache.windows.net
Key Vault:        uc-kv-123456
App Insights:     uc-insights-123456
```

### Test Your Deployment

```bash
# Get your Actions API URL from deployment output
ACTIONS_URL="https://uc-actions-123456.region.azurecontainerapps.io"

# Test health endpoint
curl $ACTIONS_URL/health

# List available bundles
curl -X POST $ACTIONS_URL/api/actions \
  -H "Content-Type: application/json" \
  -d '{"action":"bundles.list","payload":{}}'

# Deploy a bundle (dry run)
curl -X POST $ACTIONS_URL/api/actions \
  -H "Content-Type: application/json" \
  -d '{
    "action": "deploy.bundle",
    "payload": {
      "tenant": "DEMO",
      "bundle": "intake-stack",
      "dryRun": true,
      "sequential": true
    }
  }'
```

### Retrieve Secrets

```bash
# Get PostgreSQL password
az keyvault secret show \
  --vault-name uc-kv-123456 \
  --name postgres-password \
  --query value -o tsv

# Get Redis key
az keyvault secret show \
  --vault-name uc-kv-123456 \
  --name redis-key \
  --query value -o tsv

# Get all secrets
az keyvault secret list \
  --vault-name uc-kv-123456 \
  --query "[].name" -o table
```

### Connect to PostgreSQL

```bash
# Get connection details from deployment file
POSTGRES_HOST=$(jq -r '.services.postgresql.host' deployment-*.json)
POSTGRES_USER=$(jq -r '.services.postgresql.username' deployment-*.json)
POSTGRES_DB=$(jq -r '.services.postgresql.database' deployment-*.json)

# Get password from Key Vault
POSTGRES_PASSWORD=$(az keyvault secret show \
  --vault-name uc-kv-123456 \
  --name postgres-password \
  --query value -o tsv)

# Connect to database
PGPASSWORD="$POSTGRES_PASSWORD" psql \
  -h $POSTGRES_HOST \
  -U $POSTGRES_USER \
  -d $POSTGRES_DB

# List tables
\dt

# Query deployments
SELECT * FROM deployments ORDER BY created_at DESC LIMIT 10;
```

---

## Monitoring

### Real-Time Monitoring Dashboard

```bash
# Start continuous monitoring
./monitor-azure-deployment.sh deployment-development-123456.json

# Single health check
./monitor-azure-deployment.sh deployment-development-123456.json --once
```

The monitoring dashboard shows:
- Container app status and replica count
- HTTP endpoint health
- Database status
- Redis cache status
- Resource count

### Application Insights

```bash
# Open Application Insights in Azure Portal
az monitor app-insights component show \
  --app uc-insights-123456 \
  --resource-group ultracore-development-rg \
  --query appId -o tsv

# Query logs
az monitor app-insights query \
  --app uc-insights-123456 \
  --analytics-query "requests | where timestamp > ago(1h) | summarize count() by resultCode"
```

### View Logs

```bash
# Container app logs
az containerapp logs show \
  --name uc-actions-123456 \
  --resource-group ultracore-development-rg \
  --follow

# PostgreSQL logs
az postgres flexible-server server-logs list \
  --resource-group ultracore-development-rg \
  --server-name uc-pg-123456
```

### Metrics

```bash
# Container app metrics
az monitor metrics list \
  --resource uc-actions-123456 \
  --resource-group ultracore-development-rg \
  --resource-type "Microsoft.App/containerApps" \
  --metric Requests

# Database metrics
az monitor metrics list \
  --resource uc-pg-123456 \
  --resource-group ultracore-development-rg \
  --resource-type "Microsoft.DBforPostgreSQL/flexibleServers" \
  --metric cpu_percent
```

---

## Cost Optimization

### Development Mode (~$30-50/month)

- **Scale-to-Zero**: Container apps scale to 0 replicas when idle
- **Burstable PostgreSQL**: B1ms tier (1 vCore, 2GB RAM)
- **Basic Redis**: C0 tier (250MB cache)
- **Basic ACR**: 10GB storage included

### Production Mode (~$100-200/month)

- **Always-On**: Minimum 1 replica for high availability
- **General Purpose PostgreSQL**: D2s tier (2 vCores, 8GB RAM)
- **Standard Redis**: C1 tier (1GB cache)
- **Standard ACR**: 100GB storage

### Cost Monitoring

```bash
# Check current spending
az consumption usage list \
  --start-date $(date -d '30 days ago' +%Y-%m-%d) \
  --end-date $(date +%Y-%m-%d) \
  --query "[].{name:instanceName,cost:pretaxCost}" \
  --output table

# View budget status
az consumption budget list \
  --resource-group ultracore-development-rg \
  --output table
```

### Cost-Saving Tips

1. **Stop services when not in use:**
   ```bash
   # Stop container apps (scale to 0)
   az containerapp update \
     --name uc-actions-123456 \
     --resource-group ultracore-development-rg \
     --min-replicas 0 \
     --max-replicas 0
   ```

2. **Use development mode for testing:**
   ```bash
   ./deploy-ultracore-optimized-v2.sh development
   ```

3. **Delete deployment when not needed:**
   ```bash
   az group delete --name ultracore-development-rg --yes --no-wait
   ```

---

## Troubleshooting

### Common Issues

#### Issue: Docker build fails

**Symptoms:**
```
ERROR: failed to solve: failed to fetch ...
```

**Solution:**
```bash
# Check Docker is running
docker ps

# Restart Docker daemon
sudo systemctl restart docker  # Linux
# or restart Docker Desktop     # Windows/Mac

# Clear Docker cache
docker builder prune -af
```

#### Issue: ACR push permission denied

**Symptoms:**
```
unauthorized: authentication required
```

**Solution:**
```bash
# Re-login to ACR
ACR_NAME="ultracore123456"
az acr login --name $ACR_NAME

# Or use manual login
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)
echo $ACR_PASSWORD | docker login $ACR_NAME.azurecr.io -u $ACR_NAME --password-stdin
```

#### Issue: Container app won't start

**Symptoms:**
- Deployment succeeds but health checks fail
- Container status shows "Waiting" or "CrashLoopBackOff"

**Solution:**
```bash
# Check container logs
az containerapp logs show \
  --name uc-actions-123456 \
  --resource-group ultracore-development-rg \
  --follow

# Check replica status
az containerapp replica list \
  --name uc-actions-123456 \
  --resource-group ultracore-development-rg \
  --output table

# Restart container app
az containerapp revision restart \
  --name uc-actions-123456 \
  --resource-group ultracore-development-rg
```

#### Issue: Database connection fails

**Symptoms:**
```
Error: connect ETIMEDOUT
FATAL: password authentication failed
```

**Solution:**
```bash
# Check firewall rules
az postgres flexible-server firewall-rule list \
  --resource-group ultracore-development-rg \
  --server-name uc-pg-123456

# Add Container Apps outbound IPs
az postgres flexible-server firewall-rule create \
  --resource-group ultracore-development-rg \
  --server-name uc-pg-123456 \
  --name AllowContainerApps \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 255.255.255.255

# Verify connection string
az keyvault secret show \
  --vault-name uc-kv-123456 \
  --name postgres-host \
  --query value -o tsv
```

#### Issue: Deployment quota exceeded

**Symptoms:**
```
Operation could not be completed as it results in exceeding approved quota
```

**Solution:**
```bash
# Check current quotas
az vm list-usage --location uksouth --output table

# Request quota increase
# Go to Azure Portal → Subscriptions → Usage + quotas → Request increase

# Or try different region
./deploy-ultracore-optimized-v2.sh development
# Edit script to change LOCATION variable to: eastus, westus2, or westeurope
```

### Validation Failures

If validation script fails:

```bash
# Run validation with verbose output
VERBOSE=1 ./validate-deployment.sh deployment-development-123456.json

# Test individual endpoint
curl -v https://uc-actions-123456.region.azurecontainerapps.io/health

# Check if containers are running
./monitor-azure-deployment.sh deployment-development-123456.json --once
```

### Get Support

```bash
# View deployment activity log
az monitor activity-log list \
  --resource-group ultracore-development-rg \
  --offset 1h \
  --output table

# Export deployment template
az group export \
  --name ultracore-development-rg \
  --output json > deployment-template.json
```

---

## Cleanup

### Delete Entire Deployment

```bash
# Delete resource group (deletes all resources)
az group delete \
  --name ultracore-development-rg \
  --yes \
  --no-wait

# Verify deletion
az group list --output table
```

### Delete Specific Resources

```bash
# Delete container apps only
az containerapp delete --name uc-actions-123456 --resource-group ultracore-development-rg --yes
az containerapp delete --name uc-jobe-123456 --resource-group ultracore-development-rg --yes

# Delete database only
az postgres flexible-server delete --name uc-pg-123456 --resource-group ultracore-development-rg --yes

# Delete ACR only
az acr delete --name ultracore123456 --yes
```

### Cleanup Docker Images

```bash
# Remove local Docker images
docker rmi $(docker images 'ultracore*' -q)

# Clean up Docker cache
docker system prune -af
```

---

## Best Practices

### Security

1. **Rotate Secrets Regularly**
   ```bash
   # Generate new PostgreSQL password
   NEW_PASSWORD="UltraCore$(openssl rand -base64 12)!"

   # Update in Azure
   az postgres flexible-server update \
     --name uc-pg-123456 \
     --resource-group ultracore-development-rg \
     --admin-password "$NEW_PASSWORD"

   # Update in Key Vault
   az keyvault secret set \
     --vault-name uc-kv-123456 \
     --name postgres-password \
     --value "$NEW_PASSWORD"
   ```

2. **Use Private Endpoints** (Production)
   - Disable public access to PostgreSQL
   - Configure VNet integration for Container Apps
   - Use private ACR endpoints

3. **Enable Managed Identity**
   - Configure Container Apps with managed identity
   - Grant Key Vault access to managed identity
   - Remove hard-coded credentials

### Performance

1. **Enable Redis Caching**
   - All services have Redis connection configured
   - Use Redis for session storage and API caching
   - Monitor cache hit ratio

2. **Optimize Database**
   ```sql
   -- Add indexes for frequently queried columns
   CREATE INDEX idx_deployments_status ON deployments(status);
   CREATE INDEX idx_deployments_bundle ON deployments(bundle);

   -- Enable pg_stat_statements
   CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

   -- Monitor slow queries
   SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;
   ```

3. **Scale Appropriately**
   ```bash
   # Adjust scaling for production
   az containerapp update \
     --name uc-actions-123456 \
     --resource-group ultracore-development-rg \
     --min-replicas 2 \
     --max-replicas 20
   ```

### Monitoring

1. **Set Up Alerts**
   ```bash
   # High error rate alert
   az monitor metrics alert create \
     --name "High-Error-Rate" \
     --resource-group ultracore-development-rg \
     --scopes /subscriptions/.../containerApps/uc-actions-123456 \
     --condition "avg Percentage CPU > 80" \
     --description "Alert when CPU exceeds 80%"
   ```

2. **Enable Log Analytics**
   ```bash
   # Create Log Analytics workspace
   az monitor log-analytics workspace create \
     --resource-group ultracore-development-rg \
     --workspace-name ultracore-logs
   ```

---

## Comparison: v1.0 vs v2.0

| Feature | v1.0 (Original) | v2.0 (Enhanced) |
|---------|-----------------|-----------------|
| Container Images | Placeholder only | Real applications built from Dockerfiles |
| Container Registry | ❌ Not included | ✅ Azure Container Registry |
| Database | Cosmos DB | PostgreSQL (matches local dev) |
| Database Schema | Manual setup | Auto-initialized |
| Monitoring | Basic | Application Insights integrated |
| Secret Management | Environment variables | Azure Key Vault |
| Validation | Manual | Automated script (12+ tests) |
| Monitoring Dashboard | ❌ None | ✅ Real-time monitoring script |
| Documentation | Basic | Comprehensive guide |

---

## Additional Resources

- [Azure Container Apps Documentation](https://learn.microsoft.com/azure/container-apps/)
- [Azure Database for PostgreSQL](https://learn.microsoft.com/azure/postgresql/)
- [Azure Container Registry](https://learn.microsoft.com/azure/container-registry/)
- [Application Insights](https://learn.microsoft.com/azure/azure-monitor/app/app-insights-overview)
- [Azure Cost Management](https://learn.microsoft.com/azure/cost-management-billing/)

---

**Built with ❤️ for cloud-native deployments**
