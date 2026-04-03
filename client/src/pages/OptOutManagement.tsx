const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const optOuts = [
  { contact: "john.doe@accountingfirm.co.uk", reason: "Not relevant", date: "2024-10-12", source: "Email footer link" },
  { contact: "+447700900123", reason: "Too many messages", date: "2024-10-10", source: "SMS reply STOP" },
  { contact: "info@smallbiz.com", reason: "No longer a client", date: "2024-10-08", source: "Email footer link" },
  { contact: "director@startup.io", reason: "Prefers no marketing", date: "2024-10-05", source: "Support request" },
  { contact: "accounts@midsize.co.uk", reason: "Unspecified", date: "2024-10-01", source: "Email footer link" },
];

export default function OptOutManagement() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Opt-Out Management</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Manage contacts who have unsubscribed or opted out of FineGuard communications. All opt-outs are honoured automatically.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Opt-Outs", value: "42", color: C.text },
            { label: "This Month", value: "5", color: C.amber },
            { label: "Email Opt-Outs", value: "38", color: C.red },
          ].map((s) => (
            <div key={s.label} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 20px" }}>
              <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 4px" }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: 24, fontWeight: 700, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0 }}>Opt-Out Records</h2>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceHover }}>
                {["Contact", "Reason", "Date", "Source", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textMuted, fontSize: 12, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {optOuts.map((o, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "13px 16px", color: C.text, fontSize: 13, fontFamily: "monospace" }}>{o.contact}</td>
                  <td style={{ padding: "13px 16px", color: C.textDim, fontSize: 13 }}>{o.reason}</td>
                  <td style={{ padding: "13px 16px", color: C.textMuted, fontSize: 13 }}>{o.date}</td>
                  <td style={{ padding: "13px 16px", color: C.textMuted, fontSize: 12 }}>{o.source}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <button style={{ background: C.green + "18", color: C.green, border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>Re-subscribe</button>
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
