import os
import json
import requests
from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)

# Configuration
KEY_VAULT_URL = f"https://ch-vault-75482.vault.azure.net/"

def get_secret(secret_name):
    """Get secret from Azure Key Vault"""
    try:
        credential = DefaultAzureCredential()
        client = SecretClient(vault_url=KEY_VAULT_URL, credential=credential)
        secret = client.get_secret(secret_name)
        return secret.value
    except Exception as e:
        print(f"Error getting secret {secret_name}: {e}")
        return None

def get_db_connection():
    """Get database connection"""
    try:
        conn_string = get_secret("db-connection-string")
        if conn_string:
            return psycopg2.connect(conn_string)
    except Exception as e:
        print(f"Database connection error: {e}")
    return None

@app.route('/health')
def health():
    """Health check endpoint"""
    status = {
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'Companies House Automation',
        'version': '1.0.0'
    }
    
    # Check database connectivity
    try:
        conn = get_db_connection()
        if conn:
            conn.close()
            status['database'] = 'connected'
        else:
            status['database'] = 'disconnected'
            status['status'] = 'degraded'
    except Exception as e:
        status['database'] = f'error: {str(e)}'
        status['status'] = 'degraded'
    
    # Check API key
    api_key = get_secret("companies-house-api-key")
    status['api_configured'] = bool(api_key)
    
    return jsonify(status), 200 if status['status'] == 'healthy' else 503

@app.route('/info')
def info():
    """System information endpoint"""
    return jsonify({
        'name': 'Companies House Automation System',
        'description': 'Automated UK company compliance monitoring',
        'version': '1.0.0',
        'deployed_at': datetime.now().isoformat(),
        'resource_group': 'companies-house-rg',
        'location': 'uksouth',
        'features': [
            'Companies House API integration',
            'Real-time compliance monitoring',
            'Automated data processing',
            'Cost optimization',
            'Health monitoring'
        ]
    })

@app.route('/metrics')
def metrics():
    """Basic metrics endpoint"""
    return jsonify({
        'uptime_seconds': 3600,  # Placeholder
        'requests_total': 100,   # Placeholder
        'database_connections': 1,
        'last_update': datetime.now().isoformat(),
        'status': 'operational'
    })

@app.route('/companies/due-soon')
def companies_due_soon():
    """Get companies with confirmation statements due soon"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database not available'}), 503
        
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Create sample data if table doesn't exist
            cur.execute("""
                CREATE TABLE IF NOT EXISTS companies (
                    company_number VARCHAR(8) PRIMARY KEY,
                    company_name TEXT NOT NULL,
                    confirmation_statement_due_date DATE,
                    company_status VARCHAR(20) DEFAULT 'active'
                )
            """)
            
            # Insert sample data
            cur.execute("""
                INSERT INTO companies (company_number, company_name, confirmation_statement_due_date, company_status)
                VALUES 
                    ('12345678', 'TechStart Solutions Ltd', CURRENT_DATE + INTERVAL '15 days', 'active'),
                    ('87654321', 'Green Energy Ltd', CURRENT_DATE + INTERVAL '25 days', 'active'),
                    ('11223344', 'Digital Marketing Pro Ltd', CURRENT_DATE + INTERVAL '35 days', 'active')
                ON CONFLICT (company_number) DO NOTHING
            """)
            
            cur.execute("""
                SELECT company_number, company_name, 
                       confirmation_statement_due_date,
                       EXTRACT(days FROM confirmation_statement_due_date - CURRENT_DATE) as days_until_due
                FROM companies 
                WHERE confirmation_statement_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
                ORDER BY confirmation_statement_due_date ASC
                LIMIT 10
            """)
            companies = cur.fetchall()
        
        conn.commit()
        conn.close()
        return jsonify({
            'companies': [dict(company) for company in companies],
            'count': len(companies),
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=False)
