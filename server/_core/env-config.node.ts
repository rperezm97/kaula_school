/**
 * Runtime environment configuration for Node.js execution.
 *
 * In the Node runtime (development and local builds), environment
 * variables are pulled from `process.env`. This module defines a
 * strict shape for required variables and provides helper functions
 * to construct and validate a runtime configuration object. Having a
 * centralised helper makes it easy to migrate the same logic to
 * Cloudflare bindings later on without duplicating validation logic.
 */

export interface RuntimeEnv {
  appOrigin: string;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  resendApiKey: string;
  resendFromEmail: string;
  adminEmail: string;
  cloudflareAccountId?: string;
  cloudflareStreamApiToken?: string;
}

/**
 * Construct a `RuntimeEnv` from the current Node process environment.
 *
 * Defaults to empty strings for unset variables. You should call
 * `validateNodeEnv` on the returned value to ensure required
 * variables are present before proceeding.
 */
export function createNodeEnv(): RuntimeEnv {
  return {
    appOrigin: process.env.APP_ORIGIN ?? "",
    nodeEnv: process.env.NODE_ENV ?? "",
    databaseUrl: process.env.DATABASE_URL ?? "",
    jwtSecret: process.env.JWT_SECRET ?? "",
    stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
    resendApiKey: process.env.RESEND_API_KEY ?? "",
    resendFromEmail: process.env.RESEND_FROM_EMAIL ?? "",
    adminEmail: process.env.ADMIN_EMAIL ?? "",
    cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    cloudflareStreamApiToken: process.env.CLOUDFLARE_STREAM_API_TOKEN,
  };
}

/**
 * Validate that a given environment has the required fields. Throws
 * descriptive errors if any mandatory variables are missing. Optional
 * variables may remain empty; required variables are those that
 * would break application behaviour if absent.
 */
export function validateNodeEnv(env: RuntimeEnv): void {
  const missing: string[] = [];
  if (!env.appOrigin) missing.push("APP_ORIGIN");
  if (!env.databaseUrl) missing.push("DATABASE_URL");
  if (!env.jwtSecret) missing.push("JWT_SECRET");
  if (!env.stripeSecretKey) missing.push("STRIPE_SECRET_KEY");
  // stripeWebhookSecret is optional in dev, but required in production. Leave
  // validation to runtime checks in the webhook handler.
  if (!env.resendApiKey) missing.push("RESEND_API_KEY");
  if (!env.resendFromEmail) missing.push("RESEND_FROM_EMAIL");
  if (!env.adminEmail) missing.push("ADMIN_EMAIL");
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}