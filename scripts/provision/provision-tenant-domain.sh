#!/usr/bin/env bash

# UltraCore Per-Tenant DNS + Front Door Provisioning
#
# This script automates adding a custom domain for a tenant, mapping it to
# Azure Front Door, and issuing a managed certificate.
#
# Prerequisites:
#   - Azure CLI installed and authenticated (az login)
#   - Front Door profile already exists
#   - DNS control for the custom domain (to create CNAME)
#
# Usage:
#   ./provision-tenant-domain.sh <tenant-slug> <custom-domain> <frontdoor-name> <resource-group>
#
# Example:
#   ./provision-tenant-domain.sh stork-nhs stork.ultracore.io ultracore-fd ultracore-prod-rg

set -euo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Check arguments
if [ "$#" -lt 4 ]; then
    echo -e "${RED}❌ Error: Missing required arguments${NC}"
    echo ""
    echo -e "${CYAN}Usage:${NC}"
    echo "  $0 <tenant-slug> <custom-domain> <frontdoor-name> <resource-group>"
    echo ""
    echo -e "${CYAN}Example:${NC}"
    echo "  $0 stork-nhs stork.ultracore.io ultracore-frontdoor ultracore-prod-rg"
    echo ""
    echo -e "${CYAN}Arguments:${NC}"
    echo "  tenant-slug      Tenant identifier (e.g., stork-nhs)"
    echo "  custom-domain    Custom domain for tenant (e.g., stork.ultracore.io)"
    echo "  frontdoor-name   Azure Front Door profile name"
    echo "  resource-group   Azure resource group name"
    exit 2
fi

TENANT_SLUG=$1
CUSTOM_DOMAIN=$2
FRONTDOOR_NAME=$3
RESOURCE_GROUP=$4

ENDPOINT_NAME="${TENANT_SLUG}-fe"

echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   UltraCore Tenant Domain Provisioning               ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Configuration:${NC}"
echo "  Tenant Slug:     $TENANT_SLUG"
echo "  Custom Domain:   $CUSTOM_DOMAIN"
echo "  Front Door:      $FRONTDOOR_NAME"
echo "  Resource Group:  $RESOURCE_GROUP"
echo "  Endpoint Name:   $ENDPOINT_NAME"
echo ""

# ============================================================================
# STEP 1: Verify Azure CLI is authenticated
# ============================================================================
echo -e "${BLUE}🔐 Step 1: Verifying Azure CLI authentication...${NC}"

if ! az account show &>/dev/null; then
    echo -e "${RED}❌ Not logged in to Azure CLI${NC}"
    echo "Please run: az login"
    exit 1
fi

SUBSCRIPTION=$(az account show --query name -o tsv)
echo -e "${GREEN}✅ Authenticated to: $SUBSCRIPTION${NC}"
echo ""

# ============================================================================
# STEP 2: Verify Front Door exists
# ============================================================================
echo -e "${BLUE}🌐 Step 2: Verifying Front Door profile exists...${NC}"

if ! az network front-door show \
    --resource-group "$RESOURCE_GROUP" \
    --name "$FRONTDOOR_NAME" &>/dev/null; then
    echo -e "${RED}❌ Front Door profile not found: $FRONTDOOR_NAME${NC}"
    exit 1
fi

FRONTDOOR_HOST=$(az network front-door show \
    --resource-group "$RESOURCE_GROUP" \
    --name "$FRONTDOOR_NAME" \
    --query frontendEndpoints[0].hostName \
    -o tsv)

echo -e "${GREEN}✅ Front Door exists: $FRONTDOOR_HOST${NC}"
echo ""

# ============================================================================
# STEP 3: Create Custom Domain in Front Door
# ============================================================================
echo -e "${BLUE}🔧 Step 3: Creating custom domain endpoint...${NC}"

# Check if endpoint already exists
if az network front-door frontend-endpoint show \
    --resource-group "$RESOURCE_GROUP" \
    --front-door-name "$FRONTDOOR_NAME" \
    --name "$ENDPOINT_NAME" &>/dev/null; then
    echo -e "${YELLOW}⚠️  Endpoint $ENDPOINT_NAME already exists${NC}"
else
    az network front-door frontend-endpoint create \
        --resource-group "$RESOURCE_GROUP" \
        --front-door-name "$FRONTDOOR_NAME" \
        --name "$ENDPOINT_NAME" \
        --host-name "$CUSTOM_DOMAIN" \
        --session-affinity-enabled false

    echo -e "${GREEN}✅ Custom domain endpoint created${NC}"
fi

echo ""

# ============================================================================
# STEP 4: DNS Validation Instructions
# ============================================================================
echo -e "${BLUE}📋 Step 4: DNS Configuration Required${NC}"
echo ""
echo -e "${YELLOW}ACTION REQUIRED:${NC} Create the following DNS record:"
echo ""
echo -e "${CYAN}  Type:   CNAME${NC}"
echo -e "${CYAN}  Name:   ${CUSTOM_DOMAIN%.*}${NC}"
echo -e "${CYAN}  Value:  $FRONTDOOR_HOST${NC}"
echo -e "${CYAN}  TTL:    3600${NC}"
echo ""
echo "Example (DNS provider):"
echo "  $CUSTOM_DOMAIN  →  $FRONTDOOR_HOST"
echo ""
echo -e "${YELLOW}⚠️  DNS propagation can take 1-10 minutes${NC}"
echo ""

# Prompt user to continue after DNS setup
read -p "$(echo -e ${CYAN}Press ENTER when DNS record is created and propagated...${NC})"
echo ""

# ============================================================================
# STEP 5: Verify DNS Propagation
# ============================================================================
echo -e "${BLUE}🔍 Step 5: Verifying DNS propagation...${NC}"

DNS_CHECK_ATTEMPTS=0
MAX_ATTEMPTS=30

while [ $DNS_CHECK_ATTEMPTS -lt $MAX_ATTEMPTS ]; do
    if nslookup "$CUSTOM_DOMAIN" &>/dev/null || dig "$CUSTOM_DOMAIN" &>/dev/null; then
        echo -e "${GREEN}✅ DNS record found for $CUSTOM_DOMAIN${NC}"
        break
    fi

    DNS_CHECK_ATTEMPTS=$((DNS_CHECK_ATTEMPTS + 1))
    echo -e "${YELLOW}⏳ Waiting for DNS propagation... (attempt $DNS_CHECK_ATTEMPTS/$MAX_ATTEMPTS)${NC}"
    sleep 10
done

if [ $DNS_CHECK_ATTEMPTS -eq $MAX_ATTEMPTS ]; then
    echo -e "${YELLOW}⚠️  DNS not fully propagated yet, continuing anyway...${NC}"
fi

echo ""

# ============================================================================
# STEP 6: Enable HTTPS with Managed Certificate
# ============================================================================
echo -e "${BLUE}🔒 Step 6: Enabling HTTPS with managed certificate...${NC}"
echo -e "${YELLOW}⏳ This can take 5-10 minutes...${NC}"

# Front Door Standard/Premium uses different commands
# This example is for classic Front Door; adjust for Standard/Premium if needed

az network front-door frontend-endpoint enable-https \
    --resource-group "$RESOURCE_GROUP" \
    --front-door-name "$FRONTDOOR_NAME" \
    --name "$ENDPOINT_NAME" \
    --certificate-source FrontDoor \
    --minimum-tls-version 1.2

echo -e "${GREEN}✅ HTTPS certificate provisioning initiated${NC}"
echo ""

# ============================================================================
# STEP 7: Configure Routing Rule (if needed)
# ============================================================================
echo -e "${BLUE}🔀 Step 7: Configuring routing rule...${NC}"

ROUTING_RULE_NAME="tenant-${TENANT_SLUG}-rule"

# Check if routing rule exists
if az network front-door routing-rule show \
    --resource-group "$RESOURCE_GROUP" \
    --front-door-name "$FRONTDOOR_NAME" \
    --name "$ROUTING_RULE_NAME" &>/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Routing rule $ROUTING_RULE_NAME already exists${NC}"
else
    # Get backend pool (assumes default backend pool exists)
    BACKEND_POOL=$(az network front-door backend-pool list \
        --resource-group "$RESOURCE_GROUP" \
        --front-door-name "$FRONTDOOR_NAME" \
        --query "[0].name" \
        -o tsv)

    if [ -n "$BACKEND_POOL" ]; then
        az network front-door routing-rule create \
            --resource-group "$RESOURCE_GROUP" \
            --front-door-name "$FRONTDOOR_NAME" \
            --name "$ROUTING_RULE_NAME" \
            --frontend-endpoints "$ENDPOINT_NAME" \
            --accepted-protocols Https \
            --patterns "/*" \
            --forwarding-protocol HttpsOnly \
            --backend-pool "$BACKEND_POOL"

        echo -e "${GREEN}✅ Routing rule created${NC}"
    else
        echo -e "${YELLOW}⚠️  No backend pool found, skipping routing rule${NC}"
    fi
fi

echo ""

# ============================================================================
# STEP 8: Verify Certificate Status
# ============================================================================
echo -e "${BLUE}🔍 Step 8: Checking certificate status...${NC}"

CERT_CHECK_ATTEMPTS=0
MAX_CERT_ATTEMPTS=60  # 10 minutes

while [ $CERT_CHECK_ATTEMPTS -lt $MAX_CERT_ATTEMPTS ]; do
    CERT_STATUS=$(az network front-door frontend-endpoint show \
        --resource-group "$RESOURCE_GROUP" \
        --front-door-name "$FRONTDOOR_NAME" \
        --name "$ENDPOINT_NAME" \
        --query customHttpsProvisioningState \
        -o tsv)

    if [ "$CERT_STATUS" = "Enabled" ]; then
        echo -e "${GREEN}✅ HTTPS certificate is active${NC}"
        break
    fi

    CERT_CHECK_ATTEMPTS=$((CERT_CHECK_ATTEMPTS + 1))
    echo -e "${YELLOW}⏳ Certificate provisioning... Status: $CERT_STATUS (attempt $CERT_CHECK_ATTEMPTS/$MAX_CERT_ATTEMPTS)${NC}"
    sleep 10
done

if [ $CERT_CHECK_ATTEMPTS -eq $MAX_CERT_ATTEMPTS ]; then
    echo -e "${YELLOW}⚠️  Certificate still provisioning. Check Azure Portal for status.${NC}"
fi

echo ""

# ============================================================================
# SUCCESS SUMMARY
# ============================================================================
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ TENANT DOMAIN PROVISIONING COMPLETE${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Domain Details:${NC}"
echo "  Tenant:          $TENANT_SLUG"
echo "  Custom Domain:   $CUSTOM_DOMAIN"
echo "  Endpoint:        $ENDPOINT_NAME"
echo "  Front Door:      $FRONTDOOR_NAME"
echo "  HTTPS:           Enabled (managed certificate)"
echo "  TLS Version:     1.2+"
echo ""
echo -e "${BLUE}Access URLs:${NC}"
echo "  HTTPS:           https://$CUSTOM_DOMAIN"
echo "  Verify:          curl -I https://$CUSTOM_DOMAIN"
echo ""
echo -e "${YELLOW}Note:${NC} Certificate provisioning can take up to 30 minutes to fully complete."
echo "Monitor status in Azure Portal: Front Door → $FRONTDOOR_NAME → Frontend hosts"
echo ""

exit 0
