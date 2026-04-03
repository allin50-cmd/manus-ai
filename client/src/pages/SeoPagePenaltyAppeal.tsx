import React from "react";
import { MarketingBreadcrumb } from "@/components/MarketingBreadcrumb";
import { Link } from "wouter";

const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };

export default function SeoPagePenaltyAppeal() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh" }}>
      <MarketingBreadcrumb crumbs={[{ label:"Home", href:"/" }, { label:"Guides" }, { label:"Appeal a Late Filing Penalty" }]} />
      <div style={{ maxWidth:800, margin:"0 auto", padding:"48px 24px 80px" }}>
        <h1 style={{ color:C.text, fontSize:32, fontWeight:800, marginBottom:8, letterSpacing:"-0.02em" }}>How to Appeal a Companies House Late Filing Penalty (2026)</h1>
        <p style={{ color:C.textMuted, fontSize:14, marginBottom:40 }}>Updated April 2026 · FINE GUARD LTD</p>
        {[
          { h:"Can You Appeal a Late Filing Penalty?", body:"Yes — Companies House will consider an appeal if you have a genuine and exceptional reason for filing late. However, the bar is high. Simply forgetting, being busy, or having accountant delays are not accepted grounds. Companies House receives over 400,000 penalty notices per year and successful appeals are relatively rare without strong evidence." },
          { h:"Accepted Grounds for Appeal", body:"Companies House may accept an appeal if: a director or key person suffered a serious or life-threatening illness or injury; there was a fire, flood, or other natural disaster affecting your records; there was a technical failure with Companies House WebFiling systems (which you can verify against their status page); or the company was the victim of fraud that prevented filing. You must provide documentary evidence." },
          { h:"Grounds That Are Never Accepted", body:"These grounds are consistently rejected: reliance on an accountant or third party who missed the deadline; not being aware of the deadline; being a new director; change of accounting software; postal delays for paper filings; or financial difficulties." },
          { h:"How to Submit an Appeal", body:"Appeals must be submitted in writing to: Late Filing Penalties, Companies House, Crown Way, Cardiff, CF14 3UZ. Your letter should include: company name and number, the penalty reference number, your grounds for appeal, supporting evidence (medical letters, insurance claims, CH system outage screenshots), and the director's signature. You can also email lfp@companieshouse.gov.uk." },
          { h:"What Happens Next?", body:"Companies House aims to respond within 10–14 working days. If your appeal is successful, the penalty is cancelled. If rejected, you can request a review or escalate to the Companies Act Tribunal. You must pay the penalty while the appeal is outstanding — if successful, you'll receive a refund." },
          { h:"Prevention Is Better Than Appeal", body:"The most reliable way to avoid late filing penalties is to monitor your deadlines automatically. FineGuard Pro sends alerts 60, 30, 14, and 7 days before every filing deadline — giving you and your accountant ample time to prepare. For firms managing multiple companies, our bulk monitoring dashboard tracks every deadline in one place." },
        ].map(s => (
          <div key={s.h} style={{ marginBottom:32 }}>
            <h2 style={{ color:C.text, fontSize:20, fontWeight:700, marginBottom:10 }}>{s.h}</h2>
            <p style={{ color:C.textDim, fontSize:14, lineHeight:1.8 }}>{s.body}</p>
          </div>
        ))}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:24, textAlign:"center" }}>
          <h3 style={{ color:C.text, fontSize:18, fontWeight:700, marginBottom:8 }}>Prevent Penalties Before They Happen</h3>
          <Link href="/check" style={{ padding:"12px 28px", background:"linear-gradient(135deg,#3b82f6,#2563eb)", color:"#fff", borderRadius:10, fontSize:14, fontWeight:600, textDecoration:"none" }}>Monitor Your Companies Free</Link>
        </div>
      </div>
    </div>
  );
}
