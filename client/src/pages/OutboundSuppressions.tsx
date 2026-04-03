const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const suppressions = [
  { contact: "john.doe@example.com", reason: "Unsubscribed", added: "2024-10-10" },
  { contact: "+447700900123", reason: "SMS Opt-Out", added: "2024-10-08" },
  { contact: "noreply@spamcorp.com", reason: "Bounced", added: "2024-10-05" },
  { contact: "alice@firm.co.uk", reason: "Complaint", added: "2024-10-01" },
  { contact: "bob@domain.io", reason: "Manual Block", added: "2024-09-28" },
];

const reasonColors: Record<string, string> = {
  Unsubscribed: "#f59e0b",
  "SMS Opt-Out": "#f59e0b",
  Bounced: "#ef4444",
  Complaint: "#ef4444",
  "Manual Block": "#64748b",
};

export default function OutboundSuppressions() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Suppression List</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Manage contacts who have opted out, bounced, or been manually blocked from receiving outbound communications.
        </p>

        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0 }}>Suppressed Contacts ({suppressions.length})</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ background: "transparent", color: C.textDim, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}>Import</button>
              <button style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Add Suppression</button>
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceHover }}>
                {["Email / Phone", "Reason", "Date Added", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suppressions.map((s) => (
                <tr key={s.contact} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "13px 16px", color: C.text, fontSize: 13, fontFamily: "monospace" }}>{s.contact}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: (reasonColors[s.reason] || C.textMuted) + "22", color: reasonColors[s.reason] || C.textMuted, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{s.reason}</span>
                  </td>
                  <td style={{ padding: "13px 16px", color: C.textMuted, fontSize: 13 }}>{s.added}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <button style={{ background: "transparent", color: C.red, border: `1px solid ${C.red}44`, borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>Remove</button>
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
