const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const integrations = [
  { name: "Companies House", desc: "Live company data, filings, and director changes via the official API.", icon: "🏛️", category: "Data Source", status: "connected" },
  { name: "HMRC", desc: "MTD VAT, PAYE, and CT integration for tax deadline monitoring.", icon: "🧾", category: "Tax", status: "connected" },
  { name: "Xero", desc: "Sync financial year-end dates and accounts filing status from Xero.", icon: "💸", category: "Accounting", status: "available" },
  { name: "QuickBooks", desc: "Connect your QuickBooks account to track accounting deadlines.", icon: "📒", category: "Accounting", status: "available" },
  { name: "Slack", desc: "Send compliance alerts and deadline reminders to Slack channels.", icon: "💬", category: "Notifications", status: "connected" },
  { name: "Zapier", desc: "Connect FineGuard to 5,000+ apps via Zapier webhooks and triggers.", icon: "⚡", category: "Automation", status: "available" },
  { name: "Microsoft Teams", desc: "Post alerts and reports directly to Teams channels.", icon: "🟦", category: "Notifications", status: "available" },
  { name: "SendGrid", desc: "Outbound email delivery via SendGrid for all campaign and alert emails.", icon: "✉️", category: "Email", status: "connected" },
  { name: "Twilio", desc: "SMS alert delivery via Twilio for urgent compliance notifications.", icon: "📱", category: "SMS", status: "connected" },
  { name: "Google Workspace", desc: "Sync filing deadlines to Google Calendar for your team.", icon: "📅", category: "Calendar", status: "available" },
  { name: "Microsoft 365", desc: "Integrate with Outlook calendar and Teams for deadline notifications.", icon: "🏢", category: "Calendar", status: "available" },
  { name: "Stripe", desc: "Manage billing and subscription payments through Stripe.", icon: "💳", category: "Billing", status: "connected" },
];

const statusConfig: Record<string, { color: string; label: string }> = {
  connected: { color: "#22c55e", label: "Connected" },
  available: { color: "#64748b", label: "Connect" },
};

export default function Integrations() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 1050, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Integrations</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Connect FineGuard Pro with your existing tools to automate compliance workflows and extend its capabilities.
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {["All", "Connected", "Accounting", "Notifications", "Data Source", "Automation"].map((f, i) => (
            <button key={f} style={{
              background: i === 0 ? C.accent : C.surface,
              color: i === 0 ? "#fff" : C.textDim,
              border: `1px solid ${i === 0 ? C.accent : C.border}`,
              borderRadius: 20, padding: "6px 16px", fontSize: 12, cursor: "pointer",
            }}>{f}</button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {integrations.map((int) => {
            const cfg = statusConfig[int.status];
            return (
              <div key={int.name} style={{
                background: C.surface, borderRadius: 12,
                border: `1px solid ${int.status === "connected" ? C.green + "44" : C.border}`,
                padding: 20, display: "flex", flexDirection: "column",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ fontSize: 32 }}>{int.icon}</div>
                  <span style={{ background: C.accent + "18", color: C.accent, fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4 }}>{int.category}</span>
                </div>
                <p style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: "0 0 6px" }}>{int.name}</p>
                <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 16px", flex: 1, lineHeight: 1.5 }}>{int.desc}</p>
                <button style={{
                  background: int.status === "connected" ? C.green + "18" : C.accent,
                  color: int.status === "connected" ? C.green : "#fff",
                  border: int.status === "connected" ? `1px solid ${C.green}44` : "none",
                  borderRadius: 8, padding: "9px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>
                  {int.status === "connected" ? "✓ Connected" : "Connect"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
