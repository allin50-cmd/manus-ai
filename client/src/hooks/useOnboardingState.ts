import { useState, useCallback } from 'react';

const STORAGE_KEY = 'fg_onboarding';

interface OnboardingState {
  step?: string;
  companyName?: string;
  companyNumber?: string;
  alertTypes?: string[];
  notificationEmail?: string;
  notificationPhone?: string;
  [key: string]: unknown;
}

function readState(): OnboardingState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as OnboardingState;
  } catch {
    return {};
  }
}

function writeState(state: OnboardingState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage unavailable — silently ignore
  }
}

export function useOnboardingState() {
  const [state, setState] = useState<OnboardingState>(readState);

  const updateState = useCallback((partial: Partial<OnboardingState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      writeState(next);
      return next;
    });
  }, []);

  const clearState = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setState({});
  }, []);

  return { state, updateState, clearState };
}

export function stepToPath(step: string): string {
  switch (step) {
    case 'welcome':
      return '/onboarding/welcome';
    case 'company':
      return '/onboarding/company';
    case 'alerts':
      return '/onboarding/alerts';
    case 'notifications':
      return '/onboarding/notifications';
    case 'complete':
      return '/onboarding/complete';
    default:
      return '/onboarding/welcome';
  }
}
