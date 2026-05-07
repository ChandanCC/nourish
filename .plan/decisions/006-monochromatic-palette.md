# ADR 006: Monochromatic palette with selective status colors

**Status:** Accepted
**Date:** 2026-05-07

---

## Context

The previous UI used color-coded macro values in EntryCards:
- Protein: `#4ecdc4` (teal)
- Carbs: `#ffa552` (orange)
- Fat: `#ff6b9d` (pink)
- Fiber: `#a78bfa` (purple)

Additionally, different UI sections used distinct accent colors, creating a multi-color identity.

This pattern is the default pattern for fitness apps (MyFitnessPal, Cronometer, Lose It) because colors aid quick identification of macro categories.

---

## Decision

**One background family. One ink family. One brand accent. Three status signals. That is the entire palette.**

All text and data is `#E8E3D8` (warm off-white) at varying opacities. No per-macro colors. No per-section colors.

The four banned macro colors are explicitly documented in `design-system/tokens/colors.md#prohibited-patterns`.

---

## Rationale

**Color communicates status, not identity:**
In the instrument panel reference frame, color is a signal. Red means "attention required." Green means "good." Amber means "watch this." These are status signals with clear semantics.

Using teal for protein has no semantic content — it's category labeling through color, which works in consumer apps but creates chromatic noise in a precision data tool. The user doesn't need to learn "teal = protein." They can read the label `P`.

**Monochromatic is not the absence of design:**
The warm/cool temperature contrast between `#08080D` background and `#E8E3D8` text creates richness. The INK opacity hierarchy (100% / 72% / 42% / 22% / 9%) creates full information hierarchy without color. This is harder to design than a colorful palette — it requires every typographic decision to carry more weight.

**Reference points:**
Bloomberg Terminal, aircraft glass cockpits, and medical monitoring displays are all primarily monochromatic with selective color for status. These reference points were chosen deliberately.

**Competitive differentiation:**
Every major nutrition app uses color-coded macros. Nouriq's deliberate restraint will be perceived by the target audience (precision-oriented users) as a signal of seriousness, not as a limitation.

---

## Consequences

- Macro identification relies on labels (`PROTEIN`, `CARBS`, `FAT`, `FIBER` in uppercase DM Mono), not color
- The STATUS colors (`#3ECFA2`, `#E8A640`, `#E85454`) carry more weight — they must be used only for genuine status signals
- GOLD (`#EDB84A`) appears in exactly 3 places; adding a 4th requires a new decision
- Designers and engineers joining the project will default to adding color; this ADR is the reference to redirect them

---

## Prohibited Colors (from old implementation)

| Hex | Was used for | Why prohibited |
|---|---|---|
| `#4ecdc4` | Protein in EntryCard | Arbitrary category color |
| `#ffa552` | Carbs in EntryCard | Arbitrary category color |
| `#ff6b9d` | Fat in EntryCard | Arbitrary category color |
| `#a78bfa` | Fiber in EntryCard | Arbitrary category color |
| `#ffc864` | Previous brand gold | Superseded by `#EDB84A` |

---

## Status Colors — Why These Three

**`#3ECFA2` (teal-green for STATUS-UP):**
Clinical rather than gaming green. `#00FF00` or similar neon greens read as alerts. This teal reads as "normal/good" in the medical instrument context.

**`#E8A640` (amber for STATUS-MID):**
True amber. The caution signal on an aircraft instrument panel. Not orange (sports energy), not yellow (caution-generic). This amber is specific.

**`#E85454` (coral-red for STATUS-DOWN):**
Communicates "attention" without aggression. Pure `#FF0000` or `#FF3333` reads as alarm/danger. The coral softens to "information requiring action."
