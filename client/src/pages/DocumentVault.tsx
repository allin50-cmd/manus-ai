const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const documents = [
  { name: "Acme Ltd — Annual Accounts 2023.pdf", company: "Acme Ltd", type: "Annual Accounts", uploaded: "2024-03-15", size: "1.2 MB" },
  { name: "Beta Corp — CS01 2024.pdf", company: "Beta Corp", type: "Confirmation Statement", uploaded: "2024-07-22", size: "0.4 MB" },
  { name: "Gamma Holdings — Articles of Association.pdf", company: "Gamma Holdings", type: "Constitution", uploaded: "2023-11-08", size: "2.1 MB" },
  { name: "Delta PLC — Director Appointment Letter.docx", company: "Delta PLC", type: "Director Filing", uploaded: "2024-10-01", size: "0.1 MB" },
  { name: "Epsilon Ltd — VAT Certificate.pdf", company: "Epsilon Ltd", type: "HMRC Document", uploaded: "2024-01-19", size: "0.3 MB" },
];

const typeColors: Record<string, string> = {
  "Annual Accounts": "#3b82f6",
  "Confirmation Statement": "#22c55e",
  Constitution: "#f59e0b",
  "Director Filing": "#94a3b8",
  "HMRC Document": "#a78bfa",
};

function DocumentVault() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Document Vault</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Securely store and access compliance documents for all your monitored companies in one place.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Documents Stored", value: "142", icon: "📄" },
            { label: "Total Storage Used", value: "48 MB", icon: "💾" },
            { label: "Shared Documents", value: "12", icon: "🔗" },
          ].map((s) => (
            <div key={s.label} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "18px 20px", display: "flex", gap: 14, alignItems: "center" }}>
              <span style={{ fontSize: 28 }}>{s.icon}</span>
              <div>
                <p style={{ color: C.text, fontSize: 20, fontWeight: 700, margin: "0 0 2px" }}>{s.value}</p>
                <p style={{ color: C.textMuted, fontSize: 12, margin: 0 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0 }}>Stored Documents</h2>
            <button style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Upload Document</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceHover }}>
                {["Document Name", "Company", "Type", "Uploaded", "Size", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map((d, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>📄</span>
                      <span style={{ color: C.text, fontSize: 13 }}>{d.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "13px 16px", color: C.textDim, fontSize: 13 }}>{d.company}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: (typeColors[d.type] || C.textMuted) + "22", color: typeColors[d.type] || C.textMuted, fontSize: 11, padding: "2px 8px", borderRadius: 4 }}>{d.type}</span>
                  </td>
                  <td style={{ padding: "13px 16px", color: C.textMuted, fontSize: 13 }}>{d.uploaded}</td>
                  <td style={{ padding: "13px 16px", color: C.textMuted, fontSize: 12 }}>{d.size}</td>
                  <td style={{ padding: "13px 16px", display: "flex", gap: 6 }}>
                    <button style={{ background: C.accent + "18", color: C.accent, border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>Download</button>
                    <button style={{ background: C.red + "18", color: C.red, border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>Delete</button>
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

export const DocumentVaultPage = DocumentVault;
export default DocumentVault;
