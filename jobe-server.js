import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const PORT = process.env.JOBE_PORT || 3000;

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

// Jobe AI Agent - Simulated AI responses
const jobeAnalyze = async (context, data) => {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 300));

  const insights = {
    tenant: data.tenant || 'Unknown',
    analysis: {
      health: 'Optimal',
      performance: 'Excellent',
      security: 'Good',
      costEfficiency: 'Very Good',
    },
    recommendations: [],
    metrics: {
      uptime: '99.95%',
      responseTime: '125ms',
      errorRate: '0.02%',
      resourceUtilization: '67%',
    },
    alerts: [],
  };

  // Generate contextual recommendations
  if (context.includes('bundle') || context.includes('deploy')) {
    insights.recommendations.push(
      'Consider using blue-green deployment strategy',
      'Enable auto-scaling for cost optimization',
      'Implement health check monitoring'
    );
  }

  if (context.includes('debug')) {
    insights.recommendations.push(
      'Check application logs for errors',
      'Verify database connection pool settings',
      'Review API response times'
    );
    insights.debugging = {
      commonIssues: [
        'Connection timeout',
        'Memory leak in worker process',
        'Slow database queries',
      ],
      suggestedActions: [
        'Increase connection timeout to 30s',
        'Restart worker processes',
        'Add database indexes',
      ],
    };
  }

  if (data.tenant) {
    // Add tenant-specific insights
    insights.tenantSpecific = {
      activeUsers: Math.floor(Math.random() * 1000) + 100,
      dailyRequests: Math.floor(Math.random() * 10000) + 5000,
      avgResponseTime: Math.floor(Math.random() * 200) + 50,
    };
  }

  return insights;
};

// ====================================================================
// HEALTH CHECK
// ====================================================================
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    service: 'Jobe AI Agent API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    ai: {
      model: 'Jobe-v2.0',
      status: 'ready',
    },
  };

  // Check database connection
  try {
    await pool.query('SELECT NOW()');
    health.database = 'connected';
  } catch (error) {
    health.database = 'error';
    health.status = 'degraded';
  }

  res.json(health);
});

// ====================================================================
// JOBE ENDPOINTS
// ====================================================================

// Helper function to check brand service connectivity
const checkBrandConnectivity = async (brandName, url) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(`${url}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok) {
      return { ok: true, status: response.status };
    } else {
      return { ok: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return { ok: false, error: 'Connection timeout' };
    }
    return { ok: false, error: error.message || 'Connection failed' };
  }
};

// Demo bundle debug endpoint
app.post('/api/jobe/demo-bundle-debug', async (req, res) => {
  console.log('🤖 Jobe: Analyzing bundle deployment issues...');

  try {
    const analysis = await jobeAnalyze('debug bundle deploy', {
      tenant: req.body.tenant || 'DEMO',
    });

    // Define brand services to check
    const brands = {
      ultai: process.env.ULTAI_URL || 'http://localhost:3001',
      fineguard: process.env.FINEGUARD_URL || 'http://localhost:3002',
      vaultline: process.env.VAULTLINE_URL || 'http://localhost:3003',
    };

    // Check connectivity to all brand services
    console.log('🔍 Checking brand service connectivity...');
    const brandConnectivity = {};

    for (const [brandName, url] of Object.entries(brands)) {
      console.log(`   Checking ${brandName} at ${url}...`);
      brandConnectivity[brandName] = await checkBrandConnectivity(brandName, url);
    }

    res.json({
      ok: true,
      message: 'Bundle deployment analysis completed',
      data: {
        ...analysis,
        debugMode: true,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'local',
        brandConnectivity,
        brands,
      },
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

// General Jobe analyze endpoint
app.post('/api/jobe/analyze', async (req, res) => {
  const { context, data } = req.body;

  console.log('🤖 Jobe: Analyzing', context);

  try {
    const analysis = await jobeAnalyze(context, data);

    res.json({
      ok: true,
      message: 'Analysis completed',
      data: {
        ...analysis,
        context,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

// Tenant insights endpoint
app.post('/api/jobe/tenant-insights', async (req, res) => {
  const { tenant } = req.body;

  if (!tenant) {
    return res.status(400).json({
      ok: false,
      error: 'Tenant is required',
    });
  }

  console.log(`🤖 Jobe: Generating insights for tenant ${tenant}...`);

  try {
    // Get recent deployments from database
    const deploymentsQuery = `
      SELECT bundle, status, created_at
      FROM deployments
      WHERE tenant = $1
      ORDER BY created_at DESC
      LIMIT 5
    `;
    const deployments = await pool.query(deploymentsQuery, [tenant]);

    const analysis = await jobeAnalyze('tenant insights', { tenant });

    res.json({
      ok: true,
      message: `Insights generated for ${tenant}`,
      data: {
        tenant,
        ...analysis,
        recentActivity: deployments.rows,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

// Deployment optimization suggestions
app.post('/api/jobe/optimize-deployment', async (req, res) => {
  const { bundle, tenant, currentConfig } = req.body;

  console.log(`🤖 Jobe: Optimizing deployment for ${bundle}...`);

  try {
    await new Promise(resolve => setTimeout(resolve, 400));

    const optimizations = {
      bundle,
      tenant,
      suggestions: [
        {
          category: 'Performance',
          recommendation: 'Enable CDN for static assets',
          impact: 'High',
          estimatedImprovement: '40% faster load times',
        },
        {
          category: 'Cost',
          recommendation: 'Use spot instances for non-critical workloads',
          impact: 'High',
          estimatedSavings: '$200-300/month',
        },
        {
          category: 'Reliability',
          recommendation: 'Implement multi-region failover',
          impact: 'Medium',
          estimatedImprovement: '99.99% uptime',
        },
        {
          category: 'Security',
          recommendation: 'Enable WAF and DDoS protection',
          impact: 'High',
          estimatedImprovement: 'Better threat protection',
        },
      ],
      currentMetrics: {
        cost: '$150/month',
        performance: 'Good',
        reliability: '99.5%',
      },
      optimizedMetrics: {
        cost: '$100/month',
        performance: 'Excellent',
        reliability: '99.99%',
      },
    };

    res.json({
      ok: true,
      message: 'Optimization suggestions generated',
      data: {
        ...optimizations,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

// System health check with AI insights
app.post('/api/jobe/system-health', async (req, res) => {
  console.log('🤖 Jobe: Performing system health analysis...');

  try {
    // Get deployment statistics
    const statsQuery = `
      SELECT
        COUNT(*) as total_deployments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COUNT(DISTINCT tenant) as active_tenants
      FROM deployments
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `;

    const stats = await pool.query(statsQuery);
    const systemStats = stats.rows[0];

    const analysis = await jobeAnalyze('system health', {});

    res.json({
      ok: true,
      message: 'System health analysis completed',
      data: {
        ...analysis,
        statistics: {
          last24Hours: {
            totalDeployments: parseInt(systemStats.total_deployments) || 0,
            successful: parseInt(systemStats.successful) || 0,
            failed: parseInt(systemStats.failed) || 0,
            activeTenants: parseInt(systemStats.active_tenants) || 0,
            successRate: systemStats.total_deployments > 0
              ? ((parseInt(systemStats.successful) / parseInt(systemStats.total_deployments)) * 100).toFixed(2) + '%'
              : 'N/A',
          },
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

// Predict deployment issues
app.post('/api/jobe/predict-issues', async (req, res) => {
  const { bundle, tenant, deploymentConfig } = req.body;

  console.log('🤖 Jobe: Predicting potential deployment issues...');

  try {
    await new Promise(resolve => setTimeout(resolve, 350));

    const predictions = {
      overallRisk: 'Low',
      confidence: 0.87,
      potentialIssues: [
        {
          issue: 'Database connection pool exhaustion',
          probability: 'Low (15%)',
          severity: 'Medium',
          mitigation: 'Increase pool size to 50 connections',
        },
        {
          issue: 'Memory spike during peak hours',
          probability: 'Medium (35%)',
          severity: 'Low',
          mitigation: 'Enable auto-scaling with memory threshold at 80%',
        },
      ],
      recommendations: [
        'Run integration tests before deployment',
        'Enable gradual rollout (10% -> 50% -> 100%)',
        'Set up monitoring alerts for key metrics',
      ],
    };

    res.json({
      ok: true,
      message: 'Issue prediction completed',
      data: {
        bundle,
        tenant,
        ...predictions,
        timestamp: new Date().toISOString(),
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
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🤖 ═══════════════════════════════════════════════');
  console.log('🤖 Jobe AI Agent API Server');
  console.log('🤖 ═══════════════════════════════════════════════');
  console.log(`🤖 Port: ${PORT}`);
  console.log(`🤖 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 AI Model: Jobe-v2.0`);
  console.log(`🤖 Database: ${pool.options.host}:${pool.options.port}/${pool.options.database}`);
  console.log('🤖 ═══════════════════════════════════════════════');
  console.log('');
  console.log('📚 Available Endpoints:');
  console.log('   POST /api/jobe/demo-bundle-debug    Debug bundle deployments');
  console.log('   POST /api/jobe/analyze              General AI analysis');
  console.log('   POST /api/jobe/tenant-insights      Tenant insights');
  console.log('   POST /api/jobe/optimize-deployment  Optimization suggestions');
  console.log('   POST /api/jobe/system-health        System health analysis');
  console.log('   POST /api/jobe/predict-issues       Predict deployment issues');
  console.log('');
  console.log('🧪 Test Commands:');
  console.log(`   curl http://localhost:${PORT}/health`);
  console.log(`   curl -X POST http://localhost:${PORT}/api/jobe/demo-bundle-debug \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{}'`);
  console.log('');
});
