#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# FineGuard Pro — One-Command Azure Deployment
# FINE GUARD LTD · Company No. 16895564
#
# Usage:  chmod +x azure/deploy-azure.sh && ./azure/deploy-azure.sh
# Time:   ~8-12 minutes on first run (MySQL provisioning is slowest)
# ──────────────────────────────────────────────────────────────
set -euo pipefail

# ══════════════════════════════════════════════════════════════
# CONFIGURATION — Replace every REPLACE_WITH_* value below
# These values are NEVER committed to git.
# ══════════════════════════════════════════════════════════════
SUBSCRIPTION_ID="REPLACE_WITH_AZURE_SUBSCRIPTION_ID"
ENVIRONMENT="prod"
LOCATION="uksouth"
APP_NAME="fineguard"
RESOURCE_GROUP="${APP_NAME}-${ENVIRONMENT}-rg"

# Database
MYSQL_ADMIN_LOGIN="fineguardadmin"
MYSQL_ADMIN_PASSWORD="REPLACE_WITH_STRONG_PASSWORD"   # min 12 chars, upper+lower+digit+symbol

# Auth & Security
JWT_SECRET="REPLACE_WITH_64_CHAR_HEX"                # generate: openssl rand -hex 32

# Stripe
STRIPE_SECRET_KEY="REPLACE_WITH_sk_live_KEY"
STRIPE_PUBLISHABLE_KEY="REPLACE_WITH_pk_live_KEY"
STRIPE_WEBHOOK_SECRET="REPLACE_WITH_whsec_KEY"

# Manus OAuth
OAUTH_APP_ID="REPLACE_WITH_MANUS_APP_ID"

# External APIs
COMPANIES_HOUSE_API_KEY="REPLACE_WITH_CH_KEY"
PERPLEXITY_API_KEY="REPLACE_WITH_PERPLEXITY_KEY"
CLICKSEND_USERNAME="REPLACE_WITH_CLICKSEND_USER"
CLICKSEND_API_KEY="REPLACE_WITH_CLICKSEND_KEY"

# Vite build variables
VITE_OAUTH_PORTAL_URL="https://manus.im"
VITE_APP_TITLE="FineGuard Pro"

# ══════════════════════════════════════════════════════════════
# PREFLIGHT CHECKS
# ══════════════════════════════════════════════════════════════
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "═══════════════════════════════════════════════════════"
echo "  FineGuard Pro — Azure Deployment"
echo "  FINE GUARD LTD · Company No. 16895564"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check prerequisites
for cmd in az pnpm node zip curl; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: '$cmd' is required but not installed."
    exit 1
  fi
done

AZ_VERSION=$(az version --query '"azure-cli"' -o tsv)
echo "[preflight] Azure CLI version: $AZ_VERSION"
echo "[preflight] Node version: $(node --version)"
echo "[preflight] pnpm version: $(pnpm --version)"

# Validate configuration
if echo "$MYSQL_ADMIN_PASSWORD $JWT_SECRET $STRIPE_SECRET_KEY" | grep -q "REPLACE_WITH"; then
  echo ""
  echo "ERROR: You must replace all REPLACE_WITH_* placeholders in this script."
  echo "       Open azure/deploy-azure.sh and fill in the configuration block."
  exit 1
fi

echo "[preflight] Configuration validated"
echo ""

# ══════════════════════════════════════════════════════════════
# STAGE 1 — Set subscription
# ══════════════════════════════════════════════════════════════
echo "── Stage 1/7: Setting Azure subscription ──"
az account set --subscription "$SUBSCRIPTION_ID"
echo "[1/7] Subscription set: $SUBSCRIPTION_ID"
echo ""

# ══════════════════════════════════════════════════════════════
# STAGE 2 — Create resource group
# ══════════════════════════════════════════════════════════════
echo "── Stage 2/7: Creating resource group ──"
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --tags environment="$ENVIRONMENT" project=fineguard company="FINE GUARD LTD" \
  --output none
echo "[2/7] Resource group: $RESOURCE_GROUP (${LOCATION})"
echo ""

# ══════════════════════════════════════════════════════════════
# STAGE 3 — Deploy ARM template (provisions all 7 resources)
# ══════════════════════════════════════════════════════════════
echo "── Stage 3/7: Deploying infrastructure (ARM template) ──"
echo "       This takes 5-8 minutes (MySQL provisioning)..."

DEPLOYMENT_NAME="fineguard-deploy-$(date +%Y%m%d-%H%M%S)"

az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file "$SCRIPT_DIR/arm-template.json" \
  --parameters \
    environment="$ENVIRONMENT" \
    location="$LOCATION" \
    appName="$APP_NAME" \
    mysqlAdminLogin="$MYSQL_ADMIN_LOGIN" \
    mysqlAdminPassword="$MYSQL_ADMIN_PASSWORD" \
    jwtSecret="$JWT_SECRET" \
    stripeSecretKey="$STRIPE_SECRET_KEY" \
    stripePublishableKey="$STRIPE_PUBLISHABLE_KEY" \
    stripeWebhookSecret="$STRIPE_WEBHOOK_SECRET" \
    oauthAppId="$OAUTH_APP_ID" \
    companiesHouseApiKey="$COMPANIES_HOUSE_API_KEY" \
    perplexityApiKey="$PERPLEXITY_API_KEY" \
    clicksendUsername="$CLICKSEND_USERNAME" \
    clicksendApiKey="$CLICKSEND_API_KEY" \
  --name "$DEPLOYMENT_NAME" \
  --mode Incremental \
  --output none

# Capture outputs
WEBAPP_NAME=$(az deployment group show \
  --resource-group "$RESOURCE_GROUP" \
  --name "$DEPLOYMENT_NAME" \
  --query "properties.outputs.webAppName.value" -o tsv)

WEBAPP_URL=$(az deployment group show \
  --resource-group "$RESOURCE_GROUP" \
  --name "$DEPLOYMENT_NAME" \
  --query "properties.outputs.webAppUrl.value" -o tsv)

MYSQL_FQDN=$(az deployment group show \
  --resource-group "$RESOURCE_GROUP" \
  --name "$DEPLOYMENT_NAME" \
  --query "properties.outputs.mysqlServerFqdn.value" -o tsv)

echo "[3/7] Infrastructure deployed"
echo "       Web App:  $WEBAPP_NAME"
echo "       MySQL:    $MYSQL_FQDN"
echo ""

# ══════════════════════════════════════════════════════════════
# STAGE 4 — Build the application
# ══════════════════════════════════════════════════════════════
echo "── Stage 4/7: Building application ──"
cd "$PROJECT_ROOT"

pnpm install --frozen-lockfile

NODE_ENV=production \
  VITE_APP_ID="$OAUTH_APP_ID" \
  VITE_OAUTH_PORTAL_URL="$VITE_OAUTH_PORTAL_URL" \
  VITE_STRIPE_PUBLISHABLE_KEY="$STRIPE_PUBLISHABLE_KEY" \
  VITE_APP_TITLE="$VITE_APP_TITLE" \
  pnpm build

echo "[4/7] Build complete"
echo ""

# ══════════════════════════════════════════════════════════════
# STAGE 5 — Run database migrations
# ══════════════════════════════════════════════════════════════
echo "── Stage 5/7: Running database migrations ──"

export DATABASE_URL="mysql://${MYSQL_ADMIN_LOGIN}:${MYSQL_ADMIN_PASSWORD}@${MYSQL_FQDN}:3306/fineguarddb?ssl={\"rejectUnauthorized\":true}"
pnpm db:push

echo "[5/7] Database migrations applied"
echo ""

# ══════════════════════════════════════════════════════════════
# STAGE 6 — Package and deploy
# ══════════════════════════════════════════════════════════════
echo "── Stage 6/7: Deploying to Azure App Service ──"

# Clean previous deploy artifacts
rm -rf deploy-pkg fineguard.zip

# Package only what's needed
mkdir deploy-pkg
cp -r dist server drizzle shared package.json pnpm-lock.yaml deploy-pkg/

# Include web.config for IIS routing if it exists
if [ -f "$SCRIPT_DIR/web.config" ]; then
  cp "$SCRIPT_DIR/web.config" deploy-pkg/
fi

cd deploy-pkg
zip -qr ../fineguard.zip .
cd "$PROJECT_ROOT"

az webapp deploy \
  --resource-group "$RESOURCE_GROUP" \
  --name "$WEBAPP_NAME" \
  --src-path fineguard.zip \
  --type zip \
  --output none

# Cleanup
rm -rf deploy-pkg fineguard.zip

echo "[6/7] Application deployed to $WEBAPP_NAME"
echo ""

# ══════════════════════════════════════════════════════════════
# STAGE 7 — Health check
# ══════════════════════════════════════════════════════════════
echo "── Stage 7/7: Verifying deployment ──"

# Wait for the app to start
echo "       Waiting 30s for cold start..."
sleep 30

HEALTH_URL="${WEBAPP_URL}/api/health"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || true)

if [ "$HTTP_CODE" = "200" ]; then
  echo "[7/7] Health check PASSED (HTTP $HTTP_CODE)"
else
  echo "[7/7] WARNING: Health check returned HTTP $HTTP_CODE"
  echo "       URL: $HEALTH_URL"
  echo "       The app may still be starting. Check logs:"
  echo "       az webapp log tail --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  DEPLOYMENT COMPLETE"
echo ""
echo "  Live URL:    $WEBAPP_URL"
echo "  Health:      ${WEBAPP_URL}/api/health"
echo "  Logs:        az webapp log tail --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP"
echo ""
echo "  Next steps:"
echo "    1. Add custom domain: fineguardpro.com"
echo "    2. Configure Stripe webhook: ${WEBAPP_URL}/api/stripe/webhook"
echo "    3. Update Manus OAuth redirect: ${WEBAPP_URL}/api/oauth/callback"
echo "    4. Smoke test: https://fineguardpro.com/check"
echo "═══════════════════════════════════════════════════════"
