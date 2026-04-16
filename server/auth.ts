import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
// Import centralised business constants. COOKIE_NAME and session duration
// come from business-constants via shared/const to maintain legacy exports.
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { PASSWORD_MIN_LENGTH, RESET_TOKEN_EXPIRY_MS } from "@shared/business-constants";
// Use runtime-agnostic cookie utilities for generating and parsing cookies
import {
  generateSetCookieHeader,
  generateClearCookieHeader,
  extractSessionToken,
} from "./_core/cookie-utils";
import type { RuntimeEnv } from "./_core/env-config.node";
// Retain existing Express helper for Node dev; in Cloudflare we will
// bypass this using cookie-utils functions.
import { getSessionCookieOptions } from "./_core/cookies";
import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./_core/env";
import * as db from "./db";
import type { Request, Response } from "express";
import type { User } from "../drizzle/schema";

const SALT_ROUNDS = 12;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getSecretKey() {
  return new TextEncoder().encode(ENV.cookieSecret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(userId: number, email: string, role: string): Promise<string> {
  const secretKey = getSecretKey();
  const expiresInMs = ONE_YEAR_MS;
  const expirationSeconds = Math.floor((Date.now() + expiresInMs) / 1000);

  return new SignJWT({
    userId,
    email,
    role,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<{ userId: number; email: string; role: string; openId: string } | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey, { algorithms: ["HS256"] });
    const { userId, email, role, openId } = payload as Record<string, unknown>;
    if (typeof userId !== "number" || typeof email !== "string") return null;
    return { userId, email, role: role as string, openId: openId as string };
  } catch {
    return null;
  }
}

export async function authenticateRequest(req: Request): Promise<User | null> {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  return authenticateCookieHeader(cookieHeader);
}

export async function registerUser(email: string, password: string, name?: string): Promise<{ user: User; token: string } | { error: string }> {
  const normalizedEmail = normalizeEmail(email);
  const existing = await db.getUserByEmail(normalizedEmail);
  if (existing) return { error: "An account with this email already exists" };

  if (password.length < PASSWORD_MIN_LENGTH) return { error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` };

  const passwordHash = await hashPassword(password);
  const openId = `local_${nanoid(16)}`;

  const isAdmin = normalizedEmail === ENV.adminEmail.toLowerCase();

  await db.upsertUser({
    openId,
    email: normalizedEmail,
    name: name ?? null,
    passwordHash,
    loginMethod: "email",
    role: isAdmin ? "admin" : "user",
    lastSignedIn: new Date(),
  });

  const user = await db.getUserByEmail(normalizedEmail);
  if (!user) return { error: "Failed to create account" };

  const token = await createSessionToken(user.id, user.email!, user.role);
  return { user, token };
}

export async function loginUser(email: string, password: string): Promise<{ user: User; token: string } | { error: string }> {
  const user = await db.getUserByEmail(normalizeEmail(email));
  if (!user || !user.passwordHash) return { error: "Invalid email or password" };

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { error: "Invalid email or password" };

  await db.updateUser(user.id, { lastSignedIn: new Date() });

  const token = await createSessionToken(user.id, user.email!, user.role);
  return { user, token };
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const user = await db.getUserById(userId);
  if (!user || !user.passwordHash) return { success: false, error: "User not found" };

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) return { success: false, error: "Current password is incorrect" };

  if (newPassword.length < PASSWORD_MIN_LENGTH) return { success: false, error: `New password must be at least ${PASSWORD_MIN_LENGTH} characters` };

  const newHash = await hashPassword(newPassword);
  await db.updateUser(userId, { passwordHash: newHash });
  return { success: true };
}

export async function generateResetToken(email: string): Promise<{ token: string } | { error: string }> {
  const user = await db.getUserByEmail(normalizeEmail(email));
  if (!user) return { error: "If an account exists with this email, a reset link has been sent" };

  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

  await db.updateUser(user.id, {
    resetToken: token,
    resetTokenExpiresAt: expiresAt,
  });

  return { token };
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const user = await db.getUserByResetToken(token);
  if (!user) return { success: false, error: "Invalid or expired reset token" };

  if (user.resetTokenExpiresAt && user.resetTokenExpiresAt < new Date()) {
    return { success: false, error: "Reset token has expired" };
  }

  if (newPassword.length < PASSWORD_MIN_LENGTH) return { success: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` };

  const newHash = await hashPassword(newPassword);
  await db.updateUser(user.id, {
    passwordHash: newHash,
    resetToken: null,
    resetTokenExpiresAt: null,
  });

  return { success: true };
}

export function setSessionCookie(res: Response, req: Request, token: string) {
  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
}

/**
 * Authenticate using a raw Cookie header string (runtime-agnostic).
 * Returns the user if the session cookie is valid and the user exists.
 */
export async function authenticateCookieHeader(
  cookieHeader: string
): Promise<User | null> {
  if (!cookieHeader) return null;
  const sessionCookie = extractSessionToken(cookieHeader, COOKIE_NAME);
  if (!sessionCookie) return null;
  const session = await verifySessionToken(sessionCookie);
  if (!session) return null;
  const user = await db.getUserById(session.userId);
  return user ?? null;
}

/**
 * Generate a Set-Cookie header string for a session token based on
 * RuntimeEnv. This is used in runtime-agnostic contexts such as
 * Cloudflare functions. It encapsulates the cookie name, value and
 * duration defined in business constants.
 */
export function getSessionCookieHeader(
  token: string,
  env: RuntimeEnv
): string {
  return generateSetCookieHeader(COOKIE_NAME, token, ONE_YEAR_MS, env);
}

/**
 * Generate a Set-Cookie header string that clears the session cookie.
 */
export function getClearSessionCookieHeader(env: RuntimeEnv): string {
  return generateClearCookieHeader(COOKIE_NAME, env);
}


/**
 * Runtime-agnostic helper to set the session cookie on either an Express
 * response or a Cloudflare headers container.
 */
export function setSessionCookieOnContext(
  ctx: { req?: Request; res?: Response; responseHeaders?: { appendSetCookie(value: string): void } },
  token: string,
  env: RuntimeEnv
) {
  if (ctx.res && ctx.req) {
    setSessionCookie(ctx.res, ctx.req, token);
    return;
  }

  if (ctx.responseHeaders) {
    ctx.responseHeaders.appendSetCookie(getSessionCookieHeader(token, env));
  }
}

/**
 * Runtime-agnostic helper to clear the session cookie on either an Express
 * response or a Cloudflare headers container.
 */
export function clearSessionCookieOnContext(
  ctx: { req?: Request; res?: Response; responseHeaders?: { appendSetCookie(value: string): void } },
  env: RuntimeEnv
) {
  if (ctx.res && ctx.req) {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return;
  }

  if (ctx.responseHeaders) {
    ctx.responseHeaders.appendSetCookie(getClearSessionCookieHeader(env));
  }
}
