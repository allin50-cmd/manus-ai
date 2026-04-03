import { trpc } from "@/lib/trpc";

const C = {
  bg: "#0a0f1e",
  surface: "#111827",
  surfaceHover: "#1a2540",
  border: "#1e2d45",
  accent: "#3b82f6",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  text: "#f1f5f9",
  textDim: "#94a3b8",
  textMuted: "#64748b",
};

interface Report {
  id: string;
  name: string;
  type: string;
  generatedAt: string;
  status: "ready" | "processing";
  downloadUrl?: string;
}

const REPORT_TYPES = [
  {
    id: "portfolio",
    title: "Portfolio Summary",
    desc: "Overview of all monitored companies and their compliance status",
    icon: "📊",
  },
  {
    id: "individual",
    title: "Individual Company",
    desc: "Detailed compliance report for a single company",
    icon: "🏢",
  },
  {
    id: "overdue",
    title: "Overdue Filings",
    desc: "All outstanding and overdue filings across your portfolio",
    icon: "⚠️",
  },
  {
    id: "risk",
    title: "Risk Analysis",
    desc: "Companies ranked by compliance risk score",
    icon: "🎯",
  },
];

export default function Reports() {
  const { data: reports, isLoading, isError } = trpc.reports.getReports.useQuery();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: C.bg,
        color: C.text,
        fontFamily: "system-ui, sans-serif",
        padding: "32px",
      }}
    >
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>
              Compliance Reports
            </h1>
            <p style={{ color: C.textDim, fontSize: "14px" }}>
              Generate and download detailed compliance reports for your portfolio.
            </p>
          </div>
          <button
            style={{
              padding: "10px 20px",
              background: C.accent,
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Generate Report
          </button>
        </div>

        {/* Report type cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          {REPORT_TYPES.map((rt) => (
            <div
              key={rt.id}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                padding: "20px",
                cursor: "pointer",
                transition: "border-color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = C.accent;
                (e.currentTarget as HTMLDivElement).style.background = C.surfaceHover;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = C.border;
                (e.currentTarget as HTMLDivElement).style.background = C.surface;
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>{rt.icon}</div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: C.text, marginBottom: "6px" }}>
                {rt.title}
              </div>
              <div style={{ fontSize: "12px", color: C.textMuted, lineHeight: "1.5" }}>
                {rt.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Reports table */}
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px", color: C.text }}>
            Recent Reports
          </h2>
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {isLoading ? (
              <div
                style={{ padding: "48px", textAlign: "center", color: C.textMuted, fontSize: "14px" }}
              >
                Loading reports...
              </div>
            ) : isError ? (
              <div
                style={{ padding: "48px", textAlign: "center", color: C.red, fontSize: "14px" }}
              >
                Failed to load reports. Please try again.
              </div>
            ) : !reports || (reports as Report[]).length === 0 ? (
              <div
                style={{
                  padding: "56px 24px",
                  textAlign: "center",
                  color: C.textMuted,
                  fontSize: "14px",
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>📋</div>
                <div style={{ fontWeight: 500, color: C.textDim, marginBottom: "4px" }}>
                  No reports yet
                </div>
                <div>Generate your first report to get started.</div>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["Report Name", "Type", "Generated", "Status", ""].map((col) => (
                      <th
                        key={col}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: C.textMuted,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(reports as Report[]).map((report, i) => (
                    <tr
                      key={report.id}
                      style={{
                        borderBottom:
                          i < (reports as Report[]).length - 1 ? `1px solid ${C.border}` : "none",
                      }}
                    >
                      <td
                        style={{
                          padding: "14px 16px",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: C.text,
                        }}
                      >
                        {report.name}
                      </td>
                      <td
                        style={{ padding: "14px 16px", fontSize: "13px", color: C.textDim }}
                      >
                        {report.type}
                      </td>
                      <td
                        style={{ padding: "14px 16px", fontSize: "13px", color: C.textDim }}
                      >
                        {new Date(report.generatedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            fontSize: "12px",
                            padding: "3px 10px",
                            borderRadius: "12px",
                            background:
                              report.status === "ready"
                                ? `${C.green}20`
                                : `${C.amber}20`,
                            color: report.status === "ready" ? C.green : C.amber,
                            fontWeight: 500,
                          }}
                        >
                          {report.status === "ready" ? "Ready" : "Processing"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        {report.status === "ready" && (
                          <a
                            href={report.downloadUrl ?? "#"}
                            style={{
                              fontSize: "13px",
                              color: C.accent,
                              textDecoration: "none",
                              fontWeight: 500,
                            }}
                          >
                            Download PDF
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
