const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const events = [
  { time: "Today, 09:14", company: "Acme Ltd", type: "FILING_RECEIVED", detail: "Annual Accounts received by Companies House", icon: "✅", color: "#22c55e" },
  { time: "Today, 08:50", company: "Beta Corp", type: "ALERT_TRIGGERED", detail: "Confirmation Statement due in 7 days", icon: "⚠️", color: "#f59e0b" },
  { time: "Yesterday, 17:30", company: "Gamma Holdings", type: "DEADLINE_PASSED", detail: "Annual Accounts overdue — penalty accruing", icon: "🚨", color: "#ef4444" },
  { time: "Yesterday, 14:05", company: "Delta PLC", type: "DIRECTOR_CHANGE", detail: "New director appointed: Sarah Jennings", icon: "👤", color: "#3b82f6" },
  { time: "Yesterday, 11:22", company: "Epsilon Ltd", type: "FILING_RECEIVED", detail: "Confirmation Statement filed on time", icon: "✅", color: "#22c55e" },
  { time: "2 days ago", company: "Zeta Services", type: "ALERT_TRIGGERED", detail: "Annual Accounts due in 30 days", icon: "📅", color: "#94a3b8" },
  { time: "2 days ago", company: "Eta Consulting", type: "COMPANY_ADDED", detail: "Company added to monitoring", icon: "➕", color: "#3b82f6" },
  { time: "3 days ago", company: "Theta Tech", type: "FILING_RECEIVED", detail: "Charge registration MR01 received", icon: "✅", color: "#22c55e" },
  { time: "3 days ago", company: "Iota Finance", type: "ALERT_TRIGGERED", detail: "Confirmation Statement 14 days overdue", icon: "🚨", color: "#ef4444" },
  { time: "4 days ago", company: "Kappa Media", type: "DIRECTOR_CHANGE", detail: "Director resigned: Mark Thompson", icon: "👤", color: "#f59e0b" },
];

export default function ComplianceEvents() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Compliance Events</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          A chronological feed of compliance events across all monitored companies — filings received, alerts triggered, and deadlines reached.
        </p>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Events Today", value: "2", color: C.text },
            { label: "Alerts Triggered", value: "3", color: C.amber },
            { label: "Filings Received", value: "3", color: C.green },
            { label: "Overdue", value: "2", color: C.red },
          ].map((s) => (
            <div key={s.label} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 20px" }}>
              <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 4px" }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: 24, fontWeight: 700, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {["All Events", "Alerts", "Filings", "Director Changes", "Deadlines"].map((f, i) => (
            <button key={f} style={{
              background: i === 0 ? C.accent : C.surface,
              color: i === 0 ? "#fff" : C.textDim,
              border: `1px solid ${i === 0 ? C.accent : C.border}`,
              borderRadius: 20, padding: "6px 16px", fontSize: 13, cursor: "pointer",
            }}>{f}</button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 2, background: C.border }} />
          {events.map((ev, i) => (
            <div key={i} style={{ display: "flex", gap: 20, marginBottom: 20, paddingLeft: 8 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: ev.color + "22", border: `2px solid ${ev.color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, flexShrink: 0, zIndex: 1,
              }}>{ev.icon}</div>
              <div style={{
                background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`,
                padding: "14px 18px", flex: 1,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ color: C.text, fontSize: 14, fontWeight: 600 }}>{ev.company}</span>
                    <span style={{
                      background: ev.color + "22", color: ev.color,
                      fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 3, fontFamily: "monospace",
                    }}>{ev.type}</span>
                  </div>
                  <span style={{ color: C.textMuted, fontSize: 12 }}>{ev.time}</span>
                </div>
                <p style={{ color: C.textDim, fontSize: 13, margin: 0 }}>{ev.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 8 }}>
          <button style={{
            background: C.surface, color: C.textDim, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "10px 24px", fontSize: 13, cursor: "pointer",
          }}>Load More Events</button>
        </div>
      </div>
    </div>
  );
}
