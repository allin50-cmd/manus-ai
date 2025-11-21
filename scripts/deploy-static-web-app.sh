#!/usr/bin/env bash

# UltraCore Azure Static Web Apps Deployment Script
# Deploys the tenant admin UI to Azure Static Web Apps with automated configuration

set -euo pipefail

##############################################################################
# Configuration
##############################################################################

APP_NAME="${APP_NAME:-ultracore-admin}"
RESOURCE_GROUP="${RESOURCE_GROUP:-ultracore-prod-rg}"
LOCATION="${LOCATION:-uksouth}"
DEPLOYMENT_TOKEN=""
GITHUB_REPO=""
GITHUB_BRANCH="main"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

##############################################################################
# Helper Functions
##############################################################################

print_header() {
    echo ""
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  $1${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

##############################################################################
# Prerequisites Check
##############################################################################

check_prerequisites() {
    print_header "Checking Prerequisites"

    # Check Azure CLI
    if ! command -v az &> /dev/null; then
        print_error "Azure CLI not found"
        echo "Install: https://docs.microsoft.com/cli/azure/install-azure-cli"
        exit 1
    fi
    print_success "Azure CLI found: $(az version --query '\"azure-cli\"' -o tsv)"

    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found"
        echo "Install: https://nodejs.org/"
        exit 1
    fi
    print_success "Node.js found: $(node --version)"

    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm not found"
        exit 1
    fi
    print_success "npm found: $(npm --version)"

    # Check Azure login
    if ! az account show &> /dev/null; then
        print_error "Not logged in to Azure CLI"
        echo "Run: az login"
        exit 1
    fi
    print_success "Azure CLI authenticated"

    local subscription=$(az account show --query name -o tsv)
    print_info "Subscription: $subscription"
}

##############################################################################
# Configuration Collection
##############################################################################

collect_configuration() {
    print_header "Configuration"

    # App Name
    read -p "$(echo -e ${CYAN}Enter Static Web App name [${APP_NAME}]: ${NC})" input
    APP_NAME="${input:-$APP_NAME}"

    # Resource Group
    read -p "$(echo -e ${CYAN}Enter resource group [${RESOURCE_GROUP}]: ${NC})" input
    RESOURCE_GROUP="${input:-$RESOURCE_GROUP}"

    # Location
    read -p "$(echo -e ${CYAN}Enter location [${LOCATION}]: ${NC})" input
    LOCATION="${input:-$LOCATION}"

    # GitHub Repository (optional)
    read -p "$(echo -e ${CYAN}Enter GitHub repository (e.g., user/repo) [skip]: ${NC})" input
    GITHUB_REPO="${input}"

    if [ -n "$GITHUB_REPO" ]; then
        read -p "$(echo -e ${CYAN}Enter GitHub branch [${GITHUB_BRANCH}]: ${NC})" input
        GITHUB_BRANCH="${input:-$GITHUB_BRANCH}"
    fi

    echo ""
    print_info "Configuration:"
    echo "  App Name:        $APP_NAME"
    echo "  Resource Group:  $RESOURCE_GROUP"
    echo "  Location:        $LOCATION"
    if [ -n "$GITHUB_REPO" ]; then
        echo "  GitHub Repo:     $GITHUB_REPO"
        echo "  GitHub Branch:   $GITHUB_BRANCH"
    else
        echo "  GitHub:          Manual deployment"
    fi
    echo ""

    read -p "$(echo -e ${CYAN}Continue with this configuration? [Y/n]: ${NC})" confirm
    if [[ "$confirm" =~ ^[Nn]$ ]]; then
        print_warning "Deployment cancelled"
        exit 0
    fi
}

##############################################################################
# Build Application
##############################################################################

build_application() {
    print_header "Building Application"

    if [ ! -d "admin-tenant-ui" ]; then
        print_error "admin-tenant-ui directory not found"
        echo "Please run this script from the repository root"
        exit 1
    fi

    cd admin-tenant-ui

    print_info "Installing dependencies..."
    npm install

    print_info "Building production bundle..."
    npm run build

    if [ ! -d "build" ]; then
        print_error "Build failed - build directory not created"
        exit 1
    fi

    print_success "Application built successfully"

    local build_size=$(du -sh build | cut -f1)
    print_info "Build size: $build_size"

    cd ..
}

##############################################################################
# Create Azure Resources
##############################################################################

create_azure_resources() {
    print_header "Creating Azure Resources"

    # Check if resource group exists
    if az group show --name "$RESOURCE_GROUP" &> /dev/null; then
        print_info "Resource group '$RESOURCE_GROUP' already exists"
    else
        print_info "Creating resource group '$RESOURCE_GROUP'..."
        az group create \
            --name "$RESOURCE_GROUP" \
            --location "$LOCATION" \
            --tags Environment=production Project=UltraCore \
            --output none
        print_success "Resource group created"
    fi

    # Check if Static Web App exists
    if az staticwebapp show \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" &> /dev/null; then
        print_warning "Static Web App '$APP_NAME' already exists"
        read -p "$(echo -e ${CYAN}Delete and recreate? [y/N]: ${NC})" confirm
        if [[ "$confirm" =~ ^[Yy]$ ]]; then
            print_info "Deleting existing Static Web App..."
            az staticwebapp delete \
                --name "$APP_NAME" \
                --resource-group "$RESOURCE_GROUP" \
                --yes \
                --output none
            sleep 5
        else
            print_info "Using existing Static Web App"
            return
        fi
    fi

    # Create Static Web App
    print_info "Creating Static Web App '$APP_NAME'..."

    if [ -n "$GITHUB_REPO" ]; then
        # With GitHub integration
        az staticwebapp create \
            --name "$APP_NAME" \
            --resource-group "$RESOURCE_GROUP" \
            --location "$LOCATION" \
            --source "https://github.com/$GITHUB_REPO" \
            --branch "$GITHUB_BRANCH" \
            --app-location "/admin-tenant-ui" \
            --output-location "build" \
            --sku Free \
            --tags Environment=production Project=UltraCore Component=Admin \
            --output none
    else
        # Manual deployment
        az staticwebapp create \
            --name "$APP_NAME" \
            --resource-group "$RESOURCE_GROUP" \
            --location "$LOCATION" \
            --sku Free \
            --tags Environment=production Project=UltraCore Component=Admin \
            --output none
    fi

    print_success "Static Web App created"

    # Get deployment token
    DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query properties.apiKey \
        -o tsv)

    print_success "Deployment token obtained"
}

##############################################################################
# Deploy Application
##############################################################################

deploy_application() {
    print_header "Deploying Application"

    if [ -z "$DEPLOYMENT_TOKEN" ]; then
        print_error "Deployment token not found"
        exit 1
    fi

    # Install SWA CLI if not present
    if ! command -v swa &> /dev/null; then
        print_info "Installing Azure Static Web Apps CLI..."
        npm install -g @azure/static-web-apps-cli
    fi

    print_info "Deploying to Azure Static Web Apps..."

    cd admin-tenant-ui

    swa deploy \
        --deployment-token "$DEPLOYMENT_TOKEN" \
        --app-location . \
        --output-location build \
        --env production

    cd ..

    print_success "Application deployed"
}

##############################################################################
# Configure API Backend
##############################################################################

configure_api_backend() {
    print_header "Configuring API Backend"

    print_info "Linking Static Web App to backend API..."

    # Get the Actions API endpoint (adjust as needed)
    read -p "$(echo -e ${CYAN}Enter backend API URL (e.g., https://api.ultracore.io): ${NC})" api_url

    if [ -n "$api_url" ]; then
        # Create staticwebapp.config.json
        cat > admin-tenant-ui/public/staticwebapp.config.json << EOF
{
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["authenticated"]
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/images/*.{png,jpg,gif}", "/css/*"]
  },
  "responseOverrides": {
    "404": {
      "rewrite": "/index.html",
      "statusCode": 200
    }
  },
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": "default-src 'self' ${api_url}"
  },
  "mimeTypes": {
    ".json": "application/json",
    ".js": "text/javascript",
    ".css": "text/css"
  },
  "platform": {
    "apiRuntime": "node:18"
  }
}
EOF

        print_success "staticwebapp.config.json created"
        print_warning "Rebuild and redeploy to apply configuration"
    else
        print_info "Skipping API configuration"
    fi
}

##############################################################################
# Setup GitHub Actions
##############################################################################

setup_github_actions() {
    print_header "GitHub Actions Setup"

    if [ -z "$GITHUB_REPO" ]; then
        print_info "Skipping GitHub Actions (manual deployment)"
        return
    fi

    print_info "Creating GitHub Actions workflow..."

    mkdir -p .github/workflows

    cat > .github/workflows/deploy-admin-ui.yml << 'EOF'
name: Deploy Admin UI to Azure Static Web Apps

on:
  push:
    branches:
      - main
    paths:
      - 'admin-tenant-ui/**'
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main
    paths:
      - 'admin-tenant-ui/**'
  workflow_dispatch:

permissions:
  contents: read
  pull-requests: write

jobs:
  build_and_deploy:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: true

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: admin-tenant-ui/package-lock.json

      - name: Install dependencies
        run: |
          cd admin-tenant-ui
          npm ci

      - name: Build application
        run: |
          cd admin-tenant-ui
          npm run build
        env:
          CI: false
          REACT_APP_API_URL: ${{ secrets.API_URL }}

      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: 'upload'
          app_location: '/admin-tenant-ui'
          output_location: 'build'

  close_pull_request:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request
    steps:
      - name: Close Pull Request
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: 'close'
EOF

    print_success "GitHub Actions workflow created"

    print_info "Add the following secret to your GitHub repository:"
    echo ""
    echo -e "${CYAN}Secret Name:${NC} AZURE_STATIC_WEB_APPS_API_TOKEN"
    echo -e "${CYAN}Secret Value:${NC}"
    echo "$DEPLOYMENT_TOKEN"
    echo ""
    echo "Go to: https://github.com/$GITHUB_REPO/settings/secrets/actions"
}

##############################################################################
# Create Configuration File
##############################################################################

create_azure_config() {
    print_header "Saving Configuration"

    cat > .azure-deployment-config << EOF
# UltraCore Azure Static Web Apps Deployment Configuration
# Generated: $(date)

APP_NAME="$APP_NAME"
RESOURCE_GROUP="$RESOURCE_GROUP"
LOCATION="$LOCATION"
GITHUB_REPO="$GITHUB_REPO"
GITHUB_BRANCH="$GITHUB_BRANCH"

# Deployment Token (Keep secure!)
DEPLOYMENT_TOKEN="$DEPLOYMENT_TOKEN"

# Static Web App URL
STATIC_WEB_APP_URL=$(az staticwebapp show \
    --name "$APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --query defaultHostname \
    -o tsv 2>/dev/null || echo "pending")
EOF

    chmod 600 .azure-deployment-config

    print_success "Configuration saved to .azure-deployment-config"
    print_warning "Keep this file secure - it contains deployment tokens"
}

##############################################################################
# Complete Deployment
##############################################################################

complete_deployment() {
    print_header "Deployment Complete"

    local app_url=$(az staticwebapp show \
        --name "$APP_NAME" \
        --resource-group "$RESOURCE_GROUP" \
        --query defaultHostname \
        -o tsv)

    print_success "Static Web App deployed successfully!"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}App Details:${NC}"
    echo "  Name:            $APP_NAME"
    echo "  Resource Group:  $RESOURCE_GROUP"
    echo "  Location:        $LOCATION"
    echo "  URL:             https://$app_url"
    echo ""
    echo -e "${GREEN}Next Steps:${NC}"
    echo "  1. Visit https://$app_url to access the admin UI"
    echo "  2. Configure backend API connection if needed"
    if [ -n "$GITHUB_REPO" ]; then
        echo "  3. Push to GitHub to trigger automatic deployments"
        echo "  4. Add AZURE_STATIC_WEB_APPS_API_TOKEN secret to GitHub"
    fi
    echo "  5. Set up custom domain (optional):"
    echo "     az staticwebapp hostname set \\"
    echo "       --name $APP_NAME \\"
    echo "       --resource-group $RESOURCE_GROUP \\"
    echo "       --hostname admin.ultracore.io"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo ""

    # Open in browser (optional)
    read -p "$(echo -e ${CYAN}Open in browser? [Y/n]: ${NC})" confirm
    if [[ ! "$confirm" =~ ^[Nn]$ ]]; then
        if command -v open &> /dev/null; then
            open "https://$app_url"
        elif command -v xdg-open &> /dev/null; then
            xdg-open "https://$app_url"
        else
            print_info "Please open https://$app_url in your browser"
        fi
    fi
}

##############################################################################
# Cleanup Function
##############################################################################

cleanup_deployment() {
    print_header "Cleanup"

    read -p "$(echo -e ${RED}Delete Static Web App '$APP_NAME'? [y/N]: ${NC})" confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        print_info "Deleting Static Web App..."
        az staticwebapp delete \
            --name "$APP_NAME" \
            --resource-group "$RESOURCE_GROUP" \
            --yes \
            --output none
        print_success "Static Web App deleted"

        if [ -f ".azure-deployment-config" ]; then
            rm .azure-deployment-config
            print_info "Configuration file removed"
        fi
    else
        print_info "Cleanup cancelled"
    fi
}

##############################################################################
# Main Execution
##############################################################################

main() {
    print_header "Azure Static Web Apps Deployment - ${APP_NAME}"

    # Parse command line arguments
    case "${1:-deploy}" in
        deploy)
            check_prerequisites
            collect_configuration
            build_application
            create_azure_resources
            deploy_application
            configure_api_backend
            setup_github_actions
            create_azure_config
            complete_deployment
            ;;
        cleanup)
            cleanup_deployment
            ;;
        rebuild)
            build_application
            deploy_application
            ;;
        *)
            echo "Usage: $0 {deploy|cleanup|rebuild}"
            echo ""
            echo "Commands:"
            echo "  deploy   - Full deployment (default)"
            echo "  cleanup  - Delete Static Web App"
            echo "  rebuild  - Rebuild and redeploy"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
