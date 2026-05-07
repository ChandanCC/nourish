# Visual Language

**Status:** Active — v1.0
**Last updated:** 2026-05-07

Overview of Nouriq's complete visual system. All values defined in `design-tokens/`.

→ See individual token files for exact values.
→ See `core-principles.md#color-communicates-status-not-identity` for governing principle.

---

## The Reference Point

> The visual language of a precision instrument panel.

Not a consumer app. Not a social platform. Not a dashboard.

Bloomberg Terminal. Aircraft glass cockpit. Medical monitoring display. Linear issue board. WHOOP recovery screen.

These share: dark environment, high-contrast text, minimal chromatic noise, typographic hierarchy, information density without clutter. Every visual decision in Nouriq is calibrated against this reference.

---

## Five Visual Pillars

### 1. Dark, Not Black

Background is `#08080D` — a very slightly blue-violet-tinted near-black. Not pure `#000000`.

Pure black reads as "app." The specific tint reads as "instrument." The difference is subtle to describe and immediately perceptible in use. → `design-tokens/surfaces.md`

### 2. Warm, Not White

Primary text is `#E8E3D8` — warm off-white, slightly cream. Not `#FFFFFF`.

The temperature contrast (cool-tinted dark bg, warm text) creates richness without color. The eye relaxes. → `design-tokens/colors.md#ink-family`

### 3. Monochromatic With Selective Status

One text color. One brand accent. Three status signals. That is the entire chromatic palette.

Everything else is INK at varying opacity. → `design-tokens/colors.md`

### 4. Typographic Hierarchy Does The Heavy Lifting

No icons for navigation. No color for section identity. No background gradients for visual interest. Typography alone creates hierarchy through size, weight, and opacity. → `design-tokens/typography.md`

### 5. Borders Define, Don't Decorate

Borders appear on containers (cards, inputs) to define boundaries. Never on decorative elements. Never as a design choice. → `design-tokens/surfaces.md#border-philosophy`

---

## What The Visual Language Deliberately Avoids

| Avoided Pattern | Why |
|---|---|
| Glassmorphism | Decorative, not informational |
| Gradient backgrounds | Consumer/startup association |
| Colorful macro icons | Breaks monochromatic system |
| Drop shadows | Implies light source; instruments are self-illuminated |
| Rounded corners on structural elements | Cards get radius. Bands and structural elements don't. |
| Emoji | Consumer, non-premium |
| Icon-heavy navigation | Text is unambiguous; icons require interpretation |
| Neon accents | Gaming/nightclub aesthetic |
| Multiple accent colors | Chromatic noise |

---

## Surfaces At A Glance

```
Page             #08080D   No border, no radius
Cards (default)  #0F0F18   1px INK-4 border, 12px radius
Expanded/sheets  #151520   1px INK-3 border, 12px radius
Inputs           #151520   1px INK-3 border, 10px radius
Command bar      #1B1B27   1px INK-4 border-top, no radius
```

No shadows. One compositional gradient (above command bar only).

---

## Typography At A Glance

```
DISPLAY   32px  Syne 800    STATE text only
TITLE     18px  Syne 700    Section headers (rare)
DATA      16px  DM Mono 500 Primary values
BODY      13px  DM Mono 400 Descriptions, AI text
LABEL      9px  DM Mono 400 All labels (UPPERCASE, tracked)
MICRO      8px  DM Mono 400 Metadata, timestamps
```

Two fonts. Six sizes. No exceptions. → `design-tokens/typography.md`

---

## Color At A Glance

```
BG-0       #08080D         Page
BG-1       #0F0F18         Cards
BG-2       #151520         Elevated surfaces
INK-0      #E8E3D8  100%   Primary text
INK-1               72%    Secondary
INK-2               42%    Tertiary / labels
INK-3               22%    Metadata
INK-4                9%    Borders / ghost
GOLD       #EDB84A         Brand accent
STATUS-UP  #3ECFA2         Positive
STATUS-MID #E8A640         Caution
STATUS-DOWN #E85454        Alert
```

→ Full values and semantic rules: `design-tokens/colors.md`

---

## Motion At A Glance

```
Easing (arrive)   cubic-bezier(0.16, 1, 0.3, 1)
Easing (depart)   cubic-bezier(0.5, 0, 0.84, 0)
Easing (data)     cubic-bezier(0.0, 0.0, 0.2, 1)

Quick             150ms   Border changes, opacity
Standard          220ms   Transitions, expand/collapse
Data              320ms   Bar fills, number counts
```

→ Full contracts: `motion-system.md`

---

## Spacing At A Glance

Base unit: 4px. Page gutter: 20px (never breaks).

→ Full system: `design-tokens/spacing.md`
