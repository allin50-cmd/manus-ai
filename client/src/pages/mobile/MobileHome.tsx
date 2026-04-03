import React from "react";
const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",text:"#f1f5f9",textDim:"#94a3b8" };
export default function MobileHome() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"40px 24px", textAlign:"center" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>📱</div>
      <h1 style={{ color:C.text, fontSize:28, fontWeight:700, marginBottom:8 }}>FineGuard Pro Mobile</h1>
      <p style={{ color:C.textDim, fontSize:14, marginBottom:32, maxWidth:400, margin:"0 auto 32px" }}>Compliance monitoring on the go. Available for iOS and Android.</p>
      <div style={{ display:"inline-block", background:"rgba(0,0,0,0.4)", border:`1px solid ${C.border}`, borderRadius:12, padding:"24px 32px", marginBottom:24 }}>
        <div style={{ width:120, height:120, background:C.surface, borderRadius:8, margin:"0 auto 12px", display:"flex", alignItems:"center", justifyContent:"center", color:C.textDim, fontSize:11 }}>QR Code</div>
        <p style={{ color:C.textDim, fontSize:12 }}>Scan to download</p>
      </div>
      <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
        {["App Store","Google Play"].map(s => <button key={s} style={{ padding:"10px 24px", background:C.surface, border:`1px solid ${C.border}`, color:C.text, borderRadius:8, fontSize:13, cursor:"pointer" }}>{s}</button>)}
      </div>
    </div>
  );
}
