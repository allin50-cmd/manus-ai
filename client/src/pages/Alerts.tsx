import React, { useState } from "react";
import { trpc } from "@/lib/trpc";

const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

type FilterKey = "all" | "overdue" | "at-risk" | "upcoming";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "overdue", label: "Overdue" },
  { key: "at-risk", label: "At Risk" },
  { key: "upcoming", label: "Upcoming" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    overdue: { bg: "rgba(239,68,68,0.14)", color: C.red },
    "at risk": { bg: "rgba(245,158,11,0.14)", color: C.amber },
    "at-risk": { bg: "rgba(245,158,11,0.14)", color: C.amber },
    upcoming: { bg: "rgba(59,130,246,0.14)", color: C.accent },
    resolved: { bg: "rgba(34,197,94,0.12)", color: C.green },
  };
  const s = map[status.toLowerCase()] ?? { bg: C.surfaceHover, color: C.textDim };
  return (
    <span
      style={{
        backgroundColor: s.bg,
        color: s.color,
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

function DaysRemaining({ days }: { days: number }) {
  const color = days < 0 ? C.red : days <= 7 ? C.red : days <= 30 ? C.amber : C.green;
  const label = days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`;
  return (
    <span style={{ color, fontSize: "13px", fontWeight: 600 }}>{label}</span>
  );
}

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
      {[180, 140, 100, 80, 80, 70].map((w, i) => (
        <td key={i} style={{ padding: "16px 20px" }}>
          <div
            style={{
              width: `${w}px`,
              height: "14px",
              backgroundColor: C.surfaceHover,
              borderRadius: "4px",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        </td>
      ))}
    </tr>
  );
}

export default function Alerts() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const alertsQuery = trpc.alerts.getRecentAlerts.useQuery();

  const rawAlerts: Array<{
    id: string;
    companyName: string;
    type: string;
    dueDate: string;
    daysRemaining: number;
    status: string;
  }> = (alertsQuery.data as typeof alertsQuery.data & Array<{ id: string; companyName: string; type: string; dueDate: string; daysRemaining: number; status: string }>) ?? [];

  const filtered = rawAlerts.filter((a) => {
    if (filter === "all") return true;
    const s = a.status?.toLowerCase();
    if (filter === "overdue") return s === "overdue" || (a.daysRemaining ?? 0) < 0;
    if (filter === "at-risk") return s === "at risk" || s === "at-risk";
    if (filter === "upcoming") return s === "upcoming";
    return true;
  });

  const overdueCount = rawAlerts.filter((a) => a.status?.toLowerCase() === "overdue" || (a.daysRemaining ?? 0) < 0).length;
  const thisWeekCount = rawAlerts.filter((a) => (a.daysRemaining ?? 999) >= 0 && (a.daysRemaining ?? 999) <= 7).length;
  const upcomingCount = rawAlerts.filter((a) => (a.daysRemaining ?? 999) > 7).length;

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
      <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: "4px" }}>
          Compliance Alerts
        </h1>
        <p style={{ color: C.textMuted, fontSize: "13px" }}>
          Monitor and resolve compliance deadlines across your portfolio
        </p>
      </div>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        {[
          { label: "Overdue", count: overdueCount, color: C.red, bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" },
          { label: "Due This Week", count: thisWeekCount, color: C.amber, bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
          { label: "Upcoming", count: upcomingCount, color: C.accent, bg: C.accentGlow, border: "rgba(59,130,246,0.2)" },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              backgroundColor: card.bg,
              border: `1px solid ${card.border}`,
              borderRadius: "12px",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "28px", fontWeight: 800, color: card.color, marginBottom: "4px" }}>
              {alertsQuery.isLoading ? "—" : card.count}
            </div>
            <div style={{ color: C.textDim, fontSize: "13px" }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              backgroundColor: filter === f.key ? C.accent : C.surface,
              color: filter === f.key ? "#fff" : C.textDim,
              border: `1px solid ${filter === f.key ? C.accent : C.border}`,
              padding: "7px 18px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Alerts table */}
      <div
        style={{
          backgroundColor: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        {!alertsQuery.isLoading && !alertsQuery.isError && filtered.length === 0 ? (
          <div style={{ padding: "80px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>🛡️</div>
            <p style={{ color: C.text, fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>
              No active alerts
            </p>
            <p style={{ color: C.textDim, fontSize: "14px" }}>
              All companies are compliant. We'll notify you when action is needed.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Company Name", "Alert Type", "Due Date", "Days Remaining", "Status", "Action"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 20px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: C.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {alertsQuery.isLoading && [1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)}

                {alertsQuery.isError && (
                  <tr>
                    <td colSpan={6} style={{ padding: "48px 24px", textAlign: "center", color: C.red, fontSize: "14px" }}>
                      Failed to load alerts. Please try refreshing.
                    </td>
                  </tr>
                )}

                {filtered.map((alert) => (
                  <tr
                    key={alert.id}
                    style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = C.surfaceHover)}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "15px 20px", fontSize: "14px", fontWeight: 600 }}>{alert.companyName}</td>
                    <td style={{ padding: "15px 20px", fontSize: "13px", color: C.textDim }}>{alert.type}</td>
                    <td style={{ padding: "15px 20px", fontSize: "13px", color: C.textDim, whiteSpace: "nowrap" }}>{alert.dueDate}</td>
                    <td style={{ padding: "15px 20px" }}>
                      <DaysRemaining days={alert.daysRemaining ?? 0} />
                    </td>
                    <td style={{ padding: "15px 20px" }}>
                      <StatusBadge status={alert.status} />
                    </td>
                    <td style={{ padding: "15px 20px" }}>
                      <button
                        style={{
                          backgroundColor: "rgba(34,197,94,0.1)",
                          color: C.green,
                          border: "1px solid rgba(34,197,94,0.2)",
                          padding: "6px 14px",
                          borderRadius: "7px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
