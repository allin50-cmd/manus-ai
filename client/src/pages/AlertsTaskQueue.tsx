import React from "react";

const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",green:"#22c55e",amber:"#f59e0b",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };

const tasks = [
  { id:1, company:"ACME Holdings Ltd", type:"Accounts Overdue", status:"processing", queued:"2m ago" },
  { id:2, company:"Bright Tech Solutions", type:"Confirmation Statement", status:"queued", queued:"5m ago" },
  { id:3, company:"Green Energy UK Ltd", type:"PSC Change Alert", status:"completed", queued:"12m ago" },
  { id:4, company:"North Star Ventures", type:"Late Filing Warning", status:"completed", queued:"18m ago" },
  { id:5, company:"Metro Build Group Ltd", type:"Accounts Due Soon", status:"queued", queued:"1m ago" },
];

const statusColor = (s: string) => s==="completed"?{bg:"rgba(34,197,94,0.15)",color:"#22c55e"}:s==="processing"?{bg:"rgba(59,130,246,0.15)",color:"#3b82f6"}:{bg:"rgba(100,116,139,0.15)",color:"#94a3b8"};

export default function AlertsTaskQueue() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"40px 32px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32 }}>
          <div>
            <h1 style={{ color:C.text, fontSize:28, fontWeight:700, marginBottom:4 }}>Alert Task Queue</h1>
            <p style={{ color:C.textDim, fontSize:14 }}>Real-time alert processing pipeline.</p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {[{ label:"Queued",n:2,c:C.amber },{ label:"Processing",n:1,c:C.accent },{ label:"Completed",n:2,c:C.green }].map(b=>(
              <div key={b.label} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 14px", textAlign:"center" }}>
                <div style={{ color:b.c, fontSize:20, fontWeight:700 }}>{b.n}</div>
                <div style={{ color:C.textMuted, fontSize:11 }}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
          {tasks.map((t,i) => {
            const sc = statusColor(t.status);
            return (
              <div key={t.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 20px", borderBottom: i<tasks.length-1?`1px solid ${C.border}`:"none" }}>
                <div>
                  <div style={{ color:C.text, fontSize:14, fontWeight:500 }}>{t.company}</div>
                  <div style={{ color:C.textDim, fontSize:12 }}>{t.type} · {t.queued}</div>
                </div>
                <span style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:sc.bg, color:sc.color }}>{t.status}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
