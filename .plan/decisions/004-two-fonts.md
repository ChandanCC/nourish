# ADR 004: Exactly two typefaces (Syne + DM Mono)

**Status:** Accepted
**Date:** 2026-05-07

---

## Context

Font choice is a loaded design decision. The wrong choice makes an interface look generic, consumer, or cheap. The options range from: system fonts (SF Pro / Roboto), single custom font, two custom fonts, or more.

---

## Decision

**Exactly two typefaces:**
- **Syne** (weights 700, 800) — for STATE text and rare section headers only
- **DM Mono** (weights 400, 500) — for everything else

No system fonts. No additional fonts. Ever.

---

## Rationale

**Why monospace (DM Mono) for data:**
- Numbers in monospace align naturally in columns — critical when values are scanned vertically (history rows, macro grids)
- Monospace signals instrument / terminal / precision — consistent with the Bloomberg/cockpit reference point
- Monospace is inherently generous in tracking — `9px DM Mono` labels don't need manual `letter-spacing` adjustments that other fonts require
- Sans-serif or humanist fonts at small sizes in a dark-background context often have poor contrast on odd spacing values; monospace is more predictable

**Why Syne for STATE:**
- STATE text (32px, 800 weight) is the hero element. It needs to read as *designed* — an intentional visual choice, not a system font default
- Syne at ExtraBold has a slight geometric tension that reads as both confident and precise — not the warmth of a humanist sans, not the sterility of a geometric sans
- Contrast between Syne headlines and DM Mono body creates hierarchy through typeface differentiation, not just size

**Why not Inter, SF Pro, or system fonts:**
- Inter and similar neutral sans-serifs are appropriate for productivity tools where the font should disappear. Nouriq's visual identity depends on the type choices having a point of view.
- System fonts (SF Pro on iOS, Roboto on Android) would read as "another app" rather than a designed instrument

**Why exactly two (not three):**
- Three fonts create identity noise. Each additional typeface requires justifying its presence. Two creates clear rules: "Is this a headline? Syne. Is this anything else? DM Mono."

---

## Consequences

- Font loading adds ~40KB (Syne ExtraBold + DM Mono regular/medium subsets)
- Both fonts must be loaded via Google Fonts or bundled — no system fallback in production
- Any future type decision defaults to one of these two at defined weights. No exceptions without a new ADR.

---

## Rejected Alternatives

**System fonts only (SF Pro / Roboto):** Eliminates the designed-instrument aesthetic. Rejected.

**Inter throughout:** Removes the STATE hero distinction. STATE in Inter reads as a dashboard label. Rejected.

**Three fonts (add a serif for something):** No serif element exists in the design reference points. Rejected.
