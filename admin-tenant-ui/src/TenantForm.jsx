import React, { useState } from 'react';
import './TenantForm.css';

/**
 * Tenant Provisioning Form
 *
 * Collects tenant information and submits to provisioning API
 */
export default function TenantForm({ onProvision }) {
  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    email: '',
    plan: 'essentials'
  });
  const [status, setStatus] = useState({ message: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  /**
   * Generate slug from tenant name
   */
  function generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
  }

  /**
   * Handle form field changes
   */
  function handleChange(field, value) {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-generate slug when name changes
      if (field === 'name' && !prev.slug) {
        updated.slug = generateSlug(value);
      }

      return updated;
    });
  }

  /**
   * Validate form
   */
  function validate() {
    if (!formData.slug) return 'Tenant slug is required';
    if (!formData.name) return 'Tenant name is required';
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      return 'Slug must contain only lowercase letters, numbers, and hyphens';
    }
    if (formData.slug.length < 3) return 'Slug must be at least 3 characters';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Invalid email format';
    }
    return null;
  }

  /**
   * Handle form submission
   */
  async function handleSubmit(e) {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setStatus({ message: validationError, type: 'error' });
      return;
    }

    setSubmitting(true);
    setStatus({ message: '⏳ Provisioning tenant...', type: 'info' });

    const result = await onProvision(formData);

    if (result.ok) {
      setStatus({
        message: `✅ Tenant "${formData.slug}" provisioned successfully!`,
        type: 'success'
      });

      // Reset form
      setFormData({
        slug: '',
        name: '',
        email: '',
        plan: 'essentials'
      });

      // Clear success message after 5 seconds
      setTimeout(() => setStatus({ message: '', type: '' }), 5000);
    } else {
      setStatus({
        message: `❌ Provisioning failed: ${result.error}`,
        type: 'error'
      });
    }

    setSubmitting(false);
  }

  return (
    <form className="tenant-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="name">
            Tenant Name <span className="required">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Stork Maturity (NHS)"
            required
            disabled={submitting}
          />
          <small>Human-readable display name</small>
        </div>

        <div className="form-group">
          <label htmlFor="slug">
            Tenant Slug <span className="required">*</span>
          </label>
          <input
            id="slug"
            type="text"
            value={formData.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            placeholder="e.g., stork-nhs"
            pattern="[a-z0-9-]+"
            required
            disabled={submitting}
          />
          <small>Unique identifier (lowercase, hyphenated)</small>
        </div>

        <div className="form-group">
          <label htmlFor="email">Contact Email</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="e.g., contact@tenant.com"
            disabled={submitting}
          />
          <small>Optional primary contact</small>
        </div>

        <div className="form-group">
          <label htmlFor="plan">
            Subscription Plan <span className="required">*</span>
          </label>
          <select
            id="plan"
            value={formData.plan}
            onChange={(e) => handleChange('plan', e.target.value)}
            disabled={submitting}
          >
            <option value="essentials">Essentials - Basic features</option>
            <option value="pro">Pro - Advanced features</option>
            <option value="enterprise">Enterprise - Full features + SLA</option>
          </select>
        </div>
      </div>

      {status.message && (
        <div className={`form-status status-${status.type}`}>
          {status.message}
        </div>
      )}

      <div className="form-actions">
        <button
          type="submit"
          className="btn-primary"
          disabled={submitting}
        >
          {submitting ? '⏳ Provisioning...' : '➕ Provision Tenant'}
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => setFormData({ slug: '', name: '', email: '', plan: 'essentials' })}
          disabled={submitting}
        >
          🔄 Reset
        </button>
      </div>
    </form>
  );
}
