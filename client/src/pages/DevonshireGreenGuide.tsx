import React from "react";
import { MarketingBreadcrumb } from "@/components/MarketingBreadcrumb";
const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };
export default function DevonshireGreenGuide() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh" }}>
      <MarketingBreadcrumb crumbs={[{ label:"Home", href:"/" }, { label:"About" }, { label:"Devonshire Green" }]} />
      <div style={{ maxWidth:800, margin:"0 auto", padding:"48px 24px 80px" }}>
        <h1 style={{ color:C.text, fontSize:32, fontWeight:800, marginBottom:8 }}>Devonshire Green, Sheffield</h1>
        <p style={{ color:C.textMuted, fontSize:14, marginBottom:40 }}>Where FineGuard Pro calls home.</p>
        {[
          { h:"About Devonshire Green", body:"Devonshire Green is a vibrant public space in the heart of Sheffield city centre, surrounded by independent businesses, tech companies, and creative studios. It forms part of Sheffield's Cultural Industries Quarter — one of the UK's most successful creative and digital enterprise zones." },
          { h:"Sheffield's Tech Ecosystem", body:"Sheffield has one of the fastest-growing tech sectors outside London. The city is home to hundreds of digital businesses, two world-class universities (University of Sheffield and Sheffield Hallam University), and a thriving startup community supported by organisations like Tech Nation and Sheffield Digital." },
          { h:"FINE GUARD LTD", body:"FINE GUARD LTD was incorporated in December 2025 with its registered office in Devonshire Green. We're proud to be part of Sheffield's growing fintech and regulatory technology community, building compliance tools that help UK businesses and accountancy firms stay compliant with Companies House obligations." },
        ].map(s => (
          <div key={s.h} style={{ marginBottom:28 }}>
            <h2 style={{ color:C.text, fontSize:20, fontWeight:700, marginBottom:10 }}>{s.h}</h2>
            <p style={{ color:C.textDim, fontSize:14, lineHeight:1.8 }}>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
