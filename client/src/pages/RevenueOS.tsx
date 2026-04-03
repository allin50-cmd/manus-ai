import React from "react";

const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",green:"#22c55e",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };

export default function RevenueOS() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"40px 32px" }}>
      <div style={{ maxWidth:960, margin:"0 auto" }}>
        <h1 style={{ color:C.text, fontSize:28, fontWeight:700, marginBottom:4 }}>Revenue OS</h1>
        <p style={{ color:C.textDim, fontSize:14, marginBottom:32 }}>Subscription revenue metrics and cohort analysis.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:24 }}>
          {[{l:"MRR",v:"£4,230",t:"+12%"},{l:"ARR",v:"£50,760",t:"+12%"},{l:"Churn",v:"2.1%",t:"-0.3%"},{l:"LTV",v:"£1,840",t:"+8%"}].map(m => (
            <div key={m.l} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
              <div style={{ color:C.textMuted, fontSize:11, fontWeight:600, textTransform:"uppercase", marginBottom:8 }}>{m.l}</div>
              <div style={{ color:C.text, fontSize:26, fontWeight:700 }}>{m.v}</div>
              <div style={{ color:C.green, fontSize:12, marginTop:4 }}>{m.t} MoM</div>
            </div>
          ))}
        </div>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:24 }}>
          <h2 style={{ color:C.text, fontSize:16, fontWeight:600, marginBottom:12 }}>Plan Distribution</h2>
          {[{plan:"Starter",pct:58,n:42},{plan:"Professional",pct:34,n:25},{plan:"Enterprise",pct:8,n:6}].map(p => (
            <div key={p.plan} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ color:C.textDim, fontSize:13 }}>{p.plan}</span>
                <span style={{ color:C.text, fontSize:13 }}>{p.n} customers ({p.pct}%)</span>
              </div>
              <div style={{ height:6, background:C.border, borderRadius:3 }}>
                <div style={{ height:"100%", width:`${p.pct}%`, background:C.accent, borderRadius:3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
