import { useState } from "react";
import { useLocation } from "wouter";

const C = {
  bg: "#0a0f1e",
  surface: "#111827",
  border: "#1e2d45",
  accent: "#3b82f6",
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

export default function OnboardingNotifications() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  function handleContinue() {
    const existing = JSON.parse(sessionStorage.getItem("fg_onboarding") || "{}");
    sessionStorage.setItem(
      "fg_onboarding",
      JSON.stringify({ ...existing, notifications: { email, mobile, weeklyDigest } })
    );
    setLocation("/onboarding/complete");
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
          maxWidth: "480px",
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

        <ProgressBar step={4} />

        <h1 style={{ fontSize: "22px", fontWeight: 700, color: C.text, marginBottom: "8px" }}>
          How Should We Reach You?
        </h1>
        <p style={{ fontSize: "14px", color: C.textDim, marginBottom: "28px" }}>
          Set up your notification channels for compliance alerts.
        </p>

        {/* Email */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{ display: "block", fontSize: "13px", color: C.textDim, marginBottom: "6px" }}
          >
            Email Address <span style={{ color: C.accent }}>*</span>
          </label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: "8px",
              color: C.text,
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <p style={{ fontSize: "12px", color: C.textMuted, marginTop: "4px" }}>
            Pre-filled from your account if available.
          </p>
        </div>

        {/* Mobile */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{ display: "block", fontSize: "13px", color: C.textDim, marginBottom: "6px" }}
          >
            Mobile Number{" "}
            <span style={{ color: C.textMuted, fontSize: "12px" }}>(optional — for SMS alerts)</span>
          </label>
          <input
            type="tel"
            placeholder="+44 7700 900000"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: "8px",
              color: C.text,
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Weekly digest toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: "10px",
            marginBottom: "28px",
          }}
        >
          <div>
            <div style={{ fontSize: "14px", fontWeight: 500, color: C.text }}>
              Weekly Compliance Digest
            </div>
            <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "2px" }}>
              A summary of all activity, sent every Monday morning
            </div>
          </div>
          <button
            onClick={() => setWeeklyDigest(!weeklyDigest)}
            style={{
              width: "44px",
              height: "24px",
              borderRadius: "12px",
              background: weeklyDigest ? C.accent : C.border,
              border: "none",
              cursor: "pointer",
              position: "relative",
              transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "3px",
                left: weeklyDigest ? "23px" : "3px",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: "#fff",
                transition: "left 0.2s",
                display: "block",
              }}
            />
          </button>
        </div>

        <button
          onClick={handleContinue}
          disabled={!email}
          style={{
            width: "100%",
            padding: "13px",
            background: email ? C.accent : C.border,
            border: "none",
            borderRadius: "10px",
            color: email ? "#fff" : C.textMuted,
            fontSize: "15px",
            fontWeight: 600,
            cursor: email ? "pointer" : "not-allowed",
            transition: "background 0.2s",
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
