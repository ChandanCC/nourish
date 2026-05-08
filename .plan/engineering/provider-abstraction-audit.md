# Provider Abstraction Audit

**Status:** Complete — refactor in progress
**Date:** 2026-05-08

---

## Summary

The current intelligence layer contains 9 distinct lock-in points where Anthropic-specific assumptions have leaked into domain and infrastructure code. None of them are architectural failures — they are the natural result of building with a single provider before abstraction was needed. This document catalogs each point, classifies its risk, and specifies the required refactor.

---

## Lock-in Points

### LP-1 — `backend/src/routes/analyse.ts` (CRITICAL)

**What is coupled:**
- Hardcoded URL: `https://api.anthropic.com/v1/messages` (line 51)
- Anthropic-specific auth header: `'x-api-key': apiKey` (line 53)
- Anthropic version header: `'anthropic-version': '2023-06-01'` (line 54)
- Hardcoded model: `model: 'claude-sonnet-4-6'` (line 59)
- Anthropic response format: `data.stop_reason === 'max_tokens'` (line 76)
- Anthropic content block parsing: `data.content?.find(b => b.type === 'text')` (line 81)

**Risk:** CRITICAL. This is the core food-parsing capability. Every food log requires this call. Switching providers requires rewriting the entire route implementation.

**Required refactor:** Extract to `MealParsingProvider` interface. Route becomes provider-agnostic — it calls `provider.complete(systemPrompt, userMessage)` and maps the canonical result.

---

### LP-2 — `backend/src/services/intelligence/tier3.ts` (CRITICAL)

**What is coupled:**
- Same Anthropic-specific HTTP structure as LP-1 (lines 115–136)
- Parameter signature `anthropicApiKey: string` — provider name leaks into function interface (line 74)
- Anthropic content block parsing in Tier 3 synthesis logic

**Risk:** CRITICAL. Tier 3 is the signal synthesis capability. The provider name is in the function signature, meaning every call site knows it is Anthropic. Swapping providers requires changing every call site.

**Required refactor:** Remove `anthropicApiKey` parameter. Tier 3 calls `getSignalSynthesisProvider()` from registry. Function becomes stateless relative to provider choice.

---

### LP-3 — `backend/src/routes/signal.ts` (HIGH)

**What is coupled:**
- `const apiKey = process.env.ANTHROPIC_API_KEY` (line 75) — provider env var hardcoded in route
- `aiModel: shouldCallAI ? 'claude-sonnet-4-6' : ''` (line 125) — hardcodes provider+model name in the SignalState DB record
- `callTier3(..., apiKey!)` — passes the Anthropic key directly into domain logic

**Risk:** HIGH. SignalState records in MongoDB contain `'claude-sonnet-4-6'` strings. If provider changes, historical records remain provider-specific while new records use a different value. Breaks analytics and audit consistency.

**Required refactor:** Signal route reads provider identity from registry, not from `ANTHROPIC_API_KEY` directly. `aiModel` field stores canonical `provider:model` format.

---

### LP-4 — `frontend/src/pages/App.tsx` (HIGH)

**What is coupled:**
- `parsedByModel: 'claude-sonnet-4-6'` (line 94) — frontend hardcodes Anthropic model name sent to the log endpoint

**Risk:** HIGH. Every FoodEntry document in MongoDB is stamped with `'claude-sonnet-4-6'` regardless of what the backend actually used. This is factually wrong if the provider changes and the frontend is not updated in lockstep.

**Required refactor:** `/api/analyse` response includes `parsedByModel` (set by backend from registry). Frontend uses this value instead of hardcoding it.

---

### LP-5 — `backend/src/models/FoodEntry.ts` (LOW)

**What is coupled:**
- Comment: `parsedByModel: string; // "claude-sonnet-4-6"` — provider-specific example in model comment

**Risk:** LOW. Comment only. But it implies the field format is a bare model name rather than `provider:model`.

**Required refactor:** Update comment to reflect canonical `provider:model` format.

---

### LP-6 — `backend/src/services/recomputeSignal.ts` (LOW)

**What is coupled:**
- `aiModel: ''` (line 83) — empty placeholder with no provider tracking at all

**Risk:** LOW. This code path does not call Tier 3 (background recompute uses deterministic result only). But the empty string means no provenance is recorded when recompute does call AI in future.

**Required refactor:** Record provider identity from registry when AI is called.

---

### LP-7 — `.plan/engineering/ai-behavior.md` (DOCUMENTATION)

**What is coupled:**
- Title describes behavior in terms of "Anthropic API"
- Model spec: `claude-sonnet-4-6` hardcoded
- Document structure assumes single-provider future

**Risk:** DOCUMENTATION. No runtime impact, but misleads future contributors about the architecture's flexibility.

**Required refactor:** Rename/restructure as `provider-abstraction.md` with capability-oriented sections.

---

### LP-8 — `.plan/engineering/intelligence-architecture.md` (DOCUMENTATION)

**What is coupled:**
- Section heading: `TIER 3 — AI Synthesis (Claude)` — Claude named as the tier's identity, not as a capability implementation
- Multiple uses of "Claude" as a noun for the synthesis function

**Risk:** DOCUMENTATION. When a second provider is added, this document becomes misleading. The tier is "AI Synthesis," not "Claude."

**Required refactor:** Update section headings to capability language.

---

### LP-9 — `automation/invariants/rules.js` (LOW)

**What is coupled:**
- B-003 description: `'Anthropic client called directly in a route handler'`
- B-003 logic checks for `new Anthropic` and `client.messages.create` — SDK-specific patterns that won't catch raw `fetch()` calls to any provider

**Risk:** LOW. The rule was written before provider abstraction existed. After refactor, provider code lives in `backend/src/providers/` and the rule should protect the provider boundary, not just the Anthropic SDK pattern.

**Required refactor:** B-003 description updated to "AI provider called directly in route handler (must use provider registry)." Rule logic updated to match new boundary.

---

## Risk Classification

| Priority | Lock-in Points | Impact |
|---|---|---|
| CRITICAL | LP-1, LP-2 | Core capabilities non-portable |
| HIGH | LP-3, LP-4 | DB records wrong, frontend hardcodes model |
| LOW | LP-5, LP-6, LP-9 | Minor correctness/clarity issues |
| DOCUMENTATION | LP-7, LP-8 | No runtime impact |

---

## Non-Issues (Confirmed)

- **`frontend/src/api/client.ts`** — `parsedByModel: string` type is correct. It is a generic string field; the hardcoding is in App.tsx (LP-4), not here.
- **`frontend/src/lib/nutrition.ts`** — `analyseFood()` correctly calls `/api/analyse` with no provider assumptions. The function needs to forward `parsedByModel` from the response (fix is in LP-4).
- **`backend/src/services/intelligence/types.ts`** — Fully canonical. `StateLabel`, `DayData`, `Tier1Result`, `Tier2Result`, `SignalComputeResult` are all domain types with no provider coupling.
- **Tier 1 & Tier 2** — Fully deterministic, fully provider-agnostic. No changes needed.
- **Orchestrator** — No AI calls. Fully deterministic. No changes needed.
- **MongoDB models** — Schema is generic (`aiModel: String`). Coupling is in values written, not schema.
- **Frontend components** — Zero AI/provider references. Correctly isolated.

---

## Architecture Invariants After Refactor

1. No file outside `backend/src/providers/` contains provider-specific HTTP logic, headers, or response formats.
2. `ANTHROPIC_API_KEY` is read only in `backend/src/providers/registry.ts`. No other file accesses it.
3. Provider selection is driven by `AI_PROVIDER_PARSING` and `AI_PROVIDER_SYNTHESIS` env vars.
4. `parsedByModel` in FoodEntry uses canonical `provider:model` format. Frontend never hardcodes this.
5. Tier 1 and Tier 2 remain completely provider-agnostic (no change required).
6. Safety states (READING, UNDERFUELLED) remain Tier 1 hard rules. AI failure cannot mutate them.
