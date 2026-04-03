const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const changes = [
  { company: "Acme Ltd", number: "12345678", director: "Sarah Jennings", type: "Appointment", date: "2024-10-12", action: "Review" },
  { company: "Beta Corp", number: "87654321", director: "Mark Thompson", type: "Resignation", date: "2024-10-10", action: "Acknowledge" },
  { company: "Gamma Holdings", number: "09988771", director: "Jane Doe", type: "Appointment", date: "2024-10-09", action: "Review" },
  { company: "Delta PLC", number: "11223344", director: "Robert Chen", type: "Resignation", date: "2024-10-07", action: "Acknowledged" },
  { company: "Epsilon Ltd", number: "55667788", director: "Lucy Hart", type: "Appointment", date: "2024-10-05", action: "Acknowledged" },
  { company: "Zeta Services", number: "99001122", director: "Tom Walsh", type: "Role Change", date: "2024-10-03", action: "Acknowledged" },
];

const typeColors: Record<string, string> = {
  Appointment: "#22c55e",
  Resignation: "#ef4444",
  "Role Change": "#f59e0b",
};

export default function DirectorAlert() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Director Change Alerts</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Monitor and respond to director appointments, resignations, and role changes across your portfolio companies.
        </p>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Changes This Month", value: "6", color: C.text },
            { label: "Appointments", value: "3", color: C.green },
            { label: "Resignations", value: "2", color: C.red },
            { label: "Pending Review", value: "2", color: C.amber },
          ].map((s) => (
            <div key={s.label} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 20px" }}>
              <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 4px" }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: 24, fontWeight: 700, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0 }}>Recent Director Changes</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ background: C.surface, color: C.textDim, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}>Filter</button>
              <button style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Export</button>
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceHover }}>
                {["Company", "Number", "Director", "Change Type", "Date", "Action"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {changes.map((c, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "13px 16px", color: C.text, fontSize: 13, fontWeight: 500 }}>{c.company}</td>
                  <td style={{ padding: "13px 16px", color: C.textMuted, fontSize: 12, fontFamily: "monospace" }}>{c.number}</td>
                  <td style={{ padding: "13px 16px", color: C.textDim, fontSize: 13 }}>{c.director}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{
                      background: (typeColors[c.type] || C.textMuted) + "22",
                      color: typeColors[c.type] || C.textMuted,
                      fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                    }}>{c.type}</span>
                  </td>
                  <td style={{ padding: "13px 16px", color: C.textMuted, fontSize: 13 }}>{c.date}</td>
                  <td style={{ padding: "13px 16px" }}>
                    {c.action === "Acknowledged" ? (
                      <span style={{ color: C.textMuted, fontSize: 12 }}>✓ Acknowledged</span>
                    ) : (
                      <button style={{
                        background: C.accent + "22", color: C.accent, border: `1px solid ${C.accent}44`,
                        borderRadius: 6, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600,
                      }}>{c.action}</button>
                    )}
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
