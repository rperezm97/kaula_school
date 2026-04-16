/**
 * Cookie utility functions to generate, clear and parse HTTP cookies in a
 * runtime-agnostic way. These helpers can be used in both Node and
 * Cloudflare environments where there is no Express `res.cookie()`
 * convenience method. They generate header strings directly which can
 * be set on a Response object via `Set-Cookie`.
 */

import type { RuntimeEnv } from "./env-config.node";

// Determine if a hostname represents a plain IPv4 address. Basic check.
function isIPv4(hostname: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
}

// Build a domain attribute based on the appOrigin. For localhost or IP
// addresses, domain should not be set. For custom domains, prefix with
// a dot so the cookie is available on subdomains.
function getDomainAttribute(appOrigin: string): string | undefined {
  try {
    const url = new URL(appOrigin);
    const hostname = url.hostname;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      isIPv4(hostname)
    ) {
      return undefined;
    }
    // Add leading dot to enable cookie on subdomains
    return hostname.startsWith(".") ? hostname : `.${hostname}`;
  } catch {
    return undefined;
  }
}

/**
 * Generate a Set-Cookie header string for a session token.
 *
 * @param name The cookie name
 * @param value The cookie value
 * @param maxAgeMs Max age in milliseconds
 * @param env The runtime environment used to determine secure/domain settings
 */
export function generateSetCookieHeader(
  name: string,
  value: string,
  maxAgeMs: number,
  env: RuntimeEnv
): string {
  const attributes: string[] = [];
  attributes.push(`${name}=${value}`);
  attributes.push("Path=/");
  attributes.push(`Max-Age=${Math.floor(maxAgeMs / 1000)}`);
  attributes.push("HttpOnly");
  // Use SameSite=Lax as a reasonable default for CSRF protection while allowing GET navigation
  attributes.push("SameSite=Lax");

  const domain = getDomainAttribute(env.appOrigin);
  if (domain) attributes.push(`Domain=${domain}`);
  // Only set Secure in production. For development (localhost) it must be omitted.
  if (env.nodeEnv === "production") attributes.push("Secure");

  return attributes.join("; ");
}

/**
 * Generate a Set-Cookie header string that clears an existing cookie by
 * setting its value to empty and maxAge to zero. Secure and domain
 * attributes mirror those of the set cookie.
 *
 * @param name The cookie name
 * @param env The runtime environment
 */
export function generateClearCookieHeader(
  name: string,
  env: RuntimeEnv
): string {
  const attributes: string[] = [];
  attributes.push(`${name}=`);
  attributes.push("Path=/");
  attributes.push("Max-Age=0");
  attributes.push("HttpOnly");
  attributes.push("SameSite=Lax");
  const domain = getDomainAttribute(env.appOrigin);
  if (domain) attributes.push(`Domain=${domain}`);
  if (env.nodeEnv === "production") attributes.push("Secure");
  return attributes.join("; ");
}

/**
 * Parse a Cookie header string into an object map. If a cookie is
 * repeated, the last value wins.
 */
export function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const [rawName, rawValue] = pair.trim().split("=");
    if (!rawName) continue;
    cookies[rawName] = rawValue ?? "";
  }
  return cookies;
}

/**
 * Extract a session token from a cookie header. Returns null if not
 * present. The cookie name should come from business constants.
 */
export function extractSessionToken(
  cookieHeader: string,
  name: string
): string | null {
  const cookies = parseCookies(cookieHeader);
  return cookies[name] ?? null;
}