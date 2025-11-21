#!/bin/bash
set -e

# UltraCore Local Development Stack Deployment
echo "🚀 UltraCore Local Development Stack"
echo "====================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check prerequisites
echo -e "${BLUE}📋 Checking Prerequisites...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "   Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✅ Docker found${NC}"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "   Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose found${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js not found (optional for local development)${NC}"
else
    echo -e "${GREEN}✅ Node.js found ($(node --version))${NC}"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}⚠️  npm not found (optional for local development)${NC}"
else
    echo -e "${GREEN}✅ npm found ($(npm --version))${NC}"
fi

echo ""

# ====================================================================
# ENVIRONMENT SETUP
# ====================================================================
echo -e "${BLUE}🔧 Setting up environment...${NC}"

# Check if .env exists, if not create it
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file...${NC}"
    cat > .env << EOF
# UltraCore Local Development Environment
NODE_ENV=development

# PostgreSQL Configuration
POSTGRES_DB=ultracore
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${POSTGRES_ADMIN_PASSWORD:-UltraCore123!}

# PgAdmin Configuration
PGADMIN_EMAIL=admin@ultracore.local
PGADMIN_PASSWORD=admin

# API Configuration
ACTIONS_PORT=4000
JOBE_PORT=3000

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
EOF
    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Source the .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo ""

# ====================================================================
# INSTALL DEPENDENCIES (if running locally)
# ====================================================================
if command -v npm &> /dev/null; then
    echo -e "${BLUE}📦 Installing Node.js dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
    echo ""
fi

# ====================================================================
# DOCKER SETUP
# ====================================================================
echo -e "${BLUE}🐳 Starting Docker containers...${NC}"

# Stop any existing containers
echo "   Stopping existing containers..."
docker-compose down --remove-orphans 2>/dev/null || true

# Build and start containers
echo "   Building and starting services..."
docker-compose up -d --build

echo -e "${GREEN}✅ Docker containers started${NC}"
echo ""

# ====================================================================
# WAIT FOR SERVICES
# ====================================================================
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"

# Wait for PostgreSQL
echo -n "   PostgreSQL: "
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U postgres &> /dev/null; then
        echo -e "${GREEN}Ready${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Wait for Redis
echo -n "   Redis: "
for i in {1..30}; do
    if docker-compose exec -T redis redis-cli ping &> /dev/null; then
        echo -e "${GREEN}Ready${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Wait for Actions API
echo -n "   Actions API: "
for i in {1..30}; do
    if curl -s http://localhost:4000/health &> /dev/null; then
        echo -e "${GREEN}Ready${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Wait for Jobe API
echo -n "   Jobe API: "
for i in {1..30}; do
    if curl -s http://localhost:3000/health &> /dev/null; then
        echo -e "${GREEN}Ready${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Wait for Brand Services
echo -n "   UltAI API: "
for i in {1..30}; do
    if curl -s http://localhost:3001/health &> /dev/null; then
        echo -e "${GREEN}Ready${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

echo -n "   FineGuard API: "
for i in {1..30}; do
    if curl -s http://localhost:3002/health &> /dev/null; then
        echo -e "${GREEN}Ready${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

echo -n "   VaultLine API: "
for i in {1..30}; do
    if curl -s http://localhost:3003/health &> /dev/null; then
        echo -e "${GREEN}Ready${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""

# ====================================================================
# DEPLOYMENT SUMMARY
# ====================================================================
echo -e "${GREEN}✅ UltraCore Local Stack Deployed Successfully!${NC}"
echo ""
echo -e "${BLUE}📊 DEPLOYMENT SUMMARY${NC}"
echo "=========================================="
echo -e "${GREEN}🌐 Actions API:${NC}      http://localhost:4000"
echo -e "${GREEN}🤖 Jobe AI API:${NC}      http://localhost:3000"
echo -e "${GREEN}🔷 UltAI API:${NC}        http://localhost:3001"
echo -e "${GREEN}🔷 FineGuard API:${NC}    http://localhost:3002"
echo -e "${GREEN}🔷 VaultLine API:${NC}    http://localhost:3003"
echo -e "${GREEN}🗄️  PostgreSQL:${NC}      localhost:5432"
echo -e "${GREEN}🔴 Redis:${NC}            localhost:6379"
echo -e "${GREEN}🎛️  PgAdmin:${NC}         http://localhost:5050"
echo ""
echo -e "${BLUE}📚 Quick Test Commands:${NC}"
echo "=========================================="
echo ""
echo "# Test Actions API Health"
echo "curl http://localhost:4000/health"
echo ""
echo "# List Available Bundles"
echo "curl -X POST http://localhost:4000/api/actions \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"action\":\"bundles.list\",\"payload\":{}}'"
echo ""
echo "# Deploy a Bundle (Dry Run)"
echo "curl -X POST http://localhost:4000/api/actions \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"action\":\"deploy.bundle\",\"payload\":{\"tenant\":\"ACCURACY\",\"bundle\":\"intake-stack\",\"dryRun\":true,\"sequential\":true}}'"
echo ""
echo "# Deploy a Bundle (Real)"
echo "curl -X POST http://localhost:4000/api/actions \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"action\":\"deploy.bundle\",\"payload\":{\"tenant\":\"ACCURACY\",\"bundle\":\"intake-stack\"}}'"
echo ""
echo "# Test Jobe AI Agent"
echo "curl -X POST http://localhost:3000/api/jobe/demo-bundle-debug \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{}'"
echo ""
echo "# Get Tenant Insights"
echo "curl -X POST http://localhost:3000/api/jobe/tenant-insights \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"tenant\":\"ACCURACY\"}'"
echo ""
echo -e "${BLUE}🛠️  Management Commands:${NC}"
echo "=========================================="
echo "# View logs"
echo "docker-compose logs -f"
echo ""
echo "# Stop all services"
echo "docker-compose down"
echo ""
echo "# Restart services"
echo "docker-compose restart"
echo ""
echo "# Rebuild and restart"
echo "docker-compose down && docker-compose up -d --build"
echo ""
echo -e "${GREEN}🎉 Happy coding!${NC}"
echo ""
