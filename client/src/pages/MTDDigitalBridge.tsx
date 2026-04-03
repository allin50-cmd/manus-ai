const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const submissions = [
  { company: "Acme Ltd", period: "Q3 2024", uploaded: "2024-10-06", status: "Submitted", ref: "MTD2024Q3ACM" },
  { company: "Beta Corp", period: "Q3 2024", uploaded: "2024-10-07", status: "Accepted", ref: "MTD2024Q3BET" },
  { company: "Gamma Holdings", period: "Q2 2024", uploaded: "2024-07-06", status: "Accepted", ref: "MTD2024Q2GAM" },
];

const statusColors: Record<string, string> = { Submitted: "#3b82f6", Accepted: "#22c55e", Rejected: "#ef4444", Pending: "#f59e0b" };

export default function MTDDigitalBridge() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>MTD Digital Bridge</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Upload MTD-compatible spreadsheets and submit VAT data directly to HMRC without changing your existing accounting workflow.
        </p>

        {/* Compatibility note */}
        <div style={{ background: C.green + "18", border: `1px solid ${C.green}44`, borderRadius: 10, padding: "14px 18px", marginBottom: 28, display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ color: C.green, fontSize: 20 }}>✓</span>
          <p style={{ color: C.green, fontSize: 13, fontWeight: 600, margin: 0 }}>HMRC-recognised bridging software — MTD for VAT compliant</p>
        </div>

        {/* Upload section */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 32 }}>
          <h2 style={{ color: C.text, fontSize: 16, fontWeight: 600, margin: "0 0 16px" }}>Upload VAT Spreadsheet</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end", marginBottom: 16 }}>
            <div>
              <label style={{ color: C.textMuted, fontSize: 12, display: "block", marginBottom: 6 }}>COMPANY</label>
              <div style={{ background: C.surfaceHover, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.textDim, fontSize: 14 }}>Select company...</div>
            </div>
            <div>
              <label style={{ color: C.textMuted, fontSize: 12, display: "block", marginBottom: 6 }}>VAT PERIOD</label>
              <div style={{ background: C.surfaceHover, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.textDim, fontSize: 14 }}>Q3 2024 (Jul–Sep)</div>
            </div>
          </div>
          <div style={{
            border: `2px dashed ${C.accent}55`, borderRadius: 10, padding: "28px 20px",
            textAlign: "center", background: C.accentGlow, marginBottom: 16,
          }}>
            <p style={{ color: C.textDim, fontSize: 14, margin: "0 0 10px" }}>Drop your MTD-compatible Excel/CSV here</p>
            <button style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Browse File</button>
            <p style={{ color: C.textMuted, fontSize: 12, marginTop: 8 }}>Supported formats: .xlsx, .xls, .csv — must contain Box 1–9 VAT figures</p>
          </div>
          <button style={{ background: C.green, color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Submit to HMRC</button>
        </div>

        {/* Recent submissions */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0 }}>Recent Bridge Submissions</h2>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceHover }}>
                {["Company", "VAT Period", "Uploaded", "Status", "HMRC Reference"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textMuted, fontSize: 12, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.map((s, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "12px 16px", color: C.text, fontSize: 13 }}>{s.company}</td>
                  <td style={{ padding: "12px 16px", color: C.textDim, fontSize: 13 }}>{s.period}</td>
                  <td style={{ padding: "12px 16px", color: C.textMuted, fontSize: 13 }}>{s.uploaded}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: statusColors[s.status] + "22", color: statusColors[s.status], fontSize: 12, fontWeight: 600, padding: "2px 9px", borderRadius: 20 }}>{s.status}</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: C.accent, fontSize: 12, fontFamily: "monospace" }}>{s.ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
