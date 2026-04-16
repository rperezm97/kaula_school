/**
 * Runtime environment configuration for Cloudflare Pages/Functions.
 *
 * Cloudflare injects variables via the `env` parameter passed to
 * functions. This helper constructs a `RuntimeEnv` object from those
 * bindings. Validation can be applied using `validateNodeEnv` from
 * env-config.node when appropriate.
 */

import type { RuntimeEnv } from "./env-config.node";

/**
 * Construct a `RuntimeEnv` from a Cloudflare environment binding.
 *
 * @param env The environment bindings provided to the Cloudflare
 * Functions handler.
 */
export function createCloudflareEnv(env: Record<string, any>): RuntimeEnv {
  return {
    appOrigin: env.APP_ORIGIN ?? "",
    nodeEnv: env.NODE_ENV ?? "",
    databaseUrl: env.DATABASE_URL ?? "",
    jwtSecret: env.JWT_SECRET ?? "",
    stripeSecretKey: env.STRIPE_SECRET_KEY ?? "",
    stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET ?? "",
    resendApiKey: env.RESEND_API_KEY ?? "",
    resendFromEmail: env.RESEND_FROM_EMAIL ?? "",
    adminEmail: env.ADMIN_EMAIL ?? "",
    cloudflareAccountId: env.CLOUDFLARE_ACCOUNT_ID,
    cloudflareStreamApiToken: env.CLOUDFLARE_STREAM_API_TOKEN,
  };
}