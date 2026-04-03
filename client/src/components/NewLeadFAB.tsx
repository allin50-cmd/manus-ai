import React from 'react';
import { useLocation } from 'wouter';

const VISIBLE_ROUTES = ['/dashboard', '/clients', '/monitored-companies'];

function isVisibleRoute(path: string): boolean {
  return VISIBLE_ROUTES.some(
    (route) => path === route || path.startsWith(route + '/')
  );
}

export function NewLeadFAB() {
  const [currentPath, navigate] = useLocation();

  if (!isVisibleRoute(currentPath)) {
    return null;
  }

  const handleClick = () => {
    navigate('/check');
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Add new company"
      title="Add new company"
      style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: '#3b82f6',
        border: 'none',
        color: '#fff',
        fontSize: '1.6rem',
        lineHeight: 1,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(59,130,246,0.45)',
        zIndex: 200,
        transition: 'background 0.15s, transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.background = '#2563eb';
        btn.style.transform = 'scale(1.07)';
        btn.style.boxShadow = '0 6px 24px rgba(59,130,246,0.6)';
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        btn.style.background = '#3b82f6';
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = '0 4px 20px rgba(59,130,246,0.45)';
      }}
    >
      +
    </button>
  );
}

export default NewLeadFAB;
