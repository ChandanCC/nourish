# Glossary

**Status:** Active
**Last updated:** 2026-05-07

Canonical definitions for all product-specific terms used in `.plan/` docs and in product copy. When a term has a specific meaning in Nouriq that differs from its common usage, the Nouriq definition takes precedence.

→ See: `product/signal-system.md` for full semantic rules governing SIGNAL components.
→ See: `product/signal-states.md` for the complete state machine.

---

## Core SIGNAL Terms

**SIGNAL**
The product's hero concept. A synthesized intelligence read — STATE + DELTA + PATTERN — computed from a user's actual logged data. Not a score, not a percentage, not a goal progress bar. A named pattern state with supporting data.

**STATE**
The primary output of the SIGNAL system. A text classification of the user's current nutritional/training pattern. One of seven values: `OPTIMISING`, `BUILDING`, `CUTTING`, `UNDERFUELLED`, `PROTEIN-LIMITED`, `DRIFTING`, `READING`. Always displayed at DISPLAY size (32px Syne 800), never color-coded.

**DELTA**
7-day rolling percentage deviation from the user's personal baseline. `+8% above your baseline`. Never just `+8%`. Never color-coded — negative delta is not inherently bad (depends on goal). Always expressed as a full sentence.

**PATTERN**
The 7-day waveform visualization. The shape of the week at a glance. Each bar is one day's caloric position relative to baseline. The waveform is also the day navigation UI — tapping a bar selects that day.

**READING**
Special pre-STATE. Active when fewer than 3 days of data exist. Baseline not yet established. Not a failure state — it is honest about what the system can and cannot know. Displayed exactly like STATE (DISPLAY size) but with a day counter subtitle.

**BASELINE**
The system's computed estimate of the user's personal caloric equilibrium — the daily intake the user has actually been eating. Computed from logged history (weighted median, λ=0.04 exponential decay), not from a formula. Recalibrates every 10 logged days. Never user-settable.

**PATTERN QUALIFIER**
A secondary label applied to the current STATE: `consistent`, `building`, or `irregular`. Derived from the coefficient of variation and linear regression slope over the last 7 days. Appears on the sub-line below STATE: `Day N of this state · Pattern: consistent`.

**RECOMPUTE**
The process of recalculating DayAggregates, SIGNAL state, and baseline from current log data. Triggered by any write operation (food log created/deleted). DayAggregate recompute is synchronous (user waits ~200ms). SIGNAL recompute is always async (queued job).

---

## Data Terms

**FoodEntry**
A single food log record. Immutable after creation — never edited, only soft-deleted. Contains: parsed food name, calories, protein, carbs, fat, fiber, meal label (breakfast/lunch/dinner/snack), timestamp, raw user input string, source (manual/voice).

**DayAggregate**
A pre-computed MongoDB document summarizing one user's logged intake for one calendar day. Contains totals (calories, macros, entry count). Recomputed synchronously on every write. The read path never sums raw FoodEntry documents.

**SignalState**
A pre-computed MongoDB document recording the current SIGNAL output (STATE, DELTA, PATTERN) plus its inputs (summary stats, AI reasoning). One per user, updated by async SIGNAL job. The home screen reads this document directly — never recomputes on request.

**BaselineSnapshot**
A stored historical record of a user's baseline value at a specific point in time. Append-only — baselines are never mutated, only superseded by a newer snapshot. Used for DELTA trending and SIGNAL recalibration.

---

## UX Terms

**Command Bar**
The always-visible bottom element. The sole mechanism for adding new log entries. Contains: input field, submit action. Focused on app open (first session). Never dismissed. Never hidden. The app's only fixed bottom element.

**TODAY Zone**
The second zone on the home screen (below the SIGNAL hero). Contains: Daily Position (macro rows), Training section (day 3+), Micros section. Updates when a waveform bar is tapped — shows the selected day's data, not necessarily today's.

**LOG Zone**
The third zone on the home screen. The list of FoodEntry cards for the selected day. Individual EntryCard components. Sorted by time descending.

**EntryCard**
The list item component for a single FoodEntry. Collapsed: name + calorie count + macro summary line. Expanded: full macro rows with progress bars + item breakdown + timestamp + delete action. No color coding on macros.

**SIGNAL Hero**
The first zone on the home screen. Full viewport height on initial load, collapses to a 44px sticky strip on scroll. Contains: wordmark (collapsed strip only), STATE, DELTA line, waveform.

---

## Onboarding Terms

**READING State Subtitle**
The text shown below STATE during the READING period. Days 1–3: `Day N · Baseline forming`. Days 4–6: `Pattern emerging`. Day 7+: transitions to full STATE display.

**SIGNAL Activation**
The moment on Day 7 when the system transitions from READING to a full computed STATE. Not announced with a celebration. The READING subtitle simply stops appearing and STATE is shown. A first-time explanation block appears inline (below hero, above TODAY) — one time only, dismissable with "Understood".

**Product Drop**
The final screen of onboarding. The home screen appears in READING state with the command bar pre-focused. First-session placeholder text: "Start with what you had this morning."

---

## Engineering Terms

**Idempotency Key**
A UUID v4 generated per-submit-tap, attached to all write requests. The backend checks for duplicate keys before inserting — if already present, returns the existing record. Prevents double-submission on network retry.

**Async Job**
Any computation that runs outside the HTTP request-response cycle. SIGNAL recomputation, baseline recalibration, weekly report generation. Enqueued to SQS FIFO, processed by the job-worker Lambda. User never waits for async job output.

**Deterministic Fallback**
When AI synthesis (Tier 3) fails or times out, the system returns a Tier 1+2 derived STATE instead of an error. The fallback state is always a valid STATE value — never an error screen, never a loading spinner.

---

*Update this file when a new term gains a product-specific meaning not derivable from common usage.*
