import { mysqlTable, varchar, int, boolean, timestamp, text, decimal, json } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull().default(''),
  passwordHash: varchar('password_hash', { length: 255 }),
  plan: varchar('plan', { length: 50 }).notNull().default('starter'),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  onboardingCompleted: boolean('onboarding_completed').notNull().default(false),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const companies = mysqlTable('companies', {
  id: int('id').primaryKey().autoincrement(),
  companyNumber: varchar('company_number', { length: 20 }).notNull(),
  name: varchar('name', { length: 500 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  sicCodes: json('sic_codes').$type<string[]>().default([]),
  registeredAddress: text('registered_address'),
  incorporationDate: varchar('incorporation_date', { length: 20 }),
  accountsNextDue: varchar('accounts_next_due', { length: 20 }),
  confirmationNextDue: varchar('confirmation_next_due', { length: 20 }),
  lastRefreshed: timestamp('last_refreshed'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const monitoredCompanies = mysqlTable('monitored_companies', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id),
  companyId: int('company_id').notNull().references(() => companies.id),
  complianceScore: int('compliance_score').notNull().default(100),
  addedAt: timestamp('added_at').notNull().defaultNow(),
});

export const alerts = mysqlTable('alerts', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id),
  companyId: int('company_id').notNull().references(() => companies.id),
  type: varchar('type', { length: 100 }).notNull(),
  severity: varchar('severity', { length: 20 }).notNull().default('medium'),
  message: text('message').notNull(),
  dueDate: varchar('due_date', { length: 20 }),
  resolved: boolean('resolved').notNull().default(false),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const clients = mysqlTable('clients', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  notes: text('notes'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const stripeWebhookEvents = mysqlTable('stripe_webhook_events', {
  id: int('id').primaryKey().autoincrement(),
  eventId: varchar('event_id', { length: 255 }).notNull().unique(),
  type: varchar('type', { length: 100 }).notNull(),
  processedAt: timestamp('processed_at').notNull().defaultNow(),
});
