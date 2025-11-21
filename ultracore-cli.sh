#!/bin/bash

# UltraCore CLI - Command Line Interface for Actions API and Jobe AI
# Usage: ./ultracore-cli.sh <command> [options]

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
ACTIONS_API="${ACTIONS_API_URL:-http://localhost:4000}"
JOBE_API="${JOBE_API_URL:-http://localhost:3000}"

# Helper function to make API calls
call_api() {
    local url=$1
    local data=$2
    local method=${3:-POST}

    if [ "$method" = "GET" ]; then
        curl -s "$url"
    else
        curl -s -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data"
    fi
}

# Pretty print JSON
pretty_json() {
    if command -v jq &> /dev/null; then
        echo "$1" | jq '.'
    else
        echo "$1" | python3 -m json.tool 2>/dev/null || echo "$1"
    fi
}

# Show help
show_help() {
    cat << EOF
${BLUE}╔═══════════════════════════════════════════════════════╗
║        UltraCore CLI - Command Line Interface        ║
╚═══════════════════════════════════════════════════════╝${NC}

${CYAN}USAGE:${NC}
  ./ultracore-cli.sh <command> [options]

${CYAN}COMMANDS:${NC}

${GREEN}Actions API Commands:${NC}
  ${YELLOW}health${NC}                              Check Actions API health
  ${YELLOW}bundles${NC}                             List all available bundles
  ${YELLOW}deploy${NC} <tenant> <bundle>           Deploy a bundle
  ${YELLOW}deploy-dry${NC} <tenant> <bundle>       Deploy bundle (dry run)
  ${YELLOW}deploy-seq${NC} <tenant> <bundle>       Deploy bundle (sequential)
  ${YELLOW}status${NC} <tenant>                    Get tenant deployment status
  ${YELLOW}history${NC} [tenant] [limit]           View deployment history
  ${YELLOW}agent${NC} <agent> <tenant>             Run an AI agent

${GREEN}Jobe AI Commands:${NC}
  ${YELLOW}jobe-health${NC}                        Check Jobe API health
  ${YELLOW}jobe-debug${NC}                         Debug bundle deployment
  ${YELLOW}jobe-insights${NC} <tenant>             Get tenant insights
  ${YELLOW}jobe-optimize${NC} <bundle> <tenant>    Get optimization suggestions
  ${YELLOW}jobe-system${NC}                        System health analysis
  ${YELLOW}jobe-predict${NC} <bundle> <tenant>     Predict deployment issues

${GREEN}Utility Commands:${NC}
  ${YELLOW}status-all${NC}                         Check status of all services
  ${YELLOW}logs${NC} [service]                     View service logs
  ${YELLOW}restart${NC} [service]                  Restart service(s)
  ${YELLOW}test${NC}                               Run comprehensive tests

${CYAN}EXAMPLES:${NC}
  # Deploy a bundle
  ./ultracore-cli.sh deploy ACCURACY intake-stack

  # Deploy with dry run
  ./ultracore-cli.sh deploy-dry ACCURACY ultraengage-stack

  # Get tenant insights
  ./ultracore-cli.sh jobe-insights ACCURACY

  # Check all services
  ./ultracore-cli.sh status-all

  # View deployment history
  ./ultracore-cli.sh history ACCURACY 10

${CYAN}ENVIRONMENT VARIABLES:${NC}
  ACTIONS_API_URL      Actions API URL (default: http://localhost:4000)
  JOBE_API_URL         Jobe API URL (default: http://localhost:3000)

EOF
}

# Check service health
check_health() {
    echo -e "${BLUE}🏥 Checking Actions API health...${NC}"
    response=$(call_api "$ACTIONS_API/health" "" "GET")
    pretty_json "$response"
}

# Check Jobe health
check_jobe_health() {
    echo -e "${BLUE}🤖 Checking Jobe AI health...${NC}"
    response=$(call_api "$JOBE_API/health" "" "GET")
    pretty_json "$response"
}

# List bundles
list_bundles() {
    echo -e "${BLUE}📦 Fetching available bundles...${NC}"
    data='{"action":"bundles.list","payload":{}}'
    response=$(call_api "$ACTIONS_API/api/actions" "$data")
    pretty_json "$response"
}

# Deploy bundle
deploy_bundle() {
    local tenant=$1
    local bundle=$2
    local dry_run=${3:-false}
    local sequential=${4:-false}

    if [ -z "$tenant" ] || [ -z "$bundle" ]; then
        echo -e "${RED}❌ Error: Tenant and bundle are required${NC}"
        echo "Usage: $0 deploy <tenant> <bundle>"
        exit 1
    fi

    echo -e "${BLUE}🚀 Deploying ${bundle} for ${tenant}...${NC}"
    if [ "$dry_run" = "true" ]; then
        echo -e "${YELLOW}   [DRY RUN MODE]${NC}"
    fi
    if [ "$sequential" = "true" ]; then
        echo -e "${YELLOW}   [SEQUENTIAL MODE]${NC}"
    fi

    data="{\"action\":\"deploy.bundle\",\"payload\":{\"tenant\":\"$tenant\",\"bundle\":\"$bundle\",\"dryRun\":$dry_run,\"sequential\":$sequential}}"
    response=$(call_api "$ACTIONS_API/api/actions" "$data")
    pretty_json "$response"
}

# Get tenant status
get_tenant_status() {
    local tenant=$1

    if [ -z "$tenant" ]; then
        echo -e "${RED}❌ Error: Tenant is required${NC}"
        echo "Usage: $0 status <tenant>"
        exit 1
    fi

    echo -e "${BLUE}📊 Fetching status for ${tenant}...${NC}"
    data="{\"action\":\"tenant.status\",\"payload\":{\"tenant\":\"$tenant\"}}"
    response=$(call_api "$ACTIONS_API/api/actions" "$data")
    pretty_json "$response"
}

# View deployment history
view_history() {
    local tenant=$1
    local limit=${2:-50}

    echo -e "${BLUE}📜 Fetching deployment history...${NC}"

    if [ -n "$tenant" ]; then
        url="$ACTIONS_API/api/deployments?tenant=$tenant&limit=$limit"
    else
        url="$ACTIONS_API/api/deployments?limit=$limit"
    fi

    response=$(call_api "$url" "" "GET")
    pretty_json "$response"
}

# Run agent
run_agent() {
    local agent=$1
    local tenant=$2

    if [ -z "$agent" ] || [ -z "$tenant" ]; then
        echo -e "${RED}❌ Error: Agent and tenant are required${NC}"
        echo "Usage: $0 agent <agent> <tenant>"
        exit 1
    fi

    echo -e "${BLUE}🤖 Running agent ${agent} for ${tenant}...${NC}"
    data="{\"action\":\"agent.run\",\"payload\":{\"agent\":\"$agent\",\"input\":{\"tenant\":\"$tenant\"}}}"
    response=$(call_api "$ACTIONS_API/api/actions" "$data")
    pretty_json "$response"
}

# Jobe debug
jobe_debug() {
    echo -e "${BLUE}🔍 Running Jobe bundle debug...${NC}"
    data='{}'
    response=$(call_api "$JOBE_API/api/jobe/demo-bundle-debug" "$data")
    pretty_json "$response"
}

# Jobe tenant insights
jobe_insights() {
    local tenant=$1

    if [ -z "$tenant" ]; then
        echo -e "${RED}❌ Error: Tenant is required${NC}"
        echo "Usage: $0 jobe-insights <tenant>"
        exit 1
    fi

    echo -e "${BLUE}💡 Fetching insights for ${tenant}...${NC}"
    data="{\"tenant\":\"$tenant\"}"
    response=$(call_api "$JOBE_API/api/jobe/tenant-insights" "$data")
    pretty_json "$response"
}

# Jobe optimize
jobe_optimize() {
    local bundle=$1
    local tenant=$2

    if [ -z "$bundle" ] || [ -z "$tenant" ]; then
        echo -e "${RED}❌ Error: Bundle and tenant are required${NC}"
        echo "Usage: $0 jobe-optimize <bundle> <tenant>"
        exit 1
    fi

    echo -e "${BLUE}⚡ Generating optimization suggestions...${NC}"
    data="{\"bundle\":\"$bundle\",\"tenant\":\"$tenant\"}"
    response=$(call_api "$JOBE_API/api/jobe/optimize-deployment" "$data")
    pretty_json "$response"
}

# Jobe system health
jobe_system() {
    echo -e "${BLUE}🏥 Analyzing system health...${NC}"
    data='{}'
    response=$(call_api "$JOBE_API/api/jobe/system-health" "$data")
    pretty_json "$response"
}

# Jobe predict issues
jobe_predict() {
    local bundle=$1
    local tenant=$2

    if [ -z "$bundle" ] || [ -z "$tenant" ]; then
        echo -e "${RED}❌ Error: Bundle and tenant are required${NC}"
        echo "Usage: $0 jobe-predict <bundle> <tenant>"
        exit 1
    fi

    echo -e "${BLUE}🔮 Predicting deployment issues...${NC}"
    data="{\"bundle\":\"$bundle\",\"tenant\":\"$tenant\"}"
    response=$(call_api "$JOBE_API/api/jobe/predict-issues" "$data")
    pretty_json "$response"
}

# Status of all services
status_all() {
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║           UltraCore Services Status                   ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Check Actions API
    echo -n "Actions API (port 4000): "
    if curl -s -f "$ACTIONS_API/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Healthy${NC}"
    else
        echo -e "${RED}❌ Down${NC}"
    fi

    # Check Jobe API
    echo -n "Jobe AI API (port 3000): "
    if curl -s -f "$JOBE_API/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Healthy${NC}"
    else
        echo -e "${RED}❌ Down${NC}"
    fi

    # Check PostgreSQL
    echo -n "PostgreSQL (port 5432): "
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Ready${NC}"
    else
        echo -e "${RED}❌ Down${NC}"
    fi

    # Check Redis
    echo -n "Redis (port 6379): "
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Ready${NC}"
    else
        echo -e "${RED}❌ Down${NC}"
    fi

    echo ""
}

# View logs
view_logs() {
    local service=$1

    if [ -z "$service" ]; then
        echo -e "${BLUE}📋 Viewing all logs...${NC}"
        docker-compose logs --tail=50 -f
    else
        echo -e "${BLUE}📋 Viewing logs for ${service}...${NC}"
        docker-compose logs --tail=50 -f "$service"
    fi
}

# Restart services
restart_services() {
    local service=$1

    if [ -z "$service" ]; then
        echo -e "${BLUE}🔄 Restarting all services...${NC}"
        docker-compose restart
    else
        echo -e "${BLUE}🔄 Restarting ${service}...${NC}"
        docker-compose restart "$service"
    fi
    echo -e "${GREEN}✅ Restart complete${NC}"
}

# Run comprehensive tests
run_tests() {
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║           Running Comprehensive Tests                 ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""

    local passed=0
    local failed=0

    # Test 1: Actions API Health
    echo -n "Test 1: Actions API Health... "
    if curl -s -f "$ACTIONS_API/health" > /dev/null 2>&1; then
        echo -e "${GREEN}PASS${NC}"
        ((passed++))
    else
        echo -e "${RED}FAIL${NC}"
        ((failed++))
    fi

    # Test 2: Jobe API Health
    echo -n "Test 2: Jobe API Health... "
    if curl -s -f "$JOBE_API/health" > /dev/null 2>&1; then
        echo -e "${GREEN}PASS${NC}"
        ((passed++))
    else
        echo -e "${RED}FAIL${NC}"
        ((failed++))
    fi

    # Test 3: List Bundles
    echo -n "Test 3: List Bundles... "
    data='{"action":"bundles.list","payload":{}}'
    response=$(call_api "$ACTIONS_API/api/actions" "$data")
    if echo "$response" | grep -q "ok.*true"; then
        echo -e "${GREEN}PASS${NC}"
        ((passed++))
    else
        echo -e "${RED}FAIL${NC}"
        ((failed++))
    fi

    # Test 4: Dry Run Deployment
    echo -n "Test 4: Dry Run Deployment... "
    data='{"action":"deploy.bundle","payload":{"tenant":"TEST","bundle":"intake-stack","dryRun":true}}'
    response=$(call_api "$ACTIONS_API/api/actions" "$data")
    if echo "$response" | grep -q "ok.*true"; then
        echo -e "${GREEN}PASS${NC}"
        ((passed++))
    else
        echo -e "${RED}FAIL${NC}"
        ((failed++))
    fi

    # Test 5: Jobe Debug
    echo -n "Test 5: Jobe Debug... "
    data='{}'
    response=$(call_api "$JOBE_API/api/jobe/demo-bundle-debug" "$data")
    if echo "$response" | grep -q "ok.*true"; then
        echo -e "${GREEN}PASS${NC}"
        ((passed++))
    else
        echo -e "${RED}FAIL${NC}"
        ((failed++))
    fi

    # Test 6: Jobe System Health
    echo -n "Test 6: Jobe System Health... "
    data='{}'
    response=$(call_api "$JOBE_API/api/jobe/system-health" "$data")
    if echo "$response" | grep -q "ok.*true"; then
        echo -e "${GREEN}PASS${NC}"
        ((passed++))
    else
        echo -e "${RED}FAIL${NC}"
        ((failed++))
    fi

    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "Results: ${GREEN}$passed passed${NC}, ${RED}$failed failed${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo ""

    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}✅ All tests passed!${NC}"
        return 0
    else
        echo -e "${RED}❌ Some tests failed${NC}"
        return 1
    fi
}

# Main command router
case "${1:-help}" in
    help|--help|-h)
        show_help
        ;;
    health)
        check_health
        ;;
    jobe-health)
        check_jobe_health
        ;;
    bundles)
        list_bundles
        ;;
    deploy)
        deploy_bundle "$2" "$3" false false
        ;;
    deploy-dry)
        deploy_bundle "$2" "$3" true false
        ;;
    deploy-seq)
        deploy_bundle "$2" "$3" false true
        ;;
    status)
        get_tenant_status "$2"
        ;;
    history)
        view_history "$2" "$3"
        ;;
    agent)
        run_agent "$2" "$3"
        ;;
    jobe-debug)
        jobe_debug
        ;;
    jobe-insights)
        jobe_insights "$2"
        ;;
    jobe-optimize)
        jobe_optimize "$2" "$3"
        ;;
    jobe-system)
        jobe_system
        ;;
    jobe-predict)
        jobe_predict "$2" "$3"
        ;;
    status-all)
        status_all
        ;;
    logs)
        view_logs "$2"
        ;;
    restart)
        restart_services "$2"
        ;;
    test)
        run_tests
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
