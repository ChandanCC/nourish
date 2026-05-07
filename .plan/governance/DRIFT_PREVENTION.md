# Drift Prevention

**Status:** Active
**Last updated:** 2026-05-07

Drift is how good systems become incoherent. It is almost never intentional — it accumulates through "just this once" decisions, session context loss, time pressure, and the natural tendency to solve immediate problems with local solutions.

This document defines the known drift patterns in Nouriq, their warning signs, and recovery protocols.

---

## 1. Common Drift Patterns

### 1a. "Temporary" UI Becoming Permanent

**Pattern:** A visual shortcut is introduced under time pressure ("I'll fix this later"). It ships. Later never comes. The shortcut becomes the reference for the next shortcut.

**Examples:**
- Hardcoding a hex color because "I don't know the token name"
- Using `text-[13px]` instead of the `.text-label` utility class
- Adding `box-shadow` "just for now" to test a layout

**Warning signs:**
- Raw hex values appearing in new components
- Tailwind arbitrary values (`text-[N]`, `p-[N]`) for values already in the token system
- `// TODO: use token` comments that are weeks old

**Recovery:**
1. `grep -r "#[0-9a-fA-F]\{3,6\}" frontend/src/` to find raw hex values
2. Replace with CSS custom property from `design-system/tokens/colors.md`
3. `grep -r "text-\[" frontend/src/` to find arbitrary type sizes
4. Replace with utility class from `design-system/tokens/typography.md`

---

### 1b. Color Creep

**Pattern:** A new UI element needs a visual state and the designer reaches for a new color rather than the established token system. One new color creates precedent for the next.

**Examples:**
- Adding a blue color for "informational" state
- Using orange for "warning" (already have STATUS-MID for this)
- Coloring macro bars green/yellow/red

**Warning signs:**
- Any CSS color value outside: `--bg-*`, `--ink-*`, `--gold`, `--gold-*`, `--status-*`, `--wave-*`, `--bar-*`
- `#4ecdc4`, `#ffa552`, `#ff6b9d`, `#a78bfa`, `#ffc864` (the permanently prohibited set)
- "Brand color" discussions

**Recovery:**
1. Map the visual need to the existing token system. 99% of cases: STATUS-UP/MID/DOWN or INK at a lower opacity
2. If genuinely not coverable by existing tokens: surface as an architectural decision, not a local fix

---

### 1c. AI Instruction Inflation

**Pattern:** The AI instruction line starts returning content more frequently. Instructions become less specific. The null rate drops below 40%. The instruction becomes a noise channel users ignore.

**Examples:**
- Instructions that don't reference specific numbers
- Instructions present when no specific gap exists
- "Keep it up!" or equivalent filtered through neutral language

**Warning signs:**
- AI null rate < 40% in production metrics
- Instructions containing general advice ("drink more water", "eat more vegetables")
- Instruction length consistently at the 120-char cap

**Recovery:**
1. Review the prompt in `engineering/ai-behavior.md`
2. Tighten specificity requirements
3. Raise the threshold for generating an instruction
4. Remember: null is correct behavior, not failure

---

### 1d. Gamification Creep

**Pattern:** Non-numerical engagement patterns are introduced: streaks, day counters, percentage completions for non-nutritional targets. Usually introduced by analogy to successful apps ("WHOOP does it and it works").

**Examples:**
- "You've logged 5 days in a row!"
- Protein goal showing a percentage fill bar with color progression
- "Current streak: N days"

**Warning signs:**
- Any UI element that counts consecutive actions
- Progress bars with color-coded fill states for non-nutritional data
- Achievement-style visual rewards

**Recovery:** Remove. The consistency signal in Nouriq is the waveform shape and the PATTERN qualifier. Not a streak counter.

---

### 1e. AI Causality Creep

**Pattern:** AI instructions drift from observation to explanation to prescription. The system begins suggesting causes for patterns it cannot observe.

**Examples:**
- "You may be undereating due to work stress"
- "Try meal prepping to hit your protein target"
- "Your inconsistent pattern might indicate a social eating pattern"

**Warning signs:**
- Instructions mentioning anything not in the logged data (sleep, stress, schedule, lifestyle)
- Instructions containing "maybe", "possibly", "might"
- Instructions that read like coaching rather than observation

**Recovery:** Rewrite instructions to remove causality. State only what the data shows. See I-INV-02 in `architecture/ARCHITECTURE_INVARIANTS.md`.

---

### 1f. Scope Bleed

**Pattern:** A P1 task ("implement home screen layout") expands to include P5 ("command bar focus state"), P6 ("typography"), and a new unscoped feature ("hey while I'm here, let me add the waveform day selection").

**Warning signs:**
- A single PR changes files in 3+ separate feature areas
- Files being touched that aren't in the current task spec
- "While I'm here" as a justification for any change

**Recovery:** See `governance/SCOPE_DISCIPLINE.md`.

---

### 1g. Semantic Drift

**Pattern:** Terms in the codebase drift from their definitions in `product/glossary.md`. A `state` variable starts meaning something different from STATE. A `delta` calculation deviates from the DELTA formula. Component names stop matching spec names.

**Warning signs:**
- Component named `NutritionCard` where spec calls it `EntryCard`
- A `delta` variable computed differently from `product/signal-states.md`
- STATE values as enum that don't match the exact strings in the spec

**Recovery:**
1. Read `product/glossary.md` for canonical definitions
2. Align code variable/component names to spec names
3. If the spec is wrong, update the spec — don't silently diverge

---

### 1h. Architecture Bypass

**Pattern:** The write pipeline bypass: AI analysis is called synchronously in the API handler, blocking the response. Or: DayAggregate is queried live instead of read from the pre-computed document. Or: the home screen endpoint recomputes data on every request.

**Warning signs:**
- `await anthropic.messages.create(...)` inside a route handler that also saves data
- `db.collection('logs').aggregate(...)` in the home screen GET handler
- Response time for GET /api/home > 200ms

**Recovery:** Restore the sync/async boundary. See `decisions/009-sync-async-boundary-dayaggregate.md`.

---

## 2. What Triggers an Architectural Review

The following changes require pausing to read `architecture/ARCHITECTURE_INVARIANTS.md` and `CONSTITUTION.md` before proceeding:

| Trigger | Why |
|---|---|
| Adding a new color or token family | Color is architectural |
| Adding a new fixed UI element to the screen | Navigation model is architectural |
| Calling AI from the frontend | Backend proxy is a hard invariant |
| Calling AI synchronously in the write path | Async intelligence is a hard invariant |
| Adding a new database collection | Data model is architectural |
| Adding a cache layer | Intentionally deferred |
| Splitting a Lambda function | Modular monolith is intentional |
| Adding a streak, badge, or achievement | Explicit anti-gamification invariant |
| Adding new navigation patterns | Single-surface architecture |
| Making SIGNAL respond to single events | Pattern-not-event invariant |

---

## 3. What Changes Require ADR Updates

Create a new `decisions/` ADR when:
- A decision is being made that contradicts or supersedes an existing ADR
- A new architectural pattern is being introduced that future engineers will need to understand
- A previous architectural decision (logged in DECISION_LOG.md) is being reversed
- A new constraint is being accepted that closes off future options

Update DECISION_LOG.md for all decisions that affect more than a single implementation detail.

---

## 4. What Changes Require Invariant Review

Read `architecture/ARCHITECTURE_INVARIANTS.md` and confirm no invariant is violated when:
- Any AI synthesis logic is being added or modified
- Any data model change is being made
- Any new UX pattern is being introduced
- Any new color or visual token is being added
- Any backend architectural change is made

If an invariant would be violated, the change requires explicit acknowledgment in DECISION_LOG.md. The invariant wins unless explicitly superseded.

---

## 5. Anti-Shortcut Rules

These shortcuts are explicitly prohibited regardless of time pressure:

| Shortcut | Prohibition |
|---|---|
| Raw hex in component code | Always use CSS custom properties |
| `any` TypeScript type without comment | Always document why |
| AI call in frontend | Always proxy through backend |
| Hardcoded user targets or defaults | Always derive from user data or config |
| Synchronous AI in write path | Always async |
| Mutating a historical SignalState | Never — create a new document |
| Editing a FoodEntry | Never — soft-delete only |
| `box-shadow` anywhere | Not in the design system |
| Praise language in copy | Not in the product |
| Tab bar or bottom navigation other than command bar | Not in the architecture |

If a shortcut "has to" be taken due to a genuine constraint, it is immediately recorded as technical debt in `PROJECT_STATE.md` with a specific remediation plan.

---

## 6. Design Consistency Rules

Before implementing any visual element:
1. Read the component spec in `design-system/components/`
2. Use only tokens from `design-system/tokens/`
3. If the spec doesn't cover the case: extend the spec, don't deviate from it
4. If a new token is needed: add it to the token file, not as a one-off value
5. Never introduce a design decision that isn't traceable to a spec

---

## 7. Semantic Consistency Rules

Code must match spec vocabulary:
- Component names match spec names exactly (EntryCard, SignalHero, CommandBar, Waveform)
- STATE values are exact string matches to `product/signal-states.md`
- DELTA formula must match `product/signal-system.md` and `engineering/intelligence-architecture.md`
- Token names in CSS match the naming in `design-system/tokens/`
- API routes match the contract in `engineering/backend-architecture.md`

---

## 8. AI-Session Discipline Rules

See `governance/AI_SESSION_RULES.md` for the full protocol. Summary:

- Never implement more than the current task requires
- Never redesign architecture in the middle of an implementation task
- Surface spec conflicts as decisions, not silent implementations
- Always read the relevant spec before implementing a component
- Always update documentation when implementation diverges from spec

---

## 9. Context-Loading Discipline

A session started without reading foundational context is a session that will introduce drift. Minimum required reading for any implementation session:

1. `CLAUDE.md` — non-negotiables
2. `PROJECT_STATE.md` — where we are
3. The spec for whatever is being built

A session started without these three files is operating without constraints. This is how "temporary" decisions become permanent architecture.

---

## 10. Refactor Discipline

Refactoring is not a free action. It carries risk and scope. Rules:

- Do not refactor adjacent code while fixing a bug
- Do not refactor while implementing a feature
- Refactoring has its own task, its own scope, and its own commit
- If a refactor is clearly needed and blocking: complete the minimum refactor, commit it separately, then implement the feature
- "Clean up while I'm here" is scope bleed

---

*Drift is a slow process. Prevention is a fast habit.*
