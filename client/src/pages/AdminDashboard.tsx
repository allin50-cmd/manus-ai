import { trpc } from "@/lib/trpc";

const C = {
  bg: "#0a0f1e",
  surface: "#111827",
  border: "#1e2d45",
  accent: "#3b82f6",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  text: "#f1f5f9",
  textDim: "#94a3b8",
  textMuted: "#64748b",
};

interface AdminStats {
  totalUsers: number;
  totalCompanies: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  recentSignups: Array<{
    email: string;
    plan: string;
    joinedAt: string;
    status: "active" | "inactive" | "trial";
  }>;
  systemHealth: {
    apiStatus: "healthy" | "degraded" | "down";
    dbConnections: number;
    redisStatus: "connected" | "disconnected";
  };
}

export default function AdminDashboard() {
  const { data, isLoading, isError, error } = trpc.admin.getStats.useQuery();

  if (isError) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: C.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: "32px",
        }}
      >
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.red}40`,
            borderRadius: "12px",
            padding: "40px",
            textAlign: "center",
            maxWidth: "420px",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔒</div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: C.red, marginBottom: "8px" }}>
            Admin Access Required
          </h2>
          <p style={{ fontSize: "14px", color: C.textDim }}>
            You don't have permission to access the admin dashboard. Contact your system
            administrator.
          </p>
          {(error as any)?.message && (
            <p
              style={{
                marginTop: "12px",
                fontSize: "12px",
                color: C.textMuted,
                fontFamily: "monospace",
              }}
            >
              {(error as any).message}
            </p>
          )}
        </div>
      </div>
    );
  }

  const stats = data as AdminStats | undefined;

  const statCards = [
    {
      label: "Total Users",
      value: isLoading ? "—" : (stats?.totalUsers ?? 0).toLocaleString(),
      color: C.accent,
    },
    {
      label: "Companies Monitored",
      value: isLoading ? "—" : (stats?.totalCompanies ?? 0).toLocaleString(),
      color: C.green,
    },
    {
      label: "Active Subscriptions",
      value: isLoading ? "—" : (stats?.activeSubscriptions ?? 0).toLocaleString(),
      color: C.amber,
    },
    {
      label: "Monthly Revenue",
      value: isLoading ? "—" : `£${((stats?.monthlyRevenue ?? 0) / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`,
      color: C.green,
    },
  ];

  const health = stats?.systemHealth;

  const statusBadge = (
    label: string,
    healthy: boolean,
    value?: string | number
  ) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <span style={{ fontSize: "14px", color: C.textDim }}>{label}</span>
      <span
        style={{
          fontSize: "12px",
          padding: "3px 10px",
          borderRadius: "12px",
          background: healthy ? `${C.green}20` : `${C.red}20`,
          color: healthy ? C.green : C.red,
          fontWeight: 500,
        }}
      >
        {value ?? (healthy ? "Online" : "Offline")}
      </span>
    </div>
  );

  const signupStatusColor = (status: string) => {
    if (status === "active") return C.green;
    if (status === "trial") return C.amber;
    return C.textMuted;
  };

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
      <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "8px",
          }}
        >
          <h1 style={{ fontSize: "24px", fontWeight: 700 }}>Admin Dashboard</h1>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              background: `${C.red}20`,
              color: C.red,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              border: `1px solid ${C.red}40`,
            }}
          >
            Admin Only
          </span>
        </div>
        <p style={{ color: C.textDim, fontSize: "14px", marginBottom: "32px" }}>
          System-wide metrics and user management.
        </p>

        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          {statCards.map((card) => (
            <div
              key={card.label}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: C.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 600,
                  marginBottom: "10px",
                }}
              >
                {card.label}
              </div>
              <div style={{ fontSize: "28px", fontWeight: 700, color: card.color }}>
                {card.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* Recent Signups table */}
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 600, color: C.text, marginBottom: "16px" }}>
              Recent Signups
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
                  style={{
                    padding: "48px",
                    textAlign: "center",
                    color: C.textMuted,
                    fontSize: "14px",
                  }}
                >
                  Loading...
                </div>
              ) : !stats?.recentSignups?.length ? (
                <div
                  style={{
                    padding: "48px",
                    textAlign: "center",
                    color: C.textMuted,
                    fontSize: "14px",
                  }}
                >
                  No recent signups.
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {["Email", "Plan", "Joined", "Status"].map((col) => (
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
                    {stats.recentSignups.map((user, i) => (
                      <tr
                        key={user.email}
                        style={{
                          borderBottom:
                            i < stats.recentSignups.length - 1
                              ? `1px solid ${C.border}`
                              : "none",
                        }}
                      >
                        <td
                          style={{
                            padding: "12px 16px",
                            fontSize: "13px",
                            color: C.text,
                            fontFamily: "monospace",
                          }}
                        >
                          {user.email}
                        </td>
                        <td
                          style={{ padding: "12px 16px", fontSize: "13px", color: C.textDim }}
                        >
                          {user.plan}
                        </td>
                        <td
                          style={{ padding: "12px 16px", fontSize: "13px", color: C.textDim }}
                        >
                          {new Date(user.joinedAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              fontSize: "12px",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              background: `${signupStatusColor(user.status)}20`,
                              color: signupStatusColor(user.status),
                              textTransform: "capitalize",
                              fontWeight: 500,
                            }}
                          >
                            {user.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* System Health */}
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 600, color: C.text, marginBottom: "16px" }}>
              System Health
            </h2>
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              {isLoading ? (
                <p style={{ color: C.textMuted, fontSize: "14px" }}>Loading...</p>
              ) : (
                <div>
                  {statusBadge(
                    "API Status",
                    health?.apiStatus === "healthy",
                    health?.apiStatus === "healthy"
                      ? "Healthy"
                      : health?.apiStatus === "degraded"
                        ? "Degraded"
                        : "Down"
                  )}
                  {statusBadge(
                    "Database Connections",
                    (health?.dbConnections ?? 0) > 0,
                    health?.dbConnections ?? 0
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 0",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: C.textDim }}>Redis</span>
                    <span
                      style={{
                        fontSize: "12px",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        background:
                          health?.redisStatus === "connected"
                            ? `${C.green}20`
                            : `${C.red}20`,
                        color:
                          health?.redisStatus === "connected" ? C.green : C.red,
                        fontWeight: 500,
                      }}
                    >
                      {health?.redisStatus === "connected" ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
