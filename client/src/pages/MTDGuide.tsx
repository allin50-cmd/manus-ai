const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const sections = [
  {
    title: "What is Making Tax Digital (MTD)?",
    content: "Making Tax Digital is HMRC's programme to transform the UK tax system into a fully digital one. Instead of filing a single annual return, businesses and individuals must keep digital records and submit data to HMRC quarterly using MTD-compatible software. MTD for VAT was the first phase, followed by MTD for Income Tax Self Assessment (ITSA) from April 2026.",
  },
  {
    title: "Who is Affected?",
    content: "MTD for VAT applies to all VAT-registered businesses above the £85,000 threshold (now all VAT-registered businesses). MTD for Income Tax applies from April 2026 to self-employed individuals and landlords with annual income over £50,000, expanding to those with income over £30,000 from April 2027, and further thresholds thereafter. MTD for Corporation Tax has been announced but not yet legislated.",
  },
  {
    title: "Key Deadlines",
    content: "MTD for VAT: mandatory for all VAT-registered businesses — already in force. MTD for ITSA: April 2026 for income over £50,000; April 2027 for income over £30,000. Digital bridging software allows spreadsheet users to comply without changing their existing tools.",
  },
  {
    title: "How FineGuard Helps",
    content: "FineGuard Pro tracks MTD obligations across your entire client portfolio. We alert you to upcoming MTD deadlines, monitor submission status through our HMRC integration, and provide a digital bridging tool for clients using spreadsheets. Our MTD dashboard shows exactly which clients are compliant and which need action.",
  },
];

export default function MTDGuide() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, margin: 0 }}>Making Tax Digital Guide</h1>
          <span style={{ background: C.accent + "22", color: C.accent, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6 }}>HMRC</span>
        </div>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Your comprehensive guide to Making Tax Digital — who's affected, key deadlines, and how FineGuard keeps you compliant.
        </p>

        {/* Key stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 36 }}>
          {[
            { label: "MTD VAT Active Since", value: "Apr 2019", color: C.green },
            { label: "MTD ITSA Starts", value: "Apr 2026", color: C.amber },
            { label: "Quarterly Filings", value: "4 / year", color: C.accent },
          ].map((s) => (
            <div key={s.label} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 20px", textAlign: "center" }}>
              <p style={{ color: s.color, fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>{s.value}</p>
              <p style={{ color: C.textMuted, fontSize: 12, margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Article sections */}
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 4, height: 22, background: C.accent, borderRadius: 2 }} />
              <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: 0 }}>{s.title}</h2>
            </div>
            <p style={{ color: C.textDim, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{s.content}</p>
          </div>
        ))}

        {/* CTA */}
        <div style={{ background: C.accentGlow, border: `1px solid ${C.accent}44`, borderRadius: 12, padding: 24, marginTop: 8 }}>
          <h3 style={{ color: C.text, fontSize: 16, fontWeight: 600, margin: "0 0 8px" }}>Ready to track MTD deadlines automatically?</h3>
          <p style={{ color: C.textDim, fontSize: 13, margin: "0 0 16px" }}>Add your clients to FineGuard and receive automated reminders before every MTD submission window.</p>
          <button style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Get Started</button>
        </div>
      </div>
    </div>
  );
}
