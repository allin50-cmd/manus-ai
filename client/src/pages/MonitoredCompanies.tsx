import React, { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

type FilterKey = "all" | "active" | "dissolved" | "at-risk";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "dissolved", label: "Dissolved" },
  { key: "at-risk", label: "At Risk" },
];

function StatusBadge({ status }: { status: string }) {
  const active = status?.toLowerCase() === "active";
  const dissolved = status?.toLowerCase() === "dissolved";
  const bg = active ? "rgba(34,197,94,0.12)" : dissolved ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.12)";
  const color = active ? C.green : dissolved ? C.red : C.amber;
  return (
    <span style={{ backgroundColor: bg, color, padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600 }}>
      {status}
    </span>
  );
}

function ComplianceScore({ score }: { score: number }) {
  const color = score >= 80 ? C.green : score >= 50 ? C.amber : C.red;
  const pct = Math.min(100, Math.max(0, score));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div
        style={{
          width: "60px",
          height: "6px",
          backgroundColor: C.border,
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: "999px",
            transition: "width 0.3s",
          }}
        />
      </div>
      <span style={{ color, fontSize: "13px", fontWeight: 700 }}>{score}</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        backgroundColor: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "14px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {[200, 140, 100, 80].map((w, i) => (
        <div
          key={i}
          style={{
            width: `${w}px`,
            height: "14px",
            backgroundColor: C.surfaceHover,
            borderRadius: "4px",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      ))}
    </div>
  );
}

export default function MonitoredCompanies() {
  const [filter, setFilter] = useState<FilterKey>("all");

  // Prefer getMonitoredCompanies, fall back to getClients
  const monitoredQuery = trpc.companies.getMonitoredCompanies
    ? trpc.companies.getMonitoredCompanies.useQuery()
    : trpc.companies.getClients?.useQuery?.() ?? { data: undefined, isLoading: false, isError: false };

  const rawCompanies: Array<{
    companyNumber: string;
    companyName: string;
    companyStatus: string;
    complianceScore?: number;
    nextDeadline?: string;
    alertCount?: number;
  }> = (monitoredQuery.data as typeof monitoredQuery.data & Array<{ companyNumber: string; companyName: string; companyStatus: string; complianceScore?: number; nextDeadline?: string; alertCount?: number }>) ?? [];

  const filtered = rawCompanies.filter((c) => {
    if (filter === "all") return true;
    const s = c.companyStatus?.toLowerCase();
    if (filter === "active") return s === "active";
    if (filter === "dissolved") return s === "dissolved";
    if (filter === "at-risk") return (c.complianceScore ?? 100) < 60;
    return true;
  });

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: "4px" }}>
            Monitored Companies
          </h1>
          <p style={{ color: C.textMuted, fontSize: "13px" }}>
            {monitoredQuery.isLoading ? "Loading…" : `${rawCompanies.length} companies in your portfolio`}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            href="/search"
            style={{
              backgroundColor: C.accent,
              color: "#fff",
              padding: "10px 18px",
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
              padding: "10px 18px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ⬆ Bulk Import
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "24px", flexWrap: "wrap" }}>
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

      {/* Loading skeleton grid */}
      {monitoredQuery.isLoading && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Error */}
      {monitoredQuery.isError && (
        <div
          style={{
            backgroundColor: "rgba(239,68,68,0.08)",
            border: `1px solid rgba(239,68,68,0.2)`,
            borderRadius: "12px",
            padding: "24px",
            color: C.red,
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          Failed to load companies. Please try refreshing.
        </div>
      )}

      {/* Empty state */}
      {!monitoredQuery.isLoading && !monitoredQuery.isError && filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "80px 24px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏢</div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
            {rawCompanies.length > 0 ? `No ${filter} companies` : "No companies yet"}
          </h2>
          <p style={{ color: C.textDim, fontSize: "15px", marginBottom: "28px" }}>
            {rawCompanies.length > 0
              ? "Try adjusting your filter."
              : "Start monitoring your first company to receive compliance alerts."}
          </p>
          {rawCompanies.length === 0 && (
            <Link
              href="/search"
              style={{
                backgroundColor: C.accent,
                color: "#fff",
                padding: "12px 28px",
                borderRadius: "10px",
                textDecoration: "none",
                fontSize: "15px",
                fontWeight: 700,
              }}
            >
              Start monitoring your first company →
            </Link>
          )}
        </div>
      )}

      {/* Company cards grid */}
      {!monitoredQuery.isLoading && filtered.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {filtered.map((company) => (
            <Link
              key={company.companyNumber}
              href={`/company/${company.companyNumber}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  backgroundColor: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: "14px",
                  padding: "22px",
                  cursor: "pointer",
                  transition: "border-color 0.2s, background-color 0.2s",
                  height: "100%",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = C.accent;
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = C.surfaceHover;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = C.border;
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = C.surface;
                }}
              >
                {/* Card header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: "8px" }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: C.text,
                        marginBottom: "4px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {company.companyName}
                    </div>
                    <div style={{ color: C.textMuted, fontSize: "12px" }}>No. {company.companyNumber}</div>
                  </div>
                  <StatusBadge status={company.companyStatus ?? "Active"} />
                </div>

                {/* Compliance score */}
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ color: C.textMuted, fontSize: "11px", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    Compliance Score
                  </div>
                  <ComplianceScore score={company.complianceScore ?? 85} />
                </div>

                {/* Next deadline */}
                {company.nextDeadline && (
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ color: C.textMuted, fontSize: "11px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                      Next Deadline
                    </div>
                    <div style={{ color: C.textDim, fontSize: "13px" }}>{company.nextDeadline}</div>
                  </div>
                )}

                {/* Alert count */}
                {(company.alertCount ?? 0) > 0 && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "rgba(245,158,11,0.1)",
                      border: "1px solid rgba(245,158,11,0.2)",
                      color: C.amber,
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    🔔 {company.alertCount} alert{(company.alertCount ?? 0) !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
