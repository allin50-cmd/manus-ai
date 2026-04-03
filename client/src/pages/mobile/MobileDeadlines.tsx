import React from "react";
const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",amber:"#f59e0b",red:"#ef4444",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };
export default function MobileDeadlines() {
  const items = [{ co:"ACME Holdings",due:"3 days",c:C.red },{ co:"Bright Tech",due:"14 days",c:C.amber },{ co:"Green Energy UK",due:"28 days",c:"#22c55e" }];
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"40px 24px" }}>
      <h1 style={{ color:C.text, fontSize:24, fontWeight:700, marginBottom:24 }}>Upcoming Deadlines</h1>
      {items.map(i => (
        <div key={i.co} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:16, marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color:C.text, fontSize:14 }}>{i.co}</span>
          <span style={{ color:i.c, fontSize:13, fontWeight:600 }}>{i.due}</span>
        </div>
      ))}
    </div>
  );
}
