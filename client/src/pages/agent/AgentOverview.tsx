import React from "react";
const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",green:"#22c55e",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };
export default function AgentOverview() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"40px 32px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <h1 style={{ color:C.text, fontSize:28, fontWeight:700, marginBottom:4 }}>Agent Overview</h1>
        <p style={{ color:C.textDim, fontSize:14, marginBottom:32 }}>Your AI agent workspace — companies, alerts, and tasks.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:24 }}>
          {[{l:"Companies Monitored",v:"73"},{l:"Active Alerts",v:"12"},{l:"Tasks Completed Today",v:"847"},{l:"Agent Status",v:"Running"}].map(s => (
            <div key={s.l} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
              <div style={{ color:C.textMuted, fontSize:11, fontWeight:600, textTransform:"uppercase", marginBottom:8 }}>{s.l}</div>
              <div style={{ color:s.l==="Agent Status"?C.green:C.text, fontSize:22, fontWeight:700 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
