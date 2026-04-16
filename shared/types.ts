/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

// Re-export types from the database schema and error definitions for
// convenience. Consumers of this module can import from this file to
// access shared definitions without pulling them from disparate
// locations.
export type * from "../drizzle/schema";
export * from "./_core/errors";

// Import business constants and types from the centralised module. By
// aliasing them here, we maintain backwards compatibility with
// earlier versions of the code that expected these constants to be
// defined in this file. When adding new business constants in the
// future, prefer to define them in business‑constants.ts and re‑export
// them here if necessary.
import {
  SUBSCRIPTION_TIERS as BASE_SUBSCRIPTION_TIERS,
  TIER_HIERARCHY as BASE_TIER_HIERARCHY,
  hasAccessToTier as baseHasAccessToTier,
  UserRole,
  SubscriptionStatus,
  SubscriptionTier,
} from "./business-constants";

// Alias for the keys of SUBSCRIPTION_TIERS. Some parts of the
// application still refer to `SubscriptionTierKey` instead of the
// `SubscriptionTier` type. We define this alias to maintain
// backwards compatibility without changing call sites.
export type SubscriptionTierKey = keyof typeof BASE_SUBSCRIPTION_TIERS;

// Course section slugs used by the frontend. These values remain
// here because they are tightly coupled to UI rendering rather than
// business logic. If you need to add or remove sections, modify this
// constant accordingly.
export const MAIN_SECTIONS = [
  { slug: "start-here", title: "Start Here", icon: "Compass" },
  { slug: "teaching-of-the-path", title: "Teaching of the Path", icon: "BookOpen" },
  { slug: "112-yuktis", title: "112 Yuktis", icon: "Sparkles" },
  { slug: "visualizations", title: "Visualizations", icon: "Eye" },
  { slug: "deferred-live-practices", title: "Deferred Live Practices", icon: "Video" },
  { slug: "other-resources", title: "Other Resources", icon: "FolderOpen" },
] as const;

// Re-export the business constants and helper functions under their
// historical names. This ensures that existing imports in the codebase
// do not break. New code should prefer to import directly from
// shared/business‑constants.ts to make dependencies explicit.
export const SUBSCRIPTION_TIERS = BASE_SUBSCRIPTION_TIERS;
export const TIER_HIERARCHY = BASE_TIER_HIERARCHY;
export { baseHasAccessToTier as hasAccessToTier };

// Re-export the types for compatibility. Consumers can continue to
// import `UserRole`, `SubscriptionStatus` and `SubscriptionTier` from
// this module.
export type { UserRole, SubscriptionStatus, SubscriptionTier };
