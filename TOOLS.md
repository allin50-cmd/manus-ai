# UltraCore Developer Tools

Comprehensive tooling for managing, monitoring, and testing the UltraCore platform.

## Overview

The UltraCore development stack includes powerful CLI tools, automation scripts, and monitoring utilities to streamline your workflow:

- **ultracore-cli.sh** - Unified command-line interface for all APIs
- **test-endpoints.js** - Automated test suite for comprehensive testing
- **monitor.sh** - Real-time monitoring dashboard
- **db-manager.sh** - Database management and backup utilities

---

## 1. UltraCore CLI (`ultracore-cli.sh`)

The main command-line interface for interacting with Actions API and Jobe AI Agent.

### Quick Start

```bash
chmod +x ultracore-cli.sh
./ultracore-cli.sh --help
```

### Available Commands

#### Actions API Commands

```bash
# Check API health
./ultracore-cli.sh health

# List all available bundles
./ultracore-cli.sh bundles

# Deploy a bundle
./ultracore-cli.sh deploy ACCURACY intake-stack

# Deploy with dry run
./ultracore-cli.sh deploy-dry ACCURACY ultraengage-stack

# Deploy sequentially
./ultracore-cli.sh deploy-seq ACCURACY analytics-stack

# Get tenant status
./ultracore-cli.sh status ACCURACY

# View deployment history
./ultracore-cli.sh history              # All tenants
./ultracore-cli.sh history ACCURACY     # Specific tenant
./ultracore-cli.sh history ACCURACY 10  # Limit results

# Run an AI agent
./ultracore-cli.sh agent jobe ACCURACY
```

#### Jobe AI Commands

```bash
# Check Jobe AI health
./ultracore-cli.sh jobe-health

# Debug bundle deployment
./ultracore-cli.sh jobe-debug

# Get tenant insights
./ultracore-cli.sh jobe-insights ACCURACY

# Get optimization suggestions
./ultracore-cli.sh jobe-optimize intake-stack ACCURACY

# System health analysis
./ultracore-cli.sh jobe-system

# Predict deployment issues
./ultracore-cli.sh jobe-predict ultraengage-stack ACCURACY
```

#### Utility Commands

```bash
# Check status of all services
./ultracore-cli.sh status-all

# View service logs
./ultracore-cli.sh logs              # All services
./ultracore-cli.sh logs actions-api  # Specific service

# Restart services
./ultracore-cli.sh restart              # All services
./ultracore-cli.sh restart actions-api  # Specific service

# Run comprehensive tests
./ultracore-cli.sh test
```

### Environment Variables

```bash
# Customize API endpoints
export ACTIONS_API_URL=http://localhost:4000
export JOBE_API_URL=http://localhost:3000

# Then use the CLI
./ultracore-cli.sh bundles
```

### Examples

```bash
# Complete workflow: Deploy and monitor
./ultracore-cli.sh deploy ACCURACY intake-stack
./ultracore-cli.sh status ACCURACY
./ultracore-cli.sh jobe-insights ACCURACY

# Dry run with optimization check
./ultracore-cli.sh deploy-dry ACCURACY ultraengage-stack
./ultracore-cli.sh jobe-optimize ultraengage-stack ACCURACY

# Check everything
./ultracore-cli.sh status-all
./ultracore-cli.sh test
```

---

## 2. Automated Test Suite (`scripts/test-endpoints.js`)

Comprehensive automated testing for all API endpoints.

### Quick Start

```bash
chmod +x scripts/test-endpoints.js
node scripts/test-endpoints.js
```

### What It Tests

The test suite runs 15+ tests covering:

1. **Health Checks**
   - Actions API health
   - Jobe AI health

2. **Deployment Operations**
   - List bundles
   - Deploy bundle (dry run)
   - Deploy bundle (parallel mode)
   - Deployment history

3. **Agent Operations**
   - Run AI agents
   - Tenant status

4. **Jobe AI Features**
   - Bundle debugging
   - Tenant insights
   - Deployment optimization
   - System health analysis
   - Issue prediction

5. **Error Handling**
   - Invalid actions
   - Invalid bundles

### Sample Output

```
╔═══════════════════════════════════════════════════════╗
║        UltraCore Automated Test Suite                ║
╚═══════════════════════════════════════════════════════╝

Actions API: http://localhost:4000
Jobe AI API: http://localhost:3000

Running: Actions API - Health Check... ✓ PASS
  Service: UltraCore Actions API, Version: 1.0.0
Running: Jobe API - Health Check... ✓ PASS
  AI Model: Jobe-v2.0, Status: ready
Running: Actions API - List Bundles... ✓ PASS
  Found 3 bundles
...

═══════════════════════════════════════════════════════
Test Results
═══════════════════════════════════════════════════════
Total Tests: 15
Passed: 15
Failed: 0
Duration: 2.34s
═══════════════════════════════════════════════════════

✓ All tests passed!
```

### Custom Configuration

```bash
# Test against different endpoints
ACTIONS_API_URL=http://staging:4000 \
JOBE_API_URL=http://staging:3000 \
node scripts/test-endpoints.js
```

### Integration with CI/CD

```yaml
# GitHub Actions example
- name: Run UltraCore Tests
  run: |
    chmod +x scripts/test-endpoints.js
    node scripts/test-endpoints.js
```

---

## 3. Monitoring Dashboard (`scripts/monitor.sh`)

Real-time monitoring dashboard for all services.

### Quick Start

```bash
chmod +x scripts/monitor.sh
./scripts/monitor.sh
```

### Features

The monitoring dashboard provides:

1. **Service Health**
   - Actions API status and response time
   - Jobe AI status and response time
   - PostgreSQL connection status
   - Redis connection status

2. **Container Resources**
   - CPU usage per container
   - Memory usage per container
   - Container status (running/stopped)

3. **Activity Statistics**
   - Total deployment count
   - Recent deployment success/failure rates

4. **System Information**
   - Docker disk usage
   - Container volume sizes

### Sample Output

```
╔═══════════════════════════════════════════════════════════════════╗
║           UltraCore Real-Time Monitoring Dashboard                ║
╠═══════════════════════════════════════════════════════════════════╣
║ Last Update: 2024-01-21 10:30:45                                  ║
╚═══════════════════════════════════════════════════════════════════╝

━━━ Service Health ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Actions API (4000):    ✓ Healthy (0.045s)
  Jobe AI API (3000):    ✓ Healthy (0.032s)
  PostgreSQL (5432):     ✓ Ready
  Redis (6379):          ✓ PONG

━━━ Container Resources ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Container                 Status       CPU          Memory
  ─────────                ──────       ───          ──────
  actions-api              Running      2.5%         45MiB / 1GiB
  jobe-api                 Running      1.8%         38MiB / 1GiB
  postgres                 Running      3.2%         125MiB / 2GiB
  redis                    Running      0.5%         12MiB / 512MiB

━━━ Activity Statistics ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Total Deployments:     42
  Recent (last 5):       4 completed, 1 failed

━━━ System Information ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Images: 2.5GB
  Containers: 456MB
  Volumes: 1.2GB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Refreshing every 5s... Press Ctrl+C to exit
```

### Configuration

```bash
# Change refresh interval (default: 5 seconds)
MONITOR_REFRESH=10 ./scripts/monitor.sh

# Single run (no continuous monitoring)
./scripts/monitor.sh --once
```

### Usage Tips

- Great for keeping an eye on system resources
- Use during load testing to monitor performance
- Identify container health issues quickly
- Track deployment activity in real-time

---

## 4. Database Manager (`scripts/db-manager.sh`)

Complete database management including backups, restores, and utilities.

### Quick Start

```bash
chmod +x scripts/db-manager.sh
./scripts/db-manager.sh --help
```

### Available Commands

#### Backup Operations

```bash
# Create a backup
./scripts/db-manager.sh backup

# List all backups
./scripts/db-manager.sh list-backups

# Restore from backup
./scripts/db-manager.sh restore backups/ultracore_20240121_103045.sql
```

**Backup Example Output:**
```
📦 Creating database backup...
   Database: ultracore
   File: backups/ultracore_20240121_103045.sql

✅ Backup created successfully
   File: backups/ultracore_20240121_103045.sql
   Size: 2.4M
```

#### Database Operations

```bash
# Open PostgreSQL shell
./scripts/db-manager.sh psql

# Execute a SQL query
./scripts/db-manager.sh query "SELECT COUNT(*) FROM deployments"

# Show database statistics
./scripts/db-manager.sh stats

# Reset database (WARNING: deletes all data!)
./scripts/db-manager.sh reset
```

**Stats Example Output:**
```
📊 Database Statistics

Table Sizes:
 schema | table       | size
--------+-------------+--------
 public | deployments | 1024 kB
 public | tenants     | 32 kB
 public | bundles     | 16 kB
 public | agent_logs  | 512 kB

Row Counts:
  deployments:         42
  tenants:             3
  bundles:             3
  agent_logs:          127

Database Size:
  Total: 2.5 MB
```

#### Import/Export Operations

```bash
# Export table to CSV
./scripts/db-manager.sh export-csv deployments

# Import CSV into table
./scripts/db-manager.sh import-csv backups/deployments_20240121.csv
```

### Backup Directory

All backups are stored in `./backups/` by default:

```
backups/
├── ultracore_20240121_100000.sql
├── ultracore_20240121_120000.sql
├── deployments_20240121_103045.csv
└── tenants_20240121_103050.csv
```

### Automated Backups

Set up automated backups with cron:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/ultracore && ./scripts/db-manager.sh backup

# Add hourly backup during business hours
0 9-17 * * * cd /path/to/ultracore && ./scripts/db-manager.sh backup
```

### Disaster Recovery

```bash
# 1. Stop services
docker-compose down

# 2. Restore database
./scripts/db-manager.sh restore backups/ultracore_20240121_100000.sql

# 3. Restart services
docker-compose up -d

# 4. Verify
./ultracore-cli.sh status-all
```

---

## Complete Workflow Examples

### 1. Daily Development Workflow

```bash
# Morning: Check system status
./ultracore-cli.sh status-all
./scripts/monitor.sh --once

# Deploy new feature
./ultracore-cli.sh deploy-dry ACCURACY intake-stack
./ultracore-cli.sh deploy ACCURACY intake-stack

# Check results
./ultracore-cli.sh history ACCURACY 5
./ultracore-cli.sh jobe-insights ACCURACY

# Run tests
node scripts/test-endpoints.js
```

### 2. Pre-Deployment Checklist

```bash
# 1. Backup database
./scripts/db-manager.sh backup

# 2. Run tests
node scripts/test-endpoints.js

# 3. Check system health
./ultracore-cli.sh status-all
./ultracore-cli.sh jobe-system

# 4. Dry run deployment
./ultracore-cli.sh deploy-dry ACCURACY ultraengage-stack

# 5. Get optimization advice
./ultracore-cli.sh jobe-optimize ultraengage-stack ACCURACY

# 6. Deploy
./ultracore-cli.sh deploy ACCURACY ultraengage-stack

# 7. Monitor
./scripts/monitor.sh
```

### 3. Troubleshooting Issues

```bash
# Check service health
./ultracore-cli.sh status-all

# View logs
./ultracore-cli.sh logs actions-api

# Check database stats
./scripts/db-manager.sh stats

# Run diagnostic tests
node scripts/test-endpoints.js

# Get AI insights
./ultracore-cli.sh jobe-debug
./ultracore-cli.sh jobe-insights ACCURACY

# Restart if needed
./ultracore-cli.sh restart
```

### 4. Performance Testing

```bash
# Start monitoring in one terminal
./scripts/monitor.sh

# In another terminal, run load tests
for i in {1..100}; do
  ./ultracore-cli.sh deploy-dry ACCURACY intake-stack
done

# Check results
./scripts/db-manager.sh stats
./ultracore-cli.sh history ACCURACY 50
```

---

## Integration Examples

### npm Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "cli": "./ultracore-cli.sh",
    "test": "node scripts/test-endpoints.js",
    "monitor": "./scripts/monitor.sh",
    "db": "./scripts/db-manager.sh",
    "backup": "./scripts/db-manager.sh backup",
    "deploy": "./ultracore-cli.sh deploy",
    "status": "./ultracore-cli.sh status-all"
  }
}
```

Usage:
```bash
npm run test
npm run monitor
npm run backup
npm run deploy -- ACCURACY intake-stack
```

### Shell Aliases

Add to your `.bashrc` or `.zshrc`:

```bash
alias uc='./ultracore-cli.sh'
alias uc-test='node scripts/test-endpoints.js'
alias uc-monitor='./scripts/monitor.sh'
alias uc-db='./scripts/db-manager.sh'

# Usage
uc bundles
uc deploy ACCURACY intake-stack
uc-test
uc-monitor
```

### CI/CD Pipeline

```yaml
name: UltraCore CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Start Services
        run: ./deploy-now.sh

      - name: Run Tests
        run: node scripts/test-endpoints.js

      - name: Check System Health
        run: ./ultracore-cli.sh status-all

      - name: Backup Database
        run: ./scripts/db-manager.sh backup

      - name: Upload Artifacts
        uses: actions/upload-artifact@v2
        with:
          name: backups
          path: backups/
```

---

## Tips and Best Practices

### 1. Always Test Before Deploy
```bash
# Good practice
./ultracore-cli.sh deploy-dry ACCURACY bundle-name
./ultracore-cli.sh jobe-predict bundle-name ACCURACY
./ultracore-cli.sh deploy ACCURACY bundle-name
```

### 2. Regular Backups
```bash
# Before major changes
./scripts/db-manager.sh backup

# Automated daily backups
crontab -e
0 2 * * * cd /path/to/ultracore && ./scripts/db-manager.sh backup
```

### 3. Monitor During Deployments
```bash
# Terminal 1: Monitor
./scripts/monitor.sh

# Terminal 2: Deploy
./ultracore-cli.sh deploy ACCURACY intake-stack
```

### 4. Use Dry Runs for Testing
```bash
# Safe to run anytime
./ultracore-cli.sh deploy-dry ACCURACY any-bundle
```

### 5. Regular Health Checks
```bash
# Add to cron for alerts
./ultracore-cli.sh status-all || echo "Services down!" | mail -s "Alert" admin@example.com
```

---

## Troubleshooting

### Tools Not Working?

```bash
# Make scripts executable
chmod +x ultracore-cli.sh
chmod +x scripts/*.sh
chmod +x scripts/*.js

# Check Node.js is installed
node --version

# Check Docker is running
docker ps

# Check services are up
docker-compose ps
```

### API Not Responding?

```bash
# Check service health
./ultracore-cli.sh status-all

# Restart services
docker-compose restart

# View logs
docker-compose logs -f
```

### Tests Failing?

```bash
# Check if services are running
docker-compose ps

# Wait for services to be ready
sleep 10 && node scripts/test-endpoints.js

# Check specific service
curl http://localhost:4000/health
curl http://localhost:3000/health
```

---

## Summary

The UltraCore tooling suite provides everything you need for efficient development:

| Tool | Purpose | Key Features |
|------|---------|--------------|
| **ultracore-cli.sh** | Main CLI | Deploy, monitor, manage all APIs |
| **test-endpoints.js** | Automated testing | 15+ tests, CI/CD ready |
| **monitor.sh** | Real-time monitoring | Resource usage, health checks |
| **db-manager.sh** | Database management | Backup, restore, export/import |

**Get started:**
```bash
./deploy-now.sh            # Start everything
./ultracore-cli.sh bundles # Explore features
node scripts/test-endpoints.js # Run tests
./scripts/monitor.sh       # Watch it run
```

Happy coding! 🚀
