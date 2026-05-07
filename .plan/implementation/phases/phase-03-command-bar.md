# Phase 03 — Command Bar Hardening

**Status:** NOT_STARTED
**Tasks:** P03-001
**Estimated duration:** 1–2 hours

---

## Purpose

Implement the command bar focused state per `design-system/components/command-bar.md`. The command bar exists and functions — this phase adds the designed interaction state and visual polish.

---

## Prerequisites

- Phase 01 complete (command bar is in its correct position in the layout)

---

## Exit Conditions (Phase Complete When)

1. Gold border-top appears on input focus: `1px solid rgba(237,184,74,0.25)`
2. Scrim (semi-transparent overlay) appears behind the command bar when focused
3. Gradient fade above the command bar is present at all times (not just on focus)
4. Focus state does not affect command bar height or layout
5. Blur/unfocus restores the previous visual state

---

## Tasks

| Task | What it does |
|---|---|
| P03-001 | Adds focus state visual effects to CommandBar component |

---

## Architecture Constraints

- `design-system/components/command-bar.md` — exact spec
- `design-system/tokens/colors.md` — GOLD tokens only for the border (`--gold-1`)
- No box-shadow (invariant E-INV-05 violation would be visual)
- The gradient fade: `linear-gradient(to top, var(--bg-0), transparent)`, fixed above the bar, ~80px height

---

## What Exists After This Phase

- Command bar with full designed focus state
- Gradient fade always visible above bar
- Scrim on focus
- Gold border on focus
