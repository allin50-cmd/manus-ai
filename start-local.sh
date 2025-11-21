#!/bin/bash
# Start all local services for UltraCore development

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting UltraCore Local Services${NC}"
echo "========================================"
echo ""

# Check if ports are already in use
check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $port is already in use (may be $service already running)${NC}"
        return 1
    fi
    return 0
}

# Start Docker services
echo -e "${BLUE}📦 Starting Docker services (PostgreSQL, Redis, PgAdmin)...${NC}"
docker-compose up -d
echo -e "${GREEN}✅ Docker services started${NC}"
echo ""

# Wait for PostgreSQL to be ready
echo -n "⏳ Waiting for PostgreSQL..."
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
        echo -e " ${GREEN}Ready${NC}"
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

# Start Actions API
echo -e "${BLUE}🌐 Starting Actions API on port 4000...${NC}"
if check_port 4000 "Actions API"; then
    PORT=4000 node actions-server.js > logs/actions-api.log 2>&1 &
    echo $! > .pid-actions
    echo -e "${GREEN}✅ Actions API started (PID: $(cat .pid-actions))${NC}"
else
    echo -e "${YELLOW}⚠️  Actions API may already be running${NC}"
fi
echo ""

# Start Jobe AI Agent
echo -e "${BLUE}🤖 Starting Jobe AI Agent on port 3000...${NC}"
if check_port 3000 "Jobe AI Agent"; then
    JOBE_PORT=3000 node jobe-server.js > logs/jobe-api.log 2>&1 &
    echo $! > .pid-jobe
    echo -e "${GREEN}✅ Jobe AI Agent started (PID: $(cat .pid-jobe))${NC}"
else
    echo -e "${YELLOW}⚠️  Jobe AI Agent may already be running${NC}"
fi
echo ""

# Start Brand Services
echo -e "${BLUE}🔷 Starting Brand Services (ports 3001-3003)...${NC}"
if check_port 3001 "Brand Services"; then
    node brand-services.js > logs/brand-services.log 2>&1 &
    echo $! > .pid-brands
    echo -e "${GREEN}✅ Brand Services started (PID: $(cat .pid-brands))${NC}"
else
    echo -e "${YELLOW}⚠️  Brand Services may already be running${NC}"
fi
echo ""

# Create logs directory if it doesn't exist
mkdir -p logs

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 3

# Check service health
echo ""
echo -e "${BLUE}🏥 Health Check:${NC}"
check_health() {
    local url=$1
    local name=$2
    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ $name${NC} - $url"
    else
        echo -e "   ${YELLOW}⚠️  $name${NC} - Not responding yet"
    fi
}

check_health "http://localhost:4000/health" "Actions API"
check_health "http://localhost:3000/health" "Jobe AI Agent"
check_health "http://localhost:3001/health" "UltAI API"
check_health "http://localhost:3002/health" "FineGuard API"
check_health "http://localhost:3003/health" "VaultLine API"

echo ""
echo -e "${GREEN}✅ All services started!${NC}"
echo ""
echo -e "${BLUE}📝 Quick Commands:${NC}"
echo "   View logs:      tail -f logs/*.log"
echo "   Stop services:  ./stop-local.sh"
echo "   Test demo:      curl -X POST http://localhost:3000/api/jobe/demo-bundle-debug -H 'Content-Type: application/json' -d '{}'"
echo ""
