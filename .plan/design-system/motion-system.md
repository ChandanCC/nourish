# Motion System

**Status:** Active — v1.0
**Last updated:** 2026-05-07

→ See: `product/core-principles.md#motion-carries-information-or-is-absent`

---

## Governing Rule

Every animation must pass this test: **state its informational purpose in one sentence.**

If the purpose cannot be stated, the animation is removed.

---

## Easing Library

```
EASE-ARRIVE    cubic-bezier(0.16, 1, 0.3, 1)
               UI elements entering, arriving at rest position.
               Fast acceleration, smooth deceleration.

EASE-DEPART    cubic-bezier(0.5, 0, 0.84, 0)
               UI elements leaving, exiting view.
               Slow start, fast exit.

EASE-DATA      cubic-bezier(0.0, 0.0, 0.2, 1)
               Data values resolving: number counts, progress bar fills.
               Starts fast, decelerates to final value. Communicates: "value settling."

LINEAR         Used only for pure opacity transitions.
               Opacity has no physical analogy; linear is most honest.
```

**Never use:**
- Spring physics (`tension`, `friction`, `bounce` parameters)
- `cubic-bezier` with overshoot (y values > 1)
- `ease-in-out` — symmetrical easing reads as undecided; use directional easing

---

## Duration Library

```
INSTANT     80ms     Touch/press state feedback (button down visual)
QUICK      150ms     Border color change, opacity shift, icon swap
STANDARD   220ms     Card expand/collapse, content transition, section update
DATA       320ms     Progress bar fills, number counting, waveform bar rise
OPEN       700ms     Total app-open sequence (staggered internally)
```

**Rule:** Duration is proportional to the distance or complexity of the change, not to the importance of the element.

---

## Specific Animation Contracts

### App Open Sequence

Purpose: communicate "the system is reading your data."

```
  0ms    Background renders (#08080D)
 80ms    Wordmark fades in — opacity 0→1, LINEAR, QUICK
160ms    STATE text fades in — opacity 0→1, LINEAR, QUICK
230ms    State subtitle fades in — opacity 0→1, LINEAR, QUICK
300ms    Waveform bar 1 rises — height 0→value, EASE-DATA, 220ms
325ms    Waveform bar 2 rises (25ms stagger)
350ms    Bar 3...
...      Each bar 25ms after previous
475ms    Waveform complete
520ms    Delta number counts 0→value — EASE-DATA, 260ms
640ms    TODAY zone fades in — EASE-ARRIVE, 180ms
700ms    Command bar activates
```

No loading spinner. No skeleton state. Data loads behind the animation. If data is unavailable, waveform bars render at zero height and STATE shows `READING`.

### New Entry Logged

Purpose: communicate "the AI processed your input and updated your data."

```
  0ms    Analysis complete
 50ms    Command bar input clears
100ms    New EntryCard slides up from command bar — EASE-ARRIVE, 220ms
         Transform: translateY(20px)→0, opacity 0→1
140ms    Calorie value counts 0→value — EASE-DATA, 340ms
200ms    Protein value counts — EASE-DATA, 280ms (40ms after calories)
240ms    Carbs value counts — 40ms after protein
280ms    Fat value counts — 40ms after carbs
320ms    TODAY calorie count transitions to new value — EASE-DATA, 200ms
360ms    Protein bar extends — EASE-DATA, 280ms
480ms    Waveform today bar adjusts — EASE-DATA, 240ms
```

### Number Counting

Purpose: communicate "this value was just calculated."

- Counts every integer (no jumping).
- Values > 500: start count at 75% of final value (e.g., count from 364 for a value of 485).
- Values ≤ 100: count from 0.
- Easing: EASE-DATA (fast start, decelerates to final value).
- Duration: DATA (320ms).

### State Transition

Purpose: communicate "your pattern shifted — the system detected it."

```
  0ms    Transition triggered by system
 80ms    Current STATE text: opacity 1→0 — LINEAR, QUICK
160ms    New STATE text: opacity 0→1 — LINEAR, QUICK
240ms    Confirmation line appears below:
         "State updated · Pattern detected over N days."
         Opacity 0→0.25 — LINEAR, 100ms
         Holds: 3000ms
         Opacity 0.25→0 — LINEAR, 200ms
```

Nothing else animates. No background color change. No screen transition. No sound.

### SIGNAL Hero Collapse (on scroll)

Purpose: communicate "the hero is compressing to give you space for detail."

```
Duration:  200ms
Easing:    EASE-DEPART (scrolls away naturally)
Property:  height (hero zone) collapses
           waveform fades out (opacity, LINEAR, 150ms)
           compact strip fades in (opacity, LINEAR, 150ms)
```

The collapse is driven by scroll position, not by a trigger. It feels physical — the hero zone scrolls partially off-screen and the compact strip solidifies in its place.

### Waveform Bar Tap (Day Select)

Purpose: communicate "the system is showing you a different day."

```
 0ms    Selected bar: opacity increases to 100%
        Unselected bars: opacity decreases to 40% — QUICK, 150ms
80ms    TODAY zone content crossfades to selected day — STANDARD, 220ms
        (opacity 1→0 on current content, 0→1 on new content, overlapping)
100ms   Command bar placeholder updates (if not today):
        "What did you eat on Tuesday?"
```

### Card Expand/Collapse

Purpose: communicate "more data is available."

```
Expand:
  Height: 0→auto — EASE-ARRIVE, STANDARD (220ms)
  Separator line draws in left-to-right: width 0→100%, EASE-ARRIVE, 100ms
  Content fades in: opacity 0→1, LINEAR, 150ms (80ms delay after height begins)

Collapse:
  Content fades out: opacity 1→0, LINEAR, 100ms
  Height: auto→0 — EASE-DEPART, STANDARD (200ms, 80ms after content fades)
```

### Progress Bar Fill (on mount)

Purpose: communicate "here is your current value, just rendered."

```
Width: 0→current value%, EASE-DATA, DATA (320ms)
Delay: 80ms after the parent element is visible
```

### Goal Completion Pulse (protein target met)

Purpose: communicate "a threshold was crossed — without celebrating."

```
Protein value (DATA size): brightness 100%→160%→100%
Duration: 120ms total (60ms up, 60ms down)
Easing: LINEAR both directions
```

One pulse. Not a banner. Not a toast. Not a streak notification. A flicker — noticed by attentive users, invisible to casual users.

---

## What Never Animates

- **Hover states** on cards: no scale transform, no shadow appearance, no border brightening on hover. Hover on mobile is a non-concept. On desktop, the border subtly brightens via CSS transition — 150ms, LINEAR. That's all.
- **Page transitions:** The app is a single surface. There are no page transitions because there are no pages.
- **Loading states:** No skeleton screens. No spinner overlays. Either data is there or it isn't. If it isn't, the UI is absent (not loading placeholder).
- **Scroll-triggered fade-ins:** Content does not fade in as it enters the viewport. This is a blog pattern, not a data tool pattern.
- **Decorative particle effects, gradients, or atmospheric animations.**
