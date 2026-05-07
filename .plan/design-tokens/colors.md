# Color Tokens

**Status:** Active — v1.0
**Last updated:** 2026-05-07

→ See: `decisions/006-monochromatic-palette.md` for why the palette is this limited.

---

## Palette Summary

One background family. One ink family. One brand accent. Three status signals.
That is the entire palette. No exceptions.

---

## Background Family

| Token | Value | Role |
|---|---|---|
| `BG-0` | `#08080D` | Page background |
| `BG-1` | `#0F0F18` | Raised surface (cards) |
| `BG-2` | `#151520` | Elevated surface (sheets, expanded states) |
| `BG-3` | `#1B1B27` | Top surface (command bar, focused inputs) |

**Why not pure black:**
`#000000` reads as "app." The blue-violet tint in `#08080D` reads as "instrument." This tint creates a cool-vs-warm temperature contrast with the warm ink family — richness without color. The difference is subtle to name and immediately perceptible in use.

**Elevation rule:** Each step is ~7 lightness points in HSL. Perceptible but not dramatic. Elevation is implied, not announced.

---

## Ink Family

All text and iconography uses a single warm off-white at varying opacities.

| Token | Value | Role |
|---|---|---|
| `INK-0` | `#E8E3D8` at 100% | STATE text, primary data values, active UI |
| `INK-1` | `rgba(232,227,216,0.72)` | Secondary body text, AI instruction lines |
| `INK-2` | `rgba(232,227,216,0.42)` | Labels, metadata — always UPPERCASE |
| `INK-3` | `rgba(232,227,216,0.22)` | Timestamps, structural text, dim context |
| `INK-4` | `rgba(232,227,216,0.09)` | Borders, ghost tints |

**Why warm off-white, not `#FFFFFF`:**
Pure white on near-black reads as stark. `#E8E3D8` has a deliberate warmth — slightly cream, slightly warm. Placed against `#08080D`, it reads as linen against espresso. WHOOP, Oura, and Raycast all use warm white for this reason.

**Opacity discipline:**
Before changing a color, reduce opacity. If an element needs to be less prominent, lower its INK opacity level — do not introduce a new color.

---

## Brand Accent — Gold

| Token | Value | Role |
|---|---|---|
| `GOLD` | `#EDB84A` | Brand, wordmark, STATE (hover/focus) |
| `GOLD-1` | `rgba(237,184,74,0.30)` | Tinted states, active borders |
| `GOLD-2` | `rgba(237,184,74,0.12)` | Subtle surface tint, waveform surplus bars |
| `GOLD-3` | `rgba(237,184,74,0.06)` | Barely visible ghost tint |

**Why this specific gold:**
`#EDB84A` sits precisely between amber and gold — deeper and less yellow than the previous `#ffc864`. This shift matters: bright yellow reads as caution, orange reads as sports energy. `#EDB84A` reads as material value — the gold on a Leica camera, a precision watch bezel.

**Gold appears in exactly three places:**
1. The Nouriq wordmark
2. The command bar border-top on focus: `rgba(237,184,74,0.25)`
3. Waveform bars on surplus days: `rgba(237,184,74,0.60)`

Nowhere else. Scarcity creates signal value.

---

## Status System

| Token | Value | When to use |
|---|---|---|
| `STATUS-UP` | `#3ECFA2` | Metric at or above target |
| `STATUS-MID` | `#E8A640` | Metric approaching limit or target |
| `STATUS-DOWN` | `#E85454` | Metric over limit or critically deficient |
| `STATUS-NULL` | `INK-3` | No data / untracked |

**These appear only on data with a genuine status relative to a health/nutritional target.**
Not for decoration. Not for visual variety. Not on section headers, backgrounds, or UI chrome.

**Why these specific values:**
- `#3ECFA2`: Teal-green. Clinical rather than gaming. Coexists with warm background.
- `#E8A640`: True amber. References instrument caution states. Not orange (sports).
- `#E85454`: Coral-red. Communicates "attention" without aggression.

---

## Waveform Colors

| Token | Value | Role |
|---|---|---|
| `WAVE-SURPLUS` | `rgba(237,184,74,0.60)` | Bars above baseline (surplus days) |
| `WAVE-DEFICIT` | `rgba(232,227,216,0.22)` | Bars below baseline (deficit days) |
| `WAVE-TODAY` | `rgba(232,227,216,0.88)` | Today's bar (maximum brightness) |
| `WAVE-BASELINE` | `rgba(232,227,216,0.12)` | The zero axis line |

**Why surplus is gold, deficit is white:**
Surplus and deficit are not inherently good or bad — they depend on the user's declared goal. Coding deficit red would be semantically wrong for users in a bulk phase. Instead: surplus = gold (brand signal, presence of fuel), deficit = dim white (data without judgment), today = brightest (most current).

---

## Prohibited Patterns

These specific values must not appear in the UI:

| Prohibited | Previous use | Replacement |
|---|---|---|
| `#4ecdc4` | Protein color in old EntryCard | `INK-0` at 80% |
| `#ffa552` | Carbs color in old EntryCard | `INK-0` at 80% |
| `#ff6b9d` | Fat color in old EntryCard | `INK-0` at 80% |
| `#a78bfa` | Fiber color in old EntryCard | `INK-0` at 80% |
| `#ffc864` | Previous gold | `GOLD (#EDB84A)` |

→ See: `decisions/006-monochromatic-palette.md`
