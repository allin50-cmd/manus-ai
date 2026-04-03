const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const leads = [
  { company: "Apex Accountants Ltd", contact: "Rachel Green", source: "LinkedIn", status: "Qualified", score: 88, lastContact: "2024-10-13" },
  { company: "Bright Minds Consulting", contact: "Tom Hardy", source: "Website", status: "New", score: 62, lastContact: "2024-10-14" },
  { company: "Crown Bookkeeping", contact: "Lisa Park", source: "Referral", status: "Converted", score: 95, lastContact: "2024-10-10" },
  { company: "Delta Finance Ltd", contact: "Mark Shaw", source: "Cold Email", status: "New", score: 44, lastContact: "2024-10-12" },
  { company: "Echo Advisory", contact: "Sarah Miles", source: "LinkedIn", status: "Qualified", score: 77, lastContact: "2024-10-08" },
  { company: "Foxtrot Tax", contact: "James Cohen", source: "Google Ads", status: "New", score: 55, lastContact: "2024-10-14" },
];

const statusColors: Record<string, string> = {
  New: "#3b82f6", Qualified: "#f59e0b", Converted: "#22c55e", Lost: "#ef4444",
};

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? C.green : score >= 60 ? C.amber : C.textMuted;
  return <span style={{ color, fontWeight: 700, fontSize: 14 }}>{score}</span>;
}

export default function Leads() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 1050, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Leads</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Track inbound and outbound leads through the qualification pipeline to conversion.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Leads", value: "82", color: C.text },
            { label: "New", value: "24", color: C.accent },
            { label: "Qualified", value: "31", color: C.amber },
            { label: "Converted", value: "27", color: C.green },
          ].map((s) => (
            <div key={s.label} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 20px" }}>
              <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 4px" }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: 24, fontWeight: 700, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0 }}>All Leads</h2>
            <button style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Add Lead</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceHover }}>
                {["Company", "Contact", "Source", "Status", "Score", "Last Contact", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.company} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "13px 16px", color: C.text, fontSize: 13, fontWeight: 500 }}>{l.company}</td>
                  <td style={{ padding: "13px 16px", color: C.textDim, fontSize: 13 }}>{l.contact}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: C.accent + "18", color: C.accent, fontSize: 11, padding: "2px 8px", borderRadius: 4 }}>{l.source}</span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: statusColors[l.status] + "22", color: statusColors[l.status], fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>{l.status}</span>
                  </td>
                  <td style={{ padding: "13px 16px" }}><ScoreBadge score={l.score} /></td>
                  <td style={{ padding: "13px 16px", color: C.textMuted, fontSize: 13 }}>{l.lastContact}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <button style={{ background: "transparent", color: C.accent, border: `1px solid ${C.accent}44`, borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
