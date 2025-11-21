#!/bin/bash
# Stop all local services for UltraCore development

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🛑 Stopping UltraCore Local Services${NC}"
echo "========================================"
echo ""

# Stop Node.js services
if [ -f .pid-actions ]; then
    echo -n "Stopping Actions API... "
    kill $(cat .pid-actions) 2>/dev/null && echo -e "${GREEN}Stopped${NC}" || echo -e "${RED}Not running${NC}"
    rm .pid-actions
fi

if [ -f .pid-jobe ]; then
    echo -n "Stopping Jobe AI Agent... "
    kill $(cat .pid-jobe) 2>/dev/null && echo -e "${GREEN}Stopped${NC}" || echo -e "${RED}Not running${NC}"
    rm .pid-jobe
fi

if [ -f .pid-brands ]; then
    echo -n "Stopping Brand Services... "
    kill $(cat .pid-brands) 2>/dev/null && echo -e "${GREEN}Stopped${NC}" || echo -e "${RED}Not running${NC}"
    rm .pid-brands
fi

# Stop Docker services
echo ""
echo -e "${BLUE}🐳 Stopping Docker services...${NC}"
docker-compose down
echo -e "${GREEN}✅ Docker services stopped${NC}"

echo ""
echo -e "${GREEN}✅ All services stopped!${NC}"
echo ""
