import React from "react";

const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",accentGlow:"rgba(59,130,246,0.15)",green:"#22c55e",amber:"#f59e0b",red:"#ef4444",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };

export default function CompanyIntelligence() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Company Intelligence</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>Enriched company data, risk indicators, and filing pattern analysis.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20, marginBottom: 24 }}>
          {[
            { label: "Risk Score", value: "72/100", color: C.amber, icon: "⚠️", desc: "Moderate risk — 2 overdue items" },
            { label: "Filing Compliance", value: "85%", color: C.green, icon: "✅", desc: "On time in 34 of 40 filings" },
            { label: "Director Changes", value: "3", color: C.accent, icon: "👤", desc: "In past 12 months" },
            { label: "Penalty History", value: "£450", color: C.red, icon: "⚠️", desc: "Penalties since incorporation" },
          ].map(s => (
            <div key={s.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: C.textMuted, fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>{s.label}</span>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
              </div>
              <div style={{ color: s.color, fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{s.value}</div>
              <div style={{ color: C.textDim, fontSize: 12 }}>{s.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
          <h2 style={{ color: C.text, fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Filing Pattern Analysis</h2>
          <p style={{ color: C.textDim, fontSize: 13, lineHeight: 1.8 }}>This company has a pattern of filing accounts within the final 30 days of the deadline window. In 3 of the last 5 years, accounts were submitted within 2 weeks of the deadline — increasing penalty risk during any disruptions.</p>
          <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 8 }}>
            <p style={{ color: C.amber, fontSize: 13, fontWeight: 500 }}>⚠️ Recommendation: Set alerts 60 days before deadline for this company given its late-filing history.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
