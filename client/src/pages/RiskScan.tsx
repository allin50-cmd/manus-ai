const C = {
  bg: "#0a0f1e", surface: "#111827", surfaceHover: "#1a2540",
  border: "#1e2d45", accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e", amber: "#f59e0b", red: "#ef4444",
  text: "#f1f5f9", textDim: "#94a3b8", textMuted: "#64748b",
};

const atRisk = [
  { company: "Gamma Holdings Ltd", number: "09988771", score: 94, issues: ["Accounts overdue 60d", "Confirmation Statement overdue"] },
  { company: "Iota Finance Ltd", number: "11223309", score: 81, issues: ["CS overdue 14d"] },
  { company: "Beta Corp Ltd", number: "87654321", score: 67, issues: ["Accounts due in 7 days"] },
  { company: "Lambda Services", number: "22334455", score: 55, issues: ["Director change unacknowledged"] },
  { company: "Mu Holdings PLC", number: "33445566", score: 42, issues: ["Accounts due in 20 days"] },
];

function RiskBadge({ score }: { score: number }) {
  const color = score >= 80 ? C.red : score >= 50 ? C.amber : C.green;
  const label = score >= 80 ? "High" : score >= 50 ? "Medium" : "Low";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ background: C.border, borderRadius: 4, height: 6, width: 60, overflow: "hidden" }}>
        <div style={{ background: color, height: "100%", width: `${score}%` }} />
      </div>
      <span style={{ color, fontSize: 13, fontWeight: 700 }}>{score}</span>
      <span style={{ background: color + "22", color, fontSize: 11, fontWeight: 600, padding: "2px 7px", borderRadius: 20 }}>{label}</span>
    </div>
  );
}

export default function RiskScan() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Risk Scan</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginBottom: 32 }}>
          Run a full risk assessment across all monitored companies. Identify at-risk entities, overdue filings, and potential compliance failures.
        </p>

        {/* Scan controls */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <p style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: "0 0 4px" }}>Last scan: Today at 06:00</p>
              <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>Scanned 247 companies · Duration: 4.2s</p>
            </div>
            <button style={{
              background: C.accent, color: "#fff", border: "none", borderRadius: 8,
              padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>🔍 Scan All Companies</button>
          </div>
          <div style={{ background: C.surfaceHover, borderRadius: 6, height: 8, overflow: "hidden" }}>
            <div style={{ background: C.green, height: "100%", width: "100%", borderRadius: 6 }} />
          </div>
          <p style={{ color: C.textMuted, fontSize: 12, marginTop: 6 }}>Scan complete — 100%</p>
        </div>

        {/* Risk breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24, marginBottom: 32 }}>
          {/* Pie chart placeholder */}
          <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, padding: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h3 style={{ color: C.text, fontSize: 14, fontWeight: 600, margin: "0 0 16px" }}>Risk Breakdown</h3>
            <div style={{ position: "relative", width: 120, height: 120, marginBottom: 16 }}>
              <svg viewBox="0 0 42 42" style={{ width: 120, height: 120, transform: "rotate(-90deg)" }}>
                <circle cx="21" cy="21" r="15.9" fill="transparent" stroke={C.red} strokeWidth="5" strokeDasharray="30 70" />
                <circle cx="21" cy="21" r="15.9" fill="transparent" stroke={C.amber} strokeWidth="5" strokeDasharray="25 75" strokeDashoffset="-30" />
                <circle cx="21" cy="21" r="15.9" fill="transparent" stroke={C.green} strokeWidth="5" strokeDasharray="45 55" strokeDashoffset="-55" />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: C.text, fontSize: 20, fontWeight: 700 }}>247</span>
              </div>
            </div>
            {[{ label: "High Risk", count: 12, color: C.red }, { label: "Medium Risk", count: 35, color: C.amber }, { label: "Low Risk", count: 200, color: C.green }].map((r) => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: 6 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: r.color }} />
                  <span style={{ color: C.textDim, fontSize: 13 }}>{r.label}</span>
                </div>
                <span style={{ color: r.color, fontWeight: 700, fontSize: 13 }}>{r.count}</span>
              </div>
            ))}
          </div>

          {/* Quick stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { label: "Companies Monitored", value: "247", color: C.text },
              { label: "High Risk", value: "12", color: C.red },
              { label: "Overdue Filings", value: "8", color: C.red },
              { label: "Due This Week", value: "14", color: C.amber },
            ].map((s) => (
              <div key={s.label} style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: "20px" }}>
                <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 4px" }}>{s.label}</p>
                <p style={{ color: s.color, fontSize: 28, fontWeight: 700, margin: 0 }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* At-risk table */}
        <div style={{ background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
            <h2 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0 }}>At-Risk Companies</h2>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceHover }}>
                {["Company", "Number", "Risk Score", "Issues"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: C.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {atRisk.map((r) => (
                <tr key={r.number} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "13px 16px", color: C.text, fontSize: 13, fontWeight: 500 }}>{r.company}</td>
                  <td style={{ padding: "13px 16px", color: C.textMuted, fontSize: 12, fontFamily: "monospace" }}>{r.number}</td>
                  <td style={{ padding: "13px 16px" }}><RiskBadge score={r.score} /></td>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {r.issues.map((iss) => (
                        <span key={iss} style={{ background: C.red + "18", color: C.red, fontSize: 11, padding: "2px 8px", borderRadius: 4 }}>{iss}</span>
                      ))}
                    </div>
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
