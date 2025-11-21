#!/bin/bash
set -e

# UltraCore Optimized Azure Deployment v2.0
# Complete deployment with ACR, PostgreSQL, Application Insights, and real applications
echo "🚀 ULTRACORE OPTIMIZED AZURE DEPLOYMENT v2.0"
echo "============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
ENVIRONMENT="${1:-development}"  # development or production
RESOURCE_GROUP="ultracore-${ENVIRONMENT}-rg"
LOCATION="uksouth"
TIMESTAMP=$(date +%s | tail -c 6)  # Last 6 digits of timestamp
ACR_NAME="ultracore${TIMESTAMP}"  # ACR names must be globally unique
DASHBOARD_APP="uc-dash-${TIMESTAMP}"
ACTIONS_APP="uc-actions-${TIMESTAMP}"
JOBE_APP="uc-jobe-${TIMESTAMP}"
KEY_VAULT_NAME="uc-kv-${TIMESTAMP}"
POSTGRES_SERVER="uc-pg-${TIMESTAMP}"
STORAGE_NAME="ucst${TIMESTAMP}"
REDIS_NAME="uc-cache-${TIMESTAMP}"
INSIGHTS_NAME="uc-insights-${TIMESTAMP}"

# PostgreSQL credentials (generate secure password)
POSTGRES_ADMIN_USER="ucadmin"
POSTGRES_ADMIN_PASSWORD="UltraCore$(openssl rand -base64 12 | tr -d '=+/' | cut -c1-16)!"
POSTGRES_DB="ultracore"

# Environment-based scaling
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${BLUE}🏭 PRODUCTION MODE${NC}"
    MIN_REPLICAS=1
    MAX_REPLICAS=10
    CPU="1.0"
    MEMORY="2.0Gi"
    POSTGRES_SKU="Standard_B2s"  # 2 vCores, 4GB RAM
    POSTGRES_STORAGE=32  # 32GB
else
    echo -e "${BLUE}💻 DEVELOPMENT MODE (Cost-Optimized)${NC}"
    MIN_REPLICAS=0  # ⭐ SCALE TO ZERO
    MAX_REPLICAS=5
    CPU="0.5"
    MEMORY="1.0Gi"
    POSTGRES_SKU="Standard_B1ms"  # 1 vCore, 2GB RAM
    POSTGRES_STORAGE=32  # 32GB
fi

echo -e "${BLUE}📝 Deployment Configuration:${NC}"
echo "Environment: $ENVIRONMENT"
echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION"
echo "ACR: $ACR_NAME"
echo "PostgreSQL: $POSTGRES_SERVER"
echo "Dashboard: $DASHBOARD_APP"
echo "Actions: $ACTIONS_APP"
echo "Jobe AI: $JOBE_APP"
echo ""

# ====================================================================
# PREREQUISITE CHECKS
# ====================================================================
echo -e "${BLUE}🔍 Step 1: Checking Prerequisites${NC}"

# Check Azure CLI
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI not found${NC}"
    echo "   Install from: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi
echo -e "${GREEN}✅ Azure CLI found ($(az version --query '\"azure-cli\"' -o tsv))${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found${NC}"
    echo "   Install from: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✅ Docker found ($(docker --version | cut -d' ' -f3 | tr -d ','))${NC}"

# Check if logged into Azure
if ! az account show &> /dev/null; then
    echo -e "${RED}❌ Not logged into Azure${NC}"
    echo "   Run: az login"
    exit 1
fi
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
echo -e "${GREEN}✅ Logged into Azure${NC}"
echo "   Subscription: $SUBSCRIPTION_NAME"
echo "   ID: $SUBSCRIPTION_ID"
echo ""

# ====================================================================
# STEP 2: CREATE RESOURCE GROUP
# ====================================================================
echo -e "${BLUE}🏗️  Step 2: Creating Resource Group${NC}"
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION \
  --tags Environment=$ENVIRONMENT Project=UltraCore ManagedBy=Script \
  --output none

echo -e "${GREEN}✅ Resource Group created${NC}"
echo ""

# ====================================================================
# STEP 3: CREATE AZURE CONTAINER REGISTRY
# ====================================================================
echo -e "${BLUE}📦 Step 3: Creating Azure Container Registry${NC}"

az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true \
  --location $LOCATION \
  --output none

echo -e "${GREEN}✅ Container Registry created${NC}"

# Get ACR credentials
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer -o tsv)
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)

echo "   Login Server: $ACR_LOGIN_SERVER"
echo ""

# ====================================================================
# STEP 4: BUILD AND PUSH DOCKER IMAGES
# ====================================================================
echo -e "${BLUE}🐳 Step 4: Building and Pushing Docker Images${NC}"

# Login to ACR
echo "$ACR_PASSWORD" | docker login $ACR_LOGIN_SERVER --username $ACR_USERNAME --password-stdin

# Build Actions API
echo -e "${YELLOW}   Building Actions API...${NC}"
docker build -f Dockerfile.actions -t $ACR_LOGIN_SERVER/actions-api:latest -t $ACR_LOGIN_SERVER/actions-api:$TIMESTAMP .
docker push $ACR_LOGIN_SERVER/actions-api:latest
docker push $ACR_LOGIN_SERVER/actions-api:$TIMESTAMP
echo -e "${GREEN}   ✅ Actions API pushed${NC}"

# Build Jobe AI API
echo -e "${YELLOW}   Building Jobe AI API...${NC}"
docker build -f Dockerfile.jobe -t $ACR_LOGIN_SERVER/jobe-api:latest -t $ACR_LOGIN_SERVER/jobe-api:$TIMESTAMP .
docker push $ACR_LOGIN_SERVER/jobe-api:latest
docker push $ACR_LOGIN_SERVER/jobe-api:$TIMESTAMP
echo -e "${GREEN}   ✅ Jobe AI API pushed${NC}"

echo -e "${GREEN}✅ All images built and pushed${NC}"
echo ""

# ====================================================================
# STEP 5: DEPLOY CORE INFRASTRUCTURE
# ====================================================================
echo -e "${BLUE}☁️  Step 5: Deploying Core Infrastructure${NC}"

# Create Application Insights
az monitor app-insights component create \
  --app $INSIGHTS_NAME \
  --location $LOCATION \
  --resource-group $RESOURCE_GROUP \
  --application-type web \
  --output none

INSTRUMENTATION_KEY=$(az monitor app-insights component show \
  --app $INSIGHTS_NAME \
  --resource-group $RESOURCE_GROUP \
  --query instrumentationKey \
  --output tsv)

echo -e "${GREEN}   ✅ Application Insights created${NC}"

# Create Key Vault
az keyvault create \
  --name $KEY_VAULT_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --enable-rbac-authorization false \
  --enabled-for-deployment true \
  --output none

echo -e "${GREEN}   ✅ Key Vault created${NC}"

# Create Storage Account
az storage account create \
  --name $STORAGE_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS \
  --kind StorageV2 \
  --output none

STORAGE_CONNECTION=$(az storage account show-connection-string \
  --name $STORAGE_NAME \
  --resource-group $RESOURCE_GROUP \
  --query connectionString \
  --output tsv)

echo -e "${GREEN}   ✅ Storage Account created${NC}"

# Create Redis Cache
az redis create \
  --name $REDIS_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Basic \
  --vm-size c0 \
  --enable-non-ssl-port false \
  --minimum-tls-version 1.2 \
  --output none

REDIS_HOST=$(az redis show \
  --name $REDIS_NAME \
  --resource-group $RESOURCE_GROUP \
  --query hostName \
  --output tsv)

REDIS_KEY=$(az redis list-keys \
  --name $REDIS_NAME \
  --resource-group $RESOURCE_GROUP \
  --query primaryKey \
  --output tsv)

echo -e "${GREEN}   ✅ Redis Cache created${NC}"

# Create PostgreSQL Flexible Server
az postgres flexible-server create \
  --name $POSTGRES_SERVER \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --admin-user $POSTGRES_ADMIN_USER \
  --admin-password "$POSTGRES_ADMIN_PASSWORD" \
  --sku-name $POSTGRES_SKU \
  --tier Burstable \
  --version 15 \
  --storage-size $POSTGRES_STORAGE \
  --public-access 0.0.0.0-255.255.255.255 \
  --output none

POSTGRES_HOST="${POSTGRES_SERVER}.postgres.database.azure.com"

echo -e "${GREEN}   ✅ PostgreSQL Server created${NC}"

# Create database
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name $POSTGRES_SERVER \
  --database-name $POSTGRES_DB \
  --output none

echo -e "${GREEN}   ✅ PostgreSQL Database created${NC}"

# Initialize database schema
echo -e "${YELLOW}   Initializing database schema...${NC}"
PGPASSWORD="$POSTGRES_ADMIN_PASSWORD" psql \
  -h $POSTGRES_HOST \
  -U $POSTGRES_ADMIN_USER \
  -d $POSTGRES_DB \
  -c "
CREATE TABLE IF NOT EXISTS deployments (
    id SERIAL PRIMARY KEY,
    tenant VARCHAR(255) NOT NULL,
    bundle VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    tenant_code VARCHAR(255) UNIQUE NOT NULL,
    tenant_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bundles (
    id SERIAL PRIMARY KEY,
    bundle_id VARCHAR(255) UNIQUE NOT NULL,
    bundle_name VARCHAR(255) NOT NULL,
    description TEXT,
    services JSONB,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deployments_tenant ON deployments(tenant);
CREATE INDEX IF NOT EXISTS idx_deployments_created_at ON deployments(created_at);
CREATE INDEX IF NOT EXISTS idx_tenants_code ON tenants(tenant_code);
" 2>/dev/null || echo -e "${YELLOW}   ⚠️  Database initialization skipped (psql not available)${NC}"

echo -e "${GREEN}✅ Core infrastructure deployed${NC}"
echo ""

# ====================================================================
# STEP 6: STORE SECRETS IN KEY VAULT
# ====================================================================
echo -e "${BLUE}🔐 Step 6: Storing Secrets in Key Vault${NC}"

# Get current user Object ID for Key Vault access
CURRENT_USER_ID=$(az ad signed-in-user show --query id -o tsv)
az keyvault set-policy \
  --name $KEY_VAULT_NAME \
  --object-id $CURRENT_USER_ID \
  --secret-permissions get set list delete \
  --output none

# Store secrets
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "postgres-host" --value "$POSTGRES_HOST" --output none
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "postgres-user" --value "$POSTGRES_ADMIN_USER" --output none
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "postgres-password" --value "$POSTGRES_ADMIN_PASSWORD" --output none
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "postgres-db" --value "$POSTGRES_DB" --output none
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "redis-host" --value "$REDIS_HOST" --output none
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "redis-key" --value "$REDIS_KEY" --output none
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "storage-connection" --value "$STORAGE_CONNECTION" --output none
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "insights-key" --value "$INSTRUMENTATION_KEY" --output none
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "acr-password" --value "$ACR_PASSWORD" --output none

echo -e "${GREEN}✅ Secrets stored in Key Vault${NC}"
echo ""

# ====================================================================
# STEP 7: CREATE CONTAINER APPS ENVIRONMENT
# ====================================================================
echo -e "${BLUE}🌐 Step 7: Creating Container Apps Environment${NC}"

CONTAINER_ENV="ultracore-env-${TIMESTAMP}"

az containerapp env create \
  --name $CONTAINER_ENV \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --logs-destination none \
  --output none

echo -e "${GREEN}✅ Container Apps Environment created${NC}"
echo ""

# ====================================================================
# STEP 8: DEPLOY CONTAINER APPS
# ====================================================================
echo -e "${BLUE}🚀 Step 8: Deploying Container Apps${NC}"

# Deploy Actions API
echo -e "${YELLOW}   Deploying Actions API...${NC}"
az containerapp create \
  --name $ACTIONS_APP \
  --resource-group $RESOURCE_GROUP \
  --environment $CONTAINER_ENV \
  --image $ACR_LOGIN_SERVER/actions-api:latest \
  --registry-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password "$ACR_PASSWORD" \
  --target-port 4000 \
  --ingress external \
  --min-replicas $MIN_REPLICAS \
  --max-replicas $MAX_REPLICAS \
  --cpu $CPU \
  --memory $MEMORY \
  --env-vars \
    "NODE_ENV=$ENVIRONMENT" \
    "PORT=4000" \
    "POSTGRES_HOST=$POSTGRES_HOST" \
    "POSTGRES_PORT=5432" \
    "POSTGRES_DB=$POSTGRES_DB" \
    "POSTGRES_USER=$POSTGRES_ADMIN_USER" \
    "POSTGRES_PASSWORD=$POSTGRES_ADMIN_PASSWORD" \
    "REDIS_HOST=$REDIS_HOST" \
    "REDIS_PORT=6380" \
    "REDIS_PASSWORD=$REDIS_KEY" \
    "APPINSIGHTS_INSTRUMENTATIONKEY=$INSTRUMENTATION_KEY" \
  --output none

ACTIONS_URL=$(az containerapp show \
  --name $ACTIONS_APP \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

echo -e "${GREEN}   ✅ Actions API deployed: https://$ACTIONS_URL${NC}"

# Deploy Jobe AI API
echo -e "${YELLOW}   Deploying Jobe AI API...${NC}"
az containerapp create \
  --name $JOBE_APP \
  --resource-group $RESOURCE_GROUP \
  --environment $CONTAINER_ENV \
  --image $ACR_LOGIN_SERVER/jobe-api:latest \
  --registry-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password "$ACR_PASSWORD" \
  --target-port 3000 \
  --ingress external \
  --min-replicas $MIN_REPLICAS \
  --max-replicas $MAX_REPLICAS \
  --cpu $CPU \
  --memory $MEMORY \
  --env-vars \
    "NODE_ENV=$ENVIRONMENT" \
    "JOBE_PORT=3000" \
    "POSTGRES_HOST=$POSTGRES_HOST" \
    "POSTGRES_PORT=5432" \
    "POSTGRES_DB=$POSTGRES_DB" \
    "POSTGRES_USER=$POSTGRES_ADMIN_USER" \
    "POSTGRES_PASSWORD=$POSTGRES_ADMIN_PASSWORD" \
    "APPINSIGHTS_INSTRUMENTATIONKEY=$INSTRUMENTATION_KEY" \
  --output none

JOBE_URL=$(az containerapp show \
  --name $JOBE_APP \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn \
  --output tsv)

echo -e "${GREEN}   ✅ Jobe AI API deployed: https://$JOBE_URL${NC}"

echo -e "${GREEN}✅ All Container Apps deployed${NC}"
echo ""

# ====================================================================
# STEP 9: CONFIGURE MONITORING AND ALERTS
# ====================================================================
echo -e "${BLUE}📊 Step 9: Configuring Monitoring and Alerts${NC}"

# Create budget alert (if supported)
az consumption budget create \
  --amount 100 \
  --category cost \
  --time-grain monthly \
  --resource-group $RESOURCE_GROUP \
  --budget-name "UltraCore-${ENVIRONMENT}-Budget" \
  --output none 2>/dev/null || echo -e "${YELLOW}   ⚠️  Budget creation skipped (may require billing permissions)${NC}"

echo -e "${GREEN}✅ Monitoring configured${NC}"
echo ""

# ====================================================================
# STEP 10: SAVE DEPLOYMENT INFO
# ====================================================================
echo -e "${BLUE}💾 Step 10: Saving Deployment Information${NC}"

DEPLOY_INFO_FILE="deployment-${ENVIRONMENT}-${TIMESTAMP}.json"
cat > $DEPLOY_INFO_FILE << EOF
{
  "environment": "$ENVIRONMENT",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "resourceGroup": "$RESOURCE_GROUP",
  "location": "$LOCATION",
  "subscriptionId": "$SUBSCRIPTION_ID",
  "services": {
    "acr": {
      "name": "$ACR_NAME",
      "loginServer": "$ACR_LOGIN_SERVER"
    },
    "actionsApi": {
      "name": "$ACTIONS_APP",
      "url": "https://$ACTIONS_URL"
    },
    "jobeApi": {
      "name": "$JOBE_APP",
      "url": "https://$JOBE_URL"
    },
    "postgresql": {
      "server": "$POSTGRES_SERVER",
      "host": "$POSTGRES_HOST",
      "database": "$POSTGRES_DB",
      "username": "$POSTGRES_ADMIN_USER"
    },
    "redis": {
      "name": "$REDIS_NAME",
      "host": "$REDIS_HOST"
    },
    "keyVault": {
      "name": "$KEY_VAULT_NAME"
    },
    "appInsights": {
      "name": "$INSIGHTS_NAME"
    },
    "storage": {
      "name": "$STORAGE_NAME"
    }
  }
}
EOF

echo -e "${GREEN}✅ Deployment info saved to: $DEPLOY_INFO_FILE${NC}"
echo ""

# ====================================================================
# DEPLOYMENT COMPLETE
# ====================================================================
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ ULTRACORE DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📊 DEPLOYMENT SUMMARY${NC}"
echo "=========================================="
echo -e "${GREEN}Environment:${NC}      $ENVIRONMENT"
echo -e "${GREEN}Resource Group:${NC}   $RESOURCE_GROUP"
echo -e "${GREEN}Location:${NC}         $LOCATION"
echo ""
echo -e "${BLUE}🌐 SERVICE ENDPOINTS${NC}"
echo "=========================================="
echo -e "${GREEN}Actions API:${NC}      https://$ACTIONS_URL"
echo -e "${GREEN}Jobe AI API:${NC}      https://$JOBE_URL"
echo -e "${GREEN}ACR:${NC}              $ACR_LOGIN_SERVER"
echo -e "${GREEN}PostgreSQL:${NC}       $POSTGRES_HOST"
echo -e "${GREEN}Redis:${NC}            $REDIS_HOST"
echo -e "${GREEN}Key Vault:${NC}        $KEY_VAULT_NAME"
echo -e "${GREEN}App Insights:${NC}     $INSIGHTS_NAME"
echo ""
echo -e "${BLUE}🧪 QUICK TEST COMMANDS${NC}"
echo "=========================================="
echo ""
echo "# Test Actions API Health"
echo "curl https://$ACTIONS_URL/health"
echo ""
echo "# List Bundles"
echo "curl -X POST https://$ACTIONS_URL/api/actions \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"action\":\"bundles.list\",\"payload\":{}}'"
echo ""
echo "# Deploy Bundle (Dry Run)"
echo "curl -X POST https://$ACTIONS_URL/api/actions \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"action\":\"deploy.bundle\",\"payload\":{\"tenant\":\"DEMO\",\"bundle\":\"intake-stack\",\"dryRun\":true}}'"
echo ""
echo "# Test Jobe AI"
echo "curl https://$JOBE_URL/health"
echo ""
echo "# Jobe Tenant Insights"
echo "curl -X POST https://$JOBE_URL/api/jobe/tenant-insights \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"tenant\":\"DEMO\"}'"
echo ""
echo -e "${BLUE}🔐 CREDENTIALS${NC}"
echo "=========================================="
echo -e "${YELLOW}PostgreSQL Admin User:${NC}     $POSTGRES_ADMIN_USER"
echo -e "${YELLOW}PostgreSQL Admin Password:${NC} Stored in Key Vault ($KEY_VAULT_NAME/postgres-password)"
echo -e "${YELLOW}Retrieve password:${NC}"
echo "az keyvault secret show --vault-name $KEY_VAULT_NAME --name postgres-password --query value -o tsv"
echo ""
echo -e "${BLUE}🗑️  CLEANUP COMMAND${NC}"
echo "=========================================="
echo "az group delete --name $RESOURCE_GROUP --yes --no-wait"
echo ""
echo -e "${GREEN}✨ Deployment information saved to: $DEPLOY_INFO_FILE${NC}"
echo ""
