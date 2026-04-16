// Use centralised definitions from business‑constants. Maintaining
// compatibility by re‑exporting names expected elsewhere in the
// codebase. COOKIE_NAME and ONE_YEAR_MS now reference values
// defined in shared/business‑constants.ts.
import { COOKIE_NAME as BASE_COOKIE_NAME, SESSION_DURATION_MS } from "./business-constants";

export const COOKIE_NAME = BASE_COOKIE_NAME;
export const ONE_YEAR_MS = SESSION_DURATION_MS;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';
