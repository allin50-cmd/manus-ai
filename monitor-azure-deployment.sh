#!/bin/bash

# UltraCore Azure Deployment Monitor
# Real-time monitoring of Azure Container Apps, PostgreSQL, Redis, and Application Insights

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Check if deployment info file is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Usage: $0 <deployment-info-file.json> [--once]${NC}"
    echo "   Example: $0 deployment-development-123456.json"
    echo "   --once: Run once and exit (no continuous monitoring)"
    exit 1
fi

DEPLOY_FILE="$1"
ONCE_MODE="$2"

if [ ! -f "$DEPLOY_FILE" ]; then
    echo -e "${RED}❌ Deployment file not found: $DEPLOY_FILE${NC}"
    exit 1
fi

# Parse deployment info
RESOURCE_GROUP=$(jq -r '.resourceGroup' $DEPLOY_FILE)
ACTIONS_APP=$(jq -r '.services.actionsApi.name' $DEPLOY_FILE)
JOBE_APP=$(jq -r '.services.jobeApi.name' $DEPLOY_FILE)
ACTIONS_URL=$(jq -r '.services.actionsApi.url' $DEPLOY_FILE)
JOBE_URL=$(jq -r '.services.jobeApi.url' $DEPLOY_FILE)
POSTGRES_SERVER=$(jq -r '.services.postgresql.server' $DEPLOY_FILE)
REDIS_NAME=$(jq -r '.services.redis.name' $DEPLOY_FILE)
ENVIRONMENT=$(jq -r '.environment' $DEPLOY_FILE)

# Function to get container app metrics
get_container_metrics() {
    local app_name="$1"
    local app_type="$2"

    # Get replica count
    REPLICA_COUNT=$(az containerapp revision list \
        --name $app_name \
        --resource-group $RESOURCE_GROUP \
        --query "[0].properties.replicas" \
        -o tsv 2>/dev/null || echo "N/A")

    # Get provisioning state
    PROVISIONING_STATE=$(az containerapp show \
        --name $app_name \
        --resource-group $RESOURCE_GROUP \
        --query "properties.provisioningState" \
        -o tsv 2>/dev/null || echo "Unknown")

    # Get running state
    RUNNING_STATE=$(az containerapp show \
        --name $app_name \
        --resource-group $RESOURCE_GROUP \
        --query "properties.runningStatus" \
        -o tsv 2>/dev/null || echo "Unknown")

    # Determine status color
    if [ "$PROVISIONING_STATE" = "Succeeded" ] && [ "$RUNNING_STATE" = "Running" ]; then
        STATUS_COLOR=$GREEN
        STATUS="✅ Healthy"
    elif [ "$PROVISIONING_STATE" = "InProgress" ]; then
        STATUS_COLOR=$YELLOW
        STATUS="⚙️  In Progress"
    else
        STATUS_COLOR=$RED
        STATUS="❌ Error"
    fi

    echo -e "${BLUE}${app_type}:${NC}"
    echo -e "  Status:          ${STATUS_COLOR}${STATUS}${NC}"
    echo -e "  Replicas:        ${REPLICA_COUNT}"
    echo -e "  Provisioning:    ${PROVISIONING_STATE}"
    echo -e "  Running:         ${RUNNING_STATE}"
}

# Function to check HTTP endpoint
check_http_endpoint() {
    local name="$1"
    local url="$2"

    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $url 2>/dev/null || echo "000")

    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${BLUE}${name}:${NC} ${GREEN}✅ UP${NC} (HTTP $HTTP_CODE)"
    elif [ "$HTTP_CODE" = "000" ]; then
        echo -e "${BLUE}${name}:${NC} ${RED}❌ DOWN${NC} (Connection failed)"
    else
        echo -e "${BLUE}${name}:${NC} ${YELLOW}⚠️  Degraded${NC} (HTTP $HTTP_CODE)"
    fi
}

# Function to get PostgreSQL metrics
get_postgres_metrics() {
    # Check if server is running
    STATE=$(az postgres flexible-server show \
        --name $POSTGRES_SERVER \
        --resource-group $RESOURCE_GROUP \
        --query "state" \
        -o tsv 2>/dev/null || echo "Unknown")

    # Get storage used
    STORAGE_USED=$(az postgres flexible-server show \
        --name $POSTGRES_SERVER \
        --resource-group $RESOURCE_GROUP \
        --query "storage.storageSizeGB" \
        -o tsv 2>/dev/null || echo "N/A")

    if [ "$STATE" = "Ready" ]; then
        STATUS="${GREEN}✅ Ready${NC}"
    else
        STATUS="${YELLOW}⚠️  $STATE${NC}"
    fi

    echo -e "${BLUE}PostgreSQL:${NC}"
    echo -e "  Status:          ${STATUS}"
    echo -e "  Storage:         ${STORAGE_USED} GB"
}

# Function to get Redis metrics
get_redis_metrics() {
    # Check Redis status
    REDIS_STATE=$(az redis show \
        --name $REDIS_NAME \
        --resource-group $RESOURCE_GROUP \
        --query "provisioningState" \
        -o tsv 2>/dev/null || echo "Unknown")

    if [ "$REDIS_STATE" = "Succeeded" ]; then
        STATUS="${GREEN}✅ Running${NC}"
    else
        STATUS="${YELLOW}⚠️  $REDIS_STATE${NC}"
    fi

    echo -e "${BLUE}Redis Cache:${NC}"
    echo -e "  Status:          ${STATUS}"
}

# Main monitoring loop
monitor_deployment() {
    while true; do
        clear
        echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
        echo -e "${CYAN}🔍 ULTRACORE AZURE DEPLOYMENT MONITOR${NC}"
        echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"
        echo ""
        echo -e "${BLUE}Environment:${NC}      $ENVIRONMENT"
        echo -e "${BLUE}Resource Group:${NC}   $RESOURCE_GROUP"
        echo -e "${BLUE}Timestamp:${NC}        $(date '+%Y-%m-%d %H:%M:%S')"
        echo ""

        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}CONTAINER APPS${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""

        get_container_metrics "$ACTIONS_APP" "Actions API"
        echo ""
        get_container_metrics "$JOBE_APP" "Jobe AI API"
        echo ""

        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}HTTP ENDPOINTS${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""

        check_http_endpoint "Actions API Health" "$ACTIONS_URL/health"
        check_http_endpoint "Jobe AI Health" "$JOBE_URL/health"
        echo ""

        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}DATA SERVICES${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""

        get_postgres_metrics
        echo ""
        get_redis_metrics
        echo ""

        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}RESOURCE USAGE${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""

        # Get resource count
        RESOURCE_COUNT=$(az resource list --resource-group $RESOURCE_GROUP --query "length(@)" -o tsv 2>/dev/null || echo "N/A")
        echo -e "${BLUE}Total Resources:${NC} $RESOURCE_COUNT"
        echo ""

        if [ "$ONCE_MODE" = "--once" ]; then
            echo -e "${GREEN}✅ Single check complete${NC}"
            break
        fi

        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${CYAN}Press Ctrl+C to exit | Refreshing in 10 seconds...${NC}"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

        sleep 10
    done
}

# Run monitoring
monitor_deployment
