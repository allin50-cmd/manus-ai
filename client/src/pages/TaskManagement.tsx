const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const groups: { status: string; color: string; tasks: { title: string; company: string; priority: string; due: string }[] }[] = [
  {
    status: "To Do", color: C.textMuted,
    tasks: [
      { title: "File Confirmation Statement", company: "Epsilon Ltd", priority: "High", due: "2024-10-25" },
      { title: "Update SIC codes", company: "Zeta Services", priority: "Low", due: "2024-11-05" },
      { title: "Review PSC register", company: "Delta PLC", priority: "Medium", due: "2024-10-30" },
    ],
  },
  {
    status: "In Progress", color: C.accent,
    tasks: [
      { title: "Prepare Annual Accounts", company: "Acme Ltd", priority: "High", due: "2024-10-22" },
      { title: "Director Appointment Forms", company: "Beta Corp", priority: "Medium", due: "2024-10-20" },
    ],
  },
  {
    status: "Done", color: C.green,
    tasks: [
      { title: "File VAT Return Q3", company: "Gamma Holdings", priority: "High", due: "2024-10-07" },
      { title: "Acknowledge Penalty Letter", company: "Iota Finance", priority: "High", due: "2024-10-05" },
    ],
  },
];

const priorityColors: Record<string, string> = { High: C.red, Medium: C.amber, Low: C.green };

export default function TaskManagement() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Task Management</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Manage compliance tasks across your portfolio. Tasks are grouped by status — drag to update progress.
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
          <button style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ New Task</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {groups.map((g) => (
            <div key={g.status}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: g.color }} />
                <span style={{ color: C.textDim, fontSize: 14, fontWeight: 600 }}>{g.status}</span>
                <span style={{ background: g.color + "22", color: g.color, fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 20 }}>{g.tasks.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {g.tasks.map((t) => (
                  <div key={t.title} style={{
                    background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`,
                    padding: "14px 16px", cursor: "grab",
                  }}>
                    <p style={{ color: C.text, fontSize: 13, fontWeight: 600, margin: "0 0 4px" }}>{t.title}</p>
                    <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 10px" }}>{t.company}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ background: priorityColors[t.priority] + "22", color: priorityColors[t.priority], fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>{t.priority}</span>
                      <span style={{ color: C.textMuted, fontSize: 11 }}>Due {t.due}</span>
                    </div>
                  </div>
                ))}
                <button style={{
                  background: "transparent", border: `1px dashed ${C.border}`,
                  borderRadius: 8, padding: "8px", color: C.textMuted, fontSize: 12,
                  cursor: "pointer", textAlign: "center",
                }}>+ Add task</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
