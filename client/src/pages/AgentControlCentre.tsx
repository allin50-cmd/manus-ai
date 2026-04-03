import React from "react";
const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",green:"#22c55e",amber:"#f59e0b",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };
export default function AgentControlCentre() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"40px 32px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32 }}>
          <div><h1 style={{ color:C.text, fontSize:28, fontWeight:700, marginBottom:4 }}>Agent Control Centre</h1><p style={{ color:C.textDim, fontSize:14 }}>Manage and monitor AI compliance agents.</p></div>
          <button style={{ padding:"10px 20px", background:"linear-gradient(135deg,#3b82f6,#2563eb)", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer" }}>+ New Agent</button>
        </div>
        {[{name:"Alert Sweep Agent",status:"running",lastRun:"2m ago",tasks:847},{name:"Company Refresh Agent",status:"idle",lastRun:"2h ago",tasks:3201},{name:"Risk Score Agent",status:"idle",lastRun:"1h ago",tasks:1204}].map(a => (
          <div key={a.name} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:20, marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div><div style={{ color:C.text, fontSize:15, fontWeight:500 }}>{a.name}</div><div style={{ color:C.textMuted, fontSize:12 }}>Last run: {a.lastRun} · {a.tasks.toLocaleString()} tasks processed</div></div>
            <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:a.status==="running"?"rgba(34,197,94,0.15)":"rgba(100,116,139,0.15)", color:a.status==="running"?C.green:C.textMuted }}>{a.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
