import React from "react";
const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };
export default function BiometricVerification() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"40px 32px" }}>
      <div style={{ maxWidth:600, margin:"0 auto" }}>
        <h1 style={{ color:C.text, fontSize:28, fontWeight:700, marginBottom:4 }}>Two-Factor Authentication</h1>
        <p style={{ color:C.textDim, fontSize:14, marginBottom:32 }}>Add an extra layer of security to your account.</p>
        {[{icon:"📱",title:"Authenticator App",desc:"Use Google Authenticator, Authy, or any TOTP app.",action:"Set Up"},{icon:"💬",title:"SMS Verification",desc:"Receive a one-time code via SMS to your mobile number.",action:"Set Up"},{icon:"🔑",title:"Security Key",desc:"Use a hardware security key (FIDO2/WebAuthn).",action:"Register Key"}].map(o => (
          <div key={o.title} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", gap:16, alignItems:"center" }}>
              <span style={{ fontSize:28 }}>{o.icon}</span>
              <div><div style={{ color:C.text, fontSize:15, fontWeight:500 }}>{o.title}</div><div style={{ color:C.textDim, fontSize:12 }}>{o.desc}</div></div>
            </div>
            <button style={{ padding:"8px 18px", background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.3)", color:C.accent, borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>{o.action}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
