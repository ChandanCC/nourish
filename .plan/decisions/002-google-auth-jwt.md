# ADR 002: Google OAuth + JWT (no sessions)

**Status:** Accepted
**Date:** 2026-05-07

---

## Context

The initial implementation used anonymous UUID auth: a random UUID was generated on first app load, stored in localStorage, and sent as an `x-user-id` header. This meant:
- No identity — any two devices were different users
- No recovery — clearing localStorage lost all history
- No security — any client could pass any UUID

The product requires food logs to be scoped to a real user identity.

---

## Decision

**Google OAuth 2.0** for authentication, **JWT** for session management.

Flow:
1. Frontend: user taps "Sign in with Google" → Google returns an ID token
2. Frontend: POSTs ID token to `POST /auth/google`
3. Backend: verifies ID token with Google's OAuth2Client
4. Backend: issues a 30-day JWT signed with `JWT_SECRET`
5. Frontend: stores JWT in localStorage, sends as `Authorization: Bearer <token>` on every request
6. Backend: `requireAuth` middleware verifies JWT on all `/api/*` routes

User identity: Google `sub` claim (a stable, unique string per Google account) used as `userId` in MongoDB.

---

## Rationale

**Google OAuth (not email/password):**
- No password storage, no reset flow, no email verification
- Users already trust Google
- Implementation is simpler (no password hashing, no forgot-password flow)
- Covers 99% of target users who have a Google account

**JWT (not server sessions):**
- No session store required (no Redis, no DB sessions table)
- Stateless — works across Lambda cold starts and multi-region deploys
- 30-day expiry matches "I open this app occasionally" usage pattern
- Risk accepted: no server-side revocation. Logout is client-side (delete token from localStorage).

**localStorage (not httpOnly cookies):**
- This is a mobile-first web app; cookie handling across origins is complex
- JWT in localStorage is sufficient for the threat model (no XSS in a React SPA with no dangerouslySetInnerHTML)
- If XSS were a concern: switch to httpOnly cookies. Not a priority in v1.0.

---

## Consequences

- Anonymous history is not migrated — users who used the app pre-auth start fresh
- JWT secret rotation requires all users to re-login (acceptable; rare event)
- Token expiry is 30 days with no refresh — users re-authenticate monthly
- Google account closure = no recovery path (no fallback login method)

---

## Rejected Alternatives

**Supabase / Auth0:** Adds a vendor dependency for something solvable in ~100 lines. Avoided.

**Magic link email:** Simpler than OAuth but adds email infrastructure. Google OAuth is lower friction for target users.

**NextAuth.js:** Frontend is not Next.js; this lib's overhead isn't warranted.
