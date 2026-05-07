# .plan/ Refactor Audit

**Created:** 2026-05-07
**Purpose:** Pre-refactor analysis. Read before touching any files. Defines every change with reasoning and risk.

---

## Current Inventory

46 files total (excluding .DS_Store). 13,660+ lines across all docs.

```
Root (10 files)
  README.md          105L   Navigation index
  PROJECT_STATE.md   240L   Implementation tracker
  SESSION_PROTOCOL.md 183L  AI session rules
  CONVENTIONS.md     125L   Writing/update rules
  DECISION_LOG.md    383L   Append-only decision history
  core-principles.md 120L   Product constitution (immutable)
  visual-language.md 141L   Design system overview
  signal-system.md   149L   SIGNAL product spec
  home-screen.md     233L   Home screen layout + zones
  motion-system.md   197L   Animation contracts

design-tokens/ (5 files) — 676L total
component-specs/ (6 files) — 972L total
engineering/ (6 files)    — 3,227L total (3 large docs)
decisions/ (7 files)      — 432L total
product/ (3 files)        — 287L total
ux/ (4 files)             — 1,176L total
future-ideas/ (4 files)   — 222L total
```

---

## Finding 1 — Root Clutter: Content Files Mixed With Meta Files

**Severity: HIGH**

The `.plan/` root contains both meta-system files (README, PROJECT_STATE, CONVENTIONS) and content files (home-screen, motion-system, visual-language, signal-system, core-principles). The root should be navigation only.

**Content files that do not belong at root:**
- `core-principles.md` → belongs in `product/`
- `signal-system.md` → belongs in `product/`
- `visual-language.md` → belongs in `design-system/`
- `home-screen.md` → belongs in `design-system/`
- `motion-system.md` → belongs in `design-system/`

**Meta files that correctly live at root:**
- README.md ✓
- PROJECT_STATE.md ✓
- SESSION_PROTOCOL.md ✓
- CONVENTIONS.md ✓
- DECISION_LOG.md ✓

**Proposed action:** Create `design-system/` domain folder; move design files there. Move product philosophy files to `product/`.

**Risk:** ALL cross-references to these files break. Every file that says "→ See: visual-language.md" must be updated. Mitigated by doing a comprehensive search-and-replace.

---

## Finding 2 — Missing `design-system/` Domain Folder

**Severity: HIGH**

Design system content is fragmented across two root-level folders plus the root itself:

```
design-tokens/       ← token values (should be design-system/tokens/)
component-specs/     ← component contracts (should be design-system/components/)
visual-language.md   ← design overview (should be design-system/)
motion-system.md     ← animation (should be design-system/)
home-screen.md       ← layout architecture (should be design-system/)
```

A reader looking for "how does the design system work?" must know to look in three separate locations.

**Proposed action:** Create `design-system/` folder with subdirs `tokens/` and `components/`. Move all five above.

**Risk:** Same as Finding 1 — reference breakage. Manageable with comprehensive update pass.

---

## Finding 3 — Dual Decision System (Structural Confusion)

**Severity: MEDIUM**

Two parallel decision tracking systems exist:

| System | Location | Format | Current entries |
|---|---|---|---|
| Numbered ADRs | `decisions/001-007.md` | Full ADR format with Rationale, Consequences, Rejected Alternatives | D-001 to D-007 (design/architecture decisions) |
| Decision log | `DECISION_LOG.md` | Inline with date, reasoning, consequences | D-001 to D-023 (includes D-001 through D-007 BUT does not link to the ADR files) |

The problem: decisions 001–007 exist in BOTH systems. D-001 through D-023 exist only in DECISION_LOG.md. There is no structural relationship between them.

A reader wanting "why did we choose Claude as the AI provider?" must know to look in `decisions/005-anthropic-proxy.md` — the DECISION_LOG.md does not link there.

**Proposed action:**
- DECISION_LOG.md becomes a lightweight timeline index only. Each entry: date, ID, title, type, one-line summary, link to ADR file.
- decisions/ gets ADR files for ALL significant decisions (not just 001–007). Add files 008–023.
- The detailed reasoning lives exclusively in the ADR files.

**Risk:** Medium. Requires writing 16 new ADR files for D-008 through D-023. Reasoning already exists in DECISION_LOG.md — it's a reorganization, not a loss of information. However, some of these decisions (D-008 through D-013 for onboarding, D-014 through D-019 for intelligence) may not merit full ADR files — they are implementation decisions, not architectural ones.

**Revised proposed action (lower risk):**
- Add ADR files only for structural/architectural decisions: D-020 (Lambda topology), D-021 (sync/async boundary), D-022 (no Redis), D-023 (AI fallback). 
- DECISION_LOG.md stays as-is but gains direct links to all ADR files at the top.
- Add a "Decision Index" section to DECISION_LOG.md.

---

## Finding 4 — Genuine Content Duplication: App Open Sequence

**Severity: MEDIUM**

The app open sequence animation is fully specified in TWO files:

- `motion-system.md` lines 62–80: Complete sequence with timing
- `component-specs/signal-hero.md` lines 188–199: Near-identical content

The signal-hero.md version is shorter but covers the same sequence.

**Proposed action:** Remove the sequence from `signal-hero.md`. Replace with: `→ Full sequence: design-system/motion-system.md#app-open-sequence`

**Risk:** Low. The sequence is clearly owned by motion-system.md. The signal-hero.md reference is secondary.

---

## Finding 5 — Genuine Content Duplication: SIGNAL Hero Zone Layout

**Severity: LOW-MEDIUM**

Home screen zone 1 is described in two files:

- `home-screen.md` lines 52–90: Full state layout with spacing, collapsed strip
- `component-specs/signal-hero.md`: Full state layout with more implementation detail

home-screen.md is at the architectural level. signal-hero.md is at the component spec level. This is appropriate separation — different levels of detail, different audiences. The duplication is intentional hierarchy.

**Proposed action:** No merge. Add an explicit note in home-screen.md that the component spec is the implementation authority: "→ Implementation detail: component-specs/signal-hero.md (canonical)"

---

## Finding 6 — `ux/onboarding.md` Is a Stub With No Unique Value

**Severity: HIGH**

`ux/onboarding.md` (56 lines) is entirely a summary of and redirect to `ux/onboarding-system.md` (869 lines). It adds:
- A 3-screen summary (also in onboarding-system.md)
- An activation timeline (also in onboarding-system.md)
- A "What Never Appears" short list (also in onboarding-system.md)
- A "Re-onboarding" section (UNIQUE — not in onboarding-system.md)

The only unique content is the re-onboarding paragraph (4 lines). Everything else is redundant.

**Proposed action:** Move the re-onboarding section to `ux/onboarding-system.md`. Delete `ux/onboarding.md`.

**Risk:** Low. The stub's only purpose is redirecting readers to onboarding-system.md, which will remain.

---

## Finding 7 — `design-tokens/opacity.md` Largely Overlaps With `colors.md`

**Severity: LOW**

`design-tokens/opacity.md` (106 lines) contains:
- INK opacity hierarchy — also in `colors.md#ink-family`
- GOLD opacity hierarchy — also in `colors.md#brand-accent`
- STATUS opacity — partially in `colors.md#status-system`
- Waveform opacity — also in `colors.md#waveform-colors`
- UI state opacity (disabled, focused, pressed) — UNIQUE
- Scrim spec — also in `design-tokens/surfaces.md`

The unique content: UI state opacity levels (disabled=0.35, pressed=0.75, etc.). Everything else duplicates colors.md or surfaces.md.

**Proposed action:** Add the unique UI state opacity content to `design-tokens/surfaces.md` (as an "Interactive States" section). Delete `opacity.md`. Update colors.md to clarify opacity rules are exhaustive there.

**Risk:** Low. The content overlap is genuine; the unique content (4 lines) migrates cleanly.

---

## Finding 8 — `product/competitive-analysis.md` Overlaps With `positioning.md`

**Severity: LOW**

`positioning.md` has a "Competitive Positioning" table (7 rows) that partially duplicates the per-competitor analysis in `competitive-analysis.md`.

Additionally, `competitive-analysis.md` has a "Design Reference Points" section that arguably belongs in `design-system/visual-language.md` (the products used as design references: Linear, Raycast, WHOOP, Oura, Bloomberg Terminal).

**Proposed action:** 
- Remove the brief competitive table from `positioning.md` and replace with a reference link to competitive-analysis.md.
- Move "Design Reference Points" section from competitive-analysis.md to visual-language.md (it belongs with the visual reference frame).

**Risk:** Very low. Clean-up of cross-content.

---

## Finding 9 — Missing: Glossary

**Severity: HIGH**

Terms used throughout the system without formal definition:
- SIGNAL, STATE, DELTA, PATTERN — used everywhere, defined partially in signal-system.md
- READING, OPTIMISING, BUILDING, CUTTING, UNDERFUELLED, PROTEIN-LIMITED, DRIFTING — defined in signal-system.md but not centrally
- DayAggregate, BaselineSnapshot, SignalState — engineering terms
- GoalProfile, FoodEntry, TrainingSession — entity terms
- INK, BG, GOLD, STATUS — design token terms (defined in colors.md)
- Tier 1/2/3 — intelligence architecture layers
- EASE-ARRIVE, EASE-DEPART, EASE-DATA — motion terms
- DISPLAY, TITLE, DATA, BODY, LABEL, MICRO — typography scale names

An AI session starting fresh has to discover these from context. A human engineer joining has to piece them together from multiple files.

**Proposed action:** Create `product/glossary.md` with formal definitions for all key terms. Each term: one-sentence definition + canonical source file.

**Risk:** None. Additive only.

---

## Finding 10 — Missing: SIGNAL State Machine

**Severity: MEDIUM**

The SIGNAL state transition rules are distributed:
- State definitions: `signal-system.md`
- Transition triggers: `engineering/intelligence-architecture.md`
- Onboarding arc: `ux/onboarding-system.md`

No single document describes the state machine: which transitions are possible, what triggers each, how many days are required, what makes a state "sticky."

**Proposed action:** Create `product/signal-states.md` — a compact state machine spec. All state labels, their entry conditions, exit conditions, and display rules. References the detailed computation in intelligence-architecture.md.

**Risk:** None. Additive. Danger is that it duplicates signal-system.md — keep it focused on the machine (transitions, conditions) vs. signal-system.md's focus on the product concept.

---

## Finding 11 — Stale Content in Multiple Files

**Severity: MEDIUM**

Several files contain content that no longer reflects reality after the P0/P4 implementation:

| File | Stale content | Reality |
|---|---|---|
| `product/roadmap.md` | "Design token system not yet wired" in v1.0 | Done in P0 |
| `product/roadmap.md` | "EntryCard redesign not yet included" | Done in P4 |
| `engineering/stack.md` | "CSS variables... not yet fully wired in v1.0; used as plain hex values currently" | Fixed |
| `PROJECT_STATE.md` | Implementation queue doesn't fully reflect onboarding.md merge or new docs | Needs refresh |
| `SESSION_PROTOCOL.md` | Loading path for "backend/AI" doesn't include `backend-architecture.md` or `data-architecture.md` | Missing |

**Proposed action:** Update all stale content as part of the refactor.

---

## Finding 12 — Missing: `SESSION_PROTOCOL.md` Loading Paths Incomplete

**Severity: MEDIUM**

The SESSION_PROTOCOL.md task-specific loading paths are incomplete:

```
If working on backend/AI:  .plan/engineering/stack.md
                            .plan/engineering/ai-behavior.md
                            .plan/engineering/constraints.md
```

Missing from this path:
- `engineering/backend-architecture.md` (wrote this session — biggest engineering doc)
- `engineering/data-architecture.md` (wrote last session — entity model)
- `engineering/intelligence-architecture.md` (wrote last session — AI model)

**Proposed action:** Update SESSION_PROTOCOL.md loading paths to include all engineering docs.

---

## Finding 13 — Missing: Canonical Source Rules

**Severity: MEDIUM**

CONVENTIONS.md says "No duplicate knowledge" but doesn't define which file is authoritative for each concept. When two files touch the same concept (home-screen.md and signal-hero.md both describe the hero zone), a reader can't tell which to trust.

**Proposed action:** Add a "Canonical Source Table" to SESSION_PROTOCOL.md or CONVENTIONS.md. For each major concept, one authoritative file.

---

## Finding 14 — `future-ideas/` Naming

**Severity: LOW**

`future-ideas/` folder is fine but the files inside have inconsistent naming:
- `ai-meal-suggestions.md`
- `native-app.md`
- `training-integration.md`
- `weekly-report-share.md`

These are all good, well-formed files. No structural issue. Minor: the folder could be `future/` to match proposed naming (shorter).

**Proposed action:** Rename `future-ideas/` to `future/` as part of restructure. Update references.

---

## Proposed Changes Summary

### Execute (high value, clear benefit)

| Change | Risk | Complexity |
|---|---|---|
| Create `design-system/` folder; move tokens/ and components/ | Medium (references) | High |
| Move content files from root to domain folders | Medium (references) | High |
| Delete `ux/onboarding.md` stub (merge unique content) | Low | Low |
| Merge `design-tokens/opacity.md` into surfaces.md + colors.md | Low | Low |
| Remove duplicate app open sequence from signal-hero.md | Very low | Very low |
| Move "Design References" from competitive-analysis.md to visual-language.md | Very low | Very low |
| Update stale content (roadmap.md, stack.md, SESSION_PROTOCOL.md) | None | Low |
| Create `product/glossary.md` | None | Medium |
| Create `product/signal-states.md` | None | Medium |
| Update DECISION_LOG.md with index and links | None | Low |
| Add canonical source table to CONVENTIONS.md | None | Low |
| Add ADR files for D-020 through D-023 | None | Medium |
| Create comprehensive README index | None | Medium |

### Do Not Execute (too aggressive / too low value)

| Rejected Change | Reason |
|---|---|
| Full flattening of decisions into DECISION_LOG.md | Loss of ADR detail format |
| Merging all design-token files into one | Loss of per-domain navigability |
| Creating api-contracts.md separate from backend-architecture.md | Duplication risk; backend-architecture.md already has the contracts |
| Extracting all roadmap content from PROJECT_STATE.md | These serve different purposes |

---

## Final Proposed Structure

```
.plan/
├── README.md                        ← Navigation / master index (update)
├── PROJECT_STATE.md                 ← Implementation tracker (update)
├── SESSION_PROTOCOL.md              ← AI session protocol (update)
├── CONVENTIONS.md                   ← Writing rules + canonical source table (update)
├── DECISION_LOG.md                  ← Decision timeline index (update)
│
├── product/                         ← WHAT the product is and WHY
│   ├── core-principles.md           ← (move from root)
│   ├── signal-system.md             ← (move from root)
│   ├── signal-states.md             ← NEW: state machine spec
│   ├── glossary.md                  ← NEW: key term definitions
│   ├── positioning.md               ← (update: remove competitive table)
│   ├── roadmap.md                   ← (update: mark P0/P4 done)
│   └── competitive-analysis.md      ← (update: remove design references section)
│
├── design-system/                   ← HOW the product looks and moves (NEW folder)
│   ├── visual-language.md           ← (move from root; update: add design references)
│   ├── home-screen.md               ← (move from root)
│   ├── motion-system.md             ← (move from root)
│   ├── tokens/                      ← (was design-tokens/)
│   │   ├── colors.md                ← (update: absorb unique opacity content)
│   │   ├── typography.md
│   │   ├── spacing.md
│   │   └── surfaces.md              ← (update: absorb UI state opacity)
│   │   [opacity.md deleted — merged into colors.md + surfaces.md]
│   └── components/                  ← (was component-specs/)
│       ├── signal-hero.md           ← (update: remove duplicate app open sequence)
│       ├── waveform.md
│       ├── entry-card.md
│       ├── command-bar.md
│       ├── macro-row.md
│       └── progress-bar.md
│
├── ux/                              ← HOW the product behaves
│   ├── interaction-contracts.md
│   ├── onboarding-system.md         ← (update: absorb re-onboarding from onboarding.md)
│   └── empty-states.md
│   [onboarding.md deleted — merged into onboarding-system.md]
│
├── engineering/                     ← HOW the product is built
│   ├── stack.md                     ← (update: reflect P0 done, CSS tokens live)
│   ├── constraints.md
│   ├── backend-architecture.md
│   ├── data-architecture.md
│   └── intelligence-architecture.md
│   └── ai-behavior.md
│
├── decisions/                       ← WHY we chose this, not that
│   ├── 001-monorepo-structure.md
│   ├── 002-google-auth-jwt.md
│   ├── 003-signal-not-score.md
│   ├── 004-two-fonts.md
│   ├── 005-anthropic-proxy.md
│   ├── 006-monochromatic-palette.md
│   ├── 007-no-tab-navigation.md
│   ├── 008-design-token-system.md   ← NEW (D-008 from log)
│   ├── 009-lambda-two-function-topology.md ← NEW (D-020)
│   ├── 010-sync-async-boundary.md   ← NEW (D-021)
│   ├── 011-no-redis-precomputed-cache.md ← NEW (D-022)
│   └── 012-deterministic-ai-fallback.md ← NEW (D-023)
│
└── future/                          ← DEFERRED ideas (was future-ideas/)
    ├── ai-meal-suggestions.md
    ├── native-app.md
    ├── training-integration.md
    └── weekly-report-share.md
```

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Broken cross-references after file moves | High | Medium | Comprehensive find-and-replace pass after all moves |
| CLAUDE.md references break | High | High | Update CLAUDE.md loading paths last |
| SESSION_PROTOCOL.md paths become stale | High | High | Update SESSION_PROTOCOL.md as part of Phase 6 |
| Future sessions confused by structure change | Low | Medium | README must be updated before commit |
| Content lost in merge operations | Low | High | Read before delete; verify unique content is absorbed |
| opacity.md unique content missed | Medium | Low | Read opacity.md in full before deleting |

---

*Phase 1 complete. Proceed to Phase 2 — execute in order, updating cross-references as files move.*
