const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const templates = [
  { name: "Deadline Warning — 30 Days", category: "Compliance Alert", preview: "Your client [Company] has an Annual Accounts deadline approaching in 30 days...", edited: "2024-10-10" },
  { name: "CS Reminder — 7 Days", category: "Compliance Alert", preview: "Action required: Confirmation Statement for [Company] is due in 7 days...", edited: "2024-10-05" },
  { name: "Welcome to FineGuard", category: "Onboarding", preview: "Welcome! Your FineGuard Pro account is ready. Here's how to get started...", edited: "2024-09-20" },
  { name: "Trial Expiry — 3 Days", category: "Conversion", preview: "Your FineGuard free trial ends in 3 days. Don't lose access to your compliance monitoring...", edited: "2024-09-15" },
  { name: "Director Change Alert", category: "Alert", preview: "A director change has been detected at [Company]. Review the change now...", edited: "2024-10-01" },
  { name: "Monthly Digest", category: "Newsletter", preview: "Here's your monthly compliance digest for [Month]: [X] alerts, [Y] filings, [Z] actions...", edited: "2024-09-30" },
];

export default function OutboundTemplates() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Email Templates</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Create and manage reusable email templates for your outbound campaigns.
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["All", "Compliance Alert", "Onboarding", "Conversion", "Newsletter"].map((f, i) => (
              <button key={f} style={{
                background: i === 0 ? C.accent : C.surface,
                color: i === 0 ? "#fff" : C.textDim,
                border: `1px solid ${i === 0 ? C.accent : C.border}`,
                borderRadius: 20, padding: "6px 14px", fontSize: 12, cursor: "pointer",
              }}>{f}</button>
            ))}
          </div>
          <button style={{
            background: C.accent, color: "#fff", border: "none", borderRadius: 8,
            padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>+ New Template</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {templates.map((t) => (
            <div key={t.name} style={{
              background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`,
              overflow: "hidden", display: "flex", flexDirection: "column",
            }}>
              {/* Preview area */}
              <div style={{ background: C.surfaceHover, padding: "16px 18px", height: 80, overflow: "hidden", borderBottom: `1px solid ${C.border}` }}>
                <p style={{ color: C.textMuted, fontSize: 12, margin: 0, lineHeight: 1.6 }}>{t.preview}</p>
              </div>
              <div style={{ padding: "14px 18px", flex: 1 }}>
                <p style={{ color: C.text, fontSize: 14, fontWeight: 600, margin: "0 0 6px" }}>{t.name}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ background: C.accent + "18", color: C.accent, fontSize: 11, padding: "2px 8px", borderRadius: 4 }}>{t.category}</span>
                  <span style={{ color: C.textMuted, fontSize: 11 }}>Edited {t.edited}</span>
                </div>
              </div>
              <div style={{ padding: "12px 18px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8 }}>
                <button style={{ flex: 1, background: C.accent + "22", color: C.accent, border: "none", borderRadius: 6, padding: "7px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Edit</button>
                <button style={{ flex: 1, background: "transparent", color: C.textDim, border: `1px solid ${C.border}`, borderRadius: 6, padding: "7px", fontSize: 12, cursor: "pointer" }}>Duplicate</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
