import { useState } from "react";
import { Link } from "wouter";
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

interface Subscription {
  planName: string;
  priceMonthly: number;
  nextBillingDate: string;
  status: "active" | "cancelled" | "past_due" | "trialing";
}

interface Invoice {
  id: string;
  date: string;
  amountPence: number;
  status: "paid" | "pending";
  pdfUrl?: string;
}

interface BillingData {
  subscription: Subscription;
  invoices: Invoice[];
}

export default function Payments() {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelConfirmed, setCancelConfirmed] = useState(false);

  const { data, isLoading, isError } = trpc.billing.getSubscription.useQuery();
  const billing = data as BillingData | undefined;

  const sub = billing?.subscription;
  const invoices = billing?.invoices ?? [];

  const statusColor = (status: string) => {
    if (status === "active" || status === "paid") return C.green;
    if (status === "trialing" || status === "pending") return C.amber;
    return C.red;
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      active: "Active",
      cancelled: "Cancelled",
      past_due: "Past Due",
      trialing: "Trial",
      paid: "Paid",
      pending: "Pending",
    };
    return map[status] ?? status;
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
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>Billing</h1>
        <p style={{ color: C.textDim, fontSize: "14px", marginBottom: "32px" }}>
          Manage your subscription and view payment history.
        </p>

        {isLoading ? (
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "12px",
              padding: "48px",
              textAlign: "center",
              color: C.textMuted,
              fontSize: "14px",
            }}
          >
            Loading billing information...
          </div>
        ) : isError ? (
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.red}40`,
              borderRadius: "12px",
              padding: "32px",
              textAlign: "center",
              color: C.red,
              fontSize: "14px",
            }}
          >
            Failed to load billing information. Please try again later.
          </div>
        ) : (
          <>
            {/* Current subscription */}
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                padding: "24px",
                marginBottom: "24px",
              }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: C.text, marginBottom: "20px" }}>
                Current Subscription
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  gap: "20px",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <div style={{ fontSize: "12px", color: C.textMuted, marginBottom: "4px" }}>
                    Plan
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: C.text }}>
                    {sub?.planName ?? "—"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: C.textMuted, marginBottom: "4px" }}>
                    Price
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: C.text }}>
                    {sub ? `£${(sub.priceMonthly / 100).toFixed(2)}/mo` : "—"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: C.textMuted, marginBottom: "4px" }}>
                    Next Billing
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: C.text }}>
                    {sub?.nextBillingDate
                      ? new Date(sub.nextBillingDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: C.textMuted, marginBottom: "4px" }}>
                    Status
                  </div>
                  {sub ? (
                    <span
                      style={{
                        fontSize: "12px",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        background: `${statusColor(sub.status)}20`,
                        color: statusColor(sub.status),
                        fontWeight: 600,
                      }}
                    >
                      {statusLabel(sub.status)}
                    </span>
                  ) : (
                    <span style={{ color: C.textMuted }}>—</span>
                  )}
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
                    Change Plan
                  </button>
                </Link>
                <button
                  onClick={() => setShowCancelModal(true)}
                  style={{
                    padding: "10px 20px",
                    background: `${C.red}10`,
                    border: `1px solid ${C.red}30`,
                    borderRadius: "8px",
                    color: C.red,
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Cancel Subscription
                </button>
              </div>
            </div>

            {/* Invoices */}
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: C.text, marginBottom: "16px" }}>
                Invoices
              </h2>
              <div
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                {invoices.length === 0 ? (
                  <div
                    style={{
                      padding: "48px",
                      textAlign: "center",
                      color: C.textMuted,
                      fontSize: "14px",
                    }}
                  >
                    No invoices yet.
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                        {["Date", "Amount", "Status", ""].map((col) => (
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
                      {invoices.map((inv, i) => (
                        <tr
                          key={inv.id}
                          style={{
                            borderBottom:
                              i < invoices.length - 1 ? `1px solid ${C.border}` : "none",
                          }}
                        >
                          <td style={{ padding: "14px 16px", fontSize: "14px", color: C.text }}>
                            {new Date(inv.date).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td
                            style={{
                              padding: "14px 16px",
                              fontSize: "14px",
                              fontWeight: 500,
                              color: C.text,
                            }}
                          >
                            £{(inv.amountPence / 100).toFixed(2)}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <span
                              style={{
                                fontSize: "12px",
                                padding: "3px 10px",
                                borderRadius: "12px",
                                background: `${statusColor(inv.status)}20`,
                                color: statusColor(inv.status),
                                fontWeight: 500,
                              }}
                            >
                              {statusLabel(inv.status)}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px", textAlign: "right" }}>
                            {inv.pdfUrl && (
                              <a
                                href={inv.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
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
          </>
        )}
      </div>

      {/* Cancel confirmation modal */}
      {showCancelModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "24px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCancelModal(false);
          }}
        >
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "14px",
              padding: "32px",
              maxWidth: "420px",
              width: "100%",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: C.text, marginBottom: "12px" }}>
              Cancel Subscription?
            </h3>
            <p style={{ fontSize: "14px", color: C.textDim, marginBottom: "20px", lineHeight: "1.6" }}>
              Your subscription will remain active until the end of the current billing period. After
              that, you will lose access to all monitoring features.
            </p>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "24px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={cancelConfirmed}
                onChange={(e) => setCancelConfirmed(e.target.checked)}
                style={{ width: "16px", height: "16px", accentColor: C.red }}
              />
              <span style={{ fontSize: "13px", color: C.textDim }}>
                I understand my compliance monitoring will stop.
              </span>
            </label>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{
                  flex: 1,
                  padding: "11px",
                  background: C.surfaceHover,
                  border: `1px solid ${C.border}`,
                  borderRadius: "8px",
                  color: C.text,
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Keep Subscription
              </button>
              <button
                disabled={!cancelConfirmed}
                style={{
                  flex: 1,
                  padding: "11px",
                  background: cancelConfirmed ? C.red : `${C.red}40`,
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: cancelConfirmed ? "pointer" : "not-allowed",
                  opacity: cancelConfirmed ? 1 : 0.5,
                }}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
