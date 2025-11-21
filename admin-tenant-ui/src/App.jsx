import React, { useEffect, useState } from 'react';
import TenantForm from './TenantForm';
import TenantList from './TenantList';
import './App.css';

/**
 * Tenant Administration Dashboard
 *
 * Features:
 * - List all tenants with filtering
 * - Provision new tenants
 * - View tenant details
 * - Update tenant status
 * - Real-time status indicators
 */
function App() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ status: '', plan: '' });

  useEffect(() => {
    fetchTenants();
  }, [filter]);

  /**
   * Fetch tenants from API with optional filtering
   */
  async function fetchTenants() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.plan) params.append('plan', filter.plan);

      const res = await fetch(`/api/tenants?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const data = await res.json();
      setTenants(data.tenants || []);
      setError(null);
    } catch (err) {
      console.error('Fetch tenants error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Provision new tenant
   */
  async function onProvision(payload) {
    try {
      const res = await fetch('/api/tenants/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Provisioning failed');
      }

      await fetchTenants(); // Refresh list
      return { ok: true, data };
    } catch (err) {
      console.error('Provision error:', err);
      return { ok: false, error: err.message };
    }
  }

  /**
   * Update tenant status
   */
  async function onUpdateStatus(slug, newStatus) {
    try {
      const res = await fetch(`/api/tenants/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Update failed');

      await fetchTenants(); // Refresh list
      return true;
    } catch (err) {
      console.error('Update status error:', err);
      alert(`Failed to update status: ${err.message}`);
      return false;
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏢 Tenant Administration</h1>
        <p>Multi-tenant provisioning and management dashboard</p>
      </header>

      <main className="app-main">
        {/* Provisioning Form */}
        <section className="section">
          <h2>➕ Provision New Tenant</h2>
          <TenantForm onProvision={onProvision} />
        </section>

        {/* Filters */}
        <section className="section">
          <h2>🔍 Filter Tenants</h2>
          <div className="filters">
            <label>
              Status:
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </label>

            <label>
              Plan:
              <select
                value={filter.plan}
                onChange={(e) => setFilter({ ...filter, plan: e.target.value })}
              >
                <option value="">All</option>
                <option value="essentials">Essentials</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </label>

            <button onClick={fetchTenants}>🔄 Refresh</button>
          </div>
        </section>

        {/* Tenant List */}
        <section className="section">
          <h2>📋 Tenants ({tenants.length})</h2>

          {error && (
            <div className="error">
              ❌ Error: {error}
            </div>
          )}

          {loading ? (
            <div className="loading">⏳ Loading tenants...</div>
          ) : (
            <TenantList
              tenants={tenants}
              onUpdateStatus={onUpdateStatus}
              onRefresh={fetchTenants}
            />
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>UltraCore Multi-Tenant Platform © 2024</p>
      </footer>
    </div>
  );
}

export default App;
