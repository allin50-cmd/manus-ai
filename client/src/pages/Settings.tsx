import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const C = {
  bg: "#0a0f1e",
  surface: "#111827",
  surfaceHover: "#1a2540",
  border: "#1e2d45",
  accent: "#3b82f6",
  accentGlow: "rgba(59,130,246,0.15)",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  text: "#f1f5f9",
  textDim: "#94a3b8",
  textMuted: "#64748b",
};

type Tab = "profile" | "notifications" | "billing" | "api";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    weeklyDigest: true,
    overdueOnly: false,
  });
  const [webhookUrl, setWebhookUrl] = useState("");

  const { data: profile, isLoading: profileLoading } =
    trpc.settings.getProfile.useQuery(undefined, {
      onSuccess: (data: any) => {
        setProfileForm({ name: data?.name ?? "", email: data?.email ?? "" });
        setWebhookUrl(data?.webhookUrl ?? "");
      },
    } as any);

  const updateProfile = trpc.settings.updateProfile.useMutation();

  const tabs: { id: Tab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "notifications", label: "Notifications" },
    { id: "billing", label: "Plan & Billing" },
    { id: "api", label: "API" },
  ];

  const planName: string = (profile as any)?.plan ?? "Starter";
  const planColor =
    planName === "Enterprise"
      ? C.amber
      : planName === "Professional"
        ? C.accent
        : C.green;

  const companiesUsed: number = (profile as any)?.companiesUsed ?? 0;
  const companiesLimit: number =
    planName === "Enterprise" ? 999 : planName === "Professional" ? 50 : 10;
  const usagePct = Math.min(100, Math.round((companiesUsed / companiesLimit) * 100));

  const maskedKey = "fg_live_" + "•".repeat(32);
  const actualKey = (profile as any)?.apiKey ?? "fg_live_••••••••••••••••••••••••••••••••";

  function handleCopyKey() {
    navigator.clipboard.writeText(actualKey).then(() => {
      setApiKeyCopied(true);
      setTimeout(() => setApiKeyCopied(false), 2000);
    });
  }

  function handleSaveProfile() {
    updateProfile.mutate(profileForm as any);
  }

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
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px", color: C.text }}>
          Settings
        </h1>
        <p style={{ color: C.textDim, marginBottom: "32px" }}>
          Manage your account preferences and configuration.
        </p>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            borderBottom: `1px solid ${C.border}`,
            marginBottom: "32px",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 20px",
                background: "none",
                border: "none",
                borderBottom:
                  activeTab === tab.id ? `2px solid ${C.accent}` : "2px solid transparent",
                color: activeTab === tab.id ? C.accent : C.textDim,
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: activeTab === tab.id ? 600 : 400,
                transition: "color 0.15s",
                marginBottom: "-1px",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                padding: "24px",
              }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px", color: C.text }}>
                Personal Information
              </h2>
              {profileLoading ? (
                <p style={{ color: C.textMuted }}>Loading...</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label
                      style={{ display: "block", fontSize: "13px", color: C.textDim, marginBottom: "6px" }}
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
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
                  <div>
                    <label
                      style={{ display: "block", fontSize: "13px", color: C.textDim, marginBottom: "6px" }}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      readOnly
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: C.surfaceHover,
                        border: `1px solid ${C.border}`,
                        borderRadius: "8px",
                        color: C.textMuted,
                        fontSize: "14px",
                        outline: "none",
                        cursor: "not-allowed",
                        boxSizing: "border-box",
                      }}
                    />
                    <p style={{ fontSize: "12px", color: C.textMuted, marginTop: "4px" }}>
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    disabled={updateProfile.isLoading}
                    style={{
                      alignSelf: "flex-start",
                      padding: "10px 20px",
                      background: C.accent,
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      opacity: updateProfile.isLoading ? 0.7 : 1,
                    }}
                  >
                    {updateProfile.isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>

            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                padding: "24px",
              }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px", color: C.text }}>
                Password
              </h2>
              <p style={{ color: C.textDim, fontSize: "14px", marginBottom: "16px" }}>
                Update your password to keep your account secure.
              </p>
              <button
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  padding: "10px 20px",
                  background: C.surfaceHover,
                  border: `1px solid ${C.border}`,
                  borderRadius: "8px",
                  color: C.text,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Change Password
              </button>
              {showPassword && (
                <div
                  style={{
                    marginTop: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {["Current Password", "New Password", "Confirm New Password"].map((label) => (
                    <div key={label}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "13px",
                          color: C.textDim,
                          marginBottom: "6px",
                        }}
                      >
                        {label}
                      </label>
                      <input
                        type="password"
                        style={{
                          width: "100%",
                          padding: "10px 14px",
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
                  ))}
                  <button
                    style={{
                      alignSelf: "flex-start",
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
                    Update Password
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "12px",
              padding: "24px",
            }}
          >
            <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px", color: C.text }}>
              Notification Preferences
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                {
                  key: "emailAlerts",
                  label: "Email Alerts",
                  desc: "Receive compliance alerts via email",
                },
                {
                  key: "smsAlerts",
                  label: "SMS Alerts",
                  desc: "Receive urgent alerts via text message",
                },
                {
                  key: "weeklyDigest",
                  label: "Weekly Digest",
                  desc: "Summary of all compliance activity each week",
                },
                {
                  key: "overdueOnly",
                  label: "Overdue Only",
                  desc: "Only notify when filings become overdue",
                },
              ].map((item, i) => (
                <div
                  key={item.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 0",
                    borderBottom:
                      i < 3 ? `1px solid ${C.border}` : "none",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: C.text }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "2px" }}>
                      {item.desc}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        [item.key]: !notifications[item.key as keyof typeof notifications],
                      })
                    }
                    style={{
                      width: "44px",
                      height: "24px",
                      borderRadius: "12px",
                      background: notifications[item.key as keyof typeof notifications]
                        ? C.accent
                        : C.border,
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
                        left: notifications[item.key as keyof typeof notifications] ? "23px" : "3px",
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
              ))}
            </div>
            <button
              style={{
                marginTop: "20px",
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
              Save Preferences
            </button>
          </div>
        )}

        {/* Plan & Billing Tab */}
        {activeTab === "billing" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                padding: "24px",
              }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px", color: C.text }}>
                Current Plan
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    background: `${planColor}20`,
                    color: planColor,
                    fontSize: "13px",
                    fontWeight: 600,
                    border: `1px solid ${planColor}40`,
                  }}
                >
                  {planName}
                </span>
                <span style={{ color: C.textDim, fontSize: "14px" }}>
                  {planName === "Enterprise"
                    ? "Custom pricing"
                    : planName === "Professional"
                      ? "£49/month"
                      : "£19/month"}
                </span>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                    fontSize: "13px",
                    color: C.textDim,
                  }}
                >
                  <span>Companies Monitored</span>
                  <span>
                    {companiesUsed} / {planName === "Enterprise" ? "Unlimited" : companiesLimit}
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    background: C.border,
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${usagePct}%`,
                      background:
                        usagePct > 80 ? C.red : usagePct > 60 ? C.amber : C.accent,
                      borderRadius: "4px",
                      transition: "width 0.3s",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <Link href="/pricing-services">
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
                    Upgrade Plan
                  </button>
                </Link>
                <button
                  style={{
                    padding: "10px 20px",
                    background: C.surfaceHover,
                    border: `1px solid ${C.border}`,
                    borderRadius: "8px",
                    color: C.text,
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Manage Billing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* API Tab */}
        {activeTab === "api" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                padding: "24px",
              }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px", color: C.text }}>
                API Key
              </h2>
              <p style={{ color: C.textDim, fontSize: "13px", marginBottom: "16px" }}>
                Use this key to authenticate requests to the FineGuard API.
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: "8px",
                  padding: "10px 14px",
                  marginBottom: "12px",
                }}
              >
                <code
                  style={{
                    flex: 1,
                    fontSize: "13px",
                    color: C.textDim,
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                  }}
                >
                  {showApiKey ? actualKey : maskedKey}
                </code>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{
                    padding: "4px 10px",
                    background: C.surfaceHover,
                    border: `1px solid ${C.border}`,
                    borderRadius: "6px",
                    color: C.textDim,
                    fontSize: "12px",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  {showApiKey ? "Hide" : "Show"}
                </button>
                <button
                  onClick={handleCopyKey}
                  style={{
                    padding: "4px 10px",
                    background: apiKeyCopied ? `${C.green}20` : C.surfaceHover,
                    border: `1px solid ${apiKeyCopied ? C.green : C.border}`,
                    borderRadius: "6px",
                    color: apiKeyCopied ? C.green : C.textDim,
                    fontSize: "12px",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  {apiKeyCopied ? "Copied!" : "Copy"}
                </button>
              </div>
              <button
                style={{
                  padding: "8px 16px",
                  background: `${C.red}15`,
                  border: `1px solid ${C.red}40`,
                  borderRadius: "8px",
                  color: C.red,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Regenerate Key
              </button>
              <p style={{ fontSize: "12px", color: C.textMuted, marginTop: "8px" }}>
                Regenerating your key will invalidate the current key immediately.
              </p>
            </div>

            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                padding: "24px",
              }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px", color: C.text }}>
                Webhook URL
              </h2>
              <p style={{ color: C.textDim, fontSize: "13px", marginBottom: "16px" }}>
                FineGuard will POST compliance events to this URL in real-time.
              </p>
              <input
                type="url"
                placeholder="https://your-app.com/webhooks/fineguard"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: "8px",
                  color: C.text,
                  fontSize: "14px",
                  outline: "none",
                  marginBottom: "12px",
                  boxSizing: "border-box",
                }}
              />
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
                Save Webhook
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
