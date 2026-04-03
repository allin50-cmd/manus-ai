/**
 * FineGuard Pro – Stripe Webhook Handler
 *
 * Handles checkout.session.completed for three sources:
 *   1. Upload jobs (metadata.job_id) — monitoring services auto-activate,
 *      data processing jobs queued for agent.
 *   2. Tool checkouts (metadata.tool = director_alert | risk_scan) — auto-run.
 *   3. /check page activations (metadata.source = check_page) — auto-create
 *      monitored company + compliance alert records.
 */

import type { Express, Request, Response } from "express";
import express from "express";
import Stripe from "stripe";
import { ENV } from "../_core/env";
import { getDb, markOnboardingComplete } from "../db";
import { sendTransactionalEmail } from "../services/clicksend";
import {
  agentUploadJobs,
  toolTransactions,
  companies,
  complianceAlerts,
  monitoredCompanies,
  outboundContacts,
  outboundCampaigns,
  reminderSubscriptions,
} from "../../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";
import { publishEvent } from "../services/simpleEventPublisher";

/** Monitoring job types that should be auto-activated immediately on payment */
const MONITORING_JOB_TYPES = new Set([
  "companies_house",
  "mtd_vat",
  "corporation_tax",
  "self_assessment",
]);

export function registerStripeWebhook(app: Express) {
  // MUST use raw body BEFORE express.json() — registered in index.ts before json middleware
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"];

      let event: Stripe.Event;
      try {
        if (!ENV.stripeSecretKey) {
          return res.status(500).json({ error: "Stripe not configured" });
        }
        const stripe = new Stripe(ENV.stripeSecretKey, { apiVersion: "2026-01-28.clover" as const });

        // Test event detection — must return verified:true for Stripe test webhooks
        const rawBody = req.body as Buffer;
        const bodyStr = rawBody.toString();
        let parsedBody: { id?: string } = {};
        try { parsedBody = JSON.parse(bodyStr); } catch (_parseErr) { /* ignore */ }

        if (parsedBody.id && String(parsedBody.id).startsWith("evt_test_")) {
          console.log("[Stripe Webhook] Test event detected, returning verification response");
          return res.json({ verified: true });
        }

        event = stripe.webhooks.constructEvent(rawBody, sig as string, ENV.stripeWebhookSecret);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Webhook signature verification failed";
        console.error("[Stripe Webhook] Error:", msg);
        return res.status(400).json({ error: msg });
      }

      console.log(`[Stripe Webhook] Event: ${event.type} (${event.id})`);
      const correlationId = `wh_${event?.id ?? 'unknown'}_${Date.now()}`;

      // ── Idempotency guard: prevent duplicate event processing ──────────
      const drizzleForIdem = await getDb();
      if (drizzleForIdem) {
        try {
          const [existing] = await drizzleForIdem.execute(
            sql`SELECT 1 FROM stripe_webhook_events WHERE stripe_event_id = ${event.id} LIMIT 1`
          );
          if (existing && (existing as any[]).length > 0) {
            console.log(`[StripeWebhook] Duplicate event ${event.id} — skipping`);
            return res.json({ received: true, duplicate: true });
          }
          // Record event as processed (best-effort — table may not exist yet)
          await drizzleForIdem.execute(
            sql`INSERT IGNORE INTO stripe_webhook_events (stripe_event_id, event_type, processed_at) VALUES (${event.id}, ${event.type}, NOW())`
          );
        } catch (idemErr) {
          // Table might not exist yet — log and continue (non-blocking)
          console.warn("[StripeWebhook] Idempotency check skipped:", (idemErr as Error).message);
        }
      }

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;

            // ── 1. Upload job billing ──────────────────────────────────────────
            const jobId = session.metadata?.job_id ? parseInt(session.metadata.job_id) : null;
            if (jobId && session.payment_status === "paid") {
              const drizzle = await getDb();
              if (!drizzle) {
                console.error("[StripeWebhook] DB unavailable for checkout.session.completed");
                return res.status(500).json({ error: "Database unavailable" });
              }

              const [job] = await drizzle
                .select({ jobType: agentUploadJobs.jobType })
                .from(agentUploadJobs)
                .where(eq(agentUploadJobs.id, jobId))
                .limit(1);

              const paymentIntentId =
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : (session.payment_intent?.toString() ?? null);

              if (job && MONITORING_JOB_TYPES.has(job.jobType)) {
                const serviceLabel: Record<string, string> = {
                  companies_house: "Companies House Monitoring",
                  mtd_vat: "MTD VAT Alerts",
                  corporation_tax: "Corporation Tax Alerts",
                  self_assessment: "Self Assessment Alerts",
                };
                const label = serviceLabel[job.jobType] ?? job.jobType;
                await drizzle
                  .update(agentUploadJobs)
                  .set({
                    billingStatus: "paid",
                    status: "completed",
                    resultSummary: `${label} activated automatically after payment`,
                    stripePaymentIntentId: paymentIntentId,
                    completedAt: Date.now(),
                    updatedAt: Date.now(),
                  })
                  .where(eq(agentUploadJobs.id, jobId));
                console.log(`[Stripe Webhook] Monitoring job ${jobId} (${job.jobType}) auto-activated`);
              } else {
                await drizzle
                  .update(agentUploadJobs)
                  .set({
                    billingStatus: "paid",
                    status: "queued",
                    stripePaymentIntentId: paymentIntentId,
                    updatedAt: Date.now(),
                  })
                  .where(eq(agentUploadJobs.id, jobId));
                console.log(`[Stripe Webhook] Data job ${jobId} marked paid and queued`);
              }
            }

            // ── 2. Tool checkouts (director_alert / risk_scan) ─────────────────
            const tool = session.metadata?.tool;
            const toolCompanyNumber = session.metadata?.companyNumber;
            const toolUserId = session.metadata?.userId ? parseInt(session.metadata.userId) : null;

            if ((tool === "director_alert" || tool === "risk_scan") && toolCompanyNumber && toolUserId && session.payment_status === "paid") {
              console.log(`[Stripe Webhook] Auto-running ${tool} for company ${toolCompanyNumber} (user ${toolUserId})`);
              try {
                const drizzle = await getDb();
                if (!drizzle) { console.error("[Stripe Webhook] DB unavailable for tool scan"); break; }

                if (tool === "director_alert") {
                  const apiKey = ENV.companiesHouseApiKey;
                  const resp = await fetch(
                    `https://api.company-information.service.gov.uk/company/${toolCompanyNumber}/officers?items_per_page=50`,
                    { headers: { Authorization: `Basic ${Buffer.from(apiKey + ":").toString("base64")}` } }
                  );
                  const data = resp.ok ? await resp.json() as { items?: Array<{ name: string; officer_role: string; appointed_on?: string; resigned_on?: string }> } : { items: [] };
                  const officers: Array<{ name: string; officer_role: string; appointed_on?: string; resigned_on?: string }> = data.items ?? [];
                  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
                  const recentChanges = officers.filter(o =>
                    (o.appointed_on && new Date(o.appointed_on) >= ninetyDaysAgo) ||
                    (o.resigned_on && new Date(o.resigned_on) >= ninetyDaysAgo)
                  );
                  await drizzle.insert(toolTransactions).values({
                    userId: toolUserId,
                    toolName: "director_alert",
                    price: 100,
                    currency: "gbp",
                    stripeSessionId: session.id,
                    status: "completed",
                    metadata: { companyNumber: toolCompanyNumber, recentChanges: recentChanges.length, autoRun: true },
                    createdAt: Date.now(),
                  });
                  console.log(`[Stripe Webhook] Director alert auto-run: ${recentChanges.length} recent changes for ${toolCompanyNumber}`);
                } else if (tool === "risk_scan") {
                  const apiKey = ENV.companiesHouseApiKey;
                  const authHeader = `Basic ${Buffer.from(apiKey + ":").toString("base64")}`;
                  const [profileResp, filingsResp] = await Promise.all([
                    fetch(`https://api.company-information.service.gov.uk/company/${toolCompanyNumber}`, { headers: { Authorization: authHeader } }),
                    fetch(`https://api.company-information.service.gov.uk/company/${toolCompanyNumber}/filing-history?items_per_page=50`, { headers: { Authorization: authHeader } }),
                  ]);
                  const profile = profileResp.ok ? await profileResp.json() as Record<string, unknown> : null;
                  const filingsData = filingsResp.ok ? await filingsResp.json() as { items?: Array<{ type?: string; description?: string; date?: string }> } : { items: [] };
                  const filings = filingsData.items ?? [];

                  let riskScore = 100;
                  const riskSignals: string[] = [];
                  const status = profile ? String(profile.company_status ?? "") : "";
                  if (["dissolved", "liquidation", "receivership"].includes(status.toLowerCase())) { riskScore -= 40; riskSignals.push(`Status: ${status}`); }
                  const accountsDue = (profile as { accounts?: { next_due?: string } } | null)?.accounts?.next_due;
                  if (accountsDue) {
                    const days = Math.floor((new Date(accountsDue).getTime() - Date.now()) / 86400000);
                    if (days < 0) { riskScore -= 30; riskSignals.push(`Accounts overdue ${Math.abs(days)}d`); }
                    else if (days <= 30) { riskScore -= 10; riskSignals.push(`Accounts due in ${days}d`); }
                  }
                  const lateFilings = filings.filter(f => f.description?.toLowerCase().includes("late") || f.type?.toLowerCase().includes("late"));
                  if (lateFilings.length >= 2) { riskScore -= 15; riskSignals.push(`${lateFilings.length} late filings`); }
                  const strikeOff = filings.filter(f => f.description?.toLowerCase().includes("strike") || f.description?.toLowerCase().includes("dissolution"));
                  if (strikeOff.length > 0) { riskScore -= 25; riskSignals.push(`${strikeOff.length} strike-off filings`); }
                  riskScore = Math.max(0, Math.min(100, riskScore));
                  const riskLevel = riskScore >= 71 ? "LOW" : riskScore >= 41 ? "MEDIUM" : "HIGH";

                  const [co] = await drizzle.select({ id: companies.id }).from(companies).where(eq(companies.companyNumber, toolCompanyNumber)).limit(1);
                  if (co) {
                    await drizzle.update(companies).set({ riskScore, riskLevel: riskLevel.toLowerCase() as "low" | "medium" | "high" }).where(eq(companies.id, co.id));
                  }
                  await drizzle.insert(toolTransactions).values({
                    userId: toolUserId,
                    toolName: "risk_scan",
                    price: 100,
                    currency: "gbp",
                    stripeSessionId: session.id,
                    status: "completed",
                    metadata: { companyNumber: toolCompanyNumber, riskScore, riskLevel, riskSignals, autoRun: true },
                    createdAt: Date.now(),
                  });
                  console.log(`[Stripe Webhook] Risk scan auto-run: score=${riskScore} (${riskLevel}) for ${toolCompanyNumber}`);
                }
              } catch (toolErr) {
                console.error(`[Stripe Webhook] Auto-run error for ${tool}:`, toolErr);
              }
            }

            // ── 3. /check page activation — auto-create monitored company ──────
            if (session.metadata?.source === "check_page" && session.payment_status === "paid") {
              const checkCompanyNumber = session.metadata.company_number;
              const checkCompanyName = session.metadata.company_name || checkCompanyNumber;
              const selectedAlerts = (session.metadata.selected_alerts ?? "").split(",").filter(Boolean);
              const checkUserId = session.metadata.user_id
                ? parseInt(session.metadata.user_id)
                : null;

              console.log(
                `[Stripe Webhook] check_page activation: company=${checkCompanyNumber}, alerts=${selectedAlerts.join(",")}, userId=${checkUserId ?? "guest"}`
              );

              try {
                const drizzle = await getDb();
                if (!drizzle) {
                  console.error("[Stripe Webhook] DB unavailable for check_page activation");
                  break;
                }

                // Upsert company record
                let companyId: number | null = null;
                const [existingCompany] = await drizzle
                  .select({ id: companies.id })
                  .from(companies)
                  .where(eq(companies.companyNumber, checkCompanyNumber))
                  .limit(1);

                if (existingCompany) {
                  companyId = existingCompany.id;
                } else {
                  const inserted = await drizzle.insert(companies).values({
                    companyNumber: checkCompanyNumber,
                    companyName: checkCompanyName,
                    companyStatus: "active",
                    funnelStage: "customer",
                    leadScore: 80,
                  });
                  companyId = Number((inserted as { insertId?: number }).insertId ?? 0) || null;
                }

                // Create monitoredCompanies record if user is authenticated
                if (checkUserId && companyId) {
                  try {
                    await drizzle.insert(monitoredCompanies).values({
                      userId: checkUserId,
                      companyId,
                      monitoringLevel: "standard",
                    });
                    console.log(
                      `[Stripe Webhook] monitoredCompanies created: userId=${checkUserId}, companyId=${companyId}`
                    );
                  } catch (_monitorErr) {
                    // Unique constraint — already monitored, safe to ignore
                    console.log(`[Stripe Webhook] monitoredCompanies already exists for userId=${checkUserId}, companyId=${companyId}`);
                  }

                  // Mark onboarding as complete for authenticated users who paid via /check
                  try {
                    await markOnboardingComplete(checkUserId);
                    console.log(`[Stripe Webhook] onboardingCompleted=true set for userId=${checkUserId}`);
                  } catch (onboardErr) {
                    console.warn(`[Stripe Webhook] Failed to mark onboarding complete for userId=${checkUserId}:`, onboardErr);
                  }
                }

                // Create complianceAlerts for each selected alert type
                if (companyId && selectedAlerts.length > 0) {
                  const effectiveUserId = checkUserId ?? 0;
                  type AlertInsert = {
                    userId: number;
                    companyId: number;
                    alertType: "accounts_due" | "confirmation_statement_due" | "status_change";
                    severity: "critical" | "warning" | "info";
                    title: string;
                    description: string;
                    isRead: boolean;
                    isResolved: boolean;
                  };
                  const alertInserts: AlertInsert[] = selectedAlerts
                    .map((alertKey): AlertInsert | null => {
                      if (alertKey === "accounts_filing") {
                        return {
                          userId: effectiveUserId,
                          companyId: companyId!,
                          alertType: "accounts_due",
                          severity: "warning",
                          title: `Accounts Filing due \u2014 ${checkCompanyName}`,
                          description: "Accounts filing deadline monitoring activated via FineGuard /check page.",
                          isRead: false,
                          isResolved: false,
                        };
                      }
                      if (alertKey === "confirmation_statement") {
                        return {
                          userId: effectiveUserId,
                          companyId: companyId!,
                          alertType: "confirmation_statement_due",
                          severity: "warning",
                          title: `Confirmation Statement due \u2014 ${checkCompanyName}`,
                          description: "Confirmation statement deadline monitoring activated via FineGuard /check page.",
                          isRead: false,
                          isResolved: false,
                        };
                      }
                      if (alertKey === "director_changes") {
                        return {
                          userId: effectiveUserId,
                          companyId: companyId!,
                          alertType: "status_change",
                          severity: "info",
                          title: `Director Changes monitoring \u2014 ${checkCompanyName}`,
                          description: "Director appointment/resignation monitoring activated via FineGuard /check page.",
                          isRead: false,
                          isResolved: false,
                        };
                      }
                      return null;
                    })
                    .filter((v): v is AlertInsert => v !== null);

                  if (alertInserts.length > 0) {
                    await drizzle.insert(complianceAlerts).values(alertInserts);
                    console.log(
                      `[Stripe Webhook] ${alertInserts.length} complianceAlerts created for company ${checkCompanyNumber}`
                    );
                  }
                }

                // ── ReminderSubscription creation (Flow D — Growth Engine Phase 2) ──
                if (companyId) {
                  const subEmail =
                    session.metadata?.customer_email ??
                    (typeof session.customer_email === "string" ? session.customer_email : null);
                  const channels: Array<"email" | "sms"> = ["email"];
                  for (const ch of channels) {
                    try {
                      await drizzle.insert(reminderSubscriptions).values({
                        companyId,
                        userId: checkUserId ?? undefined,
                        email: ch === "email" ? (subEmail ?? undefined) : undefined,
                        channel: ch,
                        active: true,
                      });
                    } catch (_dupErr) {
                      // Ignore duplicate key errors — subscription may already exist
                    }
                  }
                  console.log(
                    `[Stripe Webhook] ReminderSubscription created for companyId=${companyId}, email=${subEmail ?? "n/a"}`
                  );
                  // Ops event: filing_queued (subscription activated = filing monitoring queued)
                  publishEvent("filing.queued", "company", checkCompanyNumber, {
                    companyId,
                    userId: checkUserId,
                    selectedAlerts,
                    stripeSessionId: session.id,
                  }).catch(() => {});
                }

                // ── Guest post-payment account creation email ────────────────────────────────
                const guestEmail = !checkUserId
                  ? (session.metadata?.customer_email ?? session.customer_email ?? null)
                  : null;

                if (guestEmail) {
                  try {
                    const appOrigin = "https://fineguardpro.com";
                    const ctaUrl = `${appOrigin}/onboarding/complete?email=${encodeURIComponent(guestEmail)}`;
                    const alertList = selectedAlerts
                      .map((a: string) => {
                        const labels: Record<string, string> = {
                          accounts_filing: "Accounts Filing",
                          confirmation_statement: "Confirmation Statement",
                          director_changes: "Director Changes",
                        };
                        return `<li>${labels[a] ?? a}</li>`;
                      })
                      .join("");

                    const emailBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:32px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden">
        <!-- Header -->
        <tr><td style="background:#1e3a5f;padding:24px 32px">
          <span style="color:#ffffff;font-size:20px;font-weight:700">FineGuard</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px">
          <h2 style="margin:0 0 16px;color:#1e3a5f;font-size:22px">Your alerts are active</h2>
          <p style="margin:0 0 12px;color:#374151;font-size:15px;line-height:1.6">
            Your FineGuard monitoring for <strong>${checkCompanyName}</strong> is now live.
            We will alert you before any deadlines are missed.
          </p>
          <p style="margin:0 0 8px;color:#374151;font-size:14px"><strong>Active alerts:</strong></p>
          <ul style="margin:0 0 24px;padding-left:20px;color:#374151;font-size:14px;line-height:1.8">
            ${alertList}
          </ul>
          <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6">
            Create a free account to manage your alerts, view your dashboard, and add more companies.
          </p>
          <!-- CTA -->
          <table cellpadding="0" cellspacing="0">
            <tr><td style="background:#1e3a5f;border-radius:6px">
              <a href="${ctaUrl}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none">Create your account</a>
            </td></tr>
          </table>
          <p style="margin:24px 0 0;color:#6b7280;font-size:13px">
            Or sign in at <a href="${appOrigin}" style="color:#1e3a5f">${appOrigin}</a>
          </p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb">
          <p style="margin:0;color:#9ca3af;font-size:12px">FineGuard Pro &bull; UK Companies House Monitoring &bull; <a href="${appOrigin}" style="color:#9ca3af">${appOrigin}</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

                    const emailResult = await sendTransactionalEmail({
                      to: guestEmail,
                      subject: "Your FineGuard alerts are active",
                      body: emailBody,
                      fromName: "FineGuard",
                    });

                    if (emailResult.success) {
                      console.log(`[Stripe Webhook] Guest activation email sent to ${guestEmail} (msgId=${emailResult.messageId ?? "n/a"})`);
                    } else {
                      console.warn(`[Stripe Webhook] Guest activation email failed for ${guestEmail}: ${emailResult.error}`);
                    }
                  } catch (emailErr) {
                    console.warn("[Stripe Webhook] Guest activation email error:", emailErr);
                  }
                }

                // ── Outbound attribution — insert activation event ─────────────
                const outboundSrc = session.metadata?.outbound_src;
                if (outboundSrc) {
                  try {
                    const payerEmail =
                      session.metadata?.customer_email ??
                      (typeof session.customer_email === "string" ? session.customer_email : null);

                    if (payerEmail) {
                      const drizzle2 = await getDb();
                      if (drizzle2) {
                        const [contact] = await drizzle2
                          .select({ id: outboundContacts.id, listId: outboundContacts.listId })
                          .from(outboundContacts)
                          .where(eq(outboundContacts.email, payerEmail))
                          .orderBy(desc(outboundContacts.createdAt))
                          .limit(1);

                        if (contact) {
                          const [campaign] = await drizzle2
                            .select({ id: outboundCampaigns.id })
                            .from(outboundCampaigns)
                            .where(eq(outboundCampaigns.listId, contact.listId))
                            .orderBy(desc(outboundCampaigns.createdAt))
                            .limit(1);

                          if (campaign) {
                            await drizzle2.execute(
                              sql`INSERT IGNORE INTO outbound_events
                                (campaign_id, contact_id, event, meta, occurred_at)
                                VALUES (
                                  ${campaign.id},
                                  ${contact.id},
                                  'activation',
                                  ${JSON.stringify({ outbound_src: outboundSrc, stripe_session_id: session.id, company_number: session.metadata?.company_number ?? null })},
                                  NOW()
                                )`
                            );
                            console.log(
                              `[Stripe Webhook] Outbound activation event recorded: contact=${contact.id}, campaign=${campaign.id}, src=${outboundSrc}`
                            );
                          } else {
                            console.log(
                              `[Stripe Webhook] Outbound activation: no campaign found for listId=${contact.listId}, skipping`
                            );
                          }
                        } else {
                          console.log(
                            `[Stripe Webhook] Outbound activation: no contact found for email=${payerEmail}, skipping`
                          );
                        }
                      }
                    }
                  } catch (outboundActivationErr) {
                    console.warn("[Stripe Webhook] Outbound activation event error:", outboundActivationErr);
                  }
                }
              } catch (checkPageErr) {
                console.error("[Stripe Webhook] check_page activation error:", checkPageErr);
              }
            }

            break;
          }

          case "payment_intent.payment_failed": {
            const pi = event.data.object as Stripe.PaymentIntent;
            const jobId = pi.metadata?.job_id ? parseInt(pi.metadata.job_id) : null;
            if (jobId) {
              const drizzle = await getDb();
              if (!drizzle) { console.error("[Stripe Webhook] DB unavailable"); break; }
              await drizzle
                .update(agentUploadJobs)
                .set({ status: "failed", errorLog: "Payment failed", updatedAt: Date.now() })
                .where(eq(agentUploadJobs.id, jobId));
              console.log(`[Stripe Webhook] Job ${jobId} marked as failed (payment failed)`);
            }
            break;
          }

          default:
            console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }

        res.json({ received: true, correlationId });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Handler error";
        console.error("[Stripe Webhook] Handler error:", msg);
        res.status(500).json({ error: msg });
      }
    }
  );
}
