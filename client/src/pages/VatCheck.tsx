const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const mockResult = {
  vatNumber: "GB123456789",
  businessName: "Acme Trading Ltd",
  address: "22 High Street, London, EC1A 1BB",
  registrationDate: "2019-03-15",
  status: "Valid",
};

export default function VatCheck() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>VAT Number Checker</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Validate any UK VAT number against the HMRC database. Returns the registered business name, address, and registration date.
        </p>

        {/* Search */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 28 }}>
          <label style={{ color: C.textMuted, fontSize: 12, display: "block", marginBottom: 8 }}>ENTER VAT NUMBER</label>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{
              flex: 1, background: C.surfaceHover, border: `1px solid ${C.accent}55`,
              borderRadius: 8, padding: "12px 16px", color: C.textDim, fontSize: 14, fontFamily: "monospace",
            }}>GB123456789</div>
            <button style={{
              background: C.accent, color: "#fff", border: "none", borderRadius: 8,
              padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>Check VAT</button>
          </div>
          <p style={{ color: C.textMuted, fontSize: 12, marginTop: 8 }}>Format: GB followed by 9 digits (e.g. GB123456789)</p>
        </div>

        {/* Result */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.green}44`, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <h2 style={{ color: C.text, fontSize: 17, fontWeight: 700, margin: 0 }}>VAT Lookup Result</h2>
            <span style={{ background: C.green + "22", color: C.green, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20 }}>✓ Valid</span>
          </div>
          {[
            { label: "VAT Number", value: mockResult.vatNumber },
            { label: "Registered Business Name", value: mockResult.businessName },
            { label: "Registered Address", value: mockResult.address },
            { label: "VAT Registration Date", value: mockResult.registrationDate },
          ].map((f) => (
            <div key={f.label} style={{ marginBottom: 16 }}>
              <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>{f.label}</p>
              <p style={{ color: C.text, fontSize: 15, fontWeight: 500, margin: 0 }}>{f.value}</p>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, marginTop: 4 }}>
            <p style={{ color: C.textMuted, fontSize: 12, margin: 0 }}>
              Data sourced from HMRC's VAT number check API. Updated in real time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
