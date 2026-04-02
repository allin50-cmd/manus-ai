# FineGuard Pro — Azure Deployment Guide

**FINE GUARD LTD** · Company No. 16895564 · Lodges Wood Oast, Westerham, TN16 1TW

---

## Overview

This guide covers the complete deployment of FineGuard Pro to Microsoft Azure. The deployment uses a single ARM JSON template (`arm-template.json`) to provision all infrastructure in one operation, a GitHub Actions pipeline (`deploy.yml`) for continuous delivery, and a one-command shell script (`deploy-azure.sh`) for manual deployments.

All resources are deployed to **UK South** (`uksouth`) to satisfy UK GDPR Article 44 data residency requirements.

---

## Architecture

| Azure Resource | Service | SKU | Purpose |
|---|---|---|---|
| App Service Plan | Microsoft.Web/serverfarms | Basic B2 (2 vCPU, 3.5 GB) | Compute host |
| Web App | Microsoft.Web/sites | Linux, Node 22 LTS | Application runtime |
| MySQL Flexible Server | Microsoft.DBforMySQL/flexibleServers | Standard_B2ms, 20 GB | Primary database |
| Blob Storage | Microsoft.Storage/storageAccounts | Standard LRS | File storage (documents, uploads) |
| Key Vault | Microsoft.KeyVault/vaults | Standard | Secret management |
| Application Insights | Microsoft.Insights/components | Pay-as-you-go | Telemetry and monitoring |
| Log Analytics Workspace | Microsoft.OperationalInsights/workspaces | PerGB2018 | Log aggregation |

The App Service uses a **system-assigned managed identity** to read secrets from Key Vault via RBAC, so no secrets are stored in plain-text environment variables.

---

## Prerequisites

Before running any deployment command, ensure the following are in place:

1. **Azure CLI** version 2.50+ installed and authenticated via `az login`
2. **Azure subscription** with Contributor access on the target resource group
3. **pnpm** version 10+ installed locally
4. All API keys and secrets listed in the **Secrets Reference** section below

---

## Option A — One-Command Script (Recommended)

The script `azure/deploy-azure.sh` handles all seven steps automatically: subscription selection, resource group creation, infrastructure provisioning, application build, database migration, deployment, and health verification.

### Step 1: Fill in the configuration block

Open `azure/deploy-azure.sh` and replace every `REPLACE_WITH_*` placeholder at the top of the file with real values. These values are never committed to git — they are passed directly to the ARM template and stored in Key Vault.

```bash
SUBSCRIPTION_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
MYSQL_ADMIN_PASSWORD="Fg!Prod2026#SecurePass"   # min 12 chars, upper+lower+digit+symbol
JWT_SECRET="a-random-64-char-hex-string-here"
STRIPE_SECRET_KEY="sk_live_..."
# ... (see the script for the full list)
```

### Step 2: Run the script

```bash
chmod +x azure/deploy-azure.sh
./azure/deploy-azure.sh
```

The script prints progress for each of its seven stages and exits with a live URL on success. Total runtime is approximately 8-12 minutes on first deployment (MySQL provisioning takes the longest).

---

## Option B — Manual Step-by-Step

### Step 1: Create the resource group

```bash
az group create \
  --name fineguard-prod-rg \
  --location uksouth \
  --tags environment=prod project=fineguard company="FINE GUARD LTD"
```

### Step 2: Deploy the ARM template

```bash
az deployment group create \
  --resource-group fineguard-prod-rg \
  --template-file azure/arm-template.json \
  --parameters \
    environment=prod \
    location=uksouth \
    appName=fineguard \
    mysqlAdminLogin=fineguardadmin \
    mysqlAdminPassword="<PASSWORD>" \
    jwtSecret="<JWT_SECRET>" \
    stripeSecretKey="<STRIPE_SK_LIVE>" \
    stripePublishableKey="<STRIPE_PK_LIVE>" \
    stripeWebhookSecret="<STRIPE_WEBHOOK_SECRET>" \
    oauthAppId="<MANUS_APP_ID>" \
    companiesHouseApiKey="<CH_API_KEY>" \
    perplexityApiKey="<PERPLEXITY_KEY>" \
    clicksendUsername="<CLICKSEND_USER>" \
    clicksendApiKey="<CLICKSEND_KEY>" \
  --name "fineguard-initial-$(date +%Y%m%d)" \
  --mode Incremental
```

### Step 3: Run database migrations

```bash
export DATABASE_URL="mysql://fineguardadmin:<PASSWORD>@fineguard-prod-mysql.mysql.database.azure.com:3306/fineguarddb?ssl={\"rejectUnauthorized\":true}"
pnpm db:push
```

### Step 4: Build the application

```bash
NODE_ENV=production \
VITE_APP_ID="<MANUS_APP_ID>" \
VITE_OAUTH_PORTAL_URL="https://manus.im" \
VITE_STRIPE_PUBLISHABLE_KEY="<STRIPE_PK_LIVE>" \
VITE_APP_TITLE="FineGuard Pro" \
pnpm build
```

### Step 5: Deploy the application

```bash
# Package
mkdir deploy-pkg
cp -r dist server drizzle shared package.json pnpm-lock.yaml deploy-pkg/
cd deploy-pkg && zip -r ../fineguard.zip . && cd ..

# Deploy
az webapp deploy \
  --resource-group fineguard-prod-rg \
  --name fineguard-prod-app \
  --src-path fineguard.zip \
  --type zip
```

### Step 6: Verify

```bash
curl https://fineguard-prod-app.azurewebsites.net/api/health
# Expected: {"ok":true,"service":"fineguard-pro","ts":1234567890}
```

---

## Option C — GitHub Actions CI/CD

The pipeline `azure/deploy.yml` runs automatically on every push to `main`. It executes three jobs in sequence: **Test** (1,780+ unit tests), **Build** (Vite + esbuild), and **Deploy** (zip deploy to Azure App Service).

### Required GitHub Secrets

Add these in **Settings > Secrets and variables > Actions**:

| Secret | How to obtain |
|---|---|
| `AZURE_CREDENTIALS` | `az ad sp create-for-rbac --name fineguard-deploy --role contributor --scopes /subscriptions/SUB_ID/resourceGroups/fineguard-prod-rg --sdk-auth` |
| `AZURE_SUBSCRIPTION_ID` | Azure Portal > Subscriptions |
| `AZURE_RESOURCE_GROUP` | `fineguard-prod-rg` |
| `AZURE_WEBAPP_NAME` | `fineguard-prod-app` |
| `VITE_APP_ID` | Manus project settings |
| `VITE_OAUTH_PORTAL_URL` | `https://manus.im` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard > API keys |
| `VITE_ANALYTICS_ENDPOINT` | Umami instance URL |
| `VITE_ANALYTICS_WEBSITE_ID` | Umami website ID |
| `VITE_APP_LOGO` | CDN URL of the logo image |

Once secrets are set, push to `main` to trigger the first automated deployment.

---

## Secrets Reference

All sensitive values are stored in **Azure Key Vault** and referenced by the App Service via managed identity. The table below maps each secret to its Key Vault name and where to obtain it.

| Secret | Key Vault Name | Source |
|---|---|---|
| MySQL admin password | `mysql-admin-password` | Choose a strong password (min 12 chars) |
| JWT signing secret | `jwt-secret` | Generate: `openssl rand -hex 32` |
| Stripe secret key | `stripe-secret-key` | Stripe Dashboard > Developers > API keys |
| Stripe webhook secret | `stripe-webhook-secret` | Stripe Dashboard > Developers > Webhooks |
| Companies House API key | `companies-house-api-key` | [developer.company-information.service.gov.uk](https://developer.company-information.service.gov.uk) |
| Perplexity API key | `perplexity-api-key` | [perplexity.ai/settings/api](https://www.perplexity.ai/settings/api) |
| ClickSend API key | `clicksend-api-key` | ClickSend Dashboard > API Credentials |

---

## Environment Variables on App Service

The ARM template sets these automatically. Variables marked **Key Vault ref** are resolved at runtime via managed identity — the App Service never sees the raw secret value.

| Variable | Source | Notes |
|---|---|---|
| `NODE_ENV` | Static | `production` |
| `PORT` | Static | `8080` (Azure default) |
| `DATABASE_URL` | ARM output | MySQL connection string with SSL |
| `JWT_SECRET` | Key Vault ref | Session cookie signing |
| `VITE_APP_ID` | Parameter | Manus OAuth app ID |
| `OAUTH_SERVER_URL` | Parameter | `https://api.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | Parameter | `https://manus.im` |
| `STRIPE_SECRET_KEY` | Key Vault ref | Live Stripe secret key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Parameter | Live Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Key Vault ref | Stripe webhook signing secret |
| `COMPANIES_HOUSE_API_KEY` | Key Vault ref | Companies House REST API |
| `PERPLEXITY_API_KEY` | Key Vault ref | Perplexity AI |
| `CLICKSEND_USERNAME` | Parameter | ClickSend account username |
| `CLICKSEND_API_KEY` | Key Vault ref | ClickSend API key |
| `AZURE_STORAGE_ACCOUNT_NAME` | ARM output | Blob storage account |
| `AZURE_STORAGE_CONTAINER_NAME` | Static | `fineguard-files` |
| `AZURE_STORAGE_CONNECTION_STRING` | ARM output | Full blob storage connection string |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | ARM output | Application Insights telemetry |

---

## Post-Deployment Checklist

After the first successful deployment, complete these steps before directing users to the Azure URL:

1. **Custom domain** — in Azure Portal, navigate to App Service > Custom domains, add `fineguardpro.com` and `www.fineguardpro.com`, then update DNS to point to the App Service hostname.

2. **Stripe webhook** — in the Stripe Dashboard, update the webhook endpoint URL to `https://fineguardpro.com/api/stripe/webhook` and ensure the `checkout.session.completed`, `invoice.paid`, and `customer.subscription.*` events are selected.

3. **Manus OAuth redirect URI** — update the OAuth application's allowed redirect URIs to include `https://fineguardpro.com/api/oauth/callback`.

4. **Companies House webhook** — if using CH real-time filing notifications, update the callback URL in the CH Developer Hub to `https://fineguardpro.com/api/webhooks/companies-house`.

5. **Smoke test** — visit `https://fineguardpro.com/check`, enter a company number, and verify the full alert flow works end-to-end.

---

## Active Next Layer Optimisation

Once the initial deployment is stable, the following optimisations are recommended in order of business impact:

**First priority** — Upgrade the App Service Plan from Basic B2 to Standard S2 (approximately £60/month additional). This tier unlocks deployment slots, enabling zero-downtime blue/green deployments, and adds auto-scaling rules to handle traffic spikes during Companies House filing deadlines.

**Second priority** — Add an Azure CDN profile in front of the Blob Storage container. Static assets (uploaded documents, company logos) are currently served directly from UK South. A CDN edge network reduces latency for users outside the region and offloads bandwidth from the App Service.

**Third priority** — Configure Azure Monitor alert rules for the four metrics that matter most for FineGuard Pro: HTTP 5xx error rate above 1%, P95 response time above 2 seconds, MySQL CPU above 80%, and storage capacity above 80%. These alerts should notify the on-call email address defined in FINE GUARD LTD's incident response policy.

**Fourth priority** — Enable MySQL read replicas for the analytics and reporting queries in `pipelineRouter.ts` and `dashboardRouter.ts`. These queries do not require write consistency and currently run against the primary instance, which adds latency during bulk send operations.

---

## Monitoring

| Dashboard | Access |
|---|---|
| Live Metrics | Azure Portal > `fineguard-prod-ai` > Live Metrics |
| Log Analytics | Azure Portal > `fineguard-prod-logs` > Logs |
| App Service logs | `az webapp log tail --name fineguard-prod-app --resource-group fineguard-prod-rg` |
| MySQL metrics | Azure Portal > `fineguard-prod-mysql` > Monitoring |

---

## Rollback

To revert to a previous deployment, re-run the GitHub Actions pipeline on an earlier commit using **Actions > select workflow run > Re-run jobs**, or use the Azure CLI:

```bash
# List recent deployments
az webapp deployment list \
  --name fineguard-prod-app \
  --resource-group fineguard-prod-rg \
  --output table

# Trigger a re-deploy from the last successful ZIP
az webapp deploy \
  --resource-group fineguard-prod-rg \
  --name fineguard-prod-app \
  --src-path <previous-fineguard.zip> \
  --type zip
```

---

## Cost Estimate (UK South, March 2026)

| Resource | Monthly Cost (GBP) |
|---|---|
| App Service Plan B2 | ~£50 |
| MySQL Flexible Server B2ms | ~£35 |
| Blob Storage (10 GB) | ~£2 |
| Key Vault (10k operations/month) | ~£0.30 |
| Application Insights (5 GB/month) | £0 (free tier) |
| Log Analytics (5 GB/month) | £0 (free tier) |
| **Total (Basic tier)** | **~£87/month** |
| **Total (Standard S2 + CDN)** | **~£160/month** |

---

## Files in This Directory

| File | Purpose |
|---|---|
| `arm-template.json` | Full ARM JSON template — provisions all 7 Azure resources in one deployment |
| `main.bicep` | Bicep source (equivalent to `arm-template.json`, preferred for teams with Bicep tooling) |
| `parameters.prod.json` | Parameter file for production deployment (Key Vault references pre-wired) |
| `deploy.yml` | GitHub Actions CI/CD pipeline (test > build > deploy) |
| `deploy-azure.sh` | One-command manual deployment script |
| `web.config` | Azure App Service IIS/ARR routing config for Node.js SPA |
| `AUDIT-REPORT.md` | Full system audit report (March 2026) |
| `README.md` | Quick-start reference |
