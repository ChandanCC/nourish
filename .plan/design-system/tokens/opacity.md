# Opacity Tokens

**Status:** Active — v1.0
**Last updated:** 2026-05-07

→ See: `design-system/tokens/colors.md#ink-family` for INK opacity system.
→ See: `product/core-principles.md` principle: "Opacity is the first tool, color is the last."

---

## Governing Rule

Before introducing a new color or a new visual treatment, reduce opacity.

If something needs to recede, lower its opacity level on the INK scale. If the INK scale doesn't cover the need, something is probably wrong with the design decision rather than the opacity system.

---

## INK Opacity Hierarchy

| Token | Opacity | Role |
|---|---|---|
| `INK-0` | 100% | Maximum prominence. STATE text, primary data values, active UI elements. |
| `INK-1` | 72% | Secondary prominence. Body text, AI instruction lines, sub-values. |
| `INK-2` | 42% | Tertiary. Labels (always UPPERCASE). Reference data. |
| `INK-3` | 22% | Minimum readable. Timestamps, metadata, delta text, subtle annotations. |
| `INK-4` | 9% | Structural only. Borders, ghost tints, hairlines. Not readable as text. |

**Rule:** These are the only five opacity levels for text and iconography. Do not interpolate between them.

---

## GOLD Opacity Hierarchy

| Token | Opacity | Role |
|---|---|---|
| `GOLD` | 100% | Wordmark only |
| `GOLD-1` | 30% | Active borders, tinted interactive states |
| `GOLD-2` | 12% | Subtle surface tint, waveform surplus bars at partial intensity |
| `GOLD-3` | 6% | Ghost tint — barely perceptible |

Command bar focused border-top uses `rgba(237,184,74,0.25)` — between GOLD-1 and GOLD-3, defined explicitly in the command bar spec.

---

## STATUS Opacity

Status colors (`STATUS-UP`, `STATUS-MID`, `STATUS-DOWN`) are always used at full opacity. They are signals, not tints.

The only exception: a STATUS color used as a background tint (e.g., a positive trend indicator background) uses the full-opacity STATUS color at reduced opacity:
```
STATUS-UP tint: rgba(62,207,162,0.10)
STATUS-MID tint: rgba(232,166,64,0.10)
STATUS-DOWN tint: rgba(232,84,84,0.10)
```
These tints are not in active use in v1.0. They are pre-reserved to avoid ad hoc values later.

---

## Waveform Opacity

Waveform bars are opacity-driven, not color-driven:

| State | Value |
|---|---|
| Today's bar | `rgba(232,227,216,0.88)` — near full |
| Surplus bar | `rgba(237,184,74,0.60)` — gold at 60% |
| Deficit bar | `rgba(232,227,216,0.22)` — INK-3 level |
| Unselected bar (day select mode) | `rgba(232,227,216,0.40)` — dim |
| Baseline axis | `rgba(232,227,216,0.12)` |

---

## UI State Opacity

| State | Treatment |
|---|---|
| Disabled | `opacity: 0.35` on the element |
| Focused input placeholder | INK-3 (22%) |
| Active input text | INK-0 (100%) |
| Hover on interactive row | Element brightens slightly; no scale transform |
| Pressed state | `opacity: 0.75` momentarily during press (`INSTANT: 80ms`) |

---

## Scrim (Behind Command Bar on Focus)

When the command bar is focused, the content behind receives a scrim:
```
background: rgba(8,8,13,0.60)   /* BG-0 at 60% */
pointer-events: none
position: fixed
inset: 0
bottom: 56px   /* above command bar */
```

The scrim is not pure black — it matches BG-0 (`#08080D`) at 60%, so the tint reads as part of the same color family as the interface.

---

## What Opacity Never Does

- Fade out entire sections to indicate "loading" (use absent state, not faded state)
- Mix opacity levels within a single text element
- Apply opacity to already-colored elements (STATUS colors, GOLD) as a generic dimming tool
- Use `0.5` or `0.65` or other off-system values for INK text
