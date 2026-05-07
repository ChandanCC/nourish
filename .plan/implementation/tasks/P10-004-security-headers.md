# P10-004 — Security Headers + Production Hardening

**Phase:** 10 — Observability & Hardening
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P10-001
**Unlocks:** (v1.1 complete)

---

## Purpose

Add security headers to all API responses and apply production environment hardening.

## Why It Exists

Without security headers, the API is vulnerable to clickjacking, MIME sniffing, and other common attacks. Production hardening ensures secrets are never exposed in logs or responses.

## Required Reading

- Phase 10 phase file: `phases/phase-10-hardening.md#security headers` — required headers

## Exact Scope

- Install `helmet` package (if not already present) or add headers manually
- Apply to all responses:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Content-Security-Policy: default-src 'self'`
  - `Strict-Transport-Security: max-age=31536000` (production only — skip in development)
- Remove `X-Powered-By: Express` header
- Ensure `NODE_ENV` checks work correctly for production vs. development

Additional hardening:
- Confirm `ANTHROPIC_API_KEY` never appears in logs (check requestLogger doesn't log env vars)
- Confirm `JWT_SECRET` never appears in any response or log
- Set `cookie.secure = true` and `cookie.sameSite = 'Strict'` if cookies are used

## Files Expected to Change

```
backend/src/app.ts                      (add helmet/security middleware)
backend/src/middleware/security.ts      (new, if custom implementation)
```

## Architecture Constraints

- `E-INV-01`: Anthropic key never leaves backend (verify through code review)
- `E-INV-02`: JWT secret never in responses (verify)

## Acceptance Criteria

1. All API responses include `X-Frame-Options: DENY`
2. All API responses include `X-Content-Type-Options: nosniff`
3. `X-Powered-By` header is absent from all responses
4. HSTS header present in production
5. Build passes
6. No secrets appear in any log line (manual review)

## Estimated Complexity

M — ~1.5 hours.

## Claude Execution Guidance

If `helmet` is already a dependency, `app.use(helmet())` at the top of middleware chain handles most of this. Add `app.disable('x-powered-by')` explicitly. Conditionally add HSTS only in production: `if (process.env.NODE_ENV === 'production') { ... }`. Review requestLogger to confirm it doesn't log headers or environment variables.
