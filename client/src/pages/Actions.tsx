const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const actions = [
  { action: "File Annual Accounts", company: "Gamma Holdings Ltd", priority: "High", due: "2024-10-20", assigned: "Alice M.", status: "Overdue" },
  { action: "Review Director Change", company: "Beta Corp", priority: "Medium", due: "2024-10-22", assigned: "Bob T.", status: "To Do" },
  { action: "Send CS Reminder Email", company: "Epsilon Ltd", priority: "Low", due: "2024-10-25", assigned: "Alice M.", status: "To Do" },
  { action: "Confirm VAT Registration", company: "Delta PLC", priority: "High", due: "2024-10-18", assigned: "Carol S.", status: "In Progress" },
  { action: "Update Registered Address", company: "Zeta Services", priority: "Low", due: "2024-11-01", assigned: "Bob T.", status: "To Do" },
  { action: "Acknowledge Filing Receipt", company: "Eta Consulting", priority: "Medium", due: "2024-10-19", assigned: "Carol S.", status: "Done" },
];

const priorityColors: Record<string, string> = { High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e" };
const statusColors: Record<string, string> = { Overdue: "#ef4444", "To Do": "#94a3b8", "In Progress": "#3b82f6", Done: "#22c55e" };

export default function Actions() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 1050, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Action Items</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Task queue of compliance actions across all monitored companies. Assign, prioritise, and track to completion.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Actions", value: "6", color: C.text },
            { label: "Overdue", value: "1", color: C.red },
            { label: "In Progress", value: "1", color: C.accent },
            { label: "Completed", value: "1", color: C.green },
          ].map((s) => (
            <div key={s.label} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 20px" }}>
              <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 4px" }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: 24, fontWeight: 700, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
            <h2 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0 }}>All Actions</h2>
            <button style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ New Action</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceHover }}>
                {["Action", "Company", "Priority", "Due Date", "Assigned To", "Status"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {actions.map((a, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "13px 16px", color: C.text, fontSize: 13, fontWeight: 500 }}>{a.action}</td>
                  <td style={{ padding: "13px 16px", color: C.textDim, fontSize: 13 }}>{a.company}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: priorityColors[a.priority] + "22", color: priorityColors[a.priority], fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20 }}>{a.priority}</span>
                  </td>
                  <td style={{ padding: "13px 16px", color: a.status === "Overdue" ? C.red : C.textMuted, fontSize: 13 }}>{a.due}</td>
                  <td style={{ padding: "13px 16px", color: C.textDim, fontSize: 13 }}>{a.assigned}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: statusColors[a.status] + "22", color: statusColors[a.status], fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20 }}>{a.status}</span>
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
