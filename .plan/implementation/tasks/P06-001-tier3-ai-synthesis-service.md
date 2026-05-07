# P06-001 — Tier 3 AI Synthesis Service

**Phase:** 06 — AI Synthesis
**Complexity:** L (3–6h)
**Status:** NOT_STARTED
**Depends on:** P05-004
**Unlocks:** P06-002

---

## Purpose

Implement the Tier 3 AI synthesis service: build the prompt from pre-computed context, call Claude via the Anthropic API, parse and return the structured output.

## Why It Exists

Tier 3 produces the human-readable text layer on top of the deterministic Tier 1+2 computation: subtitle, patternQualifier, and aiInstruction. Without Tier 3, all states show without text context.

## Required Reading

- `engineering/intelligence-architecture.md#tier3` — prompt construction spec, output contract
- `architecture/ARCHITECTURE_INVARIANTS.md#I-INV-01` — AI receives pre-computed summary ONLY
- `architecture/ARCHITECTURE_INVARIANTS.md#E-INV-01` — ANTHROPIC_API_KEY backend only
- Phase 06 phase file: `phases/phase-06-ai-synthesis.md` — prompt template

## Exact Scope

Create `backend/src/services/intelligence/tier3.ts`:

```typescript
interface TierThreeInput {
  state: string;
  delta_pct: number | null;
  baseline_kcal: number;
  established: boolean;
  logged_days: number;
  last_7_days_calories: number[];
  goal: string | null;
  protein_target: number | null;
  avg_protein_7d: number;
  candidates: string[];    // from Tier 2 qualifyStateCandidates
}

interface TierThreeOutput {
  subtitle: string;
  patternQualifier: string | null;
  aiInstruction: string | null;
}

async function synthesizeWithAI(input: TierThreeInput): Promise<TierThreeOutput>
```

- Build prompt from the template in phase-06.md
- Call `anthropic.messages.create(...)` with `model: 'claude-haiku-4-5-20251001'`
- Parse JSON response
- Return TierThreeOutput

## Out of Scope

- Output validation and fallback (P06-002)
- Rate limiting (P06-004)

## Files Expected to Change

```
backend/src/services/intelligence/tier3.ts          (new)
```

## Architecture Constraints

- `E-INV-01`: ANTHROPIC_API_KEY is read from `process.env` — never hardcoded
- `I-INV-01`: the prompt contains ONLY pre-computed summary values — no raw food log strings
- Use `claude-haiku-4-5-20251001` model (fast, sufficient for this task, low cost)
- Set `max_tokens: 300` — the output is small
- Set `temperature: 0` — deterministic output preferred

## Acceptance Criteria

1. `synthesizeWithAI` returns a valid TierThreeOutput object
2. Prompt is built from pre-computed values (no raw entries in prompt)
3. API key is read from environment variable
4. Build passes

## Edge Cases

- Anthropic API returns non-JSON text → throw, let P06-002 handle fallback
- API returns JSON that doesn't match TierThreeOutput schema → throw

## Failure Cases

- Network timeout → throw after 15s timeout
- API rate limit 429 → throw, let P06-002 handle

## Estimated Complexity

L — ~2.5 hours including prompt design.

## Claude Execution Guidance

Build the prompt template first (as a string function that takes TierThreeInput). Test the prompt output by logging it. Only then add the Anthropic API call. Keep the function focused: build prompt, call API, parse, return. Validation and fallback are NOT in this function.
