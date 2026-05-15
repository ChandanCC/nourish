# Settings Philosophy

**Authoritative. Read before adding any new setting.**

---

## What Settings Is For

Settings exposes **user-declared intent** — things the user consciously chose and can meaningfully change. It is not a control panel for the system's intelligence, not a configuration surface for algorithms, and not a place for coming-soon placeholders.

The rule: if a reasonable default exists and edge cases are rare, don't expose it. Strong defaults over knobs.

---

## What Belongs in Settings

| Category | Examples | Notes |
|---|---|---|
| Goal declaration | muscle_gain, fat_loss, maintenance, performance | Affects macro targets and SIGNAL thresholds |
| Body metrics | Weight (kg) | Drives calorie and protein computation |
| Notification controls | Daily log reminder, SIGNAL report | Only when notifications are built |
| Display preferences | Units (metric/imperial) | Only when something in the UI uses them |
| Data privacy | Export data, delete account | When user data rights become relevant |
| Integrations | HealthKit, Apple Watch | When wearable integration is built |

---

## What Does NOT Belong in Settings

| Category | Why |
|---|---|
| SIGNAL algorithm knobs | Deterministic. Users cannot tune safety states. |
| AI confidence thresholds | AI uncertainty is managed by the system, not the user |
| Baseline recalculation | Baseline is behavioral median — no user input changes it |
| Macro ratio controls | Derived automatically from goal + protein target |
| "Always show AI instructions" | Silence is correct behavior, not a bug |
| Streak / gamification toggles | These don't exist and must not be added |
| Coming-soon placeholder sections | Absence is correct UI, not failure |

---

## Evaluation Checklist for New Features

Before adding a setting, answer all questions:

1. **Is this user-declared intent?** (goal, preference, permission) — not system behavior
2. **Is the default inadequate for most users?** If most users would want the same behavior, don't expose it
3. **Would a wrong value cause harm or confusion?** If yes, make it a smart default instead
4. **Is the feature actually built?** Don't add a setting for something that doesn't exist yet
5. **Does changing it require explanation?** If the user needs a tooltip to understand it, it's too complex

If you answer NO to #1, or YES to #5, don't add the setting.

---

## Design Rules for Settings UI

- **No coming-soon rows** — empty sections don't exist; build the feature first
- **No color-coded toggles** — monochromatic only; active state uses `var(--ink-4)` background
- **No destructive actions in primary position** — LOGOUT is at the bottom, never prominent
- **No enterprise admin patterns** — no nested drill-downs beyond 1 level, no grid of cards
- **No explanatory copy** — if a setting needs a paragraph of context, reconsider the design
- **Computed values are read-only** — show them, don't make them editable (protein target is derived)
- Motion: 150ms EASE-ARRIVE for dropdown, no animation for the full-screen settings overlay

---

## Access Pattern

Settings is accessed via the **avatar dropdown** in the top-right header — not a tab, not a bottom nav item, not a standalone screen in the navigation hierarchy. It is subordinate to the daily loop.

The dropdown contains exactly two items: **SETTINGS** and **LOGOUT**. No additional items without architectural review.

---

## Version History

| Version | Change |
|---|---|
| v1.4 | Initial settings system: avatar dropdown + goal/weight preferences |

*Update this file when new settings are added. Note why each setting was added.*
