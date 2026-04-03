import React from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '../_core/hooks/useAuth';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const MAIN_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
  { label: 'Companies', path: '/monitored-companies', icon: '🏢' },
  { label: 'Alerts', path: '/alerts', icon: '🔔' },
  { label: 'Reports', path: '/reports', icon: '📄' },
];

const TOOLS_NAV: NavItem[] = [
  { label: 'Check', path: '/check', icon: '🔍' },
  { label: 'Analytics', path: '/analytics', icon: '📊' },
  { label: 'Risk Scan', path: '/risk-scan', icon: '🛡️' },
];

const SETTINGS_NAV: NavItem[] = [
  { label: 'Settings', path: '/settings', icon: '⚙️' },
  { label: 'Billing', path: '/payments', icon: '💳' },
];

const SIDEBAR_BG = '#0a0f1e';
const ACTIVE_BG = 'rgba(59,130,246,0.15)';
const ACTIVE_BORDER = '#3b82f6';
const HOVER_BG = 'rgba(255,255,255,0.05)';

function NavLink({ item, currentPath }: { item: NavItem; currentPath: string }) {
  const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');

  return (
    <Link href={item.path}>
      <a
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '9px 16px',
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontWeight: isActive ? 600 : 400,
          color: isActive ? '#f1f5f9' : '#94a3b8',
          background: isActive ? ACTIVE_BG : 'transparent',
          borderLeft: isActive ? `3px solid ${ACTIVE_BORDER}` : '3px solid transparent',
          cursor: 'pointer',
          textDecoration: 'none',
          transition: 'background 0.15s, color 0.15s',
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            (e.currentTarget as HTMLElement).style.background = HOVER_BG;
            (e.currentTarget as HTMLElement).style.color = '#f1f5f9';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = '#94a3b8';
          }
        }}
      >
        <span style={{ fontSize: '1rem', lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
        <span>{item.label}</span>
      </a>
    </Link>
  );
}

function NavGroup({ label, items, currentPath }: { label: string; items: NavItem[]; currentPath: string }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div
        style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: '#475569',
          textTransform: 'uppercase',
          padding: '12px 16px 4px',
        }}
      >
        {label}
      </div>
      {items.map((item) => (
        <NavLink key={item.path} item={item} currentPath={currentPath} />
      ))}
    </div>
  );
}

export function MVPNavigation() {
  const [currentPath] = useLocation();
  const { user, logout } = useAuth();

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '240px',
        height: '100vh',
        background: SIDEBAR_BG,
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflowY: 'auto',
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: '20px 16px 16px',
          borderBottom: '1px solid #1e293b',
          flexShrink: 0,
        }}
      >
        <Link href="/dashboard">
          <a
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              color: '#f1f5f9',
            }}
          >
            <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🛡️</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
              FineGuard Pro
            </span>
          </a>
        </Link>
      </div>

      {/* Nav groups */}
      <div style={{ flex: 1, padding: '8px 8px 0', overflowY: 'auto' }}>
        <NavGroup label="Main" items={MAIN_NAV} currentPath={currentPath} />
        <NavGroup label="Tools" items={TOOLS_NAV} currentPath={currentPath} />
        <NavGroup label="Settings" items={SETTINGS_NAV} currentPath={currentPath} />
      </div>

      {/* User footer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #1e293b',
          flexShrink: 0,
        }}
      >
        {user && (
          <div style={{ marginBottom: '10px' }}>
            <div
              style={{
                fontSize: '0.8rem',
                color: '#f1f5f9',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.email}
            </div>
            <div style={{ marginTop: '4px' }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '2px 7px',
                  borderRadius: '999px',
                  background: 'rgba(59,130,246,0.2)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59,130,246,0.3)',
                }}
              >
                {user.plan}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '6px',
            color: '#f87171',
            fontSize: '0.8rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.2)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)';
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}

// Mobile bottom nav bar
export function MobileNavBar() {
  const [currentPath] = useLocation();

  const mobileItems: NavItem[] = [
    { label: 'Home', path: '/dashboard', icon: '🏠' },
    { label: 'Companies', path: '/monitored-companies', icon: '🏢' },
    { label: 'Alerts', path: '/alerts', icon: '🔔' },
    { label: 'Check', path: '/check', icon: '🔍' },
    { label: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: SIDEBAR_BG,
        borderTop: '1px solid #1e293b',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 0 12px',
        zIndex: 100,
      }}
    >
      {mobileItems.map((item) => {
        const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
        return (
          <Link key={item.path} href={item.path}>
            <a
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                padding: '4px 10px',
                color: isActive ? '#3b82f6' : '#94a3b8',
                textDecoration: 'none',
                fontSize: '0.65rem',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          </Link>
        );
      })}
    </nav>
  );
}

export default MVPNavigation;
