# Onboarding & Activation System

**Status:** Active — v1.1 spec
**Last updated:** 2026-05-07

→ For interaction rules: `ux/interaction-contracts.md`
→ For READING state display: `design-system/components/signal-hero.md`
→ For SIGNAL first activation: `product/signal-system.md`

---

## 1. Onboarding Philosophy

The fundamental problem with fitness app onboarding is that it asks users to trust the system before the system has done anything worth trusting.

TDEE calculators, activity levels, goal timelines, body measurements — every question before the first log is a promise the app makes about what it will do with that data. Most apps then fail to visibly use any of it. The result: the user answered 15 questions and got the same home screen as everyone else.

**Nouriq's contract is different:**

> Every question asked produces a visible, immediate change in what the system shows.

Three questions. Three direct consequences. Then the product, running.

The system earns trust through accuracy on the first food log — not through promises about what it will eventually do. The user types "had some chicken and rice" and sees `Chicken breast + rice bowl · 340 kcal · P 42g · C 28g · F 8g` appear. That's the proof. That's the onboarding.

Everything from that point forward is the system learning. Not the user being set up.

**The emotional arc this creates:**

```
Screen 1:  Recognition      "This looks different."
Screen 2:  Alignment        "It's asking the right question."
Screen 3:  Investment       "I set that target myself. It matters to me."
First log: Belief           "It actually understood what I typed."
Day 3:     Engagement       "It's starting to see my week."
Day 7:     Commitment       "It named something true about me."
```

The activation milestone is not completing setup. It is not 7 days of consecutive logging. It is the moment a user sees their SIGNAL STATE for the first time and recognizes it as accurate. That moment of recognition creates durable retention — the system has demonstrated that it knows something the user already felt was true.

---

## 2. What Onboarding Never Does

These are absolute prohibitions. Not guidelines.

**Copy and tone:**
- "Let's get started!"
- "Welcome to your fitness journey!"
- "You've got this!"
- "Great choice!"
- Anything with an exclamation point
- "Help us personalize your experience"
- Progress steps ("Step 2 of 5")
- Achievement framing ("You've completed setup!")

**Questions and data:**
- Body weight input
- Height input
- Age input
- Activity level selector ("Sedentary / Lightly Active / Very Active")
- TDEE calculation or display
- Calorie goal setting
- Macro percentage sliders
- Dietary restriction multi-select
- "What foods do you eat?" preference setup
- Body type / somatotype questions

**UI patterns:**
- Feature tour with arrows pointing at interface elements
- Walkthrough overlay on the home screen
- "Skip" button on any question (questions are required — if it can be skipped, it shouldn't be asked)
- Loading spinner between onboarding screens
- Notification permission prompt during setup (ask at the natural moment, not upfront)
- "Connect your devices" prompt during setup
- Welcome email or SMS confirmation
- Profile photo upload
- Username creation

**Post-setup patterns:**
- "You're all set!" completion screen
- Confetti or celebration animation
- Day 1 checklist ("Complete these 3 things today")
- Empty state illustrations
- "Invite friends" prompt in first 30 days
- App store rating prompt in first 30 days
- "Rate this analysis" thumbs up/down on food entries
- Streak counter from day 1
- Achievement badges for first log

---

## 3. Screen Architecture — The Setup Flow

Three screens. Fade transitions. Then the product.

---

### Screen 1 — Welcome

```
┌─────────────────────────────────────────────┐
│                                             │
│                                             │
│                                             │
│                                             │
│             NOURIQ                          │  ← 11px DM Mono 500, tracked
│                                             │
│                                             │
│                                             │
│   The system is beginning to learn.        │  ← 16px DM Mono 400, INK-1
│                                             │
│                                             │
│                                             │
│                                             │
│                                             │
│                                             │
│                                             │
│             Continue  →                    │  ← 13px DM Mono 400, INK-1
└─────────────────────────────────────────────┘
```

**Background:** `#08080D` (BG-0). Full screen.
**Wordmark:** appears at 80ms — fade in, LINEAR, 150ms
**Tagline:** appears at 300ms — fade in, LINEAR, 200ms
**Continue:** appears at 600ms — fade in, LINEAR, 150ms

**No logo animation. No particles. No gradient reveal.**

"The system is beginning to learn." is not a tagline. It is a precise description of what is about to happen. The user has not logged anything yet. The system genuinely is beginning.

The word "beginning" is important. It sets the expectation that this is the start of a process — not a feature tour, not a setup wizard, but the start of observation.

**What this screen is NOT:**
- A list of features ("Track macros. Analyze patterns. Reach your goals.")
- A social proof screen ("Join 50,000 athletes")
- A before/after comparison
- A screenshot carousel

---

### Screen 2 — Goal Declaration

```
┌─────────────────────────────────────────────┐
│                                             │
│  What are you training for?                │  ← 18px Syne 700, INK-0
│                                             │
│  This determines what SIGNAL watches for.  │  ← 11px DM Mono 400, INK-3
│                                             │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  BUILD                              │   │  ← Card tap target, 64px height
│  │  Consistent surplus. Muscle growth. │   │  ← 9px DM Mono, INK-3
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  LOSE                               │   │
│  │  Sustained deficit. Protein high.  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  MAINTAIN                           │   │
│  │  Baseline. Pattern stable.          │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

**Goal label:** 16px DM Mono 500, INK-0
**Goal description:** 9px DM Mono 400, INK-3
**Card default:** BG-1 (`#0F0F18`), 1px INK-4 border, 12px radius
**Card selected:** BG-2 (`#151520`), 1px INK-1 border — the border brightens, nothing else changes
**Card tap:** no scale, no bounce. Border transition only — QUICK (150ms), LINEAR

**The question is "What are you training for?" — not "What is your fitness goal?"**

The distinction is intentional. "Fitness goal" implies the app needs to know your aspiration. "What are you training for?" implies it already knows you train — it just needs to know the direction. This respects the user's identity immediately.

**Three options only. No sub-options.**
- BUILD: the system watches for surplus + training load
- LOSE: the system watches for sustained deficit + protein protection
- MAINTAIN: the system watches for baseline adherence

The description under each option describes what SIGNAL will watch for — not what the user should eat. This makes it clear that the question has a direct mechanical consequence.

**Tap to select → auto-advance to Screen 3** (no "Continue" button)

---

### Screen 3 — Protein Target

```
┌─────────────────────────────────────────────┐
│                                             │
│  Your daily protein target.                │  ← 18px Syne 700, INK-0
│                                             │
│  The binding constraint for your goal.     │  ← 11px DM Mono 400, INK-3
│                                             │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │           160 g                     │   │  ← 32px Syne 800, INK-0 (editable)
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  We'll refine this as we learn your        │  ← 11px DM Mono 400, INK-3
│  pattern. This is where we start.          │
│                                             │
│                                             │
│                                             │
│             Start logging  →               │  ← 13px DM Mono 400, INK-1
└─────────────────────────────────────────────┘
```

**Pre-filled value logic:**
- BUILD goal: 160g (standard bulk starting target)
- LOSE goal: 150g (protein-protective during cut)
- MAINTAIN goal: 130g (reasonable maintenance)

These are not calculated from bodyweight. They are reasonable starting targets for a gymgoer. The system will calibrate the target based on observed behavior over 10 days.

**Why no bodyweight question:**
Body weight is the most fraught data point in fitness apps — it implies the app is about weight, introduces anxiety, and is used by 90% of fitness apps in a TDEE formula that Nouriq explicitly doesn't use. Nouriq observes the user's actual caloric pattern — the baseline is behavioral, not calculated.

The pre-filled value is an honest estimate, labeled as such: "This is where we start." Not "This is your target." Not "Based on your goal, we calculated..."

**The input:** tap the number → numpad appears → user adjusts if they want → tap outside or hit Return → value sets → "Start logging →" appears

**"Start logging →" not "Continue":**
The copy signals that the setup is over and the product is about to begin. The transition happens when they tap it.

---

### Transition to Product

Screen 3 → Home screen:

```
 0ms    "Start logging →" tapped
50ms    Screen 3 fades out (opacity 1→0, LINEAR, 200ms)
250ms   Home screen fades in (opacity 0→1, LINEAR, 300ms)
300ms   READING state hero is visible
500ms   Command bar activates with modified placeholder
```

No loading screen. No "setting up your account" spinner. The home screen is already loaded — the fade is a cover for any remaining render time.

---

## 4. First Session — The Activated Product

The user lands on the home screen. This is their first time seeing it.

**What they see:**

```
NOURIQ                                [avatar]

READING
Establishing your baseline.
Log your first entry below.

[Waveform — 7 bars at zero height, baseline axis visible]
Mon  Tue  Wed  Thu  Fri  Sat  Sun

─────────────────────────────────────────

TODAY  ·  [Day name]                    —

─────────────────────────────────────────

LOGGED TODAY                   0 entries

─────────────────────────────────────────

┌─────────────────────────────────────────┐
│  Start with what you had this morning.  │
└─────────────────────────────────────────┘
```

**Key design decisions in this state:**

The command bar placeholder is not the default "What did you eat?" — it is "Start with what you had this morning." This is the first instance of the system giving a specific, contextual instruction. It feels responsive before any data exists.

The waveform is present with zero-height bars. This is critical: the waveform structure is visible — the user can see what it will look like filled in. The empty waveform is a preview of the instrument they're building. It is not an empty state.

The calorie count shows `—` (em dash), not `0` or `—kcal`. Zero implies they should have eaten. Em dash implies: no reading yet.

LOGGED TODAY shows `0 entries` — the header exists, the count is honest.

**The command bar is pre-focused in the first session only.** The keyboard appears automatically on first load. The user is being directed to the action without a tutorial. Like Linear opening to a new issue input on first launch.

---

## 5. The First Log — Trust Moment One

The user types their first food entry and hits Return.

```
 0ms    Text submitted
50ms    Command bar clears
80ms    "Analysing..." does NOT appear. Bar returns to placeholder.
        [AI processes in background — target: < 2.5 seconds]
100ms   New EntryCard slides up from command bar
        translateY(20px)→0, opacity 0→1, EASE-ARRIVE, 220ms
140ms   Calorie value counts 0→value, EASE-DATA, 340ms
200ms   Protein value counts
240ms   Carbs counts
280ms   Fat counts
320ms   TODAY zone calorie count transitions: — → [value], EASE-DATA, 200ms
360ms   Protein bar extends from 0, EASE-DATA, 280ms
480ms   Waveform today bar rises to proportional height, EASE-DATA, 240ms
```

**The critical moment:**

The user sees their food described accurately back to them in the EntryCard. `Chicken breast + rice bowl · 340 kcal · P 42g · C 28g · F 8g` from "had some chicken and rice."

This is Trust Moment One. The system understood natural language and produced structured, accurate data. No barcode scanner. No database search. No category selection.

The experience is: you described food as you would to a friend, and the system understood it as a nutritionist would.

There is no AI explanation. No "Here's what I found for your meal." No accuracy confidence indicator. The accuracy is the proof. If the output is correct, no explanation is needed. If it's wrong, the user sees it immediately.

**Below the first EntryCard, after a 1-second delay, one line appears:**

```
Entry logged  ·  Baseline forming.
```

9px DM Mono 400, INK-3. This fades out after 4 seconds. It appears only on the first 3 entries ever.

This is the only onboarding copy that appears after setup screens. It confirms that the log has a consequence (baseline is being built) without explaining how.

---

## 6. READING State — Active, Not Empty

The READING state must feel like the system is working, not like the app is empty.

### READING State Hero (full)

```
READING
Day 1  ·  Baseline forming
```

Not "Establishing your baseline — 3 more days of logging." That reads as a countdown to something better. Instead:

- `READING` is displayed at DISPLAY scale (32px Syne 800), identical to `OPTIMISING` or `BUILDING`
- The subtitle is a status report: `Day N · Baseline forming` (days 1–3), `Day N · Pattern emerging` (days 4–6)
- No countdown. No "N days until your SIGNAL." The system is observing, not waiting.

### Waveform in READING state

All bars render at zero height initially. As days are logged:
- The bar for today populates immediately after first log of the day
- The baseline axis is visible from day 1 — the user can see the zero reference
- Past days with no data: no bar rendered (gap is honest)
- Past days with data: bar renders at proper height for that day

There is no "fill in past days" prompt. The waveform simply begins where the user began.

### TODAY zone in READING state

Fully functional from day 1. Shows today's calories (if logged), protein progress bar (if any protein logged), AI instruction line (if there's a gap).

**What is deferred in READING:**
- DELTA line (below waveform) — absent, not `—`. There is no baseline to compare to yet.
- Pattern qualifier in subtitle (`consistent` / `building` / `irregular`) — absent until day 7

---

## 7. Days 1–3 — The Belief Arc

**Goal:** The user logs consistently because the daily loop is satisfying, not because they were asked to.

### Day 1 (First session, covered above)

By end of day 1: user has logged at least one entry, seen accurate AI parsing, seen macros appear, seen waveform bar populate.

### Day 2 — Pattern Recognition Begins

No new UI elements. The system is quiet.

**What happens:**
- The second bar appears in the waveform
- The protein progress bar shows two days of trend (if they check back)
- The LOG zone now has history — yesterday's entries are in EARLIER THIS WEEK
- The AI instruction line becomes more specific if it has enough data: "Your protein was 58% of target yesterday. Add one more high-protein meal today."

This is the first time the AI instruction references the user's personal data, not a generic target. It's also the first time "yesterday" exists in the app. The system is beginning to have memory.

**First retention trigger:** The user checks what they ate yesterday. Seeing their own data from the past creates the first sense of personal record. The app is starting to hold their history.

### Day 3 — First New Feature Appears

The TRAINING section appears in the TODAY zone for the first time. Silently. No notification. No "New feature available!"

```
TRAINING  ·  Not logged
```

No explanation. The section simply exists in its empty state. If the user taps the `→ Log` link in the instruction line, the command bar focuses with "What did you train today?"

**Why day 3 specifically:**
The user has established a logging habit before workout tracking is introduced. Adding it on day 1 would fragment attention. Adding it after day 3 risks the user thinking "why is this appearing now?" Day 3 is the natural point where the daily loop is familiar and a second data type can be introduced without friction.

**The training section introduction is entirely passive.** The user can ignore it. If they log a workout, it populates. If they don't, it stays as `TRAINING · Not logged` indefinitely.

---

## 8. Days 4–7 — The Investment Arc

**Goal:** The user understands the waveform is theirs. They start reading the shape.

### Days 4–5 — The Waveform Fills

By day 4, there are 4 bars in the waveform. The shape is starting to be legible. The user can tap bars to see past days. This is when the waveform becomes navigation — the first time they interact with a past day's data.

**What the system does on day 4:**
- Nothing new appears. The system is consistent.
- The waveform tap behavior is available but not prompted.

Users discover waveform tapping organically or they don't — both outcomes are acceptable. The waveform is always the day navigation; there is no separate signal needed.

### Day 6 — The Expectation

The user who has been logging consistently has now established a pattern. They've seen 6 days of their own data. They may be wondering what happens next. The system does not answer this directly.

The READING state subtitle changes subtly:
```
READING
Day 6  ·  Pattern emerging
```

"Pattern emerging" is a precise claim: there is enough data for a pattern to be visible, even if SIGNAL hasn't computed yet. It is not a promise that SIGNAL is coming. It is a report that something is forming.

---

## 9. Day 7 — SIGNAL First Appearance

This is the emotional peak of the onboarding arc.

**Trigger:** 7 days of log data exists (not necessarily 7 consecutive days — but 7 days since first login with at least 3 days of logged data).

**What happens on app open on day 7 (or whenever the threshold is crossed):**

```
 0ms    App opens
        Data loads behind animation
200ms   Background renders (#08080D)
300ms   STATE text fades in — but it's different this time

        Instead of READING:

        OPTIMISING     ← or whichever state is computed
```

The SIGNAL activation is not announced. The word READING is simply gone and the computed STATE is in its place, at the same scale, at the same position. The user notices the change before they understand what it means.

Below the STATE, instead of "Day N · Pattern emerging", a special first-appearance text:

```
OPTIMISING
First signal read  ·  7 days observed
```

The subtitle signals that this is new — "first signal read" — without being a celebration or a tutorial.

**Below the waveform, the DELTA line appears for the first time:**
```
+4% above your baseline
```

Or negative. This is also new. The waveform now has historical context.

### The First-Time Explanation Block

Below the delta line, replacing where the hairline separator would be, a quiet inline explanation appears **one time only**:

```
────────────────────────────────────────────

WHAT THIS MEANS

OPTIMISING means your inputs are aligned
with your LOSE goal. Protein averaged 89%
of your target. Deficit has been consistent.

SIGNAL updates as your pattern develops.
The state is earned, not set.

                          [ Understood ]

────────────────────────────────────────────
```

```
"WHAT THIS MEANS" — LABEL, 9px DM Mono, INK-2, uppercase
Body text — BODY, 13px DM Mono 400, INK-1
"[ Understood ]" — 13px DM Mono 400, INK-1, tap to dismiss
```

This is not a modal. Not a tooltip. Not an overlay. It is inline content in the home screen, between the hero zone and the TODAY zone. It occupies real vertical space. It has the same visual language as everything else.

**After "Understood" is tapped:**
The explanation block fades out (LINEAR, 200ms). The separator hairline appears in its place. The home screen is in its normal, permanent operating state from this point forward.

This explanation never appears again. There is no way to access it again (it is not filed under "Help"). It is a one-time system note, not a reference document.

**Why this specific explanation is warranted:**

SIGNAL introduces a new concept — a named state computed from behavior — that has no direct analogue in any other app the user has used. One moment of explanation at the point of first activation is justified. A feature tour at setup is not.

The explanation is specific to the user's actual state (`OPTIMISING`) and references their actual data (`protein averaged 89%`). It is not a generic "what is SIGNAL?" explainer. The user is reading about themselves, not reading a help article.

---

## 10. How the AI Earns Trust

Trust is built in three layers, across the first 7 days:

### Layer 1: Accuracy (Day 1)

The AI parses natural language food descriptions into accurate macro data. This is the proof of competence. No other signal matters until this is established.

**Design implication:** The AI must be right. 95%+ accuracy on common foods is the threshold. If accuracy is below this, onboarding fails at the most critical moment. The Anthropic proxy exists specifically to ensure quality — use `claude-sonnet-4-6`, not a smaller model, for food parsing.

If the AI is wrong: the user can delete the entry and re-log. There is no "correct this analysis" flow in v1.1. Deletion + re-log is the correction mechanism. This is acceptable because the failure mode (log a slightly wrong entry) is low stakes.

### Layer 2: Memory (Days 2–4)

The system demonstrates it remembers: past entries are visible, the waveform fills with the user's own data, the AI instruction line references the user's actual numbers ("your protein was 58% of target yesterday").

This layer is passive — it doesn't require any new feature. It requires that the product consistently surfaces the user's own history in a legible way.

### Layer 3: Recognition (Day 7)

The system names a pattern the user already intuitively understood about their own behavior. `OPTIMISING` when they've been disciplined. `DRIFTING` when they know their week was inconsistent. `UNDERFUELLED` when they've been eating less than they need.

If the computed STATE is accurate — if the user reads it and thinks "yes, that's right" — the system has demonstrated intelligence, not just accuracy. This is the layer that creates durable retention.

**The trust failure mode:**
If the computed STATE is wrong (e.g., shows `OPTIMISING` when the user knows they ate badly), trust collapses immediately. The STATE computation algorithm must be conservative in its claims — it is better to remain in `READING` or show `DRIFTING` than to show an optimistic state that the user knows is false.

---

## 11. Progressive Feature Reveal

Features do not unlock with notifications, badges, or "new feature available" banners. They appear when the underlying data exists to make them meaningful.

```
Day 0   Login + 3-screen setup
        READING state
        Command bar (food logging)
        TODAY zone — basic daily position
        LOG zone — entry list

Day 3   TRAINING section appears in TODAY zone
        (Silently — present on next app open after day 3)

Day 7   SIGNAL hero fully activates:
          STATE text (computed)
          DELTA line (7-day rolling vs. baseline)
          Waveform with meaningful bar heights
        First-time SIGNAL explanation (inline, one-time)
        Waveform day navigation becomes meaningful (7 bars of real data)

Day 7   EARLIER THIS WEEK section fully meaningful
        (7 days of history rows)

Day 14  Weekly SIGNAL Report available
        Sunday evening: appears in LOG zone as a card
        First notification permission prompt at this point:
        "Your first weekly SIGNAL report is ready.
         Allow notifications to receive these automatically?"

Day 30  Baseline recalibration happens silently
        (No user-visible notification — DELTA may shift slightly)
```

**What "silently" means:**

No toast. No banner. No "NEW" badge. The feature is simply there on next app open, in its correct position in the design, behaving as designed. If the user notices it, they explore. If they don't, they'll find it when it's relevant.

This is the Raycast model: features appear in context, not on a tour.

---

## 12. Workout Logging Introduction

Workout tracking is introduced through presence, not instruction.

**Day 3: First appearance**

The TRAINING section appears in TODAY zone for the first time:

```
TRAINING  ·  Not logged

→ Log your session to complete today's signal.
```

The AI instruction line ("→ Log your session...") is the only prompt. It is tappable — it focuses the command bar with "What did you train today?"

**The first workout log:**

User types "did legs today — squats, RDLs, leg press" and hits Return.

The system parses this and creates a training entry:
```
TRAINING  ·  Legs  ·  [time]

Squats  ·  RDLs  ·  Leg press
```

No set/rep/weight data is requested on first log. The session type and exercises are captured. Volume data comes with more specificity.

**Second workout log (next session):**

If the user types "squats 4×5 at 100kg, RDLs 3×8 at 80kg", the system captures full volume. The AI understands both precision and natural language.

Volume data (`Volume 14,200 kg · Progressive on 3 lifts`) appears only when the user provides it. Never inferred from exercise names alone.

**What is never said:**
- "Track your workouts to complete your SIGNAL!" (pressure)
- "You haven't logged a workout in 2 days." (shaming)
- "Add workouts for better results." (upsell framing)

The TRAINING section is visible. The consequence of logging (completes today's signal) is stated once. That is the entire prompt.

---

## 13. Onboarding Motion Philosophy

Onboarding screens use a different motion language than the operating product.

**Screen transitions:**
```
Advance: current screen fades out (opacity 1→0, LINEAR, 150ms)
         next screen fades in (opacity 0→1, LINEAR, 300ms)
         total: ~300ms perceived
```

Not a slide. Not a push. A fade. The content is considered, not swiped past.

**Within-screen reveals:**
```
Screen 1:
  0ms    Background (#08080D)
 80ms    NOURIQ wordmark — fade in, LINEAR, 150ms
300ms    Tagline — fade in, LINEAR, 200ms
600ms    Continue → — fade in, LINEAR, 150ms

Screen 2:
  0ms    Background
 80ms    Question — fade in, LINEAR, 150ms
200ms    Subtext — fade in, LINEAR, 150ms
300ms    Option cards — staggered 80ms each, fade in, LINEAR, 150ms each

Screen 3:
  0ms    Background
 80ms    Question — fade in
200ms    Subtext — fade in
300ms    Number input — fade in
500ms    Helper text — fade in
700ms    "Start logging →" — fade in
```

**Goal selection feedback:**

When a goal card is tapped:
- Selected card border transitions to INK-1 — QUICK (150ms), LINEAR
- Screen waits 300ms (lets the selection register)
- Auto-advances to screen 3

No bounce. No scale. The border shift is the selection signal.

**The product drop:**

Screen 3 → Home screen is a careful handoff:
- Screen 3 fades out (200ms)
- Home screen fades in (300ms)
- STATE text (`READING`) appears in the same position, at the same scale, as it will when `OPTIMISING` appears 7 days later
- The waveform stubs are already in position (zero height)

The user's first impression of the home screen should be: this is where the product lives. Not: this is a demo.

---

## 14. Copywriting Voice During Onboarding

The voice is the system speaking, not the brand speaking.

**The system speaks in declaratives:**
- "The system is beginning to learn." (not "We're getting ready to track your nutrition!")
- "This determines what SIGNAL watches for." (not "Help us personalize your experience")
- "We'll refine this as we learn your pattern." (not "You can always change this later!")
- "Baseline forming." (not "Only 4 more days until your personalized insights!")

**The system does not praise:**
- No "Great!" after goal selection
- No "Perfect!" after protein target
- No "You're all set!" transition
- No celebratory language at any point

**The system speaks in present tense:**
- "Baseline forming." — not "Your baseline will be established in 7 days."
- "Pattern emerging." — not "You're making progress!"
- "First signal read." — not "Congratulations, your SIGNAL is ready!"

**The system refers to itself as "the system":**
- "The system will refine this." — not "We'll refine this."
- "The system reads: OPTIMISING." — not "We think you're optimising!"

This creates subtle but perceptible distance from the brand. The user is interacting with an observational system, not a motivational coach. This matches the Bloomberg/instrument reference frame.

**Specific copy for each state:**

| Context | Copy | NOT this |
|---|---|---|
| Welcome screen | "The system is beginning to learn." | "Welcome to Nouriq!" |
| Goal subtext | "This determines what SIGNAL watches for." | "Help us understand your goals" |
| Protein target subtext | "We'll refine this as we learn your pattern. This is where we start." | "You can always change this in settings!" |
| Setup CTA | "Start logging →" | "Get started!" / "Let's go!" |
| First entry confirmation | "Entry logged · Baseline forming." | "Great first entry! 🎉" |
| READING state subtitle | "Day 3 · Pattern emerging" | "3 more days until your SIGNAL!" |
| SIGNAL first activation subtitle | "First signal read · 7 days observed" | "Your SIGNAL is here! 🎊" |
| SIGNAL explanation header | "WHAT THIS MEANS" | "Here's your SIGNAL explained!" |
| Explanation CTA | "Understood" | "Got it!" / "Continue!" / "Start using SIGNAL!" |

---

## 15. Data Requirements vs. Optional

**Required (setup cannot proceed without):**
- Goal selection (BUILD / LOSE / MAINTAIN) — required for STATE computation
- Protein target (pre-filled; can adjust but cannot be blank) — required for protein progress bar

**Required for SIGNAL to activate:**
- 3+ days of logged data — required for first STATE computation
- 7+ days of logged data — required for DELTA calculation and full waveform

**Optional (collected from behavior, not from questions):**
- Calorie baseline — observed from logging pattern, not entered
- Meal frequency — inferred from logging behavior
- Dietary restrictions — the AI handles any food type; no restriction setup needed
- Training frequency — observed from logged workouts

**Never asked:**
- Body weight, height, age
- Activity level or occupation
- TDEE or calorie target
- Whether they've tried fitness apps before

---

## 16. Churn Prevention During Calibration

The calibration period (days 1–6) is the highest-risk churn window. The user has not yet received the primary product value (SIGNAL). They are in the trough between setup and activation.

**Three forces that cause churn in this window:**

1. **"Nothing is happening"** — the app feels static, the READING state feels like a limitation
2. **"The AI was wrong"** — a bad food parse on day 1 destroys trust before it's established
3. **"I forgot to log"** — one missed day breaks the mental model of "building a pattern"

**Countermeasures:**

**Against "nothing is happening":**
- Every log entry visibly updates the waveform bar for today. The waveform filling is the visible progress signal.
- The AI instruction line changes daily based on data. The system is demonstrably active.
- "Pattern emerging" in the subtitle (days 4–6) confirms the system is processing, not waiting.

**Against bad parse:**
- Use `claude-sonnet-4-6` (not Haiku) for all food parsing. Accuracy is the product.
- Show the full structured result immediately — the user can assess accuracy without probing.
- If wrong: delete + re-log is fast. The entry slides off. No error state persists.

**Against missed days:**
- No "you missed a day" notification. No guilt. No broken streak.
- The waveform simply has no bar for the missed day. The shape still forms.
- READING state requires 3 days of data across any window — not 3 consecutive days.
- Missing day 3 doesn't restart the clock. The system accumulates, not resets.

**The narrative the system communicates:**

The calibration period is not "wait while we set up." It is "the system is reading your pattern." This distinction matters because:
- "Wait while we set up" implies the product hasn't started yet
- "The system is reading your pattern" implies the product started the moment they logged their first entry

Every waveform bar that populates is evidence that the reading is happening.

---

## 17. The Activation Milestone

**Definition:** A user is activated when they see their first SIGNAL STATE and recognize it as accurate.

**Proxy metric for analytics:** Day-7 log rate. Users who log on day 7 have almost certainly crossed the activation threshold. The correlation is strong because day 7 is when SIGNAL first activates — users who are present on day 7 receive the primary product value and retain at significantly higher rates.

**The moment of activation:**

The user opens the app on day 7 (or whenever the SIGNAL threshold is crossed). They see `OPTIMISING` (or whatever their state is) where `READING` used to be. They read the first-time explanation block. They tap "Understood."

After that tap, three things are true that weren't true before:
1. The system has named something about their behavior
2. The name is specific to their data, not generic
3. The system has demonstrated that it will update this read as their pattern changes

The user is now committed. The calibration period is over. They are not onboarding anymore — they are operating.

**What emotionally commits users:**

Not streaks. Not achievements. Not seeing a number go up.

The moment of recognition: **the system knows something true about me.**

This is the same mechanism that retains Oura users (when the Readiness score matches their subjective feeling of recovery) and WHOOP users (when the recovery percentage explains why a workout felt hard). The system's intelligence is legible in their own experience.

For Nouriq: `UNDERFUELLED` appears during a week the user knew they were eating too little. `DRIFTING` appears during a week they know was inconsistent. `OPTIMISING` appears during a week they felt in control.

If the system is right, the user believes. If the system is right twice, the user trusts. If it's right for 4 weeks, the user cannot imagine going back to a simpler app.

---

## 18. Activation System Reference

```
Day 0    Setup (3 screens)
         First log → Trust Moment 1 (AI accuracy)
         READING state active

Day 1    Waveform bar 1 visible
         TODAY zone functional

Day 2    Second waveform bar
         AI instruction begins referencing personal data → Trust Moment 2
         EARLIER THIS WEEK appears with yesterday

Day 3    TRAINING section appears in TODAY zone (passive)
         "Pattern forming" visible in waveform data

Day 4–6  Waveform fills
         Day 5–6: Subtitle shifts to "Pattern emerging"

Day 7    SIGNAL activates
         STATE computed and displayed
         DELTA line appears
         First-time explanation block (inline, one-time)
         → Trust Moment 3 (system names their pattern accurately)
         ACTIVATION

Day 14   Weekly SIGNAL report appears in LOG zone (Sunday)
         First notification permission prompt

Day 30   Baseline recalibrated (silent)
         DELTA may shift — the system acknowledges this is intentional
```

---

## 19. Re-onboarding (Goal Change)

Settings sheet → "Change goal" → goal screen reappears → protein target resets to default for new goal → READING state for 3 days while new baseline forms.

No confirmation modal. No "are you sure?" No progress lost. Immediate.

The existing waveform history is preserved — the system knows what the old pattern looked like. The new baseline forms against the new goal.

---

*This file defines the v1.1 onboarding implementation target.*
*Update when implementation diverges from spec.*
*Reference: WHOOP setup flow, Oura ring calibration, Linear first-project flow, Arc Browser profile setup.*
