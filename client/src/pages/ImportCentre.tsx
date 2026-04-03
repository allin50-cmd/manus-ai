const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const importTypes = [
  { title: "Companies CSV", desc: "Import companies by name and Companies House number", icon: "🏢", color: C.accent },
  { title: "Contacts CSV", desc: "Import director and stakeholder contact information", icon: "👥", color: C.green },
  { title: "CH Bulk Data", desc: "Load Companies House monthly bulk snapshot", icon: "📦", color: C.amber },
];

const recentImports = [
  { file: "companies_oct_2024.csv", type: "Companies CSV", rows: 840, status: "complete", date: "2024-10-12" },
  { file: "directors_q3.csv", type: "Contacts CSV", rows: 1200, status: "complete", date: "2024-10-01" },
  { file: "ch_bulk_2024_09.zip", type: "CH Bulk Data", rows: 792440, status: "complete", date: "2024-09-15" },
  { file: "ch_bulk_2024_10.zip", type: "CH Bulk Data", rows: 810000, status: "running", date: "2024-10-14" },
];

const statusColors: Record<string, string> = { complete: "#22c55e", running: "#3b82f6", failed: "#ef4444" };

export default function ImportCentre() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Data Import Centre</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Import companies, contacts, and bulk data from various sources to keep FineGuard up to date.
        </p>

        {/* Import type cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {importTypes.map((t) => (
            <div key={t.title} style={{
              background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`,
              padding: 24, cursor: "pointer", textAlign: "center",
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{t.icon}</div>
              <p style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: "0 0 6px" }}>{t.title}</p>
              <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 16px" }}>{t.desc}</p>
              <button style={{
                background: t.color + "22", color: t.color, border: `1px solid ${t.color}44`,
                borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>Start Import</button>
            </div>
          ))}
        </div>

        {/* Recent imports */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0 }}>Recent Imports</h2>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceHover }}>
                {["File", "Type", "Rows", "Status", "Date"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentImports.map((r) => (
                <tr key={r.file} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "12px 16px", color: C.text, fontSize: 13, fontFamily: "monospace" }}>{r.file}</td>
                  <td style={{ padding: "12px 16px", color: C.textDim, fontSize: 13 }}>{r.type}</td>
                  <td style={{ padding: "12px 16px", color: C.textDim, fontSize: 13 }}>{r.rows.toLocaleString()}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: statusColors[r.status] + "22", color: statusColors[r.status], fontSize: 12, fontWeight: 600, padding: "2px 9px", borderRadius: 20, textTransform: "capitalize" }}>{r.status}</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: C.textMuted, fontSize: 13 }}>{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
