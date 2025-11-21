import React from 'react';

export default function TenantList({ tenants, onDelete }) {
  if (!tenants || tenants.length === 0) {
    return <div className="empty-state">No tenants found</div>;
  }

  function getStatusBadge(status) {
    const statusMap = {
      active: { label: 'Active', className: 'status-active' },
      inactive: { label: 'Inactive', className: 'status-inactive' },
      provisioning: { label: 'Provisioning', className: 'status-provisioning' },
    };

    const statusInfo = statusMap[status] || { label: status, className: 'status-unknown' };

    return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
  }

  function getPlanBadge(plan) {
    const planMap = {
      essentials: { label: 'Essentials', className: 'plan-essentials' },
      pro: { label: 'Pro', className: 'plan-pro' },
      enterprise: { label: 'Enterprise', className: 'plan-enterprise' },
    };

    const planInfo = planMap[plan] || { label: plan, className: 'plan-unknown' };

    return <span className={`plan-badge ${planInfo.className}`}>{planInfo.label}</span>;
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="tenant-list">
      <table>
        <thead>
          <tr>
            <th>Slug</th>
            <th>Name</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant) => {
            const metadata = typeof tenant.metadata === 'string'
              ? JSON.parse(tenant.metadata)
              : tenant.metadata || {};

            return (
              <tr key={tenant.id || tenant.tenant_code}>
                <td>
                  <code className="tenant-slug">{tenant.tenant_code}</code>
                </td>
                <td>
                  <strong>{tenant.tenant_name}</strong>
                  {metadata.email && (
                    <div className="tenant-email">
                      <small>{metadata.email}</small>
                    </div>
                  )}
                </td>
                <td>{getPlanBadge(metadata.plan)}</td>
                <td>{getStatusBadge(tenant.status)}</td>
                <td>
                  <small>{formatDate(tenant.created_at)}</small>
                </td>
                <td className="actions">
                  <button
                    className="btn-view"
                    onClick={() => alert('View details feature coming soon!')}
                    title="View details"
                  >
                    👁️
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => onDelete(tenant.tenant_code)}
                    title="Deactivate tenant"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
