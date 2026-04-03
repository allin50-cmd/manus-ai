/**
 * shared/publicPaths.ts
 *
 * Single source of truth for PUBLIC_PATHS — routes that are served without
 * the authenticated sidebar shell (they have their own nav or are marketing pages).
 *
 * Imported by:
 *   - client/src/App.tsx  (runtime routing)
 *   - server/publicPaths.test.ts  (regression guard)
 *
 * IMPORTANT: /devonshire-green must NOT appear here.
 * That route is admin-gated and must only be accessible to authenticated admins.
 */
export const PUBLIC_PATHS: readonly string[] = [
  '/',
  '/landing',
  '/check',
  '/accountants',
  '/pricing-services',
  '/onboarding',
  '/agent-app',
  '/deadline-checker',
  '/company-deadline-checker',
  '/widget',
  '/mobile',
  '/agent',
  '/mobile/demo',
  '/check-companies-house-deadlines',
  '/companies-house-penalties',
  '/confirmation-statement-deadline',
  '/late-filing-penalty-appeal',
  '/unsubscribe',
  '/terms',
  '/privacy',
  '/sitemap',
  '/about',
  '/contact',
  '/modern-slavery',
  '/regulatory',
  '/cookies',
  '/pricing',
] as const;
