#!/bin/bash

# Deployment Script Validator (No Azure/Docker Required)
# Validates the deployment script logic, syntax, and configuration

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔍 DEPLOYMENT SCRIPT VALIDATION"
echo "================================"
echo ""

PASSED=0
FAILED=0
WARNINGS=0

# Test function
test_check() {
    local name="$1"
    local result="$2"

    if [ "$result" = "pass" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $name"
        ((PASSED++))
    elif [ "$result" = "warn" ]; then
        echo -e "${YELLOW}⚠️  WARN${NC}: $name"
        ((WARNINGS++))
    else
        echo -e "${RED}❌ FAIL${NC}: $name"
        ((FAILED++))
    fi
}

# Check 1: Script files exist
echo -e "${BLUE}Testing: File Existence${NC}"
if [ -f "deploy-ultracore-optimized-v2.sh" ]; then
    test_check "Deployment script exists" "pass"
else
    test_check "Deployment script exists" "fail"
fi

if [ -f "validate-deployment.sh" ]; then
    test_check "Validation script exists" "pass"
else
    test_check "Validation script exists" "fail"
fi

if [ -f "monitor-azure-deployment.sh" ]; then
    test_check "Monitoring script exists" "pass"
else
    test_check "Monitoring script exists" "fail"
fi

echo ""

# Check 2: Scripts are executable
echo -e "${BLUE}Testing: File Permissions${NC}"
if [ -x "deploy-ultracore-optimized-v2.sh" ]; then
    test_check "Deployment script is executable" "pass"
else
    test_check "Deployment script is executable" "fail"
fi

if [ -x "validate-deployment.sh" ]; then
    test_check "Validation script is executable" "pass"
else
    test_check "Validation script is executable" "fail"
fi

if [ -x "monitor-azure-deployment.sh" ]; then
    test_check "Monitoring script is executable" "pass"
else
    test_check "Monitoring script is executable" "fail"
fi

echo ""

# Check 3: Bash syntax validation
echo -e "${BLUE}Testing: Bash Syntax${NC}"
if bash -n deploy-ultracore-optimized-v2.sh 2>/dev/null; then
    test_check "Deployment script syntax valid" "pass"
else
    test_check "Deployment script syntax valid" "fail"
fi

if bash -n validate-deployment.sh 2>/dev/null; then
    test_check "Validation script syntax valid" "pass"
else
    test_check "Validation script syntax valid" "fail"
fi

if bash -n monitor-azure-deployment.sh 2>/dev/null; then
    test_check "Monitoring script syntax valid" "pass"
else
    test_check "Monitoring script syntax valid" "fail"
fi

echo ""

# Check 4: Required files referenced
echo -e "${BLUE}Testing: File References${NC}"
if [ -f "Dockerfile.actions" ]; then
    test_check "Dockerfile.actions exists (required for build)" "pass"
else
    test_check "Dockerfile.actions exists (required for build)" "fail"
fi

if [ -f "Dockerfile.jobe" ]; then
    test_check "Dockerfile.jobe exists (required for build)" "pass"
else
    test_check "Dockerfile.jobe exists (required for build)" "fail"
fi

if [ -f "actions-server.js" ]; then
    test_check "actions-server.js exists (Docker build)" "pass"
else
    test_check "actions-server.js exists (Docker build)" "fail"
fi

if [ -f "jobe-server.js" ]; then
    test_check "jobe-server.js exists (Docker build)" "pass"
else
    test_check "jobe-server.js exists (Docker build)" "fail"
fi

if [ -f "package.json" ]; then
    test_check "package.json exists (Docker build)" "pass"
else
    test_check "package.json exists (Docker build)" "fail"
fi

echo ""

# Check 5: Script configuration validation
echo -e "${BLUE}Testing: Script Configuration${NC}"

# Check for set -e
if grep -q "^set -e" deploy-ultracore-optimized-v2.sh; then
    test_check "Script uses 'set -e' (fail on error)" "pass"
else
    test_check "Script uses 'set -e' (fail on error)" "fail"
fi

# Check for Azure CLI commands
if grep -q "az group create" deploy-ultracore-optimized-v2.sh; then
    test_check "Creates resource group" "pass"
else
    test_check "Creates resource group" "fail"
fi

if grep -q "az acr create" deploy-ultracore-optimized-v2.sh; then
    test_check "Creates Azure Container Registry" "pass"
else
    test_check "Creates Azure Container Registry" "fail"
fi

if grep -q "docker build" deploy-ultracore-optimized-v2.sh; then
    test_check "Builds Docker images" "pass"
else
    test_check "Builds Docker images" "fail"
fi

if grep -q "docker push" deploy-ultracore-optimized-v2.sh; then
    test_check "Pushes Docker images" "pass"
else
    test_check "Pushes Docker images" "fail"
fi

if grep -q "az postgres flexible-server create" deploy-ultracore-optimized-v2.sh; then
    test_check "Creates PostgreSQL server" "pass"
else
    test_check "Creates PostgreSQL server" "fail"
fi

if grep -q "az containerapp create" deploy-ultracore-optimized-v2.sh; then
    test_check "Creates container apps" "pass"
else
    test_check "Creates container apps" "fail"
fi

if grep -q "az keyvault" deploy-ultracore-optimized-v2.sh; then
    test_check "Uses Key Vault for secrets" "pass"
else
    test_check "Uses Key Vault for secrets" "fail"
fi

echo ""

# Check 6: Environment variable handling
echo -e "${BLUE}Testing: Environment Variables${NC}"

ENV_VARS=(
    "POSTGRES_HOST"
    "POSTGRES_USER"
    "POSTGRES_PASSWORD"
    "POSTGRES_DB"
    "REDIS_HOST"
    "REDIS_KEY"
    "APPINSIGHTS_INSTRUMENTATIONKEY"
)

for var in "${ENV_VARS[@]}"; do
    if grep -q "$var" deploy-ultracore-optimized-v2.sh; then
        test_check "Sets $var environment variable" "pass"
    else
        test_check "Sets $var environment variable" "warn"
    fi
done

echo ""

# Check 7: Documentation
echo -e "${BLUE}Testing: Documentation${NC}"

if [ -f "AZURE-DEPLOYMENT-GUIDE.md" ]; then
    test_check "Deployment guide exists" "pass"
else
    test_check "Deployment guide exists" "fail"
fi

if [ -f "OPTION-2-IMPROVEMENTS.md" ]; then
    test_check "Improvements summary exists" "pass"
else
    test_check "Improvements summary exists" "fail"
fi

if grep -q "Option 2" README.md; then
    test_check "README mentions Option 2" "pass"
else
    test_check "README mentions Option 2" "fail"
fi

echo ""

# Check 8: Validation script structure
echo -e "${BLUE}Testing: Validation Script${NC}"

if grep -q "test_endpoint" validate-deployment.sh; then
    test_check "Validation has test_endpoint function" "pass"
else
    test_check "Validation has test_endpoint function" "fail"
fi

if grep -q "jq -r" validate-deployment.sh; then
    test_check "Validation uses jq for JSON parsing" "pass"
else
    test_check "Validation uses jq for JSON parsing" "fail"
fi

if grep -q "/health" validate-deployment.sh; then
    test_check "Validation checks health endpoints" "pass"
else
    test_check "Validation checks health endpoints" "fail"
fi

echo ""

# Check 9: Monitoring script structure
echo -e "${BLUE}Testing: Monitoring Script${NC}"

if grep -q "get_container_metrics" monitor-azure-deployment.sh; then
    test_check "Monitoring has container metrics function" "pass"
else
    test_check "Monitoring has container metrics function" "fail"
fi

if grep -q "check_http_endpoint" monitor-azure-deployment.sh; then
    test_check "Monitoring checks HTTP endpoints" "pass"
else
    test_check "Monitoring checks HTTP endpoints" "fail"
fi

if grep -q "--once" monitor-azure-deployment.sh; then
    test_check "Monitoring supports one-shot mode" "pass"
else
    test_check "Monitoring supports one-shot mode" "fail"
fi

echo ""

# Check 10: Security best practices
echo -e "${BLUE}Testing: Security Practices${NC}"

if grep -q "POSTGRES_ADMIN_PASSWORD=.*openssl rand" deploy-ultracore-optimized-v2.sh; then
    test_check "Generates secure random password" "pass"
else
    test_check "Generates secure random password" "fail"
fi

if grep -q "az keyvault secret set" deploy-ultracore-optimized-v2.sh; then
    test_check "Stores secrets in Key Vault" "pass"
else
    test_check "Stores secrets in Key Vault" "fail"
fi

if grep -q "minimum-tls-version.*1.2" deploy-ultracore-optimized-v2.sh; then
    test_check "Enforces TLS 1.2 minimum" "pass"
else
    test_check "Enforces TLS 1.2 minimum" "warn"
fi

echo ""

# Check 11: Error handling
echo -e "${BLUE}Testing: Error Handling${NC}"

if grep -q "command -v az" deploy-ultracore-optimized-v2.sh; then
    test_check "Checks for Azure CLI" "pass"
else
    test_check "Checks for Azure CLI" "fail"
fi

if grep -q "command -v docker" deploy-ultracore-optimized-v2.sh; then
    test_check "Checks for Docker" "pass"
else
    test_check "Checks for Docker" "fail"
fi

if grep -q "az account show" deploy-ultracore-optimized-v2.sh; then
    test_check "Checks Azure login status" "pass"
else
    test_check "Checks Azure login status" "fail"
fi

echo ""

# Check 12: Output and logging
echo -e "${BLUE}Testing: Output Quality${NC}"

if grep -q 'GREEN=.*033' deploy-ultracore-optimized-v2.sh; then
    test_check "Uses colored output" "pass"
else
    test_check "Uses colored output" "warn"
fi

if grep -q "echo.*Deployment" deploy-ultracore-optimized-v2.sh; then
    test_check "Provides deployment progress messages" "pass"
else
    test_check "Provides deployment progress messages" "fail"
fi

if grep -q "deployment-.*json" deploy-ultracore-optimized-v2.sh; then
    test_check "Exports deployment information" "pass"
else
    test_check "Exports deployment information" "fail"
fi

echo ""

# Summary
echo "========================================"
echo -e "${BLUE}VALIDATION RESULTS${NC}"
echo "========================================"
echo -e "${GREEN}Passed:${NC}   $PASSED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "${RED}Failed:${NC}   $FAILED"
echo -e "${BLUE}Total:${NC}    $((PASSED + WARNINGS + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CRITICAL TESTS PASSED!${NC}"
    echo -e "${GREEN}📝 Script is ready for Azure deployment${NC}"

    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  There are $WARNINGS warnings to review${NC}"
    fi

    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Review AZURE-TESTING-CHECKLIST.md for deployment instructions"
    echo "2. Ensure Azure CLI and Docker are installed"
    echo "3. Login to Azure: az login"
    echo "4. Run: ./deploy-ultracore-optimized-v2.sh development"
    echo ""

    exit 0
else
    echo -e "${RED}❌ SOME CRITICAL TESTS FAILED${NC}"
    echo -e "${YELLOW}⚠️  Please fix the issues before deploying${NC}"
    echo ""
    exit 1
fi
