const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const columns = [
  { csv: "company_name", mapped: "Company Name" },
  { csv: "company_number", mapped: "Company Number" },
  { csv: "client_name", mapped: "Client Name" },
  { csv: "email", mapped: "(Unmapped)" },
];

const results = [
  { row: 1, company: "Acme Ltd", number: "12345678", client: "J. Smith", status: "imported" },
  { row: 2, company: "Beta Corp", number: "87654321", client: "A. Jones", status: "imported" },
  { row: 3, company: "Gamma Inc", number: "", client: "B. Lee", status: "error" },
  { row: 4, company: "Delta PLC", number: "11223344", client: "C. Brown", status: "duplicate" },
];

const statusColors: Record<string, string> = {
  imported: C.green,
  error: C.red,
  duplicate: C.amber,
};

export default function AdminBulkImport() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ background: C.red, color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, letterSpacing: 1 }}>ADMIN</span>
          <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, margin: 0 }}>Bulk Import Companies</h1>
        </div>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Upload a CSV file to import multiple companies at once. Map CSV columns to FineGuard fields, then run the import.
        </p>

        {/* Upload dropzone */}
        <div style={{
          border: `2px dashed ${C.accent}`,
          borderRadius: 12,
          background: C.accentGlow,
          padding: "48px 32px",
          textAlign: "center",
          marginBottom: 32,
          cursor: "pointer",
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
          <p style={{ color: C.text, fontSize: 16, fontWeight: 600, margin: 0 }}>Drop your CSV file here</p>
          <p style={{ color: C.textDim, fontSize: 13, margin: "6px 0 16px" }}>or click to browse — supports .csv files up to 10MB</p>
          <button style={{
            background: C.accent, color: "#fff", border: "none", borderRadius: 8,
            padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>
            Browse File
          </button>
          <p style={{ color: C.textMuted, fontSize: 12, marginTop: 12 }}>
            example_companies.csv — 4 rows detected
          </p>
        </div>

        {/* Column mapping */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 32 }}>
          <h2 style={{ color: C.text, fontSize: 16, fontWeight: 600, margin: "0 0 16px" }}>Column Mapping</h2>
          <p style={{ color: C.textDim, fontSize: 13, marginBottom: 16 }}>
            Map the columns from your CSV to the corresponding FineGuard fields.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {columns.map((col) => (
              <div key={col.csv} style={{
                display: "flex", alignItems: "center", gap: 12,
                background: C.surfaceHover, borderRadius: 8, padding: "12px 16px",
                border: `1px solid ${C.border}`,
              }}>
                <span style={{ color: C.textMuted, fontSize: 13, fontFamily: "monospace", flex: 1 }}>{col.csv}</span>
                <span style={{ color: C.accent, fontSize: 14 }}>→</span>
                <span style={{
                  color: col.mapped === "(Unmapped)" ? C.amber : C.text,
                  fontSize: 13, fontWeight: 500, flex: 1,
                }}>{col.mapped}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Import button */}
        <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
          <button style={{
            background: C.accent, color: "#fff", border: "none", borderRadius: 8,
            padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>
            Run Import
          </button>
          <button style={{
            background: "transparent", color: C.textDim, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "12px 20px", fontSize: 14, cursor: "pointer",
          }}>
            Download Template CSV
          </button>
        </div>

        {/* Results table */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0 }}>Import Results</h2>
            <span style={{ color: C.textMuted, fontSize: 13 }}>4 rows processed — 2 imported, 1 error, 1 duplicate</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceHover }}>
                {["Row", "Company Name", "Company Number", "Client Name", "Status"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.row} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "12px 16px", color: C.textMuted, fontSize: 13 }}>{r.row}</td>
                  <td style={{ padding: "12px 16px", color: C.text, fontSize: 13 }}>{r.company}</td>
                  <td style={{ padding: "12px 16px", color: C.textDim, fontSize: 13, fontFamily: "monospace" }}>{r.number || "—"}</td>
                  <td style={{ padding: "12px 16px", color: C.textDim, fontSize: 13 }}>{r.client}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      background: statusColors[r.status] + "22",
                      color: statusColors[r.status],
                      fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, textTransform: "capitalize",
                    }}>{r.status}</span>
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
