# Phase 10 — Observability & Hardening

**Status:** NOT_STARTED
**Tasks:** P10-001, P10-002, P10-003, P10-004
**Estimated duration:** 3–5 hours

---

## Purpose

Add structured logging, error boundaries, input validation, and security headers. This phase does not add features — it makes the existing system production-safe and observable.

---

## Prerequisites

- Phase 07 complete (integration done)
- Phase 06 complete (all API routes exist)

---

## Exit Conditions (Phase Complete When)

1. All backend routes emit structured JSON logs with request ID, userId, duration
2. Frontend has error boundaries that catch component errors without crashing the app
3. All POST/PATCH route bodies are validated with Zod schemas
4. Security headers are present on all responses (CSP, X-Frame-Options, etc.)
5. `npm run build -w backend` passes with 0 errors

---

## Tasks

| Task | What it does |
|---|---|
| P10-001 | Backend structured logging (JSON, request ID, duration) |
| P10-002 | Frontend error boundaries on all zone components |
| P10-003 | Backend input validation with Zod on all write routes |
| P10-004 | Security headers middleware + production environment hardening |

**Dependency order:** All tasks are independent.

---

## Architecture Constraints

- `architecture/ARCHITECTURE_INVARIANTS.md#E-INV-04` — all writes must be validated before processing
- `engineering/backend-architecture.md` — logging conventions, middleware order
- No new dependencies for logging (use existing `console.log` patterns, structured)

---

## Structured Logging (P10-001)

Every request emits a log line at completion:

```json
{
  "level": "info",
  "requestId": "uuid-v4",
  "method": "POST",
  "path": "/api/logs",
  "userId": "...",
  "statusCode": 201,
  "durationMs": 45,
  "ts": "2026-05-07T10:00:00.000Z"
}
```

- requestId generated per request via middleware, attached to `res.locals`
- Error responses include `"error": "message"` field
- No PII (food descriptions, exact calorie values) in logs

---

## Error Boundaries (P10-002)

Wrap each zone in an error boundary:

```tsx
<ErrorBoundary fallback={null}>
  <SignalZone ... />
</ErrorBoundary>
```

Fallback is `null` — the zone disappears, it does not show an error message. Other zones continue functioning. This matches the "absence is a design choice" principle.

---

## Zod Validation (P10-003)

Add Zod schemas for:
- POST /api/logs body
- PATCH /api/user/onboarding body
- POST /api/signal body

Return 422 with `{ error: "validation_error", issues: [...] }` on failure.

---

## Security Headers (P10-004)

Use `helmet` package (already in most Express stacks) or manually add:
- `Content-Security-Policy: default-src 'self'`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=31536000` (production only)

Remove `X-Powered-By` header.

---

## What Exists After This Phase

- Production-grade logging on all routes
- Frontend never fully crashes (error boundaries catch zone failures)
- All write routes validated at the boundary
- Security headers present
- App is production-ready for v1.1 launch
