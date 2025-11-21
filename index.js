import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from 'redis';
import pkg from 'pg';
const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection - supports both PostgreSQL and Azure SQL Server
const pool = new Pool({
  host: process.env.SQL_SERVER || process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.SQL_DATABASE || process.env.POSTGRES_DB || 'ultracore',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  ssl: process.env.SQL_SERVER ? { rejectUnauthorized: false } : false,
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

// Database initialization
let dbConnected = false;
const initDatabase = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');

    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        tenant_code VARCHAR(255) UNIQUE NOT NULL,
        tenant_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS provision_audit (
        id SERIAL PRIMARY KEY,
        tenant_slug VARCHAR(255) NOT NULL,
        tenant_id INTEGER,
        action VARCHAR(255) NOT NULL,
        details JSONB DEFAULT '{}',
        timestamp TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS deployments (
        id SERIAL PRIMARY KEY,
        tenant VARCHAR(255) NOT NULL,
        bundle VARCHAR(255),
        action VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Database tables verified');
    dbConnected = true;
  } catch (error) {
    console.error('⚠️  Database connection failed:', error.message);
    console.log('⚠️  Server will start in limited mode (API endpoints will return errors)');
    console.log('');
    console.log('💡 To enable database:');
    console.log('   1. Start local PostgreSQL: docker compose up -d postgres');
    console.log('   2. Or configure Azure SQL Server in .env file');
    dbConnected = false;
  }
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    service: 'UltraCore Dashboard',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: '1.0.0',
  };

  // Check database
  try {
    await pool.query('SELECT 1');
    health.database = 'connected';
  } catch (error) {
    health.database = 'disconnected';
    health.status = 'unhealthy';
  }

  // Check Redis
  if (redisClient) {
    try {
      await redisClient.ping();
      health.redis = 'connected';
    } catch (error) {
      health.redis = 'disconnected';
    }
  } else {
    health.redis = 'not configured';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// ============================================================================
// TENANT MANAGEMENT API
// ============================================================================

// Middleware to check database connection
const requireDatabase = (req, res, next) => {
  if (!dbConnected) {
    return res.status(503).json({
      ok: false,
      error: 'Database not connected',
      message: 'The database is currently unavailable. Please check your database configuration.',
    });
  }
  next();
};

// Get all tenants
app.get('/api/tenants', requireDatabase, async (req, res) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query;

    let query = 'SELECT * FROM tenants';
    const params = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      ok: true,
      tenants: result.rows,
      count: result.rowCount,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch tenants',
      message: error.message,
    });
  }
});

// Get single tenant
app.get('/api/tenants/:slug', requireDatabase, async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      'SELECT * FROM tenants WHERE tenant_code = $1',
      [slug]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Tenant not found',
      });
    }

    res.json({
      ok: true,
      tenant: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch tenant',
      message: error.message,
    });
  }
});

// Provision new tenant
app.post('/api/tenants/provision', requireDatabase, async (req, res) => {
  try {
    const { slug, name, email, plan = 'essentials' } = req.body;

    // Validation
    if (!slug || !name || !email) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required fields: slug, name, email',
      });
    }

    // Validate slug format (lowercase, alphanumeric, hyphens)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.',
      });
    }

    // Check if tenant already exists
    const existing = await pool.query(
      'SELECT id FROM tenants WHERE tenant_code = $1',
      [slug]
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({
        ok: false,
        error: 'Tenant already exists',
      });
    }

    // Create tenant
    const metadata = {
      email,
      plan,
      storageAccount: process.env.STORAGE_ACCOUNT || 'ultaivaultstore',
      keyVault: process.env.KEYVAULT_NAME || 'ultracore-kv',
      containerName: `tenant-${slug}`,
      provisionedAt: new Date().toISOString(),
      provisionedBy: 'dashboard-ui',
    };

    const insertResult = await pool.query(
      `INSERT INTO tenants (tenant_code, tenant_name, status, metadata)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [slug, name, 'provisioning', JSON.stringify(metadata)]
    );

    const tenant = insertResult.rows[0];

    // Log to audit table
    await pool.query(
      `INSERT INTO provision_audit (tenant_slug, tenant_id, action, details)
       VALUES ($1, $2, $3, $4)`,
      [slug, tenant.id, 'tenant_provisioned', JSON.stringify({ email, plan })]
    );

    // Update status to active
    await pool.query(
      'UPDATE tenants SET status = $1, updated_at = NOW() WHERE id = $2',
      ['active', tenant.id]
    );

    tenant.status = 'active';

    res.status(201).json({
      ok: true,
      message: 'Tenant provisioned successfully',
      tenant,
      nextSteps: {
        terraform: `cd iac/terraform && terraform apply -var="tenant_slug=${slug}" -var="tenant_name=${name}" -var="tenant_plan=${plan}"`,
        msi: `cd scripts/provision && node provision-tenant-msi.js --tenantSlug ${slug} --tenantName "${name}" --plan ${plan}`,
        domain: `./scripts/provision/provision-tenant-domain.sh ${slug} ${slug}.ultracore.io`,
      },
    });
  } catch (error) {
    console.error('Error provisioning tenant:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to provision tenant',
      message: error.message,
    });
  }
});

// Update tenant
app.patch('/api/tenants/:slug', requireDatabase, async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, status, metadata } = req.body;

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (name) {
      updates.push(`tenant_name = $${paramIndex++}`);
      params.push(name);
    }

    if (status) {
      updates.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (metadata) {
      updates.push(`metadata = $${paramIndex++}`);
      params.push(JSON.stringify(metadata));
    }

    if (updates.length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'No fields to update',
      });
    }

    updates.push(`updated_at = NOW()`);
    params.push(slug);

    const query = `
      UPDATE tenants
      SET ${updates.join(', ')}
      WHERE tenant_code = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Tenant not found',
      });
    }

    // Log update
    await pool.query(
      `INSERT INTO provision_audit (tenant_slug, tenant_id, action, details)
       VALUES ($1, $2, $3, $4)`,
      [slug, result.rows[0].id, 'tenant_updated', JSON.stringify({ name, status, metadata })]
    );

    res.json({
      ok: true,
      message: 'Tenant updated successfully',
      tenant: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to update tenant',
      message: error.message,
    });
  }
});

// Delete tenant (soft delete)
app.delete('/api/tenants/:slug', requireDatabase, async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      `UPDATE tenants
       SET status = 'deleted', updated_at = NOW()
       WHERE tenant_code = $1
       RETURNING *`,
      [slug]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Tenant not found',
      });
    }

    // Log deletion
    await pool.query(
      `INSERT INTO provision_audit (tenant_slug, tenant_id, action, details)
       VALUES ($1, $2, $3, $4)`,
      [slug, result.rows[0].id, 'tenant_deleted', JSON.stringify({})]
    );

    res.json({
      ok: true,
      message: 'Tenant deleted successfully (soft delete)',
      tenant: result.rows[0],
    });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to delete tenant',
      message: error.message,
    });
  }
});

// Get tenant audit log
app.get('/api/tenants/:slug/audit', requireDatabase, async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit = 50 } = req.query;

    const result = await pool.query(
      `SELECT * FROM provision_audit
       WHERE tenant_slug = $1
       ORDER BY timestamp DESC
       LIMIT $2`,
      [slug, limit]
    );

    res.json({
      ok: true,
      audit: result.rows,
      count: result.rowCount,
    });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch audit log',
      message: error.message,
    });
  }
});

// Get tenant statistics
app.get('/api/stats', requireDatabase, async (req, res) => {
  try {
    const stats = {};

    // Total tenants
    const totalResult = await pool.query('SELECT COUNT(*) as count FROM tenants');
    stats.total = parseInt(totalResult.rows[0].count);

    // By status
    const statusResult = await pool.query(
      `SELECT status, COUNT(*) as count
       FROM tenants
       GROUP BY status`
    );
    stats.byStatus = statusResult.rows.reduce((acc, row) => {
      acc[row.status] = parseInt(row.count);
      return acc;
    }, {});

    // By plan
    const planResult = await pool.query(
      `SELECT metadata->>'plan' as plan, COUNT(*) as count
       FROM tenants
       WHERE metadata->>'plan' IS NOT NULL
       GROUP BY metadata->>'plan'`
    );
    stats.byPlan = planResult.rows.reduce((acc, row) => {
      acc[row.plan] = parseInt(row.count);
      return acc;
    }, {});

    // Recent provisioning (last 7 days)
    const recentResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM tenants
       WHERE created_at > NOW() - INTERVAL '7 days'`
    );
    stats.recentProvisions = parseInt(recentResult.rows[0].count);

    res.json({
      ok: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch statistics',
      message: error.message,
    });
  }
});

// ============================================================================
// STATIC FILE SERVING (Admin UI)
// ============================================================================

// In production, serve built React app
if (NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, 'admin-tenant-ui', 'build');
  app.use(express.static(buildPath));

  // Serve React app for any unknown routes (client-side routing)
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(buildPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  });
}

// ============================================================================
// START SERVER
// ============================================================================

const startServer = async () => {
  try {
    // Initialize connections
    await initDatabase();
    await initRedis();

    // Start listening
    app.listen(PORT, () => {
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎛️  UltraCore Dashboard Server');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`🔗 Local: http://localhost:${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/health`);
      console.log(`📊 API: http://localhost:${PORT}/api/tenants`);
      console.log('');

      if (NODE_ENV === 'development') {
        console.log('💡 Development mode:');
        console.log('   - Start admin UI: cd admin-tenant-ui && npm start');
        console.log('   - Admin UI will run on http://localhost:3000');
        console.log('   - API requests will proxy to this server');
      } else {
        console.log('🚀 Production mode:');
        console.log('   - Serving static files from admin-tenant-ui/build');
        console.log('   - Build admin UI first: cd admin-tenant-ui && npm run build');
      }

      console.log('');
      console.log('🔧 Environment variables:');
      console.log(`   - DATABASE: ${pool.options.host}:${pool.options.port}/${pool.options.database}`);
      console.log(`   - STORAGE_ACCOUNT: ${process.env.STORAGE_ACCOUNT || 'not set'}`);
      console.log(`   - KEYVAULT_NAME: ${process.env.KEYVAULT_NAME || 'not set'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  if (redisClient) await redisClient.quit();
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  if (redisClient) await redisClient.quit();
  await pool.end();
  process.exit(0);
});

startServer();
