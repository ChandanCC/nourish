# Surface Tokens

**Status:** Active — v1.0
**Last updated:** 2026-05-07

→ See: `design-system/tokens/colors.md#background-family` for background color values.

---

## Surface Stack

Four distinct elevation levels. Each level has a fixed background color, border, and radius. These are not suggestions — they are contracts.

```
Level   Token   Background   Border              Radius   Used for
─────────────────────────────────────────────────────────────────────────
0       PAGE    #08080D      none                none     App background
1       CARD    #0F0F18      1px INK-4           12px     Entry cards, info cards
2       SHEET   #151520      1px INK-3           12px     Expanded states, slide-up sheets, inputs
3       OVERLAY #1B1B27      1px INK-4 border-top  none   Command bar
```

---

## Level Detail

### PAGE — #08080D

The canvas. No border, no radius. Everything renders on top of this.

The blue-violet tint (`#08080D`) is what makes the warm ink family read as warm. Against pure `#000000` the contrast would be flat. Against this specific near-black the cream text has temperature.

**Never place elements directly on PAGE that belong on CARD.** Everything that groups content uses a CARD surface.

### CARD — #0F0F18

```
background: #0F0F18
border: 1px solid rgba(232,227,216,0.09)   /* INK-4 */
border-radius: 12px
```

Default surface for all cards: EntryCards, today's macro card, training card, micro card. The border is barely visible — 9% opacity — but it defines the boundary without announcing itself.

**No box-shadow.** Elevation is communicated by the background step alone.

### SHEET — #151520

```
background: #151520
border: 1px solid rgba(232,227,216,0.22)   /* INK-3 */
border-radius: 12px
```

Used for: expanded states within a card, the workout log sheet (slide-up from command bar), input fields. The slightly brighter border (INK-3 vs INK-4) signals that this surface is active or elevated — it has something to say.

**Input fields specifically:**
```
background: #151520
border: 1px solid rgba(232,227,216,0.22)   /* INK-3 */
border-radius: 10px   /* 2px tighter than cards */
```

### OVERLAY — #1B1B27 (Command Bar)

```
background: #1B1B27
border-top: 1px solid rgba(232,227,216,0.09)   /* INK-4 */
border-radius: none   /* full-width, flush to edges and bottom */
height: 56px
```

Focused state:
```
border-top: 1px solid rgba(237,184,74,0.25)   /* GOLD at 25% */
```

The border-top only — not all sides. The command bar is anchored to the bottom. The top border is the join with scrollable content above it.

---

## Border Philosophy

Borders serve one purpose: **defining spatial boundaries**.

They appear on surfaces that contain content. They do not appear as:
- Decorative accents
- Color-coded category indicators
- Section dividers between non-container elements
- Highlight/focus borders on non-interactive elements

**Interactive borders (inputs, focused states):**
When an input or container is focused, its border intensifies. Not a glow, not a shadow — a simple border-color step.

```
Default input:  1px solid INK-3
Focused input:  1px solid INK-1
```

Exception: Command bar focus uses GOLD instead (the one place GOLD appears as a UI signal).

---

## Hairline Separators

Used between sections within the same surface. Not a border — a structural line.

```
border-bottom: 1px solid rgba(232,227,216,0.09)   /* INK-4 */
width: 100%   /* full bleed — breaks page gutter */
```

Hairlines appear between:
- TODAY zone sub-sections (2A / 2B / 2C)
- LOG zone section headers (`LOGGED TODAY` / `EARLIER THIS WEEK`)
- Expanded card content and its parent

---

## Gradients

One gradient exists in the entire UI: the fade above the command bar.

```
position: fixed
bottom: 56px   /* sits directly above command bar */
height: 40px
background: linear-gradient(to bottom, transparent, #08080D)
pointer-events: none
width: 100%
```

Purpose: signal that content continues below and the command bar is floating, not part of the scroll.

No other gradients. No gradient backgrounds on cards, sections, or headers.

---

## Corner Radius Rules

```
Cards:          12px
Sheets/inputs:  12px (inputs: 10px)
Command bar:    0px
Bands/strips:   0px
Hairlines:      0px
Progress bars:  2px (the bar track and fill)
Waveform bars:  2px top corners only
```

Structural elements (full-width bands, the compact SIGNAL strip, command bar) have no radius. They are architectural, not contained.

---

## What Never Appears

| Prohibited | Reason |
|---|---|
| `box-shadow` | Instruments are self-illuminated; no light source |
| `drop-shadow` filter | Same reason |
| Glassmorphism (`backdrop-filter: blur`) | Decorative, not informational |
| Gradient card backgrounds | Consumer aesthetic |
| Colored card borders for category | Use INK-4 only; color belongs in typography |
| Multiple borders on one element | One border, one purpose |
| Rounded full-bleed surfaces | Full-bleed means no radius |
