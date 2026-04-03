import React, { useState } from "react";
const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };
export default function AgentDataInput() {
  const [val, setVal] = useState("");
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"40px 32px" }}>
      <div style={{ maxWidth:700, margin:"0 auto" }}>
        <h1 style={{ color:C.text, fontSize:28, fontWeight:700, marginBottom:4 }}>Agent Data Input</h1>
        <p style={{ color:C.textDim, fontSize:14, marginBottom:32 }}>Submit data or tasks directly to AI compliance agents.</p>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:28 }}>
          <label style={{ color:C.textDim, fontSize:13, display:"block", marginBottom:8 }}>Agent Task</label>
          <textarea value={val} onChange={e=>setVal(e.target.value)} placeholder="Describe the task for the agent..." rows={6} style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`, borderRadius:8, padding:"12px 14px", color:C.text, fontSize:14, resize:"vertical", fontFamily:"inherit" }} />
          <button style={{ marginTop:16, padding:"10px 24px", background:"linear-gradient(135deg,#3b82f6,#2563eb)", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer" }}>Submit to Agent</button>
        </div>
      </div>
    </div>
  );
}
