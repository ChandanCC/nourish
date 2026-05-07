# Component: Waveform

**Status:** Active — v1.0
**Last updated:** 2026-05-07

→ See: `signal-system.md#pattern-waveform` for semantic rules.
→ See: `design-tokens/colors.md#waveform-colors` for color tokens.
→ See: `motion-system.md#waveform-bar-tap-day-select` for tap animation.

---

## Purpose

The waveform visualizes 7 days of caloric position relative to the user's personal baseline. It communicates the *shape* of the week — not just today's number.

It is simultaneously:
1. A data visualization (what did the week look like)
2. The day navigation control (tap a bar to view that day)

---

## Structure

```
┌──────────────────────────────────────────────┐
│   ░                                          │  ← Bars (height = relative calories)
│   ░    ░         ░                           │
│   ░    ░    ░    ░    ░                      │
│ ─ ░ ─ ░ ─ ░ ─ ░ ─ ░ ─ ░ ─ ░ ─             │  ← Baseline axis
│             ░         ░    ░    ░            │
│             ░              ░    ░            │
│  Mon  Tue  Wed  Thu  Fri  Sat  Sun          │  ← Day labels
└──────────────────────────────────────────────┘
```

The baseline axis divides the chart. Bars above = surplus. Bars below = deficit.

---

## Dimensions

```
Width:        Full container width (breaks page gutter — edge to edge)
Height:       80px total (bars + baseline + day labels)
Bar width:    [container - 6 gaps] / 7 columns
Gap between:  8px (SP-2)
Baseline:     Horizontal line at 50% height of bar zone
Bar radius:   2px top corners only (bottom flush to baseline for above-bar; top flush for below-bar)
Day label:    6px below last bar / above first bar
```

---

## Bar Color Rules

| Bar State | Color | Value |
|---|---|---|
| Surplus (above baseline) | WAVE-SURPLUS | `rgba(237,184,74,0.60)` |
| Deficit (below baseline) | WAVE-DEFICIT | `rgba(232,227,216,0.22)` |
| Today (always) | WAVE-TODAY | `rgba(232,227,216,0.88)` |
| Today + surplus | Today color takes precedence | `rgba(232,227,216,0.88)` |
| Baseline axis | WAVE-BASELINE | `rgba(232,227,216,0.12)` |

**Today's bar is always the brightest.** Surplus/deficit coloring is secondary to the temporal signal.

**Why surplus is gold, not green:**
Surplus and deficit carry no inherent positive/negative valence — they depend on goal. Coding surplus green and deficit red would be semantically wrong for a user in a bulk phase (where surplus = correct). Gold = presence of fuel. Dim white = absence. Today = most current and most prominent.

---

## Bar Height Calculation

```
Max bar height:  60px (above or below baseline)
Baseline:        At 40px from top (leaves 40px above, 40px below for bars + 8px for day labels)

Bar pixel height = (day_calories / baseline_calories) × 40px, capped at 60px
For deficit: height below baseline = ((baseline - day_calories) / baseline_calories) × 40px, capped at 40px

Zero data day: bar height = 0px (bar not rendered, just gap)
```

The baseline is always rendered even if all bars are above or below.

---

## Day Labels

```
Mon  Tue  Wed  Thu  Fri  Sat  Sun

Font: LABEL — 9px DM Mono 400
Case: uppercase abbreviations (3 letters)
Color: INK-3 (22%) for all past/future days
       INK-1 (72%) for today
       INK-1 (72%) for selected day (when different from today)
Alignment: centered below each bar column
Margin-top: 6px from last bar
```

---

## Interactive Behavior (Day Selection)

The waveform is the day navigation control. Tapping a bar selects that day.

**Default state:** Today is selected. Today's bar is `WAVE-TODAY` (brightest).

**When bar is tapped:**
```
Selected bar:   opacity → 100% of its color (full INK-1 or full gold)
Unselected bars: opacity → 40% of their color — QUICK, 150ms
TODAY zone:     crossfades to selected day's data — STANDARD, 220ms
Command bar:    placeholder updates to "What did you eat on [Day]?" (if not today)
Compact strip:  updates to "OPTIMISING · Tue May 6 · ↓"
```

Tapping today's bar resets to default state.

**No date picker. No calendar. No "view more" for older data.** The waveform is the only navigation for time.

---

## Touch Target

Each bar column (including gap on either side) is the tap target. Minimum 44px wide. The bars themselves may be narrower visually.

```
Tap target per column = container_width / 7
Visual bar = tap target - gap (8px distributed left/right)
```

---

## No Y-Axis Labels

The waveform has no y-axis, no value overlays, no tooltips.

The shape is the message. Exact calorie values for past days are accessible via the TODAY zone when that day is selected — not from the waveform itself.

**Rationale:** Y-axis labels turn the waveform into a chart. Charts require reading. Waveforms are felt. The relative bar heights communicate the pattern; the absolute values are secondary.

---

## Today Indicator

No explicit "TODAY" label over the bar. Today is identified by:
1. Brightest bar (WAVE-TODAY)
2. Day label in INK-1 while others are INK-3

That is sufficient. A `TODAY` pointer or callout would be redundant.

---

## Animation Contracts

### On mount (app open)

Bars rise from baseline height 0 to final value, staggered 25ms per bar (left to right):
```
Bar 1: starts at 300ms — EASE-DATA, 220ms
Bar 2: starts at 325ms
...
Bar 7: starts at 450ms (finished by ~670ms)
```

### On day tap

```
 0ms  Selected bar: opacity → 100%
      Unselected bars: opacity → 40% — QUICK, 150ms
80ms  TODAY zone content crossfades — STANDARD, 220ms
```

### On new entry logged (today bar adjusts)

```
480ms (after entry animation begins): today bar height transitions to new value
      EASE-DATA, 240ms
```
