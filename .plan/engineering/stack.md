# Engineering Stack

**Status:** Active — v1.0
**Last updated:** 2026-05-07

---

## Overview

```
Frontend    React 19 + Vite + TypeScript + Tailwind CSS
Backend     Express 5 + TypeScript + Mongoose
Database    MongoDB Atlas M0 (free tier)
AI          Anthropic API (claude-sonnet-4-6) — server-side proxy only
Auth        Google OAuth 2.0 + JWT (jsonwebtoken)
Infra       AWS Lambda (SAM) + S3 + CloudFront (CDK)
Dev         npm workspaces + concurrently + nodemon
```

---

## Frontend

**React 19 + Vite**
- Vite for fast HMR and optimized builds
- React 19 — no specific 19-only features in use yet; chosen for currency
- TypeScript throughout

**State Management**
- TanStack Query (React Query) for server state (API data, loading, caching)
- React `useState` / `useReducer` for local UI state
- No Zustand, Redux, or Jotai — unnecessary for current complexity

**Styling**
- Tailwind CSS v3
- Custom CSS variables for design tokens (BG, INK, GOLD, STATUS) — not yet fully wired in v1.0; used as plain hex values currently
- `index.css` for custom component classes (`.tab-btn`, `.day-pill`)

**Key Dependencies**
```json
{
  "@tanstack/react-query": "^5.x",
  "@react-oauth/google": "^0.12.x",
  "tailwindcss": "^3.x"
}
```

**Dev Port**
Vite dev server: `:5174` (`:5173` was in use; Vite auto-bumped)

---

## Backend

**Express 5 + TypeScript**
- Express 5 (async error handling improvements over v4)
- Compiled with `tsc`, run with `ts-node` in development
- `serverless-http` wraps the Express app for Lambda compatibility

**Route Structure**
```
GET  /health              — Health check (unauthenticated)
POST /auth/google         — Google OAuth verification + JWT issue
POST /api/logs            — Log a food/workout entry (auth required)
GET  /api/logs            — Fetch log history (auth required)
DELETE /api/logs/:id      — Delete a log entry (auth required)
POST /api/analyse         — Proxy to Anthropic API (auth required)
```

**Key Dependencies**
```json
{
  "express": "^5.x",
  "mongoose": "^8.x",
  "google-auth-library": "^9.x",
  "jsonwebtoken": "^9.x",
  "@anthropic-ai/sdk": "^0.x",
  "serverless-http": "^3.x",
  "helmet": "^7.x",
  "morgan": "^1.x"
}
```

---

## Database

**MongoDB Atlas M0** (free tier, 512MB storage limit)

Collections:
- `logs` — food and workout entries, keyed by `userId` (Google `sub`)

Schema evolves via Mongoose; no formal migrations in v1.0.

**Connection string:** Stored in `backend/.env` as `MONGODB_URI`. Not committed.

---

## Infrastructure

**Backend: AWS Lambda + API Gateway (SAM)**
- SAM template: `backend/template.yaml`
- Cold start: ~800ms on first request (acceptable for a non-latency-critical data tool)
- Lambda memory: 512MB (default)
- Region: us-east-1

**Frontend: S3 + CloudFront (CDK)**
- Static assets from Vite build (`frontend/dist/`)
- CloudFront distribution in front of S3 for CDN + HTTPS
- CDK stack: `frontend/infra/`

**CORS configuration:**
- Lambda/API Gateway CORS: permissive in development, origin-locked in production
- Backend `CORS_ORIGIN`: set to CloudFront domain in production

---

## Development Environment

```bash
# Start both servers
npm run dev

# Backend only (port 4000)
npm run dev -w backend

# Frontend only (port 5174)
npm run dev -w frontend
```

Backend uses `nodemon` with `ts-node` for hot reload.

**Environment files (not committed):**
- `backend/.env` — secrets, MONGODB_URI, JWT_SECRET, ANTHROPIC_API_KEY, GOOGLE_CLIENT_ID
- `frontend/.env.local` — VITE_API_BASE_URL, VITE_GOOGLE_CLIENT_ID

---

## What's Deliberately Not Used

| Avoided | Reason |
|---|---|
| Next.js | Overkill for a single-page app; SSR not needed |
| Prisma | MongoDB + Prisma is awkward; Mongoose is more natural |
| Redis | No session store needed (JWT is stateless) |
| GraphQL | REST is sufficient for the current data model |
| Supabase / Firebase | Vendor lock-in for auth + DB; avoided |
| Docker | Local dev doesn't need it; Lambda deploy doesn't use it |
