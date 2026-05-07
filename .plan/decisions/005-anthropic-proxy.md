# ADR 005: All Anthropic API calls proxied through backend

**Status:** Accepted
**Date:** 2026-05-07

---

## Context

The initial implementation called the Anthropic API directly from the browser (React frontend). This caused:
1. **CORS failure** — Anthropic's API does not serve CORS headers for direct browser requests
2. **API key exposure** — The key was embedded in the Vite bundle (even via `import.meta.env`, it was readable in the browser)
3. **No server-side audit trail** — impossible to log, rate-limit, or monitor AI usage

---

## Decision

All Anthropic API calls are made from the **Express backend** only. The frontend sends text to `POST /api/analyse`, the backend calls the Anthropic API with the server-side key, and returns the structured result.

```
Frontend → POST /api/analyse { text: "..." }
Backend  → Anthropic API (claude-sonnet-4-6)
Backend  ← { result: "..." }
Frontend ← { result: "..." }
```

The `ANTHROPIC_API_KEY` is stored in `backend/.env` only. It is never in any frontend file.

---

## Rationale

**Security:** API keys in browser bundles are compromised keys. Even with Vite's env handling, the key appears in the compiled JS and can be extracted by anyone who opens DevTools.

**CORS:** The Anthropic API is designed for server-to-server use. Accessing it from the browser requires a special `anthropic-dangerous-direct-browser-access` header — which is a signal that the pattern is wrong.

**Control:** Backend proxying enables: per-user rate limiting, request logging, token usage tracking, prompt injection filtering. None of these are possible when the API is called from the client.

**Cost management:** Without backend visibility, there is no way to detect abuse (someone replaying the frontend request loop to burn API credits).

---

## Consequences

- The `SYSTEM_PROMPT` lives server-side (backend `routes/analyse.ts`), not in the frontend. This is also better for security — the prompt is not user-visible.
- Latency adds ~10ms for the extra network hop (frontend → backend → Anthropic vs. frontend → Anthropic). Acceptable.
- The `/api/analyse` endpoint is protected by `requireAuth` middleware — only authenticated users can trigger AI analysis.
- The model (`claude-sonnet-4-6`) is set server-side. Frontend cannot change the model.

---

## Model Selection

Current: `claude-sonnet-4-6`

Rationale: Sonnet 4.6 provides sufficient quality for food parsing and SIGNAL computation at reasonable cost. Claude Opus 4.7 would add cost without meaningful quality improvement for structured extraction tasks. Haiku would be faster/cheaper but may degrade accuracy on complex multi-item log entries.

Revisit: if food parsing accuracy becomes a reported issue, try Opus. If cost becomes a concern, benchmark Haiku on the test set.
