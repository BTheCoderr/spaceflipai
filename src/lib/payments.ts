import type { SubscriptionPlan, UserProfile } from '../types/database';
import { QUOTA_LIMITS } from '../types/database';

export type SubscriptionStatus = {
  isPro: boolean;
  plan: SubscriptionPlan;
  generationsRemaining: number;
  generationsUsedThisMonth: number;
  trialAvailable: boolean;
  quotaResetAt?: string;
};

/**
 * Future RevenueCat integration placeholder.
 * Public SDK keys only in EXPO_PUBLIC_REVENUECAT_* — never secret keys in the app.
 */
export interface RevenueCatConfig {
  apiKey: string;
  entitlementId: string;
}

export const FREE_GENERATION_LIMIT = QUOTA_LIMITS.freeTotal;
export const PRO_MONTHLY_GENERATION_LIMIT = QUOTA_LIMITS.proMonthly;

let mockStatus: SubscriptionStatus = {
  isPro: false,
  plan: 'free',
  generationsRemaining: FREE_GENERATION_LIMIT,
  generationsUsedThisMonth: 0,
  trialAvailable: true,
};

function nextMonthIso(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1, 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Mock — replace with RevenueCat Purchases.getCustomerInfo() */
export function getSubscriptionStatusMock(): SubscriptionStatus {
  return { ...mockStatus };
}

/** Facade — mock until RevenueCat configured */
export function getSubscriptionStatus(): SubscriptionStatus {
  return getSubscriptionStatusMock();
}

export function toUserProfile(status: SubscriptionStatus, id = 'mock-user'): UserProfile {
  return {
    id,
    plan: status.plan,
    isPro: status.isPro,
    generationsRemaining: status.generationsRemaining,
    generationsUsedThisMonth: status.generationsUsedThisMonth,
    quotaResetAt: status.quotaResetAt,
    trialAvailable: status.trialAvailable,
    createdAt: new Date().toISOString(),
  };
}

/** No paywall is reachable in this build (no payments/subscriptions). */
export function openPaywallMock(): void {
  // Intentionally a no-op: there is no paywall route in the production build.
}

/** Mock — replace with RevenueCat purchasePackage() for weekly trial SKU */
export function startTrialMock(): SubscriptionStatus {
  mockStatus = {
    isPro: true,
    plan: 'pro',
    generationsRemaining: PRO_MONTHLY_GENERATION_LIMIT,
    generationsUsedThisMonth: 0,
    trialAvailable: false,
    quotaResetAt: nextMonthIso(),
  };
  return { ...mockStatus };
}

/** Mock — replace with RevenueCat restorePurchases() */
export function restorePurchasesMock(): SubscriptionStatus {
  return startTrialMock();
}

/** Check quota without consuming — used before job creation UI */
export function canUseGeneration(): boolean {
  if (mockStatus.isPro) {
    return mockStatus.generationsRemaining > 0;
  }
  return mockStatus.generationsRemaining > 0;
}

/** Check quota without consuming — used before job creation UI */
export function checkGenerationAllowed(): boolean {
  return canUseGeneration();
}

/** Consume one generation against quota — called by generation service */
export function consumeGenerationQuota(): boolean {
  if (!canUseGeneration()) return false;
  mockStatus.generationsRemaining -= 1;
  mockStatus.generationsUsedThisMonth += 1;
  return true;
}

/**
 * @deprecated Use canUseGeneration() + consumeGenerationQuota() via generation service.
 * Kept for backward compatibility with style-transfer.tsx.
 */
export function useGenerationMock(): boolean {
  if (!canUseGeneration()) return false;
  return consumeGenerationQuota();
}

/** Future RevenueCat — purchasePackage(entitlementId) */
export async function purchasePackageMock(_productId: string): Promise<SubscriptionStatus> {
  return startTrialMock();
}

/** Future RevenueCat — restorePurchases() */
export async function restorePurchases(): Promise<SubscriptionStatus> {
  return restorePurchasesMock();
}
