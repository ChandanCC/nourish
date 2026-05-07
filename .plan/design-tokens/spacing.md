# Spacing Tokens

**Status:** Active — v1.0
**Last updated:** 2026-05-07

---

## Base Unit

**4px.** Every spacing value is a multiple of 4.

No exceptions. If you need 5px of breathing room, you need 4px or 8px.

---

## Scale

```
Token    Value    Use
─────────────────────────────────────────────────────────────────
SP-1      4px     Inline gap between icon and text; tight pairs
SP-2      8px     Within-element spacing (label to value gap)
SP-3     12px     Between elements within a card
SP-4     16px     Standard component internal padding
SP-5     20px     Page gutter; command bar horizontal padding
SP-6     24px     Section-to-section gap; card padding
SP-7     28px     SIGNAL hero top padding
SP-8     32px     Large section separation
SP-10    40px     Zone separation (between major home screen zones)
SP-12    48px     Rarely used; structural gap only
```

---

## The Page Gutter — 20px

The page gutter is **20px**. It never breaks. Every element respects it.

**Exceptions (intentional and named):**
1. **Waveform** — spans full container width including gutters. The waveform is a full-bleed visualization; gutters would look wrong.
2. **Hairline separators** — span full width. Hairlines that respect gutters look truncated.

No other exceptions.

---

## Key Spacing Contracts

### SIGNAL Hero (full state)
```
Top padding:              28px (SP-7)
Horizontal padding:       24px (SP-6) — but waveform breaks to edges
STATE → subtitle gap:      8px (SP-2)
Subtitle → waveform gap:  20px (SP-5)
Waveform → Delta gap:     20px (SP-5)
```

### Card Internal Spacing
```
Card padding:             16px all sides (SP-4)
Label → value gap:         8px (SP-2)
Between rows within card: 12px (SP-3)
```

### Command Bar
```
Height:                   56px total
Horizontal padding:       20px (SP-5)
Vertical padding:         implied by height and input size
```

### Entry List
```
Gap between EntryCards:    8px (SP-2)
Section header margin-bottom: 12px (SP-3)
Section gap (LOGGED TODAY → card 1): 12px (SP-3)
Gap before EARLIER THIS WEEK: 24px (SP-6)
```

### TODAY Zone
```
Zone top padding:         24px (SP-6)
Between sub-sections (2A/2B/2C): separated by hairlines + 20px (SP-5) above/below each hairline
```

### History Rows
```
Row height:               40px (implied — not a token, a structural constant)
Horizontal padding:       20px (page gutter)
```

---

## Hairline Rules

Hairlines (`border-bottom: 1px solid INK-4`) appear between sections. Spacing around hairlines:

```
Content above hairline → hairline:  20px (SP-5)
Hairline → content below:           20px (SP-5)
```

---

## Touch Targets

Minimum tap target: **44px × 44px**. Visual element can be smaller; the hit area expands with padding to meet minimum.

Applies to: Day pills in waveform, history rows, expand/collapse handles, command bar action icon.

---

## What Spacing Never Does

- Non-multiples of 4 (`5px`, `6px`, `7px`, `10px`, `15px`)
- Margin auto for centering content within data zones (use flexbox)
- Negative margins
- Pixel-nudges for "optical" alignment (trust the grid)
