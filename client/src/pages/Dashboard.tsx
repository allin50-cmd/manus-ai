import React from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

function SkeletonBox({ width = "100%", height = "20px" }: { width?: string; height?: string }) {
  return (
    <div
      style={{
        width,
        height,
        backgroundColor: C.surfaceHover,
        borderRadius: "6px",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    />
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    overdue: { bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
    "at risk": { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
    upcoming: { bg: "rgba(59,130,246,0.15)", color: "#3b82f6" },
    resolved: { bg: "rgba(34,197,94,0.15)", color: "#22c55e" },
  };
  const style = map[status.toLowerCase()] ?? { bg: C.surfaceHover, color: C.textDim };
  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.color,
        padding: "3px 10px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
}

const statConfigs = [
  { label: "Total Monitored", key: "total", icon: "🏢", color: C.accent, trend: "+12%", up: true },
  { label: "Active Alerts", key: "alerts", icon: "🔔", color: C.amber, trend: "+3%", up: true },
  { label: "At Risk", key: "atRisk", icon: "⚠️", color: C.red, trend: "-5%", up: false },
  { label: "Compliant", key: "compliant", icon: "✅", color: C.green, trend: "+8%", up: true },
];

const mockStats = { total: 142, alerts: 17, atRisk: 9, compliant: 133 };

export default function Dashboard() {
  const alertsQuery = trpc.alerts.getRecentAlerts.useQuery();

  const alerts: Array<{
    id: string;
    companyName: string;
    type: string;
    status: string;
    dueDate: string;
  }> = (alertsQuery.data as typeof alertsQuery.data & Array<{ id: string; companyName: string; type: string; status: string; dueDate: string }>) ?? [];

  return (
    <div
      style={{
        backgroundColor: C.bg,
        minHeight: "100vh",
        padding: "32px",
        fontFamily: "system-ui, sans-serif",
        color: C.text,
      }}
    >
      <style>{`
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: "4px" }}>
          Dashboard
        </h1>
        <p style={{ color: C.textMuted, fontSize: "13px" }}>Last refreshed: just now</p>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        {statConfigs.map((s) => {
          const value = mockStats[s.key as keyof typeof mockStats];
          return (
            <div
              key={s.key}
              style={{
                backgroundColor: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "14px",
                padding: "24px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <span style={{ fontSize: "24px" }}>{s.icon}</span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: s.up ? C.green : C.red,
                    backgroundColor: s.up ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                    padding: "3px 8px",
                    borderRadius: "999px",
                  }}
                >
                  {s.up ? "▲" : "▼"} {s.trend}
                </span>
              </div>
              <div style={{ fontSize: "32px", fontWeight: 800, color: s.color, marginBottom: "4px" }}>
                {value}
              </div>
              <div style={{ color: C.textDim, fontSize: "13px" }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Alerts */}
      <div
        style={{
          backgroundColor: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "14px",
          marginBottom: "24px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: 700 }}>Recent Alerts</h2>
          <Link href="/alerts" style={{ color: C.accent, fontSize: "13px", textDecoration: "none" }}>
            View all →
          </Link>
        </div>

        {alertsQuery.isLoading ? (
          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <SkeletonBox width="200px" height="16px" />
                <SkeletonBox width="120px" height="16px" />
                <SkeletonBox width="80px" height="22px" />
                <SkeletonBox width="100px" height="16px" />
              </div>
            ))}
          </div>
        ) : alertsQuery.isError ? (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <p style={{ color: C.red, fontSize: "14px", marginBottom: "8px" }}>Failed to load alerts</p>
            <button
              onClick={() => alertsQuery.refetch()}
              style={{
                backgroundColor: C.surfaceHover,
                border: `1px solid ${C.border}`,
                color: C.text,
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Retry
            </button>
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🛡️</div>
            <p style={{ color: C.textDim, fontSize: "14px" }}>No active alerts — all companies are compliant</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Company", "Type", "Status", "Due Date", "Action"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 24px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: C.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {alerts.slice(0, 8).map((alert) => (
                  <tr
                    key={alert.id}
                    style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = C.surfaceHover)}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "14px 24px", fontSize: "14px", fontWeight: 500 }}>{alert.companyName}</td>
                    <td style={{ padding: "14px 24px", fontSize: "13px", color: C.textDim }}>{alert.type}</td>
                    <td style={{ padding: "14px 24px" }}>
                      <StatusBadge status={alert.status} />
                    </td>
                    <td style={{ padding: "14px 24px", fontSize: "13px", color: C.textDim }}>{alert.dueDate}</td>
                    <td style={{ padding: "14px 24px" }}>
                      <Link
                        href={`/alerts`}
                        style={{
                          color: C.accent,
                          fontSize: "13px",
                          textDecoration: "none",
                          fontWeight: 500,
                        }}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Link
          href="/search"
          style={{
            backgroundColor: C.accent,
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          + Add Company
        </Link>
        <button
          style={{
            backgroundColor: C.surface,
            border: `1px solid ${C.border}`,
            color: C.text,
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
          }}
          onClick={() => alertsQuery.refetch()}
        >
          ↻ Run Sweep
        </button>
        <button
          style={{
            backgroundColor: C.surface,
            border: `1px solid ${C.border}`,
            color: C.text,
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          ⬇ Download Report
        </button>
      </div>
    </div>
  );
}
