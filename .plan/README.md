# Nouriq Product OS

This directory is the single source of truth for all product, design, and engineering decisions for Nouriq.

**Philosophy:** Every decision has a reason. Every reason is documented. Nothing is duplicated.

---

## How to Use This System

- **Starting a new design discussion?** Read `core-principles.md` and the relevant component spec first.
- **Making a decision that contradicts something here?** Log it in `decisions/` with the reason and update the affected file.
- **Building a feature?** Read the relevant spec in `component-specs/` and `ux/interaction-contracts.md`.
- **Onboarding a new engineer or designer?** Start with `README.md` → `core-principles.md` → `visual-language.md` → `home-screen.md`.

---

## Directory Map

```
.plan/
├── README.md                    ← You are here. Master index.
├── PROJECT_STATE.md             ← WHERE ARE WE NOW — updated each session
├── SESSION_PROTOCOL.md          ← How Claude should operate in every session
├── DECISION_LOG.md              ← Append-only log of all major decisions
├── CONVENTIONS.md               ← How to write, update, and reference docs
├── core-principles.md           ← Immutable. The product's constitution.
├── visual-language.md           ← Overview of the full visual system
├── signal-system.md             ← SIGNAL hero: STATE, DELTA, PATTERN
├── home-screen.md               ← Home screen zones, hierarchy, scroll behavior
├── motion-system.md             ← Animation contracts and easing library
│
├── design-tokens/
│   ├── colors.md                ← Exact color values + semantic roles
│   ├── typography.md            ← Type scale, weights, usage rules
│   ├── spacing.md               ← 4px base system + named tokens
│   ├── surfaces.md              ← Backgrounds, borders, shadows
│   └── opacity.md               ← Opacity hierarchy + semantic roles
│
├── component-specs/
│   ├── signal-hero.md           ← Full hero zone spec
│   ├── entry-card.md            ← EntryCard: hierarchy, layout, interaction
│   ├── command-bar.md           ← Bottom command bar: states, behavior
│   ├── waveform.md              ← 7-day waveform: visual, interaction, data
│   ├── macro-row.md             ← 4-column data row spec
│   └── progress-bar.md         ← Progress bar variants
│
├── decisions/
│   ├── 001-monorepo-structure.md    ← npm workspaces decision
│   ├── 002-google-auth-jwt.md       ← Auth strategy
│   ├── 003-signal-not-score.md      ← Why SIGNAL is a state, not a number
│   ├── 004-two-fonts.md             ← Syne + DM Mono only
│   ├── 005-anthropic-proxy.md       ← All AI calls via backend
│   ├── 006-monochromatic-palette.md ← Single color family + prohibited colors
│   └── 007-no-tab-navigation.md     ← Single surface, no tab bar
│
├── future-ideas/
│   ├── ai-meal-suggestions.md
│   ├── training-integration.md
│   ├── native-app.md
│   └── weekly-report-share.md
│
├── product/
│   ├── positioning.md           ← Brand, audience, competitive territory
│   ├── roadmap.md               ← Phase 1–3 feature plan
│   └── competitive-analysis.md  ← vs WHOOP, Oura, MFP, Healthify, Hevy
│
├── engineering/
│   ├── stack.md                      ← Current tech stack + constraints
│   ├── constraints.md                ← What engineering cannot change
│   ├── ai-behavior.md                ← Claude API prompts + output contracts
│   ├── intelligence-architecture.md  ← Complete AI model: algorithms, thresholds, tiers
│   ├── data-architecture.md          ← Canonical entity model, schemas, event cascade
│   └── backend-architecture.md       ← Runtime: pipelines, jobs, AI orchestration, scaling
│
└── ux/
    ├── interaction-contracts.md  ← Rules governing all interactions
    ├── onboarding.md             ← Summary + redirect
    ├── onboarding-system.md      ← Complete onboarding & activation spec (v1.1)
    └── empty-states.md           ← Empty state philosophy + patterns
```

---

## Priority Reading by Role

**Designer joining the project:**
`core-principles.md` → `visual-language.md` → `signal-system.md` → `home-screen.md` → `design-tokens/` → `component-specs/`

**Engineer implementing a feature:**
`engineering/stack.md` → relevant `component-specs/` file → `ux/interaction-contracts.md` → `motion-system.md`

**Product discussion / new feature:**
`core-principles.md` → `product/positioning.md` → `product/roadmap.md` → `decisions/` (check for conflicts)

**AI assistant in a new session:**
`CLAUDE.md` (root) → `PROJECT_STATE.md` → `core-principles.md` → `signal-system.md` → `home-screen.md` → `visual-language.md` → relevant spec

---

## Version

System initialized: 2026-05-07
Last updated: 2026-05-07
Status: v1.0 — fully populated from founding design sessions
