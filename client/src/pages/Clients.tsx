import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
      {[180, 160, 80, 60, 80, 120].map((w, i) => (
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

function StatusBadge({ status }: { status: string }) {
  const active = status.toLowerCase() === "active";
  return (
    <span
      style={{
        backgroundColor: active ? "rgba(34,197,94,0.12)" : "rgba(100,116,139,0.15)",
        color: active ? C.green : C.textMuted,
        padding: "3px 10px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  );
}

function AlertBadge({ count }: { count: number }) {
  if (count === 0) return <span style={{ color: C.textMuted, fontSize: "13px" }}>—</span>;
  const color = count > 5 ? C.red : count > 2 ? C.amber : C.amber;
  return (
    <span
      style={{
        backgroundColor: count > 5 ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)",
        color,
        padding: "3px 10px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 700,
      }}
    >
      {count}
    </span>
  );
}

export default function Clients() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  const clientsQuery = trpc.clients.getClients.useQuery();

  const rawClients: Array<{
    id: string;
    name: string;
    email: string;
    companiesCount: number;
    alertsCount: number;
    status: string;
  }> = (clientsQuery.data as typeof clientsQuery.data & Array<{ id: string; name: string; email: string; companiesCount: number; alertsCount: number; status: string }>) ?? [];

  const filtered = rawClients.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: "4px" }}>Clients</h1>
          <p style={{ color: C.textMuted, fontSize: "13px" }}>Manage your accountancy firm's client portfolio</p>
        </div>
        <button
          style={{
            backgroundColor: C.accent,
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + Add Client
        </button>
      </div>

      {/* Search/filter bar */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          style={{
            backgroundColor: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            padding: "10px 16px",
            color: C.text,
            fontSize: "14px",
            width: "100%",
            maxWidth: "380px",
            outline: "none",
          }}
          onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = C.accent)}
          onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = C.border)}
        />
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Client Name", "Contact Email", "Companies", "Alerts", "Status", "Actions"].map((h) => (
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
              {clientsQuery.isLoading && [1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)}

              {clientsQuery.isError && (
                <tr>
                  <td colSpan={6} style={{ padding: "48px 24px", textAlign: "center", color: C.red, fontSize: "14px" }}>
                    Failed to load clients. Please try refreshing.
                  </td>
                </tr>
              )}

              {!clientsQuery.isLoading && !clientsQuery.isError && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "64px 24px", textAlign: "center" }}>
                    <div style={{ fontSize: "32px", marginBottom: "12px" }}>👥</div>
                    <p style={{ color: C.textDim, fontSize: "15px", marginBottom: "8px" }}>
                      {search ? `No clients matching "${search}"` : "No clients yet"}
                    </p>
                    {!search && (
                      <p style={{ color: C.textMuted, fontSize: "13px" }}>
                        Add your first client to start managing their compliance.
                      </p>
                    )}
                  </td>
                </tr>
              )}

              {filtered.map((client) => (
                <tr
                  key={client.id}
                  style={{ borderBottom: `1px solid ${C.border}`, cursor: "pointer" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = C.surfaceHover)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = "transparent")}
                  onClick={() => setLocation(`/clients/${client.id}`)}
                >
                  <td style={{ padding: "16px 20px", fontSize: "14px", fontWeight: 600 }}>{client.name}</td>
                  <td style={{ padding: "16px 20px", fontSize: "13px", color: C.textDim }}>{client.email}</td>
                  <td style={{ padding: "16px 20px", fontSize: "14px", textAlign: "center" }}>
                    <span
                      style={{
                        backgroundColor: C.accentGlow,
                        color: C.accent,
                        padding: "3px 10px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      {client.companiesCount ?? 0}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "center" }}>
                    <AlertBadge count={client.alertsCount ?? 0} />
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <StatusBadge status={client.status ?? "Active"} />
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", gap: "8px" }} onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/clients/${client.id}`}
                        style={{
                          color: C.accent,
                          fontSize: "12px",
                          fontWeight: 600,
                          textDecoration: "none",
                          padding: "5px 12px",
                          border: `1px solid ${C.border}`,
                          borderRadius: "6px",
                        }}
                      >
                        View
                      </Link>
                      <button
                        style={{
                          backgroundColor: "transparent",
                          border: `1px solid ${C.border}`,
                          color: C.textDim,
                          fontSize: "12px",
                          fontWeight: 600,
                          padding: "5px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
