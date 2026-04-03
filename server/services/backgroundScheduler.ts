import cron from 'node-cron';
import * as db from '../db';
import { companiesHouseService } from './companiesHouse';
import { runV1AlertSweep } from './v1AlertSweep';
import { sendWhatsAppNotification } from './whatsapp';
import { smsService } from './sms';
import { notifyOwner } from '../_core/notification';
import { publishEvent } from './simpleEventPublisher';
import { notificationLogger } from './notificationLogger';
import { getUserBranding, generateEmailTemplate, generateWhatsAppMessage, generateSMSMessage } from './whiteLabelTemplates';
import { dispatchAlertToChannels } from '../routers/alertDeliveryRouter';
import { writeTimelineEvent } from './timelineWriter';
import { buildOutboundSegments } from './companySegmentation';
import { generateOutboundBatch } from './outboundChPipeline';
import { enrichChCompanies } from './chEnrichmentBridge';
import { runBulkImportJob } from './chBulkImportWorker';

/**
 * Background Job Scheduler
 * Handles automated daily company sync and compliance checks
 */
export class BackgroundScheduler {
  private tasks: Map<string, any> = new Map();

  /**
   * Start all scheduled tasks
   */
  start() {
    console.log('[Scheduler] Starting background jobs...');

    // Daily company sync + V1 alert sweep - runs at 2 AM every day
    this.scheduleTask('daily-sync', '0 2 * * *', async () => {
      await this.syncAllCompanies();
    });

    // Hourly V1 alert sweep - replaces old checkAlerts
    this.scheduleTask('hourly-alerts', '0 * * * *', async () => {
      await runV1AlertSweep();
    });

    // Daily digest - runs at 9 AM every day
    this.scheduleTask('daily-digest', '0 9 * * *', async () => {
      await this.sendDailyDigests();
    });

    // Workflow optimization - runs every 6 hours
    this.scheduleTask('workflow-optimization', '0 */6 * * *', async () => {
      await this.runWorkflowOptimization();
    });

    // Alert escalation - runs every 3 hours
    this.scheduleTask('alert-escalation', '0 */3 * * *', async () => {
      await this.escalateAlerts();
    });

    // Compliance auto-notifications - runs daily at 8 AM
    this.scheduleTask('compliance-auto-notify', '0 8 * * *', async () => {
      await this.runComplianceAutoNotifications();
    });

    // Daily compliance risk score recalculation - runs at 3 AM every day
    this.scheduleTask('daily-risk-scores', '0 3 * * *', async () => {
      await this.recalculateAllRiskScores();
    });

    // Director change monitoring - runs at 6 AM every day
    this.scheduleTask('director-change-monitor', '0 6 * * *', async () => {
      await this.monitorDirectorChanges();
    });

    // Scheduled pipeline runs - check every 5 minutes for due pipelines
    this.scheduleTask('pipeline-scheduler', '*/5 * * * *', async () => {
      await this.runScheduledPipelines();
    });

    // FlowEngage sequence engine - check every 5 minutes for pending outreach steps
    this.scheduleTask('flow-engage-sequence', '*/5 * * * *', async () => {
      await this.runFlowEngageSequence();
    });

    // Scheduled bulk sends - check every 5 minutes for pending sends due for execution
    this.scheduleTask('scheduled-bulk-sends', '*/5 * * * *', async () => {
      await this.runScheduledBulkSends();
    });

    // CH bulk data: rebuild outbound segments daily at 4 AM
    this.scheduleTask('ch-segment-rebuild', '0 4 * * *', async () => {
      await this.runChSegmentRebuild();
    });

    // CH bulk data: generate outbound batches daily at 4:30 AM (after segment rebuild)
    this.scheduleTask('ch-outbound-batch', '30 4 * * *', async () => {
      await this.runChOutboundBatch();
    });

    // CH enrichment: enrich unenriched/stale ch_companies rows daily at 5:00 AM
    this.scheduleTask('ch-enrich-from-bulk', '0 5 * * *', async () => {
      await this.runChEnrichFromBulk();
    });

    // CH monthly bulk extract: on the 1st of every month at 01:00 AM
    this.scheduleTask('ch-monthly-bulk-extract', '0 1 1 * *', async () => {
      await this.runMonthlyBulkExtract();
    });

    // Job 4: Abandoned-check follow-up (hourly)
    this.scheduleTask('abandoned-check-followup', '0 * * * *', async () => {
      await this.runAbandonedCheckFollowUp();
    });

    // Job 5: Payment fulfilment worker (every 5 minutes)
    this.scheduleTask('payment-fulfilment-worker', '*/5 * * * *', async () => {
      await this.runPaymentFulfilmentWorker();
    });

    console.log('[Scheduler] All background jobs started');
  }

  /**
   * Stop all scheduled tasks
   */
  stop() {
    console.log('[Scheduler] Stopping background jobs...');
    this.tasks.forEach((task, name) => {
      task.stop();
      console.log(`[Scheduler] Stopped task: ${name}`);
    });
    this.tasks.clear();
  }

  /**
   * Schedule a task with cron expression
   */
  private scheduleTask(name: string, cronExpression: string, handler: () => Promise<void>) {
    const task = cron.schedule(cronExpression, async () => {
      console.log(`[Scheduler] Running task: ${name}`);
      try {
        await handler();
        console.log(`[Scheduler] Task completed: ${name}`);
      } catch (error) {
        console.error(`[Scheduler] Task failed: ${name}`, error);
      }
    });

    this.tasks.set(name, task);
    console.log(`[Scheduler] Scheduled task: ${name} (${cronExpression})`);
  }

  /**
   * Sync all monitored companies with Companies House API
   */
  private async syncAllCompanies() {
    console.log('[Scheduler] Starting daily company sync...');

    const dbInstance = await db.getDb();
    if (!dbInstance) {
      console.error('[Scheduler] Database not available');
      return;
    }

    try {
      const { companies } = await import('../../drizzle/schema');
      const allCompanies = await dbInstance.select().from(companies);
      console.log(`[Scheduler] Syncing ${allCompanies.length} companies...`);

      let successCount = 0;
      let failCount = 0;

      for (const company of allCompanies) {
        try {
          const profile = await companiesHouseService.getCompanyProfile(company.companyNumber);

          if (profile) {
            await db.upsertCompany({
              companyNumber: profile.company_number,
              companyName: profile.company_name,
              companyStatus: profile.company_status,
              companyType: profile.company_type,
              incorporationDate: profile.date_of_creation,
              registeredOfficeAddress: companiesHouseService.formatAddress(profile.registered_office_address),
              accountsNextDue: profile.accounts?.next_due || null,
              confirmationStatementNextDue: profile.confirmation_statement?.next_due || null,
            });

            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          console.error(`[Scheduler] Failed to sync company ${company.companyNumber}:`, error);
          failCount++;
        }
      }

      console.log(`[Scheduler] Daily sync completed: ${successCount} successful, ${failCount} failed`);

      const sweepStats = await runV1AlertSweep();
      console.log(`[Scheduler] V1 alert sweep: ${sweepStats.alertsCreated} alerts created`);

      await notifyOwner({
        title: 'FineGuard Daily Sync Complete',
        content: `Synced ${allCompanies.length} companies: ${successCount} successful, ${failCount} failed. V1 sweep created ${sweepStats.alertsCreated} new alerts.`,
      });
    } catch (error) {
      console.error('[Scheduler] Daily sync failed:', error);
    }
  }

  /**
   * @deprecated Replaced by V1 alert sweep (runV1AlertSweep).
   */
  private async checkCompanyCompliance(companyId: number, profile: any) {
    const alerts = [];
    const now = new Date();

    const dbInstance = await db.getDb();
    const { filingDeadlines } = await import('../../drizzle/schema');

    if (profile.accounts?.next_due) {
      const dueDate = new Date(profile.accounts.next_due);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const status = daysUntilDue < 0 ? 'overdue' : 'upcoming';

      if (dbInstance) {
        try {
          await dbInstance.insert(filingDeadlines).values({
            companyId,
            type: 'accounts',
            deadlineDate: dueDate.getTime(),
            status,
            daysUntilDue,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }).onDuplicateKeyUpdate({ set: { status, daysUntilDue, updatedAt: Date.now() } });
        } catch (_e) { /* ignore */ }
      }

      if (daysUntilDue < 0) {
        alerts.push({
          companyId,
          alertType: 'Accounts Overdue',
          severity: 'critical' as const,
          description: `Accounts filing is ${Math.abs(daysUntilDue)} days overdue`,
          dueDate: profile.accounts.next_due,
        });
      } else if (daysUntilDue <= 14) {
        alerts.push({
          companyId,
          alertType: 'Accounts Due Soon',
          severity: 'critical' as const,
          description: `Accounts filing due in ${daysUntilDue} days`,
          dueDate: profile.accounts.next_due,
        });
      } else if (daysUntilDue <= 30) {
        alerts.push({
          companyId,
          alertType: 'Accounts Due Soon',
          severity: 'warning' as const,
          description: `Accounts filing due in ${daysUntilDue} days`,
          dueDate: profile.accounts.next_due,
        });
      }
    }

    if (profile.confirmation_statement?.next_due) {
      const dueDate = new Date(profile.confirmation_statement.next_due);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const status = daysUntilDue < 0 ? 'overdue' : 'upcoming';

      if (dbInstance) {
        try {
          await dbInstance.insert(filingDeadlines).values({
            companyId,
            type: 'confirmation_statement',
            deadlineDate: dueDate.getTime(),
            status,
            daysUntilDue,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }).onDuplicateKeyUpdate({ set: { status, daysUntilDue, updatedAt: Date.now() } });
        } catch (_e) { /* ignore */ }
      }

      if (daysUntilDue < 0) {
        alerts.push({
          companyId,
          alertType: 'Confirmation Statement Overdue',
          severity: 'critical' as const,
          description: `Confirmation statement is ${Math.abs(daysUntilDue)} days overdue`,
          dueDate: profile.confirmation_statement.next_due,
        });
      } else if (daysUntilDue <= 14) {
        alerts.push({
          companyId,
          alertType: 'Confirmation Statement Due Soon',
          severity: 'warning' as const,
          description: `Confirmation statement due in ${daysUntilDue} days`,
          dueDate: profile.confirmation_statement.next_due,
        });
      }
    }

    for (const alert of alerts) {
      const isOverdue = alert.alertType.includes('Overdue');
      await writeTimelineEvent({
        companyId,
        eventType: isOverdue ? 'deadline_overdue' : 'deadline_warning',
        title: alert.alertType,
        notes: alert.description,
        source: 'system',
      });
    }
    console.log(`[Scheduler] Found ${alerts.length} compliance issues for company ${companyId}`);
  }

  /**
   * Check and send notifications for active alerts
   */
  private async checkAlerts() {
    console.log('[Scheduler] Checking alerts...');

    const dbInstance = await db.getDb();
    if (!dbInstance) {
      console.error('[Scheduler] Database not available');
      return;
    }

    try {
      const { users, notificationPreferences } = await import('../../drizzle/schema');
      const allUsers = await dbInstance.select().from(users);

      for (const user of allUsers) {
        const { eq } = await import('drizzle-orm');
        const prefsResult = await dbInstance
          .select()
          .from(notificationPreferences)
          .where(eq(notificationPreferences.userId, user.id))
          .limit(1);
        const prefs = prefsResult[0];

        if (!prefs) continue;

        const alerts = await db.getAlertsByUser(user.id, { unresolvedOnly: true });

        if (prefs.emailFrequency === 'immediate') {
          for (const alert of alerts) {
            if (this.shouldSendAlert(alert.severity, prefs)) {
              await this.sendAlertNotification(user, alert, prefs);
            }
          }
        }
      }

      console.log('[Scheduler] Alert check completed');
    } catch (error) {
      console.error('[Scheduler] Alert check failed:', error);
    }
  }

  /**
   * Send daily digest emails
   */
  private async sendDailyDigests() {
    console.log('[Scheduler] Sending daily digests...');

    const dbInstance = await db.getDb();
    if (!dbInstance) {
      console.error('[Scheduler] Database not available');
      return;
    }

    try {
      const { users, notificationPreferences } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      const allUsers = await dbInstance.select().from(users);

      for (const user of allUsers) {
        const prefsResult = await dbInstance
          .select()
          .from(notificationPreferences)
          .where(eq(notificationPreferences.userId, user.id))
          .limit(1);
        const prefs = prefsResult[0];

        if (!prefs || prefs.emailFrequency !== 'daily') continue;

        const alerts = await db.getAlertsByUser(user.id, { unresolvedOnly: true });

        if (alerts.length === 0) continue;

        const criticalCount = alerts.filter(a => a.severity === 'critical').length;
        const warningCount = alerts.filter(a => a.severity === 'warning').length;
        const infoCount = alerts.filter(a => a.severity === 'info').length;

        await notifyOwner({
          title: `FineGuard Daily Digest - ${user.name}`,
          content: `Daily compliance summary:\n` +
            `\uD83D\uDEA8 Critical: ${criticalCount}\n` +
            `\u26A0\uFE0F Warning: ${warningCount}\n` +
            `\u2139\uFE0F Info: ${infoCount}\n\n` +
            `Total unresolved alerts: ${alerts.length}`,
        });

        if (prefs.whatsappEnabled && prefs.whatsappNumber) {
          const message = `\uD83D\uDCCA *FineGuard Daily Digest*\n\n` +
            `\uD83D\uDEA8 Critical: ${criticalCount}\n` +
            `\u26A0\uFE0F Warning: ${warningCount}\n` +
            `\u2139\uFE0F Info: ${infoCount}\n\n` +
            `Total unresolved: ${alerts.length}`;

          await sendWhatsAppNotification(prefs.whatsappNumber, message);
        }

        if (prefs.smsEnabled && prefs.smsNumber) {
          await smsService.sendDailyDigest(prefs.smsNumber, {
            totalAlerts: alerts.length,
            criticalCount,
            warningCount,
            infoCount,
          });
        }
      }

      console.log('[Scheduler] Daily digests sent');
    } catch (error) {
      console.error('[Scheduler] Daily digest failed:', error);
    }
  }

  /**
   * Check if alert should be sent based on preferences
   */
  private shouldSendAlert(severity: string, prefs: any): boolean {
    if (severity === 'critical') return prefs.criticalAlertsEnabled;
    if (severity === 'warning') return prefs.warningAlertsEnabled;
    if (severity === 'info') return prefs.infoAlertsEnabled;
    return false;
  }

  /**
   * Send alert notification via enabled channels with white-label branding
   */
  private async sendAlertNotification(user: any, alert: any, prefs: any) {
    const branding = await getUserBranding(user.id);

    const alertContent = `
      <h2>${alert.alertType}</h2>
      <p><strong>Severity:</strong> ${alert.severity}</p>
      <p>${alert.description}</p>
      <p><strong>Due Date:</strong> ${alert.dueDate ? new Date(alert.dueDate).toLocaleDateString() : 'N/A'}</p>
    `;

    if (prefs.emailEnabled) {
      const emailTemplate = generateEmailTemplate(branding, alert.alertType, alertContent);

      const logId = await notificationLogger.logNotification({
        userId: user.id,
        channel: 'email',
        recipient: user.email || user.name,
        subject: emailTemplate.subject,
        message: alertContent,
        metadata: { alertId: alert.id, severity: alert.severity },
      });

      try {
        await notifyOwner({
          title: emailTemplate.subject,
          content: `${alert.description}\nDue: ${alert.dueDate ? new Date(alert.dueDate).toLocaleDateString() : 'N/A'}`,
        });
        await notificationLogger.markNotificationSent(logId);
      } catch (error) {
        await notificationLogger.markNotificationFailed(logId, String(error));
      }
    }

    if (prefs.whatsappEnabled && prefs.whatsappNumber) {
      const emoji = alert.severity === 'critical' ? '\uD83D\uDEA8' : alert.severity === 'warning' ? '\u26A0\uFE0F' : '\u2139\uFE0F';
      const baseMessage = `${emoji} ${alert.alertType}\n\n${alert.description}\nDue: ${alert.dueDate ? new Date(alert.dueDate).toLocaleDateString() : 'N/A'}`;
      const message = generateWhatsAppMessage(branding, baseMessage);

      const logId = await notificationLogger.logNotification({
        userId: user.id,
        channel: 'whatsapp',
        recipient: prefs.whatsappNumber,
        message,
        metadata: { alertId: alert.id, severity: alert.severity },
      });

      try {
        await sendWhatsAppNotification(prefs.whatsappNumber, message);
        await notificationLogger.markNotificationSent(logId);
      } catch (error) {
        await notificationLogger.markNotificationFailed(logId, String(error));
      }
    }

    if (prefs.smsEnabled && prefs.smsNumber) {
      const baseMessage = `${alert.alertType} - ${alert.description}`;
      const message = generateSMSMessage(branding, baseMessage);
      const logId = await notificationLogger.logNotification({
        userId: user.id,
        channel: 'sms',
        recipient: prefs.smsNumber,
        message,
        metadata: { alertId: alert.id, severity: alert.severity },
      });

      try {
        await smsService.sendAlertNotification(prefs.smsNumber, {
          companyName: alert.companyName || 'Your Company',
          alertType: alert.alertType,
          severity: alert.severity,
          description: alert.description,
        });
        await notificationLogger.markNotificationSent(logId);
      } catch (error) {
        await notificationLogger.markNotificationFailed(logId, String(error));
      }
    }

    const alertTitle = `${alert.alertType}${alert.companyName ? ` \u2014 ${alert.companyName}` : ''}`;
    const alertBody = `${alert.description}${alert.dueDate ? `\nDue: ${new Date(alert.dueDate).toLocaleDateString('en-GB')}` : ''}`;
    await dispatchAlertToChannels(
      user.id,
      alertTitle,
      alertBody,
      (alert.severity as 'critical' | 'warning' | 'info') ?? 'warning'
    );
  }

  /**
   * Run workflow optimization
   */
  private async runWorkflowOptimization() {
    console.log('[Scheduler] Running workflow optimization...');

    const dbInstance = await db.getDb();
    if (!dbInstance) {
      console.error('[Scheduler] Database not available');
      return;
    }

    try {
      const { workflowOptimizer } = await import('./workflowOptimizer');
      const { users } = await import('../../drizzle/schema');

      const allUsers = await dbInstance.select().from(users);

      let totalDedup = 0;
      let totalEscalated = 0;

      for (const user of allUsers) {
        const dedupResult = await workflowOptimizer.deduplicateAlerts(user.id);
        totalDedup += dedupResult.duplicatesRemoved;

        const escalated = await workflowOptimizer.escalateAlertsBySeverity(user.id);
        totalEscalated += escalated;
      }

      console.log(`[Scheduler] Workflow optimization completed: ${totalDedup} duplicates removed, ${totalEscalated} alerts escalated`);

      await notifyOwner({
        title: 'FineGuard Workflow Optimization Complete',
        content: `Optimized alerts for ${allUsers.length} users:\n` +
          `- Removed ${totalDedup} duplicate alerts\n` +
          `- Escalated ${totalEscalated} alerts based on deadlines`,
      });
    } catch (error) {
      console.error('[Scheduler] Workflow optimization failed:', error);
    }
  }

  /**
   * Escalate alerts based on days remaining
   */
  private async escalateAlerts() {
    console.log('[Scheduler] Running alert escalation...');

    const dbInstance = await db.getDb();
    if (!dbInstance) {
      console.error('[Scheduler] Database not available');
      return;
    }

    try {
      const { workflowOptimizer } = await import('./workflowOptimizer');
      const { users } = await import('../../drizzle/schema');

      const allUsers = await dbInstance.select().from(users);
      let totalEscalated = 0;

      for (const user of allUsers) {
        const escalated = await workflowOptimizer.escalateAlertsBySeverity(user.id);
        totalEscalated += escalated;
      }

      console.log(`[Scheduler] Alert escalation completed: ${totalEscalated} alerts escalated`);
    } catch (error) {
      console.error('[Scheduler] Alert escalation failed:', error);
    }
  }

  /**
   * Run compliance auto-notifications
   */
  private async runComplianceAutoNotifications() {
    console.log('[Scheduler] Running compliance auto-notifications...');

    const dbInstance = await db.getDb();
    if (!dbInstance) {
      console.error('[Scheduler] Database not available');
      return;
    }

    try {
      const { users, notificationPreferences } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      const { sendComplianceNotifications } = await import('./complianceNotifier');

      const allUsers = await dbInstance.select().from(users);
      let totalNotificationsSent = 0;
      let usersProcessed = 0;

      for (const user of allUsers) {
        try {
          const prefsResult = await dbInstance
            .select()
            .from(notificationPreferences)
            .where(eq(notificationPreferences.userId, user.id))
            .limit(1);
          const prefs = prefsResult[0];

          if (!prefs || !prefs.autoNotifyEnabled) continue;

          if (prefs.autoNotifyLastRunAt) {
            const lastRun = new Date(prefs.autoNotifyLastRunAt);
            const hoursSinceLastRun = (Date.now() - lastRun.getTime()) / (1000 * 60 * 60);

            if (prefs.autoNotifyFrequency === 'weekly' && hoursSinceLastRun < 168) continue;
            if (prefs.autoNotifyFrequency === 'biweekly' && hoursSinceLastRun < 336) continue;
          }

          const excludedIds = (prefs.excludedCompanyIds as number[]) || [];

          const severityFilter: ('critical' | 'warning' | 'info')[] = prefs.autoNotifyCriticalOnly
            ? ['critical']
            : ['critical', 'warning', 'info'];

          const result = await sendComplianceNotifications(user.id, {
            daysAhead: prefs.autoNotifyDaysBefore || 30,
            severityFilter,
          });

          totalNotificationsSent += result.notificationsSent;
          usersProcessed++;

          await dbInstance
            .update(notificationPreferences)
            .set({ autoNotifyLastRunAt: new Date() })
            .where(eq(notificationPreferences.userId, user.id));

          console.log(`[Scheduler] Sent ${result.notificationsSent} compliance notifications for user ${user.id}`);
        } catch (error) {
          console.error(`[Scheduler] Failed compliance auto-notify for user ${user.id}:`, error);
        }
      }

      console.log(`[Scheduler] Compliance auto-notifications completed: ${totalNotificationsSent} sent to ${usersProcessed} users`);

      if (totalNotificationsSent > 0) {
        await notifyOwner({
          title: 'Compliance Auto-Notifications Sent',
          content: `Sent ${totalNotificationsSent} compliance deadline notifications across ${usersProcessed} users.`,
        });
      }
    } catch (error) {
      console.error('[Scheduler] Compliance auto-notifications failed:', error);
    }
  }

  /**
   * Recalculate compliance risk scores for all monitored companies
   */
  private async recalculateAllRiskScores() {
    console.log('[Scheduler] Recalculating compliance risk scores...');

    const dbInstance = await db.getDb();
    if (!dbInstance) {
      console.error('[Scheduler] Database not available');
      return;
    }

    try {
      const { monitoredCompanies } = await import('../../drizzle/schema');
      const { calculateCompanyScore } = await import('../routers/complianceRiskRouter');

      const monitored = await dbInstance.select().from(monitoredCompanies);
      console.log(`[Scheduler] Recalculating scores for ${monitored.length} monitored companies...`);

      let successCount = 0;
      let failCount = 0;

      for (const entry of monitored) {
        try {
          const result = await calculateCompanyScore(entry.companyId);
          successCount++;
          await writeTimelineEvent({
            companyId: entry.companyId,
            eventType: 'risk_score_update',
            title: `Compliance risk score updated: ${result?.score ?? '?'}/100 (${result?.riskLevel ?? 'unknown'})`,
            notes: `Daily automated recalculation. Score: ${result?.score ?? '?'}, Level: ${result?.riskLevel ?? 'unknown'}.`,
            source: 'system',
          });
        } catch (error) {
          console.error(`[Scheduler] Failed to recalculate score for company ${entry.companyId}:`, error);
          failCount++;
        }
      }

      console.log(`[Scheduler] Risk score recalculation complete: ${successCount} succeeded, ${failCount} failed`);

      if (successCount > 0) {
        await notifyOwner({
          title: 'FineGuard Daily Risk Scores Updated',
          content: `Recalculated compliance risk scores for ${successCount} companies.`,
        });
      }
    } catch (error) {
      console.error('[Scheduler] Risk score recalculation failed:', error);
    }
  }

  /**
   * Monitor director changes across all monitored companies
   */
  private async monitorDirectorChanges() {
    console.log('[Scheduler] Monitoring director changes...');

    const dbInstance = await db.getDb();
    if (!dbInstance) {
      console.error('[Scheduler] Database not available');
      return;
    }

    try {
      const { companies, monitoredCompanies } = await import('../../drizzle/schema');
      const { eq } = await import('drizzle-orm');

      const monitored = await dbInstance
        .select({ companyId: monitoredCompanies.companyId, userId: monitoredCompanies.userId })
        .from(monitoredCompanies);

      const companyIds = Array.from(new Set(monitored.map(m => m.companyId)));
      const allCompanies = await dbInstance.select().from(companies).where(
        companyIds.length > 0
          ? (await import('drizzle-orm')).inArray(companies.id, companyIds)
          : eq(companies.id, -1)
      );

      let changesDetected = 0;

      for (const company of allCompanies) {
        try {
          const officers = await companiesHouseService.getOfficers(company.companyNumber);
          if (!officers || officers.length === 0) continue;

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          const recentChanges = officers.filter((o: any) => {
            const appointed = o.appointed_on ? new Date(o.appointed_on) : null;
            const resigned = o.resigned_on ? new Date(o.resigned_on) : null;
            return (appointed && appointed >= yesterday) || (resigned && resigned >= yesterday);
          });

          if (recentChanges.length > 0) {
            changesDetected += recentChanges.length;

            const usersMonitoring = monitored
              .filter(m => m.companyId === company.id)
              .map(m => m.userId);

            for (const userId of usersMonitoring) {
              await db.createAlert({
                userId,
                companyId: company.id,
                alertType: 'status_change',
                severity: 'warning',
                title: `Director Change: ${company.companyName}`,
                description: `${recentChanges.length} director change(s) detected for ${company.companyName}`,
                dueDate: null,
              });
            }

            const { directorEvents } = await import('../../drizzle/schema');
            for (const officer of recentChanges) {
              const isResignation = !!(officer.resigned_on && new Date(officer.resigned_on) >= yesterday);
              const eventDateMs = isResignation && officer.resigned_on
                ? new Date(officer.resigned_on as string).getTime()
                : officer.appointed_on
                ? new Date(officer.appointed_on as string).getTime()
                : Date.now();
              try {
                await dbInstance.insert(directorEvents).values({
                  companyId: company.id,
                  directorName: officer.name ?? 'Unknown',
                  eventType: isResignation ? 'resignation' : 'appointment',
                  eventDate: eventDateMs,
                  officerRole: officer.officer_role ?? null,
                  nationality: officer.nationality ?? null,
                  source: 'companies_house',
                  createdAt: Date.now(),
                });
              } catch (_dupErr) { /* ignore duplicate */ }
              await writeTimelineEvent({
                companyId: company.id,
                eventType: isResignation ? 'director_resignation' : 'director_appointment',
                title: isResignation
                  ? `Director resignation: ${officer.name ?? 'Unknown'}`
                  : `Director appointment: ${officer.name ?? 'Unknown'}`,
                notes: `Role: ${officer.officer_role ?? 'Unknown'}. Detected during daily monitoring.`,
                source: 'companies_house',
              });
            }

            console.log(`[Scheduler] ${recentChanges.length} director change(s) for ${company.companyName}`);
          }
        } catch (error) {
          console.error(`[Scheduler] Failed to check directors for ${company.companyNumber}:`, error);
        }
      }

      console.log(`[Scheduler] Director monitoring complete: ${changesDetected} changes detected across ${allCompanies.length} companies`);
    } catch (error) {
      console.error('[Scheduler] Director change monitoring failed:', error);
    }
  }

  /**
   * Run any pipelines whose cron schedule is due
   */
  private async runScheduledPipelines() {
    const dbInstance = await db.getDb();
    if (!dbInstance) return;
    try {
      const { pipelines, pipelineRuns, companyIntelligence } = await import('../../drizzle/schema');
      const { eq, and, isNotNull } = await import('drizzle-orm');
      const cronLib = await import('node-cron');
      const now = new Date();
      const activePipelines = await dbInstance.select().from(pipelines)
        .where(and(eq(pipelines.isActive, true), isNotNull(pipelines.schedule)));
      for (const pipeline of activePipelines) {
        if (!pipeline.schedule) continue;
        if (!cronLib.validate(pipeline.schedule)) continue;
        const lastRun = pipeline.lastRunAt;
        if (lastRun) {
          const msSinceLast = now.getTime() - lastRun.getTime();
          if (msSinceLast < 4 * 60 * 1000) continue;
        }
        const matches = (() => {
          try {
            const parts = pipeline.schedule.split(' ');
            if (parts.length !== 5) return false;
            const [min, hour, dom, month, dow] = parts;
            const matchField = (field: string, value: number, max: number): boolean => {
              if (field === '*') return true;
              if (field.startsWith('*/')) return value % parseInt(field.slice(2)) === 0;
              if (field.includes(',')) return field.split(',').map(Number).includes(value);
              if (field.includes('-')) {
                const [lo, hi] = field.split('-').map(Number);
                return value >= lo && value <= hi;
              }
              return parseInt(field) === value;
            };
            return matchField(min, now.getMinutes(), 59) &&
              matchField(hour, now.getHours(), 23) &&
              matchField(dom, now.getDate(), 31) &&
              matchField(month, now.getMonth() + 1, 12) &&
              matchField(dow, now.getDay(), 6);
          } catch { return false; }
        })();
        if (!matches) continue;
        console.log(`[Scheduler] Running scheduled pipeline: ${pipeline.name}`);
        try {
          const [runRow] = await dbInstance.insert(pipelineRuns).values({
            pipelineId: pipeline.id,
            userId: pipeline.userId,
            status: 'running',
            trigger: 'scheduled',
            startedAt: now,
          }).$returningId();
          const filterConfig = (pipeline.filterConfig ?? {}) as Record<string, unknown>;
          const CH_API_KEY = process.env.COMPANIES_HOUSE_API_KEY ?? '';
          const CH_API_BASE = 'https://api.company-information.service.gov.uk';
          let totalFetched = 0, totalImported = 0;
          const qs = new URLSearchParams();
          if (filterConfig.incorporatedFrom) qs.set('incorporated_from', String(filterConfig.incorporatedFrom));
          if (filterConfig.incorporatedTo) qs.set('incorporated_to', String(filterConfig.incorporatedTo));
          if (filterConfig.companyStatus) qs.set('company_status', String(filterConfig.companyStatus));
          qs.set('size', '100');
          qs.set('start_index', '0');
          const res = await fetch(`${CH_API_BASE}/advanced-search/companies?${qs}`, {
            headers: { Authorization: `Basic ${Buffer.from(`${CH_API_KEY}:`).toString('base64')}` },
            signal: AbortSignal.timeout(30000),
          });
          if (res.ok) {
            const data = await res.json() as { items?: unknown[] };
            totalFetched = (data.items ?? []).length;
            for (const item of (data.items ?? [])) {
              const co = item as Record<string, unknown>;
              const addr = (co.registered_office_address ?? {}) as Record<string, unknown>;
              const addressStr = [addr.address_line_1, addr.locality, addr.postal_code].filter(Boolean).join(', ');
              const existing = await dbInstance.select({ id: companyIntelligence.id })
                .from(companyIntelligence)
                .where(and(
                  eq(companyIntelligence.userId, pipeline.userId),
                  eq(companyIntelligence.companyNumber, String(co.company_number ?? ''))
                )).limit(1);
              if (existing.length > 0) continue;
              await dbInstance.insert(companyIntelligence).values({
                userId: pipeline.userId,
                companyName: String(co.company_name ?? 'Unknown'),
                companyNumber: String(co.company_number ?? ''),
                companyStatus: String(co.company_status ?? ''),
                registeredAddress: addressStr,
                enrichmentStatus: 'pending',
                contactStatus: 'new',
              });
              totalImported++;
            }
          }
          await dbInstance.update(pipelineRuns)
            .set({ status: 'completed', completedAt: new Date(), totalFetched, totalImported })
            .where(eq(pipelineRuns.id, runRow.id));
          await dbInstance.update(pipelines)
            .set({ lastRunAt: new Date() })
            .where(eq(pipelines.id, pipeline.id));
          console.log(`[Scheduler] Pipeline '${pipeline.name}' completed: ${totalImported} imported`);
          try {
            await notifyOwner({
              title: `\u2705 Pipeline Run Completed: ${pipeline.name}`,
              content: `Scheduled pipeline "${pipeline.name}" finished at ${new Date().toUTCString()}.\n\n` +
                `\u2022 Companies fetched from Companies House: ${totalFetched}\n` +
                `\u2022 New companies imported to Intelligence: ${totalImported}\n` +
                `\u2022 Trigger: scheduled (cron: ${pipeline.schedule ?? 'manual'})`,
            });
          } catch (notifyErr) {
            console.warn('[Scheduler] Failed to send pipeline completion notification:', notifyErr);
          }
        } catch (err) {
          console.error(`[Scheduler] Pipeline '${pipeline.name}' failed:`, err);
        }
      }
    } catch (err) {
      console.error('[Scheduler] runScheduledPipelines error:', err);
    }
  }

  /**
   * Run the FlowEngage outreach sequence engine
   */
  private async runFlowEngageSequence() {
    try {
      const { runFlowEngageSequence } = await import('../routers/flowEngageRouter');
      const result = await runFlowEngageSequence();
      if (result.sent > 0) {
        console.log(`[FlowEngage] Sequence run: ${result.sent} sent, ${result.skipped} skipped`);
        await notifyOwner({
          title: 'FlowEngage: Outreach sequence run complete',
          content: `Sent: ${result.sent} messages | Skipped: ${result.skipped} (no reply required / missing contact) | Total processed: ${result.processed}`,
        }).catch(() => {});
      }
    } catch (err) {
      console.error('[Scheduler] FlowEngage sequence error:', err);
    }
  }

  /**
   * Execute all pending scheduled bulk sends whose scheduled_at <= NOW().
   */
  private async runScheduledBulkSends() {
    const MAX_RETRIES = 3;
    const BACKOFF_MINUTES = [5, 15, 45];
    try {
      const dbInstance = await db.getDb();
      if (!dbInstance) return;
      const { pipelineBulkSends } = await import('../../drizzle/schema');
      const { eq, and, lte, or, lt, isNotNull } = await import('drizzle-orm');
      const now = new Date();

      const pendingSends = await dbInstance.select({ id: pipelineBulkSends.id })
        .from(pipelineBulkSends)
        .where(and(
          eq(pipelineBulkSends.status, 'pending'),
          lte(pipelineBulkSends.scheduledAt, now)
        ))
        .limit(20);

      const retrySends = await dbInstance.select({ id: pipelineBulkSends.id, retryCount: pipelineBulkSends.retryCount })
        .from(pipelineBulkSends)
        .where(and(
          eq(pipelineBulkSends.status, 'failed'),
          lt(pipelineBulkSends.retryCount, MAX_RETRIES),
          isNotNull(pipelineBulkSends.scheduledAt),
          lte(pipelineBulkSends.nextRetryAt, now)
        ))
        .limit(20);

      const allDue = [
        ...pendingSends.map(s => ({ id: s.id, isRetry: false, retryCount: 0 })),
        ...retrySends.map(s => ({ id: s.id, isRetry: true, retryCount: s.retryCount ?? 0 })),
      ];

      if (allDue.length === 0) return;
      console.log(`[Scheduler] Found ${pendingSends.length} pending + ${retrySends.length} retry bulk send(s) due`);

      const { executeBulkSend } = await import('../routers/pipelineRouter');
      for (const { id, isRetry, retryCount } of allDue) {
        try {
          const result = await executeBulkSend(id);
          if (isRetry) {
            console.log(`[Scheduler] Retry #${retryCount + 1} for bulk send #${id} complete \u2014 status: ${result.status}`);
          } else {
            console.log(`[Scheduler] Bulk send #${id} complete \u2014 sent: ${result.totalSent}, failed: ${result.totalFailed}, status: ${result.status}`);
          }
        } catch (err) {
          console.error(`[Scheduler] Bulk send #${id} failed (attempt ${retryCount + 1}):`, err);
          const nextRetryCount = retryCount + 1;
          if (nextRetryCount < MAX_RETRIES) {
            const delayMs = BACKOFF_MINUTES[nextRetryCount - 1] * 60 * 1000;
            const nextRetryAt = new Date(Date.now() + delayMs);
            await dbInstance.update(pipelineBulkSends)
              .set({
                status: 'failed',
                retryCount: nextRetryCount,
                nextRetryAt,
                errorMessage: err instanceof Error ? err.message : String(err),
              })
              .where(eq(pipelineBulkSends.id, id));
            console.log(`[Scheduler] Bulk send #${id} scheduled for retry ${nextRetryCount}/${MAX_RETRIES} at ${nextRetryAt.toISOString()}`);
          } else {
            await dbInstance.update(pipelineBulkSends)
              .set({
                status: 'failed',
                retryCount: nextRetryCount,
                nextRetryAt: null,
                errorMessage: `Permanently failed after ${MAX_RETRIES} attempts. Last error: ${err instanceof Error ? err.message : String(err)}`,
              })
              .where(eq(pipelineBulkSends.id, id));
            console.log(`[Scheduler] Bulk send #${id} permanently failed after ${MAX_RETRIES} attempts`);
          }
        }
      }
    } catch (err) {
      console.error('[Scheduler] runScheduledBulkSends error:', err);
    }
  }

  /**
   * Rebuild Companies House outbound segments
   */
  private async runChSegmentRebuild() {
    console.log('[Scheduler] Starting CH segment rebuild...');
    try {
      const stats = await buildOutboundSegments();
      console.log(
        `[Scheduler] CH segment rebuild complete: ${stats.totalInserted.toLocaleString()} rows ` +
        `(recent=${stats.recentIncorporations}, sme=${stats.activeSme}, compliance=${stats.upcomingComplianceWindow}) ` +
        `in ${(stats.durationMs / 1000).toFixed(1)}s`
      );
    } catch (err) {
      console.error('[Scheduler] CH segment rebuild failed:', err);
    }
  }

  /**
   * Generate outbound contact batches from the three CH segments
   */
  private async runChOutboundBatch() {
    console.log('[Scheduler] Starting CH outbound batch generation...');
    const OWNER_USER_ID = 1;
    const BATCH_SIZE = 500;
    const segments = ['RECENT_INCORPORATIONS', 'ACTIVE_SME', 'UPCOMING_COMPLIANCE_WINDOW'] as const;
    let totalInserted = 0;
    for (const seg of segments) {
      try {
        const result = await generateOutboundBatch(seg, BATCH_SIZE, OWNER_USER_ID);
        totalInserted += result.inserted;
        console.log(`[Scheduler] CH outbound batch ${seg}: ${result.inserted} contacts inserted into list ${result.listId}`);
      } catch (err) {
        console.error(`[Scheduler] CH outbound batch ${seg} failed:`, err);
      }
    }
    console.log(`[Scheduler] CH outbound batch complete: ${totalInserted} total contacts inserted`);
  }

  /**
   * Enrich unenriched or stale ch_companies rows
   */
  private async runChEnrichFromBulk() {
    console.log('[Scheduler] Starting CH enrichment from bulk dataset...');
    try {
      const summary = await enrichChCompanies({
        batchSize: 200,
        statusFilter: 'Active',
        triggeredBy: 'scheduler-ch-enrich',
        staleDays: 30,
      });
      console.log(
        `[Scheduler] CH enrichment complete \u2014 ` +
        `processed=${summary.rowsProcessed} enriched=${summary.rowsEnriched} ` +
        `skipped=${summary.rowsSkipped} failed=${summary.rowsFailed} ` +
        `durationMs=${summary.durationMs}`
      );
    } catch (err) {
      console.error('[Scheduler] CH enrichment from bulk failed:', err);
    }
  }

  /**
   * Monthly rolling CH bulk extract
   */
  private async runMonthlyBulkExtract() {
    console.log('[Scheduler] Starting monthly CH bulk extract (rolling 2-year window)...');
    try {
      const dbInstance = await db.getDb();
      if (!dbInstance) {
        console.error('[Scheduler] DB unavailable for monthly bulk extract');
        return;
      }

      const now = new Date();
      const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), 1);
      const twoYearsAgoEnd = new Date(now.getFullYear() - 2, now.getMonth() + 1, 0);
      const incorporatedFrom = twoYearsAgo.toISOString().slice(0, 10);
      const incorporatedTo = twoYearsAgoEnd.toISOString().slice(0, 10);

      const { chBulkImportJobs } = await import('../../drizzle/schema');
      const [inserted] = await dbInstance
        .insert(chBulkImportJobs)
        .values({
          incorporatedFrom,
          incorporatedTo,
          status: 'pending',
          triggeredBy: 'scheduler-monthly',
          createdAt: new Date(),
        })
        .$returningId();

      const jobId = inserted?.id;
      if (!jobId) {
        console.error('[Scheduler] Failed to create monthly bulk extract job');
        return;
      }

      console.log(
        `[Scheduler] Monthly bulk extract job #${jobId} created \u2014 ` +
        `window: ${incorporatedFrom} \u2192 ${incorporatedTo}`
      );

      runBulkImportJob(jobId).catch((err) => {
        console.error(`[Scheduler] Monthly bulk extract job #${jobId} failed:`, err);
      });

      await notifyOwner({
        title: 'Monthly CH Bulk Extract Started',
        content:
          `Job #${jobId} extracting companies incorporated ${incorporatedFrom} \u2192 ${incorporatedTo}. ` +
          `Results will be available in Admin \u2192 CH Bulk Extract.`,
      });
    } catch (err) {
      console.error('[Scheduler] Monthly bulk extract failed:', err);
    }
  }

  /**
   * Abandoned-check follow-up
   */
  private async runAbandonedCheckFollowUp(): Promise<void> {
    console.log('[Scheduler] abandoned-check-followup: starting...');
    const dbInstance = await db.getDb();
    if (!dbInstance) return;

    try {
      const { checkEvents, contacts, companies, outboundAlerts } = await import('../../drizzle/schema');
      const { sql, isNull, lt, and } = await import('drizzle-orm');

      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

      const pending = await dbInstance
        .select()
        .from(checkEvents)
        .where(and(
          isNull(checkEvents.followUpSentAt),
          lt(checkEvents.createdAt, sixHoursAgo)
        ))
        .limit(100);

      console.log(`[abandoned-check-followup] Found ${pending.length} abandoned checks`);

      let sent = 0;
      for (const event of pending) {
        try {
          const eligibleContacts = event.companyId
            ? await dbInstance
                .select()
                .from(contacts)
                .where(sql`${contacts.companyId} = ${event.companyId} AND (${contacts.consentSms} = 1 OR ${contacts.consentEmail} = 1)`)
                .limit(3)
            : [];

          const company = event.companyId
            ? (await dbInstance.select().from(companies).where(sql`${companies.id} = ${event.companyId}`).limit(1))[0]
            : null;

          const companyName = company?.companyName ?? event.companyNumber;
          const message = `FineGuard: You recently checked ${companyName}. Don't miss your filing deadlines \u2014 view your free compliance report at fineguardpro.com/check`;

          if (eligibleContacts.length > 0) {
            for (const contact of eligibleContacts) {
              await dbInstance.insert(outboundAlerts).values({
                companyId: event.companyId ?? 0,
                contactId: contact.id,
                channel: 'sms',
                alertType: 'follow_up',
                status: 'queued',
                destination: contact.encryptedPhone ?? '',
                bodySnippet: message,
                queuedAt: Date.now(),
                sourceJobId: 'abandoned-check-followup',
              });
            }
          }

          await dbInstance
            .update(checkEvents)
            .set({ followUpSentAt: new Date() })
            .where(sql`${checkEvents.id} = ${event.id}`);

          sent++;
        } catch (err) {
          console.error(`[abandoned-check-followup] Error processing event ${event.id}:`, err);
        }
      }

      console.log(`[abandoned-check-followup] Processed ${sent}/${pending.length} abandoned checks`);
    } catch (err) {
      console.error('[abandoned-check-followup] Fatal error:', err);
    }
  }

  /**
   * Payment fulfilment worker
   */
  private async runPaymentFulfilmentWorker(): Promise<void> {
    console.log('[Scheduler] payment-fulfilment-worker: starting...');
    const dbInstance = await db.getDb();
    if (!dbInstance) return;

    try {
      const { filings, outboundAlerts } = await import('../../drizzle/schema');
      const { sql } = await import('drizzle-orm');

      const queued = await dbInstance
        .select()
        .from(filings)
        .where(sql`${filings.status} = 'queued'`)
        .limit(50);

      console.log(`[payment-fulfilment-worker] Found ${queued.length} queued filings`);

      let processed = 0;
      for (const filing of queued) {
        try {
          await dbInstance
            .update(filings)
            .set({ status: 'submitted', submittedAt: new Date(), updatedAt: new Date() })
            .where(sql`${filings.id} = ${filing.id}`);

          publishEvent('filing.submitted', 'filing', String(filing.id), {
            filingType: filing.filingType,
            companyNumber: filing.companyNumber,
            companyId: filing.companyId,
            userId: filing.userId,
          }).catch(() => {});

          await dbInstance.insert(outboundAlerts).values({
            companyId: filing.companyId,
            userId: filing.userId,
            channel: 'email',
            alertType: 'filing_confirm',
            status: 'queued',
            destination: '',
            subject: `Filing submitted: ${filing.filingType} for ${filing.companyNumber}`,
            bodySnippet: `Your ${filing.filingType} filing for company ${filing.companyNumber} has been submitted to Companies House.`,
            queuedAt: Date.now(),
            sourceJobId: 'payment-fulfilment-worker',
          });

          processed++;
        } catch (err) {
          console.error(`[payment-fulfilment-worker] Error processing filing ${filing.id}:`, err);
          await dbInstance
            .update(filings)
            .set({ status: 'failed', failureReason: String(err), updatedAt: new Date() })
            .where(sql`${filings.id} = ${filing.id}`);
          publishEvent('filing.failed', 'filing', String(filing.id), {
            filingType: filing.filingType,
            companyNumber: filing.companyNumber,
            error: String(err),
          }).catch(() => {});
        }
      }

      if (processed > 0) {
        await notifyOwner({
          title: 'FineGuard Filing Worker',
          content: `Payment fulfilment worker processed ${processed}/${queued.length} queued filings.`,
        });
      }

      console.log(`[payment-fulfilment-worker] Processed ${processed}/${queued.length} filings`);
    } catch (err) {
      console.error('[payment-fulfilment-worker] Fatal error:', err);
    }
  }
}

// Export singleton instance
export const backgroundScheduler = new BackgroundScheduler();
