#!/bin/bash

# UltraCore Azure Deployment for allin50zoho
# Personalized deployment script with your Azure credentials

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🚀 ULTRACORE DEPLOYMENT FOR ALLIN50ZOHO"
echo "========================================"
echo ""

# Your Azure Details
TENANT_ID="3b31cccf-408c-4b4e-b12f-c2aeee74d40b"
PRIMARY_DOMAIN="allin50zoho.onmicrosoft.com"
AZURE_ACCOUNT="allin50zoho"

echo -e "${BLUE}Azure Account:${NC}  $AZURE_ACCOUNT"
echo -e "${BLUE}Tenant ID:${NC}     $TENANT_ID"
echo -e "${BLUE}Domain:${NC}        $PRIMARY_DOMAIN"
echo ""

# ====================================================================
# STEP 1: CHECK PREREQUISITES
# ====================================================================
echo -e "${BLUE}📋 Step 1: Checking Prerequisites${NC}"

# Check Azure CLI
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI not found${NC}"
    echo ""
    echo "Please install Azure CLI:"
    echo ""
    echo "Ubuntu/Debian:"
    echo "  curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash"
    echo ""
    echo "macOS:"
    echo "  brew install azure-cli"
    echo ""
    echo "Windows:"
    echo "  Download from: https://aka.ms/installazurecliwindows"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ Azure CLI found${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found${NC}"
    echo ""
    echo "Please install Docker:"
    echo ""
    echo "Ubuntu:"
    echo "  sudo apt-get install docker.io"
    echo ""
    echo "macOS:"
    echo "  brew install --cask docker"
    echo ""
    echo "Windows:"
    echo "  Download from: https://www.docker.com/products/docker-desktop"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ Docker found${NC}"

# Check if Docker is running
if ! docker ps &> /dev/null; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo ""
    echo "Please start Docker:"
    echo "  - On Linux: sudo systemctl start docker"
    echo "  - On macOS/Windows: Start Docker Desktop"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"

echo ""

# ====================================================================
# STEP 2: LOGIN TO AZURE
# ====================================================================
echo -e "${BLUE}🔐 Step 2: Logging into Azure${NC}"

# Check if already logged in to correct tenant
CURRENT_TENANT=$(az account show --query tenantId -o tsv 2>/dev/null || echo "")

if [ "$CURRENT_TENANT" = "$TENANT_ID" ]; then
    echo -e "${GREEN}✅ Already logged into correct tenant${NC}"
else
    echo "Logging in to tenant: $TENANT_ID"
    echo ""

    # Login with tenant
    az login --tenant $TENANT_ID

    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Login failed${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Login successful${NC}"
fi

# Display account info
echo ""
echo -e "${BLUE}Current Azure Account:${NC}"
az account show --query "{subscription:name, id:id, tenant:tenantId}" -o table

echo ""

# ====================================================================
# STEP 3: SELECT SUBSCRIPTION
# ====================================================================
echo -e "${BLUE}📋 Step 3: Available Subscriptions${NC}"
az account list --query "[].{Name:name, SubscriptionId:id, State:state}" -o table

echo ""
echo "If you have multiple subscriptions, you may want to set one:"
echo "  az account set --subscription \"Your-Subscription-Name\""
echo ""
read -p "Press Enter to continue with current subscription, or Ctrl+C to exit and change subscription..."
echo ""

# ====================================================================
# STEP 4: RUN DEPLOYMENT
# ====================================================================
echo -e "${BLUE}🚀 Step 4: Starting Deployment${NC}"
echo ""

# Choose environment
echo "Select deployment environment:"
echo "  1) Development (Scale-to-zero, cost ~\$30-50/month)"
echo "  2) Production (Always-on, cost ~\$100-200/month)"
echo ""
read -p "Enter choice [1-2] (default: 1): " ENV_CHOICE
ENV_CHOICE=${ENV_CHOICE:-1}

if [ "$ENV_CHOICE" = "2" ]; then
    ENVIRONMENT="production"
else
    ENVIRONMENT="development"
fi

echo ""
echo -e "${YELLOW}Deploying to: $ENVIRONMENT${NC}"
echo ""
read -p "Continue? [y/N]: " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

echo ""
echo -e "${GREEN}Starting deployment...${NC}"
echo ""

# Run the actual deployment script
./deploy-ultracore-optimized-v2.sh $ENVIRONMENT

# ====================================================================
# STEP 5: POST-DEPLOYMENT
# ====================================================================
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL!${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════${NC}"
    echo ""

    # Find deployment file
    DEPLOY_FILE=$(ls -t deployment-$ENVIRONMENT-*.json 2>/dev/null | head -1)

    if [ -f "$DEPLOY_FILE" ]; then
        echo -e "${BLUE}Deployment info saved to: $DEPLOY_FILE${NC}"
        echo ""

        # Run validation
        echo -e "${YELLOW}Running validation tests...${NC}"
        echo ""
        ./validate-deployment.sh "$DEPLOY_FILE"

        echo ""
        echo -e "${BLUE}Next Steps:${NC}"
        echo "1. Monitor deployment:"
        echo "   ./monitor-azure-deployment.sh $DEPLOY_FILE --once"
        echo ""
        echo "2. View in Azure Portal:"
        echo "   https://portal.azure.com"
        echo ""
        echo "3. When done testing, cleanup to avoid costs:"
        RESOURCE_GROUP=$(jq -r '.resourceGroup' $DEPLOY_FILE)
        echo "   az group delete --name $RESOURCE_GROUP --yes --no-wait"
        echo ""
    fi
else
    echo ""
    echo -e "${RED}════════════════════════════════════════════════${NC}"
    echo -e "${RED}❌ DEPLOYMENT FAILED${NC}"
    echo -e "${RED}════════════════════════════════════════════════${NC}"
    echo ""
    echo "Please check the error messages above."
    echo "For troubleshooting, see: AZURE-DEPLOYMENT-GUIDE.md"
    echo ""
    exit 1
fi
