import React from "react";
const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };
export default function MobileWidgetSpec() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"40px 32px" }}>
      <div style={{ maxWidth:700, margin:"0 auto" }}>
        <h1 style={{ color:C.text, fontSize:28, fontWeight:700, marginBottom:8 }}>Mobile Widget Specification</h1>
        <p style={{ color:C.textDim, fontSize:14, marginBottom:32 }}>Technical spec for the FineGuard Pro home screen widget.</p>
        {[{h:"Small Widget (2×2)",desc:"Shows next critical deadline: company name, deadline type, days remaining with colour coding (red/amber/green)."},{h:"Medium Widget (2×4)",desc:"Shows top 3 upcoming deadlines with company name, type, and date. Tap to open company detail."},{h:"Large Widget (4×4)",desc:"Dashboard summary: total monitored, active alerts count, overdue count, next 5 deadlines list."}].map(w => (
          <div key={w.h} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:14 }}>
            <h3 style={{ color:C.text, fontSize:14, fontWeight:600, marginBottom:6 }}>{w.h}</h3>
            <p style={{ color:C.textDim, fontSize:13, lineHeight:1.6 }}>{w.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
