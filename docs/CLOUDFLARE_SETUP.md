# Cloudflare Setup

## Files
- `wrangler.jsonc`
- `functions/api/[[route]].ts`
- `functions/api/stripe/webhook.ts`

## Still to verify
- `Set-Cookie` propagation from tRPC responses
- login/logout on deployed preview
- Stripe webhook signature verification on preview/staging
- redirect URLs using real domain
