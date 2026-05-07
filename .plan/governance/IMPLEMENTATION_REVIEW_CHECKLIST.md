# Implementation Review Checklist

**Status:** Active — Mandatory before marking any task complete.
**Last updated:** 2026-05-07

Run this checklist before considering any implementation task done. Not every section applies to every task — mark N/A where genuinely not applicable. Do not skip sections that are merely inconvenient.

---

## How to Use This Checklist

Before opening a PR or marking a task complete:

1. Read through each applicable section
2. For each item, answer honestly: does the implementation satisfy this?
3. If any item fails: fix it before marking complete
4. If an item is intentionally violated: document why in DECISION_LOG.md before proceeding

The question to hold throughout: **"Does this still feel like Nouriq?"**

---

## Section 1 — Architecture Checks

- [ ] No AI calls in frontend code — all Anthropic calls go through `POST /api/analyse` or `POST /api/signal`
- [ ] No AI calls that block the HTTP response in the write path (food log, delete entry)
- [ ] DayAggregate is updated synchronously in the write path before the response returns
- [ ] SIGNAL recomputation is queued asynchronously, not inline
- [ ] New routes follow the existing Express route structure in `engineering/backend-architecture.md`
- [ ] No new database collections added without an architectural decision
- [ ] No new AWS services added without an architectural decision
- [ ] TypeScript strict mode maintained — no new `any` types without a documented comment
- [ ] No Redis or external cache layer added
- [ ] If a new Lambda function was added: this was explicitly decided and documented

---

## Section 2 — Runtime Checks

- [ ] GET /api/home response time < 100ms (reads pre-computed state only, no live computation)
- [ ] Food log submit response time < 500ms (DayAggregate sync step included)
- [ ] No N+1 queries — all aggregation uses pre-computed documents
- [ ] All MongoDB queries include `userId` filter
- [ ] All new API routes are protected by `requireAuth` middleware
- [ ] Idempotency key checked on all create operations
- [ ] Soft-delete pattern used for FoodEntry deletion (no hard deletes)
- [ ] No FoodEntry documents modified after creation
- [ ] No historical SignalState documents mutated

---

## Section 3 — UX Checks

- [ ] No new bottom navigation element other than the command bar
- [ ] No tab bar introduced
- [ ] Home screen loads without visible layout shift
- [ ] All text uses the six-size type scale only
- [ ] STATE text displays in DISPLAY size (32px Syne 800)
- [ ] All labels are uppercase + tracked (text-label class)
- [ ] Timestamps and metadata use text-micro class
- [ ] No instruction or label contains praise language ("great", "amazing", "you're doing well")
- [ ] No streak counter, badge, or achievement indicator
- [ ] Absence of data results in absent UI — no skeleton screens, no "nothing here yet" filler
- [ ] Command bar is the only permanently fixed bottom element

---

## Section 4 — Intelligence Checks

- [ ] AI synthesis receives a pre-computed summary object, not raw FoodEntry documents
- [ ] All Tier 1 (READING, UNDERFUELLED) checks run before the AI is called
- [ ] If confidence < 60: AI instruction is suppressed
- [ ] AI instruction, if present, contains a specific number (not generic advice)
- [ ] AI instruction is ≤ 120 characters
- [ ] Backend validates AI output against candidate_states before storing
- [ ] Deterministic fallback exists and has been tested: system returns a valid state if AI fails
- [ ] No AI instruction implies causality from unobserved variables (stress, sleep, schedule)
- [ ] STATE transitions require the minimum qualifying window (not single-day events)

---

## Section 5 — Design-System Checks

- [ ] No raw hex values in component code — all colors via CSS custom properties
- [ ] No banned colors: `#4ecdc4`, `#ffa552`, `#ff6b9d`, `#a78bfa`, `#ffc864`
- [ ] No colors outside the token system (BG, INK, GOLD, STATUS, WAVE, BAR families)
- [ ] No `box-shadow` on any element
- [ ] No gradient backgrounds on cards or sections
- [ ] No backdrop-filter blur (glassmorphism)
- [ ] Only Syne and DM Mono fonts in use
- [ ] Syne used only at 18px+ and only at weight 700/800
- [ ] All spacing uses the 4px base system (multiples of 4px) via token classes
- [ ] No arbitrary Tailwind values: `text-[N]`, `p-[N]`, `m-[N]` — use scale classes
- [ ] Verify against `design-system/VISUAL_GUARDRAILS.md` for prohibited patterns

---

## Section 6 — Performance Checks

- [ ] No synchronous heavy computation in the API response path
- [ ] No new expensive MongoDB queries without appropriate indexes
- [ ] Bundle size not significantly increased (no large new dependencies added without reason)
- [ ] Animation performance: CSS transforms only (`transform`, `opacity`), no layout-triggering properties (`width`, `height`, `top`, `left`)
- [ ] No animations that run continuously at rest (no infinite loops, no shimmer)

---

## Section 7 — State Integrity Checks

- [ ] DayAggregate is recomputed after every FoodEntry create/delete
- [ ] SIGNAL recompute is enqueued after every write operation
- [ ] BaselineSnapshot is not mutated — a new snapshot is created on recalibration
- [ ] User data isolation: all new data documents contain `userId` field
- [ ] Soft-deleted FoodEntries are excluded from all aggregation queries
- [ ] SignalState `is_stale` flag is set correctly on fallback

---

## Section 8 — Drift Checks

Run these against `governance/DRIFT_PREVENTION.md`:

- [ ] No "temporary" UI introduced without a specific remediation plan in PROJECT_STATE.md
- [ ] Component names match spec names in `design-system/components/`
- [ ] STATE string values match exactly the values in `product/signal-states.md`
- [ ] DELTA formula matches `engineering/intelligence-architecture.md`
- [ ] API route names/shapes match `engineering/backend-architecture.md`
- [ ] No scope bleed: task only touches files in scope
- [ ] No "while I'm here" refactors mixed into the implementation
- [ ] `PROJECT_STATE.md` updated if a P-item was completed
- [ ] `DECISION_LOG.md` updated if a decision was made
- [ ] Component spec updated if implementation intentionally diverged

---

## The Final Question

After the checklist: read the component or feature holistically.

**Does this still feel like Nouriq?**

The visual language should feel like: precise, operational, calm, instrument.
The AI behavior should feel like: specific, silent-when-uncertain, observational.
The interaction model should feel like: instant, frictionless, no demands.

If the answer is "yes": mark complete.
If the answer is "almost" or "kind of": identify what feels off and fix it.
If the answer is "no": diagnose which invariant was compromised and restore it.

---

*This checklist is not a bureaucratic gate. It is a discipline that prevents drift.*
*Every item that fails and is fixed before shipping represents one piece of drift prevented.*
