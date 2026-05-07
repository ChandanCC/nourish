# Typography Tokens

**Status:** Active — v1.0
**Last updated:** 2026-05-07

→ See: `decisions/004-two-fonts.md` for why exactly two typefaces.
→ See: `design-system/visual-language.md#typographic-hierarchy-does-the-heavy-lifting` for governing principle.

---

## Typefaces

### Syne — Display & Headers

Used exclusively for STATE text and rare section headers. Syne is a geometric grotesque with a slightly technical, high-contrast character. It reads as designed-for-impact rather than designed-for-reading.

**Only weights used:**
- `800` (ExtraBold) — STATE text
- `700` (Bold) — Section headers (TITLE scale only)

**Never use:** Syne at body sizes. Syne for labels, metadata, or UI chrome. Syne in italics. Any Syne weight below 700.

### DM Mono — Data & Body

Everything that is not STATE or TITLE uses DM Mono. A monospaced font chosen for three reasons:
1. Numbers align in columns naturally (data-critical)
2. Monospace signals precision instrument, not consumer app
3. Letter-spacing is inherently generous — no manual tracking needed at label sizes

**Weights used:**
- `500` (Medium) — DATA scale, primary values
- `400` (Regular) — BODY, LABEL, MICRO

---

## Type Scale

```
Scale     Size   Font        Weight  Leading  Use
───────────────────────────────────────────────────────
DISPLAY   32px   Syne        800     36px     STATE text only
TITLE     18px   Syne        700     24px     Section headers (very rare)
DATA      16px   DM Mono     500     22px     Primary values, calorie count
BODY      13px   DM Mono     400     19px     Descriptions, AI text, entry names
LABEL      9px   DM Mono     400     12px     All labels (UPPERCASE + letter-spacing)
MICRO      8px   DM Mono     400     11px     Timestamps, metadata, fine print
```

Six sizes. No exceptions. If something doesn't fit these six, the design is wrong.

---

## Scale Detail

### DISPLAY — 32px Syne 800

```
font-size: 32px
font-family: Syne, sans-serif
font-weight: 800
line-height: 36px
letter-spacing: -0.02em
color: INK-0 (100% opacity)
text-transform: uppercase
```

Used for: STATE text (`OPTIMISING`, `BUILDING`, `DRIFTING`, etc.)
Used nowhere else.

### TITLE — 18px Syne 700

```
font-size: 18px
font-family: Syne, sans-serif
font-weight: 700
line-height: 24px
letter-spacing: 0
color: INK-0 (100% opacity)
```

Used for: Section headers where a strong typographic anchor is needed.
Extremely rare. The home screen may have zero TITLE elements.

### DATA — 16px DM Mono 500

```
font-size: 16px
font-family: DM Mono, monospace
font-weight: 500
line-height: 22px
letter-spacing: -0.01em
color: INK-0 (100% opacity)
```

Used for: Calorie counts, macro gram values, training volume, any number that is a primary value the user reads and acts on.

### BODY — 13px DM Mono 400

```
font-size: 13px
font-family: DM Mono, monospace
font-weight: 400
line-height: 19px
letter-spacing: 0
color: INK-1 (72% opacity) for AI text / secondary content
color: INK-0 (100% opacity) for food names in EntryCards
```

Used for: Food entry names, AI instruction lines, training descriptions, any prose that is read rather than scanned.

### LABEL — 9px DM Mono 400

```
font-size: 9px
font-family: DM Mono, monospace
font-weight: 400
line-height: 12px
letter-spacing: 0.08em
color: INK-2 (42% opacity)
text-transform: uppercase
```

**All labels are uppercase, always.** The lettercase + tracking is the signal that this text is a label, not data.

Used for: `TODAY`, `TRAINING`, `LOGGED TODAY`, `PROTEIN`, `MICROS`, section tags, unit labels (`g`, `kcal` when abbreviated as labels vs. reading as values), date labels.

### MICRO — 8px DM Mono 400

```
font-size: 8px
font-family: DM Mono, monospace
font-weight: 400
line-height: 11px
letter-spacing: 0.04em
color: INK-3 (22% opacity)
```

Used for: Timestamps, `logged at 12:34`, `Day 4 of this state`, delta description (`−14% below your baseline`), source attribution.

---

## Numeric Display Rules

Numbers are the hero of this interface. Rules that apply specifically to number rendering:

**Tabular numbers:** All DM Mono numbers render with `font-variant-numeric: tabular-nums`. This ensures columns align — critical in history rows.

**Calorie formatting:** Never comma-separated below 10,000. `1820` not `1,820`. Commas interrupt reading speed for a number this size.

**Macro formatting:** `89g` — value and unit concatenated, no space. Unit at LABEL scale when space-constrained.

**Delta sign:** Always show sign: `−14%` or `+8%`. Never `14%` without a sign. The minus sign is `−` (U+2212), not `-` (hyphen).

**Percentage values:** `82%` — no decimal. Round to integer. The precision is false.

---

## What Never Appears

| Prohibited | Reason |
|---|---|
| italic text | No italic in this typeface for this purpose |
| bold DM Mono | Bold Mono reads as shouting; use DATA scale (500 weight) instead |
| mixed case labels | Labels are always uppercase |
| Syne at sizes below 16px | Syne is not readable as small text |
| custom font sizes not in the scale | Six sizes only |
| `font-weight: 600` | Not in use |
| serif typefaces | Outside reference point |
