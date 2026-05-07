# Component: Command Bar

**Status:** Active — v1.0
**Last updated:** 2026-05-07

→ See: `design-system/home-screen.md#zone-4-command-bar` for placement context.
→ See: `design-system/motion-system.md#new-entry-logged` for post-submit animation.

---

## Purpose

The command bar is the single input mechanism for all user-generated data. Every log — food, workout, supplement — enters through this one surface.

It is always visible. It never hides. It never scrolls away.

---

## Physical Layout

```
┌─────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  +W  │
└─────────────────────────────────────────────────────┘
  ← 20px →                                  ← 20px →
```

```
Height:             56px total
Position:           fixed, bottom: 0, width: 100%
Background:         #1B1B27   (BG-3 / OVERLAY level)
Border:             border-top: 1px solid rgba(232,227,216,0.09)   /* INK-4 */
Border-radius:      none (full-width, flush)
Horizontal padding: 20px
```

---

## Input Field

```
Type:         text input (not textarea — no multiline)
Font:         BODY — 13px DM Mono 400
Color:        INK-0 (100%) when typing
Placeholder:  INK-3 (22%) — "What did you eat?"
Background:   transparent (inherits command bar BG)
Border:       none on input itself (bar border is the visual boundary)
Caret:        INK-1 (72%)
```

**Placeholder text variants:**
- Default (today, no day selected): `What did you eat?`
- When viewing a past day: `What did you eat on [Day name]?`
- After workout is logged: `What else did you eat today?`
- After 5+ entries: `What else?`

The placeholder updates dynamically. Never shows an instruction the user has already completed.

---

## +W Action (Workout Log)

```
Label:    "+W"
Font:     LABEL — 9px DM Mono 400, letter-spacing 0.08em
Color:    INK-2 (42%)
Position: right-aligned inside bar, vertically centered
Size:     44px × 44px tap target (visually smaller)
```

Tap → workout logging sheet slides up from command bar.

**Why "+W" not a glyph/icon:**
Icon sets introduce visual identity questions (which set? which style?). "+W" is unambiguous text that requires zero interpretation. It is also instantly legible at this size.

---

## Focus State

When tapped:
```
border-top: 1px solid rgba(237,184,74,0.25)   /* GOLD at 25% — only place on command bar */
Keyboard: appears (standard mobile keyboard)
Scrim: rgba(8,8,13,0.60) behind bar content, above everything else, pointer-events: none
```

The gold border-top is one of exactly three places GOLD appears in the UI.

The scrim signals focus without a modal overlay — the content is still visible (dimmed), not hidden.

**Scrim spec:**
```
position: fixed
inset: 0
bottom: 56px   /* above command bar */
background: rgba(8,8,13,0.60)
pointer-events: none
z-index: above content, below command bar
transition: opacity 0→1, LINEAR, QUICK (150ms)
```

---

## Gradient Fade Above Bar

```
position: fixed
bottom: 56px   /* sits flush above command bar */
height: 40px
width: 100%
background: linear-gradient(to bottom, transparent, #08080D)
pointer-events: none
z-index: same as bar
```

This gradient communicates that content continues below the visible area and the command bar is floating, not part of the scroll.

---

## Submit Behavior

User types food entry, hits Return/Send.

```
1. Input text clears (50ms delay after submission)
2. Command bar returns to default placeholder
3. AI analysis begins (server-side)
4. EntryCard animation plays (100ms after analysis complete)
```

No loading indicator in the command bar itself. No spinner. No "thinking…" placeholder. The command bar resets immediately. The entry card appears when ready.

If analysis fails: a brief inline message in MICRO size, INK-3: `Couldn't parse that. Try again.` Fades after 3 seconds.

---

## Workout Sheet (triggered by +W)

```
Position: slides up from command bar, covers lower ~70% of screen
Surface:  SHEET (#151520, 1px INK-3 border-top, 12px radius top corners only)
Header:   "LOG WORKOUT" — LABEL, INK-2
Close:    ✕ icon, right-aligned, INK-2 — or swipe down
```

Workout sheet spec is separate (not yet written — `design-system/components/workout-sheet.md` TODO).

The sheet is not a modal — it does not disable the rest of the UI. The command bar itself slides up with the sheet.

---

## What the Command Bar Never Contains

- Submit button (Return key is the submit action)
- Attachment or image upload
- Emoji picker
- Voice input
- Category selector (type of entry — this is inferred by AI)
- Recent history suggestions / autocomplete list (in v1.0)
- Character counter
- Processing spinner
