import express from 'express';
import cors from 'cors';

// Create three brand service instances
const createBrandService = (brandName, port) => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: brandName,
      port: port,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // Brand info endpoint
  app.get('/api/info', (req, res) => {
    res.json({
      ok: true,
      brand: brandName,
      description: `${brandName} Brand Service API`,
      features: ['Authentication', 'User Management', 'Data Processing'],
      timestamp: new Date().toISOString(),
    });
  });

  // Mock API endpoint
  app.get('/api/status', (req, res) => {
    res.json({
      ok: true,
      brand: brandName,
      status: 'operational',
      uptime: '99.9%',
      timestamp: new Date().toISOString(),
    });
  });

  return app;
};

// Start the three brand services
const startServices = () => {
  const brands = [
    { name: 'UltAI', port: 3001 },
    { name: 'FineGuard', port: 3002 },
    { name: 'VaultLine', port: 3003 },
  ];

  brands.forEach(({ name, port }) => {
    const app = createBrandService(name, port);

    app.listen(port, () => {
      console.log(`✅ ${name} API listening on port ${port}`);
      console.log(`   Health: http://localhost:${port}/health`);
      console.log(`   Info:   http://localhost:${port}/api/info`);
      console.log(`   Status: http://localhost:${port}/api/status`);
      console.log('');
    });
  });

  console.log('🎉 All brand services are running!');
  console.log('');
  console.log('Test connectivity:');
  console.log('  curl http://localhost:3001/health');
  console.log('  curl http://localhost:3002/health');
  console.log('  curl http://localhost:3003/health');
  console.log('');
};

startServices();
