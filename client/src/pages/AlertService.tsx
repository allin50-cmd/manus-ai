const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const channels = [
  {
    name: "Email Alerts",
    icon: "✉️",
    enabled: true,
    desc: "Send compliance alerts via email to nominated addresses.",
    fields: [{ label: "Alert Email Address", value: "alerts@yourfirm.co.uk" }, { label: "CC Address", value: "" }],
  },
  {
    name: "SMS Alerts",
    icon: "📱",
    enabled: true,
    desc: "Send urgent alerts via SMS to a mobile number.",
    fields: [{ label: "Mobile Number", value: "+44 7700 900 001" }],
  },
  {
    name: "Webhook",
    icon: "🔗",
    enabled: false,
    desc: "POST alert payloads to a custom webhook endpoint.",
    fields: [{ label: "Webhook URL", value: "https://your-app.io/webhook/fineguard" }, { label: "Secret Key", value: "••••••••••••" }],
  },
  {
    name: "Slack Notifications",
    icon: "💬",
    enabled: true,
    desc: "Post alerts to a Slack channel via incoming webhook.",
    fields: [{ label: "Slack Webhook URL", value: "https://hooks.slack.com/services/..." }, { label: "Channel", value: "#compliance-alerts" }],
  },
];

function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <div style={{
      width: 44, height: 24, borderRadius: 12,
      background: enabled ? C.green : C.border,
      position: "relative", cursor: "pointer",
      transition: "background 0.2s",
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: "50%",
        background: "#fff",
        position: "absolute", top: 3,
        left: enabled ? 23 : 3,
        transition: "left 0.2s",
      }} />
    </div>
  );
}

export default function AlertService() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Alert Service Configuration</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Configure how and where compliance alerts are delivered. Enable multiple channels for redundancy.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {channels.map((ch) => (
            <div key={ch.name} style={{
              background: C.surface, borderRadius: 12,
              border: `1px solid ${ch.enabled ? C.accent + "44" : C.border}`,
              padding: 24,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24 }}>{ch.icon}</span>
                  <div>
                    <p style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0 }}>{ch.name}</p>
                    <p style={{ color: C.textMuted, fontSize: 12, margin: 0 }}>{ch.desc}</p>
                  </div>
                </div>
                <Toggle enabled={ch.enabled} />
              </div>

              {ch.enabled && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
                  {ch.fields.map((f) => (
                    <div key={f.label} style={{ marginBottom: 12 }}>
                      <label style={{ color: C.textMuted, fontSize: 12, display: "block", marginBottom: 6 }}>{f.label.toUpperCase()}</label>
                      <div style={{
                        background: C.surfaceHover, border: `1px solid ${C.border}`,
                        borderRadius: 8, padding: "10px 14px",
                        color: f.value ? C.textDim : C.textMuted, fontSize: 13,
                      }}>{f.value || "Not configured"}</div>
                    </div>
                  ))}
                  <button style={{
                    background: C.accent + "22", color: C.accent, border: "none",
                    borderRadius: 6, padding: "7px 16px", fontSize: 12, cursor: "pointer", fontWeight: 600,
                  }}>Save Changes</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
