# P02-001 — Typography System Application

**Phase:** 02 — Frontend Display Layer
**Complexity:** M (1–3h)
**Status:** NOT_STARTED
**Depends on:** P01-001
**Unlocks:** P02-002, P02-003, P02-005

---

## Purpose

Load Google Fonts (Syne 700/800, DM Mono 400/500) and apply the six-size type scale as CSS classes across the app.

## Why It Exists

The design system mandates two fonts and six named sizes. Currently the app uses system fonts or incorrect sizes. All display components (Phase 02) require the type scale to exist before implementing their typography.

## Required Reading

- `design-system/tokens/typography.md` — font families, six sizes, usage rules

## Exact Scope

- Add Google Fonts import to `frontend/index.html` or `frontend/src/index.css`:
  - Syne: weights 700 and 800
  - DM Mono: weights 400 and 500
- Add six CSS utility classes for the type scale (names from typography.md)
- Apply `font-family: var(--font-mono)` to `body` as default (DM Mono is the body font)
- Apply `font-family: var(--font-display)` only to the STATE text class (Syne)
- Add `--font-display` and `--font-mono` CSS custom properties to `:root`

## Out of Scope

- Applying type classes to specific components (done within each component task)
- Font size changes beyond the six defined sizes

## Files Expected to Change

```
frontend/src/index.css                  (add font vars, type scale classes)
frontend/index.html                     (Google Fonts <link> tag)
```

## Design-System Constraints

- Exactly two font families: Syne for STATE/headers, DM Mono for everything else
- Exactly six sizes from typography.md — no additional sizes
- No `font-weight` values other than those in the token system
- Font loading via Google Fonts CDN link in `<head>` — not `@import` in CSS (performance)

## Acceptance Criteria

1. Syne 700 and 800 load (visible in browser devtools Network tab)
2. DM Mono 400 and 500 load
3. Six CSS type scale classes exist and apply correct size/weight/line-height
4. `body` uses DM Mono by default
5. No existing text appears broken or resized unexpectedly
6. Build passes

## Edge Cases

- Google Fonts may be blocked in some environments — this is acceptable for v1.1 (no self-hosting requirement)
- If the app already loads a different font, remove it

## Test Expectations

None. Visual check: open app in browser, inspect body element, confirm font-family shows "DM Mono".

## Estimated Complexity

M — ~1.5 hours including verification.

## Claude Execution Guidance

Read typography.md first. Add fonts in index.html `<head>` (not @import). Add CSS vars and utility classes to index.css in the existing token block. Do not rename existing CSS classes — add new ones. Verify in browser before marking complete.
