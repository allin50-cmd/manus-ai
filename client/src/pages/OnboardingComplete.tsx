import { useEffect, useState } from "react";
import { Link } from "wouter";

const C = {
  bg: "#0a0f1e",
  surface: "#111827",
  border: "#1e2d45",
  accent: "#3b82f6",
  green: "#22c55e",
  text: "#f1f5f9",
  textDim: "#94a3b8",
  textMuted: "#64748b",
};

interface OnboardingData {
  selectedCompany?: { title: string; company_number: string };
  alertTypes?: Record<string, boolean>;
  daysBeforeDeadline?: number;
  notifications?: { email: string; mobile: string; weeklyDigest: boolean };
}

interface Dot {
  id: number;
  left: string;
  delay: string;
  duration: string;
  color: string;
  size: string;
}

function ConfettiDots() {
  const [dots] = useState<Dot[]>(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${3 + Math.random() * 3}s`,
      color: [C.green, C.accent, "#f59e0b", "#ec4899", "#8b5cf6"][Math.floor(Math.random() * 5)],
      size: `${6 + Math.random() * 8}px`,
    }))
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      <style>{`
        @keyframes floatDot {
          0% { transform: translateY(110vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
      {dots.map((dot) => (
        <div
          key={dot.id}
          style={{
            position: "absolute",
            bottom: "-20px",
            left: dot.left,
            width: dot.size,
            height: dot.size,
            borderRadius: "50%",
            background: dot.color,
            animation: `floatDot ${dot.duration} ${dot.delay} ease-in infinite`,
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );
}

export default function OnboardingComplete() {
  const [data, setData] = useState<OnboardingData>({});

  useEffect(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem("fg_onboarding") || "{}");
      setData(stored);
    } catch {
      // ignore parse errors
    }
  }, []);

  const activeAlerts = Object.entries(data.alertTypes ?? {})
    .filter(([, v]) => v)
    .map(([k]) =>
      k === "accountsOverdue"
        ? "Accounts Overdue"
        : k === "confirmationStatement"
          ? "Confirmation Statement"
          : k === "directorChanges"
            ? "Director Changes"
            : k === "pscChanges"
              ? "PSC Changes"
              : "Dissolution Warning"
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        padding: "24px",
        position: "relative",
      }}
    >
      <ConfettiDots />

      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "16px",
          padding: "40px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Checkmark circle */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: `${C.green}20`,
            border: `2px solid ${C.green}60`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: "32px",
          }}
        >
          ✓
        </div>

        <h1
          style={{
            fontSize: "26px",
            fontWeight: 700,
            color: C.text,
            marginBottom: "8px",
          }}
        >
          You're all set!
        </h1>
        <p style={{ fontSize: "15px", color: C.textDim, marginBottom: "32px" }}>
          Your compliance monitoring is now active
        </p>

        {/* Summary */}
        <div
          style={{
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
            padding: "20px",
            textAlign: "left",
            marginBottom: "32px",
          }}
        >
          <h3
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: C.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "14px",
            }}
          >
            Setup Summary
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <span style={{ color: C.green, fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>
                ✓
              </span>
              <div>
                <span style={{ fontSize: "13px", color: C.textDim }}>Company added: </span>
                <span style={{ fontSize: "13px", color: C.text, fontWeight: 500 }}>
                  {data.selectedCompany?.title ?? "None selected"}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <span style={{ color: C.green, fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>
                ✓
              </span>
              <div>
                <span style={{ fontSize: "13px", color: C.textDim }}>Alerts configured: </span>
                <span style={{ fontSize: "13px", color: C.text, fontWeight: 500 }}>
                  {activeAlerts.length > 0 ? activeAlerts.join(", ") : "None"}
                </span>
                {data.daysBeforeDeadline && (
                  <span style={{ fontSize: "13px", color: C.textMuted }}>
                    {" "}({data.daysBeforeDeadline} days before deadline)
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <span style={{ color: C.green, fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>
                ✓
              </span>
              <div>
                <span style={{ fontSize: "13px", color: C.textDim }}>Notifications: </span>
                <span style={{ fontSize: "13px", color: C.text, fontWeight: 500 }}>
                  {[
                    data.notifications?.email && "Email",
                    data.notifications?.mobile && "SMS",
                    data.notifications?.weeklyDigest && "Weekly digest",
                  ]
                    .filter(Boolean)
                    .join(", ") || "Email"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Link href="/dashboard">
          <button
            style={{
              width: "100%",
              padding: "14px",
              background: C.accent,
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Go to Dashboard →
          </button>
        </Link>
      </div>
    </div>
  );
}
