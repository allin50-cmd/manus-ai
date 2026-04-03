import React from "react";
const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",green:"#22c55e",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };
export default function AgentCompanyDetail() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"40px 32px" }}>
      <div style={{ maxWidth:800, margin:"0 auto" }}>
        <h1 style={{ color:C.text, fontSize:24, fontWeight:700, marginBottom:4 }}>Agent — Company Detail</h1>
        <p style={{ color:C.textDim, fontSize:14, marginBottom:32 }}>Agent-enriched company view with full compliance history.</p>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:24 }}>
          <h2 style={{ color:C.text, fontSize:18, fontWeight:600, marginBottom:16 }}>ACME Holdings Ltd</h2>
          {[{l:"Company Number",v:"12345678"},{l:"Status",v:"Active"},{l:"Compliance Score",v:"72/100"},{l:"Last Agent Run",v:"2 minutes ago"},{l:"Alerts Generated",v:"3 this month"}].map(r => (
            <div key={r.l} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
              <span style={{ color:C.textDim, fontSize:13 }}>{r.l}</span>
              <span style={{ color:C.text, fontSize:13, fontWeight:500 }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
