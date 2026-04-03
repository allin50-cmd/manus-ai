const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const submissions = [
  { type: "VAT Return", period: "Q3 2024 (Jul–Sep)", submitted: "2024-10-07", ref: "VT2024Q3ACM", status: "Accepted" },
  { type: "Self Assessment", period: "2022/23", submitted: "2024-01-28", ref: "SA2023JSmith", status: "Accepted" },
  { type: "CT600", period: "Year to 31 Mar 2024", submitted: "2024-12-20", ref: "CT2024ACME", status: "Pending" },
  { type: "P60 Submission", period: "2023/24", submitted: "2024-05-31", ref: "P602024ACME", status: "Accepted" },
  { type: "VAT Return", period: "Q2 2024 (Apr–Jun)", submitted: "2024-07-07", ref: "VT2024Q2ACM", status: "Accepted" },
  { type: "PAYE FPS", period: "Oct 2024", submitted: "2024-10-20", ref: "FPS202410ACM", status: "Accepted" },
];

const statusColors: Record<string, string> = { Accepted: "#22c55e", Pending: "#f59e0b", Rejected: "#ef4444" };

export default function HmrcSubmissions() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>HMRC Submissions Log</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          A log of all HMRC submissions made for companies in your portfolio, including VAT returns, SA filings, and PAYE submissions.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Submissions", value: "6", color: C.text },
            { label: "Accepted", value: "5", color: C.green },
            { label: "Pending", value: "1", color: C.amber },
          ].map((s) => (
            <div key={s.label} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 20px" }}>
              <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 4px" }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: 24, fontWeight: 700, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceHover }}>
                {["Submission Type", "Period", "Submitted", "HMRC Reference", "Status"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.map((s, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "13px 16px", color: C.text, fontSize: 13, fontWeight: 500 }}>{s.type}</td>
                  <td style={{ padding: "13px 16px", color: C.textDim, fontSize: 13 }}>{s.period}</td>
                  <td style={{ padding: "13px 16px", color: C.textMuted, fontSize: 13 }}>{s.submitted}</td>
                  <td style={{ padding: "13px 16px", color: C.accent, fontSize: 12, fontFamily: "monospace" }}>{s.ref}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: statusColors[s.status] + "22", color: statusColors[s.status], fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{s.status}</span>
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
