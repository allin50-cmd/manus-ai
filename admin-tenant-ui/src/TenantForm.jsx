import React, { useState } from 'react';

export default function TenantForm({ onProvision }) {
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('essentials');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!slug || !name) {
      setMessage('❌ Slug and name are required');
      return;
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setMessage('❌ Slug must contain only lowercase letters, numbers, and hyphens');
      return;
    }

    setLoading(true);
    setMessage('⏳ Provisioning tenant...');

    const result = await onProvision({
      slug,
      name,
      email,
      plan,
    });

    setLoading(false);

    if (result.ok) {
      setMessage(`✅ Tenant provisioned successfully!`);
      // Clear form
      setSlug('');
      setName('');
      setEmail('');
      setPlan('essentials');

      // Show next steps if available
      if (result.data.nextSteps) {
        console.log('Next steps:', result.data.nextSteps);
      }
    } else {
      setMessage(`❌ Error: ${result.error}`);
    }
  }

  return (
    <form className="tenant-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="slug">
            Tenant Slug <span className="required">*</span>
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="e.g., stork-nhs"
            required
            disabled={loading}
            pattern="[a-z0-9-]+"
            title="Lowercase letters, numbers, and hyphens only"
          />
          <small>Unique identifier (lowercase, no spaces)</small>
        </div>

        <div className="form-group">
          <label htmlFor="name">
            Tenant Name <span className="required">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Stork Maternity (NHS)"
            required
            disabled={loading}
          />
          <small>Human-readable organization name</small>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="email">Contact Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@example.com"
            disabled={loading}
          />
          <small>Primary contact for this tenant</small>
        </div>

        <div className="form-group">
          <label htmlFor="plan">
            Subscription Plan <span className="required">*</span>
          </label>
          <select
            id="plan"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            required
            disabled={loading}
          >
            <option value="essentials">Essentials</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <small>Determines features and resource limits</small>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? '⏳ Provisioning...' : '🚀 Provision Tenant'}
        </button>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : message.includes('❌') ? 'error' : 'info'}`}>
            {message}
          </div>
        )}
      </div>
    </form>
  );
}
