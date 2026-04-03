const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

function FormField({ label, value, type = "text" }: { label: string; value: string; type?: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ color: C.textMuted, fontSize: 12, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</label>
      <div style={{
        background: C.surfaceHover, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: "11px 14px", color: C.textDim, fontSize: 14,
      }}>{value}</div>
    </div>
  );
}

export default function EngagerSettings() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Engager Settings</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Configure the default sending behaviour for all outbound email and SMS communications from FineGuard.
        </p>

        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 28 }}>
          <h2 style={{ color: C.text, fontSize: 16, fontWeight: 600, margin: "0 0 24px" }}>Default Sender Settings</h2>

          <FormField label="Default Sender Name" value="FineGuard Pro" />
          <FormField label="Default From Email" value="noreply@fineguard.io" />
          <FormField label="Reply-To Email" value="support@fineguard.io" />

          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, marginTop: 4 }}>
            <h3 style={{ color: C.text, fontSize: 14, fontWeight: 600, margin: "0 0 16px" }}>Sending Schedule</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <FormField label="Send Window Start" value="08:00" />
              <FormField label="Send Window End" value="18:00" />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ color: C.textMuted, fontSize: 12, display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Active Send Days</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
                  <div key={d} style={{
                    background: i < 5 ? C.accent + "22" : C.surfaceHover,
                    color: i < 5 ? C.accent : C.textMuted,
                    border: `1px solid ${i < 5 ? C.accent + "44" : C.border}`,
                    borderRadius: 6, padding: "6px 10px", fontSize: 12, fontWeight: 600,
                    cursor: "pointer",
                  }}>{d}</div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
            <h3 style={{ color: C.text, fontSize: 14, fontWeight: 600, margin: "0 0 16px" }}>Send Limits</h3>
            <FormField label="Daily Email Send Limit" value="2,000 emails/day" />
            <FormField label="Daily SMS Send Limit" value="500 SMS/day" />
          </div>

          <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
            <button style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Save Settings</button>
            <button style={{ background: "transparent", color: C.textDim, border: `1px solid ${C.border}`, borderRadius: 8, padding: "11px 18px", fontSize: 14, cursor: "pointer" }}>Reset to Defaults</button>
          </div>
        </div>
      </div>
    </div>
  );
}
