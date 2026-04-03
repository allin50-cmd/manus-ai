import React, { useState } from "react";
import { Link } from "wouter";

const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };

export default function Unsubscribe() {
  const [resubscribed, setResubscribed] = useState(false);
  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "48px 40px", maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
        {resubscribed ? (
          <>
            <h1 style={{ color: "#22c55e", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>You're re-subscribed</h1>
            <p style={{ color: C.textDim, fontSize: 14, marginBottom: 24 }}>You'll receive FineGuard Pro compliance alerts and updates again.</p>
          </>
        ) : (
          <>
            <h1 style={{ color: C.text, fontSize: 24, fontWeight: 700, marginBottom: 8 }}>You've been unsubscribed</h1>
            <p style={{ color: C.textDim, fontSize: 14, marginBottom: 24 }}>You've been removed from FineGuard Pro marketing emails. You'll still receive important account and billing notifications.</p>
            <button onClick={() => setResubscribed(true)} style={{ padding: "10px 24px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", color: C.accent, borderRadius: 8, fontSize: 13, cursor: "pointer", marginBottom: 16 }}>Re-subscribe to updates</button>
          </>
        )}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, marginTop: 8 }}>
          <Link href="/" style={{ color: C.textMuted, fontSize: 13, textDecoration: "none" }}>← Back to FineGuard Pro</Link>
        </div>
      </div>
    </div>
  );
}
