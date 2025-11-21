import React, { useState } from 'react';
import './TenantList.css';

/**
 * Tenant List Component
 *
 * Displays tenants in a sortable, filterable table
 */
export default function TenantList({ tenants, onUpdateStatus, onRefresh }) {
  const [sortBy, setSortBy] = useState('CreatedDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedRow, setExpandedRow] = useState(null);

  /**
   * Sort tenants by specified field
   */
  function sortTenants(data) {
    return [...data].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (aVal === bVal) return 0;

      const comparison = aVal > bVal ? 1 : -1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Handle column header click for sorting
   */
  function handleSort(field) {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }

  /**
   * Get status badge color
   */
  function getStatusColor(status) {
    switch (status) {
      case 'active': return '#10b981';
      case 'suspended': return '#f59e0b';
      case 'deactivated': return '#ef4444';
      default: return '#6b7280';
    }
  }

  /**
   * Get plan badge color
   */
  function getPlanColor(plan) {
    switch (plan) {
      case 'essentials': return '#3b82f6';
      case 'pro': return '#8b5cf6';
      case 'enterprise': return '#ec4899';
      default: return '#6b7280';
    }
  }

  /**
   * Format date for display
   */
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Toggle row expansion
   */
  function toggleRow(tenantId) {
    setExpandedRow(expandedRow === tenantId ? null : tenantId);
  }

  const sortedTenants = sortTenants(tenants);

  if (tenants.length === 0) {
    return (
      <div className="empty-state">
        <p>📭 No tenants found</p>
        <button onClick={onRefresh}>🔄 Refresh</button>
      </div>
    );
  }

  return (
    <div className="tenant-list">
      <table className="tenant-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('TenantSlug')} className="sortable">
              Slug {sortBy === 'TenantSlug' && (sortOrder === 'asc' ? '▲' : '▼')}
            </th>
            <th onClick={() => handleSort('TenantName')} className="sortable">
              Name {sortBy === 'TenantName' && (sortOrder === 'asc' ? '▲' : '▼')}
            </th>
            <th onClick={() => handleSort('Plan')} className="sortable">
              Plan {sortBy === 'Plan' && (sortOrder === 'asc' ? '▲' : '▼')}
            </th>
            <th onClick={() => handleSort('Status')} className="sortable">
              Status {sortBy === 'Status' && (sortOrder === 'asc' ? '▲' : '▼')}
            </th>
            <th onClick={() => handleSort('CreatedDate')} className="sortable">
              Created {sortBy === 'CreatedDate' && (sortOrder === 'asc' ? '▲' : '▼')}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedTenants.map((tenant) => (
            <React.Fragment key={tenant.TenantID}>
              <tr
                className={expandedRow === tenant.TenantID ? 'expanded' : ''}
                onClick={() => toggleRow(tenant.TenantID)}
              >
                <td>
                  <code>{tenant.TenantSlug}</code>
                </td>
                <td>
                  <strong>{tenant.TenantName}</strong>
                </td>
                <td>
                  <span
                    className="badge"
                    style={{ backgroundColor: getPlanColor(tenant.Plan) }}
                  >
                    {tenant.Plan}
                  </span>
                </td>
                <td>
                  <span
                    className="badge"
                    style={{ backgroundColor: getStatusColor(tenant.Status) }}
                  >
                    {tenant.Status}
                  </span>
                </td>
                <td>{formatDate(tenant.CreatedDate)}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="actions">
                    {tenant.Status === 'active' && (
                      <button
                        className="btn-action btn-warning"
                        onClick={() => onUpdateStatus(tenant.TenantSlug, 'suspended')}
                        title="Suspend tenant"
                      >
                        ⏸️
                      </button>
                    )}
                    {tenant.Status === 'suspended' && (
                      <button
                        className="btn-action btn-success"
                        onClick={() => onUpdateStatus(tenant.TenantSlug, 'active')}
                        title="Activate tenant"
                      >
                        ▶️
                      </button>
                    )}
                    {tenant.Status !== 'deactivated' && (
                      <button
                        className="btn-action btn-danger"
                        onClick={() => {
                          if (window.confirm(`Deactivate tenant "${tenant.TenantSlug}"?`)) {
                            onUpdateStatus(tenant.TenantSlug, 'deactivated');
                          }
                        }}
                        title="Deactivate tenant"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </td>
              </tr>

              {expandedRow === tenant.TenantID && (
                <tr className="details-row">
                  <td colSpan="6">
                    <div className="tenant-details">
                      <div className="detail-group">
                        <strong>Tenant ID:</strong>
                        <span>{tenant.TenantID}</span>
                      </div>
                      <div className="detail-group">
                        <strong>Contact Email:</strong>
                        <span>{tenant.ContactEmail || 'N/A'}</span>
                      </div>
                      <div className="detail-group">
                        <strong>Last Updated:</strong>
                        <span>{formatDate(tenant.LastUpdated)}</span>
                      </div>
                      {tenant.Note && (
                        <div className="detail-group">
                          <strong>Notes:</strong>
                          <span>{tenant.Note}</span>
                        </div>
                      )}
                      <div className="detail-actions">
                        <a
                          href={`https://${tenant.TenantSlug}.yourdomain.com`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-link"
                        >
                          🔗 Visit Tenant Portal
                        </a>
                        <a
                          href={`/api/ip-vault/blobs/${tenant.TenantSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-link"
                        >
                          📦 View Storage
                        </a>
                        <a
                          href={`/api/ip-vault/audit/${tenant.TenantSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-link"
                        >
                          📝 View Audit Logs
                        </a>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
