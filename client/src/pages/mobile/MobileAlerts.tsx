import React from "react";
const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",red:"#ef4444",text:"#f1f5f9",textDim:"#94a3b8" };
export default function MobileAlerts() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"40px 24px" }}>
      <h1 style={{ color:C.text, fontSize:24, fontWeight:700, marginBottom:24 }}>Alerts</h1>
      {[{ co:"ACME Holdings Ltd", msg:"Annual accounts overdue", time:"2h ago" },{ co:"North Star Ventures", msg:"Confirmation statement due in 7 days", time:"1d ago" }].map(a => (
        <div key={a.co} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:16, marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
            <span style={{ color:C.text, fontSize:14, fontWeight:500 }}>{a.co}</span>
            <span style={{ color:C.textDim, fontSize:11 }}>{a.time}</span>
          </div>
          <p style={{ color:C.textDim, fontSize:13 }}>{a.msg}</p>
        </div>
      ))}
    </div>
  );
}
