# Architecture Invariants

**Status:** Constitutional — requires explicit decision and DECISION_LOG entry to modify.
**Last updated:** 2026-05-07

These are the load-bearing facts of Nouriq. They are not preferences or conventions — they are the properties the system must maintain to remain coherent. Violating any of them produces a different product.

When implementation pressure pushes against an invariant, the invariant wins. If the invariant genuinely needs to change, that change requires explicit acknowledgment, a DECISION_LOG entry, and an update to this file.

---

## Product Invariants

---

### P-INV-01: SIGNAL is observational, not motivational

**Statement:** SIGNAL tells the user what pattern their body is operating in. It never tells them how to feel about it.

**Rationale:** The moment SIGNAL celebrates a surplus or warns against a deficit with emotional valence, it becomes a fitness motivator. Nouriq is not a fitness motivator. A Bloomberg Terminal does not congratulate traders for profitable positions.

**Consequences if violated:**
- Users begin optimizing for SIGNAL approval rather than their own goals.
- The product becomes manipulative. Trust degrades when the pattern label stops matching reality.
- Emotional copy drives churn when the user has a "bad" week and the product makes them feel worse.

**Correct:** `CUTTING · Day 4 · Pattern: consistent`
**Incorrect:** `🔥 You're in fat-loss mode! Keep going!`

---

### P-INV-02: Activation = recognition, not completion

**Statement:** A user is activated when SIGNAL names something true about their pattern that they already knew but couldn't articulate. Not when they complete a tutorial, reach day 7, or see a congratulatory screen.

**Rationale:** Completion-based activation (streaks, milestones, "you did it!") measures engagement with the product's interface, not with its intelligence. Recognition-based activation measures whether the product is actually working.

**Consequences if violated:**
- Onboarding becomes a series of tasks rather than a calibration period.
- Users "complete" onboarding without the product having learned anything.
- Retention metrics improve briefly; value metrics don't.

**Correct:** SIGNAL activates silently on day 7. The user sees their STATE and recognizes it as accurate.
**Incorrect:** Day 7 triggers a "Your SIGNAL is ready! 🎊" screen.

---

### P-INV-03: Silence > weak insight

**Statement:** The system does not speak when it has nothing specific to say. An absent instruction is correct behavior, not a failure.

**Rationale:** Every generated insight trains the user on what kind of system this is. Frequent generic insights ("Stay hydrated!", "Great protein today!") train the user to ignore insights. Rare specific insights ("Protein averaged 48g below target this week — the deficit is consistent, not occasional") train the user to act on them.

**Consequences if violated:**
- AI instruction line becomes noise. Users stop reading it.
- Trust in SIGNAL degrades because it speaks even when it has nothing to say.
- Product drifts toward fitness coach aesthetic.

**Correct:** `ai_instruction: null` when protein is on target.
**Incorrect:** `ai_instruction: "You're doing well with your nutrition today!"` as a fallback.

**Metric:** AI instruction null rate of 50–70% is expected and correct.

---

### P-INV-04: Nouriq interprets patterns, not isolated events

**Statement:** No single logged entry, no single meal, no single day changes SIGNAL STATE. The system requires minimum 3–4 consistent days to move between states.

**Rationale:** A person who eats one large meal is not BUILDING. A person who under-eats one day is not UNDERFUELLED. Single-event interpretation produces false positives that erode trust immediately. The pattern window exists to smooth noise.

**Consequences if violated:**
- SIGNAL flickers on single-day anomalies. Users lose trust.
- UNDERFUELLED triggers from a single light-eating day, becoming a nagging system rather than a diagnostic one.
- Users game the system (log one good day, see STATE change).

**Correct:** STATE transitions require the pattern window (3–4+ qualifying days, per `product/signal-states.md`).
**Incorrect:** Changing STATE based on today's macros alone.

---

### P-INV-05: The product must be navigable without reading

**Statement:** A user who has never seen the home screen must be able to identify: what their current state is, what today's intake looks like, how to log something. No labels, no tutorials, no walkthroughs.

**Rationale:** This is the difference between an instrument panel and a dashboard. The instrument panel communicates state through position, size, and proportion. The home screen hierarchy (SIGNAL hero → TODAY → LOG) does this. If the user needs to read to navigate, the hierarchy has failed.

**Consequences if violated:**
- Onboarding must compensate with tutorials and tooltips (more complexity).
- Power users feel patronized. New users feel lost.
- UI adds labels for things that should communicate through visual weight.

---

## Intelligence Invariants

---

### I-INV-01: AI synthesis receives pre-computed summaries, never raw logs

**Statement:** Claude is never called with raw FoodEntry documents. It receives a pre-computed summary from Tier 2 (statistical layer): aggregated numbers, computed metrics, qualified candidate states. The AI's job is synthesis and judgment, not arithmetic.

**Rationale:** Sending raw logs to AI creates: unpredictable token costs, latency proportional to log history size, hallucination risk on arithmetic, and no deterministic fallback path. Tier 1/2 computation is fast, exact, and cheap. AI synthesis on top of exact numbers is the correct division of labor.

**Consequences if violated:**
- AI makes arithmetic errors on food data (it will).
- Token cost scales with user history, not a fixed rate.
- No deterministic fallback possible when AI is unavailable.
- Prompt becomes a data transformation problem, not a synthesis problem.

**Correct:** AI receives: `{ avg_calories_7d: 1840, baseline: 1920, delta: -4.2%, cv: 0.11, protein_adherence: 0.73, candidate_states: ['CUTTING', 'OPTIMISING'], ... }`
**Incorrect:** AI receives the last 30 FoodEntry documents.

---

### I-INV-02: AI never fabricates causality

**Statement:** The AI instruction line states observations, not causes. It says what the data shows. It does not explain why the user is in a particular state unless the cause is directly observable in the data.

**Rationale:** The system does not have access to sleep, stress, illness, travel, or any non-logged variable. Any causal statement about these ("You may be undereating due to stress") is fabricated. Fabricated insight is not insight — it is noise with authority.

**Consequences if violated:**
- Users make behavioral changes based on fabricated explanations.
- When the fabricated cause is wrong (often), trust in the entire system collapses.
- Product drifts toward wellness-coach territory, undermining the instrument-panel identity.

**Correct:** `"Protein has averaged 62g below target for 4 days — the gap is consistent, not occasional."`
**Incorrect:** `"You may be skipping protein because of busy mornings — try prepping meals in advance."`

---

### I-INV-03: Deterministic computation precedes all AI synthesis

**Statement:** Before Claude is called, every computable fact is computed: daily totals, DELTA, CV, baseline, pattern slope, candidate state set. The AI call is always the last step. It never initiates computation.

**Rationale:** This ensures: (a) the AI fallback path exists (return Tier 1/2 result if AI fails), (b) the AI cannot return a state that wasn't pre-qualified, (c) debugging is possible without AI involvement, (d) cost is controlled (AI is only called when pre-qualification passes).

**Consequences if violated:**
- AI becomes a dependency, not an enhancement.
- System is unavailable when Claude is unavailable.
- Costs are uncapped.

---

### I-INV-04: Confidence gates intelligence expression

**Statement:** SIGNAL computation produces a confidence score. Below threshold (< 60), the instruction line is suppressed. Below threshold with insufficient data, DRIFTING is returned regardless of AI output.

**Rationale:** Expressing low-confidence insight as if it were high-confidence is the primary failure mode of AI-powered products. The user doesn't know the system is uncertain. They act on the insight. This is dangerous for a product that affects eating behavior.

**Consequences if violated:**
- Users receive guidance when the system is guessing.
- Trust collapses on the first noticeable mismatch.

**Correct:** Confidence < 60 → suppress instruction, show state only (or return DRIFTING if below data threshold).
**Incorrect:** Always show an instruction regardless of confidence.

---

### I-INV-05: Historical SignalState snapshots are never mutated

**Statement:** Once a SignalState document is created with a timestamp, it is never updated in-place. New state is a new document. The audit trail of what the system believed at each point in time is preserved forever.

**Rationale:** The system's credibility depends on users being able to see what pattern they held and when. If historical states are mutated, the audit trail is unreliable. "Last Tuesday I was CUTTING" must be a stable fact. Future recalibration of the baseline does not retroactively change what state the system diagnosed.

**Consequences if violated:**
- Weekly reports reference states that no longer exist in the database.
- Trust collapses if users notice historical states changing.
- Debugging becomes impossible.

---

## Data Invariants

---

### D-INV-01: Raw events are immutable after creation

**Statement:** FoodEntry documents are never edited. Only soft-deleted. The original logged record persists forever.

**Rationale:** The food log is the source of truth for everything the system computes. Allowing edits creates reconciliation problems: what does DELTA mean if the underlying logs were edited? Soft-delete preserves the record for audit while removing it from active computation.

**Consequences if violated:**
- Recomputation produces different results than original computation (silent inconsistency).
- Users can retroactively change their history, undermining the integrity of SIGNAL.

**Correct:** User "deletes" an entry → `deleted_at` timestamp is set; entry excluded from all aggregation queries.
**Incorrect:** User edits an entry's calorie count in-place.

---

### D-INV-02: Derived state is always recomputable from raw events

**Statement:** Every DayAggregate, BaselineSnapshot, and SignalState document must be fully recomputable from the raw FoodEntry log. No derived document contains information that cannot be reconstructed.

**Rationale:** This is the property that makes the system trustworthy over time. If the baseline computation algorithm improves, historical baselines can be recomputed. If a bug is found in DayAggregate summation, all aggregates can be rebuilt. The raw log is the ledger; everything else is a view.

**Consequences if violated:**
- Migration becomes impossible — derived state becomes load-bearing.
- Bugs in derived computation become permanent.
- System cannot be audited or reconstructed.

---

### D-INV-03: Facts and interpretation are stored separately

**Statement:** What the user logged (FoodEntry) and what the system concluded from it (SignalState) are separate documents. A SignalState is never embedded in a FoodEntry. The interpretation layer never mutates the fact layer.

**Rationale:** Facts are user data. Interpretations are system analysis. Mixing them creates documents that are neither good logs nor good analytics. Separation also enables re-analysis: the same facts can be re-interpreted with a better algorithm without touching the original records.

**Correct:** FoodEntry `{ calories: 420, protein: 32, ... }` | SignalState `{ state: 'CUTTING', delta: -6.2%, ... }`
**Incorrect:** FoodEntry `{ calories: 420, protein: 32, ..., signal_contribution: 'deficit' }`

---

### D-INV-04: All user data is scoped by userId from the moment of creation

**Statement:** Every database document that belongs to a user contains `userId` (Google `sub` claim). No query ever runs without a `userId` filter unless explicitly operating on system-level data.

**Rationale:** Single-tenant data isolation must be architectural, not procedural. If user scoping is implemented at the query level by convention, one missed filter leaks data between users. Structural enforcement (index on `userId`, middleware validation) makes leakage impossible by construction.

**Consequences if violated:**
- Cross-user data leakage. GDPR violation. Product destruction.

---

## UX Invariants

---

### U-INV-01: Logging must remain instant

**Statement:** The time between pressing submit on a food log and seeing the entry appear on screen must be < 500ms in normal conditions. The AI analysis call must never block this path.

**Rationale:** Friction in logging is the primary cause of logging abandonment. If the user has to wait for AI analysis before the entry appears, they will stop mid-session. The entry must appear immediately; AI enrichment can follow asynchronously if needed.

**Consequences if violated:**
- Logging abandonment increases. Baseline data quality degrades. SIGNAL becomes unreliable.
- The product loses the fundamental trust loop: "I log → I see it → the system knows."

**Correct:** Entry appears in LOG zone immediately after submit. DayAggregate updates synchronously. SIGNAL recomputes async.
**Incorrect:** Submit button shows a spinner while waiting for AI analysis to complete.

---

### U-INV-02: The home screen is always calm

**Statement:** On home screen load, there is no animation beyond the designed reveal sequence. No pulsing elements, no attention-seeking badges, no notification dots, no animated charts. The screen settles within 700ms and remains still.

**Rationale:** The reference is an aircraft instrument panel, not a social media feed. The instrument panel communicates calmly. Attention-seeking UI competes with data. Every animated element that doesn't carry information is noise.

**Consequences if violated:**
- The product begins to feel like a fitness app, not a data instrument.
- Users are trained to skim rather than read. Data density is wasted.

---

### U-INV-03: Color communicates status, never identity

**Statement:** Chromatic color (anything outside the BG/INK/GOLD families) appears only where it signals a nutritional status relative to a target: STATUS-UP, STATUS-MID, STATUS-DOWN, WAVE tokens. Never for visual decoration, section identity, or brand expression.

**Rationale:** Monochromatic design with status-only color is what makes the instrument panel aesthetic work. The moment a section gets a "brand color" or macros get color-coded identities (#4ecdc4 for protein, etc.), the design becomes a consumer fitness app. See `decisions/006-monochromatic-palette.md`.

**Consequences if violated:**
- Visual language degrades. One "temporary" color becomes a precedent for the next one.
- Prohibited colors list becomes negotiable.

---

### U-INV-04: Absence is data, not failure

**Statement:** When data is absent — no entries today, SIGNAL not yet activated, training not yet logged — the UI is simply absent in that section. No skeleton screens, no empty state illustrations, no "get started" prompts, no zero-state filler.

**Rationale:** Empty UI implies a missing piece. Absent UI implies the piece hasn't been created yet. "Nothing here yet" is not a state — it's a loading indicator masquerading as content. The waveform bar for a day with no entries simply doesn't exist. The TODAY zone shows nothing if there's no data today. This is correct.

**Consequences if violated:**
- Empty states introduce visual noise that competes with real data.
- The product trains users to see absence as a problem to solve (gamification by proxy).

---

### U-INV-05: The command bar is the only fixed bottom element

**Statement:** No tab bar. No bottom navigation. No floating action buttons. The command bar is the sole persistent bottom UI element. All navigation is via the single-surface scroll and waveform interaction.

**Rationale:** Tab bars are the signature UI pattern of consumer lifestyle apps. The absence of a tab bar is an explicit positioning statement. See `decisions/007-no-tab-navigation.md`.

**Consequences if violated:**
- Product navigation becomes familiar in the wrong direction.
- The single-surface architecture (everything on one scroll, waveform = navigation) collapses.

---

## Engineering Invariants

---

### E-INV-01: Async intelligence never blocks interaction

**Statement:** No user-facing action (log food, delete entry, view home screen) ever waits for an AI call to complete before returning a response. AI synthesis is always queued and asynchronous.

**Rationale:** AI API latency is variable (50ms–5000ms). User interactions must be deterministic in latency. The sync/async boundary at DayAggregate (see `decisions/009-sync-async-boundary-dayaggregate.md`) is the architectural expression of this invariant.

**Consequences if violated:**
- Interaction latency becomes non-deterministic.
- During Claude API degradation, the entire product becomes slow.
- Logging feels unreliable. See U-INV-01.

---

### E-INV-02: The Anthropic API key never leaves the backend

**Statement:** `ANTHROPIC_API_KEY` is a backend secret. No frontend code, no client-side bundle, no environment variable exposed to the browser may contain it.

**Rationale:** A client-side API key is a public key. Anyone who inspects the JavaScript bundle or network requests can extract it and make API calls at Nouriq's expense. This is not a theoretical risk — it is routine.

**Consequences if violated:**
- Uncontrolled API cost. Key must be immediately revoked and rotated.

**Correct:** Frontend calls `POST /api/analyse`. Backend calls Anthropic.
**Incorrect:** Frontend calls `https://api.anthropic.com/...` directly.

---

### E-INV-03: Prefer deterministic systems over opaque AI behavior

**Statement:** When a behavior can be expressed as a rule, express it as a rule. AI synthesis is used for judgment calls that genuinely require language understanding. It is not used for thresholds, calculations, or binary decisions that have deterministic answers.

**Rationale:** Deterministic systems are debuggable, testable, cost-nothing-at-runtime, and produce identical output for identical input. AI produces probabilistic output with variable cost and latency. Using AI for things rules can handle is architectural debt.

**Correct:** READING and UNDERFUELLED are hard rules. No AI call.
**Incorrect:** "Let AI decide whether the user has enough data to show a state."

---

### E-INV-04: Modular monolith until scaling pressure is real and measured

**Statement:** No service extraction, no microservice split, no separate deployment unit until the specific bottleneck has been observed in production metrics. The two Lambda functions (api-handler, job-worker) are the current ceiling. Nothing is extracted until Atlas M10 latency, Lambda concurrency limits, or specific service-level isolation requirements force it.

**Rationale:** Premature extraction creates coordination overhead, distributed transactions, network failure modes, and operational complexity — for no benefit. Monolith refactoring is a one-day operation at the current codebase size. The right time to extract is when not extracting has a measured cost.

**Consequences if violated:**
- Two services that need to share a transaction. Distributed saga to fix it. Three weeks of engineering.

---

### E-INV-05: TypeScript strict mode; no `any` without documentation

**Statement:** `tsconfig.json` strict mode stays on. If `any` is truly necessary, the line above it must contain a comment explaining: why the specific type cannot be expressed, and what invariant protects against the `any` being misused.

**Rationale:** `any` is a type hole. It disables all downstream type checking. One `any` in a critical path (food parsing response, SIGNAL state computation) can produce silent runtime failures that strict types would catch at compile time.

---

### E-INV-06: Pre-computed documents as cache; no Redis until measured bottleneck

**Statement:** DayAggregate, SignalState, and BaselineSnapshot are the caching layer. No Redis, no ElastiCache, no CDN API cache until MongoDB read latency is a measured bottleneck at real load. See `decisions/010-no-redis-precomputed-docs-as-cache.md`.

**Consequences if violated:**
- Operational complexity added for a bottleneck that doesn't exist.
- Two consistency surfaces to maintain (MongoDB + Redis) instead of one.

---

## How to Change an Invariant

An invariant is not a law of physics — it can change. But changing one requires:

1. A DECISION_LOG entry identifying which invariant is being modified and why.
2. A `decisions/` ADR documenting the full context, alternatives, and consequences.
3. An update to this file with the new invariant statement and revised rationale.
4. A review of all components and systems that relied on the old invariant.

The bar for changing an invariant is: **"the product is better with the new invariant than the old one."** Convenience and schedule pressure are not sufficient.

---

*This file is the constitution of the implementation. When in doubt, defer to it.*
*Update date and DECISION_LOG entry required for any modification.*
