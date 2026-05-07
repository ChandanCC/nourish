# P06-002 — AI Output Validation + Fallback

**Phase:** 06 — AI Synthesis
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P06-001
**Unlocks:** P06-003

---

## Purpose

Wrap `synthesizeWithAI` with output validation and a deterministic fallback path. When AI fails or returns invalid output, the system returns the Tier 1+2 result instead of erroring.

## Why It Exists

AI calls fail: network timeouts, rate limits, malformed JSON, value-policy refusals. The fallback ensures SIGNAL always has a valid state even when Tier 3 is unavailable. This is the implementation of `decisions/011-deterministic-signal-fallback.md`.

## Required Reading

- `decisions/011-deterministic-signal-fallback.md` — fallback design
- `architecture/ARCHITECTURE_INVARIANTS.md#I-INV-02` — AI output must validate before storage

## Exact Scope

Create `backend/src/services/intelligence/tier3Wrapper.ts`:

```typescript
interface SynthesisResult {
  output: TierThreeOutput | null;
  usedFallback: boolean;
  fallbackReason?: string;
}

async function safelySynthesizeWithAI(
  input: TierThreeInput,
  fallbackState: string       // Tier 1+2 state to use if AI fails
): Promise<SynthesisResult>
```

Validation rules (reject if any fail):
- `subtitle` exists and is a non-empty string, max 60 chars
- `patternQualifier` is a string or null, max 50 chars if string
- `aiInstruction` is a string or null, max 80 chars if string
- No praise language: reject if matches `/great job|you're crushing|keep going|amazing/i`

Fallback behavior when validation fails or AI throws:
- Return `{ output: null, usedFallback: true, fallbackReason: '...' }`
- The orchestrator then uses the Tier 1+2 state as the final state with null strings

## Out of Scope

- Changes to tier3.ts (P06-001)

## Files Expected to Change

```
backend/src/services/intelligence/tier3Wrapper.ts   (new)
backend/src/services/intelligence/orchestrator.ts   (update to use wrapper instead of raw tier3)
```

## Architecture Constraints

- `I-INV-02`: validation runs before any DB write
- The fallback is the Tier 1+2 result — not a generic "READING" — the state is already computed

## Acceptance Criteria

1. When AI returns valid output, `usedFallback: false` and output is stored
2. When AI throws (any error), `usedFallback: true` is returned
3. When AI output fails validation (praise language, too long), `usedFallback: true`
4. Final SignalState reflects the fallback state (Tier 1+2 result) when AI fails
5. Build passes

## Estimated Complexity

M — ~2 hours.

## Claude Execution Guidance

The wrapper is a try-catch around the tier3 call + validation function. Validation is a simple boolean check function. Keep them separate so they can be tested independently. Update the orchestrator to call the wrapper, not tier3 directly.
