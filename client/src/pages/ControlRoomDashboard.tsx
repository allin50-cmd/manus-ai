import React from "react";

const C = { bg:"#0a0f1e",surface:"#111827",border:"#1e2d45",accent:"#3b82f6",green:"#22c55e",amber:"#f59e0b",red:"#ef4444",text:"#f1f5f9",textDim:"#94a3b8",textMuted:"#64748b" };

const Badge = ({ ok }: { ok: boolean }) => (
  <span style={{ padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600, background: ok?"rgba(34,197,94,0.15)":"rgba(239,68,68,0.15)", color: ok?C.green:C.red }}>{ok?"HEALTHY":"DOWN"}</span>
);

export default function ControlRoomDashboard() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Control Room</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>Real-time system health and operational metrics.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginBottom: 24 }}>
          {[
            { label:"API Latency", value:"42ms", ok:true },
            { label:"DB Connections", value:"7/10", ok:true },
            { label:"Redis", value:"Connected", ok:true },
            { label:"Alert Sweep", value:"Last: 2m ago", ok:true },
          ].map(s => (
            <div key={s.label} style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ color:C.textMuted, fontSize:11, fontWeight:600, textTransform:"uppercase" }}>{s.label}</span>
                <Badge ok={s.ok} />
              </div>
              <div style={{ color:C.text, fontSize:22, fontWeight:700 }}>{s.value}</div>
            </div>
          ))}
        </div>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:24 }}>
          <h2 style={{ color:C.text, fontSize:16, fontWeight:600, marginBottom:16 }}>Scheduled Jobs</h2>
          {[
            { name:"Alert Sweep (v1)", schedule:"Every 15 min", lastRun:"2 min ago", status:true },
            { name:"Company Data Refresh", schedule:"Daily 2am", lastRun:"6h ago", status:true },
            { name:"Digest Email Send", schedule:"Mon 8am", lastRun:"3 days ago", status:true },
            { name:"Stripe Sync", schedule:"Every hour", lastRun:"45 min ago", status:true },
          ].map(j => (
            <div key={j.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${C.border}` }}>
              <div>
                <div style={{ color:C.text, fontSize:14, fontWeight:500 }}>{j.name}</div>
                <div style={{ color:C.textMuted, fontSize:12 }}>{j.schedule} · Last run: {j.lastRun}</div>
              </div>
              <Badge ok={j.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
