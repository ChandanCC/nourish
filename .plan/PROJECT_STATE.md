# Project State

**This file answers: "where are we right now?"**

Last updated: 2026-05-07
Current version: v1.0 (core loop + design token system complete)
Next milestone: v1.1 — home screen redesign + SIGNAL + onboarding

---

## Quick Status

```
Core loop (log food → AI parse → save → display)    ✅ DONE
Google OAuth + JWT auth                              ✅ DONE
Backend on AWS Lambda                                ✅ DONE
Frontend on S3 + CloudFront                          ✅ DONE
.plan/ product OS fully documented                  ✅ DONE
Backend architecture fully specified                ✅ DONE  ← D-020/D-023
Design token CSS variables in codebase              ✅ DONE  ← P0
EntryCard redesign (no banned colors, INK system)   ✅ DONE  ← P4

Home screen redesign (per spec)                     ⏳ PENDING  ← P1
SIGNAL hero + waveform                              ⏳ PENDING  ← P2/P3
STATE computation (AI-driven)                       ⏳ PENDING  ← P7
DELTA calculation (7-day rolling)                   ⏳ PENDING  ← P7
Motion system implementation                        ⏳ PENDING  ← P8
Onboarding flow (3-question)                        ⏳ PENDING  ← P9
Typography system applied (Syne/DM Mono)            ⏳ PENDING  ← P6
Command bar focused state                           ⏳ PENDING  ← P5
```

---

## Completed Systems

### Infrastructure
- **AWS Lambda + API Gateway** — backend deployed via SAM (`backend/template.yaml`)
- **S3 + CloudFront** — frontend deployed via CDK (`frontend/infra/`)
- **MongoDB Atlas M0** — connected, `logs` collection in use
- **npm workspaces** — root `package.json`, `npm run dev` starts both servers
- **CORS** — configured for CloudFront origin in production

### Authentication
- **Google OAuth 2.0** — `@react-oauth/google` frontend, `google-auth-library` backend
- **JWT** — 30-day tokens, `Authorization: Bearer` header pattern
- **`requireAuth` middleware** — protects all `/api/*` routes
- **Login page** — `frontend/src/pages/LoginPage.tsx`
- **Auth hooks** — `frontend/src/hooks/useAuth.ts`, `frontend/src/lib/auth.ts`

### AI Integration
- **Anthropic proxy** — `POST /api/analyse` on backend, never called from frontend
- **Food parsing** — natural language → structured macros via Claude
- **Model** — `claude-sonnet-4-6`
- **SYSTEM_PROMPT** — server-side in `backend/src/routes/analyse.ts`

### Data
- **Food log CRUD** — create, read, delete via `backend/src/routes/logs.ts`
- **User-scoped** — all queries filter by `userId` (Google `sub` claim)
- **Mongoose schema** — `backend/src/models/` (Log model)

### Frontend (Current State — Pre-Redesign)
- **Home screen** — functional but uses old design (pre-spec)
- **Tab navigation** — WEEK / day tabs exist but not per final spec
- **Weekly summary** — `frontend/src/components/WeeklySummary.tsx` (basic)
- **EntryCard** — displays macros with old color-coded system (BANNED colors present — needs redesign)
- **Color palette** — uses old hex values, not BG/INK/GOLD token system
- **Typography** — not yet using Syne + DM Mono system

---

## In Progress

Nothing formally in progress as of 2026-05-07. Next session picks up at v1.1 implementation.

---

## Pending (v1.1 Implementation Queue)

Priority order:

### P0 — Design Token Foundation ✅ COMPLETE
- [x] CSS custom properties in `frontend/src/index.css` (23 variables: BG, INK, GOLD, STATUS, WAVE, BAR)
- [x] Type scale utility classes in `@layer components`: `.text-display` `.text-title` `.text-data` `.text-body` `.text-label` `.text-micro`
- [x] Surface utility classes: `.surface-card` `.surface-sheet`
- [x] Tailwind config updated — token-mapped color names (bg-0, ink-0, gold, status-up, etc.)
- [x] All raw hex values removed from all components (zero `#ffc864`, `#0a0a0f`, `#e8e6e0`, old STATUS colors)
- [x] All PROHIBITED colors removed (#4ecdc4, #ffa552, #ff6b9d, #a78bfa)
- [x] STATUS_STYLES in `lib/nutrition.ts` updated to correct token values (#3ECFA2, #E8A640, #E85454)

### P1 — Home Screen Architecture
- [ ] Implement four-zone layout per `home-screen.md`
- [ ] SIGNAL hero zone (48% viewport, collapses on scroll)
- [ ] TODAY zone (three sub-sections: Daily Position, Training, Micros)
- [ ] LOG zone (entry list + history rows)
- [ ] Command bar (always fixed to bottom)
- [ ] Remove current tab-based navigation structure

### P2 — SIGNAL Hero Component
- [ ] Full hero state: wordmark + STATE text + subtitle + waveform + delta
- [ ] Collapsed strip: sticky, 44px, STATE + delta + scroll-to-top
- [ ] Scroll-triggered collapse behavior
- [ ] Per spec: `component-specs/signal-hero.md`

### P3 — Waveform Component
- [ ] 7-bar visualization, full-bleed
- [ ] Bar colors per WAVE token family (surplus/deficit/today)
- [ ] Baseline axis
- [ ] Day labels
- [ ] Tap → day selection → TODAY zone updates
- [ ] Per spec: `component-specs/waveform.md`

### P4 — EntryCard Redesign ✅ COMPLETE
- [x] All PROHIBITED macro colors removed
- [x] Collapsed state: name (BODY INK-0) + calories (DATA INK-0) + "P·C·F" summary (LABEL INK-2)
- [x] Expanded state: macro progress rows (INK fill, no color coding) + item breakdown + timestamp
- [x] Progress bars: `--bar-fill` (rgba 60%) track, no color coding per spec
- [x] Delete action: LABEL text in INK-3, no colored background, hover reveals STATUS-DOWN
- [x] Hover: border brightens to GOLD-1
- [x] Per spec: `component-specs/entry-card.md`

### P5 — Command Bar Focused State
- [ ] Gold border-top on focus (`rgba(237,184,74,0.25)`)
- [ ] Scrim behind bar on focus
- [ ] Gradient fade above bar (always present)
- [ ] Per spec: `component-specs/command-bar.md`

### P6 — Typography System
- [ ] Load Syne (700, 800) + DM Mono (400, 500) via Google Fonts
- [ ] Apply DISPLAY scale to STATE text
- [ ] Apply DATA scale to primary values
- [ ] Apply LABEL scale (9px, uppercase, tracked) to all labels
- [ ] Apply MICRO scale to timestamps and metadata
- [ ] Per spec: `design-tokens/typography.md`

### P7 — SIGNAL Computation
**Architecture fully designed in `engineering/intelligence-architecture.md`**

Tier 1 — Deterministic (backend):
- [ ] `computeDailyTotals(logs)` — calorie + macro sums per day
- [ ] `computeDelta(avg7d, baseline)` — percentage deviation
- [ ] `checkReadingTrigger(daysLogged)` — hard rule: < 3 days → READING
- [ ] `checkUnderfuelledTrigger(avg5d, baseline, daysLogged)` — hard rule

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
- [ ] Per spec: `motion-system.md`

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

These questions are open. Do not implement decisions around them without explicitly resolving first:

| ID | Question | Context | Blocking |
|---|---|---|---|
| U-001 | Training section: manual log only or skip in v1.1? | Per onboarding spec: training section appears day 3, accepts natural language workout log. Full set/rep/weight UI is separate. Does v1.1 include the full workout sheet or just the text-log path? | P1 home screen, P9 onboarding |
| U-002 | Baseline calorie computation: AI-computed or formula (Mifflin-St Jeor) for initial value? | First 7 days before pattern is established — what does DELTA show? | P7 SIGNAL |
| U-003 | Rate limiting on `/api/analyse`: implement in v1.1 or defer? | Defined in `engineering/ai-behavior.md` as "v1.1", but adds complexity | P4/P7 |
| U-004 | SIGNAL computation frequency: on every log, once daily (midnight), or on demand? | Affects UX and backend cost | P7 SIGNAL |
| U-005 | Progressive overload detection: does it ship with v1.1 training or deferred? | Training zone shows "Progressive on N lifts" per spec but detection is not implemented | U-001 dependent |

---

## Technical Debt

| Item | Where | Impact | Priority |
|---|---|---|---|
| Old macro colors in EntryCard | `frontend/src/components/` | Violates design system | HIGH — fix in P4 |
| Raw hex values throughout codebase | All components | Can't update design tokens centrally | HIGH — fix in P0 |
| No CSS custom property system | `index.css` | Every token change requires grep-and-replace | HIGH — fix in P0 |
| No rate limiting on `/api/analyse` | `backend/src/routes/analyse.ts` | Cost risk at scale | MEDIUM — fix in v1.1 |
| No input validation on log entries | `backend/src/routes/logs.ts` | Accepts any shape; no Zod/Joi | MEDIUM |
| localStorage JWT with no expiry check | `frontend/src/lib/auth.ts` | 30-day tokens not validated on client side | LOW — low risk in v1.0 |
| MongoDB Atlas unrestricted network access | Atlas config | Security; not critical at current scale | LOW |
| No test coverage | Entire codebase | Regressions invisible | LOW — defer until v1.1 ships |

---

## Environment State

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

Credentials stored in `backend/.env` and `frontend/.env.local`. Neither is committed. See `backend/.env.example` for required keys.

---

*Update this file after every significant implementation session.*
*"significant" = a P0–P9 item above is completed, or technical debt changes.*
