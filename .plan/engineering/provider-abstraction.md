# Provider Abstraction

**Status:** Active — v1.1
**Last updated:** 2026-05-08

Defines how Nouriq's intelligence layer remains provider-agnostic. Supersedes the Anthropic-specific framing in `ai-behavior.md`.

→ `engineering/api-dependency-map.md` — provider classification and cost profiles
→ `engineering/provider-abstraction-audit.md` — audit log of lock-in points and their resolution

---

## Philosophy

Nouriq thinks in capabilities, not providers.

The two intelligence capabilities are:
1. **Meal parsing** — natural language → structured nutrition (`ParsedMeal`)
2. **Signal synthesis** — pre-computed stats → state label + instruction (`Tier3Output`)

Providers are replaceable runtime engines. The choice of provider is an operational decision, not an architectural one. Switching from Anthropic to any other provider requires only an environment variable change and a new provider implementation — no domain logic changes.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Domain Logic (routes, services, intelligence tiers)    │
│  Works with canonical schemas. No provider awareness.   │
├─────────────────────────────────────────────────────────┤
│  Provider Registry  (backend/src/providers/registry.ts) │
│  Reads env vars. Returns CompletionProvider instances.  │
│  ANTHROPIC_API_KEY, GEMINI_API_KEY, etc. read here only │
├─────────────────────────────────────────────────────────┤
│  Provider Implementations  (backend/src/providers/)     │
│  Thin HTTP adapters. Handle auth headers, response      │
│  format, content block parsing, error normalization.    │
│  Return: raw text string | null                         │
└─────────────────────────────────────────────────────────┘
```

**The boundary rule:** No file outside `backend/src/providers/` contains provider-specific HTTP logic, headers, URLs, or response format parsing. This is enforced by invariant B-003.

---

## Canonical Schemas

Provider responses never leak into domain systems. Domain code works with these types only:

**Meal Parsing** — output of `POST /api/analyse`:
```typescript
interface ParsedMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  note: string | null;
}
```

**Signal Synthesis** — output of `callTier3()`:
```typescript
interface Tier3Output {
  state: StateLabel;
  pattern: PatternQualifier | null;
  aiInstruction: string | null;
  reasoning: string;
  providerId: string;   // e.g. "anthropic"
  modelId: string;      // e.g. "claude-sonnet-4-6"
}
```

**Provider identity** — stored in DB and returned to frontend:
```
canonicalId format: "provider:model"
Examples: "anthropic:claude-sonnet-4-6", "google:gemini-1.5-flash"
```

---

## Provider Interface

```typescript
interface CompletionProvider {
  readonly providerId: string;
  readonly modelId: string;
  readonly canonicalId: string;   // "provider:model"
  complete(opts: CompletionOptions): Promise<string | null>;
}

interface CompletionOptions {
  systemPrompt: string;
  userMessage: string;
  maxTokens: number;
  signal: AbortSignal;
}
```

The provider returns raw text or null. Domain code owns JSON parsing, schema validation, and prohibited-pattern enforcement.

---

## Runtime Configuration

**Active defaults** (Gemini 2.5 Flash — low cost, high speed):
```bash
AI_PROVIDER_PARSING=gemini
AI_PROVIDER_SYNTHESIS=gemini
AI_MODEL_PARSING=gemini-2.5-flash
AI_MODEL_SYNTHESIS=gemini-2.5-flash
GEMINI_API_KEY=your-key          # from aistudio.google.com
```

**Switch to Anthropic** (higher instruction-following fidelity):
```bash
AI_PROVIDER_PARSING=anthropic
AI_PROVIDER_SYNTHESIS=anthropic
AI_MODEL_PARSING=claude-sonnet-4-6
AI_MODEL_SYNTHESIS=claude-sonnet-4-6
ANTHROPIC_API_KEY=sk-ant-...
```

**Mixed** (cheapest parsing, best synthesis):
```bash
AI_PROVIDER_PARSING=gemini
AI_MODEL_PARSING=gemini-2.5-flash
GEMINI_API_KEY=your-key

AI_PROVIDER_SYNTHESIS=anthropic
AI_MODEL_SYNTHESIS=claude-sonnet-4-6
ANTHROPIC_API_KEY=sk-ant-...
```

No code changes required for any of the above. Deploy and restart.

---

## Failure Handling

**Provider unavailable:**
- `getMealParsingProvider()` returns null if no API key is configured
- `/api/analyse` returns 500 with `"Meal parsing provider not configured"`
- Signal synthesis skips Tier 3 and returns Tier 2 deterministic result

**AI call fails (timeout, error response):**
- Provider returns null
- Meal parsing: 502 returned to client
- Signal synthesis: deterministic Tier 2 result used (graceful degradation)
- Safety states (READING, UNDERFUELLED) are Tier 1 hard rules — AI failure cannot affect them

**Malformed response:**
- JSON parse error → provider returns null → domain handles fallback
- Invalid state in output → `validateOutput()` returns null → Tier 2 result used

**The key invariant:** AI failure can never corrupt deterministic systems, block logging, mutate Tier 1 safety states, or create false insights. All AI calls are optional enrichment on top of a valid deterministic result.

---

## Prompt Strategy

Prompts live in domain files, not in provider implementations:
- **Meal parsing prompt** — `backend/src/routes/analyse.ts`
- **Signal synthesis prompt** — `backend/src/services/intelligence/tier3.ts`

Prompts use canonical output contracts (JSON schemas). They do not use provider-specific formatting conventions. The same prompt text works for any provider that supports system prompts and text completion.

**Output contract enforcement:**
- Provider-specific response parsing (content blocks, choices arrays) happens inside the provider implementation
- Domain code receives only a plain text string
- JSON validation and schema mapping happen in domain code, not in provider code

---

## Multi-Provider Routing (Future)

When subscription tiers are introduced:

```
free tier:     AI_PROVIDER_PARSING=google, AI_MODEL_PARSING=gemini-1.5-flash
premium tier:  AI_PROVIDER_PARSING=anthropic, AI_MODEL_PARSING=claude-sonnet-4-6
```

The registry can be extended to accept a user context parameter for tier-based routing without changing the provider interface or domain code.

Capability-specific routing is already supported: parsing and synthesis are configured independently via `AI_PROVIDER_PARSING` and `AI_PROVIDER_SYNTHESIS`. They can use different providers.

---

## Implemented Providers

| Provider | File | Status | Structured output |
|---|---|---|---|
| Anthropic | `providers/anthropic.ts` | Live | Via prompt instruction |
| Google (Gemini) | `providers/google.ts` | Live — **default** | `responseMimeType: application/json` |

Google's `responseMimeType: 'application/json'` enforces valid JSON at the API level — no markdown stripping, no regex fallbacks. This is the primary reliability advantage of Gemini for structured extraction tasks.

## Adding a New Provider

1. Create `backend/src/providers/<name>.ts` implementing `CompletionProvider`
2. Add a case to `buildProvider()` in `registry.ts`
3. Add a case to `resolveApiKey()` in `registry.ts`
4. Add the API key env var to `.env.example` (commented, marked future)
5. Update `api-dependency-map.md` with the new service entry

No changes to domain code. No changes to routes, services, or intelligence tiers.

## Future: Multimodal Extension Point

`GoogleProvider.complete()` currently passes a text-only `parts` array. The Gemini API natively supports mixed `parts` (text + inline image data). When image meal parsing is roadmapped (v2.0), the extension point is:

```typescript
// Future: extend CompletionOptions with optional imageBase64
// GoogleProvider adds { inlineData: { mimeType, data } } to the parts array
// No other code changes required
```

This requires no interface changes to `CompletionProvider` — a new optional field on `CompletionOptions` is sufficient.

---

## Audit Trail

Every food entry and signal state records `parsedByModel` in canonical `provider:model` format:
- `FoodEntry.parsedByModel` — set from `analyseFood()` API response
- `SignalState.aiModel` — set from `tier3.providerId:tier3.modelId`

This enables provider cost analysis, per-provider quality comparison, and audit reconstruction without touching domain logic.
