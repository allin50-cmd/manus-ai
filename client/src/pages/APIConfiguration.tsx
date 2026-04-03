const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const curlExample = `curl -X GET \\
  "https://api.fineguard.io/v1/companies/12345678/deadlines" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`;

const responseExample = `{
  "company_number": "12345678",
  "deadlines": [
    {
      "type": "annual_accounts",
      "due_date": "2024-12-31",
      "days_remaining": 77,
      "status": "upcoming"
    },
    {
      "type": "confirmation_statement",
      "due_date": "2024-11-14",
      "days_remaining": 31,
      "status": "upcoming"
    }
  ]
}`;

export default function APIConfiguration() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>API Configuration</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Access your API credentials and integrate FineGuard Pro data into your own applications.
        </p>

        {/* Credentials */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 24 }}>
          <h2 style={{ color: C.text, fontSize: 16, fontWeight: 600, margin: "0 0 20px" }}>API Credentials</h2>
          {[
            { label: "API Base URL", value: "https://api.fineguard.io/v1", copyable: true },
            { label: "API Key", value: "fg_live_•••••••••••••••••••••••••••X9k2", copyable: true },
            { label: "Rate Limit", value: "1,000 requests / minute", copyable: false },
            { label: "API Version", value: "v1 (stable)", copyable: false },
          ].map((f) => (
            <div key={f.label} style={{ marginBottom: 14 }}>
              <label style={{ color: C.textMuted, fontSize: 12, display: "block", marginBottom: 6 }}>{f.label.toUpperCase()}</label>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{
                  flex: 1, background: C.surfaceHover, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: "10px 14px", color: C.textDim, fontSize: 13, fontFamily: "monospace",
                }}>{f.value}</div>
                {f.copyable && (
                  <button style={{ background: C.accent + "22", color: C.accent, border: "none", borderRadius: 8, padding: "10px 14px", fontSize: 12, cursor: "pointer" }}>Copy</button>
                )}
              </div>
            </div>
          ))}
          <button style={{
            background: C.amber + "22", color: C.amber, border: `1px solid ${C.amber}44`,
            borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 8,
          }}>Rotate API Key</button>
        </div>

        {/* Webhook */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 24 }}>
          <h2 style={{ color: C.text, fontSize: 16, fontWeight: 600, margin: "0 0 16px" }}>Webhook Configuration</h2>
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: C.textMuted, fontSize: 12, display: "block", marginBottom: 6 }}>WEBHOOK ENDPOINT URL</label>
            <div style={{ background: C.surfaceHover, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: C.textDim, fontSize: 13, fontFamily: "monospace" }}>
              https://your-app.io/webhook/fineguard
            </div>
          </div>
          <p style={{ color: C.textMuted, fontSize: 13, margin: "0 0 12px" }}>Webhook events: <span style={{ color: C.accent }}>deadline.due</span>, <span style={{ color: C.accent }}>filing.received</span>, <span style={{ color: C.accent }}>director.changed</span>, <span style={{ color: C.accent }}>alert.triggered</span></p>
          <button style={{ background: C.green + "22", color: C.green, border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Test Webhook</button>
        </div>

        {/* Code example */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24 }}>
          <h2 style={{ color: C.text, fontSize: 16, fontWeight: 600, margin: "0 0 16px" }}>Code Examples</h2>
          <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 10 }}>GET company deadlines:</p>
          <pre style={{
            background: "#050a14", borderRadius: 8, padding: 16,
            color: C.green, fontSize: 12, overflow: "auto", marginBottom: 16, lineHeight: 1.6,
          }}>{curlExample}</pre>
          <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 10 }}>Example response:</p>
          <pre style={{
            background: "#050a14", borderRadius: 8, padding: 16,
            color: C.accent, fontSize: 12, overflow: "auto", lineHeight: 1.6,
          }}>{responseExample}</pre>
        </div>
      </div>
    </div>
  );
}
