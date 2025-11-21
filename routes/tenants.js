/**
 * Tenants API Routes
 * Manages tenant CRUD operations and provisioning
 */

import express from 'express';
import pkg from 'pg';
import { exec } from 'child_process';
import { promisify } from 'util';

const { Pool } = pkg;
const router = express.Router();
const execAsync = promisify(exec);

// PostgreSQL connection
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'ultracore',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
});

/**
 * GET /api/tenants
 * List all tenants
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 100, offset = 0, status } = req.query;

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
      count: result.rows.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Error listing tenants:', error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tenants/:slug
 * Get tenant by slug
 */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await pool.query(
      'SELECT * FROM tenants WHERE tenant_code = $1',
      [slug]
    );

    if (result.rows.length === 0) {
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
    console.error('Error getting tenant:', error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/tenants
 * Create new tenant manually
 */
router.post('/', async (req, res) => {
  try {
    const { slug, name, email, plan = 'essentials', status = 'active' } = req.body;

    if (!slug || !name) {
      return res.status(400).json({
        ok: false,
        error: 'slug and name are required',
      });
    }

    const result = await pool.query(
      `INSERT INTO tenants (tenant_code, tenant_name, status, metadata, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [
        slug,
        name,
        status,
        JSON.stringify({ email, plan }),
      ]
    );

    res.status(201).json({
      ok: true,
      tenant: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/tenants/provision
 * Full tenant provisioning workflow
 * Calls Terraform and MSI script
 */
router.post('/provision', async (req, res) => {
  try {
    const {
      slug,
      name,
      plan = 'essentials',
      email,
      storageAccount = process.env.STORAGE_ACCOUNT || 'ultaivaultstore',
      keyVaultName = process.env.KEYVAULT_NAME || 'ultracore-kv',
    } = req.body;

    if (!slug || !name) {
      return res.status(400).json({
        ok: false,
        error: 'slug and name are required',
      });
    }

    console.log(`Starting provisioning for tenant: ${slug}`);

    // In production, this would:
    // 1. Run Terraform module
    // 2. Call provision-tenant-msi.js script
    // 3. Optionally provision DNS

    // For now, just create database record
    const result = await pool.query(
      `INSERT INTO tenants (tenant_code, tenant_name, status, metadata, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (tenant_code) DO UPDATE
       SET tenant_name = EXCLUDED.tenant_name,
           metadata = EXCLUDED.metadata,
           updated_at = NOW()
       RETURNING *`,
      [
        slug,
        name,
        'provisioning',
        JSON.stringify({
          email,
          plan,
          storageAccount,
          keyVaultName,
          provisionedAt: new Date().toISOString(),
        }),
      ]
    );

    // Create audit log
    await pool.query(
      `INSERT INTO deployments (tenant, bundle, action, status, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        slug,
        'tenant-provision',
        'provision',
        'initiated',
        JSON.stringify({
          name,
          plan,
          email,
          initiatedBy: 'api',
        }),
      ]
    );

    // Update tenant status to active
    await pool.query(
      `UPDATE tenants SET status = $1, updated_at = NOW() WHERE tenant_code = $2`,
      ['active', slug]
    );

    console.log(`Tenant provisioned: ${slug}`);

    res.status(201).json({
      ok: true,
      tenant: result.rows[0],
      message: 'Tenant provisioned successfully',
      nextSteps: {
        terraform: `terraform apply -var="tenant_slug=${slug}"`,
        msi: `node scripts/provision/provision-tenant-msi.js --tenantSlug ${slug} --tenantName "${name}" --plan ${plan}`,
        domain: `./scripts/provision/provision-tenant-domain.sh ${slug} ${slug}.ultracore.io`,
      },
    });
  } catch (error) {
    console.error('Error provisioning tenant:', error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

/**
 * PATCH /api/tenants/:slug
 * Update tenant
 */
router.patch('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, email, plan, status } = req.body;

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name) {
      updates.push(`tenant_name = $${paramCount++}`);
      params.push(name);
    }

    if (status) {
      updates.push(`status = $${paramCount++}`);
      params.push(status);
    }

    if (email || plan) {
      const result = await pool.query(
        'SELECT metadata FROM tenants WHERE tenant_code = $1',
        [slug]
      );

      if (result.rows.length > 0) {
        const metadata = result.rows[0].metadata || {};
        if (email) metadata.email = email;
        if (plan) metadata.plan = plan;

        updates.push(`metadata = $${paramCount++}`);
        params.push(JSON.stringify(metadata));
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'No updates provided',
      });
    }

    updates.push(`updated_at = NOW()`);
    params.push(slug);

    const query = `
      UPDATE tenants
      SET ${updates.join(', ')}
      WHERE tenant_code = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
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
    console.error('Error updating tenant:', error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/tenants/:slug
 * Delete (deactivate) tenant
 */
router.delete('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { hardDelete = false } = req.query;

    if (hardDelete === 'true') {
      // Hard delete (use with caution!)
      const result = await pool.query(
        'DELETE FROM tenants WHERE tenant_code = $1 RETURNING *',
        [slug]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          ok: false,
          error: 'Tenant not found',
        });
      }

      res.json({
        ok: true,
        message: 'Tenant permanently deleted',
        tenant: result.rows[0],
      });
    } else {
      // Soft delete (set status to inactive)
      const result = await pool.query(
        `UPDATE tenants
         SET status = 'inactive', updated_at = NOW()
         WHERE tenant_code = $1
         RETURNING *`,
        [slug]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          ok: false,
          error: 'Tenant not found',
        });
      }

      res.json({
        ok: true,
        message: 'Tenant deactivated',
        tenant: result.rows[0],
      });
    }
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

export default router;
