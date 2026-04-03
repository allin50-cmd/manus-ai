const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const lists = [
  { name: "All Accountants UK", contacts: 4820, source: "CH Bulk Extract", updated: "2024-10-12" },
  { name: "Director Contacts — Tech", contacts: 1240, source: "Manual Import", updated: "2024-10-08" },
  { name: "Trial Users", contacts: 320, source: "App DB", updated: "2024-10-14" },
  { name: "Lapsed Subscribers", contacts: 880, source: "CRM", updated: "2024-09-30" },
  { name: "Sheffield Business District", contacts: 210, source: "Manual Import", updated: "2024-09-22" },
  { name: "ACSP Registered Firms", contacts: 560, source: "CH Bulk Extract", updated: "2024-10-01" },
];

export default function OutboundLists() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Contact Lists</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Manage your contact lists for outbound campaigns. Import new lists or build segments from existing data.
        </p>

        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0 }}>All Lists</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ background: "transparent", color: C.textDim, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>Import List</button>
              <button style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ New Segment</button>
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceHover }}>
                {["List Name", "Contacts", "Source", "Last Updated", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lists.map((l) => (
                <tr key={l.name} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "13px 16px", color: C.text, fontSize: 13, fontWeight: 500 }}>{l.name}</td>
                  <td style={{ padding: "13px 16px", color: C.accent, fontSize: 14, fontWeight: 700 }}>{l.contacts.toLocaleString()}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: C.accent + "18", color: C.accent, fontSize: 11, padding: "2px 8px", borderRadius: 4 }}>{l.source}</span>
                  </td>
                  <td style={{ padding: "13px 16px", color: C.textMuted, fontSize: 13 }}>{l.updated}</td>
                  <td style={{ padding: "13px 16px", display: "flex", gap: 8 }}>
                    <button style={{ background: "transparent", color: C.accent, border: `1px solid ${C.accent}44`, borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>View</button>
                    <button style={{ background: "transparent", color: C.textMuted, border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>Export</button>
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
