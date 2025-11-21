/**
 * Tenant Management API Routes
 *
 * Provides CRUD operations for tenants and orchestrates provisioning workflow.
 *
 * Endpoints:
 *   GET    /api/tenants           - List all tenants
 *   GET    /api/tenants/:slug     - Get tenant details
 *   POST   /api/tenants/provision - Provision new tenant (async)
 *   PUT    /api/tenants/:slug     - Update tenant
 *   DELETE /api/tenants/:slug     - Deactivate tenant
 *
 * Usage:
 *   const tenantsRouter = require('./routes/tenants');
 *   app.use('/api/tenants', tenantsRouter);
 */

const express = require('express');
const router = express.Router();
const { DefaultAzureCredential } = require('@azure/identity');
const sql = require('mssql');

const SQL_SERVER = process.env.SQL_SERVER;
const SQL_DATABASE = process.env.SQL_DATABASE || 'ultai_db';

const credential = new DefaultAzureCredential();
let sqlPool = null;

/**
 * Get SQL connection pool with Azure AD authentication
 */
async function getSqlPool() {
  if (sqlPool && sqlPool.connected) {
    return sqlPool;
  }

  const SQL_TOKEN_SCOPE = "https://database.windows.net/.default";
  const token = await credential.getToken(SQL_TOKEN_SCOPE);

  const config = {
    server: SQL_SERVER,
    database: SQL_DATABASE,
    options: {
      encrypt: true,
      enableArithAbort: true,
      trustServerCertificate: false
    },
    authentication: {
      type: 'azure-active-directory-access-token',
      options: {
        token: token.token
      }
    },
    pool: {
      max: 10,
      min: 2,
      idleTimeoutMillis: 30000
    }
  };

  sqlPool = await sql.connect(config);
  return sqlPool;
}

/**
 * GET /api/tenants
 *
 * List all tenants with optional filtering
 *
 * Query params:
 *   ?status=active  - Filter by status
 *   ?plan=pro       - Filter by plan
 *   ?limit=50       - Max results
 */
router.get('/', async (req, res) => {
  try {
    const { status, plan, limit = 100 } = req.query;
    const pool = await getSqlPool();

    let query = `
      SELECT TOP (@limit)
        TenantID,
        TenantSlug,
        TenantName,
        ContactEmail,
        Plan,
        Status,
        Note,
        CreatedDate,
        LastUpdated
      FROM ultai.Tenants
      WHERE 1=1
    `;

    const request = pool.request().input('limit', sql.Int, parseInt(limit));

    if (status) {
      query += ' AND Status = @status';
      request.input('status', sql.NVarChar, status);
    }

    if (plan) {
      query += ' AND Plan = @plan';
      request.input('plan', sql.NVarChar, plan);
    }

    query += ' ORDER BY CreatedDate DESC';

    const result = await request.query(query);

    res.json({
      tenants: result.recordset,
      count: result.recordset.length,
      filters: { status, plan, limit }
    });

  } catch (error) {
    console.error('[Tenants] List error:', error);
    res.status(500).json({
      error: 'Failed to retrieve tenants',
      message: error.message
    });
  }
});

/**
 * GET /api/tenants/:slug
 *
 * Get detailed information for a specific tenant
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const pool = await getSqlPool();

    const result = await pool.request()
      .input('slug', sql.NVarChar, slug)
      .query(`
        SELECT
          TenantID,
          TenantSlug,
          TenantName,
          ContactEmail,
          Plan,
          Status,
          Note,
          CreatedDate,
          LastUpdated
        FROM ultai.Tenants
        WHERE TenantSlug = @slug
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        error: 'Tenant not found',
        slug
      });
    }

    res.json(result.recordset[0]);

  } catch (error) {
    console.error('[Tenants] Get error:', error);
    res.status(500).json({
      error: 'Failed to retrieve tenant',
      message: error.message
    });
  }
});

/**
 * POST /api/tenants/provision
 *
 * Provision a new tenant (infrastructure + database)
 *
 * Request body:
 *   {
 *     "slug": "stork-nhs",
 *     "name": "Stork Maturity (NHS)",
 *     "plan": "pro",
 *     "email": "stork@nhs.uk"
 *   }
 *
 * Response:
 *   {
 *     "ok": true,
 *     "tenantId": "uuid",
 *     "message": "Tenant provisioned successfully"
 *   }
 */
router.post('/provision', async (req, res) => {
  try {
    const { slug, name, plan = 'essentials', email } = req.body;

    // Validation
    if (!slug || !name) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['slug', 'name']
      });
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({
        error: 'Invalid slug format',
        message: 'Slug must contain only lowercase letters, numbers, and hyphens'
      });
    }

    // Validate plan
    if (!['essentials', 'pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({
        error: 'Invalid plan',
        message: 'Plan must be one of: essentials, pro, enterprise'
      });
    }

    console.log(`[Tenants] Provisioning tenant: ${slug}`);
    const pool = await getSqlPool();

    // Check if tenant already exists
    const existingCheck = await pool.request()
      .input('slug', sql.NVarChar, slug)
      .query('SELECT TenantID FROM ultai.Tenants WHERE TenantSlug = @slug');

    if (existingCheck.recordset.length > 0) {
      return res.status(409).json({
        error: 'Tenant already exists',
        slug,
        tenantId: existingCheck.recordset[0].TenantID
      });
    }

    // Insert tenant record
    const insertQuery = `
      INSERT INTO ultai.Tenants (TenantSlug, TenantName, ContactEmail, Plan, Note, Status, CreatedDate)
      OUTPUT INSERTED.TenantID, INSERTED.TenantSlug, INSERTED.CreatedDate
      VALUES (@slug, @name, @email, @plan, @note, 'active', GETUTCDATE());
    `;

    const result = await pool.request()
      .input('slug', sql.NVarChar, slug)
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email || `${slug}@example.com`)
      .input('plan', sql.NVarChar, plan)
      .input('note', sql.NVarChar, 'Provisioned via API')
      .query(insertQuery);

    const tenant = result.recordset[0];

    // Write provision audit
    await pool.request()
      .input('slug', sql.NVarChar, slug)
      .input('action', sql.NVarChar, 'TenantProvision')
      .input('details', sql.NVarChar, JSON.stringify({
        tenantId: tenant.TenantID,
        slug,
        plan,
        method: 'api',
        userAgent: req.headers['user-agent'],
        ip: req.ip
      }))
      .query(`
        INSERT INTO VaultLine.ProvisionAudit (TenantSlug, Action, Details, Timestamp)
        VALUES (@slug, @action, @details, GETUTCDATE())
      `);

    console.log(`[Tenants] Tenant provisioned: ${slug} (ID: ${tenant.TenantID})`);

    res.status(201).json({
      ok: true,
      tenantId: tenant.TenantID,
      slug: tenant.TenantSlug,
      createdAt: tenant.CreatedDate,
      message: 'Tenant provisioned successfully',
      nextSteps: [
        'Run Terraform to create storage container',
        'Configure custom domain (optional)',
        'Set up tenant-specific settings'
      ]
    });

  } catch (error) {
    console.error('[Tenants] Provision error:', error);
    res.status(500).json({
      error: 'Tenant provisioning failed',
      message: error.message
    });
  }
});

/**
 * PUT /api/tenants/:slug
 *
 * Update tenant information
 *
 * Request body:
 *   {
 *     "name": "Updated Name",
 *     "email": "new@email.com",
 *     "plan": "enterprise",
 *     "status": "suspended"
 *   }
 */
router.put('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, email, plan, status, note } = req.body;
    const pool = await getSqlPool();

    // Build update query dynamically
    const updates = [];
    const request = pool.request().input('slug', sql.NVarChar, slug);

    if (name) {
      updates.push('TenantName = @name');
      request.input('name', sql.NVarChar, name);
    }
    if (email) {
      updates.push('ContactEmail = @email');
      request.input('email', sql.NVarChar, email);
    }
    if (plan) {
      updates.push('Plan = @plan');
      request.input('plan', sql.NVarChar, plan);
    }
    if (status) {
      updates.push('Status = @status');
      request.input('status', sql.NVarChar, status);
    }
    if (note) {
      updates.push('Note = @note');
      request.input('note', sql.NVarChar, note);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'No fields to update',
        message: 'Provide at least one field: name, email, plan, status, note'
      });
    }

    updates.push('LastUpdated = GETUTCDATE()');

    const query = `
      UPDATE ultai.Tenants
      SET ${updates.join(', ')}
      OUTPUT INSERTED.TenantID, INSERTED.TenantSlug, INSERTED.LastUpdated
      WHERE TenantSlug = @slug
    `;

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        error: 'Tenant not found',
        slug
      });
    }

    console.log(`[Tenants] Tenant updated: ${slug}`);

    res.json({
      ok: true,
      tenant: result.recordset[0],
      message: 'Tenant updated successfully'
    });

  } catch (error) {
    console.error('[Tenants] Update error:', error);
    res.status(500).json({
      error: 'Failed to update tenant',
      message: error.message
    });
  }
});

/**
 * DELETE /api/tenants/:slug
 *
 * Soft-delete tenant (set status to 'deactivated')
 *
 * Note: This does NOT delete tenant data or infrastructure.
 * Use Terraform destroy for infrastructure cleanup.
 */
router.delete('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const pool = await getSqlPool();

    const result = await pool.request()
      .input('slug', sql.NVarChar, slug)
      .query(`
        UPDATE ultai.Tenants
        SET Status = 'deactivated', LastUpdated = GETUTCDATE()
        OUTPUT INSERTED.TenantID, INSERTED.TenantSlug
        WHERE TenantSlug = @slug AND Status != 'deactivated'
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        error: 'Tenant not found or already deactivated',
        slug
      });
    }

    // Write deactivation audit
    await pool.request()
      .input('slug', sql.NVarChar, slug)
      .input('action', sql.NVarChar, 'TenantDeactivation')
      .input('details', sql.NVarChar, JSON.stringify({
        method: 'api',
        userAgent: req.headers['user-agent'],
        ip: req.ip
      }))
      .query(`
        INSERT INTO VaultLine.ProvisionAudit (TenantSlug, Action, Details, Timestamp)
        VALUES (@slug, @action, @details, GETUTCDATE())
      `);

    console.log(`[Tenants] Tenant deactivated: ${slug}`);

    res.json({
      ok: true,
      message: 'Tenant deactivated successfully',
      warning: 'Infrastructure and data still exist. Run Terraform destroy to remove resources.'
    });

  } catch (error) {
    console.error('[Tenants] Delete error:', error);
    res.status(500).json({
      error: 'Failed to deactivate tenant',
      message: error.message
    });
  }
});

module.exports = router;
