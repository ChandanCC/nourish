# Project State

**This file answers: "where exactly are we right now?"**

Last updated: 2026-05-07
Current version: v1.0 (core loop + design token system + .plan/ refactor complete)
Next milestone: v1.1 — home screen redesign + SIGNAL + onboarding

---

## NEXT ACTION

**Start P1 — Home Screen Architecture.** P0 and P4 are done. The design token system is live. The next implementation task is the four-zone layout per `design-system/home-screen.md`. Resolve U-001 (training section scope) before building the TODAY zone.

Before beginning: read `governance/IMPLEMENTATION_REVIEW_CHECKLIST.md` and `governance/SCOPE_DISCIPLINE.md`.

---

## Quick Status

```
Core loop (log food → AI parse → save → display)    ✅ DONE
Google OAuth + JWT auth                              ✅ DONE
Backend on AWS Lambda                                ✅ DONE
Frontend on S3 + CloudFront                          ✅ DONE
Backend architecture fully specified                ✅ DONE  ← D-020/D-023
.plan/ documentation system + refactor              ✅ DONE
Governance system (invariants + guardrails)         ✅ DONE
Design token CSS variables in codebase              ✅ DONE  ← P0
EntryCard redesign (no banned colors, INK system)   ✅ DONE  ← P4

Home screen redesign (per spec)                     ⏳ NEXT  ← P1
SIGNAL hero + waveform                              ⏳ PENDING  ← P2/P3
Command bar focused state                           ⏳ PENDING  ← P5
Typography system applied (Syne/DM Mono)            ⏳ PENDING  ← P6
STATE computation (AI-driven)                       ⏳ PENDING  ← P7
DELTA calculation (7-day rolling)                   ⏳ PENDING  ← P7
Motion system implementation                        ⏳ PENDING  ← P8
Onboarding flow (3-question)                        ⏳ PENDING  ← P9
```

---

## Completed Systems (Summary)

**Infrastructure:** Lambda + API Gateway (SAM), S3 + CloudFront (CDK), MongoDB Atlas M0, npm workspaces.

**Auth:** Google OAuth 2.0 (`@react-oauth/google`), JWT 30-day tokens, `requireAuth` middleware, `LoginPage.tsx`.

**Core loop:** `POST /api/analyse` → Claude food parsing → `POST /api/logs` → MongoDB → home screen display.

**Design tokens:** 23 CSS custom properties in `frontend/src/index.css`. Six type scale classes. Tailwind config updated. All banned hex values removed from codebase. `STATUS_STYLES` updated to token values.

**EntryCard:** Full redesign per spec. Collapsed/expanded states. INK-only macro rows. `--bar-fill`/`--bar-track` progress bars. No color coding.

**Documentation system:** Complete `.plan/` product OS. Refactored to `design-system/`, `product/`, `future/` structure. Canonical source table. Glossary. SIGNAL state machine spec. Backend architecture doc. Intelligence architecture doc. Data architecture doc.

---

## Pending (v1.1 Implementation Queue)

Priority order. Tackle P1 first. P2/P3 require P1 layout to exist. P7 is backend — can run in parallel with P2/P3.

### P1 — Home Screen Architecture ← START HERE
- [ ] Implement four-zone layout per `design-system/home-screen.md`
- [ ] SIGNAL hero zone (48% viewport, collapses on scroll)
- [ ] TODAY zone (three sub-sections: Daily Position, Training, Micros)
- [ ] LOG zone (entry list + history rows)
- [ ] Command bar (always fixed to bottom)
- [ ] Remove current tab-based navigation structure
- **Blocked by:** Resolve U-001 before building Training sub-section

### P2 — SIGNAL Hero Component
- [ ] Full hero state: wordmark + STATE text + subtitle + waveform + delta
- [ ] Collapsed strip: sticky, 44px, STATE + delta + scroll-to-top
- [ ] Scroll-triggered collapse behavior
- [ ] Per spec: `design-system/components/signal-hero.md`

### P3 — Waveform Component
- [ ] 7-bar visualization, full-bleed
- [ ] Bar colors per WAVE token family (surplus/deficit/today)
- [ ] Baseline axis + day labels
- [ ] Tap → day selection → TODAY zone updates
- [ ] Per spec: `design-system/components/waveform.md`

### P4 — EntryCard Redesign ✅ COMPLETE

### P5 — Command Bar Focused State
- [ ] Gold border-top on focus (`rgba(237,184,74,0.25)`)
- [ ] Scrim behind bar on focus
- [ ] Gradient fade above bar (always present)
- [ ] Per spec: `design-system/components/command-bar.md`

### P6 — Typography System
- [ ] Load Syne (700, 800) + DM Mono (400, 500) via Google Fonts
- [ ] Apply DISPLAY scale to STATE text
- [ ] Apply DATA scale to primary values
- [ ] Apply LABEL scale (9px, uppercase, tracked) to all labels
- [ ] Apply MICRO scale to timestamps and metadata
- [ ] Per spec: `design-system/tokens/typography.md`

### P7 — SIGNAL Computation
**Architecture fully designed in `engineering/intelligence-architecture.md`**
**State machine fully specified in `product/signal-states.md`**

Tier 1 — Deterministic (backend):
- [ ] `computeDailyTotals(logs)` — calorie + macro sums per day
- [ ] `computeDelta(avg7d, baseline)` — percentage deviation
- [ ] `checkReadingTrigger(daysLogged)` — hard rule: < 3 days → READING
- [ ] `checkUnderfuelledTrigger(avg5d, baseline, daysLogged)` — hard rule
- **Blocked by:** Resolve U-002 (baseline initial value) and U-004 (recompute frequency)

Tier 2 — Statistical (backend):
- [ ] `computeBaseline(allLoggedDays)` — weighted median, outlier suppression
- [ ] `computeCV(calories7d)` — coefficient of variation
- [ ] `computePatternSlope(calories7d)` — linear regression
- [ ] `computeConfidenceScore(summary)` — composite score 0–100
- [ ] `qualifyStateCandidates(summary)` — pre-screening before AI call
- [ ] Baseline recalibration trigger (every 10 logged days)

Tier 3 — AI Synthesis (Claude):
- [ ] `computeSignalState(context)` — calls `/api/signal` with pre-computed summary
- [ ] Prompt as defined in `engineering/ai-behavior.md`
- [ ] Output contract: `{ state, pattern, ai_instruction, reasoning }`
- [ ] Backend validates: state in candidate_states, instruction ≤ 120 chars

Frontend:
- [ ] Display STATE with correct DISPLAY typography (32px Syne 800)
- [ ] Display DELTA line below waveform (BODY, INK-1)
- [ ] Display AI instruction line in TODAY zone (BODY, INK-1, → prefix)
- [ ] `READING` state subtitle with day counter

### P8 — Motion System (Core Animations)
- [ ] App open sequence (700ms staggered reveal)
- [ ] Entry card arrival animation (slide up from command bar)
- [ ] Number counting animation (EASE-DATA, 320ms)
- [ ] Progress bar fill on mount
- [ ] Waveform bar rise on mount (staggered 25ms)
- [ ] Card expand/collapse animation
- [ ] Per spec: `design-system/motion-system.md`

### P9 — Onboarding Flow
- [ ] Welcome screen (fade-in sequence, wordmark + tagline + continue)
- [ ] Goal screen (BUILD / LOSE / MAINTAIN, tap-to-select, auto-advance)
- [ ] Protein target screen (pre-filled by goal, adjustable, "Start logging →" CTA)
- [ ] Product drop: home screen in READING state, command bar pre-focused
- [ ] Command bar first-session placeholder: "Start with what you had this morning."
- [ ] "Entry logged · Baseline forming." micro-text (first 3 entries only, fades after 4s)
- [ ] READING state subtitle: "Day N · Baseline forming" (days 1–3) / "Pattern emerging" (days 4–6)
- [ ] Day 3: TRAINING section appears in TODAY zone (passive, no announcement)
- [ ] Day 7: SIGNAL activation — STATE replaces READING, DELTA line appears
- [ ] First-time SIGNAL explanation block (inline, between hero and TODAY, one-time)
- [ ] "Understood" dismissal button — removes explanation block permanently
- [ ] Day 14: Weekly report card + first notification permission prompt
- [ ] Per spec: `ux/onboarding-system.md`

---

## Unresolved Decisions

Do not implement anything blocked by these without resolving them first.

| ID | Question | Blocking |
|---|---|---|
| U-001 | Training section in v1.1: text-log only, or full workout sheet? | P1 (TODAY zone), P9 (onboarding day 3) |
| U-002 | Baseline before 7 days of data: show DELTA as "—" or use Mifflin-St Jeor estimate? | P7 SIGNAL |
| U-003 | Rate limiting on `/api/analyse`: implement in v1.1 or defer? | P7 SIGNAL |
| U-004 | SIGNAL recompute frequency: on every log, once daily, or on demand? | P7 SIGNAL |
| U-005 | Progressive overload detection: v1.1 or deferred? (depends on U-001) | U-001 dependent |

---

## Technical Debt

| Item | Where | Impact | Priority |
|---|---|---|---|
| No rate limiting on `/api/analyse` | `backend/src/routes/analyse.ts` | Cost risk at scale | MEDIUM — address in P7 |
| No input validation on log entries | `backend/src/routes/logs.ts` | Accepts any shape; no Zod/Joi | MEDIUM |
| localStorage JWT with no expiry check | `frontend/src/lib/auth.ts` | 30-day tokens not validated client-side | LOW |
| MongoDB Atlas unrestricted network access | Atlas config | Security; low risk at current scale | LOW |
| No test coverage | Entire codebase | Regressions invisible | LOW — defer until v1.1 ships |

---

## Environment

```
Backend dev:   npm run dev -w backend  (port 4000)
Frontend dev:  npm run dev -w frontend (port 5174)
Both:          npm run dev (root)

Backend prod:  AWS Lambda via SAM (us-east-1)
Frontend prod: S3 + CloudFront

MongoDB:       Atlas M0 (nourish-cluster.rsdtmqc.mongodb.net)
AI model:      claude-sonnet-4-6 (server-side proxy)
Auth:          Google OAuth 2.0 (Client ID in backend/.env)
```

Credentials in `backend/.env` and `frontend/.env.local`. Neither committed. See `backend/.env.example` for required keys.

---

*Update after every significant session: mark completed P-items, add new debt, update NEXT ACTION.*
