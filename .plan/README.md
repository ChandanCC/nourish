# Nouriq Product OS

Single source of truth for all product, design, and engineering decisions.

**Philosophy:** Every decision has a reason. Every reason is documented. One file owns each concept.

→ For writing/update rules: `CONVENTIONS.md`
→ For session startup procedure: `SESSION_PROTOCOL.md`
→ For current implementation status: `PROJECT_STATE.md`

---

## Directory Map

```
.plan/
├── README.md                    ← This file. Navigation index.
├── CONSTITUTION.md              ← Highest-level product and engineering philosophy
├── PROJECT_STATE.md             ← Current status, next action, pending items
├── SESSION_PROTOCOL.md          ← How every Claude session must operate
├── IMPLEMENTATION_RULES.md      ← Practical implementation habits and rules
├── CONVENTIONS.md               ← Writing rules, canonical source table, update protocol
├── DECISION_LOG.md              ← Append-only log of all major decisions
│
├── architecture/                ← Immutable architectural truths
│   └── ARCHITECTURE_INVARIANTS.md  ← Product, intelligence, data, UX, engineering invariants
│
├── governance/                  ← Implementation discipline and drift prevention
│   ├── DRIFT_PREVENTION.md          ← Known drift patterns + recovery protocols
│   ├── IMPLEMENTATION_REVIEW_CHECKLIST.md  ← Mandatory pre-completion checklist
│   ├── SCOPE_DISCIPLINE.md          ← How tasks stay atomic
│   ├── AI_SESSION_RULES.md          ← Claude session rules
│   └── GOVERNANCE_SYSTEM_SUMMARY.md ← How all governance docs interact
│
├── product/                     ← What the product is and why it works that way
│   ├── core-principles.md       ← IMMUTABLE. Product constitution.
│   ├── signal-system.md         ← SIGNAL concept: STATE, DELTA, PATTERN
│   ├── signal-states.md         ← State machine: all states, triggers, transitions
│   ├── glossary.md              ← Canonical term definitions
│   ├── positioning.md           ← Brand, audience, competitive territory
│   ├── roadmap.md               ← Phase 1–3 feature plan
│   └── competitive-analysis.md  ← vs WHOOP, Oura, MFP, Healthify, Hevy
│
├── design-system/               ← How the product looks and moves
│   ├── visual-language.md       ← Design philosophy and system overview
│   ├── home-screen.md           ← Zone layout, hierarchy, scroll behavior
│   ├── motion-system.md         ← Animation contracts and easing library
│   ├── tokens/                  ← Design token values (canonical)
│   │   ├── colors.md            ← All color values, semantic roles, prohibited patterns
│   │   ├── typography.md        ← Type scale, weights, usage rules
│   │   ├── spacing.md           ← 4px base system, named tokens
│   │   ├── surfaces.md          ← Backgrounds, borders, elevation, radius
│   │   └── opacity.md           ← Opacity hierarchy and semantic roles
│   ├── VISUAL_GUARDRAILS.md     ← Prohibited patterns, emotional tone validation
│   └── components/              ← Per-component implementation specs
│       ├── signal-hero.md       ← Full hero zone: states, collapse, animation
│       ├── waveform.md          ← 7-day waveform: visual, interaction, data
│       ├── entry-card.md        ← EntryCard: hierarchy, layout, interaction
│       ├── command-bar.md       ← Bottom bar: states, focus, behavior
│       ├── macro-row.md         ← 4-column data row spec
│       └── progress-bar.md      ← Progress bar variants
│
├── engineering/                 ← How the system is built
│   ├── stack.md                 ← Current tech stack + constraints
│   ├── constraints.md           ← What engineering cannot change
│   ├── backend-architecture.md  ← Runtime: services, pipelines, jobs, scaling
│   ├── data-architecture.md     ← Entity model, schemas, event cascade
│   ├── intelligence-architecture.md  ← AI model: algorithms, tiers, thresholds
│   └── ai-behavior.md           ← Claude prompts, output contracts, trust rules
│
├── ux/                          ← How users experience the product
│   ├── interaction-contracts.md ← Rules governing all interactions
│   ├── onboarding-system.md     ← Complete onboarding + activation spec (v1.1)
│   └── empty-states.md          ← Absence philosophy + patterns
│
├── decisions/                   ← Full rationale for each major decision
│   ├── 001-monorepo-structure.md
│   ├── 002-google-auth-jwt.md
│   ├── 003-signal-not-score.md
│   ├── 004-two-fonts.md
│   ├── 005-anthropic-proxy.md
│   ├── 006-monochromatic-palette.md
│   └── 007-no-tab-navigation.md
│
└── future/                      ← Ideas not yet decided, for when they crystallize
    ├── ai-meal-suggestions.md
    ├── native-app.md
    ├── training-integration.md
    └── weekly-report-share.md
```

---

## Role-Based Reading Paths

**AI assistant starting a new session:**
`CLAUDE.md` → `PROJECT_STATE.md` → `SESSION_PROTOCOL.md` → `product/core-principles.md` → task-specific files

**Engineer implementing a feature:**
`engineering/stack.md` → `engineering/constraints.md` → relevant `design-system/components/` spec → `ux/interaction-contracts.md` → `design-system/motion-system.md`

**Engineer implementing SIGNAL:**
`product/signal-system.md` → `product/signal-states.md` → `engineering/intelligence-architecture.md` → `engineering/backend-architecture.md` → `engineering/ai-behavior.md`

**Designer joining the project:**
`product/core-principles.md` → `design-system/visual-language.md` → `product/signal-system.md` → `design-system/home-screen.md` → `design-system/tokens/` → `design-system/components/`

**Product discussion / new feature:**
`product/core-principles.md` → `product/positioning.md` → `product/roadmap.md` → `DECISION_LOG.md` (check for conflicts)

**Making a design decision:**
`product/core-principles.md` → `design-system/tokens/colors.md` → relevant component spec → `DECISION_LOG.md` → create ADR in `decisions/`

---

## Dependency Map

Which file to read for a given concept:

```
SIGNAL concept           → product/signal-system.md
State criteria/triggers  → product/signal-states.md
Any term definition      → product/glossary.md
Any color value          → design-system/tokens/colors.md
Any font/size rule       → design-system/tokens/typography.md
Any spacing value        → design-system/tokens/spacing.md
Any animation contract   → design-system/motion-system.md
Any surface treatment    → design-system/tokens/surfaces.md
Home screen layout       → design-system/home-screen.md
Component behavior       → design-system/components/<name>.md
Backend pipeline         → engineering/backend-architecture.md
AI prompts/contracts     → engineering/ai-behavior.md
State algorithm          → engineering/intelligence-architecture.md
Data schema              → engineering/data-architecture.md
Why a decision was made  → decisions/NNN-*.md or DECISION_LOG.md
```

---

## Canonical Source Rule

One file owns each concept. Cross-reference; never duplicate. Full table in `CONVENTIONS.md`.

---

*System initialized: 2026-05-07 | Refactored: 2026-05-07*
*Status: v1.1 — fully populated and normalized*
