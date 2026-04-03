const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const contacts = [
  { company: "Acme Ltd", number: "12345678", director: "John Smith", email: "j.smith@acmeltd.co.uk", phone: "+44 7700 900 001", status: "enriched" },
  { company: "Beta Corp", number: "87654321", director: "Alice Jones", email: "a.jones@betacorp.io", phone: "—", status: "partial" },
  { company: "Gamma Holdings", number: "09988771", director: "Bob Lee", email: "—", phone: "—", status: "failed" },
  { company: "Delta PLC", number: "11223344", director: "Carol Brown", email: "carol@delta.co.uk", phone: "+44 7700 900 004", status: "enriched" },
  { company: "Epsilon Ltd", number: "55667788", director: "Dave Wilson", email: "—", phone: "+44 7700 900 005", status: "partial" },
];

const statusColors: Record<string, string> = {
  enriched: "#22c55e", partial: "#f59e0b", failed: "#ef4444", pending: "#64748b",
};

export default function EnrichContacts() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Enrich Contacts</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Upload a CSV of company numbers to automatically enrich director contact information including emails and phone numbers.
        </p>

        {/* Upload */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 32 }}>
          <h2 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: "0 0 16px" }}>Upload Company Numbers</h2>
          <div style={{
            border: `2px dashed ${C.accent}55`, borderRadius: 10,
            padding: "32px", textAlign: "center", background: C.accentGlow,
          }}>
            <p style={{ color: C.textDim, fontSize: 14, margin: "0 0 12px" }}>Drop a CSV of company numbers here, or click to browse</p>
            <button style={{
              background: C.accent, color: "#fff", border: "none", borderRadius: 8,
              padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>Browse CSV</button>
            <p style={{ color: C.textMuted, fontSize: 12, marginTop: 10 }}>companies.csv — 5 rows detected</p>
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <button style={{
              background: C.green, color: "#fff", border: "none", borderRadius: 8,
              padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>Run Enrichment</button>
          </div>
        </div>

        {/* Results */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
            <h2 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0 }}>Enrichment Results</h2>
            <span style={{ color: C.textMuted, fontSize: 13 }}>3 enriched · 2 partial · 0 failed</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceHover }}>
                {["Company", "Number", "Director", "Email", "Phone", "Status"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.number} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "12px 16px", color: C.text, fontSize: 13 }}>{c.company}</td>
                  <td style={{ padding: "12px 16px", color: C.textMuted, fontSize: 12, fontFamily: "monospace" }}>{c.number}</td>
                  <td style={{ padding: "12px 16px", color: C.textDim, fontSize: 13 }}>{c.director}</td>
                  <td style={{ padding: "12px 16px", color: c.email === "—" ? C.textMuted : C.accent, fontSize: 12 }}>{c.email}</td>
                  <td style={{ padding: "12px 16px", color: c.phone === "—" ? C.textMuted : C.textDim, fontSize: 12 }}>{c.phone}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: statusColors[c.status] + "22", color: statusColors[c.status], fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20, textTransform: "capitalize" }}>{c.status}</span>
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
