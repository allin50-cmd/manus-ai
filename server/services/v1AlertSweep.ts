/**
 * FineGuard V1 — Alert Sweep
 *
 * Replaces the ad-hoc checkCompanyCompliance() in the scheduler.
 * This is the single function called by the daily/hourly cron job
 * to generate alerts for all monitored companies.
 *
 * Idempotent: skips alert creation if an identical unresolved alert
 * already exists for the same company + alertType.
 */

import * as db from "../db";
import { v1GetCompanyProfile } from "./v1CompaniesHouseProvider";
import { buildV1Alerts } from "./v1RuleEngine";
import { createAuditLogV1 } from "./v1AuditLog";
import { writeTimelineEvent } from "./timelineWriter";
import { dispatchAlertToChannels } from "../routers/alertDeliveryRouter";
import { setLastSweptAt } from "./systemState";
import { sendPushForAlert, buildPushPayload } from "./v1PushService";
// Static imports — previously these were dynamic `await import()` calls inside the hot loop,
// which caused unnecessary module resolution overhead on every iteration.
import { monitoredCompanies, companies, complianceAlerts } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { publishEvent } from "./simpleEventPublisher";

/**
 * Run the V1 alert sweep for all monitored companies across all users.
 * Called by the scheduler (daily-sync and hourly-alerts jobs).
 */
export async function runV1AlertSweep(): Promise<{
  companiesChecked: number;
  alertsCreated: number;
  pushSent: number;
  errors: number;
  durationMs: number;
}> {
  const startMs = Date.now();
  const stats = { companiesChecked: 0, alertsCreated: 0, pushSent: 0, errors: 0, durationMs: 0 };

  const dbInstance = await db.getDb();
  if (!dbInstance) {
    console.error("[V1AlertSweep] Database not available");
    return stats;
  }

  // ── Load all monitored companies ────────────────────────────────
  const monitored = await dbInstance
    .select({
      userId: monitoredCompanies.userId,
      companyId: monitoredCompanies.companyId,
      companyNumber: companies.companyNumber,
      companyName: companies.companyName,
      accountsNextDue: companies.accountsNextDue,
      confirmationStatementNextDue: companies.confirmationStatementNextDue,
    })
    .from(monitoredCompanies)
    .innerJoin(companies, eq(monitoredCompanies.companyId, companies.id));

  if (monitored.length === 0) {
    stats.durationMs = Date.now() - startMs;
    return stats;
  }

  // ── Pre-load existing unresolved alerts (batch, eliminates N+1) ─
  const existingAlerts = await dbInstance
    .select({
      userId: complianceAlerts.userId,
      companyId: complianceAlerts.companyId,
      alertType: complianceAlerts.alertType,
    })
    .from(complianceAlerts)
    .where(eq(complianceAlerts.isResolved, false));

  const existingAlertKeys = new Set(
    existingAlerts.map(a => `${a.userId}:${a.companyId}:${a.alertType}`)
  );

  // ── Rate-limited API call helper (max 10 concurrent) ────────────
  const CONCURRENCY_LIMIT = 10;
  let activeRequests = 0;
  const requestQueue: Array<() => void> = [];

  async function rateLimitedApiCall<T>(fn: () => Promise<T>): Promise<T> {
    while (activeRequests >= CONCURRENCY_LIMIT) {
      await new Promise<void>(resolve => requestQueue.push(resolve));
    }
    activeRequests++;
    try {
      return await fn();
    } finally {
      activeRequests--;
      const next = requestQueue.shift();
      if (next) next();
    }
  }

  // ── Process companies in batches ────────────────────────────────
  const BATCH_SIZE = 50;
  for (let i = 0; i < monitored.length; i += BATCH_SIZE) {
    const batch = monitored.slice(i, i + BATCH_SIZE);

    await Promise.allSettled(
      batch.map(async (row) => {
        stats.companiesChecked++;
        try {
          // Rate-limited API call to refresh company data
          const profile = await rateLimitedApiCall(() =>
            v1GetCompanyProfile(row.companyNumber)
          );

          if (profile) {
            await db.upsertCompany({
              companyNumber: profile.companyNumber,
              companyName: profile.companyName,
              companyStatus: profile.companyStatus,
              companyType: profile.companyType,
              incorporationDate: profile.incorporationDate,
              registeredOfficeAddress: profile.registeredOfficeAddress,
              accountsNextDue: profile.accountsNextDue,
              confirmationStatementNextDue: profile.confirmationStatementNextDue,
            });
          }

          const accountsNextDue = profile?.accountsNextDue ?? row.accountsNextDue;
          const confirmationStatementNextDue =
            profile?.confirmationStatementNextDue ?? row.confirmationStatementNextDue;

          const newAlerts = buildV1Alerts({
            userId: row.userId,
            companyId: row.companyId,
            companyName: row.companyName,
            confirmationStatementNextDue,
            accountsNextDue,
          });

          for (const alert of newAlerts) {
            // In-memory idempotency check (pre-loaded set)
            const key = `${alert.userId}:${alert.companyId}:${alert.alertType}`;
            if (existingAlertKeys.has(key)) continue;

            const created = await db.createAlert(alert as any);
            stats.alertsCreated++;
            existingAlertKeys.add(key); // Prevent duplicates within same sweep

            // Fire-and-forget operations in parallel (not sequential)
            const fireAndForget: Promise<unknown>[] = [
              publishEvent("alert.created", "alert", String(created?.id ?? 0), {
                alertType: alert.alertType, severity: alert.severity,
                companyId: row.companyId, companyNumber: row.companyNumber, userId: row.userId,
              }),
              writeTimelineEvent({
                companyId: row.companyId,
                eventType: alert.description.includes("overdue") ? "deadline_overdue" : "deadline_warning",
                title: alert.title, notes: alert.description, source: "system",
              }),
              dispatchAlertToChannels(row.userId, alert.title, alert.description, alert.severity),
              publishEvent("alert.sent", "alert", String(created?.id ?? 0), {
                alertType: alert.alertType, severity: alert.severity,
                companyNumber: row.companyNumber, userId: row.userId, channel: "multi",
              }),
              createAuditLogV1({
                userId: row.userId, companyId: row.companyId,
                action: "alert_generated", detail: `${alert.alertType}: ${alert.description}`,
              }),
            ];

            // Push notification for critical alerts
            if (alert.severity === "critical" && created?.id) {
              const payload = buildPushPayload(row.companyName, alert.description, created.id);
              fireAndForget.push(
                sendPushForAlert(row.userId, created.id, payload).then(pushed => {
                  stats.pushSent += (pushed as number) || 0;
                })
              );
            }

            // Execute all fire-and-forget in parallel, log failures
            const results = await Promise.allSettled(fireAndForget);
            for (const r of results) {
              if (r.status === 'rejected') {
                console.warn(`[V1AlertSweep] Fire-and-forget failed for ${row.companyNumber}:`, r.reason?.message || r.reason);
              }
            }
          }
        } catch (err) {
          stats.errors++;
          console.error(
            `[V1AlertSweep] Error processing company ${row.companyNumber}:`,
            err instanceof Error ? err.message : err
          );
        }
      })
    );
  }

  // Persist sweep completion timestamp
  await setLastSweptAt().catch(err =>
    console.warn("[V1AlertSweep] Failed to persist sweep timestamp:", err)
  );

  stats.durationMs = Date.now() - startMs;
  console.log(
    `[V1AlertSweep] Sweep complete — checked: ${stats.companiesChecked}, created: ${stats.alertsCreated}, pushSent: ${stats.pushSent}, errors: ${stats.errors}, duration: ${stats.durationMs}ms`
  );
  return stats;
}
