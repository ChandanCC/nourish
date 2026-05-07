# SIGNAL System

**Status:** Active — v1.0
**Last updated:** 2026-05-07

The SIGNAL system is Nouriq's hero experience. It is the singular thing that defines the product emotionally and functionally.

→ See: `decisions/003-signal-not-score.md` for why this is not a numeric score.
→ See: `design-system/components/signal-hero.md` for visual implementation.
→ See: `design-system/components/waveform.md` for waveform visual spec.

---

## What SIGNAL Is

SIGNAL is Nouriq's daily intelligence read — a synthesized assessment of whether a user's inputs (nutrition, training, recovery) are generating the output their goal requires. It is calculated by the AI, not by a user-configurable formula.

**Three components:**

| Component | What it is | Primary question answered |
|---|---|---|
| STATE | Text classification of current pattern | "What is my body operating in right now?" |
| DELTA | 7-day rolling deviation from personal baseline | "How far off my pattern am I?" |
| PATTERN | 7-day waveform visualization | "What does my week look like as a shape?" |

---

## STATE

### The Six States

States are earned by pattern, not by single-day performance. Minimum 3–4 consecutive qualifying days before a state transition occurs. This makes the system resistant to noise.

```
OPTIMISING      On track. Surplus/deficit appropriate to goal. Protein ≥ 80% target.
BUILDING        Consistent surplus. Training load rising. Muscle-building conditions.
CUTTING         Sustained deficit. Protein protected. Fat-loss conditions present.
UNDERFUELLED    Intake insufficient regardless of goal. Performance at risk.
PROTEIN-LIMITED Macros misaligned. Protein is the binding constraint.
DRIFTING        Inconsistent inputs. No clear signal. Course correction needed.
```

**Special state (insufficient data):**
```
READING         Less than 3 days of data. Baseline not yet established.
```

### State Display Rules

- DISPLAY size (32px Syne 800), full opacity, all caps.
- Below it: `Day N of this state · Pattern: [consistent | building | irregular]`
- STATE text never has a background color or a colored border.
- State transition: crossfade only (old fades out at 80ms, new fades in at 160ms). No color wash, no celebration.
- After transition: one-line confirmation at INK-2, holds 3 seconds, fades. Example: `State updated · Pattern detected over 4 days.`

### State Computation (AI-driven)

STATE is computed server-side via Claude analysis of:
1. Last 7 days of macro adherence (calories + protein relative to declared goal)
2. Consistency pattern (number of days with complete data)
3. Goal type (bulk / cut / maintain — user-declared at onboarding)
4. Trend direction (improving / declining / flat)

The computation prompt and output contract are defined in `engineering/ai-behavior.md`.

---

## DELTA

The 7-day rolling average deviation from the user's personal baseline, expressed as a percentage.

**Formula:**
```
DELTA = (7-day avg actual calories - user's baseline) / user's baseline × 100
```

Expressed as: `−14% below your baseline` or `+8% above your baseline`

**Baseline definition:**
The AI-computed daily caloric equilibrium based on the user's historical logging pattern. Not a user-set goal. Not a TDEE formula. The actual pattern the system has observed. Recalibrates every 10 days.

**Display rules:**
- LABEL size at DATA size: `13px DM Mono 500`, INK-1 (72% opacity)
- Full expression always: `−14% below your baseline`. Never just `−14%`.
- Never color-coded (negative delta is not necessarily bad — depends on goal).
- Appears below the waveform in the hero zone.

---

## PATTERN (Waveform)

A 7-day visual of caloric position relative to baseline. The shape communicates the week's pattern at a glance.

→ Full visual spec: `design-system/components/waveform.md`

**Semantic rules:**

| Shape | Meaning |
|---|---|
| Consistent bars below baseline | Clean cut — deficit pattern |
| Consistent bars above baseline | Clean bulk — surplus pattern |
| Jagged alternating | Undisciplined — DRIFTING state likely |
| Flat bars near baseline | Maintenance |
| Rising bars trend | Increasing intake |
| Today's bar significantly different from rest | Anomalous day — AI may surface insight |

**The waveform IS the day navigation.**
Tapping any bar updates the TODAY zone to show that day's data. No date picker. No calendar. No "history" tab.

---

## Weekly SIGNAL Report

Delivered every Sunday. Not a summary — a briefing.

**Format:**
```
WEEK N  ·  [Date range]

STATE HELD: [STATE]  (N of 7 days)
AVERAGE DELTA: [x]% [above/below] baseline
PROTEIN ADHERENCE: [x]%
DAYS LOGGED: N of 7

SIGNAL ASSESSMENT
[2-3 sentences of AI-generated pattern analysis]

ONE CHANGE THIS WEEK
[Single AI-generated operational instruction]

NEXT WEEK
[Forward-looking projection if pattern holds]
```

**Rules:**
- Never more than 6 lines of AI text total
- No praise-based language
- Always includes one forward projection
- Shareable as a text card (screenshot-worthy format)

---

## Immutable Principles

- SIGNAL is never a number between 0 and 100. → `decisions/003-signal-not-score.md`
- STATE transitions require pattern confirmation, never single-day triggers.
- DELTA is always relative to personal baseline, never a generic goal.
- The waveform never has Y-axis labels or value overlays.
- SIGNAL is always the first thing visible on app open. No content precedes it.
