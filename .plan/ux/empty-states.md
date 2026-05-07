# Empty States

**Status:** Active — v1.0
**Last updated:** 2026-05-07

→ See: `product/core-principles.md` principle: "Absence is a design choice."

---

## Governing Rule

**Empty state = absence, not illustration.**

When there is no data, the UI element is simply absent. No cartoon illustrations. No friendly copy ("You haven't logged anything yet! 🍎"). No call-to-action buttons in empty zones.

The command bar is always visible. It is the implicit call to action. A separate "Log your first meal" button in the empty LOG zone would compete with the command bar and treat the user as if they don't understand how the product works.

---

## Home Screen — No Entries Today

**LOG zone (Zone 3):**

```
──────────────────────────────────────────────
LOGGED TODAY                           0 entries
```

The header row appears. `0 entries` is the count. Nothing below it. No empty state card.

The section header's presence communicates "this is where entries will appear." Its emptiness communicates "you haven't logged yet." No further explanation is needed.

---

## Home Screen — No Training Logged

**TRAINING sub-section (Zone 2B):**

```
TRAINING  ·  Not logged

→ Log your session to complete today's signal.
```

This is the one exception: a single instruction line appears because training is a data type that has a genuine impact on SIGNAL computation. The user benefits from knowing it's missing.

The `→ Log` is tappable — it focuses the command bar. This is the only in-content CTA on the home screen.

If the user does not train: they can dismiss this prompt or ignore it. It does not repeat.

---

## Home Screen — No Micros Data

**MICROS sub-section (Zone 2C):**

The entire section is absent. Not "No micros logged." Not "Track your micronutrients." Just: the section doesn't appear.

Micros are secondary information. Their absence does not impede the user's primary loop.

---

## Home Screen — READING State (New User)

During the baseline period (< 3 days of data):

```
READING
Establishing your baseline — 3 more days of logging.
```

Waveform bars render at zero height (not absent — the waveform structure is present, bars are flat).

DELTA line: absent (cannot be computed without baseline).

TODAY zone: present but shows today's data (whatever has been logged today). Not an empty state — it's a partial state.

---

## History — No Earlier Days

**EARLIER THIS WEEK section:**

If there are no previous days with data (new user, first day):

```
──────────────────────────────────────────────
EARLIER THIS WEEK
```

Header appears. Nothing below. The absence communicates "no history yet." No message. No encouragement.

---

## Search / Day Select — No Data for Selected Day

When a user taps a waveform bar for a day with no logged entries:

TODAY zone updates to show that day's date, with:
```
TODAY  ·  Monday                        —
```

`—` (em dash) in place of calorie count. No macro row. No training row. No AI instruction.

The waveform bar for that day is at zero height (already visible before the tap).

No "Nothing logged on this day" message. The zero-height bar already communicated this.

---

## What Empty States Never Include

| Prohibited | Why |
|---|---|
| Illustrations of food, plates, vegetables | Consumer/playful aesthetic; conflicts with instrument reference |
| Emoji | See: `design-system/visual-language.md#what-the-visual-language-deliberately-avoids` |
| "Get started" buttons | Command bar is always visible; a second CTA is noise |
| Encouragement ("You're doing great, keep going!") | Praise-based language for absence is tone-deaf |
| Skeleton screens / loading shimmer | Data is either there or it's not. No in-between. |
| Percentage-complete indicators | Progress gamification |
