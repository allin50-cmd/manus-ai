#!/usr/bin/env node

/**
 * UltraCore API Test Suite
 * Automated testing for Actions API and Jobe AI Agent
 */

const http = require('http');

const ACTIONS_API = process.env.ACTIONS_API_URL || 'http://localhost:4000';
const JOBE_API = process.env.JOBE_API_URL || 'http://localhost:3000';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results
let passed = 0;
let failed = 0;
const results = [];

// Helper to make HTTP requests
function makeRequest(url, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: data ? 'POST' : 'GET',
      headers: data ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      } : {},
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => reject(error));
    if (data) req.write(data);
    req.end();
  });
}

// Test runner
async function runTest(name, testFn) {
  process.stdout.write(`${colors.blue}Running: ${name}...${colors.reset} `);
  try {
    const result = await testFn();
    if (result.success) {
      console.log(`${colors.green}✓ PASS${colors.reset}`);
      if (result.message) {
        console.log(`  ${colors.cyan}${result.message}${colors.reset}`);
      }
      passed++;
      results.push({ name, status: 'PASS', message: result.message });
    } else {
      console.log(`${colors.red}✗ FAIL${colors.reset}`);
      if (result.error) {
        console.log(`  ${colors.red}Error: ${result.error}${colors.reset}`);
      }
      failed++;
      results.push({ name, status: 'FAIL', error: result.error });
    }
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset}`);
    console.log(`  ${colors.red}Exception: ${error.message}${colors.reset}`);
    failed++;
    results.push({ name, status: 'FAIL', error: error.message });
  }
}

// Test definitions
const tests = [
  {
    name: 'Actions API - Health Check',
    test: async () => {
      const response = await makeRequest(`${ACTIONS_API}/health`);
      return {
        success: response.status === 200 && response.data.status === 'healthy',
        message: `Service: ${response.data.service}, Version: ${response.data.version}`,
      };
    },
  },
  {
    name: 'Jobe API - Health Check',
    test: async () => {
      const response = await makeRequest(`${JOBE_API}/health`);
      return {
        success: response.status === 200 && response.data.status === 'healthy',
        message: `AI Model: ${response.data.ai?.model}, Status: ${response.data.ai?.status}`,
      };
    },
  },
  {
    name: 'Actions API - List Bundles',
    test: async () => {
      const data = JSON.stringify({ action: 'bundles.list', payload: {} });
      const response = await makeRequest(`${ACTIONS_API}/api/actions`, data);
      const bundleCount = response.data.data?.bundles?.length || 0;
      return {
        success: response.data.ok === true && bundleCount > 0,
        message: `Found ${bundleCount} bundles`,
      };
    },
  },
  {
    name: 'Actions API - Deploy Bundle (Dry Run)',
    test: async () => {
      const data = JSON.stringify({
        action: 'deploy.bundle',
        payload: {
          tenant: 'TEST',
          bundle: 'intake-stack',
          dryRun: true,
          sequential: true,
        },
      });
      const response = await makeRequest(`${ACTIONS_API}/api/actions`, data);
      const deployments = response.data.data?.deployments || [];
      return {
        success: response.data.ok === true && response.data.data.dryRun === true,
        message: `Deployed ${deployments.length} services in dry run mode`,
      };
    },
  },
  {
    name: 'Actions API - Deploy Bundle (Parallel)',
    test: async () => {
      const data = JSON.stringify({
        action: 'deploy.bundle',
        payload: {
          tenant: 'TEST',
          bundle: 'ultraengage-stack',
          dryRun: true,
          sequential: false,
        },
      });
      const response = await makeRequest(`${ACTIONS_API}/api/actions`, data);
      const sequential = response.data.data?.sequential || false;
      return {
        success: response.data.ok === true && !sequential,
        message: `Parallel deployment completed`,
      };
    },
  },
  {
    name: 'Actions API - Run Agent',
    test: async () => {
      const data = JSON.stringify({
        action: 'agent.run',
        payload: {
          agent: 'test-agent',
          input: { tenant: 'TEST', context: 'testing' },
        },
      });
      const response = await makeRequest(`${ACTIONS_API}/api/actions`, data);
      return {
        success: response.data.ok === true,
        message: `Agent execution completed`,
      };
    },
  },
  {
    name: 'Actions API - Get Tenant Status',
    test: async () => {
      const data = JSON.stringify({
        action: 'tenant.status',
        payload: { tenant: 'TEST' },
      });
      const response = await makeRequest(`${ACTIONS_API}/api/actions`, data);
      return {
        success: response.data.ok === true,
        message: `Retrieved tenant status`,
      };
    },
  },
  {
    name: 'Actions API - View Deployment History',
    test: async () => {
      const response = await makeRequest(`${ACTIONS_API}/api/deployments?limit=5`);
      const count = response.data.data?.deployments?.length || 0;
      return {
        success: response.data.ok === true,
        message: `Found ${count} deployment records`,
      };
    },
  },
  {
    name: 'Jobe AI - Demo Bundle Debug',
    test: async () => {
      const data = JSON.stringify({});
      const response = await makeRequest(`${JOBE_API}/api/jobe/demo-bundle-debug`, data);
      return {
        success: response.data.ok === true && response.data.data.debugMode === true,
        message: `Debug analysis completed`,
      };
    },
  },
  {
    name: 'Jobe AI - Tenant Insights',
    test: async () => {
      const data = JSON.stringify({ tenant: 'TEST' });
      const response = await makeRequest(`${JOBE_API}/api/jobe/tenant-insights`, data);
      return {
        success: response.data.ok === true && response.data.data.tenant === 'TEST',
        message: `Generated insights for tenant`,
      };
    },
  },
  {
    name: 'Jobe AI - Optimize Deployment',
    test: async () => {
      const data = JSON.stringify({ bundle: 'intake-stack', tenant: 'TEST' });
      const response = await makeRequest(`${JOBE_API}/api/jobe/optimize-deployment`, data);
      const suggestions = response.data.data?.suggestions?.length || 0;
      return {
        success: response.data.ok === true && suggestions > 0,
        message: `Generated ${suggestions} optimization suggestions`,
      };
    },
  },
  {
    name: 'Jobe AI - System Health',
    test: async () => {
      const data = JSON.stringify({});
      const response = await makeRequest(`${JOBE_API}/api/jobe/system-health`, data);
      return {
        success: response.data.ok === true && response.data.data.analysis,
        message: `System health: ${response.data.data.analysis?.health}`,
      };
    },
  },
  {
    name: 'Jobe AI - Predict Issues',
    test: async () => {
      const data = JSON.stringify({ bundle: 'ultraengage-stack', tenant: 'TEST' });
      const response = await makeRequest(`${JOBE_API}/api/jobe/predict-issues`, data);
      return {
        success: response.data.ok === true && response.data.data.overallRisk,
        message: `Risk level: ${response.data.data.overallRisk}, Confidence: ${response.data.data.confidence}`,
      };
    },
  },
  {
    name: 'Actions API - Error Handling (Invalid Action)',
    test: async () => {
      const data = JSON.stringify({ action: 'invalid.action', payload: {} });
      const response = await makeRequest(`${ACTIONS_API}/api/actions`, data);
      return {
        success: response.data.ok === false && response.status === 400,
        message: `Correctly rejected invalid action`,
      };
    },
  },
  {
    name: 'Actions API - Error Handling (Invalid Bundle)',
    test: async () => {
      const data = JSON.stringify({
        action: 'deploy.bundle',
        payload: { tenant: 'TEST', bundle: 'invalid-bundle' },
      });
      const response = await makeRequest(`${ACTIONS_API}/api/actions`, data);
      return {
        success: response.data.ok === false && response.status === 400,
        message: `Correctly rejected invalid bundle`,
      };
    },
  },
];

// Main test runner
async function main() {
  console.log(`${colors.cyan}╔═══════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║        UltraCore Automated Test Suite                ║${colors.reset}`);
  console.log(`${colors.cyan}╚═══════════════════════════════════════════════════════╝${colors.reset}`);
  console.log('');
  console.log(`${colors.blue}Actions API: ${ACTIONS_API}${colors.reset}`);
  console.log(`${colors.blue}Jobe AI API: ${JOBE_API}${colors.reset}`);
  console.log('');

  const startTime = Date.now();

  for (const test of tests) {
    await runTest(test.name, test.test);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('');
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}Test Results${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`Total Tests: ${tests.length}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Duration: ${duration}s`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log('');

  if (failed === 0) {
    console.log(`${colors.green}✓ All tests passed!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}✗ ${failed} test(s) failed${colors.reset}`);
    console.log('');
    console.log(`${colors.yellow}Failed Tests:${colors.reset}`);
    results
      .filter((r) => r.status === 'FAIL')
      .forEach((r) => {
        console.log(`  ${colors.red}✗${colors.reset} ${r.name}`);
        if (r.error) {
          console.log(`    ${colors.red}${r.error}${colors.reset}`);
        }
      });
    process.exit(1);
  }
}

// Run tests
main().catch((error) => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
