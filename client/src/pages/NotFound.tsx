import React from 'react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0f1e',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '6rem',
          fontWeight: 800,
          color: '#3b82f6',
          lineHeight: 1,
          letterSpacing: '-0.04em',
        }}
      >
        404
      </div>
      <h1
        style={{
          marginTop: '16px',
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#f1f5f9',
        }}
      >
        Page not found
      </h1>
      <p
        style={{
          marginTop: '10px',
          fontSize: '0.95rem',
          color: '#64748b',
          maxWidth: '380px',
          lineHeight: 1.6,
        }}
      >
        The page you are looking for does not exist or has been moved. Check the URL or head back to
        the dashboard.
      </p>
      <Link href="/">
        <a
          style={{
            marginTop: '28px',
            display: 'inline-block',
            padding: '11px 28px',
            background: '#3b82f6',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#2563eb';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#3b82f6';
          }}
        >
          Go Home
        </a>
      </Link>
    </div>
  );
}
