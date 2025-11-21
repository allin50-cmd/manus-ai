# UltraCore Local Development Stack

Complete local development environment for UltraCore with Actions API, Jobe AI Agent, PostgreSQL, and Redis.

## Quick Start

### 1. One-Command Deployment

```bash
chmod +x deploy-now.sh
./deploy-now.sh
```

That's it! The script will:
- Check prerequisites
- Install dependencies
- Start all Docker services
- Initialize the database
- Provide test commands

### 2. Manual Setup (Alternative)

```bash
# Install dependencies
npm install

# Start Docker services
docker-compose up -d

# View logs
docker-compose logs -f
```

## Architecture

### Services

| Service | Port | Description |
|---------|------|-------------|
| **Actions API** | 4000 | Main API for deployments and actions |
| **Jobe AI Agent** | 3000 | AI-powered insights and recommendations |
| **PostgreSQL** | 5432 | Primary database |
| **Redis** | 6379 | Caching layer |
| **PgAdmin** | 5050 | Database management UI |

### Tech Stack

- **Runtime**: Node.js 18 (Alpine Linux)
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Containerization**: Docker & Docker Compose

## API Documentation

### Actions API (Port 4000)

#### Health Check
```bash
curl http://localhost:4000/health
```

#### 1. List Available Bundles
```bash
curl -X POST http://localhost:4000/api/actions \
  -H "Content-Type: application/json" \
  -d '{"action":"bundles.list","payload":{}}'
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "bundles": [
      {
        "id": "intake-stack",
        "name": "Intake Stack",
        "description": "Complete intake management system",
        "services": ["intake-api", "intake-ui", "intake-processor"]
      },
      {
        "id": "ultraengage-stack",
        "name": "UltraEngage Stack",
        "description": "Customer engagement platform",
        "services": ["ultraengage-api", "ultraengage-ui", "engagement-worker"]
      },
      {
        "id": "analytics-stack",
        "name": "Analytics Stack",
        "description": "Analytics and reporting system",
        "services": ["analytics-api", "analytics-ui", "data-processor"]
      }
    ]
  }
}
```

#### 2. Deploy Bundle (Dry Run)
```bash
curl -X POST http://localhost:4000/api/actions \
  -H "Content-Type: application/json" \
  -d '{
    "action": "deploy.bundle",
    "payload": {
      "tenant": "ACCURACY",
      "bundle": "intake-stack",
      "dryRun": true,
      "sequential": true
    }
  }'
```

**Response:**
```json
{
  "ok": true,
  "message": "[DRY RUN] Successfully deployed Intake Stack",
  "data": {
    "tenant": "ACCURACY",
    "bundle": "Intake Stack",
    "deployments": [
      {
        "service": "intake-api",
        "status": "deployed",
        "tenant": "ACCURACY",
        "timestamp": "2024-01-21T10:30:00.000Z",
        "dryRun": true,
        "url": null
      }
    ],
    "dryRun": true,
    "sequential": true,
    "duration": 350
  }
}
```

#### 3. Deploy Bundle (Real Deployment)
```bash
curl -X POST http://localhost:4000/api/actions \
  -H "Content-Type: application/json" \
  -d '{
    "action": "deploy.bundle",
    "payload": {
      "tenant": "ACCURACY",
      "bundle": "ultraengage-stack"
    }
  }'
```

#### 4. Run AI Agent
```bash
curl -X POST http://localhost:4000/api/actions \
  -H "Content-Type: application/json" \
  -d '{
    "action": "agent.run",
    "payload": {
      "agent": "jobe",
      "input": {
        "tenant": "ACCURACY",
        "context": "performance analysis"
      }
    }
  }'
```

#### 5. Get Tenant Status
```bash
curl -X POST http://localhost:4000/api/actions \
  -H "Content-Type: application/json" \
  -d '{
    "action": "tenant.status",
    "payload": {
      "tenant": "ACCURACY"
    }
  }'
```

#### 6. View Deployment History
```bash
# All deployments
curl http://localhost:4000/api/deployments

# Tenant-specific
curl http://localhost:4000/api/deployments?tenant=ACCURACY

# Limited results
curl http://localhost:4000/api/deployments?limit=10
```

### Jobe AI Agent API (Port 3000)

#### Health Check
```bash
curl http://localhost:3000/health
```

#### 1. Demo Bundle Debug
```bash
curl -X POST http://localhost:3000/api/jobe/demo-bundle-debug \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response:**
```json
{
  "ok": true,
  "message": "Bundle deployment analysis completed",
  "data": {
    "tenant": "DEMO",
    "analysis": {
      "health": "Optimal",
      "performance": "Excellent",
      "security": "Good",
      "costEfficiency": "Very Good"
    },
    "recommendations": [
      "Check application logs for errors",
      "Verify database connection pool settings",
      "Review API response times"
    ],
    "debugging": {
      "commonIssues": ["Connection timeout", "Memory leak in worker process"],
      "suggestedActions": ["Increase connection timeout to 30s", "Restart worker processes"]
    }
  }
}
```

#### 2. General Analysis
```bash
curl -X POST http://localhost:3000/api/jobe/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "context": "deployment performance",
    "data": {
      "tenant": "ACCURACY"
    }
  }'
```

#### 3. Tenant Insights
```bash
curl -X POST http://localhost:3000/api/jobe/tenant-insights \
  -H "Content-Type: application/json" \
  -d '{
    "tenant": "ACCURACY"
  }'
```

#### 4. Optimize Deployment
```bash
curl -X POST http://localhost:3000/api/jobe/optimize-deployment \
  -H "Content-Type: application/json" \
  -d '{
    "bundle": "intake-stack",
    "tenant": "ACCURACY"
  }'
```

**Response:**
```json
{
  "ok": true,
  "message": "Optimization suggestions generated",
  "data": {
    "suggestions": [
      {
        "category": "Performance",
        "recommendation": "Enable CDN for static assets",
        "impact": "High",
        "estimatedImprovement": "40% faster load times"
      },
      {
        "category": "Cost",
        "recommendation": "Use spot instances for non-critical workloads",
        "impact": "High",
        "estimatedSavings": "$200-300/month"
      }
    ],
    "currentMetrics": {
      "cost": "$150/month",
      "performance": "Good"
    },
    "optimizedMetrics": {
      "cost": "$100/month",
      "performance": "Excellent"
    }
  }
}
```

#### 5. System Health Analysis
```bash
curl -X POST http://localhost:3000/api/jobe/system-health \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### 6. Predict Deployment Issues
```bash
curl -X POST http://localhost:3000/api/jobe/predict-issues \
  -H "Content-Type: application/json" \
  -d '{
    "bundle": "ultraengage-stack",
    "tenant": "ACCURACY"
  }'
```

## Database Schema

### Tables

#### deployments
```sql
CREATE TABLE deployments (
    id SERIAL PRIMARY KEY,
    tenant VARCHAR(255) NOT NULL,
    bundle VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### tenants
```sql
CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    tenant_code VARCHAR(255) UNIQUE NOT NULL,
    tenant_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### bundles
```sql
CREATE TABLE bundles (
    id SERIAL PRIMARY KEY,
    bundle_id VARCHAR(255) UNIQUE NOT NULL,
    bundle_name VARCHAR(255) NOT NULL,
    description TEXT,
    services JSONB,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### agent_logs
```sql
CREATE TABLE agent_logs (
    id SERIAL PRIMARY KEY,
    agent_name VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    input_data JSONB,
    output_data JSONB,
    execution_time INTEGER,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Management Commands

### Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f actions-api
docker-compose logs -f jobe-api

# Restart services
docker-compose restart

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Check service status
docker-compose ps
```

### NPM Scripts

```bash
# Start Actions API only
npm run start:actions

# Start Jobe API only
npm run start:jobe

# Start both APIs (local)
npm run start:all

# Development mode
npm run dev

# Docker shortcuts
npm run docker:up
npm run docker:down
npm run docker:logs
npm run docker:restart
npm run docker:rebuild
```

### Database Management

#### Using PgAdmin (Web UI)
1. Open http://localhost:5050
2. Login with credentials from `.env`:
   - Email: `admin@ultracore.local`
   - Password: `admin`
3. Add server connection:
   - Host: `postgres`
   - Port: `5432`
   - Database: `ultracore`
   - Username: `postgres`
   - Password: (from `.env`)

#### Using psql (Command Line)
```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d ultracore

# List tables
\dt

# View deployments
SELECT * FROM deployments ORDER BY created_at DESC LIMIT 10;

# View tenants
SELECT * FROM tenants;

# Exit psql
\q
```

## Environment Configuration

### Required Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

```env
# PostgreSQL
POSTGRES_PASSWORD=YourSecurePassword123!

# PgAdmin (optional)
PGADMIN_EMAIL=your-email@domain.com
PGADMIN_PASSWORD=your-secure-password
```

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Check what's using the port
lsof -i :4000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change the port in .env
ACTIONS_PORT=4001
JOBE_PORT=3001
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Services Not Starting

```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

### Clear All Data

```bash
# Stop and remove everything
docker-compose down -v

# Remove Docker images
docker-compose down --rmi all

# Start fresh
./deploy-now.sh
```

## Development Workflow

### 1. Making Changes to APIs

#### Edit and Hot Reload
```bash
# The server files are volume-mounted, but need restart
docker-compose restart actions-api
docker-compose restart jobe-api
```

#### Or run locally
```bash
# Install dependencies
npm install

# Start Actions API
npm run start:actions

# In another terminal, start Jobe API
npm run start:jobe
```

### 2. Testing Changes

```bash
# Test Actions API
curl http://localhost:4000/health

# Test Jobe API
curl http://localhost:3000/health

# Run deployment test
curl -X POST http://localhost:4000/api/actions \
  -H "Content-Type: application/json" \
  -d '{"action":"bundles.list","payload":{}}'
```

### 3. Database Changes

```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d ultracore

# Run SQL commands
ALTER TABLE deployments ADD COLUMN new_field VARCHAR(255);

# Or modify init-db.sql and rebuild
docker-compose down -v
docker-compose up -d --build
```

## Production Deployment

For production deployment to Azure, see:
- [README.md](./README.md) - Azure deployment guide
- [deploy-ultracore-optimized.sh](./deploy-ultracore-optimized.sh) - Azure deployment script

## Support

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f actions-api
docker-compose logs -f jobe-api
docker-compose logs -f postgres
```

### Health Checks

```bash
# Actions API
curl http://localhost:4000/health

# Jobe API
curl http://localhost:3000/health

# All services status
docker-compose ps
```

---

**Built with ❤️ for local development excellence**
