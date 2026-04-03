import React from "react";
import { Link } from "wouter";

const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",accentGlow:"rgba(59,130,246,0.15)",green:"#22c55e",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };

export default function Accountants() {
  const features = [
    { icon: "🏢", title: "Multi-Client Management", desc: "Monitor unlimited client companies from one dashboard. Bulk import via CSV, group by team or partner." },
    { icon: "🔔", title: "Early Warning Alerts", desc: "Get notified 60, 30, 14 and 7 days before each filing deadline — via email, SMS or webhook." },
    { icon: "📊", title: "Client Compliance Reports", desc: "Generate branded PDF reports for client reviews in one click. Export to CSV for your practice management software." },
    { icon: "🔗", title: "Practice Integrations", desc: "Connect with Xero Practice Manager, QuickBooks Accountant, and IRIS. Sync client lists automatically." },
    { icon: "⚖️", title: "ACSP Ready", desc: "Built for Authorised Corporate Service Providers. Manage ACSP-specific compliance obligations alongside standard CH requirements." },
    { icon: "🤝", title: "White-Label Option", desc: "Brand FineGuard Pro with your firm's logo and colours. Present a seamless experience to your clients." },
  ];
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: C.text, fontWeight: 700, fontSize: 18 }}>FineGuard Pro</span>
        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/pricing-services" style={{ color: C.textDim, fontSize: 14, textDecoration: "none" }}>Pricing</Link>
          <Link href="/check" style={{ padding: "8px 20px", background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Try Free</Link>
        </div>
      </div>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "64px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-block", background: C.accentGlow, border: "1px solid rgba(59,130,246,0.25)", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 600, color: C.accent, marginBottom: 16 }}>FOR ACCOUNTANCY FIRMS</div>
          <h1 style={{ color: C.text, fontSize: 40, fontWeight: 800, marginBottom: 16, letterSpacing: "-0.02em" }}>The Compliance Platform Built for<br />UK Accountancy Practices</h1>
          <p style={{ color: C.textDim, fontSize: 16, maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.7 }}>Stop chasing filing deadlines across spreadsheets. FineGuard Pro monitors every client company automatically and alerts you before penalties land.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/check" style={{ padding: "14px 32px", background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff", borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: "none" }}>Start Free Trial</Link>
            <Link href="/pricing-services" style={{ padding: "14px 32px", background: "rgba(255,255,255,0.06)", color: C.textDim, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: "none" }}>View Pricing</Link>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20, marginBottom: 56 }}>
          {features.map(f => (
            <div key={f.title} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ color: C.text, fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: C.textDim, fontSize: 13, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "40px 32px", textAlign: "center" }}>
          <h2 style={{ color: C.text, fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Trusted by 500+ UK Accounting Firms</h2>
          <p style={{ color: C.textDim, fontSize: 14, marginBottom: 24 }}>From sole practitioners to Top 50 firms — FineGuard Pro scales with your practice.</p>
          <Link href="/pricing-services" style={{ padding: "12px 28px", background: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>See Plans & Pricing →</Link>
        </div>
      </div>
    </div>
  );
}
