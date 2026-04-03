export const APP_NAME = 'FineGuard Pro';
export const APP_URL = 'https://fineguardpro.com';
export const SUPPORT_EMAIL = 'support@fineguardpro.com';
export const COMPANY_NUMBER = '16895564';

export function getLoginUrl(redirect?: string): string {
  return redirect ? `/auth?redirect=${encodeURIComponent(redirect)}` : '/auth';
}
