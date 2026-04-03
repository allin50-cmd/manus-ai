import React from "react";
const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",green:"#22c55e",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };
const companies = [{ name:"ACME Holdings Ltd", no:"12345678", score:72 },{ name:"Bright Tech Solutions", no:"87654321", score:95 },{ name:"Green Energy UK Ltd", no:"11223344", score:88 }];
export default function AgentCompanies() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"40px 32px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <h1 style={{ color:C.text, fontSize:28, fontWeight:700, marginBottom:32 }}>Agent — Companies</h1>
        {companies.map(c => (
          <div key={c.no} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 20px", marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div><div style={{ color:C.text, fontSize:14, fontWeight:500 }}>{c.name}</div><div style={{ color:C.textMuted, fontSize:12 }}>{c.no}</div></div>
            <div style={{ color:c.score>=90?C.green:c.score>=70?"#f59e0b":"#ef4444", fontWeight:700 }}>{c.score}/100</div>
          </div>
        ))}
      </div>
    </div>
  );
}
