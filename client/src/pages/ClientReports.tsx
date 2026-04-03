import React from "react";

const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };

export default function ClientReports() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"40px 32px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32 }}>
          <div><h1 style={{ color:C.text, fontSize:28, fontWeight:700, marginBottom:4 }}>Client Reports</h1><p style={{ color:C.textDim, fontSize:14 }}>Generate and share compliance reports with your clients.</p></div>
          <button style={{ padding:"10px 20px", background:"linear-gradient(135deg,#3b82f6,#2563eb)", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer" }}>+ New Report</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:24 }}>
          {["Portfolio Summary","Individual Company","Overdue Filings","Risk Analysis"].map(t => (
            <div key={t} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:20, cursor:"pointer" }}>
              <div style={{ fontSize:28, marginBottom:10 }}>📊</div>
              <div style={{ color:C.text, fontSize:14, fontWeight:500 }}>{t}</div>
              <div style={{ color:C.textMuted, fontSize:12, marginTop:4 }}>Generate →</div>
            </div>
          ))}
        </div>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:24 }}>
          <h2 style={{ color:C.text, fontSize:16, fontWeight:600, marginBottom:16 }}>Recent Reports</h2>
          <div style={{ color:C.textMuted, fontSize:14, textAlign:"center", padding:"32px 0" }}>No reports generated yet. Create your first report above.</div>
        </div>
      </div>
    </div>
  );
}
