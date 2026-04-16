# Architecture

## Current stack
- React + Vite frontend
- Express + tRPC backend for local development
- Drizzle ORM with MySQL
- Stripe Checkout + Customer Portal
- Cloudflare Pages Functions scaffold in `functions/`

## Runtime model
- Local development uses Node/Express from `server/_core/index.ts`
- Cloudflare deployment uses `functions/api/[[route]].ts` and `functions/api/stripe/webhook.ts`
- Cookie writing is routed through `server/_core/cookie-utils.ts` and `server/_core/headers-container.ts`

## Remaining big tasks
1. PlanetScale adapter migration in `server/db.ts` and `drizzle.config.ts`
2. Real Cloudflare staging verification with cookies and Stripe webhook
3. Final dependency pruning once production features are frozen
