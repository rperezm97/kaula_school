import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { authenticateCookieHeader } from "../auth";
import { HeadersContainer } from "./headers-container";
import { ENV } from "./env";
import { createCloudflareEnv } from "./env-config.cloudflare";
import type { RuntimeEnv } from "./env-config.node";

export type TrpcContext = {
  req?: CreateExpressContextOptions["req"];
  res?: CreateExpressContextOptions["res"];
  user: User | null;
  responseHeaders: HeadersContainer;
  runtimeEnv: RuntimeEnv;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const responseHeaders = new HeadersContainer();
  let user: User | null = null;

  try {
    user = await authenticateCookieHeader(opts.req.headers.cookie ?? "");
  } catch {
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    responseHeaders,
    runtimeEnv: ENV,
  };
}

export async function createFetchContext(opts: {
  request: Request;
  env?: Record<string, unknown>;
  responseHeaders: HeadersContainer;
}): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await authenticateCookieHeader(opts.request.headers.get("cookie") ?? "");
  } catch {
    user = null;
  }

  return {
    user,
    responseHeaders: opts.responseHeaders,
    runtimeEnv: createCloudflareEnv(opts.env ?? {}),
  };
}
