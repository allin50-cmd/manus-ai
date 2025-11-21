-- UltraCore Database Initialization Script
-- This script sets up the initial database schema

-- Create deployments table
CREATE TABLE IF NOT EXISTS deployments (
    id SERIAL PRIMARY KEY,
    tenant VARCHAR(255) NOT NULL,
    bundle VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster tenant queries
CREATE INDEX IF NOT EXISTS idx_deployments_tenant ON deployments(tenant);
CREATE INDEX IF NOT EXISTS idx_deployments_created_at ON deployments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    tenant_code VARCHAR(255) UNIQUE NOT NULL,
    tenant_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for tenant lookups
CREATE INDEX IF NOT EXISTS idx_tenants_code ON tenants(tenant_code);

-- Create bundles table
CREATE TABLE IF NOT EXISTS bundles (
    id SERIAL PRIMARY KEY,
    bundle_id VARCHAR(255) UNIQUE NOT NULL,
    bundle_name VARCHAR(255) NOT NULL,
    description TEXT,
    services JSONB,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create agent_logs table for Jobe AI tracking
CREATE TABLE IF NOT EXISTS agent_logs (
    id SERIAL PRIMARY KEY,
    agent_name VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    input_data JSONB,
    output_data JSONB,
    execution_time INTEGER,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for agent logs
CREATE INDEX IF NOT EXISTS idx_agent_logs_created_at ON agent_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_name ON agent_logs(agent_name);

-- Insert sample tenants
INSERT INTO tenants (tenant_code, tenant_name, status, metadata) VALUES
('ACCURACY', 'Accuracy Corporation', 'active', '{"industry": "Finance", "region": "US-East"}'),
('DEMO', 'Demo Tenant', 'active', '{"industry": "Technology", "region": "Global"}'),
('TEST', 'Test Tenant', 'active', '{"industry": "Testing", "region": "Global"}')
ON CONFLICT (tenant_code) DO NOTHING;

-- Insert sample bundles
INSERT INTO bundles (bundle_id, bundle_name, description, services) VALUES
('intake-stack', 'Intake Stack', 'Complete intake management system', '["intake-api", "intake-ui", "intake-processor"]'),
('ultraengage-stack', 'UltraEngage Stack', 'Customer engagement platform', '["ultraengage-api", "ultraengage-ui", "engagement-worker"]'),
('analytics-stack', 'Analytics Stack', 'Analytics and reporting system', '["analytics-api", "analytics-ui", "data-processor"]')
ON CONFLICT (bundle_id) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_deployments_updated_at ON deployments;
CREATE TRIGGER update_deployments_updated_at
    BEFORE UPDATE ON deployments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bundles_updated_at ON bundles;
CREATE TRIGGER update_bundles_updated_at
    BEFORE UPDATE ON bundles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'UltraCore database initialized successfully!';
    RAISE NOTICE 'Tables created: deployments, tenants, bundles, agent_logs';
    RAISE NOTICE 'Sample data inserted for tenants and bundles';
END $$;
