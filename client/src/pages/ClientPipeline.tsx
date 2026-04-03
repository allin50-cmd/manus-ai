const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const columns: { stage: string; color: string; cards: { name: string; contact: string; value: string; days: number }[] }[] = [
  {
    stage: "Prospect", color: C.textMuted,
    cards: [
      { name: "Apex Accountants", contact: "Rachel Green", value: "£480/yr", days: 2 },
      { name: "Indigo Advisory", contact: "Tom Hardy", value: "£240/yr", days: 5 },
    ],
  },
  {
    stage: "Contacted", color: C.accent,
    cards: [
      { name: "Crown Bookkeeping", contact: "Lisa Park", value: "£480/yr", days: 8 },
      { name: "Delta Finance", contact: "Mark Shaw", value: "£960/yr", days: 3 },
    ],
  },
  {
    stage: "Demo", color: C.amber,
    cards: [
      { name: "Echo Advisory", contact: "Sarah Miles", value: "£480/yr", days: 12 },
    ],
  },
  {
    stage: "Trial", color: "#a78bfa",
    cards: [
      { name: "Foxtrot Tax", contact: "James Cohen", value: "£480/yr", days: 6 },
      { name: "Gamma Partners", contact: "Nina Bell", value: "£960/yr", days: 9 },
    ],
  },
  {
    stage: "Converted", color: C.green,
    cards: [
      { name: "Harbour CPA", contact: "Oliver Webb", value: "£960/yr", days: 22 },
    ],
  },
];

export default function ClientPipeline() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Client Pipeline</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Kanban-style pipeline for tracking prospects from initial contact through to converted clients.
        </p>

        <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 16 }}>
          {columns.map((col) => (
            <div key={col.stage} style={{ minWidth: 220, flex: "0 0 220px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: col.color }} />
                  <span style={{ color: C.textDim, fontSize: 13, fontWeight: 600 }}>{col.stage}</span>
                </div>
                <span style={{ background: col.color + "22", color: col.color, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{col.cards.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {col.cards.map((card) => (
                  <div key={card.name} style={{
                    background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`,
                    padding: "14px 16px", cursor: "pointer",
                  }}>
                    <p style={{ color: C.text, fontSize: 13, fontWeight: 600, margin: "0 0 4px" }}>{card.name}</p>
                    <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 10px" }}>{card.contact}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: C.green, fontSize: 12, fontWeight: 600 }}>{card.value}</span>
                      <span style={{ color: C.textMuted, fontSize: 11 }}>{card.days}d</span>
                    </div>
                  </div>
                ))}
                <button style={{
                  background: "transparent", border: `1px dashed ${C.border}`,
                  borderRadius: 8, padding: "8px", color: C.textMuted, fontSize: 12, cursor: "pointer",
                  textAlign: "center",
                }}>+ Add</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
