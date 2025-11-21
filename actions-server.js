import express from 'express';
import cors from 'cors';
import { createClient } from 'redis';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'ultracore',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
});

// Redis connection (optional, for caching)
let redisClient;
const initRedis = async () => {
  if (process.env.REDIS_HOST) {
    try {
      redisClient = createClient({
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
        },
        password: process.env.REDIS_PASSWORD,
      });
      await redisClient.connect();
      console.log('✅ Redis connected');
    } catch (error) {
      console.log('⚠️  Redis not available, running without cache');
    }
  }
};

// Deployment configurations
const BUNDLES = {
  'intake-stack': {
    name: 'Intake Stack',
    services: ['intake-api', 'intake-ui', 'intake-processor'],
    description: 'Complete intake management system',
  },
  'ultraengage-stack': {
    name: 'UltraEngage Stack',
    services: ['ultraengage-api', 'ultraengage-ui', 'engagement-worker'],
    description: 'Customer engagement platform',
  },
  'analytics-stack': {
    name: 'Analytics Stack',
    services: ['analytics-api', 'analytics-ui', 'data-processor'],
    description: 'Analytics and reporting system',
  },
};

// Simulate deployment process
const deployService = async (service, tenant, dryRun = false) => {
  const delay = dryRun ? 100 : 500;
  await new Promise(resolve => setTimeout(resolve, delay));

  return {
    service,
    status: 'deployed',
    tenant,
    timestamp: new Date().toISOString(),
    dryRun,
    url: dryRun ? null : `https://${service}.${tenant.toLowerCase()}.ultracore.io`,
  };
};

// Log deployment to database
const logDeployment = async (deploymentData) => {
  try {
    const query = `
      INSERT INTO deployments (tenant, bundle, action, status, metadata, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, created_at
    `;
    const values = [
      deploymentData.tenant,
      deploymentData.bundle,
      deploymentData.action,
      deploymentData.status,
      JSON.stringify(deploymentData.details),
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Database logging error:', error.message);
    return null;
  }
};

// ====================================================================
// HEALTH CHECK
// ====================================================================
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    service: 'UltraCore Actions API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    connections: {
      database: 'unknown',
      redis: redisClient ? 'connected' : 'disconnected',
    },
  };

  // Check database connection
  try {
    await pool.query('SELECT NOW()');
    health.connections.database = 'connected';
  } catch (error) {
    health.connections.database = 'error';
    health.status = 'degraded';
  }

  res.json(health);
});

// ====================================================================
// MAIN ACTIONS ENDPOINT
// ====================================================================
app.post('/api/actions', async (req, res) => {
  const { action, payload } = req.body;
  const startTime = Date.now();

  console.log(`📥 Action: ${action}`, {
    tenant: payload?.tenant,
    bundle: payload?.bundle,
    dryRun: payload?.dryRun,
  });

  try {
    // ====================================================================
    // DEPLOY BUNDLE ACTION
    // ====================================================================
    if (action === 'deploy.bundle') {
      const { tenant, bundle, dryRun = false, sequential = false } = payload;

      // Validate bundle
      if (!BUNDLES[bundle]) {
        return res.status(400).json({
          ok: false,
          error: `Unknown bundle: ${bundle}`,
          availableBundles: Object.keys(BUNDLES),
        });
      }

      const bundleConfig = BUNDLES[bundle];
      const deployments = [];

      console.log(`🚀 ${dryRun ? '[DRY RUN]' : 'Deploying'} ${bundleConfig.name} for ${tenant}`);
      console.log(`   Services: ${bundleConfig.services.join(', ')}`);
      console.log(`   Mode: ${sequential ? 'Sequential' : 'Parallel'}`);

      // Deploy services
      if (sequential) {
        // Sequential deployment
        for (const service of bundleConfig.services) {
          const result = await deployService(service, tenant, dryRun);
          deployments.push(result);
          console.log(`   ✅ ${service} deployed`);
        }
      } else {
        // Parallel deployment
        const deploymentPromises = bundleConfig.services.map(service =>
          deployService(service, tenant, dryRun)
        );
        const results = await Promise.all(deploymentPromises);
        deployments.push(...results);
        console.log(`   ✅ All services deployed in parallel`);
      }

      // Log to database
      const logData = {
        tenant,
        bundle,
        action: 'deploy.bundle',
        status: 'completed',
        details: {
          dryRun,
          sequential,
          services: deployments,
          duration: Date.now() - startTime,
        },
      };

      const dbLog = await logDeployment(logData);

      return res.json({
        ok: true,
        message: `${dryRun ? '[DRY RUN] ' : ''}Successfully deployed ${bundleConfig.name}`,
        data: {
          tenant,
          bundle: bundleConfig.name,
          deployments,
          dryRun,
          sequential,
          duration: Date.now() - startTime,
          deploymentId: dbLog?.id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // ====================================================================
    // AGENT RUN ACTION
    // ====================================================================
    if (action === 'agent.run') {
      const { agent, input } = payload;

      console.log(`🤖 Running agent: ${agent}`);

      // Simulate agent processing
      await new Promise(resolve => setTimeout(resolve, 200));

      const result = {
        ok: true,
        message: `Agent ${agent} completed successfully`,
        data: {
          agent,
          input,
          output: {
            status: 'completed',
            recommendations: [
              'System health: Optimal',
              'Performance: Excellent',
              'Cost efficiency: Good',
            ],
            metrics: {
              responseTime: Date.now() - startTime,
              confidence: 0.95,
            },
          },
          timestamp: new Date().toISOString(),
        },
      };

      // Log to database
      await logDeployment({
        tenant: input?.tenant || 'N/A',
        bundle: 'agent-execution',
        action: 'agent.run',
        status: 'completed',
        details: { agent, input },
      });

      return res.json(result);
    }

    // ====================================================================
    // TENANT STATUS ACTION
    // ====================================================================
    if (action === 'tenant.status') {
      const { tenant } = payload;

      const query = `
        SELECT bundle, status, created_at
        FROM deployments
        WHERE tenant = $1
        ORDER BY created_at DESC
        LIMIT 10
      `;

      const result = await pool.query(query, [tenant]);

      return res.json({
        ok: true,
        data: {
          tenant,
          recentDeployments: result.rows,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // ====================================================================
    // LIST BUNDLES ACTION
    // ====================================================================
    if (action === 'bundles.list') {
      return res.json({
        ok: true,
        data: {
          bundles: Object.entries(BUNDLES).map(([key, value]) => ({
            id: key,
            name: value.name,
            description: value.description,
            services: value.services,
          })),
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Unknown action
    return res.status(400).json({
      ok: false,
      error: `Unknown action: ${action}`,
      availableActions: [
        'deploy.bundle',
        'agent.run',
        'tenant.status',
        'bundles.list',
      ],
    });

  } catch (error) {
    console.error(`❌ Error processing action ${action}:`, error);

    return res.status(500).json({
      ok: false,
      error: error.message,
      action,
      timestamp: new Date().toISOString(),
    });
  }
});

// ====================================================================
// DEPLOYMENTS HISTORY
// ====================================================================
app.get('/api/deployments', async (req, res) => {
  try {
    const { tenant, limit = 50 } = req.query;

    let query = 'SELECT * FROM deployments';
    const params = [];

    if (tenant) {
      query += ' WHERE tenant = $1';
      params.push(tenant);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await pool.query(query, params);

    res.json({
      ok: true,
      data: {
        deployments: result.rows,
        count: result.rows.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

// ====================================================================
// START SERVER
// ====================================================================
const startServer = async () => {
  // Initialize Redis
  await initRedis();

  // Create deployments table if it doesn't exist
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS deployments (
        id SERIAL PRIMARY KEY,
        tenant VARCHAR(255) NOT NULL,
        bundle VARCHAR(255) NOT NULL,
        action VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Database table ready');
  } catch (error) {
    console.log('⚠️  Database table creation skipped:', error.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('⚡ ═══════════════════════════════════════════════');
    console.log('⚡ UltraCore Actions API Server');
    console.log('⚡ ═══════════════════════════════════════════════');
    console.log(`⚡ Port: ${PORT}`);
    console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⚡ Database: ${pool.options.host}:${pool.options.port}/${pool.options.database}`);
    console.log(`⚡ Redis: ${redisClient ? 'Connected' : 'Disabled'}`);
    console.log('⚡ ═══════════════════════════════════════════════');
    console.log('');
    console.log('📚 Available Actions:');
    console.log('   - deploy.bundle     Deploy service bundles');
    console.log('   - agent.run         Run AI agents');
    console.log('   - tenant.status     Get tenant status');
    console.log('   - bundles.list      List available bundles');
    console.log('');
    console.log('🧪 Test Commands:');
    console.log(`   curl http://localhost:${PORT}/health`);
    console.log(`   curl -X POST http://localhost:${PORT}/api/actions \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d '{"action":"bundles.list","payload":{}}'`);
    console.log('');
  });
};

startServer();
