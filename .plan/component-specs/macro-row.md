# Component: Macro Row

**Status:** Active — v1.0
**Last updated:** 2026-05-07

→ See: `home-screen.md#zone-2a-daily-position` for placement context.
→ See: `component-specs/progress-bar.md` for progress bar sub-component.

---

## Purpose

The macro row displays current vs. target for a single macronutrient. It is used within the TODAY zone (Zone 2A) and the expanded EntryCard.

**In the TODAY zone:** Only protein is shown by default (the binding constraint). Other macros are in a collapsed inline panel (tap on calorie count to reveal).

**In EntryCard expanded:** All four macros shown.

---

## Default Macro Row (TODAY Zone — Protein)

```
Protein  ─────────────────────░░░░░░  89g of 140g
→ Add protein before dinner to hold your signal.
```

### Row Layout

```
Label:       LABEL — 9px DM Mono 400, uppercase, INK-2
             Fixed 60px width, left column
             "PROTEIN" / "CARBS" / "FAT" / "FIBER"

Progress bar: flex-grow, center column
              → See: component-specs/progress-bar.md

Value:       "89g of 140g"
             "89g" — DATA — 16px DM Mono 500, INK-0
             " of " — MICRO — 8px DM Mono, INK-3
             "140g" — MICRO — 8px DM Mono, INK-3
             Right column, right-aligned
```

The "of 140g" target is always visible — the goal is the context that makes the current value meaningful.

### AI Instruction Line

```
"→ Add protein before dinner to hold your signal."
Font: BODY — 13px DM Mono 400
Color: INK-1 (72%) — slightly more visible than metadata
Prefix: → (not a bullet, not an emoji)
Position: below progress bar, 8px margin-top
```

**Present only when actionable.** If the user has met their protein target, this line is absent. Not replaced with a success message — just absent. → `core-principles.md` principle: "Absence is the reward."

---

## Expanded Macro Panel (Tap on Calorie Count)

When the user taps the calorie count in Zone 2A, an inline panel expands below:

```
TODAY  ·  Wednesday                   1,240 kcal ▼

PROTEIN  ──────────────░░░░  89g of 140g
CARBS    ──────────░░░░░░░░  142g of 200g
FAT      ────░░░░░░░░░░░░░░   28g of 55g
FIBER    ──░░░░░░░░░░░░░░░░    8g of 25g

────────────────────────────────────────
CALORIES           1,240 of 1,800 kcal
```

Separator before CALORIES line (hairline, INK-4). CALORIES row:
```
"CALORIES" — LABEL, INK-2
"1,240" — DATA, INK-0
"of 1,800 kcal" — MICRO, INK-3
```

**No progress bar for calories.** Calories is total context, not a single progress metric. Progress bar reserved for protein (the actionable constraint).

---

## Inline Protein Tap (Protein Bar → Detail)

Tapping the protein row expands an inline sub-panel:

```
PROTEIN  ──────────────░░░░  89g of 140g  ▼

  From today's entries:
  Chicken breast  ·  42g
  Eggs (×2)       ·  12g
  Protein shake   ·  35g
  ──────────────────────
  Total           ·  89g
  Remaining       ·  51g
```

This is the only place a per-entry breakdown appears in the TODAY zone. No navigation required.

Font for breakdown rows: MICRO — 8px DM Mono, INK-3 (values INK-1).

---

## History Row Macro Format

In the EARLIER THIS WEEK compact history rows, macros appear as a single summary:

```
Tue  May 6      OPTIMISING    1,820 kcal   Protein 94%
```

`Protein 94%` — percentage of daily target achieved. Not grams. This is the most decision-relevant summary for a past day.

Font: BODY — 13px DM Mono 400, INK-1. `94%` in INK-0 (slightly brighter to read as the value).

---

## What Macro Rows Never Do

- Color-code by macro type (no green protein, orange carbs, pink fat)
- Show grams without context (always show `of Xg` target)
- Show a "remaining" value in the default view (expansion only)
- Use icons to identify macros
- Show percentage instead of grams as the primary value
