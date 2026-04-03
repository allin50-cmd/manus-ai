import React from "react";
import { MarketingBreadcrumb } from "@/components/MarketingBreadcrumb";
import { Link } from "wouter";

const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };

export default function SeoPageConfirmationStatement() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh" }}>
      <MarketingBreadcrumb crumbs={[{ label:"Home", href:"/" }, { label:"Guides" }, { label:"Confirmation Statement" }]} />
      <div style={{ maxWidth:800, margin:"0 auto", padding:"48px 24px 80px" }}>
        <h1 style={{ color:C.text, fontSize:32, fontWeight:800, marginBottom:8, letterSpacing:"-0.02em" }}>What Is a Confirmation Statement? Complete Guide (2026)</h1>
        <p style={{ color:C.textMuted, fontSize:14, marginBottom:40 }}>Updated April 2026 · FINE GUARD LTD</p>
        {[
          { h:"What Is a Confirmation Statement?", body:"A confirmation statement (formerly the annual return) is a mandatory filing that every UK limited company and LLP must submit to Companies House at least once every 12 months. It confirms that the information held at Companies House about your company is accurate and up to date — including registered address, directors, shareholders, SIC codes, and statement of capital." },
          { h:"When Is It Due?", body:"Your confirmation statement is due within 14 days of the end of your 12-month review period. Your review period begins on the date your company was incorporated, or on the date of your last confirmation statement. Companies House will send a reminder, but it is your legal responsibility to file on time — regardless of whether you receive one." },
          { h:"What Information Does It Confirm?", body:"The confirmation statement covers: registered office address, directors and their details, company secretary (if applicable), persons with significant control (PSCs), share capital and shareholder details (for limited companies), SIC codes (business activity), and confirmation that the company has not exceeded the small company threshold where applicable." },
          { h:"How to File", body:"You can file your confirmation statement online at the Companies House WebFiling service, by post using form CS01, or through your accountant or company secretary. The online fee is £34 per year. There is no fee if you need to make changes to the information; the fee covers the annual confirmation only." },
          { h:"What Happens If You File Late?", body:"Failure to file a confirmation statement is a criminal offence. Directors can be prosecuted and fined up to £5,000 personally. Companies House may also strike the company off the register, which effectively dissolves it. Reinstating a struck-off company requires a court order and costs significantly more than filing on time." },
          { h:"How FineGuard Pro Helps", body:"FineGuard Pro monitors your confirmation statement deadline automatically and sends you alerts 60, 30, 14, and 7 days before the due date. For accountancy firms managing multiple clients, FineGuard Pro tracks every client's confirmation statement deadline in one dashboard — eliminating the risk of a missed filing." },
        ].map(s => (
          <div key={s.h} style={{ marginBottom:32 }}>
            <h2 style={{ color:C.text, fontSize:20, fontWeight:700, marginBottom:10 }}>{s.h}</h2>
            <p style={{ color:C.textDim, fontSize:14, lineHeight:1.8 }}>{s.body}</p>
          </div>
        ))}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:24, textAlign:"center" }}>
          <h3 style={{ color:C.text, fontSize:18, fontWeight:700, marginBottom:8 }}>Never Miss a Confirmation Statement Deadline</h3>
          <p style={{ color:C.textDim, fontSize:13, marginBottom:20 }}>FineGuard Pro monitors your Companies House obligations automatically.</p>
          <Link href="/check" style={{ padding:"12px 28px", background:"linear-gradient(135deg,#3b82f6,#2563eb)", color:"#fff", borderRadius:10, fontSize:14, fontWeight:600, textDecoration:"none" }}>Try Free</Link>
        </div>
      </div>
    </div>
  );
}
