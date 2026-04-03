const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const companies = [
  { name: "Acme Ltd", number: "12345678", industry: "Technology", risk: "low", deadlines: 1, alerts: 0, status: "Active" },
  { name: "Beta Corp", number: "87654321", industry: "Finance", risk: "medium", deadlines: 2, alerts: 1, status: "Active" },
  { name: "Gamma Holdings", number: "09988771", industry: "Property", risk: "high", deadlines: 3, alerts: 2, status: "Active" },
  { name: "Delta PLC", number: "11223344", industry: "Retail", risk: "low", deadlines: 1, alerts: 0, status: "Active" },
  { name: "Epsilon Ltd", number: "55667788", industry: "Consulting", risk: "medium", deadlines: 2, alerts: 1, status: "Active" },
  { name: "Zeta Services", number: "99001122", industry: "Logistics", risk: "low", deadlines: 0, alerts: 0, status: "Active" },
  { name: "Eta Consulting", number: "44556677", industry: "Legal", risk: "high", deadlines: 4, alerts: 3, status: "Active" },
  { name: "Theta Tech", number: "33221100", industry: "Technology", risk: "low", deadlines: 1, alerts: 0, status: "Dormant" },
];

const riskConfig: Record<string, { color: string; label: string }> = {
  low: { color: "#22c55e", label: "Low Risk" },
  medium: { color: "#f59e0b", label: "Medium Risk" },
  high: { color: "#ef4444", label: "High Risk" },
};

export default function Portfolio() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Portfolio Overview</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Health metrics and compliance status across your entire portfolio of monitored companies.
        </p>

        {/* Top stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Companies", value: "247", color: C.text },
            { label: "Active", value: "231", color: C.green },
            { label: "High Risk", value: "12", color: C.red },
            { label: "Alerts Active", value: "18", color: C.amber },
          ].map((s) => (
            <div key={s.label} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 20px" }}>
              <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 4px" }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: 26, fontWeight: 700, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["All", "Low Risk", "Medium Risk", "High Risk", "Dormant"].map((f, i) => (
            <button key={f} style={{
              background: i === 0 ? C.accent : C.surface,
              color: i === 0 ? "#fff" : C.textDim,
              border: `1px solid ${i === 0 ? C.accent : C.border}`,
              borderRadius: 20, padding: "6px 16px", fontSize: 13, cursor: "pointer",
            }}>{f}</button>
          ))}
          <div style={{ flex: 1 }} />
          <button style={{
            background: C.surface, color: C.textDim, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "6px 16px", fontSize: 13, cursor: "pointer",
          }}>+ Add Company</button>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {companies.map((co) => {
            const rc = riskConfig[co.risk];
            return (
              <div key={co.number} style={{
                background: C.surface, borderRadius: 12,
                border: `1px solid ${co.risk === "high" ? C.red + "44" : C.border}`,
                padding: 20, cursor: "pointer",
                transition: "border-color 0.2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <p style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: "0 0 2px" }}>{co.name}</p>
                    <p style={{ color: C.textMuted, fontSize: 12, margin: 0, fontFamily: "monospace" }}>{co.number}</p>
                  </div>
                  <span style={{
                    background: rc.color + "22", color: rc.color,
                    fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
                  }}>{rc.label}</span>
                </div>
                <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 14px" }}>{co.industry} · {co.status}</p>
                <div style={{ display: "flex", gap: 16, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                  <div>
                    <p style={{ color: C.textMuted, fontSize: 11, margin: "0 0 2px" }}>Deadlines</p>
                    <p style={{ color: co.deadlines > 2 ? C.amber : C.text, fontSize: 18, fontWeight: 700, margin: 0 }}>{co.deadlines}</p>
                  </div>
                  <div>
                    <p style={{ color: C.textMuted, fontSize: 11, margin: "0 0 2px" }}>Alerts</p>
                    <p style={{ color: co.alerts > 0 ? C.red : C.text, fontSize: 18, fontWeight: 700, margin: 0 }}>{co.alerts}</p>
                  </div>
                  <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "flex-end" }}>
                    <button style={{
                      background: "transparent", color: C.accent,
                      border: `1px solid ${C.accent}44`, borderRadius: 6,
                      padding: "4px 12px", fontSize: 12, cursor: "pointer",
                    }}>View →</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
