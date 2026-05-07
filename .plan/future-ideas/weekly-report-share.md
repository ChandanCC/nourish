# Future Idea: Weekly SIGNAL Report — Shareable Card

**Status:** Deferred — report format defined, sharing not built
**Last updated:** 2026-05-07

---

## Current State

The Weekly SIGNAL Report format is fully specified in `signal-system.md#weekly-signal-report`. The report is generated every Sunday. The display format exists in the spec.

What is not built: making it shareable.

---

## Concept

The weekly report renders as a text card — a screenshot-worthy format designed to look good when shared to Instagram Stories, Twitter/X, or iMessage.

**Visual format:**
```
┌─────────────────────────────────────────────┐
│  NOURIQ                                     │
│                                             │
│  WEEK 18  ·  May 5–11, 2026                │
│                                             │
│  STATE HELD: OPTIMISING  (6 of 7 days)     │
│  AVG DELTA: −8% below baseline             │
│  PROTEIN: 91% adherence                    │
│  DAYS LOGGED: 7 of 7                       │
│                                             │
│  Consistent deficit with high protein      │
│  protection. Volume trending up on three   │
│  main lifts. Pattern is holding.           │
│                                             │
│  ONE CHANGE: Add 200 kcal on training      │
│  days only — deficit is slightly steep.    │
│                                             │
│  Next week: if pattern holds, transition   │
│  to CUTTING state is probable.             │
└─────────────────────────────────────────────┘
```

Dark background. Syne/DM Mono typography. Same visual language as the app.

---

## Why This Matters

Organic sharing of the weekly report is a low-cost growth mechanism. Seeing a SIGNAL report in someone's story creates curiosity ("what is this? what is OPTIMISING?") without requiring the app to have a social feature.

The report must be worth sharing — design quality matters as much as content. A poorly formatted share card would not be shared.

---

## Implementation Notes

- Render the weekly report card in a hidden off-screen div at fixed pixel dimensions (1080×1920 or 1080×1080)
- Use `html2canvas` or a server-side rendering approach (screenshot lambda) to generate a PNG
- Share via `navigator.share()` API (Web Share API) on mobile
- Fallback: download PNG for desktop users

---

## Design Constraints

- Must look identical to the app's visual language (not a custom "social" design)
- No app store badges, QR codes, or download CTAs on the share card itself — those are earned, not demanded
- The card should look good without a watermark too — quality is the marketing, not the logo
- User can optionally add their SIGNAL report to the share; they should never be pressured to share
