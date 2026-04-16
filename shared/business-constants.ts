/**
 * Centralised business constants for Kaula School.
 *
 * This module consolidates various values and enums that are used
 * across the application. Keeping them in one place makes it
 * easier to reason about the overall business logic and reduces
 * the chance of discrepancies when the same concept is referred to
 * from multiple files. If you need to adjust a role name, tier
 * price or update the duration of a session, this is the file to
 * edit.
 */

// Roles available in the system. These values define the possible
// access levels a user can have. Use the `UserRole` type instead of
// re‑declaring strings elsewhere in the codebase.
export const ROLES = ["user", "admin"] as const;
export type UserRole = typeof ROLES[number];

// Subscription tiers offered by the school. Each tier contains
// metadata used for display and for integration with payment
// providers like Stripe. Replace the placeholder IDs with real
// values when they become available.
export const SUBSCRIPTION_TIERS = {
  lower: {
    name: "Sadhaka",
    description: "Foundation access to the school",
    price: 30,
    currency: "eur",
    stripePriceId: "price_1TBVsUE1gsgLDrsph7rPMiXS", // Real Stripe price
    stripeProductId: "prod_U9pXk6qJ9TKH2h",
  },
  mid: {
    name: "Vira",
    description: "Dedicated practitioner access",
    price: 50,
    currency: "eur",
    stripePriceId: "price_PLACEHOLDER_MID_TIER", // TODO: replace with real Stripe price ID
    stripeProductId: "prod_PLACEHOLDER_MID", // TODO: replace with real Stripe product ID
  },
  premium: {
    name: "Siddha",
    description: "Full immersion access",
    price: 70,
    currency: "eur",
    stripePriceId: "price_PLACEHOLDER_PREMIUM_TIER", // TODO: replace with real Stripe price ID
    stripeProductId: "prod_PLACEHOLDER_PREMIUM", // TODO: replace with real Stripe product ID
  },
} as const;
export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

// Subscription status values used to track the state of a user's
// subscription. These values map directly to typical Stripe
// subscription states. Use the `SubscriptionStatus` type instead of
// string literals.
export const SUBSCRIPTION_STATUSES = [
  "none",
  "active",
  "past_due",
  "canceled",
  "trialing",
] as const;
export type SubscriptionStatus = typeof SUBSCRIPTION_STATUSES[number];

// Hierarchy mapping for subscription tiers. Higher numbers mean
// greater access. When checking access rights, compare the numeric
// values instead of string comparisons.
export const TIER_HIERARCHY: Record<SubscriptionTier | "none", number> = {
  none: 0,
  lower: 1,
  mid: 2,
  premium: 3,
};

/**
 * Determines whether a user tier grants access to a required tier.
 *
 * @param userTier - The current tier of the user
 * @param requiredTier - The tier required to access a resource
 * @returns true if the user has sufficient access
 */
export function hasAccessToTier(
  userTier: keyof typeof TIER_HIERARCHY,
  requiredTier: keyof typeof TIER_HIERARCHY
): boolean {
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
}

// Cookie name used to store the session token. Keeping this value
// centralised makes it straightforward to change the cookie name
// system‑wide.
export const COOKIE_NAME = "app_session_id";

// Duration for which the session cookie is valid in milliseconds.
// 30 days: long enough that students don't get logged out mid-course,
// short enough to limit the blast radius of a stolen token.
export const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

// Minimum password length enforced during user registration and
// password reset. Adjust this value to increase password strength
// requirements.
export const PASSWORD_MIN_LENGTH = 10;

// Time in milliseconds before a reset token expires. Currently set
// to one hour. Modify this value to change how long users have to
// reset their password.
export const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour