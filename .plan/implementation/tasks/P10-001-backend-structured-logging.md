# P10-001 — Backend Structured Logging

**Phase:** 10 — Observability & Hardening
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P04-005
**Unlocks:** P10-004

---

## Purpose

Add structured JSON logging to all backend routes: request ID, userId, method, path, status code, and duration.

## Why It Exists

Without structured logging, debugging production issues requires reading raw log strings. Structured JSON logs can be queried and filtered. Lambda CloudWatch logs benefit significantly from consistent structure.

## Required Reading

- Phase 10 phase file: `phases/phase-10-hardening.md#structured logging` — log format spec

## Exact Scope

- Create `backend/src/middleware/requestLogger.ts`
- Middleware:
  1. Generate `requestId` (UUID v4) per request
  2. Set `res.locals.requestId = requestId`
  3. Set `res.locals.startTime = Date.now()`
  4. On response finish: emit the structured log line
- Log format:
  ```json
  {
    "level": "info",
    "requestId": "...",
    "method": "POST",
    "path": "/api/logs",
    "userId": "...",
    "statusCode": 201,
    "durationMs": 45,
    "ts": "2026-05-07T10:00:00.000Z"
  }
  ```
- Error responses add `"error": "message"` field
- Register middleware globally in `app.ts`

## Files Expected to Change

```
backend/src/middleware/requestLogger.ts     (new)
backend/src/app.ts                          (register middleware)
```

## Architecture Constraints

- No PII in logs: no food descriptions, no exact calorie values, no email addresses
- `userId` comes from `res.locals.userId` (set by auth middleware if authenticated)
- Unauthenticated requests: `userId: null`

## Acceptance Criteria

1. Every HTTP request produces a structured JSON log line on completion
2. Log includes requestId, method, path, statusCode, durationMs
3. No PII in any log line
4. Build passes

## Estimated Complexity

M — ~1.5 hours.

## Claude Execution Guidance

Use `res.on('finish', ...)` to emit the log after the response is sent. Use `Date.now() - res.locals.startTime` for duration. Use `JSON.stringify` to emit the log line to stdout.
