import React from "react";
const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",green:"#22c55e",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };
export default function AgentDashboard() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"40px 32px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <h1 style={{ color:C.text, fontSize:28, fontWeight:700, marginBottom:4 }}>Agent Dashboard</h1>
        <p style={{ color:C.textDim, fontSize:14, marginBottom:32 }}>Overview of all AI agent activity.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16, marginBottom:24 }}>
          {[{l:"Active Agents",v:"3"},{l:"Tasks Today",v:"1,204"},{l:"Avg Run Time",v:"8.2s"},{l:"Success Rate",v:"99.7%"}].map(s => (
            <div key={s.l} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
              <div style={{ color:C.textMuted, fontSize:11, fontWeight:600, textTransform:"uppercase", marginBottom:8 }}>{s.l}</div>
              <div style={{ color:C.text, fontSize:26, fontWeight:700 }}>{s.v}</div>
            </div>
          ))}
        </div>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:24 }}>
          <h2 style={{ color:C.text, fontSize:16, fontWeight:600, marginBottom:16 }}>Recent Runs</h2>
          {[{name:"Alert Sweep",time:"2m ago",tasks:47,ok:true},{name:"Company Refresh",time:"2h ago",tasks:200,ok:true},{name:"Risk Score",time:"1h ago",tasks:100,ok:true}].map(r => (
            <div key={r.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
              <span style={{ color:C.textDim, fontSize:13 }}>{r.name}</span>
              <span style={{ color:C.textMuted, fontSize:12 }}>{r.tasks} tasks · {r.time}</span>
              <span style={{ color:C.green, fontSize:11 }}>✓ OK</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
