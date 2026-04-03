const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const jobs = [
  { id: "JOB-001", range: "2024-01-01 → 2024-03-31", status: "complete", records: "842,310", size: "1.2 GB", completed: "2024-04-02 03:14" },
  { id: "JOB-002", range: "2024-04-01 → 2024-06-30", status: "complete", records: "791,004", size: "1.1 GB", completed: "2024-07-01 02:55" },
  { id: "JOB-003", range: "2024-07-01 → 2024-09-30", status: "running", records: "—", size: "—", completed: "In progress..." },
  { id: "JOB-004", range: "2024-10-01 → 2024-12-31", status: "queued", records: "—", size: "—", completed: "Pending" },
];

const statusColors: Record<string, string> = {
  complete: "#22c55e",
  running: "#3b82f6",
  queued: "#64748b",
  failed: "#ef4444",
};

export default function ChBulkExtract() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ background: C.red, color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, letterSpacing: 1 }}>ADMIN</span>
          <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, margin: 0 }}>Companies House Bulk Extract</h1>
        </div>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Run and manage bulk data extractions from the Companies House dataset. Extracts are used to refresh the internal company database.
        </p>

        {/* New extraction panel */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 32 }}>
          <h2 style={{ color: C.text, fontSize: 16, fontWeight: 600, margin: "0 0 20px" }}>New Extraction Job</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 16, alignItems: "end" }}>
            <div>
              <label style={{ color: C.textMuted, fontSize: 12, display: "block", marginBottom: 6 }}>FROM DATE</label>
              <div style={{
                background: C.surfaceHover, border: `1px solid ${C.border}`, borderRadius: 8,
                padding: "10px 14px", color: C.textDim, fontSize: 14,
              }}>2024-10-01</div>
            </div>
            <div>
              <label style={{ color: C.textMuted, fontSize: 12, display: "block", marginBottom: 6 }}>TO DATE</label>
              <div style={{
                background: C.surfaceHover, border: `1px solid ${C.border}`, borderRadius: 8,
                padding: "10px 14px", color: C.textDim, fontSize: 14,
              }}>2024-12-31</div>
            </div>
            <button style={{
              background: C.accent, color: "#fff", border: "none", borderRadius: 8,
              padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
            }}>
              Run Extract
            </button>
          </div>
          <div style={{ marginTop: 16, padding: "12px 16px", background: C.accentGlow, borderRadius: 8, border: `1px solid ${C.accent}44` }}>
            <p style={{ color: C.textDim, fontSize: 13, margin: 0 }}>
              Estimated records: ~800,000 · Estimated duration: 45–90 minutes · Storage required: ~1.1 GB
            </p>
          </div>
        </div>

        {/* Current running job */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.accent}44`, padding: 20, marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0 }}>JOB-003 — Currently Running</h2>
            <span style={{ color: C.accent, fontSize: 13, fontWeight: 600 }}>● In Progress</span>
          </div>
          <div style={{ background: C.surfaceHover, borderRadius: 6, height: 8, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ background: C.accent, height: "100%", width: "62%", borderRadius: 6 }} />
          </div>
          <p style={{ color: C.textMuted, fontSize: 12, margin: 0 }}>62% complete — 521,432 records extracted · Started 2024-10-01 01:00</p>
        </div>

        {/* Jobs table */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0 }}>Recent Extraction Jobs</h2>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceHover }}>
                {["Job ID", "Date Range", "Status", "Records", "Size", "Completed", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "12px 16px", color: C.accent, fontSize: 13, fontFamily: "monospace" }}>{j.id}</td>
                  <td style={{ padding: "12px 16px", color: C.textDim, fontSize: 13 }}>{j.range}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      background: statusColors[j.status] + "22", color: statusColors[j.status],
                      fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, textTransform: "capitalize",
                    }}>{j.status}</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: C.text, fontSize: 13 }}>{j.records}</td>
                  <td style={{ padding: "12px 16px", color: C.textDim, fontSize: 13 }}>{j.size}</td>
                  <td style={{ padding: "12px 16px", color: C.textMuted, fontSize: 12 }}>{j.completed}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {j.status === "complete" && (
                      <button style={{
                        background: "transparent", color: C.accent, border: `1px solid ${C.accent}55`,
                        borderRadius: 6, padding: "4px 12px", fontSize: 12, cursor: "pointer",
                      }}>Download</button>
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
