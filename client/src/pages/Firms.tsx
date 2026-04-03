const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const firms = [
  { name: "Apex Accountants Ltd", location: "London, EC2", companies: 84, contact: "rachel@apexaccountants.co.uk", tier: "Pro" },
  { name: "Crown Bookkeeping", location: "Manchester", companies: 42, contact: "info@crownbk.co.uk", tier: "Starter" },
  { name: "Foxtrot Tax Partners", location: "Birmingham", companies: 121, contact: "accounts@foxtrax.co.uk", tier: "Pro" },
  { name: "Green & Associates", location: "Leeds", companies: 37, contact: "admin@greenassoc.co.uk", tier: "Starter" },
  { name: "Harbour CPA Group", location: "Edinburgh", companies: 63, contact: "info@harbourcpa.co.uk", tier: "Pro" },
  { name: "Indigo Advisory", location: "Sheffield", companies: 28, contact: "hello@indigoadvisory.io", tier: "Trial" },
];

const tierColors: Record<string, string> = { Pro: "#3b82f6", Starter: "#22c55e", Trial: "#f59e0b" };

export default function Firms() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Accountancy Firms</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Directory of accountancy firms using FineGuard Pro to manage their client portfolios.
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, flex: 1, maxWidth: 480 }}>
            {[
              { label: "Total Firms", value: firms.length.toString(), color: C.text },
              { label: "Pro Tier", value: "3", color: C.accent },
              { label: "Companies Managed", value: "375", color: C.green },
            ].map((s) => (
              <div key={s.label} style={{ background: C.surface, borderRadius: 8, border: `1px solid ${C.border}`, padding: "12px 16px" }}>
                <p style={{ color: C.textMuted, fontSize: 11, margin: "0 0 2px" }}>{s.label}</p>
                <p style={{ color: s.color, fontSize: 20, fontWeight: 700, margin: 0 }}>{s.value}</p>
              </div>
            ))}
          </div>
          <button style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Add Firm</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {firms.map((f) => (
            <div key={f.name} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: C.accent + "22",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: C.accent, fontSize: 18, fontWeight: 700,
                }}>{f.name[0]}</div>
                <span style={{ background: tierColors[f.tier] + "22", color: tierColors[f.tier], fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20 }}>{f.tier}</span>
              </div>
              <p style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>{f.name}</p>
              <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 12px" }}>📍 {f.location}</p>
              <div style={{ display: "flex", gap: 16, marginBottom: 12, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                <div>
                  <p style={{ color: C.textMuted, fontSize: 11, margin: "0 0 2px" }}>Companies</p>
                  <p style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: 0 }}>{f.companies}</p>
                </div>
              </div>
              <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 14px", wordBreak: "break-all" }}>{f.contact}</p>
              <button style={{ width: "100%", background: C.accent + "18", color: C.accent, border: "none", borderRadius: 8, padding: "8px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>View Firm →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
