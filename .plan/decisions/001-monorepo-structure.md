# ADR 001: Monorepo with npm workspaces

**Status:** Accepted
**Date:** 2026-05-07

---

## Context

Nouriq has two codebases: a React/Vite frontend and an Express/Node backend. Early development started with them as separate `npm` projects in the same repository but without a shared package management layer.

---

## Decision

Use **npm workspaces** with a root `package.json` to manage both packages. Add `concurrently` as a root dev dependency to run both dev servers with a single `npm run dev` command.

```json
{
  "workspaces": ["frontend", "backend"],
  "scripts": {
    "dev": "concurrently \"npm run dev -w backend\" \"npm run dev -w frontend\""
  }
}
```

---

## Rationale

- Single command to start the full stack in development
- Shared `node_modules` de-duplication for common deps
- Path for future shared types package (`packages/types`) without restructuring
- No overhead — no Turborepo, no Nx, no Lerna — workspaces alone is sufficient at this scale

---

## Consequences

- Root `npm install` installs all workspace deps in one pass
- `npm run dev -w backend` runs only the backend; `-w frontend` runs only the frontend
- Shared packages would live in `packages/` when needed — the workspace config allows glob patterns
- CI must run `npm install` at root, not within each workspace

---

## Rejected Alternatives

**Separate repos:** Adds overhead for coordinating deploys and keeping types in sync. Wrong tradeoff for a 1–2 person team.

**Turborepo:** Adds build caching and task graph orchestration that is not needed yet. Add when CI build times become a problem.
