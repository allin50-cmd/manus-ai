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

const TOTAL_STEPS = 5;

function ProgressBar({ step }: { step: number }) {
  return (
    <div style={{ marginBottom: "40px", width: "100%" }}>
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
        style={{
          height: "6px",
          background: C.border,
          borderRadius: "3px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${(step / TOTAL_STEPS) * 100}%`,
            background: C.accent,
            borderRadius: "3px",
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

export default function OnboardingWelcome() {
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "32px",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              background: C.accent,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            F
          </div>
          <span style={{ fontSize: "18px", fontWeight: 700, color: C.text }}>
            FineGuard Pro
          </span>
        </div>

        <ProgressBar step={1} />

        {/* Heading */}
        <h1
          style={{
            fontSize: "26px",
            fontWeight: 700,
            color: C.text,
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          Welcome to FineGuard Pro
        </h1>
        <p
          style={{
            fontSize: "15px",
            color: C.textDim,
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          Let's get you set up in under 2 minutes
        </p>

        {/* Value props */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginBottom: "36px",
          }}
        >
          {[
            "Monitor UK company filings and deadlines automatically",
            "Get alerts before fines are issued — never miss a deadline",
            "Track directors, PSC changes, and dissolution risks",
          ].map((point) => (
            <div
              key={point}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: `${C.green}20`,
                  border: `1px solid ${C.green}40`,
                  color: C.green,
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              >
                ✓
              </span>
              <span style={{ fontSize: "14px", color: C.textDim, lineHeight: "1.5" }}>
                {point}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link href="/onboarding/company">
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
              letterSpacing: "0.01em",
            }}
          >
            Get Started →
          </button>
        </Link>
      </div>
    </div>
  );
}
