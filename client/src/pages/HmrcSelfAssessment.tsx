const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const records = [
  { entity: "John Smith (Director)", company: "Acme Ltd", taxYear: "2023/24", filingDue: "2025-01-31", paymentDue: "2025-01-31", status: "Upcoming" },
  { entity: "Alice Jones (Director)", company: "Beta Corp", taxYear: "2023/24", filingDue: "2025-01-31", paymentDue: "2025-01-31", status: "Upcoming" },
  { entity: "Bob Lee (Director)", company: "Gamma Holdings", taxYear: "2022/23", filingDue: "2024-01-31", paymentDue: "2024-01-31", status: "Filed" },
  { entity: "Carol Brown", company: "Delta PLC", taxYear: "2022/23", filingDue: "2024-01-31", paymentDue: "2024-07-31", status: "Overdue" },
  { entity: "Dave Wilson", company: "Epsilon Ltd", taxYear: "2023/24", filingDue: "2025-01-31", paymentDue: "2025-01-31", status: "Upcoming" },
];

const statusColors: Record<string, string> = { Upcoming: "#3b82f6", Filed: "#22c55e", Overdue: "#ef4444", "Due Soon": "#f59e0b" };

export default function HmrcSelfAssessment() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>HMRC Self Assessment</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Track Self Assessment filing and payment deadlines for directors and company owners across your portfolio.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Records", value: "5", color: C.text },
            { label: "Upcoming", value: "3", color: C.accent },
            { label: "Filed", value: "1", color: C.green },
            { label: "Overdue", value: "1", color: C.red },
          ].map((s) => (
            <div key={s.label} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 20px" }}>
              <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 4px" }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: 24, fontWeight: 700, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{ background: C.accentGlow, border: `1px solid ${C.accent}44`, borderRadius: 10, padding: "12px 18px", marginBottom: 24 }}>
          <p style={{ color: C.textDim, fontSize: 13, margin: 0 }}>
            Self Assessment online filing deadline: <strong style={{ color: C.text }}>31 January</strong> each year. Paper filing deadline: 31 October. Payment deadline: 31 January.
          </p>
        </div>

        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceHover }}>
                {["Individual / Entity", "Company", "Tax Year", "Filing Due", "Payment Due", "Status"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "13px 16px", color: C.text, fontSize: 13 }}>{r.entity}</td>
                  <td style={{ padding: "13px 16px", color: C.textDim, fontSize: 13 }}>{r.company}</td>
                  <td style={{ padding: "13px 16px", color: C.textMuted, fontSize: 13 }}>{r.taxYear}</td>
                  <td style={{ padding: "13px 16px", color: C.textDim, fontSize: 13 }}>{r.filingDue}</td>
                  <td style={{ padding: "13px 16px", color: C.textDim, fontSize: 13 }}>{r.paymentDue}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: statusColors[r.status] + "22", color: statusColors[r.status], fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{r.status}</span>
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
