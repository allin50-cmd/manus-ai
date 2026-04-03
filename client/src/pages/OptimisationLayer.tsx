import React from "react";
const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",green:"#22c55e",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };
export default function OptimisationLayer() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"40px 32px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <h1 style={{ color:C.text, fontSize:28, fontWeight:700, marginBottom:4 }}>Optimisation Layer</h1>
        <p style={{ color:C.textDim, fontSize:14, marginBottom:32 }}>System performance metrics and query optimisation status.</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16, marginBottom:24 }}>
          {[{l:"Avg Query Time",v:"12ms"},{l:"Cache Hit Rate",v:"94%"},{l:"API Latency (p99)",v:"180ms"},{l:"DB Connections",v:"7/10"}].map(m => (
            <div key={m.l} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
              <div style={{ color:C.textMuted, fontSize:11, fontWeight:600, textTransform:"uppercase", marginBottom:8 }}>{m.l}</div>
              <div style={{ color:C.green, fontSize:24, fontWeight:700 }}>{m.v}</div>
            </div>
          ))}
        </div>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:24 }}>
          <h2 style={{ color:C.text, fontSize:16, fontWeight:600, marginBottom:16 }}>Recent Optimisations</h2>
          {["N+1 fix in getClients query — 340ms → 18ms","Alert sweep: sequential → parallel batch processing — 50s → 8s","Set-based O(1) public path matching in App.tsx","Rate limiter memory leak fixed with 5-min cleanup interval"].map((o,i) => (
            <div key={i} style={{ padding:"10px 0", borderBottom:`1px solid ${C.border}`, color:C.textDim, fontSize:13 }}>✓ {o}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
