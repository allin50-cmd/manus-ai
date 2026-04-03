import React from "react";
const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };
const agents = [
  { name:"Alert Sweep Agent", desc:"Scans all monitored companies for new compliance events and generates alerts automatically.", icon:"🔍" },
  { name:"Company Refresh Agent", desc:"Pulls latest data from Companies House API and updates company records.", icon:"🔄" },
  { name:"Risk Score Agent", desc:"Calculates and updates compliance risk scores for all monitored companies.", icon:"⚖️" },
  { name:"Digest Agent", desc:"Compiles weekly compliance digest emails for each user.", icon:"📧" },
];
export default function Agents() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"40px 32px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <h1 style={{ color:C.text, fontSize:28, fontWeight:700, marginBottom:4 }}>Agents</h1>
        <p style={{ color:C.textDim, fontSize:14, marginBottom:32 }}>Available AI compliance agents.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16 }}>
          {agents.map(a => (
            <div key={a.name} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:24 }}>
              <div style={{ fontSize:32, marginBottom:12 }}>{a.icon}</div>
              <h3 style={{ color:C.text, fontSize:15, fontWeight:600, marginBottom:8 }}>{a.name}</h3>
              <p style={{ color:C.textDim, fontSize:13, lineHeight:1.6, marginBottom:16 }}>{a.desc}</p>
              <button style={{ padding:"8px 18px", background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.3)", color:C.accent, borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>Run Agent</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
