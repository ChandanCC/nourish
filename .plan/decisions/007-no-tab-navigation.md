# ADR 007: No tab bar navigation

**Status:** Accepted
**Date:** 2026-05-07

---

## Context

Standard mobile app navigation pattern: a fixed bottom tab bar with 3–5 icons (Home, Log, History, Profile, Settings). Every major fitness app uses this pattern. It is expected, tested, and understood by users.

---

## Decision

**No bottom tab bar.** The app is a single surface. Navigation is contextual, embedded in the content.

The only fixed bottom element is the Command Bar.

---

## Rationale

**The app is one thing:**
Nouriq is a daily log with a pattern read. It is not a multi-section app that requires navigation between distinct views. The home screen contains everything the user needs for the daily loop:
1. SIGNAL zone (where am I?)
2. TODAY zone (what have I done / what do I need to do?)
3. LOG zone (what did I eat?)
4. Command bar (log something)

Navigation to other "screens" would imply there is another context to navigate to. In v1.0 there isn't.

**Tab bars compete with the command bar:**
If both a tab bar and a command bar are pinned to the bottom, the command bar loses prominence. The command bar must be the single fixed action surface.

**The waveform is the time navigation:**
Tapping waveform bars navigates time (past days). This eliminates the need for a "History" tab. There is no separate history screen — history is embedded in the home screen and accessible via the waveform.

**Reference points:**
Linear's web app is a single surface (no top-level tab bar, just a sidebar). WHOOP's core read is a single screen. The target aesthetic is "instrument," and instruments don't have tab bars — they have zones.

---

## Consequences

- Deep features (profile, settings, workout detail) require an access pattern that isn't a tab bar. Current approach: avatar tap → settings sheet. If the feature set grows significantly, this decision should be revisited.
- Users accustomed to tab navigation may initially not find settings. This is acceptable: settings are accessed infrequently; the cognitive overhead of tab navigation for a daily-use primary loop is not.
- Onboarding must teach the waveform-as-navigation pattern, since it's non-standard.

---

## When to Revisit

If the app adds features that are genuinely orthogonal to the daily loop (e.g., a recipe database, social features, coaching inbox), reconsider. The rule is: if a feature cannot be contextually embedded in the three zones, it may need navigation. But that feature addition is itself the decision to make, not an excuse to retrofit a tab bar now.
