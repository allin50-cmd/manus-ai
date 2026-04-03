const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const firms = [
  { name: "Apex Corporate Services Ltd", location: "London, EC2", companies: 218, contact: "acsp@apexcorp.co.uk", status: "Authorised" },
  { name: "Meridian Formation Agents", location: "Manchester", companies: 134, contact: "info@meridian-fa.co.uk", status: "Authorised" },
  { name: "Sovereign Company Secretaries", location: "Bristol", companies: 88, contact: "admin@sovereigncs.co.uk", status: "Authorised" },
  { name: "BlueStar Business Services", location: "Leeds", companies: 56, contact: "info@bluestarbs.co.uk", status: "Pending" },
  { name: "Compass Corporate Ltd", location: "Birmingham", companies: 102, contact: "hello@compasscorp.io", status: "Authorised" },
];

const statusColors: Record<string, string> = { Authorised: "#22c55e", Pending: "#f59e0b", Suspended: "#ef4444" };

export default function AcspFirms() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, margin: 0 }}>ACSP Firms</h1>
          <span style={{ background: C.amber + "22", color: C.amber, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6 }}>Authorised Corporate Service Providers</span>
        </div>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Directory of ACSP-registered firms. ACSPs are authorised to form and manage companies on behalf of clients under the Economic Crime Act 2023.
        </p>

        <div style={{ background: C.accentGlow, border: `1px solid ${C.accent}44`, borderRadius: 10, padding: "14px 18px", marginBottom: 28 }}>
          <p style={{ color: C.textDim, fontSize: 13, margin: 0 }}>
            From January 2025, all company formation agents and trust or company service providers (TCSPs) must be registered as ACSPs with Companies House.
            FineGuard monitors ACSP compliance status automatically.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ color: C.textMuted, fontSize: 14 }}>{firms.length} firms registered</span>
          <button style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Add ACSP Firm</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {firms.map((f) => (
            <div key={f.name} style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: C.amber + "22",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: C.amber, fontSize: 18, fontWeight: 700,
                }}>{f.name[0]}</div>
                <span style={{ background: statusColors[f.status] + "22", color: statusColors[f.status], fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20 }}>{f.status}</span>
              </div>
              <p style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>{f.name}</p>
              <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 12px" }}>📍 {f.location}</p>
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginBottom: 12 }}>
                <p style={{ color: C.textMuted, fontSize: 11, margin: "0 0 2px" }}>Companies under management</p>
                <p style={{ color: C.text, fontSize: 20, fontWeight: 700, margin: 0 }}>{f.companies}</p>
              </div>
              <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 14px" }}>{f.contact}</p>
              <button style={{ width: "100%", background: C.amber + "18", color: C.amber, border: "none", borderRadius: 8, padding: "8px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>View ACSP Profile →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
