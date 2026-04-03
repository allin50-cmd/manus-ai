const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const templates = [
  { name: "Deadline Alert — 7 Days", body: "FineGuard: {{company}} has a filing due in 7 days. Log in to view details: {{link}}", chars: 82, category: "Alert" },
  { name: "Overdue Filing Warning", body: "URGENT: {{company}} has an overdue Companies House filing. Avoid penalties — act now: {{link}}", chars: 92, category: "Urgent" },
  { name: "Director Change Notice", body: "FineGuard alert: Director change detected at {{company}}. Review it here: {{link}}", chars: 80, category: "Alert" },
  { name: "Trial Expiry Reminder", body: "Your FineGuard trial ends tomorrow. Upgrade to keep monitoring {{count}} companies: {{link}}", chars: 90, category: "Conversion" },
  { name: "Monthly Summary", body: "FineGuard monthly report: {{alerts}} alerts, {{filings}} filings this month. View your dashboard: {{link}}", chars: 102, category: "Digest" },
];

const catColors: Record<string, string> = { Alert: "#f59e0b", Urgent: "#ef4444", Conversion: "#22c55e", Digest: "#3b82f6" };

export default function SmsTemplates() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>SMS Templates</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Create and manage SMS message templates for compliance alerts and outbound campaigns.
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
          <button style={{
            background: C.accent, color: "#fff", border: "none", borderRadius: 8,
            padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>+ New SMS Template</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {templates.map((t) => (
            <div key={t.name} style={{
              background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`,
              padding: "20px 24px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <p style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0 }}>{t.name}</p>
                  <span style={{ background: (catColors[t.category] || C.textMuted) + "22", color: catColors[t.category] || C.textMuted, fontSize: 11, padding: "2px 8px", borderRadius: 4 }}>{t.category}</span>
                </div>
                <span style={{
                  color: t.chars > 160 ? C.red : t.chars > 140 ? C.amber : C.green,
                  fontSize: 12, fontWeight: 600,
                }}>{t.chars} chars {t.chars > 160 ? "(2 SMS)" : "(1 SMS)"}</span>
              </div>
              <div style={{ background: C.surfaceHover, borderRadius: 8, padding: "12px 16px", marginBottom: 14 }}>
                <p style={{ color: C.textDim, fontSize: 13, margin: 0, lineHeight: 1.6, fontFamily: "monospace" }}>{t.body}</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ background: C.accent + "22", color: C.accent, border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Edit</button>
                <button style={{ background: "transparent", color: C.textDim, border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>Preview</button>
                <button style={{ background: "transparent", color: C.red, border: `1px solid ${C.red}44`, borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
