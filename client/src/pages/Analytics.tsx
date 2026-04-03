import { useState } from "react";
import { trpc } from "@/lib/trpc";

const C = {
  bg: "#0a0f1e",
  surface: "#111827",
  border: "#1e2d45",
  accent: "#3b82f6",
  accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  text: "#f1f5f9",
  textDim: "#94a3b8",
  textMuted: "#64748b",
};

type DateRange = "7d" | "30d" | "90d" | "all";

interface AnalyticsData {
  totalAlerts: number;
  avgResolutionHours: number;
  companiesAtRisk: number;
  complianceRate: number;
  topCompaniesByAlerts: Array<{ name: string; count: number; companyNumber: string }>;
}

const DATE_RANGES: { id: DateRange; label: string }[] = [
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "all", label: "All time" },
];

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  const { data, isLoading } = trpc.analytics?.getAnalytics?.useQuery(
    { range: dateRange },
    { enabled: true }
  ) ?? { data: null, isLoading: false };

  const stats: AnalyticsData = (data as AnalyticsData) ?? {
    totalAlerts: 0,
    avgResolutionHours: 0,
    companiesAtRisk: 0,
    complianceRate: 0,
    topCompaniesByAlerts: [],
  };

  const metricCards = [
    {
      label: "Total Alerts Generated",
      value: isLoading ? "—" : stats.totalAlerts.toLocaleString(),
      color: C.accent,
      bg: C.accentGlow,
    },
    {
      label: "Avg Resolution Time",
      value: isLoading ? "—" : `${stats.avgResolutionHours}h`,
      color: C.amber,
      bg: `${C.amber}15`,
    },
    {
      label: "Companies At Risk",
      value: isLoading ? "—" : stats.companiesAtRisk.toLocaleString(),
      color: C.red,
      bg: `${C.red}15`,
    },
    {
      label: "Compliance Rate",
      value: isLoading ? "—" : `${stats.complianceRate}%`,
      color: C.green,
      bg: `${C.green}15`,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: C.bg,
        color: C.text,
        fontFamily: "system-ui, sans-serif",
        padding: "32px",
      }}
    >
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>Analytics</h1>
            <p style={{ color: C.textDim, fontSize: "14px" }}>
              Insights into your compliance monitoring activity.
            </p>
          </div>

          {/* Date range selector */}
          <div
            style={{
              display: "flex",
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {DATE_RANGES.map((range) => (
              <button
                key={range.id}
                onClick={() => setDateRange(range.id)}
                style={{
                  padding: "8px 14px",
                  background: dateRange === range.id ? C.accent : "none",
                  border: "none",
                  color: dateRange === range.id ? "#fff" : C.textDim,
                  fontSize: "13px",
                  fontWeight: dateRange === range.id ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Metric cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          {metricCards.map((card) => (
            <div
              key={card.label}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: C.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "10px",
                  fontWeight: 600,
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: card.color,
                }}
              >
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {/* Alert Trends chart placeholder */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "32px",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: C.text, marginBottom: "16px" }}>
            Alert Trends
          </h2>
          <div
            style={{
              height: "200px",
              background: C.bg,
              border: `1px dashed ${C.border}`,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "24px" }}>📈</span>
            <span style={{ color: C.textMuted, fontSize: "14px" }}>Chart coming soon</span>
            <span style={{ color: C.textMuted, fontSize: "12px" }}>
              Interactive alert trend visualisation will appear here
            </span>
          </div>
        </div>

        {/* Top 5 companies by alert count */}
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: C.text, marginBottom: "16px" }}>
            Top Companies by Alert Count
          </h2>
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {isLoading ? (
              <div
                style={{
                  padding: "48px",
                  textAlign: "center",
                  color: C.textMuted,
                  fontSize: "14px",
                }}
              >
                Loading...
              </div>
            ) : stats.topCompaniesByAlerts.length === 0 ? (
              <div
                style={{
                  padding: "48px",
                  textAlign: "center",
                  color: C.textMuted,
                  fontSize: "14px",
                }}
              >
                No data available for this period.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["#", "Company", "Company Number", "Alert Count"].map((col) => (
                      <th
                        key={col}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: C.textMuted,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.topCompaniesByAlerts.slice(0, 5).map((co, i) => (
                    <tr
                      key={co.companyNumber}
                      style={{
                        borderBottom:
                          i < Math.min(4, stats.topCompaniesByAlerts.length - 1)
                            ? `1px solid ${C.border}`
                            : "none",
                      }}
                    >
                      <td
                        style={{
                          padding: "14px 16px",
                          fontSize: "13px",
                          color: C.textMuted,
                          width: "40px",
                        }}
                      >
                        {i + 1}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: C.text,
                        }}
                      >
                        {co.name}
                      </td>
                      <td
                        style={{ padding: "14px 16px", fontSize: "13px", color: C.textDim }}
                      >
                        #{co.companyNumber}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              flex: 1,
                              height: "6px",
                              background: C.border,
                              borderRadius: "3px",
                              overflow: "hidden",
                              maxWidth: "100px",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${Math.min(100, (co.count / (stats.topCompaniesByAlerts[0]?.count ?? 1)) * 100)}%`,
                                background: C.accent,
                                borderRadius: "3px",
                              }}
                            />
                          </div>
                          <span
                            style={{ fontSize: "13px", fontWeight: 600, color: C.accent }}
                          >
                            {co.count}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
