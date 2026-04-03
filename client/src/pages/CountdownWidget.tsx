import React, { useState, useEffect } from "react";
const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",red:"#ef4444",amber:"#f59e0b",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };
export default function CountdownWidget() {
  const [days, setDays] = useState(14);
  useEffect(() => { const id = setInterval(() => setDays(d => d), 1000); return () => clearInterval(id); }, []);
  const color = days <= 7 ? C.red : days <= 14 ? C.amber : C.accent;
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"40px 32px" }}>
      <div style={{ maxWidth:600, margin:"0 auto" }}>
        <h1 style={{ color:C.text, fontSize:28, fontWeight:700, marginBottom:4 }}>Deadline Countdown Widget</h1>
        <p style={{ color:C.textDim, fontSize:14, marginBottom:32 }}>Embeddable deadline countdown for your dashboard or client portal.</p>
        <div style={{ background:C.surface, border:`2px solid ${color}`, borderRadius:16, padding:"40px 32px", textAlign:"center", marginBottom:24 }}>
          <p style={{ color:C.textDim, fontSize:14, marginBottom:8 }}>Next Critical Deadline</p>
          <div style={{ color:color, fontSize:72, fontWeight:800, lineHeight:1 }}>{days}</div>
          <div style={{ color:C.textDim, fontSize:18, marginTop:4 }}>days remaining</div>
          <div style={{ color:C.textMuted, fontSize:13, marginTop:12 }}>Annual Accounts Due · ACME Holdings Ltd</div>
        </div>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <h3 style={{ color:C.text, fontSize:14, fontWeight:600, marginBottom:12 }}>Embed Code</h3>
          <code style={{ display:"block", background:"rgba(0,0,0,0.3)", borderRadius:8, padding:12, fontSize:11, color:C.textDim, overflowX:"auto" }}>{`<iframe src="https://fineguardpro.com/widget/countdown" width="300" height="200" frameborder="0" />`}</code>
        </div>
      </div>
    </div>
  );
}
