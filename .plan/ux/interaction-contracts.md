# Interaction Contracts

**Status:** Active — v1.0
**Last updated:** 2026-05-07

Defines every interactive element, its trigger, its response, and what never happens.

→ See: `design-system/motion-system.md` for animation specs.
→ See: `design-system/components/` for component-level interaction detail.

---

## Governing Principle

Every interaction has exactly one outcome. No ambiguous states. No "loading..." that could mean anything. No errors that don't tell the user what to do.

---

## Command Bar

| Trigger | Response |
|---|---|
| Tap bar | Keyboard appears. Gold border-top activates. Scrim behind. |
| Type + Return | Text clears (50ms delay). AI processes. Entry card appears when ready. |
| Tap outside bar | Keyboard dismisses. Bar returns to default state. Scrim fades. |
| Tap +W | Workout sheet slides up from bar. |
| Swipe down on workout sheet | Sheet slides back down. Command bar returns to default. |

**Error state (AI parse fails):**
```
MICRO text appears in bar: "Couldn't parse that. Try again."
Color: INK-3 (22%)
Duration: 3 seconds, then fades
The bar remains focused and ready for retry.
```

---

## Waveform Bars

| Trigger | Response |
|---|---|
| Tap any bar | Selected bar brightens. Others dim to 40%. TODAY zone crossfades to selected day. Compact strip updates. |
| Tap today's bar | All bars return to default brightness. TODAY zone shows current day. |
| Tap today's bar (already today) | No response. |

**No double-tap.** No long-press. No swipe on waveform.

---

## EntryCard

| Trigger | Response |
|---|---|
| Tap anywhere on collapsed card | Card expands. Separator draws in. Content fades in. ▼ rotates to ▲. |
| Tap anywhere on expanded card | Card collapses. Content fades out. Height shrinks. ▲ rotates to ▼. |
| Tap "Delete entry" in expanded card | Entry removed immediately. Card slides up with EASE-DEPART. Log count decrements. Calorie total updates. |

**No long-press context menu.** No swipe-to-delete. Delete is inside the expanded card.

---

## TODAY Zone — Calorie Count (2A)

| Trigger | Response |
|---|---|
| Tap calorie count | Macro panel expands inline below. All four macros + calorie total row visible. |
| Tap calorie count again | Macro panel collapses. |

The calorie count has a subtle `▼` indicator when the panel is collapsed — not a button, just a signal that it's expandable.

---

## TODAY Zone — Protein Bar (2A)

| Trigger | Response |
|---|---|
| Tap protein progress bar row | Inline protein breakdown expands. Shows per-entry contribution. |
| Tap again | Collapses. |

---

## History Rows (EARLIER THIS WEEK)

| Trigger | Response |
|---|---|
| Tap any history row | Waveform bar for that day activates. TODAY zone crossfades to that day. Compact strip updates. Smooth scroll to TODAY zone. |

---

## Avatar (Top Right)

| Trigger | Response |
|---|---|
| Tap avatar | Settings sheet slides up. Shows: name, email, profile picture, "Sign out" option. |
| Tap "Sign out" | JWT cleared from localStorage. Google session cleared. Login page renders. |
| Swipe down on settings sheet | Sheet closes. |

Settings sheet in v1.0 is minimal — just account info and logout. No settings to configure yet.

---

## Compact SIGNAL Strip

| Trigger | Response |
|---|---|
| Tap ↓ (scroll-to-top icon) | Smooth scroll to top. SIGNAL hero re-expands. |
| Tap STATE text or delta text | No response in v1.0. (Future: could open weekly summary.) |

---

## Weekly Summary Report

| Trigger | Response |
|---|---|
| Delivered every Sunday | Appears as a new "card" at the top of the LOG zone for that day |
| Tap on report card | Expands to full report view (full-screen-ish sheet). |

Not yet built. Defined here to establish the interaction contract before implementation.

---

## What Never Happens

- Pull-to-refresh: data refreshes on navigation, not on manual pull. No spinner.
- Loading states on visible content: either content is there or it's absent. No skeleton screens.
- Confirmation dialogs: the only destructive action (delete entry) requires two taps (expand card, then tap delete) — no confirmation overlay.
- Toast notifications: no floating toasts for success states. The UI updates reflect success.
- Push notification permission prompt: never shown unprompted. (v1.0 has no push notifications.)
- Empty state illustrations: if there is no data, the section is absent. No cartoon illustrations of empty plates.
