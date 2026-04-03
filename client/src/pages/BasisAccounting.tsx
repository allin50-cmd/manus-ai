const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const sections = [
  {
    title: "What are Basis Period Reforms?",
    content: "Historically, self-employed individuals and partnerships were taxed on profits of their accounting period ending in a given tax year — this was called the 'current year basis'. From the 2024/25 tax year onwards, HMRC has moved to a 'tax year basis', where profits are assessed based on profits arising in the tax year itself (6 April to 5 April), regardless of the accounting period used.",
  },
  {
    title: "The Transition Year (2023/24)",
    content: "The 2023/24 tax year was the transition year. During this period, businesses were taxed on profits from their current accounting period end up to 5 April 2024, potentially resulting in more than 12 months of profits being taxed. HMRC introduced spread relief to allow transition-year profits to be spread over five years, reducing the immediate tax impact.",
  },
  {
    title: "Who Is Affected?",
    content: "Self-employed sole traders and partnerships whose accounting year does not already end on 31 March or 5 April are most impacted. Businesses with a 31 March or 5 April year-end are largely unaffected. Those with unusual year-ends (e.g. 31 December or 30 April) needed to calculate transition profits for 2023/24.",
  },
  {
    title: "Action Steps for Accountants",
    content: "Identify all clients with non-standard year-ends. Calculate transition profits and assess whether spreading relief is beneficial. Review whether changing accounting year-end to 31 March simplifies future compliance. Ensure affected clients understand the potential for higher tax bills in 2023/24 unless spread relief is claimed.",
  },
];

export default function BasisAccounting() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, margin: 0 }}>Basis Period Accounting</h1>
          <span style={{ background: C.amber + "22", color: C.amber, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6 }}>HMRC Reform</span>
        </div>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          A guide to the basis period reforms and how the transition to the tax-year basis affects self-employed clients.
        </p>

        <div style={{ background: C.amber + "18", border: `1px solid ${C.amber}44`, borderRadius: 10, padding: "14px 18px", marginBottom: 32 }}>
          <p style={{ color: C.amber, fontSize: 13, fontWeight: 600, margin: "0 0 4px" }}>Transition year was 2023/24</p>
          <p style={{ color: C.textDim, fontSize: 13, margin: 0 }}>Spread relief must be claimed in the transition year tax return. Full tax-year basis applies from 2024/25 onwards.</p>
        </div>

        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <div style={{ width: 4, height: 20, background: C.amber, borderRadius: 2 }} />
              <h2 style={{ color: C.text, fontSize: 17, fontWeight: 700, margin: 0 }}>{s.title}</h2>
            </div>
            <p style={{ color: C.textDim, fontSize: 14, lineHeight: 1.75, margin: 0 }}>{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
