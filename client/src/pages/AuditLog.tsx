const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const logs = [
  { ts: "2024-10-15 14:32:01", user: "admin@fineguard.io", action: "USER_LOGIN", resource: "Auth", ip: "85.110.42.1" },
  { ts: "2024-10-15 14:35:22", user: "alice@acmefirm.co.uk", action: "COMPANY_ADD", resource: "Company:12345678", ip: "92.40.12.88" },
  { ts: "2024-10-15 14:40:18", user: "alice@acmefirm.co.uk", action: "ALERT_DISMISS", resource: "Alert:ALT-0042", ip: "92.40.12.88" },
  { ts: "2024-10-15 15:01:55", user: "bob@delta.com", action: "EXPORT_CSV", resource: "Companies", ip: "104.55.20.3" },
  { ts: "2024-10-15 15:22:09", user: "admin@fineguard.io", action: "USER_ROLE_CHANGE", resource: "User:carol@firm.io", ip: "85.110.42.1" },
  { ts: "2024-10-15 16:05:44", user: "carol@firm.io", action: "API_KEY_ROTATE", resource: "APIKey:ak_live_xxx", ip: "77.88.21.4" },
  { ts: "2024-10-15 16:18:30", user: "bob@delta.com", action: "COMPANY_REMOVE", resource: "Company:87654321", ip: "104.55.20.3" },
  { ts: "2024-10-15 17:00:00", user: "system", action: "ALERT_SWEEP", resource: "Scheduler", ip: "internal" },
];

const actionColor: Record<string, string> = {
  USER_LOGIN: "#22c55e",
  COMPANY_ADD: "#3b82f6",
  ALERT_DISMISS: "#f59e0b",
  EXPORT_CSV: "#94a3b8",
  USER_ROLE_CHANGE: "#ef4444",
  API_KEY_ROTATE: "#f59e0b",
  COMPANY_REMOVE: "#ef4444",
  ALERT_SWEEP: "#64748b",
};

const actionTypes = ["All Actions", "USER_LOGIN", "COMPANY_ADD", "ALERT_DISMISS", "EXPORT_CSV", "USER_ROLE_CHANGE", "API_KEY_ROTATE", "COMPANY_REMOVE"];

export default function AuditLog() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span style={{ background: C.red, color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, letterSpacing: 1 }}>ADMIN</span>
          <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, margin: 0 }}>System Audit Log</h1>
        </div>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Complete record of all user and system actions across the platform. Use filters to investigate specific events.
        </p>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
              padding: "8px 14px", color: C.textDim, fontSize: 13,
            }}>From: 2024-10-15</div>
            <div style={{
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
              padding: "8px 14px", color: C.textDim, fontSize: 13,
            }}>To: 2024-10-15</div>
          </div>
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
            padding: "8px 14px", color: C.textDim, fontSize: 13, minWidth: 180,
          }}>
            Action Type: All Actions
          </div>
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
            padding: "8px 14px", color: C.textDim, fontSize: 13, flex: 1,
          }}>
            Search user or resource...
          </div>
          <button style={{
            background: C.accent, color: "#fff", border: "none", borderRadius: 8,
            padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>Filter</button>
          <button style={{
            background: "transparent", color: C.textDim, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer",
          }}>Export CSV</button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Events", value: "1,284", color: C.text },
            { label: "Unique Users", value: "42", color: C.accent },
            { label: "Auth Events", value: "318", color: C.green },
            { label: "Critical Actions", value: "7", color: C.red },
          ].map((s) => (
            <div key={s.label} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "16px 20px" }}>
              <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 4px" }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: 24, fontWeight: 700, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceHover }}>
                {["Timestamp", "User", "Action", "Resource", "IP Address"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "11px 16px", color: C.textMuted, fontSize: 12, fontFamily: "monospace", whiteSpace: "nowrap" }}>{l.ts}</td>
                  <td style={{ padding: "11px 16px", color: C.textDim, fontSize: 13 }}>{l.user}</td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{
                      background: (actionColor[l.action] || C.textMuted) + "22",
                      color: actionColor[l.action] || C.textMuted,
                      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, fontFamily: "monospace",
                    }}>{l.action}</span>
                  </td>
                  <td style={{ padding: "11px 16px", color: C.text, fontSize: 13, fontFamily: "monospace" }}>{l.resource}</td>
                  <td style={{ padding: "11px 16px", color: C.textMuted, fontSize: 12, fontFamily: "monospace" }}>{l.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: C.textMuted, fontSize: 13 }}>Showing 8 of 1,284 events</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ background: C.surfaceHover, color: C.textDim, border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>← Prev</button>
              <button style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>Next →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
