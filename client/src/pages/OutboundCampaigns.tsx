const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const campaigns = [
  { name: "Q4 Accountants Outreach", status: "active", recipients: 1240, sent: 980, opens: 412, clicks: 88, created: "2024-10-01" },
  { name: "CS Deadline Reminder", status: "complete", recipients: 520, sent: 520, opens: 234, clicks: 62, created: "2024-09-15" },
  { name: "New Feature Announcement", status: "paused", recipients: 3200, sent: 1600, opens: 890, clicks: 201, created: "2024-09-01" },
  { name: "Director Alert Upsell", status: "draft", recipients: 0, sent: 0, opens: 0, clicks: 0, created: "2024-10-10" },
  { name: "Annual Accounts Warning Series", status: "active", recipients: 880, sent: 440, opens: 210, clicks: 55, created: "2024-09-28" },
  { name: "Welcome Series — Accountants", status: "complete", recipients: 320, sent: 320, opens: 198, clicks: 87, created: "2024-08-20" },
];

const statusColors: Record<string, string> = {
  active: "#22c55e", complete: "#3b82f6", paused: "#f59e0b", draft: "#64748b",
};

export default function OutboundCampaigns() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Campaigns</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Create and manage email campaigns targeting accountants, company directors, and prospects.
        </p>

        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8 }}>
              {["All", "Active", "Draft", "Complete", "Paused"].map((f, i) => (
                <button key={f} style={{
                  background: i === 0 ? C.accent : "transparent",
                  color: i === 0 ? "#fff" : C.textDim,
                  border: `1px solid ${i === 0 ? C.accent : C.border}`,
                  borderRadius: 20, padding: "5px 14px", fontSize: 12, cursor: "pointer",
                }}>{f}</button>
              ))}
            </div>
            <button style={{
              background: C.accent, color: "#fff", border: "none", borderRadius: 8,
              padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>+ New Campaign</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceHover }}>
                {["Campaign Name", "Status", "Recipients", "Sent", "Opens", "Clicks", "Created", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.name} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "13px 16px", color: C.text, fontSize: 13, fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: statusColors[c.status] + "22", color: statusColors[c.status], fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, textTransform: "capitalize" }}>{c.status}</span>
                  </td>
                  <td style={{ padding: "13px 16px", color: C.textDim, fontSize: 13 }}>{c.recipients.toLocaleString()}</td>
                  <td style={{ padding: "13px 16px", color: C.textDim, fontSize: 13 }}>{c.sent.toLocaleString()}</td>
                  <td style={{ padding: "13px 16px", color: C.green, fontSize: 13 }}>{c.opens.toLocaleString()}</td>
                  <td style={{ padding: "13px 16px", color: C.accent, fontSize: 13 }}>{c.clicks.toLocaleString()}</td>
                  <td style={{ padding: "13px 16px", color: C.textMuted, fontSize: 13 }}>{c.created}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <button style={{ background: "transparent", color: C.accent, border: `1px solid ${C.accent}44`, borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>View</button>
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
