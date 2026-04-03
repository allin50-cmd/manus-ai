import React, { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

type Tab = "overview" | "filings" | "directors" | "pscs" | "alerts";

function StatusBadge({ status }: { status: string }) {
  const active = status?.toLowerCase() === "active";
  return (
    <span
      style={{
        backgroundColor: active ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
        color: active ? C.green : C.red,
        padding: "4px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  );
}

function Skeleton({ width = "100%", height = "16px" }: { width?: string; height?: string }) {
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

function KVRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 0",
        borderBottom: `1px solid ${C.border}`,
        gap: "16px",
      }}
    >
      <span style={{ color: C.textMuted, fontSize: "13px", minWidth: "180px" }}>{label}</span>
      <span style={{ color: C.text, fontSize: "14px", textAlign: "right" }}>{value ?? "—"}</span>
    </div>
  );
}

export default function CompanyDetail() {
  const [location] = useLocation();
  const companyNumber = location.split("/").pop() ?? "";
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isMonitoring, setIsMonitoring] = useState(false);

  const companyQuery = trpc.companies.getCompany.useQuery(
    { companyNumber },
    { enabled: companyNumber.length > 0 }
  );

  const company = companyQuery.data as {
    companyName?: string;
    companyNumber?: string;
    companyStatus?: string;
    dateOfCreation?: string;
    sicCodes?: string[];
    registeredOfficeAddress?: { addressLine1?: string; locality?: string; postalCode?: string };
    accounts?: { nextDue?: string };
    confirmationStatement?: { nextDue?: string };
    filingHistory?: Array<{ date: string; type: string; description: string }>;
    officers?: Array<{ name: string; role: string; appointedOn: string }>;
    pscs?: Array<{ name: string; naturesOfControl: string[] }>;
    alerts?: Array<{ type: string; status: string; dueDate: string }>;
  } | undefined;

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "filings", label: "Filing History" },
    { key: "directors", label: "Directors" },
    { key: "pscs", label: "PSCs" },
    { key: "alerts", label: "Alerts" },
  ];

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

      {/* Company header */}
      <div
        style={{
          backgroundColor: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "14px",
          padding: "28px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        {companyQuery.isLoading ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
            <Skeleton width="320px" height="28px" />
            <Skeleton width="200px" height="16px" />
          </div>
        ) : companyQuery.isError ? (
          <p style={{ color: C.red, fontSize: "14px" }}>Failed to load company details.</p>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.3px" }}>
                {company?.companyName ?? companyNumber}
              </h1>
              {company?.companyStatus && <StatusBadge status={company.companyStatus} />}
            </div>
            <p style={{ color: C.textMuted, fontSize: "13px" }}>
              Company No. {company?.companyNumber ?? companyNumber}
              {company?.dateOfCreation && <> · Incorporated {company.dateOfCreation}</>}
            </p>
          </div>
        )}

        <button
          onClick={() => setIsMonitoring((v) => !v)}
          style={{
            backgroundColor: isMonitoring ? "rgba(239,68,68,0.1)" : C.accent,
            color: isMonitoring ? C.red : "#fff",
            border: isMonitoring ? `1px solid rgba(239,68,68,0.3)` : "none",
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {isMonitoring ? "Remove from Monitoring" : "Add to Monitoring"}
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "20px",
          backgroundColor: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "10px",
          padding: "4px",
          width: "fit-content",
          flexWrap: "wrap",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              backgroundColor: activeTab === t.key ? C.accent : "transparent",
              color: activeTab === t.key ? "#fff" : C.textDim,
              border: "none",
              padding: "8px 16px",
              borderRadius: "7px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        style={{
          backgroundColor: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "14px",
          padding: "28px",
        }}
      >
        {companyQuery.isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                <Skeleton width="160px" height="14px" />
                <Skeleton width="200px" height="14px" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px", color: C.textDim }}>Key Information</h2>
                <KVRow
                  label="SIC Codes"
                  value={company?.sicCodes?.join(", ") ?? "—"}
                />
                <KVRow
                  label="Registered Address"
                  value={
                    company?.registeredOfficeAddress
                      ? [
                          company.registeredOfficeAddress.addressLine1,
                          company.registeredOfficeAddress.locality,
                          company.registeredOfficeAddress.postalCode,
                        ]
                          .filter(Boolean)
                          .join(", ")
                      : "—"
                  }
                />
                <KVRow label="Accounts Due" value={company?.accounts?.nextDue ?? "—"} />
                <KVRow label="Confirmation Statement Due" value={company?.confirmationStatement?.nextDue ?? "—"} />
              </div>
            )}

            {activeTab === "filings" && (
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px", color: C.textDim }}>Filing History</h2>
                {!company?.filingHistory?.length ? (
                  <p style={{ color: C.textMuted, fontSize: "14px" }}>No filing history available.</p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                        {["Date", "Type", "Description"].map((h) => (
                          <th key={h} style={{ padding: "10px 0", textAlign: "left", fontSize: "11px", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {company.filingHistory.map((f, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: "12px 0", fontSize: "13px", color: C.textDim, whiteSpace: "nowrap", paddingRight: "24px" }}>{f.date}</td>
                          <td style={{ padding: "12px 0", fontSize: "12px", color: C.accent, paddingRight: "24px" }}>{f.type}</td>
                          <td style={{ padding: "12px 0", fontSize: "13px" }}>{f.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === "directors" && (
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px", color: C.textDim }}>Directors & Officers</h2>
                {!company?.officers?.length ? (
                  <p style={{ color: C.textMuted, fontSize: "14px" }}>No director information available.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {company.officers.map((o, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "14px 16px",
                          backgroundColor: C.surfaceHover,
                          borderRadius: "10px",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "14px" }}>{o.name}</div>
                          <div style={{ color: C.textMuted, fontSize: "12px" }}>{o.role}</div>
                        </div>
                        <div style={{ color: C.textDim, fontSize: "12px" }}>Appointed {o.appointedOn}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "pscs" && (
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px", color: C.textDim }}>Persons with Significant Control</h2>
                {!company?.pscs?.length ? (
                  <p style={{ color: C.textMuted, fontSize: "14px" }}>No PSC information available.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {company.pscs.map((p, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "14px 16px",
                          backgroundColor: C.surfaceHover,
                          borderRadius: "10px",
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "6px" }}>{p.name}</div>
                        {p.naturesOfControl?.map((n, j) => (
                          <span
                            key={j}
                            style={{
                              display: "inline-block",
                              backgroundColor: C.accentGlow,
                              color: C.accent,
                              fontSize: "11px",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              marginRight: "6px",
                              marginTop: "4px",
                            }}
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "alerts" && (
              <div>
                <h2 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px", color: C.textDim }}>Compliance Alerts</h2>
                {!company?.alerts?.length ? (
                  <div style={{ textAlign: "center", padding: "32px" }}>
                    <div style={{ fontSize: "28px", marginBottom: "10px" }}>🛡️</div>
                    <p style={{ color: C.textDim, fontSize: "14px" }}>No active alerts for this company.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {company.alerts.map((a, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "14px 16px",
                          backgroundColor: C.surfaceHover,
                          borderRadius: "10px",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: "14px" }}>{a.type}</div>
                          <div style={{ color: C.textMuted, fontSize: "12px" }}>Due {a.dueDate}</div>
                        </div>
                        <span
                          style={{
                            backgroundColor:
                              a.status === "overdue" ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)",
                            color: a.status === "overdue" ? C.red : C.amber,
                            padding: "3px 10px",
                            borderRadius: "999px",
                            fontSize: "11px",
                            fontWeight: 600,
                            textTransform: "capitalize",
                          }}
                        >
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
