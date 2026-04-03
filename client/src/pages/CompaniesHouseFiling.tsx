const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const filingTypes = [
  {
    category: "Annual Requirements",
    color: C.accent,
    items: [
      { name: "Annual Accounts (AA)", deadline: "9 months after financial year end (private) / 6 months (public)", penalty: "£150 – £1,500+", freq: "Annually" },
      { name: "Confirmation Statement (CS01)", deadline: "12 months after last confirmation date", penalty: "Up to £5,000 / prosecution", freq: "Annually" },
    ],
  },
  {
    category: "Event-Driven Filings",
    color: C.amber,
    items: [
      { name: "Director Appointment (AP01)", deadline: "14 days after appointment", penalty: "Civil fine", freq: "On event" },
      { name: "Director Resignation (TM01)", deadline: "14 days after resignation", penalty: "Civil fine", freq: "On event" },
      { name: "Change of Registered Address (AD01)", deadline: "14 days after change", penalty: "Civil fine", freq: "On event" },
      { name: "Allotment of Shares (SH01)", deadline: "1 month after allotment", penalty: "Civil fine", freq: "On event" },
      { name: "Change of Company Name (NM01)", deadline: "Required before use", penalty: "Civil fine", freq: "On event" },
    ],
  },
  {
    category: "Mortgage & Charges",
    color: C.green,
    items: [
      { name: "Charge Registration (MR01)", deadline: "21 days after creation", penalty: "Charge void against liquidator", freq: "On event" },
      { name: "Charge Satisfaction (MR04)", deadline: "As required", penalty: "N/A", freq: "On event" },
    ],
  },
];

export default function CompaniesHouseFiling() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Companies House Filing Requirements</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          A comprehensive guide to all statutory filing obligations for UK limited companies, including deadlines and penalty information.
        </p>

        {/* Key stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Filing Types Tracked", value: "14", icon: "📋" },
            { label: "Max Late Penalty", value: "£1,500+", icon: "⚠️" },
            { label: "Avg Days to File", value: "14–30", icon: "📅" },
          ].map((s) => (
            <div key={s.label} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <p style={{ color: C.text, fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>{s.value}</p>
              <p style={{ color: C.textMuted, fontSize: 12, margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {filingTypes.map((group) => (
          <div key={group.category} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 4, height: 20, background: group.color, borderRadius: 2 }} />
              <h2 style={{ color: C.text, fontSize: 16, fontWeight: 700, margin: 0 }}>{group.category}</h2>
            </div>
            <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: C.surfaceHover }}>
                    {["Filing Type", "Deadline", "Late Penalty", "Frequency"].map((h) => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((item) => (
                    <tr key={item.name} style={{ borderTop: `1px solid ${C.border}` }}>
                      <td style={{ padding: "13px 16px", color: C.text, fontSize: 13, fontWeight: 500 }}>{item.name}</td>
                      <td style={{ padding: "13px 16px", color: C.textDim, fontSize: 13 }}>{item.deadline}</td>
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{ color: C.red, fontSize: 13, fontWeight: 600 }}>{item.penalty}</span>
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{
                          background: group.color + "22", color: group.color,
                          fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                        }}>{item.freq}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* FineGuard tip */}
        <div style={{ background: C.accentGlow, border: `1px solid ${C.accent}44`, borderRadius: 12, padding: 20 }}>
          <p style={{ color: C.accent, fontSize: 14, fontWeight: 600, margin: "0 0 6px" }}>FineGuard Pro monitors all of these automatically</p>
          <p style={{ color: C.textDim, fontSize: 13, margin: 0 }}>
            Add your companies to FineGuard and receive automated alerts 30, 14, and 7 days before every filing deadline.
            Never miss a Companies House obligation again.
          </p>
        </div>
      </div>
    </div>
  );
}
