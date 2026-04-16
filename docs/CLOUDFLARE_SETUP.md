# Cloudflare Setup

## Key files
- `wrangler.jsonc` — build output dir (`dist/public`), compatibility flags
- `functions/api/[[route]].ts` — tRPC fetch adapter + Set-Cookie fix
- `functions/api/stripe/webhook.ts` — Stripe webhook handler

## How it works
Cloudflare Pages serves static assets from `dist/public`. The `functions/` directory
maps to URL paths automatically — no additional routing config needed:
- `functions/api/[[route]].ts` → catches all `/api/trpc/*` requests
- `functions/api/stripe/webhook.ts` → handles `POST /api/stripe/webhook`

## Set-Cookie fix
The tRPC fetch adapter does not forward `Set-Cookie` response headers automatically.
`functions/api/[[route]].ts` works around this using `HeadersContainer`:
it collects cookies written during the request, then appends them to the final
`Response` before returning to the client. Required for login/logout to work.

## Environment variables
Set in Cloudflare Pages dashboard → Settings → Environment Variables.
See `ENVIRONMENT.md` for the full list and `DEPLOYMENT.md` for setup order.

## To verify (first production deploy)
- [ ] `Set-Cookie` header present in login response (check Network tab)
- [ ] Session persists across page reloads
- [ ] Logout clears the cookie
- [ ] Stripe webhook receives events (check Stripe dashboard → Webhooks → logs)
- [ ] Webhook signing secret matches `STRIPE_WEBHOOK_SECRET` env var
- [ ] `APP_ORIGIN` matches actual deployed domain (affects CORS + redirects)
