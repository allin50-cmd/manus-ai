const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const deadlines = [
  { type: "Annual Accounts", due: "2024-12-31", daysLeft: 77, status: "upcoming" },
  { type: "Confirmation Statement", due: "2024-11-14", daysLeft: 31, status: "upcoming" },
  { type: "Corporation Tax Return (CT600)", due: "2024-12-31", daysLeft: 77, status: "upcoming" },
  { type: "VAT Return (Q3)", due: "2024-11-07", daysLeft: 24, status: "due-soon" },
  { type: "PAYE Monthly Payment", due: "2024-10-22", daysLeft: 8, status: "urgent" },
];

const statusConfig: Record<string, { color: string; label: string }> = {
  upcoming: { color: "#22c55e", label: "Upcoming" },
  "due-soon": { color: "#f59e0b", label: "Due Soon" },
  urgent: { color: "#ef4444", label: "Urgent" },
  overdue: { color: "#ef4444", label: "Overdue" },
};

export default function DeadlineChecker() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Deadline Checker</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Quickly look up all upcoming compliance deadlines for any UK company by company number or name.
        </p>

        {/* Search */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 32 }}>
          <label style={{ color: C.textMuted, fontSize: 12, display: "block", marginBottom: 8 }}>SEARCH COMPANY</label>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{
              flex: 1, background: C.surfaceHover, border: `1px solid ${C.accent}55`,
              borderRadius: 8, padding: "12px 16px", color: C.text, fontSize: 14,
            }}>
              Acme Ltd (12345678)
            </div>
            <button style={{
              background: C.accent, color: "#fff", border: "none", borderRadius: 8,
              padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>Check Deadlines</button>
          </div>
          <p style={{ color: C.textMuted, fontSize: 12, marginTop: 8 }}>Enter a company name or Companies House number</p>
        </div>

        {/* Result */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.accent}44`, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: "0 0 4px" }}>Acme Ltd</h2>
              <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>Company No. 12345678 · Incorporated 2018-03-14 · Active</p>
            </div>
            <span style={{ background: C.green + "22", color: C.green, fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20 }}>Active</span>
          </div>

          {/* Timeline */}
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 16, top: 0, bottom: 0, width: 2, background: C.border }} />
            {deadlines.map((d, i) => {
              const cfg = statusConfig[d.status];
              return (
                <div key={i} style={{ display: "flex", gap: 20, marginBottom: 16, paddingLeft: 4 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: cfg.color + "22", border: `2px solid ${cfg.color}`,
                    flexShrink: 0, zIndex: 1,
                  }} />
                  <div style={{
                    flex: 1, background: C.surfaceHover, borderRadius: 10,
                    border: `1px solid ${C.border}`, padding: "14px 18px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <div>
                      <p style={{ color: C.text, fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>{d.type}</p>
                      <p style={{ color: C.textMuted, fontSize: 12, margin: 0 }}>Due: {d.due}</p>
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span style={{ color: C.textDim, fontSize: 13 }}>{d.daysLeft} days</span>
                      <span style={{ background: cfg.color + "22", color: cfg.color, fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20 }}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
