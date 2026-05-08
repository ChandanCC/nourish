# Nouriq Automation

Lightweight executable validation framework. Deterministic, fast, low-noise.

---

## Commands

```bash
npm run validate:task        # Post-task check: invariants + builds + tests (~30s, no server)
npm run validate:invariants  # Static code analysis only (~1s)
npm run validate:smoke       # Boot + UI integrity checks (builds + serves frontend)
npm run validate:replay      # Behavioral flow replay (serves frontend)
npm run validate:visual      # Visual drift detection (serves frontend)
npm run validate             # Full suite
```

**`validate:task` is the minimum to run after every implementation task.**

---

## Invariant Scanner

Scans all source files against a rule registry. No server, no network, no external deps.

**Error rules** (block commit):
- `V-001` — `box-shadow` anywhere in UI code
- `V-002` — `backdrop-filter` anywhere
- `V-005` — `text-shadow` anywhere
- `P-001` — Praise language in component strings
- `P-002` — Gamification patterns (streak, badge, confetti)
- `A-001` — Anthropic SDK/key in frontend
- `A-002` — `JWT_SECRET` in frontend
- `A-003` — API key logged
- `B-001` — `/api/analyse` called outside `api/client.ts`
- `B-003` — Anthropic client called directly in route handler
- `B-004` — FoodEntry query without `isDeleted` filter

**Warning rules** (review when possible):
- `V-003` — Hardcoded hex color in component (should be `var(--token)`)
- `V-004` — `linear-gradient` outside HomeScreen
- `P-003` — Emoji literal in component file
- `B-002` — TypeScript `any` without suppression comment

**Adding rules:** extend `invariants/rules.js`. Follow the existing shape.
**Suppressing a known exception:** add `// invariant-exception: <reason>` on the same line.

---

## Smoke Checks

Playwright tests that verify boot integrity without authentication. Run against Vite preview server (started automatically if not running).

Covers:
- Page loads with no JS errors
- Dark background color (design system BG-0)
- CSS custom properties loaded
- Login wall active for unauthenticated users
- Render within 3 seconds

---

## Behavioral Replay

Playwright flows that replay key user journeys.

**Always runs** (no token):
- `auth-wall` — unauthenticated user sees login, not home screen

**Requires `TEST_TOKEN`** (JWT for onboarded test user):
- `food-log` — command bar behavior, entry card interaction
- `onboarding` — requires `TEST_ONBOARDING_TOKEN` (user with `onboardingComplete: false`)

```bash
TEST_TOKEN=eyJ... npm run validate:replay
```

---

## Visual Drift Detection

Screenshots key screens at 390×844 (iPhone 14). Compares against stored baselines.

```bash
UPDATE=1 npm run validate:visual   # refresh baselines (after intentional UI change)
npm run validate:visual            # compare against baselines (catch unintended drift)
```

Baselines stored in `visual/baselines/`. Threshold: 10% pixel diff tolerance.

Authenticated screens require `TEST_TOKEN` (same as replay).

---

## Reports

All runs write JSON summaries to `reports/`:
- `invariants.json` — violation list
- `smoke.json` — pass/fail
- `replay.json` — pass/fail
- `visual.json` — pass/fail or updated
- `task-validation.json` — step-by-step post-task result
- `validation-summary.json` — full suite run

---

## Extension Guidance

**New invariant rule:** add to `invariants/rules.js`. Test with `npm run validate:invariants`.

**New behavioral flow:** add `replay/flows/<name>.spec.js`. Uses `@playwright/test`. Follow existing flow structure: skip gracefully without token, verify behavior (not implementation).

**New smoke check:** add to `smoke/app.spec.js`. Keep checks stateless and fast.

**New visual baseline:** add test to `visual/screenshots.spec.js`, run `UPDATE=1 npm run validate:visual`.

---

## Philosophy

- **Invariants are architectural.** They protect the product's coherence over time.
- **Smoke checks are structural.** They verify the system boots and basic paths hold.
- **Replay is behavioral.** It verifies contracts, not implementation details.
- **Visual drift is perceptual.** It catches regressions the eye would catch first.
- **Nothing here is exhaustive.** The goal is signal, not coverage.
