# Decision Log

**Append-only. Most recent entries at top.**

Format per entry:
```
## [YYYY-MM-DD] [ID] — [Decision title]
Type: Architecture | Design | Product | Engineering | Overrides
Status: Active | Superseded by [ID]

Decision: [What was decided — one paragraph max]
Why: [The reason — constraints, alternatives considered, the forcing function]
Consequences: [What this means going forward — what it enables, what it prevents]
Files updated: [Which .plan/ files were created or changed]
```

---

## [2026-05-07] D-020 — Modular monolith on two Lambda functions; SQS FIFO for job queue

Type: Architecture
Status: Active

**Decision:** The backend is a single Express application (modular monolith) deployed as two Lambda functions: `api-handler` (synchronous, 29s timeout) and `job-worker` (asynchronous, 5-minute timeout). At early scale, jobs are triggered via Lambda async invocation. At v1.1+, jobs are queued via SQS FIFO with per-user message groups and 5-minute deduplication windows.

**Why:** Microservices impose coordination cost without value at sub-500 DAU. The monolith's internal module boundary (`routes/`, `services/`, `jobs/`, `ai/`) is the contract — extracting a service later is a one-day operation. Two Lambda functions (not one) are needed because API Gateway caps timeout at 29s, while AI-involved background jobs need up to 5 minutes. SQS FIFO was chosen over Lambda async invocation for reliability (retry, DLQ, deduplication) while avoiding operational complexity (no ECS, no Kubernetes).

**Consequences:** All business logic lives in shared modules. Both Lambda functions share models, services, and AI providers. Job deduplication (60-second window for SIGNAL recompute per user) prevents AI cost runaway on rapid successive writes.

**Files updated:** `.plan/engineering/backend-architecture.md`

---

## [2026-05-07] D-021 — Sync/async boundary at DayAggregate

Type: Architecture
Status: Active

**Decision:** DayAggregate recomputation is synchronous (runs before the API response is returned). SIGNAL recomputation is always asynchronous (queued, runs after the response). The user sees updated macro totals immediately after logging; updated SIGNAL state on the next home screen load.

**Why:** Macro counts are facts the user just created — they need to see the number now. SIGNAL is a pattern derived from AI synthesis over multiple days — it cannot be more current than the data behind it, and running AI while the user waits for a save confirmation is wrong. The sync boundary also means GET /api/home is always a fast read of pre-computed state, never a computation trigger.

**Consequences:** GET /api/home is a pure read (< 50ms). Every write is slightly slower than it would be without the synchronous DayAggregate step (adds ~20ms), but macro data is always fresh in the response.

**Files updated:** `.plan/engineering/backend-architecture.md`

---

## [2026-05-07] D-022 — No Redis; pre-computed MongoDB documents are the cache

Type: Architecture
Status: Active

**Decision:** There is no caching layer (Redis, ElastiCache, CDN API cache). Expensive operations (daily macro summation, baseline computation, AI synthesis) are run once on the write path and persisted as documents. Fast reads serve pre-computed state. The "cache" is DayAggregate, SignalState, and BaselineSnapshot documents.

**Why:** Redis adds operational complexity (another service, another connection pool, another failure mode) without meaningful benefit at the current scale. The pre-computed document model achieves sub-50ms GET /api/home reads from MongoDB with proper indexes. Adding Redis becomes necessary when MongoDB read latency becomes a bottleneck — that happens at ~5,000+ DAU, not before.

**Consequences:** Write paths are slightly more complex (must update pre-computed documents). Read paths are simple and fast. The tradeoff is correct for a data product where writes are infrequent (5 per user per day) and reads are frequent (multiple per hour on active days).

**Files updated:** `.plan/engineering/backend-architecture.md`

---

## [2026-05-07] D-023 — Deterministic SIGNAL fallback when AI synthesis fails

Type: Architecture
Status: Active

**Decision:** When the AI synthesis call (Tier 3) fails, times out, or returns an invalid response, the system falls back to a deterministic state derived from Tier 1 + Tier 2 output only. The fallback rule: if Tier 1 safety rules fired, return that state. If confidence < 60, return DRIFTING. Otherwise, return the top candidate state with `ai_instruction = null`. The previous SignalState is retained if fallback computation also fails.

**Why:** The user must always see a valid state, not an error screen. The SIGNAL's credibility depends on never being unavailable. A less-precise state (DRIFTING when OPTIMISING might be more accurate) is better than an error. The fallback is transparent — `is_stale = true` indicates the state may be less precise than normal.

**Consequences:** The system is resilient to Claude API outages. AI synthesis is enhancement, not dependency. Trust is maintained.

**Files updated:** `.plan/engineering/backend-architecture.md`, `.plan/engineering/ai-behavior.md`

---

## [2026-05-07] D-019 — AI instruction max 120 characters, specific numbers required

Type: Engineering + Product
Status: Active

**Decision:** The AI instruction line is hard-capped at 120 characters and must reference specific numbers to be valid. "Your protein is below target" is not a valid instruction. "Protein is 48g below target — add a protein source to dinner." is valid. The backend enforces this via length truncation and the prompt enforces it via rules.

**Why:** Generic instructions are noise. Users stop reading them because they could apply to anyone at any time. Specific numbers make the instruction verifiable (the user can check), time-bound (the number will be different tomorrow), and actionable (the user knows exactly what the gap is). The 120-character limit prevents over-explanation — if the instruction needs more than 120 characters, it is two instructions, and only one should be shown.

**Consequences:** AI instruction generation will occasionally return null when it can't produce a specific-number instruction. This is correct behavior, not a failure.

**Files updated:** `.plan/engineering/ai-behavior.md`, `.plan/engineering/intelligence-architecture.md#15-voice-protocol`

---

## [2026-05-07] D-018 — Safety states are Tier 1 hard rules; AI cannot override them

Type: Architecture
Status: Active

**Decision:** READING and UNDERFUELLED are determined by deterministic Tier 1 rules. If either triggers, the AI is not called. These states are not in the `candidate_states` array passed to Claude. The AI cannot vote against them.

**Why:** These are the two states where being wrong has the most consequences. UNDERFUELLED being missed (AI calls it OPTIMISING) is a health safety failure. READING being missed (AI generates a STATE with 2 days of data) destroys trust on first use. Rule-based precision on safety states is more reliable than AI judgment, and removes a whole category of possible hallucination.

**Consequences:** If the backend has a bug in the UNDERFUELLED check, the AI will not catch it. This means the Tier 1 checks are load-bearing and must be tested carefully. The AI's reliability for the positive states is enhanced by the knowledge that safety states are handled elsewhere.

**Files updated:** `.plan/engineering/intelligence-architecture.md#1-tri-tier-architecture`, `.plan/engineering/ai-behavior.md`

---

## [2026-05-07] D-017 — Silence is the default; instruction appears only when specific and actionable

Type: Product + AI
Status: Active

**Decision:** The AI instruction line is absent by default. It appears only when: a specific, numbered gap exists that is actionable within the remaining day; a state transition requires explanation; or a goal-behavior contradiction should be surfaced. The system is explicitly silent when the user is on track.

**Why:** An AI that always generates an instruction is performing intelligence, not exhibiting it. The scarcity of the instruction line is what gives it signal value. A user who sees the instruction line absent 70% of the time will pay close attention the 30% of the time it appears. This is the Bloomberg model: the terminal shows values; anomalies speak for themselves.

**Consequences:** The AI will return null frequently. This must be treated as correct behavior in all dashboards and monitoring. A null instruction rate of 50–70% is expected and desirable.

**Files updated:** `.plan/engineering/intelligence-architecture.md#14-silence-protocol`

---

## [2026-05-07] D-016 — Conservative bias: prefer DRIFTING over false-positive positive states

Type: AI + Product
Status: Active

**Decision:** The AI synthesis prompt explicitly instructs Claude to prefer the more conservative state when candidates are equally plausible. The system prompt says: "A false positive (claiming OPTIMISING when unwarranted) is more damaging than a false negative (staying in DRIFTING one more day)." Additionally, accounts < 14 days old have all positive state thresholds tightened by 5%.

**Why:** Trust in an AI system is asymmetric — one false positive causes more damage than several false negatives. If OPTIMISING appears during a week the user knows was chaotic, the system's credibility collapses. If DRIFTING appears during a good week, the user simply logs more and the state corrects itself. The cost of a false negative is low; the cost of a false positive is high.

**Consequences:** New users may stay in READING or DRIFTING slightly longer before reaching OPTIMISING. This is acceptable. The first SIGNAL read should be unambiguously accurate.

**Files updated:** `.plan/engineering/intelligence-architecture.md#13-false-positive-prevention`

---

## [2026-05-07] D-015 — Baseline is observed behavioral median, not TDEE formula

Type: Architecture
Status: Active

**Decision:** The personal baseline is the weighted median of the user's logged calorie data over 30 days, with outlier suppression and recency weighting. It is not computed from a formula (Mifflin-St Jeor, Harris-Benedict, etc.). No body weight, height, age, or activity level is used.

**Why:** TDEE formulas produce a theoretical maintenance value that rarely matches actual intake. A user who eats 1,800 kcal despite a "calculated" TDEE of 2,200 has a behavioral baseline of 1,800. DELTA relative to their actual pattern is more useful than DELTA relative to a formula — it shows them how they're deviating from themselves, not from a model of an average person. The weighted median is more robust than mean to single-occasion spikes (holiday dinners, cheat days) that would artificially elevate the baseline.

**Consequences:** The baseline requires 7 logged days before it is established. DELTA is unavailable before that. This is honest and correct — a baseline that claims to represent a 2-day pattern is not a baseline.

**Files updated:** `.plan/engineering/intelligence-architecture.md#3-baseline-formation`, `.plan/ux/onboarding-system.md#15-data-requirements-vs-optional`

---

## [2026-05-07] D-014 — Tri-tier intelligence architecture: deterministic → statistical → AI

Type: Architecture
Status: Active

**Decision:** The intelligence layer is divided into three tiers with defined responsibilities and precedence rules. Tier 1 (deterministic math) cannot be overridden by Tier 2 or 3. Tier 2 (statistical analysis) computes a pre-qualified candidate set before the AI is called. Tier 3 (Claude) receives only pre-computed summaries, not raw logs.

**Why:** Giving Claude raw log data and asking it to compute SIGNAL is technically possible but wrong for three reasons: (1) it makes computation non-auditable — if the AI produces the wrong state, there is no trail; (2) it conflates computation and judgment — the AI's value is synthesis, not arithmetic; (3) it exposes the entire computation to hallucination risk. By pre-computing all statistical values in Tier 2, the AI can only synthesize from verified numbers. Wrong synthesis is catchable (the candidate states constrain the output); wrong arithmetic is silent.

**Consequences:** The backend must implement the full Tier 1 and Tier 2 computation before calling Claude. This is more engineering work than "pass logs to Claude and ask for a state." The payoff is: auditable, debuggable, cost-efficient (fewer tokens), and resistant to hallucination.

**Files updated:** `.plan/engineering/intelligence-architecture.md`, `.plan/engineering/ai-behavior.md`

---

## [2026-05-07] D-013 — Activation milestone = first accurate SIGNAL recognition

Type: Product
Status: Active

**Decision:** The activation milestone is defined as the moment a user sees their first computed SIGNAL STATE and recognizes it as accurate. The proxy metric for analytics is day-7 log completion rate.

**Why:** Most apps define activation as "completing setup" or "reaching day 7 streak." These are inputs, not outcomes. The actual commitment event is when the system demonstrates intelligence — naming a pattern the user already knew was true. This is the Oura / WHOOP model (recovery score accuracy = retention driver) applied to nutrition pattern recognition.

**Consequences:** The AI computation quality for STATE is a retention lever, not a nice-to-have. An inaccurate first STATE creates churn. A conservative algorithm (stay in READING or DRIFTING rather than claim OPTIMISING prematurely) is preferable to an optimistic one. Day-7 log rate is the primary onboarding funnel metric.

**Files updated:** `.plan/ux/onboarding-system.md#17-the-activation-milestone`

---

## [2026-05-07] D-012 — SIGNAL first-time explanation is inline, not modal

Type: Design
Status: Active

**Decision:** When SIGNAL activates for the first time (day 7+), the explanation appears as inline content in the home screen between the hero zone and TODAY zone — not as a modal, overlay, or tooltip. It is one-time only, dismissable with "Understood."

**Why:** A modal implies interruption and separates the explanation from the thing being explained. Inline content in the same visual language as the product allows the user to read the explanation while looking at the SIGNAL hero directly above it. The explanation references the user's actual computed state and their actual numbers — making it personal, not generic.

**Consequences:** The explanation block requires vertical space in the home screen layout (one session only). After dismissal, it never appears again — there is no "explain SIGNAL" help entry. If a user misses it, they learn by using the product.

**Files updated:** `.plan/ux/onboarding-system.md#9-day-7-signal-first-appearance`

---

## [2026-05-07] D-011 — No bodyweight question in onboarding

Type: Product
Status: Active

**Decision:** Onboarding does not ask for body weight. Protein target is pre-filled with a reasonable goal-based default (BUILD: 160g, LOSE: 150g, MAINTAIN: 130g). Baseline calories are observed from logging behavior, not computed from a TDEE formula.

**Why:** Body weight is the most fraught data point in fitness apps. It implies the app's primary interest is weight management, introduces anxiety, and is used by most competitors in a TDEE formula that produces a calorie target the system then has to "update" when reality diverges. Nouriq's insight: the user's actual logging behavior is a better signal than any formula applied to biometric inputs. Observing 7 days of actual intake is more accurate than calculating a TDEE estimate.

**Consequences:** The system cannot compute TDEE. DELTA is expressed as deviation from the user's personal observed baseline, not from a predicted maintenance value. This is actually more accurate for established users but requires 7 days before it's meaningful.

**Files updated:** `.plan/ux/onboarding-system.md#3-screen-architecture`, `.plan/ux/onboarding-system.md#15-data-requirements-vs-optional`

---

## [2026-05-07] D-010 — Calibration narrative: "system is reading" not "system is setting up"

Type: Product + Copy
Status: Active

**Decision:** The READING state is framed as the system actively observing, not as a setup period the user must wait out. Copy: "The system is beginning to learn" / "Baseline forming" / "Pattern emerging." Never: "3 more days until your SIGNAL" / "Setup complete in X days."

**Why:** "Wait while we set up" positions the product as not yet working. "The system is reading your pattern" positions logging day 1 as the product already working. The distinction is psychological but material: in the first framing, users check the app for completion; in the second, they log because logging is the product.

**Consequences:** The READING state subtitle must never count down to SIGNAL. Day counter (`Day 4`) is informational. The system state qualifiers (`Baseline forming` / `Pattern emerging`) communicate active observation without implying a timer.

**Files updated:** `.plan/ux/onboarding-system.md#6-reading-state-active-not-empty`, `.plan/product/signal-system.md`

---

## [2026-05-07] D-009 — Training introduced day 3, passively

Type: UX
Status: Active

**Decision:** The TRAINING section in the TODAY zone first appears on day 3, with no announcement, notification, or "new feature" indicator. It is simply present in its normal empty state on the next app open after day 3.

**Why:** Introducing training on day 1 fragments attention during the critical trust-building window (where accuracy of food logging is the primary proof of system quality). After 3 days, the daily logging habit is established. The training section's appearance is the feature — discovering it without being told creates a sense that the product is intelligently expanding, not sequentially releasing features on a timer.

**Consequences:** Users who don't train will see `TRAINING · Not logged` indefinitely. This is acceptable — the section is low-prominence and the AI instruction line ("→ Log your session") is the only prompt. No push notification, no badge, no "complete your profile" pressure.

**Files updated:** `.plan/ux/onboarding-system.md#13-workout-logging-introduction`, `.plan/design-system/home-screen.md`

---

## [2026-05-07] D-008 — Onboarding: 3 screens then product drop

Type: UX + Design
Status: Active

**Decision:** Onboarding is exactly 3 screens (Welcome / Goal / Protein target) followed by an immediate transition to the live product in READING state. No feature tour. No tutorial overlay. No completion screen. The command bar is pre-focused on first session with a contextual placeholder: "Start with what you had this morning."

**Why:** The Linear / Raycast / Arc model: onboarding ends by putting the user inside the product, doing the primary action, not by explaining what the product does. Every second spent on setup screens is a second the user is not experiencing the product's core value (AI food parsing accuracy). The first log is the onboarding — it proves the system works faster than any feature list could.

**Consequences:** Users who don't log on the first session have seen 3 screens and an empty home screen. They have no demonstrated value. Retention for this cohort will be low. Acceptable: the goal is to get users to log immediately, not to retain users who didn't engage with the product.

**Files updated:** `.plan/ux/onboarding-system.md`

---

## [2026-05-07] D-007 — No tab bar navigation; single-surface app

Type: Design + Product
Status: Active

**Decision:** The app has no bottom navigation tab bar. It is a single surface. The only fixed bottom element is the command bar. Navigation between time periods is via the waveform (tap a bar). Settings are via the avatar.

**Why:** A tab bar implies multiple parallel contexts of equal weight. Nouriq has one context: the daily loop (log → read your signal → adjust). Everything else is subordinate. A tab bar would visually imply that "History" or "Profile" are co-equal with the daily signal, which they are not. The command bar must be the only fixed bottom element for visual hierarchy.

**Consequences:** Settings and profile need an access pattern that isn't a tab — currently: avatar tap → settings sheet. If the product grows features that are genuinely orthogonal to the daily loop, this decision must be revisited with a new ADR.

**Files updated:** `.plan/decisions/007-no-tab-navigation.md`, `.plan/design-system/home-screen.md`

---

## [2026-05-07] D-006 — Monochromatic palette; four colors banned

Type: Design
Status: Active

**Decision:** The UI uses one background family, one ink family (opacity-only), one brand accent (GOLD, max 3 placements), and three status signals. The four old macro colors (`#4ecdc4`, `#ffa552`, `#ff6b9d`, `#a78bfa`) and the old gold (`#ffc864`) are explicitly banned.

**Why:** Color-coded macros are the default pattern for every nutrition app. Breaking from it is a deliberate differentiation for the target audience (analytical, data-serious). More practically: color for identity creates noise. Color for status creates signal. Nouriq needs the latter. Macro identity is communicated by labels (`PROTEIN`, `CARBS`, etc.) at 9px uppercase — color is redundant and distracting.

**Consequences:** Every new UI element defaults to the INK opacity hierarchy. The ONLY path to chromatic color in new elements is if they express a genuine health/nutritional status relative to a target.

**Files updated:** `.plan/decisions/006-monochromatic-palette.md`, `.plan/design-system/tokens/colors.md`

---

## [2026-05-07] D-005 — Anthropic API proxied through backend

Type: Engineering
Status: Active

**Decision:** All calls to the Anthropic API are made from the Express backend via `POST /api/analyse`. The API key is never in frontend code. The system prompt is never exposed to the client.

**Why:** Direct browser-to-Anthropic calls fail with CORS errors and expose the API key in the client bundle. This was discovered when the initial implementation called Anthropic directly from the React frontend.

**Consequences:** The `SYSTEM_PROMPT` is a server-side artifact. The model selection (`claude-sonnet-4-6`) is server-side. The frontend sends text; the backend returns structured data. Any model upgrades or prompt changes are backend-only, no frontend deploy needed.

**Files updated:** `.plan/decisions/005-anthropic-proxy.md`, `.plan/engineering/ai-behavior.md`, `backend/src/routes/analyse.ts`

---

## [2026-05-07] D-004 — Exactly two typefaces (Syne + DM Mono)

Type: Design
Status: Active

**Decision:** Syne (weights 700, 800) for STATE text and rare section headers. DM Mono (weights 400, 500) for everything else. No other typefaces. Six font sizes total (DISPLAY/TITLE/DATA/BODY/LABEL/MICRO).

**Why:** Monospace for data is functionally correct (tabular number alignment). The specific choice of DM Mono reinforces the instrument/terminal aesthetic. Syne at ExtraBold creates a confident, precise hero element for STATE text. The constraint (exactly two) prevents the slow accumulation of "just one more font for this one use case" that degrades type systems.

**Consequences:** Any design element that "needs a third font" is actually a design problem, not a font problem. Resolve the hierarchy with size, weight, and opacity — not a new typeface.

**Files updated:** `.plan/decisions/004-two-fonts.md`, `.plan/design-system/tokens/typography.md`

---

## [2026-05-07] D-003 — SIGNAL is a state, not a score

Type: Product
Status: Active

**Decision:** The SIGNAL system outputs a named state (one of six labels) rather than a number between 0 and 100. No rings, no percentages, no daily readiness score.

**Why:** Numeric scores are arbitrary and gameable. "74" tells you nothing actionable. Users optimize for the metric rather than the behavior. Named states carry semantic content: `UNDERFUELLED` tells you what's wrong and what to do. The 3–4 day minimum before state transitions makes the system noise-resistant.

**Consequences:** STATE computation requires AI judgment, not a formula. This is intentional — the complexity of the computation is the value. Users cannot "game" a state they don't fully understand the rules of.

**Files updated:** `.plan/decisions/003-signal-not-score.md`, `.plan/product/signal-system.md`

---

## [2026-05-07] D-002 — Google OAuth + JWT; no server sessions

Type: Engineering
Status: Active

**Decision:** Google OAuth 2.0 for identity verification; 30-day JWT for session management. JWT stored in localStorage. No server-side session store.

**Why:** Replaced anonymous UUID auth (no real identity, no cross-device, no recovery). Google OAuth removes the need for password infrastructure. JWT is stateless — works across Lambda cold starts and avoids Redis/session DB overhead. 30-day expiry matches "check occasionally" usage patterns.

**Consequences:** No server-side token revocation. Logout is client-side (delete from localStorage). Token rotation requires re-login. Google account closure = no recovery path in v1.0.

**Files updated:** `.plan/decisions/002-google-auth-jwt.md`, `backend/src/middleware/auth.ts`, `backend/src/routes/auth.ts`, `frontend/src/lib/auth.ts`, `frontend/src/hooks/useAuth.ts`

---

## [2026-05-07] D-001 — npm workspaces monorepo

Type: Engineering
Status: Active

**Decision:** Root `package.json` with npm workspaces (`frontend`, `backend`). `concurrently` for running both dev servers with `npm run dev`.

**Why:** Both packages existed in the same repo without a shared management layer. Workspace structure enables single-command dev startup and shared dependency de-duplication. No Turborepo or Nx — unnecessary complexity at current scale.

**Consequences:** `npm install` at root installs all workspace deps. CI runs from root. Future shared types package would live in `packages/` — workspace config supports this.

**Files updated:** `.plan/decisions/001-monorepo-structure.md`, `/package.json` (root)

---

## How to Append a New Entry

Copy this template, fill in, paste above the oldest entry:

```
## [YYYY-MM-DD] D-XXX — [Title]

Type: Architecture | Design | Product | Engineering | Override
Status: Active | Superseded by D-XXX

**Decision:** [What was decided]

**Why:** [The reason]

**Consequences:** [What this means going forward]

**Files updated:** [Which files changed]
```

Increment the ID (D-008, D-009, etc.). Keep most recent at top.
