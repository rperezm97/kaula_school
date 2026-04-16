import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../server/routers";
import { createFetchContext } from "../../server/_core/context";
import { HeadersContainer } from "../../server/_core/headers-container";

export interface CloudflareEnv {
  [key: string]: unknown;
  APP_ORIGIN?: string;
  NODE_ENV?: string;
  DATABASE_URL?: string;
  JWT_SECRET?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD_HASH?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_STREAM_API_TOKEN?: string;
  VITE_APP_ID?: string;
  OAUTH_SERVER_URL?: string;
  OWNER_OPEN_ID?: string;
  BUILT_IN_FORGE_API_URL?: string;
  BUILT_IN_FORGE_API_KEY?: string;
}

export const onRequest: PagesFunction<CloudflareEnv> = async (context) => {
  const responseHeaders = new HeadersContainer();

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req: context.request,
    router: appRouter,
    createContext: async () =>
      createFetchContext({
        request: context.request,
        env: context.env,
        responseHeaders,
      }),
    onError({ error, path }) {
      console.error(`[tRPC] ${path ?? "<unknown>"}: ${error.message}`);
    },
  });

  if (!responseHeaders.hasSetCookieHeaders()) {
    return response;
  }

  const headers = new Headers(response.headers);
  for (const setCookie of responseHeaders.getSetCookieHeaders()) {
    headers.append("Set-Cookie", setCookie);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
