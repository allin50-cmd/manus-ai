import React from "react";
const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",red:"#ef4444",amber:"#f59e0b",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };
export default function AgentAlerts() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"40px 32px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <h1 style={{ color:C.text, fontSize:28, fontWeight:700, marginBottom:32 }}>Agent — Alerts</h1>
        {[{ co:"ACME Holdings Ltd", type:"Annual Accounts Overdue", sev:"high" },{ co:"North Star Ventures", type:"Confirmation Statement Due", sev:"medium" },{ co:"Metro Build Group", type:"Accounts Due in 14 Days", sev:"low" }].map(a => (
          <div key={a.co} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 20px", marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div><div style={{ color:C.text, fontSize:14, fontWeight:500 }}>{a.co}</div><div style={{ color:C.textDim, fontSize:12 }}>{a.type}</div></div>
            <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:a.sev==="high"?"rgba(239,68,68,0.15)":a.sev==="medium"?"rgba(245,158,11,0.15)":"rgba(100,116,139,0.15)", color:a.sev==="high"?C.red:a.sev==="medium"?C.amber:C.textMuted }}>{a.sev}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
