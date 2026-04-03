import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { companiesHouseService } from "./services/companiesHouse";
import { v1GetCompanyProfile, setV1ProviderMode, getV1ProviderMode } from "./services/v1CompaniesHouseProvider";
import { buildV1Alerts } from "./services/v1RuleEngine";
import { createAuditLogV1 } from "./services/v1AuditLog";
import { runV1AlertSweep } from "./services/v1AlertSweep";
import { getLastSweptAt } from "./services/systemState";
import * as db from "./db";
import { notificationPreferences, pushSubscriptions } from "../drizzle/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { getDb } from "./db";
import { clientPortalRouter } from "./clientPortalRouter";
import { complianceRouter } from "./compliance-router";
import { publishEvent } from "./services/simpleEventPublisher";
import { agentsRouter } from "./routers/agentsRouter";
import { engagerRouter } from "./routers/engagerRouter";
import { agentMonitorRouter } from "./routers/agentMonitorRouter";
import { uploadJobsRouter } from "./routers/uploadJobsRouter";
import { vatCheckRouter } from "./routers/vatCheckRouter";
import { agentAppRouter } from "./routers/agentAppRouter";
import { documentVaultRouter } from "./routers/documentVaultRouter";
import { alertDeliveryRouter } from "./routers/alertDeliveryRouter";
import { complianceTimelineRouter } from "./routers/complianceTimelineRouter";
import { subscriptionRouter } from "./routers/subscriptionRouter";
import { complianceRiskRouter } from "./routers/complianceRiskRouter";
import { clientReportsRouter } from "./routers/clientReportsRouter";
import { directorAlertRouter } from "./routers/directorAlertRouter";
import { riskScanRouter } from "./routers/riskScanRouter";
import { firmRouter } from "./routers/firmRouter";
import { companyIntelligenceRouter } from "./routers/companyIntelligenceRouter";
import { pipelineRouter } from "./routers/pipelineRouter";
import { onboardingRouter } from "./routers/onboardingRouter";
import { acspFirmsRouter } from "./routers/acspFirmsRouter";
import { flowEngageRouter } from "./routers/flowEngageRouter";
import { companionRouter } from "./routers/companionRouter";
import { pushRouter } from "./routers/pushRouter";
import { featureFlagRouter } from "./routers/featureFlagRouter";
import { agentWorkQueueRouter } from "./routers/agentWorkQueueRouter";
import { optOutRouter } from "./routers/optOutRouter";
import { alertCheckoutRouter } from "./routers/alertCheckoutRouter";
import { referralRouter } from "./routers/referralRouter";
import { outboundRouter } from "./routers/outboundRouter";
import { outboundPublicRouter } from "./routers/outboundPublicRouter";
import { enrichmentRouter as outboundEnrichmentRouter } from "./routers/enrichmentRouter";
import { csvEnrichmentRouter } from "./routers/csvEnrichmentRouter";
import { deterministicRouter } from "./routers/deterministicRouter";
import { hmrcMtdRouter } from "./routers/hmrcMtdRouter";
import { chAdminRouter } from "./routers/chAdminRouter";
import { gdprRouter } from "./routers/gdprRouter";
import { chBulkImportRouter } from "./routers/chBulkImportRouter";
import { users } from "../drizzle/schema";

// ── Demo login rate limiter (in-memory, 5 calls/IP/minute) ────────────────────
const _demoRateMap = new Map<string, { count: number; resetAt: number }>();
// Cleanup expired entries every 5 minutes to prevent unbounded growth
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of _demoRateMap) {
    if (now > entry.resetAt) _demoRateMap.delete(key);
  }
}, 300_000);

function checkDemoRateLimit(ip: string): boolean {
  const now = Date.now();
  // Hard cap: reject if map grows beyond 10k entries (DoS protection)
  if (_demoRateMap.size > 10_000) {
    const oldest = _demoRateMap.keys().next().value;
    if (oldest) _demoRateMap.delete(oldest);
  }
  const entry = _demoRateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    _demoRateMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

/** Shared DB guard — throws TRPC error if database unavailable */
async function requireDb() {
  const dbInstance = await db.getDb();
  if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
  return dbInstance;
}

/** Shared admin guard — throws FORBIDDEN if user is not admin */
function requireAdmin(ctx: { user: { role: string } }) {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),

    /**
     * One-click demo login — issues a real signed session cookie for the
     * pre-seeded demo user (openId: demo_user_fineguard).  No OAuth required.
     */
    demoLogin: publicProcedure.mutation(async ({ ctx }) => {
      // Rate limit: 5 calls per IP per minute
      const ip = (ctx.req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim()
        ?? ctx.req.socket?.remoteAddress
        ?? 'unknown';
      if (!checkDemoRateLimit(ip)) {
        throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Too many demo login attempts. Please wait a minute.' });
      }

      const DEMO_OPEN_ID = "demo_user_fineguard";
      const DEMO_NAME    = "Demo User";
      // Ensure the demo user exists in the DB (idempotent upsert)
      await db.upsertUser({
        openId: DEMO_OPEN_ID,
        name: DEMO_NAME,
        email: "demo@fineguardpro.com",
        loginMethod: "demo",
        lastSignedIn: new Date(),
      });
      // Guarantee onboardingCompleted=true so the demo user goes straight to /dashboard
      const dbConn = await getDb();
      if (dbConn) {
        await dbConn.update(users)
          .set({ onboardingCompleted: true })
          .where(eq(users.openId, DEMO_OPEN_ID));
      }
      // Issue a real signed session cookie — same mechanism as OAuth callback
      const { sdk } = await import("./_core/sdk");
      const { ONE_YEAR_MS } = await import("@shared/const");
      const sessionToken = await sdk.createSessionToken(DEMO_OPEN_ID, {
        name: DEMO_NAME,
        expiresInMs: ONE_YEAR_MS,
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      return { success: true, redirectTo: "/dashboard" } as const;
    }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),

    completeOnboarding: protectedProcedure
      .input(z.object({
        /**
         * Optional guest email hint from the post-payment email CTA (?email=).
         * When provided and it matches ctx.user.email (case-insensitive),
         * guest-paid /check monitoring records are claimed for this user.
         */
        guestEmailHint: z.string().email().optional(),
        /**
         * Companies House number for the company the guest paid to monitor.
         * Required for the claim to resolve the correct companyId.
         */
        companyNumber: z.string().optional(),
      }).optional())
      .mutation(async ({ ctx, input }) => {
        // Always mark onboarding complete first
        await db.markOnboardingComplete(ctx.user.id);

        // Attempt guest record claim only when hint + companyNumber are provided
        // and the authenticated user email matches the guest hint (case-insensitive).
        let claimResult: { claimedAlertsCount: number; claimedCompaniesCount: number; claimPerformed: boolean } | null = null;
        if (input?.guestEmailHint && input?.companyNumber && ctx.user.email) {
          const userEmail = ctx.user.email.trim().toLowerCase();
          const hintEmail = input.guestEmailHint.trim().toLowerCase();
          if (userEmail === hintEmail) {
            try {
              claimResult = await db.claimGuestRecords(ctx.user.id, input.companyNumber);
            } catch (claimErr) {
              // Non-fatal: log and continue — onboarding completion must not be blocked
              console.warn("[completeOnboarding] claimGuestRecords failed:", claimErr);
            }
          } else {
            console.log(
              `[completeOnboarding] Email mismatch — no claim: user=${userEmail} hint=${hintEmail}`
            );
          }
        }

        return {
          success: true,
          ...(claimResult
            ? {
                claimedAlertsCount: claimResult.claimedAlertsCount,
                claimedCompaniesCount: claimResult.claimedCompaniesCount,
                claimPerformed: claimResult.claimPerformed,
              }
            : {}),
        };
      }),
    saveOnboardingDetails: protectedProcedure
      .input(z.object({
        contactName: z.string().min(1, 'Contact name is required'),
        companyName: z.string().min(1, 'Company name is required'),
        email: z.string().email('Valid email is required'),
        phone: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.saveOnboardingProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // Companies House integration
  companies: router({
    search: protectedProcedure
      .input(z.object({
        query: z.string().min(1),
        page: z.number().default(1),
        perPage: z.number().default(20),
      }))
      .query(async ({ input }) => {
        const result = await companiesHouseService.searchCompanies(
          input.query,
          input.page,
          input.perPage
        );
        return result;
      }),

    getProfile: protectedProcedure
      .input(z.object({
        companyNumber: z.string(),
      }))
      .query(async ({ input }) => {
        const profile = await companiesHouseService.getCompanyProfile(input.companyNumber);
        // Fire-and-forget: run deterministic compliance check in background.
        // Non-intrusive: errors are caught internally and written to execution_audits.
        import("./services/deterministicEngine").then(({ runDeterministicCheck }) => {
          runDeterministicCheck("company", input.companyNumber).catch(() => {
            // Silently swallow — never block the profile response
          });
        }).catch(() => {});
        return profile;
      }),

    getOfficers: protectedProcedure
      .input(z.object({
        companyNumber: z.string(),
      }))
      .query(async ({ input }) => {
        const officers = await companiesHouseService.getOfficers(input.companyNumber);
        return officers;
      }),

    getFilingHistory: protectedProcedure
      .input(z.object({
        companyNumber: z.string(),
        page: z.number().default(1),
        perPage: z.number().default(25),
      }))
      .query(async ({ input }) => {
        const history = await companiesHouseService.getFilingHistory(
          input.companyNumber,
          input.page,
          input.perPage
        );
        return history;
      }),

    addManually: protectedProcedure
      .input(z.object({
        companyNumber: z.string().length(8),
        companyName: z.string().min(3),
        address: z.string().optional(),
        incorporationDate: z.string().optional(),
        addToMonitoring: z.boolean().default(true),
      }))
      .mutation(async ({ input, ctx }) => {
        // Create company record
        const company = await db.upsertCompany({
          companyNumber: input.companyNumber,
          companyName: input.companyName,
          companyStatus: 'active',
          companyType: 'ltd',
          incorporationDate: input.incorporationDate || null,
          registeredOfficeAddress: input.address || null,
          accountsNextDue: null,
          confirmationStatementNextDue: null,
        });

        // Add to monitoring if requested
        if (input.addToMonitoring) {
          const isMonitored = await db.isCompanyMonitored(ctx.user.id, company.id);
          if (!isMonitored) {
            await db.addMonitoredCompany({
              userId: ctx.user.id,
              companyId: company.id,
            });
          }
        }

        return { success: true, companyId: company.id };
      }),

    monitored: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        const monitored = await db.getMonitoredCompaniesByUser(ctx.user.id);
        return monitored;
      }),
    }),

    exportPDF: protectedProcedure
      .input(z.object({
        companyNumber: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { generateComplianceReport } = await import('./services/pdfExport');

        // Get company data
        const company = await db.getCompanyByNumber(input.companyNumber);
        if (!company) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Company not found' });
        }

        // Get alerts for this company
        const alerts = await db.getAlertsByCompany(ctx.user.id, company.id);

        // Generate PDF
        const pdfBuffer = await generateComplianceReport({
          company,
          alerts,
        });

        // Return base64 encoded PDF
        return {
          pdf: pdfBuffer.toString('base64'),
          filename: `${company.companyName.replace(/[^a-z0-9]/gi, '_')}_compliance_report.pdf`,
        };
      }),

    enrichCompany: protectedProcedure
      .input(z.object({
        companyNumber: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { enrichCompanyData } = await import('./services/companyEnrichment');

        // Get company data
        const company = await db.getCompanyByNumber(input.companyNumber);
        if (!company) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Company not found' });
        }

        // Enrich company data
        const enrichmentData = await enrichCompanyData(
          company.companyNumber,
          company.companyName,
          company.registeredOfficeAddress || undefined
        );

        // Update company with enriched data
        await db.updateCompanyEnrichment(company.id, enrichmentData);

        return { success: true, enrichmentData };
      }),

    batchEnrich: protectedProcedure
      .input(z.object({
        companyNumbers: z.array(z.string()).max(50),
      }))
      .mutation(async ({ input }) => {
        const { batchEnrichCompanies } = await import('./services/companyEnrichment');

        // Get companies
        const companies = await Promise.all(
          input.companyNumbers.map(num => db.getCompanyByNumber(num))
        );

        const validCompanies = companies.filter(c => c !== null);
        if (validCompanies.length === 0) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'No valid companies found' });
        }

        // Batch enrich
        const enrichmentResults = await batchEnrichCompanies(
          validCompanies.map(c => ({
            companyNumber: c!.companyNumber,
            companyName: c!.companyName,
            address: c!.registeredOfficeAddress || undefined
          }))
        );

        // Update all companies
        for (const company of validCompanies) {
          const enrichmentData = enrichmentResults.get(company!.companyNumber);
          if (enrichmentData && Object.keys(enrichmentData).length > 0) {
            await db.updateCompanyEnrichment(company!.id, enrichmentData);
          }
        }

        return {
          success: true,
          enrichedCount: validCompanies.length,
          results: Array.from(enrichmentResults.entries()).map(([num, data]) => ({ companyNumber: num, ...data }))
        };
      }),

    // Public deadline checker — no auth required
    checkDeadlines: publicProcedure
      .input(z.object({ companyNumber: z.string().min(1).max(20) }))
      .query(async ({ input }) => {
        const cn = input.companyNumber.trim().toUpperCase();
        try {
          const profile = await companiesHouseService.getCompanyProfile(cn);
          if (!profile) return { found: false as const };
          const accountsDue = profile.accounts?.next_due ?? null;
          const confirmationDue = profile.confirmation_statement?.next_due ?? null;
          const now = new Date();
          const msPerDay = 86400000;
          const daysDiff = (dateStr: string | null) =>
            dateStr ? Math.ceil((new Date(dateStr).getTime() - now.getTime()) / msPerDay) : null;
          const accountsDays = daysDiff(accountsDue);
          const confirmationDays = daysDiff(confirmationDue);
          const toStatus = (days: number | null): "overdue" | "due_soon" | "upcoming" | "monitoring_available" => {
            if (days === null) return "monitoring_available";
            if (days < 0) return "overdue";
            if (days <= 30) return "due_soon";
            return "upcoming";
          };
          const formatDate = (dateStr: string | null): string | null => {
            if (!dateStr) return null;
            return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
          };
          const statuses = [toStatus(accountsDays), toStatus(confirmationDays)];
          const riskLevel: "low" | "medium" | "high" =
            statuses.includes("overdue") ? "high" :
            statuses.includes("due_soon") ? "medium" : "low";
          return {
            found: true as const,
            companyName: profile.company_name,
            companyNumber: profile.company_number,
            companyStatus: (
              profile.company_status === "active" ? "active" :
              profile.company_status === "dissolved" ? "dissolved" : "unknown"
            ) as "active" | "dissolved" | "unknown",
            riskLevel,
            accountsFilingDueDate: formatDate(accountsDue),
            accountsFilingStatus: toStatus(accountsDays),
            confirmationStatementDueDate: formatDate(confirmationDue),
            confirmationStatementStatus: toStatus(confirmationDays),
          };
        } catch (err) {
          // Distinguish between a genuine 404 (company doesn't exist) and a
          // transient network / TLS error so the frontend can show the right message.
          const msg = err instanceof Error ? err.message : String(err);
          const isNetworkError =
            msg.includes("socket disconnected") ||
            msg.includes("ECONNRESET") ||
            msg.includes("ECONNREFUSED") ||
            msg.includes("ETIMEDOUT") ||
            msg.includes("TLS") ||
            msg.includes("network") ||
            msg.includes("fetch failed");
          if (isNetworkError) {
            return { found: false as const, serviceUnavailable: true as const };
          }
          return { found: false as const, serviceUnavailable: false as const };
        }
      }),
  }),

  // Monitored companies
  monitored: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const monitored = await db.getMonitoredCompaniesByUser(ctx.user.id);
      return monitored;
    }),

    add: protectedProcedure
      .input(z.object({
        companyNumber: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        // ── Payment gate ────────────────────────────────────────────────────
        // Only allow portfolio activation when the user has a confirmed Stripe
        // subscription OR is an admin (admin bypass for internal/test use).
        // The Stripe webhook sets stripeSubscriptionId + subscriptionStatus='active'
        // after a successful checkout.session.completed event.
        // Existing monitored companies are never blocked — the isMonitored check
        // below returns early before any insert, so idempotency is preserved.
        const isAdmin = ctx.user.role === 'admin';
        const hasPaidSubscription =
          (ctx.user.subscriptionStatus === 'active' ||
           ctx.user.subscriptionStatus === 'trialing') ||
          ctx.user.stripeSubscriptionId != null;
        if (!isAdmin && !hasPaidSubscription) {
          throw new TRPCError({
            code: 'PAYMENT_REQUIRED',
            message:
              'A paid subscription is required to add companies to your monitored portfolio. ' +
              'Please complete payment at /check to activate monitoring.',
          });
        }
        // ── End payment gate ─────────────────────────────────────────────────

        // V1 provider: mock/real switch via COMPANIES_HOUSE_MODE env var
        const v1Profile = await v1GetCompanyProfile(input.companyNumber);
        if (!v1Profile) {
          throw new Error("Company not found");
        }

        const company = await db.upsertCompany({
          companyNumber: v1Profile.companyNumber,
          companyName: v1Profile.companyName,
          companyStatus: v1Profile.companyStatus,
          companyType: v1Profile.companyType,
          incorporationDate: v1Profile.incorporationDate,
          registeredOfficeAddress: v1Profile.registeredOfficeAddress,
          accountsNextDue: v1Profile.accountsNextDue,
          confirmationStatementNextDue: v1Profile.confirmationStatementNextDue,
        });

        const isMonitored = await db.isCompanyMonitored(ctx.user.id, company.id);
        if (isMonitored) {
          return { success: true, message: "Company already monitored" };
        }

        await db.addMonitoredCompany({
          userId: ctx.user.id,
          companyId: company.id,
        });

        // V1 rule engine: generate alerts deterministically
        await generateAlertsForCompanyV1(ctx.user.id, company);

        // V1 audit log
        await createAuditLogV1({
          userId: ctx.user.id,
          companyId: company.id,
          action: "monitoring_started",
          detail: `Started monitoring ${company.companyName} (${company.companyNumber})`,
        }).catch(() => {});

        // Publish event: company.monitored
        await publishEvent(
          "company.monitored",
          "company",
          company.companyNumber,
          {
            companyName: company.companyName,
            companyNumber: company.companyNumber,
            companyStatus: company.companyStatus,
            userId: ctx.user.id,
            userName: ctx.user.name,
            action: "added_to_monitoring",
          }
        );

        return { success: true, message: "Company added to monitoring", companyId: company.id };
      }),

    remove: protectedProcedure
      .input(z.object({
        companyNumber: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const company = await db.getCompanyByNumber(input.companyNumber);
        if (!company) {
          throw new Error("Company not found");
        }

        await db.removeMonitoredCompany(ctx.user.id, company.id);

        // Publish event: company removed from monitoring
        await publishEvent(
          "company.unmonitored",
          "company",
          company.companyNumber,
          {
            companyName: company.companyName,
            companyNumber: company.companyNumber,
            userId: ctx.user.id,
            action: "removed_from_monitoring",
          }
        );

        return { success: true, message: "Company removed from monitoring" };
      }),
  }),

  // Compliance alerts
  alerts: router({
    list: protectedProcedure
      .input(z.object({
        severity: z.enum(["critical", "warning", "info"]).optional(),
        unreadOnly: z.boolean().optional(),
        unresolvedOnly: z.boolean().optional(),
        includeSnoozed: z.boolean().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const alerts = await db.getAlertsByUser(ctx.user.id, input);
        return alerts;
      }),

    resolve: protectedProcedure
      .input(z.object({
        alertId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.resolveAlert(input.alertId);

        // V1 audit log
        await createAuditLogV1({
          userId: ctx.user.id,
          action: "alert_handled",
          detail: `Alert ${input.alertId} marked as handled`,
        }).catch(() => {});

        // Publish event: alert resolved
        await publishEvent(
          "alert.resolved",
          "alert",
          input.alertId.toString(),
          {
            alertId: input.alertId,
            resolvedBy: ctx.user.id,
            resolvedByName: ctx.user.name,
            action: "resolved",
          }
        );

        return { success: true };
      }),

    markRead: protectedProcedure
      .input(z.object({
        alertId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.markAlertAsRead(input.alertId);
        // Ops event: alert_clicked (user opened/read the alert)
        publishEvent("alert.clicked", "alert", String(input.alertId), {
          alertId: input.alertId,
          userId: ctx.user.id,
          action: "read",
        }).catch(() => {});
        return { success: true };
      }),
    snooze: protectedProcedure
      .input(z.object({
        alertId: z.number(),
        snoozeUntil: z.string(), // ISO date string
      }))
      .mutation(async ({ input }) => {
        await db.snoozeAlert(input.alertId, new Date(input.snoozeUntil));
        return { success: true };
      }),

    bulkResolve: protectedProcedure
      .input(z.object({
        alertIds: z.array(z.number()),
      }))
      .mutation(async ({ input }) => {
        for (const alertId of input.alertIds) {
          await db.resolveAlert(alertId);
        }
        return { success: true, count: input.alertIds.length };
      }),

    bulkSnooze: protectedProcedure
      .input(z.object({
        alertIds: z.array(z.number()),
        snoozeUntil: z.string(), // ISO date string
      }))
      .mutation(async ({ input }) => {
        const snoozeDate = new Date(input.snoozeUntil);
        for (const alertId of input.alertIds) {
          await db.snoozeAlert(alertId, snoozeDate);
        }
        return { success: true, count: input.alertIds.length };
      }),

    bulkDelete: protectedProcedure
      .input(z.object({
        alertIds: z.array(z.number()),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");

        for (const alertId of input.alertIds) {
          await dbInstance
            .delete(db.complianceAlerts)
            .where(eq(db.complianceAlerts.id, alertId));
        }
        return { success: true, count: input.alertIds.length };
      }),
  }),

  // Bulk import
  bulkImport: router({
    uploadCSV: protectedProcedure
      .input(
        z.object({
          csvData: z.string(), // CSV content as string
        })
      )
      .mutation(async ({ input, ctx }) => {
        const lines = input.csvData.split("\n").filter((line) => line.trim());
        if (lines.length === 0) {
          throw new Error("CSV file is empty");
        }

        // Skip header row
        const dataLines = lines.slice(1);
        const results = {
          total: dataLines.length,
          successful: 0,
          failed: 0,
          errors: [] as Array<{ row: number; companyNumber: string; error: string }>,
        };

        for (let i = 0; i < dataLines.length; i++) {
          const line = dataLines[i];
          const columns = line.split(",").map((col) => col.trim().replace(/"/g, ""));
          const companyNumber = columns[0];

          if (!companyNumber) {
            results.failed++;
            results.errors.push({
              row: i + 2, // +2 because of header and 0-index
              companyNumber: "",
              error: "Missing company number",
            });
            continue;
          }

          try {
            // V1 provider: mock/real switch
            const v1Prof = await v1GetCompanyProfile(companyNumber);
            if (!v1Prof) {
              results.failed++;
              results.errors.push({
                row: i + 2,
                companyNumber,
                error: "Company not found",
              });
              continue;
            }

            const company = await db.upsertCompany({
              companyNumber: v1Prof.companyNumber,
              companyName: v1Prof.companyName,
              companyStatus: v1Prof.companyStatus,
              companyType: v1Prof.companyType,
              incorporationDate: v1Prof.incorporationDate,
              registeredOfficeAddress: v1Prof.registeredOfficeAddress,
              accountsNextDue: v1Prof.accountsNextDue,
              confirmationStatementNextDue: v1Prof.confirmationStatementNextDue,
            });

            const isMonitored = await db.isCompanyMonitored(ctx.user.id, company.id);
            if (!isMonitored) {
              await db.addMonitoredCompany({
                userId: ctx.user.id,
                companyId: company.id,
              });
              // V1 rule engine
              await generateAlertsForCompanyV1(ctx.user.id, company);
            }

            results.successful++;
          } catch (error: any) {
            results.failed++;
            results.errors.push({
              row: i + 2,
              companyNumber,
              error: error.message || "Unknown error",
            });
          }
        }

        return results;
      }),
  }),

  // Notification preferences
  notifications: router({
    getPreferences: protectedProcedure.query(async ({ ctx }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return null;

      const prefs = await dbInstance
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, ctx.user.id))
        .limit(1);

      return prefs[0] || null;
    }),
    updatePreferences: protectedProcedure
      .input(
        z.object({
          emailEnabled: z.boolean().optional(),
          emailFrequency: z.enum(["immediate", "daily", "weekly"]).optional(),
          criticalAlertsEnabled: z.boolean().optional(),
          warningAlertsEnabled: z.boolean().optional(),
          infoAlertsEnabled: z.boolean().optional(),
          dailyDigestTime: z.string().optional(),
          whatsappEnabled: z.boolean().optional(),
          whatsappNumber: z.string().optional(),
          pushEnabled: z.boolean().optional(),
          smsEnabled: z.boolean().optional(),
          smsNumber: z.string().optional(),
          autoNotifyEnabled: z.boolean().optional(),
          autoNotifyDaysBefore: z.number().min(1).max(365).optional(),
          autoNotifyCriticalOnly: z.boolean().optional(),
          autoNotifyFrequency: z.enum(["daily", "weekly", "biweekly"]).optional(),
          excludedCompanyIds: z.array(z.number()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");

        // Check if preferences exist
        const existing = await dbInstance
          .select()
          .from(notificationPreferences)
          .where(eq(notificationPreferences.userId, ctx.user.id))
          .limit(1);

        if (existing.length > 0) {
          // Update existing
          await dbInstance
            .update(notificationPreferences)
            .set(input)
            .where(eq(notificationPreferences.userId, ctx.user.id));
        } else {
          // Create new
          await dbInstance.insert(notificationPreferences).values({
            userId: ctx.user.id,
            ...input,
          });
        }

        return { success: true };
      }),

    sendTestNotification: protectedProcedure
      .input(z.object({ channel: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const channel = input.channel.toLowerCase();
        if (channel === 'email') {
          const { notifyOwner } = await import("./_core/notification");
          await notifyOwner({
            title: "FineGuard Test Email",
            content: `Test email notification sent to ${ctx.user.email || ctx.user.name} at ${new Date().toLocaleString()}`,
          });
        }
        return { success: true };
      }),

    sendTestEmail: protectedProcedure.mutation(async ({ ctx }) => {
      const { notifyOwner } = await import("./_core/notification");
      await notifyOwner({
        title: "FineGuard Test Email",
        content: `Test email notification sent to ${ctx.user.email || ctx.user.name} at ${new Date().toLocaleString()}`,
      });
      return { success: true };
    }),

    sendTestWhatsApp: protectedProcedure
      .input(z.object({ phoneNumber: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { sendWhatsAppNotification } = await import("./services/whatsapp");
        const message = `🧪 FineGuard Test Message\n\nThis is a test WhatsApp notification from FineGuard Pro.\nSent at ${new Date().toLocaleString()}`;
        await sendWhatsAppNotification(input.phoneNumber, message);
        return { success: true };
      }),

    sendTestPush: protectedProcedure.mutation(async () => {
      // Push notifications are client-side, so just return success
      return { success: true };
    }),

    sendTestSMS: protectedProcedure
      .input(
        z.object({
          phoneNumber: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const { smsService } = await import("./services/sms");
        const success = await smsService.sendTestSMS(input.phoneNumber);
        return { success };
      }),

    // Notification history
    getHistory: protectedProcedure
      .input(
        z.object({
          channel: z.enum(["email", "whatsapp", "sms", "push"]).optional(),
          status: z.enum(["sent", "failed", "pending"]).optional(),
          limit: z.number().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        const { notificationLogger } = await import("./services/notificationLogger");
        return notificationLogger.getNotificationLogs(ctx.user.id, input);
      }),
  }),

  // Client management (Agency only)
  clients: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "agency") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Agency access required" });
      }
      return db.getClientsByAgency(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          companyName: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "agency") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Agency access required" });
        }
        return db.createClient({
          agencyId: ctx.user.id,
          ...input,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          clientId: z.number(),
          name: z.string().min(1).optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          companyName: z.string().optional(),
          notes: z.string().optional(),
          status: z.enum(["active", "inactive"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "agency") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Agency access required" });
        }
        const { clientId, ...updates } = input;
        return db.updateClient(clientId, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "agency") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Agency access required" });
        }
        return db.deleteClient(input.clientId);
      }),

    assignCompany: protectedProcedure
      .input(
        z.object({
          clientId: z.number(),
          companyId: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "agency") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Agency access required" });
        }
        return db.assignCompanyToClient(input.clientId, input.companyId);
      }),

    unassignCompany: protectedProcedure
      .input(
        z.object({
          clientId: z.number(),
          companyId: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "agency") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Agency access required" });
        }
        return db.unassignCompanyFromClient(input.clientId, input.companyId);
      }),

    getCompanies: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "agency") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Agency access required" });
        }
        return db.getClientCompanies(input.clientId);
      }),
  }),

  // Report generation
  reports: router({
    generate: protectedProcedure
      .input(z.object({
        reportType: z.enum(["compliance_summary", "alert_history", "company_status"]),
        startDate: z.string(),
        endDate: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { generateAndEmailReport } = await import("./services/reportGeneration");

        // Fetch data for report
        const companies = await db.getMonitoredCompaniesByUser(ctx.user.id);
        const alerts = await db.getAlertsByUser(ctx.user.id, {});
        const alertStats = await db.getAlertStats(ctx.user.id);

        const reportData = {
          user: ctx.user,
          reportType: input.reportType,
          dateRange: {
            start: new Date(input.startDate),
            end: new Date(input.endDate),
          },
          companies: companies.map(mc => ({
            companyNumber: mc.company.companyNumber,
            companyName: mc.company.companyName || mc.company.companyNumber,
            status: mc.company.companyStatus || "active",
            alertCount: 0, // Alert count available via separate query if needed
          })),
          alerts: alerts.slice(0, 50).map(a => ({
            type: a.alertType,
            severity: a.severity,
            message: a.description || "",
            dueDate: a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "N/A",
            companyName: "Company", // Company name available via separate query if needed
          })),
          summary: {
            totalCompanies: companies.length,
            totalAlerts: alertStats.total,
            criticalAlerts: alertStats.critical,
            warningAlerts: alertStats.warning,
            infoAlerts: alertStats.info,
          },
        };

        const result = await generateAndEmailReport(reportData);
        return result;
      }),
  }),

  // Dashboard statistics
  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      const monitored = await db.getMonitoredCompaniesByUser(ctx.user.id);
      const alertStats = await db.getAlertStats(ctx.user.id);

      return {
        monitoredCompanies: monitored.length,
        alerts: alertStats,
      };
    }),

    upcomingDeadlines: protectedProcedure
      .input(z.object({
        month: z.number().min(1).max(12),
        year: z.number().min(2000),
      }))
      .query(async ({ input, ctx }) => {
        const alerts = await db.getAlertsByUser(ctx.user.id, { unresolvedOnly: true });
        return alerts.filter(alert => {
          if (!alert.dueDate) return false;
          const dueDate = new Date(alert.dueDate);
          return dueDate.getMonth() === input.month - 1 && dueDate.getFullYear() === input.year;
        }).map((alert: any) => ({
          id: alert.id,
          title: alert.title,
          severity: alert.severity,
          dueDate: alert.dueDate,
          companyName: alert.company?.companyName || 'Unknown',
          daysUntil: Math.ceil((new Date(alert.dueDate || new Date()).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        }));
      }),

    // My Alerts — all alerts for the current user, grouped by company on the frontend
    myAlerts: protectedProcedure.query(async ({ ctx }) => {
      const alerts = await db.getAlertsByUser(ctx.user.id, { unresolvedOnly: false });
      return alerts.map((a: any) => ({
        id: a.id as number,
        alertType: a.alertType as string,
        severity: a.severity as string,
        title: a.title as string,
        description: a.description as string | null,
        isRead: a.isRead as boolean,
        isResolved: a.isResolved as boolean,
        createdAt: a.createdAt as number | null,
        dueDate: a.dueDate as string | null,
        companyId: a.companyId as number | null,
        companyName: (a.company?.companyName ?? null) as string | null,
        companyNumber: (a.company?.companyNumber ?? null) as string | null,
      }));
    }),
  }),

  // Export functionality
  export: router({
    filingHistory: protectedProcedure
      .input(z.object({
        companyNumber: z.string(),
        companyName: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { exportService } = await import('./services/export');
        const filings = await companiesHouseService.getFilingHistory(input.companyNumber);

        const buffer = await exportService.exportFilingHistoryToExcel(
          input.companyName,
          input.companyNumber,
          filings.items
        );

        return {
          data: buffer.toString('base64'),
          filename: `filing-history-${input.companyNumber}-${Date.now()}.xlsx`,
        };
      }),

    alerts: protectedProcedure.mutation(async ({ ctx }) => {
      const { exportService } = await import('./services/export');
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      const alerts = await db.getAlertsByUser(ctx.user.id, { unresolvedOnly: false });
      const { companyContacts } = await import('../drizzle/schema');

      const alertsWithContacts = await Promise.all(
        alerts.map(async (alert) => {
          const contacts = alert.companyId
            ? await dbInstance.select().from(companyContacts).where(eq(companyContacts.companyId, alert.companyId))
            : [];
          return { ...alert, contacts };
        })
      );

      const buffer = await exportService.exportAlertsToExcel(
        ctx.user.name || ctx.user.email || 'User',
        alertsWithContacts
      );

      return {
        data: buffer.toString('base64'),
        filename: `compliance-alerts-${Date.now()}.xlsx`,
      };
    }),

    complianceReport: protectedProcedure
      .input(z.object({
        companyNumber: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { exportService } = await import('./services/export');

        // Fetch all company data
        const [profile, officers, filings] = await Promise.all([
          companiesHouseService.getCompanyProfile(input.companyNumber),
          companiesHouseService.getOfficers(input.companyNumber),
          companiesHouseService.getFilingHistory(input.companyNumber),
        ]);

        if (!profile) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Company not found' });
        }

        // Get alerts for this company
        const allAlerts = await db.getAlertsByUser(ctx.user.id, { unresolvedOnly: false });
        const companyAlerts = allAlerts.filter(a =>
          a.company?.companyName?.includes(profile.company_name) ||
          a.description?.includes(input.companyNumber)
        );

        const buffer = await exportService.exportComplianceReportToExcel(
          profile.company_name,
          profile.company_number,
          {
            status: profile.company_status,
            type: profile.company_type,
            incorporationDate: profile.date_of_creation,
            nextAccountsDue: profile.accounts?.next_due,
            nextConfirmationDue: profile.confirmation_statement?.next_due,
          },
          officers,
          companyAlerts
        );

        return {
          data: buffer.toString('base64'),
          filename: `compliance-report-${input.companyNumber}-${Date.now()}.xlsx`,
        };
      }),
  }),

  // Admin Dashboard
  admin: router({
    getSystemStats: protectedProcedure.query(async ({ ctx }) => {
      requireAdmin(ctx);
      const dbInstance = await requireDb();

      const [users, companies, alerts, notifPrefs, activePushSubs] = await Promise.all([
        dbInstance.select().from(db.users),
        dbInstance.select().from(db.companies),
        dbInstance.select().from(db.complianceAlerts),
        dbInstance.select().from(notificationPreferences),
        dbInstance
          .select({ id: pushSubscriptions.id })
          .from(pushSubscriptions)
          .where(eq(pushSubscriptions.isActive, true)),
      ]);

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const activeUsers = users.filter(u => new Date(u.lastSignedIn) > thirtyDaysAgo).length;

      const criticalAlerts = alerts.filter(a => a.severity === "critical" && !a.isResolved).length;
      const warningAlerts = alerts.filter(a => a.severity === "warning" && !a.isResolved).length;
      const infoAlerts = alerts.filter(a => a.severity === "info" && !a.isResolved).length;

      return {
        totalUsers: users.length,
        activeUsers,
        totalCompanies: companies.length,
        totalAlerts: alerts.filter(a => !a.isResolved).length,
        criticalAlerts,
        warningAlerts,
        infoAlerts,
        emailEnabledUsers: notifPrefs.filter(p => p.emailEnabled).length,
        whatsappEnabledUsers: notifPrefs.filter(p => p.whatsappEnabled).length,
        smsEnabledUsers: notifPrefs.filter(p => p.smsEnabled).length,
        pushEnabledUsers: notifPrefs.filter(p => p.pushEnabled).length,
        activePushSubscribers: activePushSubs.length,
      };
    }),

    getAllUsers: protectedProcedure.query(async ({ ctx }) => {
      requireAdmin(ctx);
      const dbInstance = await requireDb();

      return dbInstance.select().from(db.users).orderBy(db.users.lastSignedIn);
    }),

    getClients: protectedProcedure
      .input(z.object({
        search: z.string().optional(),
        status: z.enum(['all', 'active', 'inactive']).default('all'),
      }))
      .query(async ({ ctx, input }) => {
        requireAdmin(ctx);
        const dbInstance = await requireDb();

        const { monitoredCompanies } = await import("../drizzle/schema");

        const usersWithCounts = await dbInstance
          .select({
            user: db.users,
            companyCount: sql<number>`COUNT(${monitoredCompanies.companyId})`,
          })
          .from(db.users)
          .leftJoin(monitoredCompanies, eq(monitoredCompanies.userId, db.users.id))
          .groupBy(db.users.id)
          .orderBy(db.users.lastSignedIn);

        return usersWithCounts.map(row => ({
          ...row.user,
          companyCount: Number(row.companyCount),
          status: Number(row.companyCount) > 0 ? 'active' : 'inactive',
        }));
      }),

    getCRMStats: protectedProcedure.query(async ({ ctx }) => {
      requireAdmin(ctx);
      const dbInstance = await requireDb();

      const [users, companies, alerts] = await Promise.all([
        dbInstance.select().from(db.users),
        dbInstance.select().from(db.companies),
        dbInstance.select().from(db.complianceAlerts),
      ]);

      const activeAlerts = alerts.filter((a: any) => !a.isResolved).length;
      const complianceRate = companies.length > 0 ? 75 : 0;

      return {
        totalClients: users.length,
        monitoredCompanies: companies.length,
        activeAlerts,
        complianceRate,
      };
    }),

    getRecentAlerts: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ ctx, input }) => {
        requireAdmin(ctx);
        const dbInstance = await requireDb();

        const alertsWithUsers = await dbInstance
          .select({
            alert: db.complianceAlerts,
            user: db.users,
          })
          .from(db.complianceAlerts)
          .leftJoin(db.users, eq(db.complianceAlerts.userId, db.users.id))
          .orderBy(db.complianceAlerts.createdAt)
          .limit(input.limit);

        return alertsWithUsers.map(row => ({
          ...row.alert,
          user: row.user || null,
        }));
      }),
    grantAgentAccess: protectedProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ ctx, input }) => {
        requireAdmin(ctx);
        const dbInstance = await requireDb();
        const [target] = await dbInstance
          .select({ id: db.users.id, role: db.users.role })
          .from(db.users)
          .where(eq(db.users.email, input.email.toLowerCase().trim()))
          .limit(1);
        if (!target) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }
        await dbInstance
          .update(db.users)
          .set({ role: "agent" })
          .where(eq(db.users.id, target.id));
        console.log(`[Admin] ${ctx.user.email} granted agent access to ${input.email}`);
        return { success: true };
      }),

    bulkImport: protectedProcedure
      .input(z.object({
        companyNumbers: z.array(z.string()),
      }))
      .mutation(async ({ ctx, input }) => {
        requireAdmin(ctx);

        // Normalise & dedupe within the file
        const UK_COMPANY_RE = /^[A-Z0-9]{2}\d{6}$|^\d{8}$/;
        const seen = new Set<string>();
        const valid: string[] = [];
        const invalid: string[] = [];

        for (const raw of input.companyNumbers) {
          const cn = raw.trim().toUpperCase().padStart(8, "0");
          if (!UK_COMPANY_RE.test(cn)) {
            invalid.push(raw.trim());
            continue;
          }
          if (seen.has(cn)) continue;
          seen.add(cn);
          valid.push(cn);
        }

        let imported = 0;
        let alreadyMonitored = 0;
        let failed = 0;
        const failedSamples: string[] = [];

        for (const cn of valid) {
          try {
            const v1Profile = await v1GetCompanyProfile(cn);
            if (!v1Profile) {
              failed++;
              if (failedSamples.length < 5) failedSamples.push(cn);
              continue;
            }
            const company = await db.upsertCompany({
              companyNumber: v1Profile.companyNumber,
              companyName: v1Profile.companyName,
              companyStatus: v1Profile.companyStatus,
              companyType: v1Profile.companyType,
              incorporationDate: v1Profile.incorporationDate,
              registeredOfficeAddress: v1Profile.registeredOfficeAddress,
              accountsNextDue: v1Profile.accountsNextDue,
              confirmationStatementNextDue: v1Profile.confirmationStatementNextDue,
            });
            const isMonitored = await db.isCompanyMonitored(ctx.user.id, company.id);
            if (isMonitored) {
              alreadyMonitored++;
              continue;
            }
            await db.addMonitoredCompany({ userId: ctx.user.id, companyId: company.id });
            await generateAlertsForCompanyV1(ctx.user.id, company);
            imported++;
          } catch {
            failed++;
            if (failedSamples.length < 5) failedSamples.push(cn);
          }
        }

        await createAuditLogV1({
          userId: ctx.user.id,
          // companyId omitted — bulk import is a system-level action
          action: "bulk_import",
          detail: `Bulk import: ${imported} imported, ${alreadyMonitored} already monitored, ${invalid.length} invalid rows, ${failed} failed`,
        }).catch(() => {});

        console.log(`[Admin] ${ctx.user.email} bulk import: ${imported} imported, ${alreadyMonitored} already monitored, ${invalid.length} invalid, ${failed} failed`);

        return {
          imported,
          alreadyMonitored,
          invalid: invalid.length,
          invalidSamples: invalid.slice(0, 5),
          failed,
          failedSamples,
          total: input.companyNumbers.length,
        };
      }),
    /**
     * Phase 3: 6 overview growth metrics for the AdminDashboard.
     * Returns today's checks, payments, leads, total/referral revenue, and alerts sent.
     */
    getGrowthOverview: protectedProcedure.query(async ({ ctx }) => {
      requireAdmin(ctx);
      const dbInstance = await getDb();
      if (!dbInstance) return { checksToday: 0, paymentsToday: 0, leadsToday: 0, totalRevenue: 0, referralRevenue: 0, alertsSent: 0 };

      const { sql } = await import("drizzle-orm");
      const { checkEvents, outboundAlerts } = await import("../drizzle/schema");

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [checksRows, paymentsRows, leadsRows, outboundRows] = await Promise.all([
        // Checks today (from check_events)
        dbInstance.select({ count: sql<number>`COUNT(*)` }).from(checkEvents)
          .where(sql`${checkEvents.createdAt} >= ${todayStart}`),
        // Payments today (Stripe sessions from users created today)
        dbInstance.select({ count: sql<number>`COUNT(*)` }).from(db.users)
          .where(sql`${db.users.createdAt} >= ${todayStart} AND ${db.users.stripeSubscriptionId} IS NOT NULL`),
        // Leads today (new users registered today)
        dbInstance.select({ count: sql<number>`COUNT(*)` }).from(db.users)
          .where(sql`${db.users.createdAt} >= ${todayStart}`),
        // Outbound alerts sent today
        dbInstance.select({ count: sql<number>`COUNT(*)` }).from(outboundAlerts)
          .where(sql`${outboundAlerts.status} IN ('sent','delivered') AND ${outboundAlerts.queuedAt} >= ${todayStart.getTime()}`),
      ]);

      return {
        checksToday: Number(checksRows[0]?.count ?? 0),
        paymentsToday: Number(paymentsRows[0]?.count ?? 0),
        leadsToday: Number(leadsRows[0]?.count ?? 0),
        totalRevenue: 0,    // Stripe webhook aggregation — placeholder
        referralRevenue: 0, // Referral tracking — placeholder
        alertsSent: Number(outboundRows[0]?.count ?? 0),
      };
    }),

    /**
     * Phase 3: Outbound alerts table for the AdminDashboard Alerts section.
     */
    getOutboundAlerts: protectedProcedure
      .input(z.object({ limit: z.number().default(20), status: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        requireAdmin(ctx);
        const dbInstance = await getDb();
        if (!dbInstance) return [];

        const { outboundAlerts } = await import("../drizzle/schema");
        const { desc: descOrd } = await import("drizzle-orm");

        return dbInstance
          .select()
          .from(outboundAlerts)
          .orderBy(descOrd(outboundAlerts.queuedAt))
          .limit(input.limit);
      }),

    getImportHistory: protectedProcedure.query(async ({ ctx }) => {
      requireAdmin(ctx);
      const dbInstanceRaw = await getDb();
      if (!dbInstanceRaw) return [];
      const dbInstance = dbInstanceRaw;
      const { desc: descOrd } = await import("drizzle-orm");
      const { auditLogs: auditLogsTable } = await import("../drizzle/schema");
      const rows = await dbInstance
        .select({
          id: auditLogsTable.id,
          details: auditLogsTable.details,
          createdAt: auditLogsTable.createdAt,
          userId: auditLogsTable.userId,
          userEmail: db.users.email,
        })
        .from(auditLogsTable)
        .leftJoin(db.users, eq(auditLogsTable.userId, db.users.id))
        .where(eq(auditLogsTable.action, "bulk_import"))
        .orderBy(descOrd(auditLogsTable.createdAt))
        .limit(5);
      return rows.map((r) => {
        const detail = r.details ?? "";
        const match = detail.match(/(\d+) imported,\s*(\d+) already monitored,\s*(\d+) invalid rows,\s*(\d+) failed/);
        return {
          id: r.id,
          createdAt: r.createdAt,
          userEmail: r.userEmail ?? null,
          imported: match ? parseInt(match[1], 10) : 0,
          alreadyMonitored: match ? parseInt(match[2], 10) : 0,
          invalid: match ? parseInt(match[3], 10) : 0,
          failed: match ? parseInt(match[4], 10) : 0,
        };
      });
    }),
  }),
  // Background Jobs Management
  jobs: router({
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      requireAdmin(ctx);

      const { backgroundScheduler } = await import('./services/scheduler');

      return {
        isRunning: true, // Scheduler auto-starts with server
        jobs: [
          { name: 'daily-sync', schedule: '0 2 * * *', description: 'Sync all companies with Companies House' },
          { name: 'hourly-alerts', schedule: '0 * * * *', description: 'Check and send alert notifications' },
          { name: 'daily-digest', schedule: '0 9 * * *', description: 'Send daily digest emails' },
        ],
      };
    }),

    triggerSync: protectedProcedure.mutation(async ({ ctx }) => {
      requireAdmin(ctx);

      const { backgroundScheduler } = await import('./services/scheduler');

      try {
        // Trigger sync manually
        await (backgroundScheduler as any).syncAllCompanies();
        return { success: true, message: 'Company sync completed successfully' };
      } catch (error) {
        console.error('[Jobs] Manual sync failed:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Sync failed' });
      }
    }),

    triggerAlertCheck: protectedProcedure.mutation(async ({ ctx }) => {
      requireAdmin(ctx);

      try {
        // V1 alert sweep: deterministic, idempotent
        const stats = await runV1AlertSweep();
        return {
          success: true,
          message: `V1 alert sweep completed: ${stats.companiesChecked} companies checked, ${stats.alertsCreated} alerts created`,
          stats,
        };
      } catch (error) {
        console.error('[Jobs] V1 alert sweep failed:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Alert sweep failed' });
      }
    }),

    /** Get the last alert sweep completion timestamp */
    getSweepStatus: protectedProcedure.query(async ({ ctx }) => {
      requireAdmin(ctx);
      const lastSweptAt = await getLastSweptAt();
      return { lastSweptAt };
    }),

    /** Get the current Companies House provider mode (mock | real) */
    getProviderMode: protectedProcedure.query(({ ctx }) => {
      requireAdmin(ctx);
      return { mode: getV1ProviderMode() };
    }),

    /** Set the Companies House provider mode at runtime (admin-only) */
    setProviderMode: protectedProcedure
      .input(z.object({ mode: z.enum(["mock", "real"]) }))
      .mutation(({ ctx, input }) => {
        requireAdmin(ctx);
        setV1ProviderMode(input.mode);
        console.log(`[Admin] Companies House provider mode set to: ${input.mode}`);
        return { success: true, mode: input.mode };
      }),

    triggerDigest: protectedProcedure.mutation(async ({ ctx }) => {
      requireAdmin(ctx);

      const { backgroundScheduler } = await import('./services/scheduler');

      try {
        await (backgroundScheduler as any).sendDailyDigests();
        return { success: true, message: 'Daily digest sent successfully' };
      } catch (error) {
        console.error('[Jobs] Manual digest failed:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Digest failed' });
      }
    }),
  }),
  // White-label branding
  clientPortal: clientPortalRouter,

  whiteLabel: router({
    getConfig: protectedProcedure.query(async ({ ctx }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return null;

      const config = await dbInstance
        .select()
        .from(db.whiteLabelConfigs)
        .where(eq(db.whiteLabelConfigs.userId, ctx.user.id))
        .limit(1);

      return config[0] || null;
    }),

    updateConfig: protectedProcedure
      .input(
        z.object({
          brandName: z.string().min(1),
          brandVersion: z.enum(["version_a", "version_b", "version_c"]),
          logoUrl: z.string().optional(),
          primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
          secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
          accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
          companyName: z.string().optional(),
          contactEmail: z.string().email().optional(),
          contactPhone: z.string().optional(),
          footerText: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");

        // Check if config exists
        const existing = await dbInstance
          .select()
          .from(db.whiteLabelConfigs)
          .where(eq(db.whiteLabelConfigs.userId, ctx.user.id))
          .limit(1);

        if (existing.length > 0) {
          // Update existing config
          await dbInstance
            .update(db.whiteLabelConfigs)
            .set({
              ...input,
              updatedAt: new Date(),
            })
            .where(eq(db.whiteLabelConfigs.userId, ctx.user.id));
        } else {
          // Create new config
          await dbInstance.insert(db.whiteLabelConfigs).values({
            userId: ctx.user.id,
            ...input,
          });
        }

        return { success: true };
      }),

    deleteConfig: protectedProcedure.mutation(async ({ ctx }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new Error("Database not available");

      await dbInstance
        .delete(db.whiteLabelConfigs)
        .where(eq(db.whiteLabelConfigs.userId, ctx.user.id));

      return { success: true };
    }),

    getTheme: protectedProcedure.query(async ({ ctx }) => {
      const { getUserBranding, getFrontendTheme } = await import('./services/whiteLabelTemplates');
      const branding = await getUserBranding(ctx.user.id);
      return getFrontendTheme(branding);
    }),
  }),

  /**
   * ACSP Leads Management Router
   */
  acspLeads: router({
    // List all ACSP leads with filtering
    list: protectedProcedure
      .input(
        z.object({
          status: z.enum(["prospect", "contacted", "qualified", "proposal", "negotiation", "won", "lost"]).optional(),
          minScore: z.number().min(0).max(100).optional(),
        }).optional()
      )
      .query(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");

        const { acspLeads, companies } = await import("../drizzle/schema");
        const { eq, and, gte } = await import("drizzle-orm");

        let query = dbInstance
          .select({
            lead: acspLeads,
            company: companies,
          })
          .from(acspLeads)
          .leftJoin(companies, eq(acspLeads.companyId, companies.id));

        // Apply filters if provided
        const conditions = [];
        if (input?.status) {
          conditions.push(eq(acspLeads.status, input.status));
        }
        if (input?.minScore !== undefined) {
          conditions.push(gte(acspLeads.leadScore, input.minScore));
        }

        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }

        const results = await query;
        return results;
      }),

    // Get single lead with full details
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");

        const { acspLeads, companies, salesActivities } = await import("../drizzle/schema");
        const { eq, desc } = await import("drizzle-orm");

        const leadData = await dbInstance
          .select({
            lead: acspLeads,
            company: companies,
          })
          .from(acspLeads)
          .leftJoin(companies, eq(acspLeads.companyId, companies.id))
          .where(eq(acspLeads.id, input.id))
          .limit(1);

        if (!leadData || leadData.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Lead not found" });
        }

        // Get sales activities for this lead
        const activities = await dbInstance
          .select()
          .from(salesActivities)
          .where(eq(salesActivities.leadId, input.id))
          .orderBy(desc(salesActivities.createdAt));

        return {
          ...leadData[0],
          activities,
        };
      }),

    // Create new ACSP lead
    create: protectedProcedure
      .input(
        z.object({
          companyId: z.number(),
          contactName: z.string().optional(),
          contactEmail: z.string().email().optional(),
          contactPhone: z.string().optional(),
          companySize: z.enum(["small", "medium", "large"]).optional(),
          estimatedClientCount: z.number().optional(),
          estimatedMonthlyRevenue: z.string().optional(),
          supervisoryBody: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");

        const { acspLeads } = await import("../drizzle/schema");

        const result = await dbInstance.insert(acspLeads).values({
          ...input,
          status: "prospect",
          leadScore: 0,
        });

        const leadId = Number((result as any).insertId);

        // Calculate initial lead score
        const { updateLeadScore, scheduleNextFollowUp } = await import("./services/acspLeadManagement");
        await updateLeadScore(leadId);
        await scheduleNextFollowUp(leadId);

        return { id: leadId, success: true };
      }),

    // Update lead
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          contactName: z.string().optional(),
          contactEmail: z.string().email().optional(),
          contactPhone: z.string().optional(),
          companySize: z.enum(["small", "medium", "large"]).optional(),
          estimatedClientCount: z.number().optional(),
          estimatedMonthlyRevenue: z.string().optional(),
          supervisoryBody: z.string().optional(),
          notes: z.string().optional(),
          status: z.enum(["prospect", "contacted", "qualified", "proposal", "negotiation", "won", "lost"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");

        const { acspLeads } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const { id, ...updateData } = input;

        await dbInstance
          .update(acspLeads)
          .set({ ...updateData, updatedAt: new Date() })
          .where(eq(acspLeads.id, id));

        // Recalculate lead score after update
        const { updateLeadScore } = await import("./services/acspLeadManagement");
        await updateLeadScore(id);

        return { success: true };
      }),

    // Add sales activity
    addActivity: protectedProcedure
      .input(
        z.object({
          leadId: z.number(),
          activityType: z.enum(["call", "email", "meeting", "demo", "proposal_sent", "follow_up", "note"]),
          subject: z.string(),
          notes: z.string().optional(),
          outcome: z.enum(["positive", "neutral", "negative", "no_response"]).optional(),
          nextAction: z.string().optional(),
          scheduledFor: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new Error("Database not available");

        const { salesActivities, acspLeads } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");

        // Insert activity
        await dbInstance.insert(salesActivities).values({
          ...input,
          scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : undefined,
          completedAt: new Date(),
          createdBy: ctx.user.id,
        });

        // Update last contacted timestamp
        await dbInstance
          .update(acspLeads)
          .set({ lastContactedAt: new Date() })
          .where(eq(acspLeads.id, input.leadId));

        // Recalculate score and auto-progress lead
        const { updateLeadScore, autoProgressLead, scheduleNextFollowUp } = await import(
          "./services/acspLeadManagement"
        );
        await updateLeadScore(input.leadId);
        await autoProgressLead(input.leadId);
        await scheduleNextFollowUp(input.leadId);

        return { success: true };
      }),

    // Convert lead to client
    convertToClient: protectedProcedure
      .input(z.object({ leadId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { convertLeadToClient } = await import("./services/acspLeadManagement");
        const success = await convertLeadToClient(input.leadId, ctx.user.id);
        if (!success) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to convert lead" });
        }
        return { success: true };
      }),

    // Mark lead as lost
    markAsLost: protectedProcedure
      .input(
        z.object({
          leadId: z.number(),
          reason: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { markLeadAsLost } = await import("./services/acspLeadManagement");
        const success = await markLeadAsLost(input.leadId, input.reason, ctx.user.id);
        if (!success) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Failed to mark lead as lost" });
        }
        return { success: true };
      }),

    // Get leads needing follow-up
    needingFollowUp: protectedProcedure.query(async ({ ctx }) => {
      const { getLeadsNeedingFollowUp } = await import("./services/acspLeadManagement");
      const leads = await getLeadsNeedingFollowUp();
      return leads;
    }),

    // Get sales funnel stats
    funnelStats: protectedProcedure.query(async ({ ctx }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new Error("Database not available");

      const { acspLeads } = await import("../drizzle/schema");
      const { eq, count, avg, sql } = await import("drizzle-orm");

      const allLeads = await dbInstance.select().from(acspLeads);

      const stats = {
        total: allLeads.length,
        prospect: allLeads.filter((l: any) => l.status === "prospect").length,
        contacted: allLeads.filter((l: any) => l.status === "contacted").length,
        qualified: allLeads.filter((l: any) => l.status === "qualified").length,
        proposal: allLeads.filter((l: any) => l.status === "proposal").length,
        negotiation: allLeads.filter((l: any) => l.status === "negotiation").length,
        won: allLeads.filter((l: any) => l.status === "won").length,
        lost: allLeads.filter((l: any) => l.status === "lost").length,
        averageScore: allLeads.length > 0
          ? Math.round(allLeads.reduce((sum: number, l: any) => sum + (l.leadScore || 0), 0) / allLeads.length)
          : 0,
        conversionRate: allLeads.length > 0
          ? Math.round((allLeads.filter((l: any) => l.status === "won").length / allLeads.length) * 100)
          : 0,
      };

      return stats;
    }),
  }),

  /**
   * Workflow Optimization Router
   * Smart patterns for alert management and automation
   */
  workflow: router({
    // Deduplicate alerts - remove duplicate alerts for same company/deadline
    deduplicateAlerts: protectedProcedure.mutation(async ({ ctx }) => {
      const { workflowOptimizer } = await import('./services/workflowOptimizer');
      const result = await workflowOptimizer.deduplicateAlerts(ctx.user.id);
      return result;
    }),

    // Get notification batches grouped by company
    getNotificationBatches: protectedProcedure.query(async ({ ctx }) => {
      const { workflowOptimizer } = await import('./services/workflowOptimizer');
      const batches = await workflowOptimizer.batchNotificationsByCompany(ctx.user.id);
      return batches;
    }),

    // Auto-escalate alerts based on days remaining
    escalateAlerts: protectedProcedure.mutation(async ({ ctx }) => {
      const { workflowOptimizer } = await import('./services/workflowOptimizer');
      const escalated = await workflowOptimizer.escalateAlertsBySeverity(ctx.user.id);
      return { escalated, success: true };
    }),

    // Bulk resolve alerts for a company
    bulkResolveAlerts: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        alertType: z.enum(['accounts_due', 'confirmation_statement_due']),
      }))
      .mutation(async ({ ctx, input }) => {
        const { workflowOptimizer } = await import('./services/workflowOptimizer');
        const resolved = await workflowOptimizer.bulkResolveCompanyAlerts(
          ctx.user.id,
          input.companyId,
          input.alertType
        );
        return { resolved, success: true };
      }),

    // Get recommendations for companies to monitor
    getMonitoringRecommendations: protectedProcedure
      .input(z.object({
        limit: z.number().default(10),
      }))
      .query(async ({ ctx, input }) => {
        const { workflowOptimizer } = await import('./services/workflowOptimizer');
        const recommendations = await workflowOptimizer.recommendCompaniesToMonitor(
          ctx.user.id,
          input.limit
        );
        return recommendations;
      }),

    // Get smart snooze duration suggestion
    getSnoozeSuggestion: protectedProcedure
      .input(z.object({
        dueDate: z.string(),
      }))
      .query(async ({ input }) => {
        const { workflowOptimizer } = await import('./services/workflowOptimizer');
        const suggestion = workflowOptimizer.suggestSnoozeDuration(input.dueDate);
        return suggestion;
      }),

    // Get workflow optimization metrics
    getMetrics: protectedProcedure.query(async ({ ctx }) => {
      const { workflowOptimizer } = await import('./services/workflowOptimizer');
      const metrics = workflowOptimizer.getMetrics();
      return metrics;
    }),
  }),

  // ========================================
  // ENRICHMENT PIPELINE PROCEDURES
  // ========================================

  enrichment: router({
    /**
     * Download new companies from Companies House (last N months)
     */
    downloadNewCompanies: protectedProcedure
      .input(z.object({
        monthsBack: z.number().min(1).max(24).default(12),
      }))
      .mutation(async ({ input }) => {
        const { downloadNewCompanies } = await import('./services/companiesHouseBatchDownloader');
        const result = await downloadNewCompanies(input.monthsBack);
        return result;
      }),

    /**
     * Get enrichment queue size
     */
    getQueueSize: protectedProcedure
      .query(async () => {
        const { getEnrichmentQueueSize } = await import('./services/companiesHouseBatchDownloader');
        const count = await getEnrichmentQueueSize();
        return { count };
      }),

    /**
     * Batch enrich companies with website crawling
     */
    batchEnrich: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(1000).default(100),
      }))
      .mutation(async ({ input }) => {
        const { batchEnrichCompanies } = await import('./services/websiteCrawler');
        const result = await batchEnrichCompanies(input.limit);
        return result;
      }),

    /**
     * Enrich single company
     */
    enrichSingle: protectedProcedure
      .input(z.object({
        companyNumber: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { enrichCompanyWithCrawl } = await import('./services/websiteCrawler');
        const success = await enrichCompanyWithCrawl(input.companyNumber);
        return { success };
      }),
  }),

  // Lead Generation & Funnel Management
  leads: router({
    /**
     * Calculate and update lead score for a company
     */
    updateScore: protectedProcedure
      .input(z.object({
        companyId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.updateLeadScore(input.companyId);
        return { success: true };
      }),

    /**
     * Update funnel stage for a company
     */
    updateStage: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        stage: z.enum(['cold', 'warm', 'hot', 'customer']),
      }))
      .mutation(async ({ input }) => {
        await db.updateFunnelStage(input.companyId, input.stage);
        return { success: true };
      }),

    /**
     * Get companies by funnel stage
     */
    getByStage: protectedProcedure
      .input(z.object({
        stage: z.enum(['cold', 'warm', 'hot', 'customer']),
        limit: z.number().default(100),
      }))
      .query(async ({ input }) => {
        const companies = await db.getCompaniesByFunnelStage(input.stage, input.limit);
        return companies;
      }),

    /**
     * Get top leads (highest scoring)
     */
    getTopLeads: protectedProcedure
      .input(z.object({
        limit: z.number().default(20),
      }))
      .query(async ({ input }) => {
        const leads = await db.getTopLeads(input.limit);
        return leads;
      }),

    /**
     * Get funnel statistics
     */
    getFunnelStats: protectedProcedure
      .query(async () => {
        const stats = await db.getFunnelStats();
        return stats;
      }),

    /**
     * Record contact activity
     */
    recordContact: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        followUpDays: z.number().default(7),
      }))
      .mutation(async ({ input }) => {
        await db.recordContactActivity(input.companyId, input.followUpDays);
        return { success: true };
      }),

    /**
     * Get companies needing follow-up
     */
    getNeedingFollowUp: protectedProcedure
      .input(z.object({
        limit: z.number().default(50),
      }))
      .query(async ({ input }) => {
        const companies = await db.getCompaniesNeedingFollowUp(input.limit);
        return companies;
      }),

    /**
     * Bulk update lead scores for all companies
     */
    bulkUpdateScores: protectedProcedure
      .input(z.object({
        limit: z.number().default(100),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        // Get all companies (or limit)
        const allCompanies = await dbInstance
          .select({ id: db.companies.id })
          .from(db.companies)
          .limit(input.limit);

        let updated = 0;
        for (const company of allCompanies) {
          await db.updateLeadScore(company.id);
          updated++;
        }

        return { success: true, updated };
      }),
  }),

  // Tax compliance alerts
  taxAlerts: router({
    // Generate tax alerts for a company
    generateForCompany: protectedProcedure
      .input(z.object({
        companyId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const company = await db.getCompanyById(input.companyId);
        if (!company) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Company not found" });
        }

        const { getUpcomingTaxDeadlines } = await import("./taxDeadlines");
        const deadlines = getUpcomingTaxDeadlines(company);

        // Create alerts for each deadline
        const createdAlerts = [];
        for (const deadline of deadlines) {
          const alert = await db.createTaxAlert({
            userId: ctx.user.id,
            companyId: input.companyId,
            alertType: deadline.type,
            severity: deadline.severity,
            title: deadline.title,
            description: deadline.description,
            dueDate: deadline.deadline.toISOString().split("T")[0],
          });
          createdAlerts.push(alert);
        }

        return { success: true, alerts: createdAlerts };
      }),

    // Get all tax alerts for user
    list: protectedProcedure
      .input(z.object({
        companyId: z.number().optional(),
        alertType: z.enum(["mtd_vat", "self_assessment", "vat_return", "corporation_tax"]).optional(),
        severity: z.enum(["critical", "warning", "info"]).optional(),
        resolved: z.boolean().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getTaxAlerts(ctx.user.id, input);
      }),

    // Update company tax registration
    updateTaxRegistration: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        vatNumber: z.string().optional(),
        vatRegisteredDate: z.string().optional(), // YYYY-MM-DD
        vatScheme: z.enum(["standard", "flat_rate", "cash_accounting"]).optional(),
        vatReturnPeriod: z.enum(["quarterly", "monthly", "annual"]).optional(),
        utr: z.string().optional(),
        accountingPeriodEnd: z.string().optional(), // MM-DD
        isMtdRegistered: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { companyId, ...taxData } = input;
        await db.updateCompanyTaxRegistration(companyId, taxData);
        return { success: true };
      }),

    // Bulk generate tax alerts for all monitored companies
    generateForAllMonitored: protectedProcedure
      .mutation(async ({ ctx }) => {
        const monitoredCompanies = await db.getMonitoredCompaniesByUser(ctx.user.id);
        const { getUpcomingTaxDeadlines } = await import("./taxDeadlines");

        let totalAlerts = 0;
        for (const mc of monitoredCompanies) {
          const company = await db.getCompanyById(mc.companyId);
          if (!company) continue;

          const deadlines = getUpcomingTaxDeadlines(company);
          for (const deadline of deadlines) {
            await db.createTaxAlert({
              userId: ctx.user.id,
              companyId: mc.companyId,
              alertType: deadline.type,
              severity: deadline.severity,
              title: deadline.title,
              description: deadline.description,
              dueDate: deadline.deadline.toISOString().split("T")[0],
            });
            totalAlerts++;
          }
        }

        return { success: true, totalAlerts };
      }),
  }),

  // Contact Scraping & Management
  contacts: router({
    /**
     * Get all contacts for a company
     */
    getByCompany: protectedProcedure
      .input(z.object({
        companyId: z.number(),
      }))
      .query(async ({ input }) => {
        const { getContactsForCompany } = await import('./services/contactScraper');
        return getContactsForCompany(input.companyId);
      }),

    /**
     * Get primary contact for a company
     */
    getPrimary: protectedProcedure
      .input(z.object({
        companyId: z.number(),
      }))
      .query(async ({ input }) => {
        const { getPrimaryContact } = await import('./services/contactScraper');
        return getPrimaryContact(input.companyId);
      }),

    /**
     * Scrape contacts for a single company (officers + website emails)
     */
    scrapeForCompany: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        companyNumber: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { scrapeContactsForCompany } = await import('./services/contactScraper');
        return scrapeContactsForCompany(input.companyId, input.companyNumber);
      }),

    /**
     * Import officers only from Companies House
     */
    importOfficers: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        companyNumber: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { importOfficersForCompany } = await import('./services/contactScraper');
        return importOfficersForCompany(input.companyId, input.companyNumber);
      }),

    /**
     * Scrape emails only from company website
     */
    scrapeEmails: protectedProcedure
      .input(z.object({
        companyId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { scrapeEmailsForCompany } = await import('./services/contactScraper');
        return scrapeEmailsForCompany(input.companyId);
      }),

    /**
     * Bulk scrape contacts for all monitored companies
     */
    bulkScrape: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { scrapeContactsForCompany } = await import('./services/contactScraper');
        const monitored = await db.getMonitoredCompaniesByUser(ctx.user.id);

        const results = [];
        let totalOfficers = 0;
        let totalEmails = 0;
        let totalErrors = 0;

        for (const mc of monitored) {
          try {
            const result = await scrapeContactsForCompany(mc.companyId, mc.company.companyNumber);
            totalOfficers += result.officersImported;
            totalEmails += result.emailsFound;
            totalErrors += result.errors.length;
            results.push(result);
          } catch (error: any) {
            totalErrors++;
            results.push({
              companyId: mc.companyId,
              companyNumber: mc.company.companyNumber,
              companyName: mc.company.companyName,
              officersImported: 0,
              emailsFound: 0,
              errors: [error.message],
            });
          }
        }

        return {
          totalCompanies: monitored.length,
          totalOfficers,
          totalEmails,
          totalErrors,
          results,
        };
      }),

    /**
     * Create a new contact manually
     */
    create: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        name: z.string().min(1, 'Contact name is required'),
        role: z.string().optional(),
        email: z.string().email('Invalid email address').optional().or(z.literal('')),
        phone: z.string().optional(),
        nationality: z.string().optional(),
        occupation: z.string().optional(),
        correspondenceAddress: z.string().optional(),
        isPrimary: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        const { companyContacts } = await import('../drizzle/schema');

        const result = await dbInstance.insert(companyContacts).values({
          companyId: input.companyId,
          name: input.name,
          role: input.role || null,
          email: input.email || null,
          phone: input.phone || null,
          nationality: input.nationality || null,
          occupation: input.occupation || null,
          correspondenceAddress: input.correspondenceAddress || null,
          source: 'manual',
          isPrimary: input.isPrimary || false,
          isActive: true,
        });

        return { success: true, contactId: result[0].insertId };
      }),

    /**
     * Update a contact's details manually
     */
    update: protectedProcedure
      .input(z.object({
        contactId: z.number(),
        name: z.string().min(1).optional(),
        role: z.string().optional(),
        email: z.string().email().optional().or(z.literal('')),
        phone: z.string().optional(),
        nationality: z.string().optional(),
        occupation: z.string().optional(),
        correspondenceAddress: z.string().optional(),
        isPrimary: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        const { companyContacts } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');

        const updateData: Record<string, any> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.role !== undefined) updateData.role = input.role || null;
        if (input.email !== undefined) updateData.email = input.email || null;
        if (input.phone !== undefined) updateData.phone = input.phone || null;
        if (input.nationality !== undefined) updateData.nationality = input.nationality || null;
        if (input.occupation !== undefined) updateData.occupation = input.occupation || null;
        if (input.correspondenceAddress !== undefined) updateData.correspondenceAddress = input.correspondenceAddress || null;
        if (input.isPrimary !== undefined) updateData.isPrimary = input.isPrimary;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;

        await dbInstance.update(companyContacts)
          .set(updateData)
          .where(eq(companyContacts.id, input.contactId));

        return { success: true };
      }),

    /**
     * Delete a contact
     */
    delete: protectedProcedure
      .input(z.object({
        contactId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        const { companyContacts } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');

        await dbInstance.delete(companyContacts)
          .where(eq(companyContacts.id, input.contactId));

        return { success: true };
      }),

    /**
     * Get scraping summary stats
     */
    getStats: protectedProcedure
      .query(async () => {
        const dbInstance = await requireDb();
        const { companyContacts } = await import('../drizzle/schema');

        const [totalResult, emailResult, phoneResult] = await Promise.all([
          dbInstance.select({ count: sql<number>`COUNT(*)` }).from(companyContacts),
          dbInstance.select({ count: sql<number>`COUNT(*)` }).from(companyContacts).where(sql`${companyContacts.email} IS NOT NULL AND ${companyContacts.email} != ''`),
          dbInstance.select({ count: sql<number>`COUNT(*)` }).from(companyContacts).where(sql`${companyContacts.phone} IS NOT NULL AND ${companyContacts.phone} != ''`),
        ]);

        const sourceRows = await dbInstance
          .select({
            source: companyContacts.source,
            count: sql<number>`COUNT(*)`,
          })
          .from(companyContacts)
          .groupBy(companyContacts.source);

        const sources: Record<string, number> = {};
        sourceRows.forEach(r => { sources[r.source] = Number(r.count); });

        return {
          totalContacts: Number(totalResult[0]?.count ?? 0),
          withEmail: Number(emailResult[0]?.count ?? 0),
          withPhone: Number(phoneResult[0]?.count ?? 0),
          sources,
        };
      }),

    /**
     * Bulk import contacts from CSV content
     */
    csvImport: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        csvContent: z.string().min(1, 'CSV content is required'),
      }))
      .mutation(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        const { parseCsvContacts } = await import('./services/csvParser');
        const { companyContacts } = await import('../drizzle/schema');

        const parseResult = parseCsvContacts(input.csvContent);

        if (parseResult.contacts.length === 0) {
          return {
            success: false,
            imported: 0,
            errors: parseResult.errors,
            totalRows: parseResult.totalRows,
          };
        }

        let imported = 0;
        const importErrors: { row: number; message: string }[] = [...parseResult.errors];

        for (let i = 0; i < parseResult.contacts.length; i++) {
          const contact = parseResult.contacts[i];
          try {
            await dbInstance.insert(companyContacts).values({
              companyId: input.companyId,
              name: contact.name,
              role: contact.role || null,
              email: contact.email || null,
              phone: contact.phone || null,
              nationality: contact.nationality || null,
              occupation: contact.occupation || null,
              correspondenceAddress: contact.correspondenceAddress || null,
              source: 'csv_import',
              isPrimary: contact.isPrimary || false,
              isActive: true,
            });
            imported++;
          } catch (error: any) {
            importErrors.push({ row: i + 2, message: `Database error: ${error.message}` });
          }
        }

        return {
          success: imported > 0,
          imported,
          errors: importErrors,
          totalRows: parseResult.totalRows,
          validRows: parseResult.validRows,
          skippedRows: parseResult.skippedRows,
        };
      }),

    /**
     * Export contacts for a company as CSV string
     */
    csvExport: protectedProcedure
      .input(z.object({
        companyId: z.number().optional(),
      }))
      .query(async ({ input, ctx }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

        const { companyContacts, companies } = await import('../drizzle/schema');
        const { eq } = await import('drizzle-orm');
        const { generateCsvExport } = await import('./services/csvParser');

        let contacts;
        if (input.companyId) {
          contacts = await dbInstance.select({
            contact: companyContacts,
            company: companies,
          })
            .from(companyContacts)
            .leftJoin(companies, eq(companyContacts.companyId, companies.id))
            .where(eq(companyContacts.companyId, input.companyId));
        } else {
          // Export all contacts for all monitored companies
          const monitored = await db.getMonitoredCompaniesByUser(ctx.user.id);
          const companyIds = monitored.map(m => m.companyId);
          if (companyIds.length === 0) return { csv: '', count: 0 };

          const { inArray } = await import('drizzle-orm');
          contacts = await dbInstance.select({
            contact: companyContacts,
            company: companies,
          })
            .from(companyContacts)
            .leftJoin(companies, eq(companyContacts.companyId, companies.id))
            .where(inArray(companyContacts.companyId, companyIds));
        }

        const exportRows = contacts.map(c => ({
          name: c.contact.name || '',
          role: c.contact.role || '',
          email: c.contact.email || '',
          phone: c.contact.phone || '',
          nationality: c.contact.nationality || '',
          occupation: c.contact.occupation || '',
          correspondenceAddress: c.contact.correspondenceAddress || '',
          source: c.contact.source || '',
          isPrimary: c.contact.isPrimary ? 'Yes' : 'No',
          appointedOn: c.contact.appointedOn || '',
          resignedOn: c.contact.resignedOn || '',
          companyName: c.company?.companyName || '',
          companyNumber: c.company?.companyNumber || '',
        }));

        return {
          csv: generateCsvExport(exportRows),
          count: exportRows.length,
        };
      }),

    /**
     * Get CSV template for download
     */
    csvTemplate: publicProcedure
      .query(async () => {
        const { generateCsvTemplate } = await import('./services/csvParser');
        return { csv: generateCsvTemplate() };
      }),

    excelDetectSheets: protectedProcedure
      .input(z.object({ fileContent: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const { detectSheets } = await import('./services/excelParser');
        const buffer = Buffer.from(input.fileContent, 'base64');
        return { sheets: detectSheets(buffer) };
      }),

    excelImport: protectedProcedure
      .input(z.object({
        companyId: z.number(),
        fileContent: z.string().min(1),
        sheetName: z.string(),
        columnMapping: z.record(z.string(), z.string()),
      }))
      .mutation(async ({ ctx, input }) => {
        const { parseExcelSheet } = await import('./services/excelParser');
        const { logActivity } = await import('./services/activityLogger');
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

        const buffer = Buffer.from(input.fileContent, 'base64');
        const columnMapping = Object.entries(input.columnMapping).reduce((acc, [key, val]) => {
          acc[key] = String(val);
          return acc;
        }, {} as Record<string, string>);
        const { contacts, errors } = parseExcelSheet(buffer, input.sheetName, columnMapping);

        if (errors.length > 0) throw new TRPCError({ code: 'BAD_REQUEST', message: errors[0] });

        const validContacts = contacts.filter(c => c.errors.length === 0);
        if (validContacts.length === 0) throw new TRPCError({ code: 'BAD_REQUEST', message: 'No valid contacts' });

        const { companyContacts } = await import('../drizzle/schema');
        const insertedIds: number[] = [];

        for (const contact of validContacts) {
          const result = await dbInstance.insert(companyContacts).values({
            companyId: input.companyId,
            name: contact.name,
            email: contact.email || null,
            phone: contact.phone || null,
            role: contact.role || null,
            correspondenceAddress: contact.address || null,
            nationality: contact.nationality || null,
            occupation: contact.occupation || null,
            isPrimary: contact.isPrimary,
            source: 'csv_import' as const,
            appointedOn: null,
            resignedOn: null,
          });
          insertedIds.push(result[0].insertId as number);
        }

        if (insertedIds.length > 0) {
          await logActivity({
            userId: ctx.user.id,
            companyId: input.companyId,
            contactId: insertedIds[0],
            action: 'imported',
            details: `Imported ${validContacts.length} contacts from Excel file`,
            metadata: { source: 'excel', count: validContacts.length },
          });
        }

        return { success: true, imported: validContacts.length, insertedIds };
      }),

    findDuplicates: protectedProcedure
      .input(z.object({
        companyId: z.number(),
      }))
      .query(async ({ input }) => {
        const { findDuplicateContacts } = await import('./services/contactDeduplication');
        return findDuplicateContacts(input.companyId);
      }),

    findAllDuplicates: protectedProcedure
      .query(async ({ ctx }) => {
        const { findAllDuplicates } = await import('./services/contactDeduplication');
        return findAllDuplicates(ctx.user.id);
      }),

    mergeDuplicates: protectedProcedure
      .input(z.object({
        keepContactId: z.number(),
        removeContactId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { mergeContacts } = await import('./services/contactDeduplication');
        const { logActivity } = await import('./services/activityLogger');
        const success = await mergeContacts(input.keepContactId, input.removeContactId);
        if (success) {
          await logActivity({
            userId: ctx.user.id,
            contactId: input.keepContactId,
            action: 'merged',
            details: `Merged duplicate contact ${input.removeContactId}`,
            metadata: { mergedContactId: input.removeContactId },
          });
        }
        return { success };
      }),

    enrichContactsForCompany: protectedProcedure
      .input(z.object({
        companyId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { enrichContactsForCompany } = await import('./services/contactEnrichment');
        return enrichContactsForCompany(input.companyId);
      }),

    enrichAllContacts: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { enrichAllContactsForUser } = await import('./services/contactEnrichment');
        return enrichAllContactsForUser(ctx.user.id);
      }),

    getContactsFlaggedForReview: protectedProcedure
      .input(z.object({
        companyId: z.number(),
      }))
      .query(async ({ input }) => {
        const { getContactsFlaggedForReview } = await import('./services/contactEnrichment');
        return getContactsFlaggedForReview(input.companyId);
      }),

    markContactAsReviewed: protectedProcedure
      .input(z.object({
        contactId: z.number(),
        email: z.string().optional(),
        phone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { markContactAsReviewed } = await import('./services/contactEnrichment');
        const success = await markContactAsReviewed(input.contactId, {
          email: input.email,
          phone: input.phone,
        });
        return { success };
      }),

    runNightlyDuplicateDetection: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { runNightlyDuplicateDetection } = await import('./services/backgroundJobs');
        const { logActivity } = await import('./services/activityLogger');
        const result = await runNightlyDuplicateDetection();

        await logActivity({
          userId: ctx.user.id,
          action: 'imported',
          details: `Duplicate detection job completed: ${result.duplicatesFound} duplicates found across ${result.jobsProcessed} companies`,
          metadata: {
            jobsProcessed: result.jobsProcessed,
            duplicatesFound: result.duplicatesFound,
            usersNotified: result.usersNotified,
          },
        });

        return result;
      }),
  }),

  // Compliance Email Notifications
  complianceNotifications: router({
    /**
     * Preview what notifications would be sent
     */
    preview: protectedProcedure
      .input(z.object({
        daysAhead: z.number().min(1).max(365).optional(),
        severityFilter: z.array(z.enum(['critical', 'warning', 'info'])).optional(),
      }))
      .query(async ({ input, ctx }) => {
        const { previewComplianceNotifications } = await import('./services/complianceNotifier');
        return previewComplianceNotifications(ctx.user.id, {
          daysAhead: input.daysAhead,
          severityFilter: input.severityFilter,
        });
      }),

    /**
     * Send compliance notifications to contacts
     */
    send: protectedProcedure
      .input(z.object({
        daysAhead: z.number().min(1).max(365).optional(),
        severityFilter: z.array(z.enum(['critical', 'warning', 'info'])).optional(),
        companyIds: z.array(z.number()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { sendComplianceNotifications } = await import('./services/complianceNotifier');
        return sendComplianceNotifications(ctx.user.id, {
          daysAhead: input.daysAhead,
          severityFilter: input.severityFilter,
          companyIds: input.companyIds,
        });
      }),

    /**
     * Get email preview for a specific deadline
     */
    emailPreview: protectedProcedure
      .input(z.object({
        contactName: z.string(),
        companyName: z.string(),
        companyNumber: z.string(),
        deadlineType: z.enum(['accounts_due', 'confirmation_statement_due']),
        dueDate: z.string(),
        daysUntilDue: z.number(),
        severity: z.enum(['critical', 'warning', 'info']),
      }))
      .query(async ({ input }) => {
        const { generateEmailSubject, generateEmailBody, generateEmailHtml } = await import('./services/complianceNotifier');
        const deadline = {
          companyId: 0,
          companyName: input.companyName,
          companyNumber: input.companyNumber,
          deadlineType: input.deadlineType,
          dueDate: input.dueDate,
          daysUntilDue: input.daysUntilDue,
          severity: input.severity,
        };
        return {
          subject: generateEmailSubject(deadline),
          textBody: generateEmailBody(input.contactName, deadline),
          htmlBody: generateEmailHtml(input.contactName, deadline),
        };
      }),

    /**
     * Get notification history
     */
    history: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).optional(),
      }))
      .query(async ({ input, ctx }) => {
        const { getNotificationLogs } = await import('./services/notificationLogger');
        return getNotificationLogs(ctx.user.id, {
          channel: 'email',
          limit: input.limit || 50,
        });
      }),
  }),

  // Contact Deduplication
  deduplication: router({
    findDuplicates: protectedProcedure.query(async ({ ctx }) => {
      const { findDuplicates } = await import('./services/contactDeduplicator');
      return findDuplicates(ctx.user.id);
    }),

    getStats: protectedProcedure.query(async ({ ctx }) => {
      const { getDeduplicationStats } = await import('./services/contactDeduplicator');
      return getDeduplicationStats(ctx.user.id);
    }),

    merge: protectedProcedure
      .input(z.object({
        survivorId: z.number(),
        mergeIds: z.array(z.number()).min(1),
      }))
      .mutation(async ({ input }) => {
        const { mergeContacts } = await import('./services/contactDeduplicator');
        return mergeContacts(input.survivorId, input.mergeIds);
      }),
  }),

  // ── Activity Timeline ──────────────────────────────────────────
  activity: router({
    getByContact: protectedProcedure
      .input(z.object({ contactId: z.number(), limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        const { getContactTimeline } = await import('./services/activityLogger');
        return getContactTimeline(input.contactId, input.limit, input.offset);
      }),

    getByCompany: protectedProcedure
      .input(z.object({ companyId: z.number(), limit: z.number().default(50), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        const { getCompanyTimeline } = await import('./services/activityLogger');
        return getCompanyTimeline(input.companyId, input.limit, input.offset);
      }),

    getRecent: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }).optional())
      .query(async ({ ctx, input }) => {
        const { getRecentActivities } = await import('./services/activityLogger');
        return getRecentActivities(ctx.user.id, input?.limit ?? 20);
      }),

    getStats: protectedProcedure.query(async ({ ctx }) => {
      const { getActivityStats } = await import('./services/activityLogger');
      return getActivityStats(ctx.user.id);
    }),

    logNote: protectedProcedure
      .input(z.object({
        contactId: z.number().optional(),
        companyId: z.number().optional(),
        note: z.string().min(1).max(2000),
      }))
      .mutation(async ({ ctx, input }) => {
        const { logActivity } = await import('./services/activityLogger');
        await logActivity({
          contactId: input.contactId,
          companyId: input.companyId,
          userId: ctx.user.id,
          action: 'note_added',
          details: input.note,
        });
        return { success: true };
      }),
  }),

  // ── Email Campaigns ────────────────────────────────────────────
  campaigns: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(200),
        subject: z.string().min(1).max(500),
        htmlBody: z.string().min(1),
        textBody: z.string().optional(),
        filterCriteria: z.object({
          companyIds: z.array(z.number()).optional(),
          funnelStages: z.array(z.string()).optional(),
          contactRoles: z.array(z.string()).optional(),
          hasEmail: z.boolean().optional(),
          hasOverdueAccounts: z.boolean().optional(),
          hasOverdueConfirmation: z.boolean().optional(),
          industries: z.array(z.string()).optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createCampaign } = await import('./services/campaignService');
        return createCampaign({ ...input, userId: ctx.user.id });
      }),

    send: protectedProcedure
      .input(z.object({ campaignId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { sendCampaign } = await import('./services/campaignService');
        return sendCampaign(input.campaignId, ctx.user.id);
      }),

    getHistory: protectedProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }).optional())
      .query(async ({ ctx, input }) => {
        const { getCampaignHistory } = await import('./services/campaignService');
        return getCampaignHistory(ctx.user.id, input?.limit ?? 20, input?.offset ?? 0);
      }),

    getDetails: protectedProcedure
      .input(z.object({ campaignId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getCampaignDetails } = await import('./services/campaignService');
        return getCampaignDetails(input.campaignId, ctx.user.id);
      }),

    delete: protectedProcedure
      .input(z.object({ campaignId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { deleteCampaign } = await import('./services/campaignService');
        await deleteCampaign(input.campaignId, ctx.user.id);
        return { success: true };
      }),

    getFilteredRecipients: protectedProcedure
      .input(z.object({
        companyIds: z.array(z.number()).optional(),
        funnelStages: z.array(z.string()).optional(),
        contactRoles: z.array(z.string()).optional(),
        hasEmail: z.boolean().optional(),
        hasOverdueAccounts: z.boolean().optional(),
        hasOverdueConfirmation: z.boolean().optional(),
        industries: z.array(z.string()).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { getFilteredRecipients } = await import('./services/campaignService');
        return getFilteredRecipients(ctx.user.id, input);
      }),

    getTemplates: protectedProcedure.query(async () => {
      const { campaignTemplates } = await import('./services/campaignService');
      return campaignTemplates;
    }),

    // Analytics
    getAnalytics: protectedProcedure
      .input(z.object({ campaignId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getCampaignAnalytics } = await import('./services/campaignAnalytics');
        return getCampaignAnalytics(input.campaignId, ctx.user.id);
      }),

    getEngagementTimeline: protectedProcedure
      .input(z.object({ campaignId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getEngagementTimeline } = await import('./services/campaignAnalytics');
        return getEngagementTimeline(input.campaignId, ctx.user.id);
      }),

    getAllOverview: protectedProcedure.query(async ({ ctx }) => {
      const { getAllCampaignsOverview } = await import('./services/campaignAnalytics');
      return getAllCampaignsOverview(ctx.user.id);
    }),
  }),

  // ── Dashboard Notifications Widget ─────────────────────────────
  dashboardNotifications: router({
    getRecent: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }).optional())
      .query(async ({ ctx, input }) => {
        const db = await import('./db').then(m => m.getDb());
        if (!db) return { notifications: [], unreadCount: 0 };
        const { complianceAlerts, notificationLogs, contactActivityLog: actLog } = await import('../drizzle/schema');
        const { eq, desc, sql, and } = await import('drizzle-orm');

        // Get recent compliance alerts
        const alerts = await db
          .select()
          .from(complianceAlerts)
          .where(eq(complianceAlerts.userId, ctx.user.id))
          .orderBy(desc(complianceAlerts.createdAt))
          .limit(input?.limit ?? 10);

        // Get recent notification logs (auto-notification delivery status)
        const notifLogs = await db
          .select()
          .from(notificationLogs)
          .where(eq(notificationLogs.userId, ctx.user.id))
          .orderBy(desc(notificationLogs.createdAt))
          .limit(5);

        // Get recent activity count
        const activityResults = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(actLog)
          .where(and(
            eq(actLog.userId, ctx.user.id),
            sql`${actLog.createdAt} >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
          ));
        const recentActivityCount = activityResults[0]?.count ?? 0;

        // Count unread (alerts from last 24h that haven't been acknowledged)
        const unreadResults = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(complianceAlerts)
          .where(and(
            eq(complianceAlerts.userId, ctx.user.id),
            eq(complianceAlerts.isRead, false),
          ));
        const unreadCount = unreadResults[0]?.count ?? 0;

        return {
          notifications: alerts.map(a => ({
            id: a.id,
            type: 'alert' as const,
            title: a.title,
            description: a.description,
            severity: a.severity,
            isRead: a.isRead,
            createdAt: a.createdAt,
          })),
          deliveryLogs: notifLogs.map(n => ({
            id: n.id,
            type: 'delivery' as const,
            channel: n.channel,
            recipient: n.recipient,
            subject: n.subject,
            status: n.status,
            sentAt: n.sentAt,
            createdAt: n.createdAt,
          })),
          recentActivityCount,
          unreadCount,
        };
      }),

    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await import('./db').then(m => m.getDb());
      if (!db) return { success: false };
      const { complianceAlerts } = await import('../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      await db.update(complianceAlerts)
        .set({ isRead: true })
        .where(eq(complianceAlerts.userId, ctx.user.id));
      return { success: true };
    }),
  }),
  compliance: complianceRouter,
  agents: agentsRouter,
  engager: engagerRouter,
  agentMonitor: agentMonitorRouter,
  uploadJobs: uploadJobsRouter,
  vatCheck: vatCheckRouter,
  agentApp: agentAppRouter,
  documentVault: documentVaultRouter,
  alertDelivery: alertDeliveryRouter,
  complianceTimeline: complianceTimelineRouter,
  subscription: subscriptionRouter,
  push: pushRouter,
  agentWorkQueue: agentWorkQueueRouter,
  complianceRisk: complianceRiskRouter,
  clientReports: clientReportsRouter,
  directorAlert: directorAlertRouter,
  riskScan: riskScanRouter,
  firm: firmRouter,
  intelligence: companyIntelligenceRouter,
  pipeline: pipelineRouter,
  onboarding: onboardingRouter,
  acspFirms: acspFirmsRouter,
  flowEngage: flowEngageRouter,
  companion: companionRouter,
  featureFlags: featureFlagRouter,
  optOut: optOutRouter,
  alertCheckout: alertCheckoutRouter,
  referral: referralRouter,
  outbound: outboundRouter,
  outboundPublic: outboundPublicRouter,
  outboundEnrichment: outboundEnrichmentRouter,
  csvEnrichment: csvEnrichmentRouter,
  deterministic: deterministicRouter,
  hmrcMtd: hmrcMtdRouter,
  chAdmin: chAdminRouter,
  gdpr: gdprRouter,
  chBulkImport: chBulkImportRouter,
  enterpriseQuote: router({
    /**
     * Submit an enterprise quote request.
     * Public so unauthenticated visitors can submit from the pricing page.
     */
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1).max(120),
          email: z.string().email(),
          company: z.string().min(1).max(200),
          companyCount: z.number().min(1).max(100000),
          services: z.array(z.string()).min(1),
          message: z.string().max(2000).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { notifyOwner } = await import("./_core/notification");
        const serviceList = input.services.join(", ");
        await notifyOwner({
          title: `Enterprise Quote Request \u2014 ${input.company}`,
          content: `Name: ${input.name}\nEmail: ${input.email}\nCompany: ${input.company}\nCompanies to monitor: ${input.companyCount}\nServices: ${serviceList}\n\nMessage:\n${input.message ?? "(none)"}`,
        });
        return { success: true };
      }),
  }),
  deadlineChecker: router({
    /**
     * Public company search — used by the unauthenticated Deadline Checker page.
     */
    search: publicProcedure
      .input(z.object({ query: z.string().min(1).max(200) }))
      .query(async ({ input }) => {
        const result = await companiesHouseService.searchCompanies(input.query, 1, 10);
        return result;
      }),
    /**
     * Get a single company profile with deadline info — public.
     */
    getProfile: publicProcedure
      .input(z.object({ companyNumber: z.string().min(1).max(8) }))
      .query(async ({ input }) => {
        const profile = await companiesHouseService.getCompanyProfile(input.companyNumber);
        return profile;
      }),
  }),
    import: router({
    importCompanies: protectedProcedure
      .input(z.object({
        records: z.array(z.object({
          companyName: z.string(),
          companyNumber: z.string(),
          serviceType: z.string().optional(),
          nextDeadline: z.string().optional(),
          assignedTo: z.string().optional(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.importCompanies(input.records, ctx.user.id);
      }),
    getStats: protectedProcedure.query(async ({ ctx }) => {
      return await db.getImportStats(ctx.user.id);
    }),
  }),

  /**
   * Public proof-of-protection examples for the homepage trust section.
   * Returns up to 3 recently-resolved compliance alerts, anonymised.
   */
  proofOfProtection: router({
    getExamples: publicProcedure.query(async () => {
      const drizzleDb = await db.getDb();
      if (!drizzleDb) return [];
      const { complianceAlerts: alertsTable, companies: companiesTable } = await import("../drizzle/schema");
      const { desc: descOrd, eq: eqOp, isNotNull } = await import("drizzle-orm");
      const rows = await drizzleDb
        .select({
          id: alertsTable.id,
          alertType: alertsTable.alertType,
          severity: alertsTable.severity,
          title: alertsTable.title,
          dueDate: alertsTable.dueDate,
          resolvedAt: alertsTable.resolvedAt,
          createdAt: alertsTable.createdAt,
          companyName: companiesTable.companyName,
        })
        .from(alertsTable)
        .innerJoin(companiesTable, eqOp(alertsTable.companyId, companiesTable.id))
        .where(isNotNull(alertsTable.resolvedAt))
        .orderBy(descOrd(alertsTable.resolvedAt))
        .limit(3);
      // Anonymise: first word of company name + "Ltd"
      // Map alert type to a specific outcome string
      const OUTCOME_MAP: Record<string, string> = {
        accounts_due: "Annual accounts filed on time \u2014 \u00a3150 late filing penalty avoided.",
        overdue_accounts: "Accounts submitted before Companies House strike-off warning \u2014 company protected.",
        confirmation_statement_due: "Confirmation statement submitted \u2014 \u00a3500 civil penalty avoided.",
        overdue_confirmation: "Confirmation statement filed \u2014 company removed from late-filing risk register.",
        director_change: "Director appointment verified and recorded \u2014 no compliance gap.",
        risk_score_update: "Risk score improved to Green \u2014 all deadlines now within safe window.",
      };
      return rows.map((r) => ({
        id: r.id,
        alertType: r.alertType as string,
        severity: r.severity as string,
        title: r.title,
        dueDate: r.dueDate ?? null,
        resolvedAt: r.resolvedAt ? r.resolvedAt.toISOString() : null,
        createdAt: r.createdAt.toISOString(),
        companyLabel: r.companyName
          ? r.companyName.split(" ")[0] + " Ltd"
          : "Client Company",
        result: OUTCOME_MAP[(r.alertType as string)] ?? "Alert resolved \u2014 issue addressed before deadline.",
      }));
    }),
  }),

  // ─── Monitor CTA Funnel Tracking ────────────────────────────────────────────
  monitorFunnel: router({
    /**
     * Log a funnel event (search, monitor_click, signup_redirect, portfolio_add)
     * Public procedure — works for both anonymous and authenticated users.
     */
    track: publicProcedure
      .input(
        z.object({
          eventType: z.enum(["search", "monitor_click", "signup_redirect", "portfolio_add"]),
          companyNumber: z.string().max(20).optional(),
          companyName: z.string().max(255).optional(),
          sessionId: z.string().max(64).optional(),
          referrer: z.string().max(500).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const drizzleDb = await getDb();
          if (!drizzleDb) return { ok: false };
          const userId = ctx.user?.id ?? null;
          await drizzleDb.execute(
            sql`INSERT INTO monitor_funnel_events (event_type, company_number, company_name, user_id, session_id, referrer, created_at)
                VALUES (${input.eventType}, ${input.companyNumber ?? null}, ${input.companyName ?? null}, ${userId}, ${input.sessionId ?? null}, ${input.referrer ?? null}, ${Date.now()})`
          );
          return { ok: true };
        } catch (err) {
          // Never throw — funnel tracking must never break the user flow
          console.error("[FunnelTrack] Failed to log funnel event:", err);
          return { ok: false };
        }
      }),

    /**
     * Get funnel summary stats (protected — for dashboard/admin use)
     */
    stats: protectedProcedure.query(async () => {
      try {
        const drizzleDb = await getDb();
        if (!drizzleDb) return { searches: 0, monitorClicks: 0, signupRedirects: 0, portfolioAdds: 0, searchToClickRate: 0, clickToSignupRate: 0, signupToAddRate: 0 };
        const rows = await drizzleDb.execute(
          sql`SELECT event_type, COUNT(*) as count
              FROM monitor_funnel_events
              WHERE created_at > ${Date.now() - 30 * 24 * 60 * 60 * 1000}
              GROUP BY event_type`
        );
        const counts: Record<string, number> = {};
        for (const row of (rows as any[])[0] ?? []) {
          counts[row.event_type] = Number(row.count);
        }
        return {
          searches: counts["search"] ?? 0,
          monitorClicks: counts["monitor_click"] ?? 0,
          signupRedirects: counts["signup_redirect"] ?? 0,
          portfolioAdds: counts["portfolio_add"] ?? 0,
          searchToClickRate: counts["search"]
            ? Math.round(((counts["monitor_click"] ?? 0) / counts["search"]) * 100)
            : 0,
          clickToSignupRate: counts["monitor_click"]
            ? Math.round(((counts["signup_redirect"] ?? 0) / counts["monitor_click"]) * 100)
            : 0,
          signupToAddRate: counts["signup_redirect"]
            ? Math.round(((counts["portfolio_add"] ?? 0) / counts["signup_redirect"]) * 100)
            : 0,
        };
      } catch (err) {
        console.error("[FunnelStats] Failed to query funnel stats:", err);
        return { searches: 0, monitorClicks: 0, signupRedirects: 0, portfolioAdds: 0, searchToClickRate: 0, clickToSignupRate: 0, signupToAddRate: 0 };
      }
    }),
   }),

  // ─── Public Countdown Widget ─────────────────────────────────────────────────
  widget: router({
    /**
     * Returns deadline data for a company number — public, no auth required.
     * Used by the embeddable countdown widget at /widget?company=XXXXXXXX
     */
    getDeadlines: publicProcedure
      .input(z.object({ companyNumber: z.string().min(1).max(8) }))
      .query(async ({ input }) => {
        // Normalise to 8-char padded company number
        const cn = input.companyNumber.padStart(8, '0');
        // First try our local DB (faster, has cached data)
        const drizzleDb = await getDb();
        if (drizzleDb) {
          const { companies: companiesTable } = await import('../drizzle/schema');
          const { eq: eqOp } = await import('drizzle-orm');
          const rows = await drizzleDb
            .select({
              companyName: companiesTable.companyName,
              companyNumber: companiesTable.companyNumber,
              companyStatus: companiesTable.companyStatus,
              accountsNextDue: companiesTable.accountsNextDue,
              confirmationStatementNextDue: companiesTable.confirmationStatementNextDue,
            })
            .from(companiesTable)
            .where(eqOp(companiesTable.companyNumber, cn))
            .limit(1);
          if (rows.length > 0 && (rows[0].accountsNextDue || rows[0].confirmationStatementNextDue)) {
            return rows[0];
          }
        }
        // Fall back to live Companies House API
        const profile = await companiesHouseService.getCompanyProfile(cn);
        if (!profile) return null;
        return {
          companyName: profile.company_name,
          companyNumber: profile.company_number,
          companyStatus: profile.company_status,
          accountsNextDue: profile.accounts?.next_due ?? null,
          confirmationStatementNextDue: profile.confirmation_statement?.next_due ?? null,
        };
      }),
  }),
});
export type AppRouter = typeof appRouter;

// Helper function to generate alerts for a company
/**
 * V1 alert generation — replaces the old generateAlertsForCompany.
 * Uses the deterministic V1 rule engine (buildV1Alerts) as the single
 * source of truth. No duplicate logic.
 */
async function generateAlertsForCompanyV1(userId: number, company: any) {
  const alerts = buildV1Alerts({
    userId,
    companyId: company.id,
    companyName: company.companyName,
    confirmationStatementNextDue: company.confirmationStatementNextDue,
    accountsNextDue: company.accountsNextDue,
  });

  for (const alert of alerts) {
    try {
      await db.createAlert(alert as any);

      await publishEvent(
        "alert.created",
        "alert",
        company.companyNumber,
        {
          alertType: alert.alertType,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          companyName: company.companyName,
          companyNumber: company.companyNumber,
          dueDate: alert.dueDate,
          userId,
        }
      );
    } catch (error) {
      console.error("[V1] Failed to create alert:", error);
    }
  }
}
