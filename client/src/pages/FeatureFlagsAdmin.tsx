const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const flags = [
  { name: "outbound_campaigns", desc: "Enable outbound email campaign module for all tenants", enabled: true, rollout: 100 },
  { name: "ai_risk_scan", desc: "AI-powered risk scoring on company data", enabled: true, rollout: 80 },
  { name: "mtd_digital_bridge", desc: "Making Tax Digital bridging tool", enabled: true, rollout: 50 },
  { name: "document_vault", desc: "Secure document storage and retrieval vault", enabled: false, rollout: 0 },
  { name: "biometric_2fa", desc: "Biometric and hardware key 2FA options", enabled: false, rollout: 0 },
  { name: "partner_dashboard", desc: "Partner/reseller portal and commission tracking", enabled: true, rollout: 25 },
  { name: "mobile_app_preview", desc: "Mobile app preview mode for web users", enabled: false, rollout: 0 },
  { name: "revenue_os", desc: "Internal revenue operating system dashboard", enabled: true, rollout: 100 },
  { name: "flow_engage", desc: "Drip campaign flow builder", enabled: true, rollout: 60 },
  { name: "company_intelligence", desc: "Enhanced company intel with news and credit scores", enabled: false, rollout: 0 },
];

export default function FeatureFlagsAdmin() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ background: C.red, color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, letterSpacing: 1 }}>ADMIN</span>
          <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, margin: 0 }}>Feature Flags</h1>
        </div>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Manage feature rollouts across the platform. Enable or disable features and control percentage rollout to user segments.
        </p>

        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Flags", value: flags.length.toString(), color: C.text },
            { label: "Enabled", value: flags.filter((f) => f.enabled).length.toString(), color: C.green },
            { label: "Disabled", value: flags.filter((f) => !f.enabled).length.toString(), color: C.red },
          ].map((s) => (
            <div key={s.label} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 20px" }}>
              <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 4px" }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: 28, fontWeight: 700, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Flags table */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0 }}>All Feature Flags</h2>
            <button style={{
              background: C.accent, color: "#fff", border: "none", borderRadius: 8,
              padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>+ New Flag</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceHover }}>
                {["Flag Name", "Description", "Rollout %", "Enabled", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {flags.map((f) => (
                <tr key={f.name} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "14px 16px", color: C.accent, fontSize: 13, fontFamily: "monospace", fontWeight: 600 }}>{f.name}</td>
                  <td style={{ padding: "14px 16px", color: C.textDim, fontSize: 13 }}>{f.desc}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ background: C.border, borderRadius: 4, height: 6, width: 80, overflow: "hidden" }}>
                        <div style={{ background: f.enabled ? C.accent : C.textMuted, height: "100%", width: `${f.rollout}%` }} />
                      </div>
                      <span style={{ color: C.textDim, fontSize: 12 }}>{f.rollout}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      background: f.enabled ? C.green + "22" : C.red + "22",
                      borderRadius: 20, padding: "4px 12px",
                    }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: f.enabled ? C.green : C.red,
                      }} />
                      <span style={{ color: f.enabled ? C.green : C.red, fontSize: 12, fontWeight: 600 }}>
                        {f.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{
                        background: "transparent", color: C.textDim, border: `1px solid ${C.border}`,
                        borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer",
                      }}>Edit</button>
                      <button style={{
                        background: f.enabled ? C.red + "22" : C.green + "22",
                        color: f.enabled ? C.red : C.green,
                        border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer",
                      }}>{f.enabled ? "Disable" : "Enable"}</button>
                    </div>
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
