# Component: Progress Bar

**Status:** Active — v1.0
**Last updated:** 2026-05-07

→ See: `component-specs/macro-row.md` for usage in macro rows.
→ See: `motion-system.md#progress-bar-fill-on-mount` for animation.

---

## Purpose

A single-dimension fill indicating current value as a fraction of a target. Used exclusively for nutritional targets where a progress metaphor is semantically accurate.

---

## Visual Anatomy

```
Track:  ───────────────────────────────────
Fill:   ──────────────░░░░░░░░░░░░░░░░░░░░
                      ↑ fill endpoint
```

```
Track height:  3px
Fill height:   3px (same, overlaid)
Track color:   rgba(232,227,216,0.09)   /* INK-4 */
Fill color:    rgba(232,227,216,0.60)   /* INK between INK-1 and INK-0 */
Border-radius: 2px (track and fill)
Width:         flex-grow (fills available space in macro row layout)
```

**No gradient on fill.** Flat fill only.
**No colored fills.** Fill is always the warm white at a fixed opacity. Not green, not amber, not red.
**No glow.** No pulsing animation at completion.

---

## Over-target State

When current value exceeds target (e.g., protein at 105%):

```
Fill: clamps at 100% width (does not overflow track)
Fill color: rgba(232,227,216,0.90)   /* near full brightness */
```

No color change to STATUS-UP. Protein over target is not celebrated — it is data. The near-full brightness communicates "complete" without a color semantic.

---

## At-target State (Goal Pulse)

When protein target is precisely met (95–100%):

One brightness pulse:
```
Fill: brightness 100%→160%→100%
Duration: 120ms total (60ms up, 60ms down)
Easing: LINEAR both directions
```

One pulse. Not repeated. → `motion-system.md#goal-completion-pulse`.

---

## Mount Animation

On every render (app open, card mount):
```
Width: 0%→current value% — EASE-DATA, DATA (320ms)
Delay: 80ms after parent visible
```

This communicates "value just resolved" rather than "static data was loaded."

---

## Label Context

Progress bars do not render without adjacent label and value text. They are always part of a macro row:

```
PROTEIN  [progress bar]  89g of 140g
```

A standalone progress bar with no label context does not exist in this design.

---

## Usage Constraints

Progress bars appear in exactly three contexts:

1. **TODAY Zone (Zone 2A)** — Protein row only (default). All four macros on panel expand.
2. **EntryCard expanded** — All four macros.
3. **Inline protein tap sub-panel** — Only if a protein progress view is expanded.

**Never used for:**
- Calorie progress (calorie is a total, not a target to fill)
- Training volume progress
- Streak progress
- Onboarding progress (onboarding is not gamified)
- Any decorative purpose

---

## Accessibility Note

The progress bar is supplementary to the numeric value. Screen readers should read the `89g of 140g` value — the bar is `aria-hidden`. The numeric text carries the meaning; the bar is a visual redundancy that aids quick scanning.
