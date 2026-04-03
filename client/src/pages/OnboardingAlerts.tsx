import { useState } from "react";
import { useLocation } from "wouter";

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

const TOTAL_STEPS = 5;

function ProgressBar({ step }: { step: number }) {
  return (
    <div style={{ marginBottom: "32px", width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "12px",
          color: C.textMuted,
          marginBottom: "8px",
        }}
      >
        <span>Step {step} of {TOTAL_STEPS}</span>
        <span>{Math.round((step / TOTAL_STEPS) * 100)}% complete</span>
      </div>
      <div
        style={{ height: "6px", background: C.border, borderRadius: "3px", overflow: "hidden" }}
      >
        <div
          style={{
            height: "100%",
            width: `${(step / TOTAL_STEPS) * 100}%`,
            background: C.accent,
            borderRadius: "3px",
          }}
        />
      </div>
    </div>
  );
}

const ALERT_TYPES = [
  { id: "accountsOverdue", label: "Accounts Overdue", desc: "Annual accounts filing deadlines" },
  {
    id: "confirmationStatement",
    label: "Confirmation Statement Due",
    desc: "Annual confirmation statement reminders",
  },
  {
    id: "directorChanges",
    label: "Director Changes",
    desc: "Appointments and resignations at Companies House",
  },
  { id: "pscChanges", label: "PSC Changes", desc: "Persons of Significant Control updates" },
  {
    id: "dissolutionWarning",
    label: "Dissolution Warning",
    desc: "Companies at risk of being struck off",
  },
];

const DAYS_OPTIONS = [7, 14, 30, 60];

export default function OnboardingAlerts() {
  const [, setLocation] = useLocation();
  const [alertTypes, setAlertTypes] = useState<Record<string, boolean>>({
    accountsOverdue: true,
    confirmationStatement: true,
    directorChanges: false,
    pscChanges: false,
    dissolutionWarning: true,
  });
  const [daysBeforeDeadline, setDaysBeforeDeadline] = useState(14);

  function toggleAlert(id: string) {
    setAlertTypes((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleContinue() {
    const existing = JSON.parse(sessionStorage.getItem("fg_onboarding") || "{}");
    sessionStorage.setItem(
      "fg_onboarding",
      JSON.stringify({ ...existing, alertTypes, daysBeforeDeadline })
    );
    setLocation("/onboarding/notifications");
  }

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
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "16px",
          padding: "40px",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              background: C.accent,
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "15px",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            F
          </div>
          <span style={{ fontSize: "15px", fontWeight: 700, color: C.text }}>FineGuard Pro</span>
        </div>

        <ProgressBar step={3} />

        <h1 style={{ fontSize: "22px", fontWeight: 700, color: C.text, marginBottom: "8px" }}>
          Configure Your Alerts
        </h1>
        <p style={{ fontSize: "14px", color: C.textDim, marginBottom: "24px" }}>
          Choose which compliance events you want to be notified about.
        </p>

        {/* Alert type checkboxes */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0",
            marginBottom: "28px",
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          {ALERT_TYPES.map((alert, i) => (
            <label
              key={alert.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 16px",
                borderBottom: i < ALERT_TYPES.length - 1 ? `1px solid ${C.border}` : "none",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={alertTypes[alert.id]}
                onChange={() => toggleAlert(alert.id)}
                style={{ width: "16px", height: "16px", accentColor: C.accent, cursor: "pointer" }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 500, color: C.text }}>
                  {alert.label}
                </div>
                <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "2px" }}>
                  {alert.desc}
                </div>
              </div>
              {alertTypes[alert.id] && (
                <span style={{ fontSize: "12px", color: C.green }}>Active</span>
              )}
            </label>
          ))}
        </div>

        {/* Days before deadline */}
        <div style={{ marginBottom: "28px" }}>
          <p style={{ fontSize: "14px", fontWeight: 500, color: C.text, marginBottom: "12px" }}>
            Alert me{" "}
            <span style={{ color: C.accent, fontWeight: 700 }}>{daysBeforeDeadline} days</span>{" "}
            before deadline
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            {DAYS_OPTIONS.map((days) => (
              <button
                key={days}
                onClick={() => setDaysBeforeDeadline(days)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: daysBeforeDeadline === days ? C.accent : C.bg,
                  border: `1px solid ${daysBeforeDeadline === days ? C.accent : C.border}`,
                  borderRadius: "8px",
                  color: daysBeforeDeadline === days ? "#fff" : C.textDim,
                  fontSize: "13px",
                  fontWeight: daysBeforeDeadline === days ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleContinue}
          style={{
            width: "100%",
            padding: "13px",
            background: C.accent,
            border: "none",
            borderRadius: "10px",
            color: "#fff",
            fontSize: "15px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
