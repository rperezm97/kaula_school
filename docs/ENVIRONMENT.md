# Environment

## Required variables
- `APP_ORIGIN`
- `DATABASE_URL`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `ADMIN_EMAIL`

## Optional for local development
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

## Local notes
- If `RESEND_API_KEY` is empty, email delivery should be considered disabled for local testing.
- Stripe price IDs in `shared/business-constants.ts` must belong to your own Stripe account.
