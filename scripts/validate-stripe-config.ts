#!/usr/bin/env node
/*
 * Validate Stripe configuration for subscription tiers.
 *
 * This script inspects the subscription tier definitions in
 * `shared/business-constants.ts` and reports which price and
 * product identifiers appear to be placeholders. It does not modify
 * any files; rather, it serves as a guard to remind developers to
 * update placeholder values before deploying to production.
 */

import { SUBSCRIPTION_TIERS } from "../shared/business-constants";

type TierKey = keyof typeof SUBSCRIPTION_TIERS;

const report: Array<{ tier: TierKey; missing: string[] }> = [];

for (const tierName of Object.keys(SUBSCRIPTION_TIERS) as TierKey[]) {
  const tier = SUBSCRIPTION_TIERS[tierName];
  const missing: string[] = [];
  if (tier.stripePriceId.includes("PLACEHOLDER")) {
    missing.push("stripePriceId");
  }
  if (tier.stripeProductId.includes("PLACEHOLDER")) {
    missing.push("stripeProductId");
  }
  if (missing.length > 0) {
    report.push({ tier: tierName, missing });
  }
}

if (report.length === 0) {
  console.log("All subscription tiers have real Stripe IDs configured. ✅");
} else {
  console.warn("Some subscription tiers still have placeholder Stripe IDs:");
  for (const { tier, missing } of report) {
    console.warn(`- ${tier}: missing ${missing.join(" and ")}`);
  }
  console.warn(
    "Please update these values in shared/business-constants.ts before deploying to production."
  );
}

// Exit with a non-zero status code if any placeholders are found. This allows
// CI or build scripts to fail early when the Stripe configuration is
// incomplete. If there are no placeholders, exit with code 0.
process.exit(report.length > 0 ? 1 : 0);