const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const flows = [
  {
    name: "Welcome Accountant Flow",
    trigger: "New user signs up (Accountant)",
    steps: 5,
    status: "active",
    enrolled: 142,
    completed: 98,
    description: "Onboards new accountant users with a 5-email sequence over 14 days.",
  },
  {
    name: "Trial Expiry Nurture",
    trigger: "Trial ends in 3 days",
    steps: 3,
    status: "active",
    enrolled: 34,
    completed: 21,
    description: "Encourages trial users to upgrade before they lose access.",
  },
  {
    name: "Deadline Warning Series",
    trigger: "Filing due in 30 days",
    steps: 4,
    status: "active",
    enrolled: 512,
    completed: 488,
    description: "Automated reminder sequence at 30, 14, 7, and 1 day before deadline.",
  },
  {
    name: "Win-Back Campaign",
    trigger: "No login in 30 days",
    steps: 3,
    status: "paused",
    enrolled: 18,
    completed: 6,
    description: "Re-engages dormant users with relevant compliance alerts and feature highlights.",
  },
];

const statusColors: Record<string, string> = { active: "#22c55e", paused: "#f59e0b", draft: "#64748b" };

export default function FlowEngage() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Flow Engage</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Design and manage drip campaign flows triggered by user behaviour, compliance events, or time-based rules.
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
          <button style={{
            background: C.accent, color: "#fff", border: "none", borderRadius: 8,
            padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>+ New Flow</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {flows.map((f) => (
            <div key={f.name} style={{
              background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <p style={{ color: C.text, fontSize: 16, fontWeight: 700, margin: 0 }}>{f.name}</p>
                    <span style={{ background: statusColors[f.status] + "22", color: statusColors[f.status], fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20, textTransform: "capitalize" }}>{f.status}</span>
                  </div>
                  <p style={{ color: C.textMuted, fontSize: 12, margin: 0 }}>Trigger: {f.trigger}</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ background: "transparent", color: C.accent, border: `1px solid ${C.accent}44`, borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>Edit Flow</button>
                  <button style={{ background: f.status === "active" ? C.amber + "22" : C.green + "22", color: f.status === "active" ? C.amber : C.green, border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
                    {f.status === "active" ? "Pause" : "Activate"}
                  </button>
                </div>
              </div>

              <p style={{ color: C.textDim, fontSize: 13, margin: "8px 0 16px" }}>{f.description}</p>

              {/* Flow steps visualisation */}
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 16 }}>
                {Array.from({ length: f.steps }).map((_, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: C.accent + "22", border: `2px solid ${C.accent}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: C.accent, fontSize: 11, fontWeight: 700,
                    }}>{i + 1}</div>
                    {i < f.steps - 1 && <div style={{ width: 20, height: 2, background: C.border }} />}
                  </div>
                ))}
                <span style={{ color: C.textMuted, fontSize: 12, marginLeft: 8 }}>{f.steps} steps</span>
              </div>

              <div style={{ display: "flex", gap: 24, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                <div>
                  <p style={{ color: C.textMuted, fontSize: 11, margin: "0 0 2px" }}>Enrolled</p>
                  <p style={{ color: C.text, fontSize: 16, fontWeight: 700, margin: 0 }}>{f.enrolled}</p>
                </div>
                <div>
                  <p style={{ color: C.textMuted, fontSize: 11, margin: "0 0 2px" }}>Completed</p>
                  <p style={{ color: C.green, fontSize: 16, fontWeight: 700, margin: 0 }}>{f.completed}</p>
                </div>
                <div>
                  <p style={{ color: C.textMuted, fontSize: 11, margin: "0 0 2px" }}>Completion Rate</p>
                  <p style={{ color: C.accent, fontSize: 16, fontWeight: 700, margin: 0 }}>
                    {f.enrolled > 0 ? Math.round((f.completed / f.enrolled) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
