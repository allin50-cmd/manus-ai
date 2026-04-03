import React, { useEffect, useState } from 'react';

const CONSENT_KEY = 'fg_consent';

type ConsentValue = 'all' | 'essential';

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const handleConsent = (value: ConsentValue) => {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#0d1526',
        borderTop: '1px solid #1e293b',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        zIndex: 1000,
        flexWrap: 'wrap',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: '0.875rem',
          color: '#94a3b8',
          flex: '1 1 260px',
        }}
      >
        We use cookies to improve your experience on FineGuard Pro. You can choose which cookies to
        allow.
      </p>
      <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
        <button
          onClick={() => handleConsent('essential')}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#94a3b8',
            fontSize: '0.8rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.borderColor = '#64748b';
            btn.style.color = '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.borderColor = '#334155';
            btn.style.color = '#94a3b8';
          }}
        >
          Essential Only
        </button>
        <button
          onClick={() => handleConsent('all')}
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            border: '1px solid #3b82f6',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#2563eb';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#3b82f6';
          }}
        >
          Accept All
        </button>
      </div>
    </div>
  );
}

export default CookieConsentBanner;
