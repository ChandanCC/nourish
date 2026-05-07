# Component: SIGNAL Hero

**Status:** Active — v1.0
**Last updated:** 2026-05-07

→ See: `product/signal-system.md` for SIGNAL semantics (STATE definitions, DELTA formula).
→ See: `design-system/components/waveform.md` for waveform visual spec.
→ See: `design-system/motion-system.md#signal-hero-collapse-on-scroll` for collapse animation.

---

## Purpose

The SIGNAL hero answers: **"Where am I in my pattern right now?"**

It is the first thing visible on app open. Everything else on the home screen is subordinate to it.

---

## Two States

The SIGNAL hero exists in exactly two visual states:

1. **Full** — occupies top 48% of viewport on load
2. **Collapsed** — 1-line sticky strip, appears after scroll begins

---

## Full State Layout

```
┌─────────────────────────────────────────────────┐
│  NOURIQ                              [avatar]   │  ← 28px top pad, 24px horizontal
│                                                 │
│                                                 │  ← 24px gap
│  OPTIMISING                                     │  ← DISPLAY (32px Syne 800, INK-0)
│  Day 4 of this state  ·  Pattern: consistent   │  ← MICRO (8px DM Mono, INK-3)
│                                                 │
│                                                 │  ← 20px gap
│  ▂▃▄▁▃▅█                                       │  ← Waveform (full-bleed)
│  Mon  Tue  Wed  Thu  Fri  Sat  Sun             │  ← LABEL (9px, INK-3, full-bleed)
│                                                 │
│                                                 │  ← 20px gap
│  −14% below your baseline                      │  ← BODY (13px DM Mono 400, INK-1)
└─────────────────────────────────────────────────┘
```

### Wordmark + Avatar Row

```
NOURIQ — 11px DM Mono 500, letter-spacing 0.15em, INK-0
[avatar] — 28px circle, right-aligned
           Shows Google profile picture if available
           Falls back to initials on INK-3 circular background
           Tap → settings/logout (not a nav hub)
```

### STATE Text

```
font: DISPLAY — 32px Syne 800
color: INK-0 (100%)
text-transform: uppercase
letter-spacing: -0.02em
line-height: 36px
margin-bottom: 8px (to subtitle)
```

No background. No colored border. No badge. Just text.

### STATE Subtitle

```
"Day N of this state  ·  Pattern: consistent"
font: MICRO — 8px DM Mono 400
color: INK-3 (22%)
```

The dot separator `·` is `U+00B7` (middle dot), not a hyphen or bullet.

Pattern qualifiers: `consistent` / `building` / `irregular`

### Waveform

Full-bleed (breaks page gutter on both sides). → Full spec: `design-system/components/waveform.md`

Day labels (`Mon  Tue  Wed  Thu  Fri  Sat  Sun`) sit below bars:
```
font: LABEL — 9px DM Mono 400
color: INK-3 (22%)
text-transform: uppercase
text-align: center within bar column
margin-top: 6px
```

Today's label is INK-1 (72%). All others INK-3.

### Delta Line

```
"−14% below your baseline" or "+8% above your baseline"
font: BODY — 13px DM Mono 400
color: INK-1 (72%)
margin-top: 20px from waveform bottom
```

**Never color-coded.** Negative delta is not bad; positive is not good. It depends on the user's goal.

---

## Collapsed Strip State

Appears sticky at the top of the viewport when the user scrolls below the hero.

```
┌─────────────────────────────────────────────────┐
│  OPTIMISING  ·  −14% below baseline         ↓  │
└─────────────────────────────────────────────────┘
  ──────────────────────────────────────────────── ← 1px INK-4 hairline below
```

```
height: 44px
background: #0F0F18   /* BG-1 — slightly elevated to read as floating */
padding: 0 20px
display: flex
align-items: center
justify-content: space-between

STATE text: 12px DM Mono 500, INK-1, uppercase
separator ·: INK-3
Delta text: 12px DM Mono 400, INK-3
↓ icon: 10px, INK-3, tap scrolls to top
```

When viewing a past day (waveform tap):
```
OPTIMISING  ·  Tue May 6  ·  ↓
```

The strip updates to show the selected day's state and date, not today's live data.

---

## What Never Appears in the SIGNAL Hero

- Progress bars
- Calorie counts or macro values
- Buttons or primary CTAs
- Navigation elements (beyond avatar)
- Color-coded STATE text
- Numeric score (0–100 or percentage)
- Streak indicators
- Notification badges
- Illustrations or imagery

---

## Transition Contract

### From full → collapsed

Triggered by scroll. Not a tap. The hero compresses physically as the user scrolls.

```
Easing: EASE-DEPART (cubic-bezier(0.5, 0, 0.84, 0))
Duration: 200ms
Properties:
  - hero zone height collapses
  - waveform fades out: opacity 1→0, LINEAR, 150ms
  - compact strip fades in: opacity 0→1, LINEAR, 150ms
```

### STATE transition (when state changes)

```
 80ms  Current STATE text: opacity 1→0, LINEAR, QUICK
160ms  New STATE text: opacity 0→1, LINEAR, QUICK
240ms  Confirmation line: opacity 0→0.25, LINEAR, 100ms → holds 3s → fades
```

No color change. No scale. No screen shake. A crossfade and a quiet confirmation.

---

## App Open Sequence (SIGNAL hero role)

```
  0ms   Background renders (#08080D)
 80ms   Wordmark fades in — LINEAR, QUICK (150ms)
160ms   STATE text fades in — LINEAR, QUICK (150ms)
230ms   STATE subtitle fades in — LINEAR, QUICK (150ms)
300ms   Waveform bars begin rising (staggered 25ms each)
520ms   Delta number counts 0→value
640ms   TODAY zone fades in
700ms   Command bar activates
```

Full sequence: 700ms. → Full spec in `design-system/motion-system.md#app-open-sequence`.
