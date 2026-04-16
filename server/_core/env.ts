import { createNodeEnv, validateNodeEnv } from "./env-config.node";

const nodeEnv = createNodeEnv();

try {
  validateNodeEnv(nodeEnv);
} catch (error) {
  if (nodeEnv.nodeEnv === "production") {
    throw error;
  }
  console.warn(`[ENV] ${error instanceof Error ? error.message : String(error)}`);
}

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  appOrigin: nodeEnv.appOrigin,
  nodeEnv: nodeEnv.nodeEnv,
  cookieSecret: nodeEnv.jwtSecret,
  jwtSecret: nodeEnv.jwtSecret,
  databaseUrl: nodeEnv.databaseUrl,
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: nodeEnv.nodeEnv === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  stripeSecretKey: nodeEnv.stripeSecretKey,
  stripeWebhookSecret: nodeEnv.stripeWebhookSecret,
  resendApiKey: nodeEnv.resendApiKey,
  resendFromEmail: nodeEnv.resendFromEmail || "noreply@feralawareness.com",
  adminEmail: nodeEnv.adminEmail || "feralawareness@gmail.com",
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH ?? "",
};
