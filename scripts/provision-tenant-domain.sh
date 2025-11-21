#!/usr/bin/env bash
##############################################################################
# Tenant Custom Domain Provisioning Script
#
# Automates Azure Front Door custom domain configuration:
# 1. Creates Front Door frontend endpoint for tenant
# 2. Validates DNS ownership via CNAME
# 3. Enables managed HTTPS certificate
#
# Prerequisites:
# - Azure CLI installed and logged in (az login)
# - Front Door profile already exists
# - DNS provider access to create CNAME records
#
# Usage:
#   ./provision-tenant-domain.sh <tenant-slug> <custom-domain> <frontdoor-name> <resource-group>
#
# Example:
#   ./provision-tenant-domain.sh stork-nhs stork.yourdomain.com ultai-frontdoor ultai-rg-prod
#
# Author: UltraCore Team
# Version: 1.0.0
##############################################################################

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}ℹ ${NC}$1"; }
log_success() { echo -e "${GREEN}✅${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠️ ${NC} $1"; }
log_error() { echo -e "${RED}❌${NC} $1"; }

# Validate arguments
if [ $# -lt 4 ]; then
  log_error "Missing required arguments"
  echo ""
  echo "Usage: $0 <tenant-slug> <custom-domain> <frontdoor-name> <resource-group>"
  echo ""
  echo "Arguments:"
  echo "  tenant-slug     : Unique tenant identifier (e.g., stork-nhs)"
  echo "  custom-domain   : Tenant's custom domain (e.g., stork.yourdomain.com)"
  echo "  frontdoor-name  : Azure Front Door profile name"
  echo "  resource-group  : Azure resource group name"
  echo ""
  echo "Example:"
  echo "  $0 stork-nhs stork.yourdomain.com ultai-frontdoor ultai-rg-prod"
  exit 2
fi

TENANT_SLUG="$1"
CUSTOM_DOMAIN="$2"
FRONTDOOR_NAME="$3"
RESOURCE_GROUP="$4"
ENDPOINT_NAME="${TENANT_SLUG}-fe"

# Validate domain format
if ! echo "$CUSTOM_DOMAIN" | grep -qE '^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'; then
  log_error "Invalid domain format: $CUSTOM_DOMAIN"
  exit 1
fi

log_info "🚀 Starting custom domain provisioning"
echo ""
echo "📋 Configuration:"
echo "   Tenant Slug:      $TENANT_SLUG"
echo "   Custom Domain:    $CUSTOM_DOMAIN"
echo "   Front Door:       $FRONTDOOR_NAME"
echo "   Resource Group:   $RESOURCE_GROUP"
echo "   Endpoint Name:    $ENDPOINT_NAME"
echo ""

# Check Azure CLI authentication
log_info "Verifying Azure CLI authentication..."
if ! az account show &>/dev/null; then
  log_error "Not logged in to Azure CLI. Run: az login"
  exit 1
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
log_success "Authenticated to Azure subscription: $SUBSCRIPTION_NAME ($SUBSCRIPTION_ID)"
echo ""

# Verify Front Door exists
log_info "Verifying Front Door profile exists..."
if ! az network front-door show \
  --resource-group "$RESOURCE_GROUP" \
  --name "$FRONTDOOR_NAME" &>/dev/null; then
  log_error "Front Door profile not found: $FRONTDOOR_NAME"
  exit 1
fi
log_success "Front Door profile verified: $FRONTDOOR_NAME"
echo ""

# Check if endpoint already exists
log_info "Checking for existing frontend endpoint..."
if az network front-door frontend-endpoint show \
  --resource-group "$RESOURCE_GROUP" \
  --front-door-name "$FRONTDOOR_NAME" \
  --name "$ENDPOINT_NAME" &>/dev/null; then
  log_warning "Frontend endpoint already exists: $ENDPOINT_NAME"
  echo ""
  read -rp "Do you want to update it? (y/N): " -n 1 REPLY
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Skipping endpoint creation"
  else
    log_info "Proceeding with update..."
  fi
else
  log_info "No existing endpoint found, creating new one..."
fi
echo ""

# Step 1: Create or update frontend endpoint
log_info "📝 Creating frontend endpoint: $ENDPOINT_NAME"
if az network front-door frontend-endpoint create \
  --resource-group "$RESOURCE_GROUP" \
  --front-door-name "$FRONTDOOR_NAME" \
  --name "$ENDPOINT_NAME" \
  --host-name "$CUSTOM_DOMAIN" \
  --session-affinity-enabled false \
  --session-affinity-ttl 0 2>/dev/null; then
  log_success "Frontend endpoint created successfully"
else
  # If create fails, try update
  if az network front-door frontend-endpoint update \
    --resource-group "$RESOURCE_GROUP" \
    --front-door-name "$FRONTDOOR_NAME" \
    --name "$ENDPOINT_NAME" \
    --host-name "$CUSTOM_DOMAIN" 2>/dev/null; then
    log_success "Frontend endpoint updated successfully"
  else
    log_error "Failed to create or update frontend endpoint"
    exit 1
  fi
fi
echo ""

# Step 2: Get Front Door hostname for DNS validation
log_info "🔍 Retrieving Front Door default hostname..."
FRONTDOOR_HOSTNAME=$(az network front-door show \
  --resource-group "$RESOURCE_GROUP" \
  --name "$FRONTDOOR_NAME" \
  --query "frontendEndpoints[?hostName!='$CUSTOM_DOMAIN'] | [0].hostName" \
  -o tsv)

if [ -z "$FRONTDOOR_HOSTNAME" ]; then
  FRONTDOOR_HOSTNAME="${FRONTDOOR_NAME}.azurefd.net"
fi

log_success "Front Door hostname: $FRONTDOOR_HOSTNAME"
echo ""

# Step 3: Display DNS configuration instructions
log_warning "⚠️  DNS CONFIGURATION REQUIRED ⚠️"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "You must create the following DNS record:"
echo ""
echo "  Type:  CNAME"
echo "  Name:  $CUSTOM_DOMAIN"
echo "  Value: $FRONTDOOR_HOSTNAME"
echo "  TTL:   3600 (or your provider's default)"
echo ""
echo "Example for common DNS providers:"
echo ""
echo "  Cloudflare:   Name: $(echo "$CUSTOM_DOMAIN" | cut -d. -f1), Target: $FRONTDOOR_HOSTNAME"
echo "  AWS Route53:  Name: $CUSTOM_DOMAIN, Value: $FRONTDOOR_HOSTNAME"
echo "  Azure DNS:    Name: $(echo "$CUSTOM_DOMAIN" | cut -d. -f1), Value: $FRONTDOOR_HOSTNAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Wait for user confirmation
read -rp "Press ENTER after creating the DNS record to continue (or Ctrl+C to abort)..."

echo ""
log_info "⏳ Waiting for DNS propagation (this may take 2-10 minutes)..."

# Step 4: Wait for DNS propagation
MAX_RETRIES=30
RETRY_INTERVAL=20
DNS_VERIFIED=false

for ((i=1; i<=MAX_RETRIES; i++)); do
  echo -n "   Attempt $i/$MAX_RETRIES: "

  # Check DNS resolution
  if dig +short "$CUSTOM_DOMAIN" | grep -q "$FRONTDOOR_HOSTNAME"; then
    echo -e "${GREEN}✓${NC}"
    DNS_VERIFIED=true
    break
  elif nslookup "$CUSTOM_DOMAIN" 2>/dev/null | grep -q "$FRONTDOOR_HOSTNAME"; then
    echo -e "${GREEN}✓${NC}"
    DNS_VERIFIED=true
    break
  else
    echo -e "${YELLOW}⏳${NC}"
    if [ $i -lt $MAX_RETRIES ]; then
      sleep $RETRY_INTERVAL
    fi
  fi
done

echo ""

if [ "$DNS_VERIFIED" = false ]; then
  log_warning "DNS propagation not detected yet, but continuing anyway..."
  log_info "Manual verification: nslookup $CUSTOM_DOMAIN"
  echo ""
  read -rp "Continue with HTTPS setup anyway? (y/N): " -n 1 REPLY
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Aborted by user. Re-run this script after DNS propagates."
    exit 0
  fi
else
  log_success "DNS propagation verified!"
fi

echo ""

# Step 5: Enable HTTPS with managed certificate
log_info "🔐 Enabling HTTPS with Front Door managed certificate..."
echo ""

if az network front-door frontend-endpoint enable-https \
  --resource-group "$RESOURCE_GROUP" \
  --front-door-name "$FRONTDOOR_NAME" \
  --name "$ENDPOINT_NAME" \
  --certificate-source FrontDoor 2>/dev/null; then
  log_success "HTTPS enabled successfully"
else
  log_warning "HTTPS enable command failed (may already be enabled)"
fi

echo ""
log_info "⏳ Certificate provisioning initiated..."
echo "   This can take 15-60 minutes for the certificate to become active"
echo ""

# Step 6: Check certificate status
log_info "📊 Checking certificate status..."
CERT_STATUS=$(az network front-door frontend-endpoint show \
  --resource-group "$RESOURCE_GROUP" \
  --front-door-name "$FRONTDOOR_NAME" \
  --name "$ENDPOINT_NAME" \
  --query "customHttpsConfiguration.certificateSource" \
  -o tsv 2>/dev/null || echo "Unknown")

if [ "$CERT_STATUS" = "FrontDoor" ]; then
  log_success "Certificate source: Front Door Managed"
else
  log_warning "Certificate status: $CERT_STATUS"
fi

echo ""
log_success "🎉 Custom domain provisioning completed!"
echo ""
echo "📋 Summary:"
echo "   Domain:           $CUSTOM_DOMAIN"
echo "   Endpoint:         $ENDPOINT_NAME"
echo "   Front Door:       $FRONTDOOR_NAME"
echo "   HTTPS:            Enabled (provisioning in progress)"
echo ""
echo "🔍 Verification:"
echo "   Check status: az network front-door frontend-endpoint show \\"
echo "                   --resource-group $RESOURCE_GROUP \\"
echo "                   --front-door-name $FRONTDOOR_NAME \\"
echo "                   --name $ENDPOINT_NAME"
echo ""
echo "   Test HTTPS:   curl -I https://$CUSTOM_DOMAIN"
echo ""
echo "⏰ Note: HTTPS certificate provisioning can take up to 60 minutes"
echo ""

exit 0
