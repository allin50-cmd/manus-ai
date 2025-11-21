#!/bin/bash

# UltraCore Deployment Validation Script
# Tests all deployed services and verifies functionality

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if deployment info file is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Usage: $0 <deployment-info-file.json>${NC}"
    echo "   Example: $0 deployment-development-123456.json"
    exit 1
fi

DEPLOY_FILE="$1"

if [ ! -f "$DEPLOY_FILE" ]; then
    echo -e "${RED}❌ Deployment file not found: $DEPLOY_FILE${NC}"
    exit 1
fi

echo "🔍 ULTRACORE DEPLOYMENT VALIDATION"
echo "====================================="
echo ""

# Parse deployment file
ACTIONS_URL=$(jq -r '.services.actionsApi.url' $DEPLOY_FILE)
JOBE_URL=$(jq -r '.services.jobeApi.url' $DEPLOY_FILE)
RESOURCE_GROUP=$(jq -r '.resourceGroup' $DEPLOY_FILE)
ENVIRONMENT=$(jq -r '.environment' $DEPLOY_FILE)

echo -e "${BLUE}Environment:${NC}      $ENVIRONMENT"
echo -e "${BLUE}Resource Group:${NC}   $RESOURCE_GROUP"
echo -e "${BLUE}Actions API:${NC}      $ACTIONS_URL"
echo -e "${BLUE}Jobe AI API:${NC}      $JOBE_URL"
echo ""

PASSED=0
FAILED=0

# Helper function to test endpoint
test_endpoint() {
    local name="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="${4:-}"
    local expected_status="${5:-200}"

    echo -n "Testing $name... "

    if [ "$method" = "POST" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null || echo "000")
    else
        RESPONSE=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null || echo "000")
    fi

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')

    if [ "$HTTP_CODE" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASSED${NC} (HTTP $HTTP_CODE)"
        ((PASSED++))

        # Show response if verbose
        if [ ! -z "$VERBOSE" ]; then
            echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
        fi
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $HTTP_CODE, expected $expected_status)"
        ((FAILED++))

        # Show error details
        echo -e "${YELLOW}Response:${NC}"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
        return 1
    fi
}

# ====================================================================
# TEST SUITE
# ====================================================================
echo -e "${BLUE}🧪 Running Test Suite${NC}"
echo "=========================================="
echo ""

# Test 1: Actions API Health Check
test_endpoint "Actions API Health" "$ACTIONS_URL/health"

# Test 2: Jobe AI Health Check
test_endpoint "Jobe AI Health" "$JOBE_URL/health"

# Test 3: List Bundles
test_endpoint "List Bundles" "$ACTIONS_URL/api/actions" "POST" \
    '{"action":"bundles.list","payload":{}}'

# Test 4: Deploy Bundle (Dry Run)
test_endpoint "Deploy Bundle (Dry Run)" "$ACTIONS_URL/api/actions" "POST" \
    '{"action":"deploy.bundle","payload":{"tenant":"VALIDATION_TEST","bundle":"intake-stack","dryRun":true,"sequential":true}}'

# Test 5: Agent Run
test_endpoint "Agent Run" "$ACTIONS_URL/api/actions" "POST" \
    '{"action":"agent.run","payload":{"agent":"jobe","input":{"tenant":"VALIDATION_TEST"}}}'

# Test 6: Jobe Demo Bundle Debug
test_endpoint "Jobe Demo Bundle Debug" "$JOBE_URL/api/jobe/demo-bundle-debug" "POST" \
    '{}'

# Test 7: Jobe Tenant Insights
test_endpoint "Jobe Tenant Insights" "$JOBE_URL/api/jobe/tenant-insights" "POST" \
    '{"tenant":"VALIDATION_TEST"}'

# Test 8: Jobe System Health
test_endpoint "Jobe System Health" "$JOBE_URL/api/jobe/system-health" "POST" \
    '{}'

# Test 9: Jobe Optimize Deployment
test_endpoint "Jobe Optimize Deployment" "$JOBE_URL/api/jobe/optimize-deployment" "POST" \
    '{"bundle":"intake-stack","tenant":"VALIDATION_TEST"}'

# Test 10: Jobe Predict Issues
test_endpoint "Jobe Predict Issues" "$JOBE_URL/api/jobe/predict-issues" "POST" \
    '{"bundle":"intake-stack","tenant":"VALIDATION_TEST"}'

# Test 11: Deployments History
test_endpoint "Deployments History" "$ACTIONS_URL/api/deployments?limit=5"

# Test 12: Tenant Status
test_endpoint "Tenant Status" "$ACTIONS_URL/api/actions" "POST" \
    '{"action":"tenant.status","payload":{"tenant":"VALIDATION_TEST"}}'

echo ""
echo "=========================================="
echo -e "${BLUE}📊 TEST RESULTS${NC}"
echo "=========================================="
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${RED}Failed:${NC} $FAILED"
echo -e "${BLUE}Total:${NC}  $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}🎉 Deployment is healthy and functional${NC}"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo -e "${YELLOW}⚠️  Please check the deployment${NC}"
    exit 1
fi
