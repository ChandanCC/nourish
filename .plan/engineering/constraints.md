# Engineering Constraints

**Status:** Active — v1.0
**Last updated:** 2026-05-07

Constraints that every engineering decision must work within. Not preferences — hard limits.

---

## Infrastructure Constraints

### MongoDB Atlas M0 — 512MB storage limit

The free tier has a 512MB storage cap. At ~2KB per log entry:
- 512MB / 2KB = ~256,000 entries
- 1 user logging 5× per day for 3 years = ~5,475 entries
- The limit supports ~47 heavy users at capacity, or hundreds of light users

**Implication:** No concern in v1.0. Watch if MAU exceeds ~50. Upgrade to M10 ($57/month) when approaching 400MB.

### AWS Lambda cold starts — ~800ms

The backend runs on Lambda. Cold starts (no warm instance) add ~800ms latency. Subsequent requests on warm instances are ~50–100ms.

**Implication:** Don't design interactions that require sub-100ms backend response. Food analysis (which calls Anthropic) is already ~2–4 seconds; Lambda cold start is noise within that.

If cold starts become user-perceivable for critical paths: add a Lambda warmer (ping every 5 minutes).

### CloudFront caching — static assets only

Frontend is served from S3 via CloudFront. API calls bypass CloudFront (go directly to API Gateway). No edge caching for API responses.

**Implication:** API responses are not cached. Cache-Control headers on `/api/logs` are ignored by CloudFront. If read performance becomes an issue, add a caching layer in the Express app.

---

## Cost Constraints

### Anthropic API — token cost

Every food log entry makes one API call. Model: claude-sonnet-4-6.

Approximate cost per call:
- Input: ~500 tokens (system prompt + user entry)
- Output: ~200 tokens (structured JSON response)
- Total: ~700 tokens × ~$0.003/1K = ~$0.002 per entry

At 50 DAU × 5 logs/day = 250 calls/day = ~$0.50/day = ~$15/month.

**Implication:** Sustainable at current scale. Watch at 500+ DAU. Optimize by batching multiple entries in a single call when possible.

### AWS Lambda + API Gateway

~1,250 API calls/day at current projection = ~37,500/month. Well within Lambda free tier (1M calls/month).

**Implication:** No cost concern until ~10K DAU.

---

## Browser / Platform Constraints

### Mobile-first, PWA

The target user accesses on mobile (iPhone, primarily). Every layout decision is made for a 390px–430px viewport first.

Desktop is not a priority in v1.0. The app renders acceptably on desktop but is not optimized for it.

### No native device APIs

Running as a web app (not Capacitor/React Native) means:
- No HealthKit access → manual workout logging only
- No reliable push notifications on iOS (Safari PWA limitations)
- No background sync
- No haptic feedback API

**Implication:** See `future-ideas/native-app.md` for the path to native.

---

## Security Constraints

### JWT in localStorage

The JWT is stored in `localStorage`. This is acceptable for the current threat model but means:
- No automatic expiry enforcement (client must check `exp` claim)
- XSS attack can steal the token — mitigated by not using `dangerouslySetInnerHTML` and keeping dependency surface minimal
- No server-side revocation

**Constraint:** Do not store sensitive data beyond the JWT token and basic user profile (name, email, picture URL). The JWT payload contains only `userId`, `email`, `name`.

### API key in backend only

`ANTHROPIC_API_KEY` and `JWT_SECRET` must never appear in:
- Frontend source code
- Git history
- CloudFront served files
- Console logs

Verified: both are in `backend/.env` only. `backend/.env` is in `.gitignore`.

### MongoDB Atlas network access

Atlas M0 is configured to accept connections from anywhere (`0.0.0.0/0`) for development simplicity. For production hardening: restrict to Lambda's egress IP range (requires NAT Gateway, which has cost implications on Lambda).

**Current posture:** Accept for v1.0. Revisit at v1.2.

---

## Development Constraints

### No TypeScript strict mode violations

The backend and frontend both have strict TypeScript enabled. `any` types should be avoided. Type assertions (`as SomeType`) require a comment explaining why.

### No direct Anthropic API calls from frontend

Hard rule. See `decisions/005-anthropic-proxy.md`.

### Database migrations

There are no formal migrations in v1.0. Schema changes are applied by updating the Mongoose model and handling old documents gracefully (optional fields with defaults).

If a breaking schema change is needed: write a one-time migration script and document it here.
