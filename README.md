# 🚀 UltraCore Platform

A complete, production-ready platform featuring local development tools, Azure cloud deployment, and comprehensive management utilities.

## 📖 Documentation

- **[LOCAL-DEVELOPMENT.md](./LOCAL-DEVELOPMENT.md)** - Complete local development guide with Actions API and Jobe AI Agent
- **[AZURE-DEPLOYMENT-GUIDE.md](./AZURE-DEPLOYMENT-GUIDE.md)** - Complete Azure cloud deployment guide (v2.0)
- **[TOOLS.md](./TOOLS.md)** - Comprehensive developer tools documentation
- **[PROVISIONING.md](./PROVISIONING.md)** - Tenant provisioning and management guide
- **[README.md](./README.md)** - This file: Quick start and overview

## 🎯 Quick Start Options

### Option 1: Local Development (Recommended for getting started)
```bash
./deploy-now.sh
```
Starts complete local stack with PostgreSQL, Redis, Actions API (port 4000), and Jobe AI (port 3000).

### Option 2: Azure Cloud Deployment

**New v2.0 (Recommended):**
```bash
./deploy-ultracore-optimized-v2.sh development
```
Complete production-ready deployment with ACR, PostgreSQL, Application Insights, and real applications.

**Legacy v1.0:**
```bash
./deploy-ultracore-optimized.sh development
```
Basic deployment (uses placeholder images, not recommended).

**See [AZURE-DEPLOYMENT-GUIDE.md](./AZURE-DEPLOYMENT-GUIDE.md) for complete documentation.**

## 💰 Cost Optimization Features

### Development Environment (~$30-50/month)
- **Scale-to-Zero**: Container Apps automatically scale to 0 replicas when idle
- **Serverless Cosmos DB**: Pay-per-request pricing model
- **Minimal Redis Cache**: C0 Basic tier (~$13/month)
- **Budget Alerts**: Automatic alerts at $50/month threshold

### Production Environment (~$100-200/month)
- **Auto-scaling**: Scales based on actual traffic
- **Provisioned Throughput**: Cosmos DB with predictable performance
- **Health Monitoring**: Comprehensive health checks and probes
- **Cost Monitoring**: Budget tracking and alerts

## 🎯 Key Features

1. ✅ **Scale-to-Zero** - Containers stop when not used
2. ✅ **Serverless Cosmos DB** - Pay-per-request pricing
3. ✅ **Smaller Container Images** - Alpine Linux + multi-stage builds
4. ✅ **Health Checks & Probes** - Better reliability
5. ✅ **Auto-scaling Rules** - Based on HTTP requests
6. ✅ **Cost Monitoring** - Budget alerts and tracking
7. ✅ **Infrastructure-as-Code** - Bicep templates
8. ✅ **Caching Layer** - Redis for performance
9. ✅ **Environment-based Config** - Different settings for dev/prod

## 📋 Prerequisites

Before running the deployment, ensure you have:

1. **Azure CLI** installed and configured
   ```bash
   # Install Azure CLI (Ubuntu/Debian)
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

   # Or on macOS
   brew update && brew install azure-cli
   ```

2. **Azure Subscription** with appropriate permissions
   - Contributor or Owner role
   - Ability to create resources

3. **Login to Azure**
   ```bash
   az login
   ```

4. **Set the correct subscription** (if you have multiple)
   ```bash
   # List subscriptions
   az account list --output table

   # Set active subscription
   az account set --subscription "Your-Subscription-Name"
   ```

## 🚀 Quick Start

### 1. Make the Script Executable

```bash
chmod +x deploy-ultracore-optimized.sh
```

### 2. Deploy Development Environment (Cost-Optimized)

```bash
./deploy-ultracore-optimized.sh development
```

### 3. Deploy Production Environment

```bash
./deploy-ultracore-optimized.sh production
```

## 📊 Deployment Process

The script performs the following steps automatically:

1. **Resource Group Creation** - Creates a dedicated resource group
2. **Infrastructure Deployment** - Deploys core Azure resources via Bicep
3. **Container Apps Environment** - Sets up the container hosting environment
4. **Secrets Configuration** - Stores all secrets in Azure Key Vault
5. **Database Setup** - Creates Cosmos DB database and containers
6. **Application Build** - Prepares optimized Docker containers
7. **Container Deployment** - Deploys Dashboard and Actions services
8. **Monitoring Setup** - Configures budgets and alerts
9. **Endpoint Configuration** - Provides URLs for accessing services

## 🏗️ Infrastructure Components

### Core Services

- **Container Apps**: Hosts the Dashboard and Actions services
- **Cosmos DB**: NoSQL database with serverless (dev) or provisioned (prod) throughput
- **Azure Cache for Redis**: Caching layer for performance
- **Azure Storage**: General-purpose storage (Standard LRS)
- **Key Vault**: Secure secret management

### Containers

1. **Dashboard Service** (`uc-dash-*`)
   - Port: 8080
   - Features: Health checks, caching, cost-optimized
   - Auto-scales: 0-5 replicas (dev) or 1-5 (prod)

2. **Actions Service** (`uc-actions-*`)
   - Port: 4000
   - Features: AI integration, health monitoring
   - Auto-scales: 0-3 replicas (dev) or 1-3 (prod)

## 🧪 Testing Your Deployment

After deployment completes, test your services:

### Test Dashboard Health

```bash
curl https://YOUR-DASHBOARD-URL/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "UltraCore Dashboard",
  "timestamp": "2024-01-21T10:30:00.000Z",
  "environment": "development",
  "version": "2.0.0",
  "source": "live"
}
```

### Test Actions Service

```bash
curl -X POST https://YOUR-ACTIONS-URL/api/actions \
  -H "Content-Type: application/json" \
  -d '{
    "action": "agent.run",
    "payload": {
      "agent": "jobe",
      "input": {
        "tenant": "ACCURACY"
      }
    }
  }'
```

Expected response:
```json
{
  "ok": true,
  "message": "Jobe analyzed ACCURACY in development",
  "data": {
    "tenant": "ACCURACY",
    "status": "optimized",
    "recommendations": ["All systems optimal", "Cost efficiency: Excellent"],
    "environment": "development",
    "timestamp": "2024-01-21T10:30:00.000Z"
  }
}
```

### List Deployed Resources

```bash
az resource list --resource-group ultracore-development-rg --output table
```

## 💰 Cost Monitoring

### Check Current Spending

```bash
# View budget status
az consumption budget list --output table

# Check month-to-date costs
az costmanagement query \
  --timeframe MonthToDate \
  --type ActualCost \
  --scope "subscriptions/$(az account show --query id -o tsv)" \
  --dataset '{"aggregation":{"totalCost":{"name":"PreTaxCost","function":"Sum"}},"granularity":"None"}' \
  --output table
```

### Budget Alerts

The deployment automatically creates a $50/month budget with alerts. You'll receive notifications when:
- 80% of budget is reached ($40)
- 100% of budget is reached ($50)

## 🛠️ Troubleshooting

### Issue: Azure CLI not found

```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Verify installation
az --version
```

### Issue: Permission errors

```bash
# Check your Azure permissions
az role assignment list --assignee $(az account show --query user.name -o tsv) --output table

# Ensure the script is executable
chmod +x deploy-ultracore-optimized.sh
```

### Issue: Deployment fails mid-way

```bash
# Check what resources were created
az group list --output table

# Delete the failed deployment
az group delete --name ultracore-development-rg --yes --no-wait

# Retry deployment
./deploy-ultracore-optimized.sh development
```

### Issue: Quota limits exceeded

```bash
# Check quotas for your region
az vm list-usage --location uksouth --output table

# Try a different region by editing LOCATION in the script
# Popular alternatives: eastus, westeurope, westus2
```

### Issue: Resource name conflicts

The script uses timestamps to avoid naming conflicts. If you still encounter issues:

```bash
# Clean up old resources
az group delete --name ultracore-development-rg --yes --no-wait

# Wait a few minutes, then retry
./deploy-ultracore-optimized.sh development
```

## 🔐 Security Best Practices

1. **Key Vault RBAC**: All secrets are stored in Azure Key Vault with RBAC enabled
2. **Managed Identities**: Use managed identities for service-to-service auth (future enhancement)
3. **TLS Enforcement**: All Redis and storage connections use TLS 1.2+
4. **Network Security**: Configure network policies for production deployments
5. **Secret Rotation**: Regularly rotate secrets stored in Key Vault

## 📈 Scaling Configuration

### Development Environment
- **Min Replicas**: 0 (scale-to-zero when idle)
- **Max Replicas**: 5 (Dashboard), 3 (Actions)
- **CPU**: 0.5 cores per replica
- **Memory**: 1.0 GiB per replica
- **Scale Trigger**: HTTP requests (10 concurrent)

### Production Environment
- **Min Replicas**: 1 (always available)
- **Max Replicas**: 5 (Dashboard), 3 (Actions)
- **CPU**: 1.0 cores per replica
- **Memory**: 2.0 GiB per replica
- **Scale Trigger**: HTTP requests (10 concurrent)

## 🧹 Cleanup

To remove all deployed resources:

```bash
# Development environment
az group delete --name ultracore-development-rg --yes --no-wait

# Production environment
az group delete --name ultracore-production-rg --yes --no-wait
```

## 🛠️ Developer Tools

UltraCore includes powerful CLI tools for development and management:

### ultracore-cli.sh
Unified command-line interface for all APIs:
```bash
./ultracore-cli.sh deploy ACCURACY intake-stack
./ultracore-cli.sh jobe-insights ACCURACY
./ultracore-cli.sh status-all
```

### Automated Testing
```bash
node scripts/test-endpoints.js
```
Runs 15+ automated tests across all endpoints.

### Real-Time Monitoring
```bash
./scripts/monitor.sh
```
Live dashboard showing service health, resource usage, and activity.

### Database Management
```bash
./scripts/db-manager.sh backup
./scripts/db-manager.sh stats
```
Complete database backup, restore, and management utilities.

**See [TOOLS.md](./TOOLS.md) for complete documentation.**

## 📚 Additional Resources

- **[LOCAL-DEVELOPMENT.md](./LOCAL-DEVELOPMENT.md)** - Local development guide
- **[TOOLS.md](./TOOLS.md)** - Developer tools documentation
- [Azure Container Apps Documentation](https://learn.microsoft.com/azure/container-apps/)
- [Azure Cosmos DB Pricing](https://azure.microsoft.com/pricing/details/cosmos-db/)
- [Azure Cache for Redis Pricing](https://azure.microsoft.com/pricing/details/cache/)
- [Azure Cost Management](https://learn.microsoft.com/azure/cost-management-billing/)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Azure service health status
3. Consult Azure documentation
4. Contact your Azure support team

## 📝 License

This deployment script is provided as-is for the UltraCore platform deployment.

---

**Built with ❤️ for cost-efficient cloud deployments**
