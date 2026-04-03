const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const topCampaigns = [
  { name: "Welcome Series — Accountants", sent: 320, openRate: "61.9%", clickRate: "27.2%" },
  { name: "Q4 Accountants Outreach", sent: 980, openRate: "42.0%", clickRate: "9.0%" },
  { name: "CS Deadline Reminder", sent: 520, openRate: "45.0%", clickRate: "11.9%" },
  { name: "New Feature Announcement", sent: 1600, openRate: "55.6%", clickRate: "12.6%" },
];

export default function OutboundAnalytics() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Campaign Analytics</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Aggregate performance metrics across all outbound campaigns, including delivery rates, engagement, and conversions.
        </p>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Sent", value: "8,240", color: C.text },
            { label: "Delivered Rate", value: "97.4%", color: C.green },
            { label: "Open Rate", value: "48.2%", color: C.accent },
            { label: "Click Rate", value: "13.8%", color: C.accent },
            { label: "Unsubscribes", value: "42", color: C.amber },
          ].map((s) => (
            <div key={s.label} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "18px 16px", textAlign: "center" }}>
              <p style={{ color: C.textMuted, fontSize: 11, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: 22, fontWeight: 700, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Engagement bar chart (visual) */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 32 }}>
          <h2 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: "0 0 20px" }}>Monthly Send Volume</h2>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
            {[40, 65, 55, 80, 72, 90, 85, 100, 60, 78, 92, 70].map((v, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ background: C.accent, borderRadius: "3px 3px 0 0", width: "100%", height: `${v}%` }} />
                <span style={{ color: C.textMuted, fontSize: 10 }}>{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top campaigns */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0 }}>Top Performing Campaigns</h2>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceHover }}>
                {["Campaign", "Emails Sent", "Open Rate", "Click Rate"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topCampaigns.map((c) => (
                <tr key={c.name} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "13px 16px", color: C.text, fontSize: 13 }}>{c.name}</td>
                  <td style={{ padding: "13px 16px", color: C.textDim, fontSize: 13 }}>{c.sent.toLocaleString()}</td>
                  <td style={{ padding: "13px 16px", color: C.green, fontSize: 13, fontWeight: 600 }}>{c.openRate}</td>
                  <td style={{ padding: "13px 16px", color: C.accent, fontSize: 13, fontWeight: 600 }}>{c.clickRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
