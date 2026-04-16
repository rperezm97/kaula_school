# Testing Checklist

## Core
- [ ] `pnpm exec tsc --noEmit` passes
- [ ] `pnpm dev` boots without crash
- [ ] Register works
- [ ] Login works
- [ ] Logout clears session
- [ ] Protected routes redirect correctly

## Billing
- [ ] Checkout creates Stripe session
- [ ] Webhook updates user subscription status
- [ ] Success page leads to courses after webhook update

## Content
- [ ] Courses page loads
- [ ] Section view loads
- [ ] Video page back button returns to section
