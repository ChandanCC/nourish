# Home Screen Architecture

**Status:** Active — v1.0
**Last updated:** 2026-05-07

→ See: `signal-system.md` for SIGNAL zone content.
→ See: `component-specs/command-bar.md` for bottom bar spec.
→ See: `component-specs/entry-card.md` for entry list spec.

---

## Governing Principle

> The screen orients in under 2 seconds, then gets out of the way.

Every element answers exactly one of three questions:
1. **Where am I?** → SIGNAL zone
2. **What do I need to do today?** → TODAY zone
3. **What have I done?** → LOG zone

If an element doesn't answer one of these questions, it doesn't belong on the home screen.

---

## Zone Architecture

```
┌─────────────────────────────────────────┐
│  ZONE 1: SIGNAL HERO                    │  48% viewport height on load
│  Fixed while visible, collapses         │  Collapses to strip on scroll
│  on scroll to compact strip             │
├─────────────────────────────────────────┤
│                                         │
│  ZONE 2: TODAY                          │  First section in scroll
│  Contextual, primary operational        │  Always shows current day by default
│  data for the selected day              │  Updates when waveform bar tapped
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ZONE 3: LOG                            │  Second section in scroll
│  Entry list + history                   │  Reverse chronological entries
│                                         │  + compact history rows
│                                         │
├─────────────────────────────────────────┤
│  ZONE 4: COMMAND BAR                    │  Fixed to bottom always
│  Always visible, never hidden           │  Primary action surface
└─────────────────────────────────────────┘
```

---

## Zone 1 — SIGNAL Hero

**Behavior:** Occupies top 48% on load. Collapses to a 1-line sticky strip when scrolling begins.

**Full state:**
```
NOURIQ                              [avatar]
──────────────────────────────────────────

OPTIMISING
Day 4 of this state  ·  Pattern: consistent

[7-day waveform]
Mon  Tue  Wed  Thu  Fri  Sat  Sun

−14% below your baseline
```

**Collapsed strip (sticky, appears on scroll):**
```
OPTIMISING  ·  −14% below baseline          ↓
```
12px DM Mono, INK-1 for STATE, INK-3 for delta. Hairline separator below. `↓` taps scroll to top.

**Spacing in full state:**
- 28px top padding
- 24px horizontal (same as page gutter, exception: waveform spans full container)
- 20px between STATE and waveform
- 20px between waveform and Delta
- STATE → subtitle: 8px

**What the SIGNAL zone never contains:**
- Progress bars
- Buttons
- Macro values
- Calorie counts
- Navigation elements beyond the avatar

---

## Zone 2 — TODAY

**Three sub-sections, separated by hairline rules:**

### 2A — Daily Position

```
TODAY  ·  Wednesday                   1,240 kcal

Protein  ───────────────░░░░░░  89g of 140g

→ Add protein before dinner to hold your signal.
```

Rules:
- Only ONE progress bar (protein — the binding constraint for gym users).
- Tap on `1,240 kcal` → inline macro panel expands below with all four macros.
- Tap on protein bar → inline micro panel expands.
- AI instruction line: 10px DM Mono, INK-3. Present only when actionable. Absent when protein target met.
- Calorie count is secondary information to `TODAY` — not the hero number.

### 2B — Training

When not logged:
```
TRAINING  ·  Not logged

→ Log your session to complete today's signal.
```
`→ Log` is tappable — focuses command bar.

When logged:
```
TRAINING  ·  Push  ·  52 min  ·  6 exercises

Volume 14,200 kg  ·  Progressive on 3 lifts
```
Two lines maximum. No progress bar. Detail in dedicated workout view.

### 2C — Micros Summary

Visible only when any micros logged:
```
MICROS  ·  Iron 82%  ·  VitD 44%  ·  Calcium 31%
```
Three most notable (two deficient + one good). Tappable → inline micro grid.
Absent entirely when no micros tracked.

---

## Zone 3 — LOG

### Entry List

```
──────────────────────────────────────
LOGGED TODAY                3 entries
```
No button. No "add" link here. Logging is via the command bar.

Entries: `EntryCard` (redesigned). → See: `component-specs/entry-card.md`.

### History

```
──────────────────────────────────────
EARLIER THIS WEEK
```

Compact summary rows, not full cards:
```
Tue  May 6      OPTIMISING    1,820 kcal   Protein 94%
Mon  May 5      OPTIMISING    1,650 kcal   Protein 88%
Sun  May 4      DRIFTING      2,140 kcal   Protein 61%
```

- 3 rows visible by default.
- `view N more days` text link (10px, INK-3) reveals rest.
- Each row is tappable → updates waveform selection + TODAY zone.
- STATE text in history rows: 9px, uses actual state label.

**The screen ends after history.** No recommendations. No content. No social feed. Hard stop.

---

## Zone 4 — Command Bar

```
┌─────────────────────────────────────────┐
│  What did you eat?...             [ +W ] │
└─────────────────────────────────────────┘
```

- Full-width text input. Tap → keyboard appears, screen dims behind (non-modal scrim).
- `+W` or workout glyph → slide-up workout logging sheet.
- Height: 56px total. 20px horizontal padding. 13px DM Mono input text.
- `border-top: 1px solid INK-4`
- Focused: `border-top-color: rgba(237,184,74,0.25)`
- Gradient fade above bar: 40px height, BG-0 to transparent, pointer-events none.

→ Full spec: `component-specs/command-bar.md`

---

## Scroll Behavior

| Element | Behavior |
|---|---|
| SIGNAL full hero | Visible on load. Collapses as user scrolls. |
| SIGNAL compact strip | Fixed to top after scroll begins. Always visible. |
| TODAY zone | Scrolls |
| Entry list | Scrolls |
| History rows | Scrolls |
| Command bar | Fixed to bottom. Never scrolls. Never hidden. |

---

## Day Navigation

There is no date picker. There is no calendar. There are no navigation tabs for history.

**The waveform is the day navigation.**
Tap any bar → TODAY zone and entry list update to that day.
Today is the default. Selected day highlighted in waveform.
The compact strip updates: `OPTIMISING  ·  Tue May 6  ·  ↓`

---

## What Never Appears on the Home Screen

- Streak counters or consecutive day indicators
- Achievement badges or milestone markers
- Multiple competing primary CTAs
- Colorful data widgets
- Full micronutrient grid (expandable only)
- Social features or comparisons
- Article recommendations or content cards
- Bottom navigation tab bar
- Notification-style alerts inline in content
- Empty state illustrations
- Body weight as a featured metric
- Calorie remaining as a hero number
