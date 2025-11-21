import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TenantForm from './TenantForm';
import TenantList from './TenantList';
import './App.css';

function App() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTenants();
  }, [filter]);

  async function fetchTenants() {
    try {
      setLoading(true);
      setError(null);

      const params = filter !== 'all' ? { status: filter } : {};
      const response = await axios.get('/api/tenants', { params });

      setTenants(response.data.tenants || []);
    } catch (err) {
      console.error('Error fetching tenants:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleProvision(payload) {
    try {
      const response = await axios.post('/api/tenants/provision', payload);

      if (response.data.ok) {
        await fetchTenants();
        return { ok: true, data: response.data };
      }

      return { ok: false, error: response.data.error };
    } catch (err) {
      console.error('Error provisioning tenant:', err);
      return {
        ok: false,
        error: err.response?.data?.error || err.message,
      };
    }
  }

  async function handleDelete(slug) {
    if (!window.confirm(`Are you sure you want to deactivate tenant ${slug}?`)) {
      return;
    }

    try {
      await axios.delete(`/api/tenants/${slug}`);
      await fetchTenants();
    } catch (err) {
      console.error('Error deleting tenant:', err);
      alert('Failed to delete tenant: ' + (err.response?.data?.error || err.message));
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 UltraCore Tenant Administration</h1>
        <p>Manage tenant provisioning and configuration</p>
      </header>

      <main className="app-main">
        <section className="provision-section">
          <h2>Provision New Tenant</h2>
          <TenantForm onProvision={handleProvision} />
        </section>

        <section className="tenants-section">
          <div className="tenants-header">
            <h2>Tenants</h2>
            <div className="filter-controls">
              <label>
                Filter:
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="provisioning">Provisioning</option>
                </select>
              </label>
              <button onClick={fetchTenants} className="btn-refresh">
                ↻ Refresh
              </button>
            </div>
          </div>

          {loading && <div className="loading">Loading tenants...</div>}

          {error && (
            <div className="error">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && !error && (
            <TenantList tenants={tenants} onDelete={handleDelete} />
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>UltraCore Platform © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
