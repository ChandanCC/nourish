# Constitution

**Version:** 1.0
**Date:** 2026-05-07

---

## What Nouriq Is

A precision instrument for the body.

It takes what you log, computes what it means, and tells you what pattern you are operating in. It does not celebrate. It does not warn. It does not coach. It reads.

The reference frame is: Bloomberg Terminal. Aircraft glass cockpit. The instrument that a professional uses not because it is enjoyable but because it is accurate.

---

## What Nouriq Refuses to Become

**A fitness motivator.** Nouriq does not congratulate you for a caloric surplus or warn you against a deficit. It names the pattern. What you do with that information is yours.

**A habit-former.** No streaks, no badges, no "day N" progress bars, no notifications designed to trigger re-engagement. The product is useful when you use it. It makes no demands when you don't.

**A wellness brand.** The language is operational, not aspirational. "Protein averaged 48g below target" is a sentence Nouriq writes. "You're on a journey to a better you" is not.

**A data dump.** Information density without hierarchy is noise. The home screen shows exactly three things: what pattern you are in, how today is going, what you logged. Nothing else unless you look for it.

**A social product.** No feeds, no sharing, no comparisons. Your pattern is yours.

---

## The Quality Bar

**Accuracy is the product.** If the AI parses food incorrectly, the product has failed. If SIGNAL labels a pattern inaccurately, the product has failed. No amount of good design compensates for a system that tells you the wrong thing.

**Speed is a feature.** The time between intent and logged entry is a direct measure of product quality. Logging must be instant. SIGNAL must load immediately. Every millisecond of unnecessary latency is a reason to stop using the product.

**Calm is intentional.** The home screen does not compete for attention. It presents data. The user reads it or they don't. The product does not try harder to be noticed.

**Restraint is the discipline.** Every addition to the UI, every new AI behavior, every new data point displayed must answer: does this belong on an instrument panel? If the answer is "maybe," the answer is no.

---

## The Emotional Experience the Product Protects

A user opens Nouriq after a week of disciplined eating. The screen shows: `CUTTING · Day 5 · Pattern: consistent`. They feel recognized, not rewarded. The system has named something true.

A user opens Nouriq after a chaotic week. The screen shows: `DRIFTING · Pattern: irregular`. They feel understood, not judged. The system is not disappointed in them.

A user opens Nouriq on day 7 for the first time with a full week of logs. READING becomes `OPTIMISING`. They feel seen.

This is what the product protects: the moment of accurate recognition. Not the moment of completing a streak. Not the moment of hitting a goal. The moment when a system that has been silently watching names something true about your behavior.

That moment only works if the system has been silent the rest of the time.

---

## Engineering Philosophy

**Build what you can prove you need.** Feature creep is the principal cause of product incoherence. Every addition narrows what the product is. Add only what the core loop requires.

**Determinism before intelligence.** If a rule can handle it, use a rule. AI synthesis is the final step of computation, not the first. Deterministic systems are auditable, fast, and free.

**The ledger is sacred.** Raw events are immutable. Everything else is derived. A system that corrupts its own history cannot be trusted.

**Operational calmness is a feature.** Two Lambda functions. One MongoDB cluster. No Redis. No message broker at early scale. The complexity budget is spent on the product, not the infrastructure.

**Defer until forced.** Don't extract a service until the monolith is the bottleneck. Don't add a cache until latency is measured. Don't build a feature until it has been deliberately decided to be in scope.

---

## How to Make Decisions

Read `product/core-principles.md`. If the decision contradicts a principle there, the principle wins.

If the principle is wrong, change the principle explicitly — update `product/core-principles.md`, log the change in `DECISION_LOG.md`, create a `decisions/` ADR. Do not silently deviate.

If the decision involves a new component, there is a spec for how it should behave. Read the spec before implementing. If the spec is wrong, update the spec before implementing differently.

If the decision involves architecture, read `architecture/ARCHITECTURE_INVARIANTS.md`. If the decision violates an invariant, that is a significant event — not a blocker, but a flag that requires explicit acknowledgment.

---

*This document does not describe what Nouriq will build.*
*It describes what Nouriq will remain.*
