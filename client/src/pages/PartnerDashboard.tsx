import React from "react";
const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",green:"#22c55e",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };
export default function PartnerDashboard() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"40px 32px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32 }}>
          <div><h1 style={{ color:C.text, fontSize:28, fontWeight:700, marginBottom:4 }}>Partner Dashboard</h1><p style={{ color:C.textDim, fontSize:14 }}>Your referral and reseller performance.</p></div>
          <div style={{ background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.3)", borderRadius:20, padding:"4px 14px", color:C.accent, fontSize:12, fontWeight:600 }}>Silver Partner</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16, marginBottom:24 }}>
          {[{l:"Referred Customers",v:"18"},{l:"Active Subscriptions",v:"15"},{l:"Commission Earned",v:"£2,340"},{l:"This Month",v:"£390"}].map(s => (
            <div key={s.l} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
              <div style={{ color:C.textMuted, fontSize:11, fontWeight:600, textTransform:"uppercase", marginBottom:8 }}>{s.l}</div>
              <div style={{ color:C.text, fontSize:24, fontWeight:700 }}>{s.v}</div>
            </div>
          ))}
        </div>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:24 }}>
          <h2 style={{ color:C.text, fontSize:16, fontWeight:600, marginBottom:8 }}>Your Referral Link</h2>
          <code style={{ display:"block", background:"rgba(0,0,0,0.3)", borderRadius:8, padding:"10px 14px", fontSize:13, color:C.textDim }}>https://fineguardpro.com?ref=PARTNER_CODE</code>
        </div>
      </div>
    </div>
  );
}
