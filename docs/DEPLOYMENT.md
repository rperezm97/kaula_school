# Deployment

## Stack
- **Frontend:** React 19 + Vite 7 (builds to `dist/public`)
- **Backend:** tRPC + Express (local) / Cloudflare Pages Functions (production)
- **Database:** PostgreSQL via Supabase
- **Payments:** Stripe Checkout + Webhooks
- **Email:** Resend
- **Hosting:** Cloudflare Pages

---

## Before first deploy

### 1. Stripe products (REQUIRED)
Create three products in your Stripe dashboard and update `shared/business-constants.ts`:

| Tier | Name | Price | Status |
|------|------|-------|--------|
| Lower | Sadhaka | €30/mo | ✅ real IDs present |
| Mid | Vira | €50/mo | ❌ placeholder — needs real IDs |
| Premium | Siddha | €70/mo | ❌ placeholder — needs real IDs |

After creating the products, replace `price_PLACEHOLDER_*` and `prod_PLACEHOLDER_*` in `shared/business-constants.ts`.

### 2. Environment variables (REQUIRED)
Set these in Cloudflare Pages dashboard → Settings → Environment Variables:

| Variable | Notes |
|----------|-------|
| `APP_ORIGIN` | e.g. `https://kaula.feralawareness.com` |
| `DATABASE_URL` | Supabase connection string (pooled, port 6543) |
| `JWT_SECRET` | 32+ random characters |
| `STRIPE_SECRET_KEY` | From Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | After registering webhook endpoint (see below) |
| `RESEND_API_KEY` | From resend.com |
| `RESEND_FROM_EMAIL` | e.g. `noreply@feralawareness.com` |
| `ADMIN_EMAIL` | `feral.awareness@gmail.com` |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of admin password |

### 3. Stripe webhook endpoint
In Stripe dashboard → Webhooks, add endpoint:
```
https://<your-domain>/api/stripe/webhook
```
Listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET`.

---

## Local development

```bash
pnpm install
cp .env.example .env   # fill in real values
pnpm dev               # starts Express server on localhost:5000
```

For Stripe webhook forwarding locally:
```bash
stripe listen --forward-to localhost:5000/api/stripe/webhook
```
Copy the webhook signing secret printed by the CLI → set as `STRIPE_WEBHOOK_SECRET` in `.env`.

---

## Build & deploy

```bash
pnpm build             # builds frontend to dist/public + server bundle to dist/
```

Cloudflare Pages picks up `dist/public` (set in `wrangler.jsonc` → `pages_build_output_dir`).
Functions in `functions/` are deployed automatically alongside the static assets.

---

## Architecture in production

```
Browser
  → Cloudflare Pages (static assets from dist/public)
  → /api/trpc/*   → functions/api/[[route]].ts  (tRPC fetch adapter)
  → /api/stripe/webhook → functions/api/stripe/webhook.ts
```

Cookie handling: `functions/api/[[route]].ts` uses `HeadersContainer` to propagate
`Set-Cookie` headers from tRPC responses — required because the fetch adapter does not
forward response headers automatically.

---

## Production verification checklist

Run this after each deploy:

### Auth
- [ ] Register new account
- [ ] Login → session cookie set
- [ ] Logout → cookie cleared
- [ ] Protected routes redirect to login when unauthenticated

### Billing
- [ ] Checkout creates Stripe session and redirects
- [ ] Webhook receives `checkout.session.completed` (check Stripe dashboard logs)
- [ ] User subscription status updates after webhook
- [ ] Success page redirects to courses

### Content
- [ ] Courses page loads
- [ ] Section view loads with videos
- [ ] Video player loads (Google Drive embed)
- [ ] Progress tracking saves

### Admin
- [ ] Admin login works
- [ ] User list visible
- [ ] Section/video management accessible

---

## Current status (2026-04-16)

| Item | Status |
|------|--------|
| Local Express runtime | ✅ working |
| Cloudflare Pages scaffold | ✅ in place (`wrangler.jsonc`, `functions/`) |
| Cookie propagation (Set-Cookie fix) | ✅ implemented in `functions/api/[[route]].ts` |
| Cloudflare production deploy | ⏳ not yet verified |
| Stripe Mid + Premium IDs | ❌ placeholders — needs real IDs |
| Environment variables on Cloudflare | ⏳ not yet set |
