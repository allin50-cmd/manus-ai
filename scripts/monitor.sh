#!/bin/bash

# UltraCore Monitoring Dashboard
# Real-time monitoring of all services

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
ACTIONS_API="${ACTIONS_API_URL:-http://localhost:4000}"
JOBE_API="${JOBE_API_URL:-http://localhost:3000}"
REFRESH_INTERVAL=${MONITOR_REFRESH:-5}

# Check if service is healthy
check_service() {
    local url=$1
    local timeout=2

    if curl -s -f --max-time $timeout "$url" > /dev/null 2>&1; then
        echo "healthy"
    else
        echo "down"
    fi
}

# Get service response time
get_response_time() {
    local url=$1
    local time=$(curl -s -o /dev/null -w "%{time_total}" --max-time 2 "$url" 2>/dev/null || echo "0")
    echo "$time"
}

# Get container status
get_container_status() {
    local container=$1
    if docker-compose ps -q "$container" > /dev/null 2>&1; then
        local status=$(docker-compose ps "$container" 2>/dev/null | grep "$container" | awk '{print $4}')
        echo "$status"
    else
        echo "N/A"
    fi
}

# Get container CPU usage
get_container_cpu() {
    local container=$1
    local stats=$(docker stats --no-stream --format "{{.CPUPerc}}" "$container" 2>/dev/null | tr -d '%')
    if [ -n "$stats" ]; then
        echo "${stats}%"
    else
        echo "N/A"
    fi
}

# Get container memory usage
get_container_memory() {
    local container=$1
    local stats=$(docker stats --no-stream --format "{{.MemUsage}}" "$container" 2>/dev/null)
    if [ -n "$stats" ]; then
        echo "$stats"
    else
        echo "N/A"
    fi
}

# Get recent deployment count
get_deployment_count() {
    local response=$(curl -s "$ACTIONS_API/api/deployments?limit=100" 2>/dev/null)
    local count=$(echo "$response" | grep -o '"count":[0-9]*' | grep -o '[0-9]*')
    echo "${count:-0}"
}

# Display dashboard
display_dashboard() {
    clear

    # Header
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║           UltraCore Real-Time Monitoring Dashboard                ║${NC}"
    echo -e "${CYAN}╠═══════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC} Last Update: $(date '+%Y-%m-%d %H:%M:%S')                              ${CYAN}║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Service Health
    echo -e "${BLUE}━━━ Service Health ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Actions API
    local actions_health=$(check_service "$ACTIONS_API/health")
    local actions_time=$(get_response_time "$ACTIONS_API/health")
    echo -n "  Actions API (4000):    "
    if [ "$actions_health" = "healthy" ]; then
        echo -e "${GREEN}✓ Healthy${NC} (${actions_time}s)"
    else
        echo -e "${RED}✗ Down${NC}"
    fi

    # Jobe API
    local jobe_health=$(check_service "$JOBE_API/health")
    local jobe_time=$(get_response_time "$JOBE_API/health")
    echo -n "  Jobe AI API (3000):    "
    if [ "$jobe_health" = "healthy" ]; then
        echo -e "${GREEN}✓ Healthy${NC} (${jobe_time}s)"
    else
        echo -e "${RED}✗ Down${NC}"
    fi

    # PostgreSQL
    echo -n "  PostgreSQL (5432):     "
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Ready${NC}"
    else
        echo -e "${RED}✗ Down${NC}"
    fi

    # Redis
    echo -n "  Redis (6379):          "
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        local redis_ping=$(docker-compose exec -T redis redis-cli ping 2>/dev/null | tr -d '\r')
        echo -e "${GREEN}✓ $redis_ping${NC}"
    else
        echo -e "${RED}✗ Down${NC}"
    fi

    echo ""

    # Container Stats
    echo -e "${BLUE}━━━ Container Resources ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    printf "  %-25s %-12s %-12s %-20s\n" "Container" "Status" "CPU" "Memory"
    printf "  %-25s %-12s %-12s %-20s\n" "─────────" "──────" "───" "──────"

    # Actions API
    local actions_status=$(get_container_status "actions-api")
    local actions_cpu=$(get_container_cpu "ultracore-actions-api")
    local actions_mem=$(get_container_memory "ultracore-actions-api")
    printf "  %-25s " "actions-api"
    if [ "$actions_status" = "running" ] || [ "$actions_status" = "Up" ]; then
        echo -e "${GREEN}Running${NC}     $actions_cpu      $actions_mem"
    else
        echo -e "${RED}$actions_status${NC}"
    fi

    # Jobe API
    local jobe_status=$(get_container_status "jobe-api")
    local jobe_cpu=$(get_container_cpu "ultracore-jobe-api")
    local jobe_mem=$(get_container_memory "ultracore-jobe-api")
    printf "  %-25s " "jobe-api"
    if [ "$jobe_status" = "running" ] || [ "$jobe_status" = "Up" ]; then
        echo -e "${GREEN}Running${NC}     $jobe_cpu      $jobe_mem"
    else
        echo -e "${RED}$jobe_status${NC}"
    fi

    # PostgreSQL
    local postgres_status=$(get_container_status "postgres")
    local postgres_cpu=$(get_container_cpu "ultracore-postgres")
    local postgres_mem=$(get_container_memory "ultracore-postgres")
    printf "  %-25s " "postgres"
    if [ "$postgres_status" = "running" ] || [ "$postgres_status" = "Up" ]; then
        echo -e "${GREEN}Running${NC}     $postgres_cpu      $postgres_mem"
    else
        echo -e "${RED}$postgres_status${NC}"
    fi

    # Redis
    local redis_status=$(get_container_status "redis")
    local redis_cpu=$(get_container_cpu "ultracore-redis")
    local redis_mem=$(get_container_memory "ultracore-redis")
    printf "  %-25s " "redis"
    if [ "$redis_status" = "running" ] || [ "$redis_status" = "Up" ]; then
        echo -e "${GREEN}Running${NC}     $redis_cpu      $redis_mem"
    else
        echo -e "${RED}$redis_status${NC}"
    fi

    echo ""

    # Activity Stats
    echo -e "${BLUE}━━━ Activity Statistics ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    local deployment_count=$(get_deployment_count)
    echo "  Total Deployments:     $deployment_count"

    # Get recent deployments
    local recent=$(curl -s "$ACTIONS_API/api/deployments?limit=5" 2>/dev/null)
    if [ -n "$recent" ]; then
        local recent_success=$(echo "$recent" | grep -o '"status":"completed"' | wc -l)
        local recent_failed=$(echo "$recent" | grep -o '"status":"failed"' | wc -l)
        echo "  Recent (last 5):       ${GREEN}$recent_success completed${NC}, ${RED}$recent_failed failed${NC}"
    fi

    echo ""

    # System Info
    echo -e "${BLUE}━━━ System Information ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Docker disk usage
    local docker_disk=$(docker system df --format "{{.Type}}: {{.Size}}" 2>/dev/null | head -3)
    echo "$docker_disk" | while IFS= read -r line; do
        echo "  $line"
    done

    echo ""

    # Footer
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Refreshing every ${REFRESH_INTERVAL}s... Press Ctrl+C to exit${NC}"
    echo ""
}

# Continuous monitoring
continuous_monitor() {
    while true; do
        display_dashboard
        sleep $REFRESH_INTERVAL
    done
}

# Single run
if [ "$1" = "--once" ]; then
    display_dashboard
else
    echo -e "${CYAN}Starting UltraCore Monitoring Dashboard...${NC}"
    echo -e "${CYAN}Refresh interval: ${REFRESH_INTERVAL}s${NC}"
    echo ""
    sleep 2
    continuous_monitor
fi
