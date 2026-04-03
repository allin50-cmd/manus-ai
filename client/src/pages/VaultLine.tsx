import React from "react";

const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };

const events = [
  { date:"2025-12-01", company:"ACME Holdings Ltd", event:"Annual accounts filed", type:"filing", icon:"📄" },
  { date:"2025-11-15", company:"Bright Tech Solutions Ltd", event:"Confirmation statement due — alert sent", type:"alert", icon:"🔔" },
  { date:"2025-11-10", company:"Green Energy UK Ltd", event:"Director resignation registered", type:"change", icon:"👤" },
  { date:"2025-10-28", company:"ACME Holdings Ltd", event:"PSC notification filed", type:"filing", icon:"📄" },
  { date:"2025-10-15", company:"North Star Ventures Ltd", event:"Late filing penalty — £150", type:"penalty", icon:"⚠️" },
];

export default function VaultLine() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 4 }}>VaultLine</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>Chronological compliance document timeline across all monitored companies.</p>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 2, background: C.border }} />
          {events.map((e, i) => (
            <div key={i} style={{ display: "flex", gap: 24, marginBottom: 24, paddingLeft: 48, position: "relative" }}>
              <div style={{ position: "absolute", left: 12, top: 4, width: 18, height: 18, borderRadius: "50%", background: C.surface, border: `2px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>{e.icon}</div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: C.text, fontSize: 14, fontWeight: 500 }}>{e.company}</span>
                  <span style={{ color: C.textMuted, fontSize: 12 }}>{e.date}</span>
                </div>
                <p style={{ color: C.textDim, fontSize: 13 }}>{e.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
