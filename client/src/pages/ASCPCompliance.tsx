const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const requirements = [
  { req: "ACSP Registration with Companies House", status: "complete", due: "Jan 2025" },
  { req: "Anti-Money Laundering (AML) Compliance Procedures", status: "complete", due: "Ongoing" },
  { req: "Know Your Customer (KYC) Verification Processes", status: "complete", due: "Ongoing" },
  { req: "Annual ACSP Confirmation Statement", status: "upcoming", due: "2025-06-30" },
  { req: "Beneficial Ownership Register Update", status: "complete", due: "Ongoing" },
  { req: "Staff AML Training Records", status: "action-needed", due: "2024-12-31" },
  { req: "Suspicious Activity Reporting (SAR) Procedures", status: "complete", due: "Ongoing" },
];

const statusConfig: Record<string, { color: string; label: string }> = {
  complete: { color: "#22c55e", label: "Compliant" },
  upcoming: { color: "#3b82f6", label: "Upcoming" },
  "action-needed": { color: "#ef4444", label: "Action Needed" },
};

export default function ASCPCompliance() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, margin: 0 }}>ACSP Compliance Tracker</h1>
          <span style={{ background: C.amber + "22", color: C.amber, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6 }}>ACSP</span>
        </div>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Track compliance requirements for Authorised Corporate Service Providers under the Economic Crime and Corporate Transparency Act 2023.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Requirements", value: requirements.length.toString(), color: C.text },
            { label: "Compliant", value: requirements.filter((r) => r.status === "complete").length.toString(), color: C.green },
            { label: "Action Needed", value: requirements.filter((r) => r.status === "action-needed").length.toString(), color: C.red },
          ].map((s) => (
            <div key={s.label} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 20px" }}>
              <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 4px" }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: 24, fontWeight: 700, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0 }}>Compliance Checklist</h2>
          </div>
          {requirements.map((r, i) => {
            const cfg = statusConfig[r.status];
            return (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "16px 20px", borderTop: i > 0 ? `1px solid ${C.border}` : undefined,
              }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                    background: cfg.color + "22", border: `2px solid ${cfg.color}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: cfg.color, fontSize: 11,
                  }}>{r.status === "complete" ? "✓" : "!"}</div>
                  <p style={{ color: C.text, fontSize: 14, margin: 0 }}>{r.req}</p>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
                  <span style={{ color: C.textMuted, fontSize: 12 }}>{r.due}</span>
                  <span style={{ background: cfg.color + "22", color: cfg.color, fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20 }}>{cfg.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
