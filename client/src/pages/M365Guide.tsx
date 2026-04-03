import React from "react";
const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };
export default function M365Guide() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"40px 32px" }}>
      <div style={{ maxWidth:800, margin:"0 auto" }}>
        <h1 style={{ color:C.text, fontSize:28, fontWeight:700, marginBottom:4 }}>Microsoft 365 Integration</h1>
        <p style={{ color:C.textDim, fontSize:14, marginBottom:32 }}>Connect FineGuard Pro with your Microsoft 365 workspace.</p>
        {[{icon:"📅",title:"Outlook Calendar Sync",desc:"Add Companies House filing deadlines directly to your Outlook calendar. Deadlines sync automatically when they change.",action:"Connect Outlook"},{icon:"💬",title:"Microsoft Teams Alerts",desc:"Receive compliance alerts as Teams notifications or channel messages. Configure which channels receive which alert types.",action:"Connect Teams"},{icon:"📊",title:"SharePoint Reports",desc:"Automatically save compliance reports to a SharePoint document library for easy sharing with clients.",action:"Connect SharePoint"}].map(i => (
          <div key={i.title} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:24, marginBottom:16 }}>
            <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
              <span style={{ fontSize:32 }}>{i.icon}</span>
              <div style={{ flex:1 }}>
                <h3 style={{ color:C.text, fontSize:15, fontWeight:600, marginBottom:6 }}>{i.title}</h3>
                <p style={{ color:C.textDim, fontSize:13, lineHeight:1.6, marginBottom:14 }}>{i.desc}</p>
                <button style={{ padding:"8px 18px", background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.3)", color:C.accent, borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer" }}>{i.action}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
