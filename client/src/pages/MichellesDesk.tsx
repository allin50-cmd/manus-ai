import React from "react";
const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",amber:"#f59e0b",green:"#22c55e",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };
const notes = [
  { color:"rgba(59,130,246,0.15)", border:"rgba(59,130,246,0.3)", text:"Chase ACME Holdings re: accounts overdue - called, left VM" },
  { color:"rgba(245,158,11,0.15)", border:"rgba(245,158,11,0.3)", text:"Onboard Bright Tech Solutions this week" },
  { color:"rgba(34,197,94,0.15)", border:"rgba(34,197,94,0.3)", text:"Q1 reports ready for review ✓" },
  { color:"rgba(59,130,246,0.15)", border:"rgba(59,130,246,0.3)", text:"Meeting with North Star Ventures - Thurs 2pm" },
];
export default function MichellesDesk() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"40px 32px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <h1 style={{ color:C.text, fontSize:28, fontWeight:700, marginBottom:4 }}>Michelle's Desk</h1>
        <p style={{ color:C.textDim, fontSize:14, marginBottom:32 }}>Personal task board and notes.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
          {notes.map((n,i) => (
            <div key={i} style={{ background:n.color, border:`1px solid ${n.border}`, borderRadius:10, padding:20, minHeight:120 }}>
              <p style={{ color:C.text, fontSize:14, lineHeight:1.6 }}>{n.text}</p>
            </div>
          ))}
          <div style={{ background:"rgba(255,255,255,0.03)", border:`1px dashed ${C.border}`, borderRadius:10, padding:20, minHeight:120, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <span style={{ color:C.textMuted, fontSize:24 }}>+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
