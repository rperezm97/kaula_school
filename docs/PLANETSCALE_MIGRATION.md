# PlanetScale Migration

## Goal
Replace direct MySQL driver usage with the PlanetScale HTTP driver and Drizzle PlanetScale adapter.

## Planned changes
1. Add `@planetscale/database`
2. Update `server/db.ts` to select PlanetScale adapter when using a PlanetScale connection string
3. Update `drizzle.config.ts` for PlanetScale-compatible migrations
4. Re-test auth, courses, bookmarks and webhook writes

## Why this is not finished here
The current local app is using standard MySQL successfully. PlanetScale migration should be done as a focused pass so billing/auth queries can be checked one by one instead of introducing fresh chaos everywhere at once.
