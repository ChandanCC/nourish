# Phase 06 — AI Synthesis (Tier 3)

**Status:** NOT_STARTED
**Tasks:** P06-001, P06-002, P06-003, P06-004
**Estimated duration:** 4–6 hours

---

## Purpose

Implement Tier 3 AI synthesis: takes pre-computed Tier 1/2 summary and produces human-readable subtitle, pattern qualifier, and AI instruction text. After this phase, all SIGNAL states are fully computable end-to-end.

---

## Prerequisites

- Phase 05 complete (SIGNAL orchestrator with Tier 1+2 working)

---

## Exit Conditions (Phase Complete When)

1. POST /api/analyse produces valid SIGNAL state responses with all string fields
2. AI output always validates against the contract schema before being stored
3. When AI fails/times out, system returns Tier 1+2 deterministic result (fallback path works)
4. Rate limiting on /api/analyse prevents abuse
5. `npm run build -w backend` passes with 0 errors

---

## Tasks

| Task | What it does |
|---|---|
| P06-001 | Implements Tier 3 AI synthesis service (builds prompt, calls Claude, parses response) |
| P06-002 | Implements AI output validation schema + fallback path on failure |
| P06-003 | Creates POST /api/signal route that triggers full Tier 1→2→3 computation |
| P06-004 | Adds rate limiting middleware to /api/analyse |

**Dependency order:** P06-001 → P06-002 → P06-003. P06-004 is independent.

---

## Architecture Constraints

- `engineering/intelligence-architecture.md` — Tier 3 prompt construction, output contract
- `architecture/ARCHITECTURE_INVARIANTS.md#I-INV-01` — AI receives pre-computed summary only, never raw logs
- `architecture/ARCHITECTURE_INVARIANTS.md#I-INV-02` — AI output always validated before storage
- `architecture/ARCHITECTURE_INVARIANTS.md#I-INV-03` — deterministic results exist before AI call
- `decisions/011-deterministic-signal-fallback.md` — fallback is Tier 1+2 result, not error

---

## AI Output Contract

The AI must return a JSON object matching this schema exactly. Any deviation triggers fallback:

```typescript
interface TierThreeOutput {
  subtitle: string;           // e.g. "Day 3 · Baseline forming"
  patternQualifier: string | null;  // e.g. "Training weeks excluded"
  aiInstruction: string | null;  // e.g. "Add 30g protein to dinner"
}
```

Constraints on AI output strings:
- `subtitle`: max 60 chars, no praise language, operational tone
- `patternQualifier`: max 50 chars, null if not applicable
- `aiInstruction`: max 80 chars, single concrete action, null if not needed
- No "Great job!", "Keep going!", "You're crushing it!" or any motivational filler

---

## Prompt Construction (P06-001)

The AI receives a pre-computed context summary, NOT raw food logs. Structure:

```
You are a precision nutrition intelligence engine. Output JSON only.

Context:
- SIGNAL state: {state}
- DELTA: {delta_pct}% ({direction} baseline)
- Baseline: {baseline_kcal} kcal (established: {established}, {n} days)
- Last 7 days calories: {day_array}
- Goal: {goal}
- Protein target: {protein_target}g/day
- Avg protein 7d: {avg_protein}g

Output contract: { subtitle, patternQualifier, aiInstruction }
Rules: [output contract rules above]
```

---

## Rate Limiting (P06-004)

- 10 requests per minute per userId on /api/analyse
- Use express-rate-limit with Redis or in-memory store (in-memory acceptable for v1.1)
- Return 429 with `{ error: "rate_limit", retryAfter: 60 }` on breach

---

## What Exists After This Phase

- Full Tier 1 → 2 → 3 SIGNAL computation
- All 7 SIGNAL states producible
- Deterministic fallback when AI fails
- POST /api/signal triggers full computation and stores result
- Rate limiting on AI endpoint
