import React from "react";
const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",text:"#f1f5f9",textDim:"#94a3b8" };
export default function MobileDemo() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"40px 24px", textAlign:"center" }}>
      <h1 style={{ color:C.text, fontSize:28, fontWeight:700, marginBottom:8 }}>Mobile App Demo</h1>
      <p style={{ color:C.textDim, fontSize:14, marginBottom:40 }}>See how FineGuard Pro looks on your phone.</p>
      <div style={{ display:"inline-block", border:`2px solid ${C.border}`, borderRadius:32, padding:8, background:C.surface }}>
        <div style={{ width:280, height:560, background:C.bg, borderRadius:24, overflow:"hidden", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
          <div style={{ fontSize:40 }}>🛡️</div>
          <div style={{ color:C.text, fontSize:16, fontWeight:700 }}>FineGuard Pro</div>
          <div style={{ color:C.textDim, fontSize:12 }}>Mobile Preview</div>
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:"8px 16px", margin:"8px 16px", width:"calc(100% - 32px)" }}>
            <div style={{ color:C.text, fontSize:12, fontWeight:500 }}>Next Deadline</div>
            <div style={{ color:"#ef4444", fontSize:20, fontWeight:700 }}>3 days</div>
            <div style={{ color:C.textDim, fontSize:11 }}>ACME Holdings · Annual Accounts</div>
          </div>
        </div>
      </div>
    </div>
  );
}
