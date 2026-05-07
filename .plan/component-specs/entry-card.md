# Component: EntryCard

**Status:** Active — v1.0
**Last updated:** 2026-05-07

→ See: `home-screen.md#zone-3-log` for placement context.
→ See: `motion-system.md#new-entry-logged` for entry animation.
→ See: `design-tokens/colors.md#prohibited-patterns` for old macro colors that must not appear.

---

## Purpose

EntryCard represents one logged food entry. It must communicate:
1. What was eaten (name, time)
2. Total calories
3. Macro breakdown — in a way that is scannable, not read

It must do this without color-coded macro values.

---

## Card Structure — Collapsed (Default)

```
┌──────────────────────────────────────────────────┐
│                                                  │  ← 16px padding all sides
│  Chicken breast + rice bowl         340 kcal    │  ← Name (BODY, INK-0) + kcal (DATA, INK-0)
│  12:34                                           │  ← Timestamp (MICRO, INK-3)
│                                                  │
│  P 42g  ·  C 28g  ·  F 8g          ▼            │  ← Macro row (LABEL, INK-2) + expand icon
│                                                  │
└──────────────────────────────────────────────────┘
```

### Name + Calories Row

```
Name:      BODY — 13px DM Mono 400, INK-0 (100%)
           Truncates at ~60% of card width with ellipsis if too long
Calories:  DATA — 16px DM Mono 500, INK-0 (100%)
           Right-aligned
           Never shows "kcal" inline — just the number (kcal shown in MICRO below if needed)
```

### Timestamp

```
"12:34"
Font: MICRO — 8px DM Mono 400
Color: INK-3 (22%)
Position: below name, left-aligned
```

### Macro Summary Row

```
"P 42g  ·  C 28g  ·  F 8g"
Font: LABEL — 9px DM Mono 400
Color: INK-2 (42%)
Case: "P", "C", "F" are uppercase labels — the values (42g) are not uppercased
Separator: ·  (U+00B7 middle dot)

▼ expand icon: right-aligned, INK-3
              tap anywhere on card to expand (not just icon)
              rotates 180° on expand — QUICK (150ms)
```

**There is no color coding on macros.** Not green for protein. Not orange for carbs. Not pink for fat. These violate the monochromatic system. → `decisions/006-monochromatic-palette.md`

Macro values are INK-2 because they are secondary to the calorie value. They are reference data, not primary data.

---

## Card Structure — Expanded

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  Chicken breast + rice bowl         340 kcal    │
│  12:34                                           │
│                                                  │
│  P 42g  ·  C 28g  ·  F 8g          ▲            │
│ ─────────────────────────────────────────────── │  ← 1px INK-4 separator
│                                                  │
│  PROTEIN         42g    ██████████░░░░   30%    │
│  CARBS           28g    ███████░░░░░░░   20%    │
│  FAT              8g    ██░░░░░░░░░░░░    6%    │
│  FIBER            3g    █░░░░░░░░░░░░░    2%    │
│                                                  │
│  → Good protein source for your target.         │  ← AI note (BODY, INK-1) — optional
│                                                  │
│  [Delete entry]                                  │  ← LABEL, INK-3, left-aligned
└──────────────────────────────────────────────────┘
```

### Expanded Macro Rows

Each macro row:
```
Label:   LABEL — 9px DM Mono 400, INK-2, uppercase, left col (60px fixed width)
Value:   DATA — 16px DM Mono 500, INK-0, second col (fixed width, right-aligned)
Bar:     Progress bar — width proportional to % of daily target
         Color: INK-0 at varying opacity (fill: 60%, track: 9%)
         No color coding — all bars use the same INK treatment
Percent: MICRO — 8px DM Mono, INK-3, right-aligned
```

The percentage shown is **% of daily target consumed by this entry**, not % of macros within this entry. That's more actionable.

### AI Note (Optional)

Present only when the AI generated a note about this specific entry. Not always present.

```
"→ Good protein source for your target."
Font: BODY — 13px DM Mono 400
Color: INK-1 (72%)
Prefix: → (directional arrow, not a bullet)
Max: 1 line. No multi-line AI notes on entries.
```

If no note: this row is absent. No empty space placeholder.

### Delete Entry

```
"Delete entry"
Font: LABEL — 9px DM Mono 400
Color: INK-3 (22%)
Position: bottom-left of expanded card
Tap: immediate delete with slide-up removal (EASE-DEPART, 200ms, opacity 1→0)
No confirmation dialog. Deletion is immediate.
```

The delete action is deliberately low-prominence. Accidental deletion is unlikely since the user has to expand the card first.

---

## Surface

```
background: #0F0F18   (BG-1 / CARD level)
border: 1px solid rgba(232,227,216,0.09)   (INK-4)
border-radius: 12px
padding: 16px
```

No box-shadow. No hover scale. No color-coded left border.

---

## Expand / Collapse Animation

```
Expand:
  Height: 0→auto — EASE-ARRIVE, STANDARD (220ms)
  Separator: width 0→100%, EASE-ARRIVE, 100ms
  Content: opacity 0→1, LINEAR, 150ms (80ms after height begins)

Collapse:
  Content: opacity 1→0, LINEAR, 100ms
  Height: auto→0 — EASE-DEPART, STANDARD (200ms, 80ms after fade)
  ▼ icon rotates back: 150ms
```

---

## Entry Arrival Animation (New Log)

When a new entry is logged:
```
 100ms  Card slides up from command bar area
        translateY(20px)→0, opacity 0→1 — EASE-ARRIVE, 220ms
 140ms  Calorie value counts 0→value — EASE-DATA, 340ms
 200ms  Protein value counts — EASE-DATA, 280ms
 240ms  Carbs counts — 40ms after protein
 280ms  Fat counts — 40ms after carbs
```

---

## What EntryCard Never Contains

- Color-coded macro values or bars (no green protein, orange carbs, pink fat)
- Stars, ratings, or quality scores
- "Healthy" / "unhealthy" classifications
- Social sharing elements
- Images of food
- Multi-line AI commentary
- Edit in-place (editing an entry requires delete + re-log)
