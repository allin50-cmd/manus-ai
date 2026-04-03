import React from "react";
const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",green:"#22c55e",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };
export default function MobileCompanyDetail() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"40px 24px" }}>
      <h1 style={{ color:C.text, fontSize:22, fontWeight:700, marginBottom:4 }}>ACME Holdings Ltd</h1>
      <p style={{ color:C.textDim, fontSize:13, marginBottom:24 }}>Company No. 12345678</p>
      {[{l:"Status",v:"Active",c:C.green},{l:"Accounts Due","v":"15 May 2026",c:C.text},{l:"Conf. Statement","v":"20 Jun 2026",c:C.text},{l:"Risk Score",v:"72/100",c:"#f59e0b"}].map(r => (
        <div key={r.l} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 16px", marginBottom:8, display:"flex", justifyContent:"space-between" }}>
          <span style={{ color:C.textDim, fontSize:13 }}>{r.l}</span>
          <span style={{ color:r.c, fontSize:13, fontWeight:500 }}>{r.v}</span>
        </div>
      ))}
    </div>
  );
}
