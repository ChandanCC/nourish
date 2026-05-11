# Project State

**This file answers: "where exactly are we right now?"**

Last updated: 2026-05-11
Current version: v1.2 (full home screen + SIGNAL + onboarding + micros pipeline live)
Next milestone: v1.3 — training log, weekly report card, polish pass

---

## NEXT ACTION

**Stabilisation + QA before next feature.** Core loop, SIGNAL, onboarding, macros, and micros are all live. Run a full manual test of the golden path before adding new features. Resolve U-001 (training section scope) to unblock the Training sub-section in TODAY zone.

Before beginning new feature work: read `governance/IMPLEMENTATION_REVIEW_CHECKLIST.md` and `governance/SCOPE_DISCIPLINE.md`.

---

## Quick Status

```
Core loop (log food → AI parse → save → display)    ✅ DONE
Google OAuth + JWT auth                              ✅ DONE
Backend on AWS Lambda                                ✅ DONE
Frontend on S3 + CloudFront                          ✅ DONE
Design token CSS variables in codebase              ✅ DONE  ← P0
EntryCard redesign (no banned colors, INK system)   ✅ DONE  ← P4
Home screen four-zone layout                        ✅ DONE  ← P1
SIGNAL hero + waveform (15-day)                     ✅ DONE  ← P2/P3
Command bar (fixed bottom, focused state)           ✅ DONE  ← P5
Typography system (Syne + DM Mono, 6 sizes)         ✅ DONE  ← P6
SIGNAL computation (AI synthesis via Gemini)        ✅ DONE  ← P7
Motion system (entry arrival, count-up, bar fill)   ✅ DONE  ← P8
Onboarding flow (3-step: welcome→goal→protein)      ✅ DONE  ← P9
Personal food memory + confidence taxonomy          ✅ DONE
Macro targets derived from goal + protein target    ✅ DONE
Expandable macro panel (tap calories → all macros)  ✅ DONE
Micronutrients pipeline (8 micros, end-to-end)      ✅ DONE
MicroGrid component (expandable, status colors)     ✅ DONE
Status colors on all macro + micro progress bars    ✅ DONE
Entry edit (inline, PATCH /api/logs/:id)            ✅ DONE
rawInput display in EntryCard expanded panel        ✅ DONE
Rate limiting on /api/analyse                       ✅ DONE
Zod input validation on all routes                  ✅ DONE

Training log (text or structured)                   ⏳ PENDING ← blocked U-001
Weekly report card                                  ⏳ PENDING
First-time SIGNAL explanation block                 ✅ DONE (one-time, localStorage dismiss)
Notification permission prompt (day 14)             ⏳ PENDING
Test coverage                                       ⏳ DEFERRED
```

---

## Completed Systems (Summary)

**Infrastructure:** Lambda + API Gateway (SAM), S3 + CloudFront (CDK), MongoDB Atlas M0, npm workspaces.

**Auth:** Google OAuth 2.0 (`@react-oauth/google`), JWT 30-day tokens, `requireAuth` middleware, `LoginPage.tsx`.

**Core loop:** `POST /api/analyse` → Gemini 2.5 Flash food parsing → `POST /api/logs` → MongoDB → home screen via `GET /api/home`.

**Personal food memory:** Per-user `PersonalFoodMemory` collection. `normalizeInput()` → lookup (confidence=`recalled`) → AI parse on miss → store. Confidence taxonomy: `recalled | estimated | low_confidence | matched | verified | user_corrected`. Hit count + lastUsedAt tracked.

**AI provider:** Gemini 2.5 Flash via `@google/generative-ai`. Provider abstraction (`getMealParsingProvider` / `getSignalSynthesisProvider`). `thinkingBudget: 0` to prevent token budget exhaustion. `maxTokens: 1024` for multi-item meals.

**Macro targets:** Computed from `user.goal + user.proteinTarget` in home route. No new user input. Ratios: muscle_gain=30% protein, fat_loss=35%, maintenance=28%. Carbs = remaining calories. Passed to frontend as `today.targets`.

**Micros pipeline:** 8 micronutrients (iron, calcium, vitaminD, B12, magnesium, zinc, potassium, sodium) extracted by Gemini per entry, stored on `FoodEntry`, summed in `DayAggregate`, returned in `home.today.micros`. `isEstimated` flag = any entry confidence not `recalled` or `user_corrected`.

**SIGNAL:** `GET /api/signal/recompute` (POST) → 3-tier: deterministic rules → statistical summary → Gemini synthesis → `{ state, subtitle, delta, aiInstruction }`. Stored as `SignalState` document, served from `GET /api/home`. Recomputed once after onboarding completes.

**Home screen:** Four-zone layout — SignalZone (waveform + SIGNAL state), TodayZone (macros expandable + training placeholder + micros expandable), LogZone (entry cards), HomeScreen (command bar fixed bottom). `GET /api/home` single payload for all zones.

**EntryCard:** Collapsed header (name + calories + macro summary). Expanded: rawInput in quotes, macro bars (status colored), parseNote, footer with EDIT + DELETE. Inline edit mode: name field + 5 numeric fields, SAVE/CANCEL. SAVE calls `PATCH /api/logs/:id` → `confidence: 'user_corrected'` → recomputes DayAggregate → updates PersonalFoodMemory.

**Status colors:** All macro and micro progress bars use `--status-up` (green ≥80%), `--status-mid` (yellow 40–80%), `--ink-3` (dim <40%), `--status-down` (red, over target). Value text in MacroRow and MicroGrid matches bar color.

**Design tokens:** 23 CSS custom properties in `frontend/src/index.css`. BG/INK/GOLD/STATUS families. Six type scale utility classes. Tailwind config updated.

**Onboarding:** `WelcomeScreen → GoalSelectionScreen → ProteinTargetScreen`. Goal + protein target saved via `PATCH /api/user/onboarding`. `homeData.onboardingComplete` gates the flow. First-time SIGNAL explanation shown once post-onboarding, dismissed to localStorage.

---

## Technical Debt

| Item | Where | Impact | Priority |
|---|---|---|---|
| Rate limiter `keyGeneratorIpFallback` warning | `backend/src/app.ts` | Cosmetic only — suppressed with `validate` flag | RESOLVED |
| Bad food memory entries (old data) | MongoDB `personalfoodmemories` | Stale pre-fix entries may recall wrong values | LOW — user can edit to correct |
| `extractSingleEntry()` defensive array handling | `backend/src/routes/analyse.ts` | Gemini sometimes returns array for multi-item input | MONITOR |
| localStorage JWT with no expiry check | `frontend/src/lib/auth.ts` | 30-day tokens not validated client-side | LOW |
| MongoDB Atlas unrestricted network access | Atlas config | Security; low risk at current scale | LOW |
| No test coverage | Entire codebase | Regressions invisible | DEFERRED |
| Hardcoded macro targets in EntryCard bars | `EntryCard.tsx` | Uses 160/200/55g — not user's actual targets | LOW |
| `isEstimated` flag on micros | `home.ts` | Any AI-parsed entry marks all micros as estimated | ACCEPTABLE |

---

## Unresolved Decisions

| ID | Question | Blocking |
|---|---|---|
| U-001 | Training section in TODAY zone: text-log only, or full workout sheet? | Training feature |
| U-002 | Baseline before 7 days: show DELTA as "—" or use Mifflin-St Jeor estimate? | SIGNAL quality |
| U-005 | Progressive overload detection: v1.3 or deferred? | U-001 dependent |

---

## Environment

```
Backend dev:   npm run dev (from /backend, port 4000)
Frontend dev:  npm run dev (from /frontend, port 5174)

AI model:      Google Gemini 2.5 Flash (via backend proxy)
Auth:          Google OAuth 2.0
MongoDB:       Atlas M0 (nourish-cluster.rsdtmqc.mongodb.net)

Backend prod:  AWS Lambda via SAM (us-east-1)
Frontend prod: S3 + CloudFront
```

Credentials in `backend/.env` and `frontend/.env.local`. Neither committed.

---

*Update after every significant session: mark completed items, add new debt, update NEXT ACTION.*
