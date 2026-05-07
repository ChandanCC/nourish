# P06-004 — Rate Limiting on /api/analyse

**Phase:** 06 — AI Synthesis
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** — (independent)
**Unlocks:** (hardening)

---

## Purpose

Add rate limiting middleware to `/api/analyse` to prevent abuse and uncontrolled Anthropic API spend.

## Why It Exists

The AI endpoint is a cost center. Without rate limiting, a client bug or malicious user could trigger thousands of AI calls. This is a production safety requirement.

## Required Reading

- `engineering/backend-architecture.md#middleware` — middleware conventions

## Exact Scope

- Install or use existing `express-rate-limit` package
- Apply rate limiter to `POST /api/analyse`:
  - 10 requests per minute per userId
  - Key: JWT userId (not IP address — mobile IPs are shared)
- Return 429 on breach: `{ error: "rate_limit", retryAfter: 60 }`
- Apply a separate, looser rate limit to `POST /api/signal`:
  - 5 requests per minute per userId

For v1.1: in-memory store (MemoryStore) is acceptable. Note that in a multi-Lambda environment, this is not shared state. Add a TODO for Redis-backed rate limiting in v1.2.

## Out of Scope

- Redis-backed rate limiting (v1.2)
- Rate limiting on other routes

## Files Expected to Change

```
backend/src/middleware/rateLimiter.ts   (new)
backend/src/routes/analyse.ts           (apply rateLimiter middleware)
backend/src/routes/signal.ts            (apply looser rateLimiter)
```

## Acceptance Criteria

1. 11th request to /api/analyse in 1 minute returns 429
2. 429 response includes `{ error: "rate_limit", retryAfter: 60 }`
3. Rate limit key is userId (not IP)
4. Build passes

## Estimated Complexity

M — ~1.5 hours.

## Claude Execution Guidance

Create a `createRateLimiter(requestsPerMinute: number)` factory function that returns express-rate-limit middleware configured with `keyGenerator: (req) => req.userId` (set by auth middleware). Apply different instances to /api/analyse and /api/signal.
