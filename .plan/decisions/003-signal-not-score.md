# ADR 003: SIGNAL is a state, not a score

**Status:** Accepted
**Date:** 2026-05-07

---

## Context

Every fitness app that attempts a "daily readiness" or "overall health" metric defaults to a number: Whoop's 0–100 Recovery Score, Oura's Readiness Ring, Apple's Activity Rings. The numeric score is legible and familiar.

The question for Nouriq: should the AI produce a numeric score (e.g., "Score: 72") or a qualitative state label?

---

## Decision

**SIGNAL is a state, not a score.** The system output is one of six text labels (`OPTIMISING`, `BUILDING`, `CUTTING`, `UNDERFUELLED`, `PROTEIN-LIMITED`, `DRIFTING`) plus the special `READING` state.

There is no number between 0 and 100. No rings. No percentages.

---

## Rationale

**Numeric scores are arbitrary and unactionable:**
- A score of 72 tells you nothing about what to do. Is 72 good? Compared to what? Your best day? A population average? A made-up scale?
- Users optimize for the score rather than the underlying behavior (gaming the metric)
- Daily fluctuations in a score produce anxiety without information ("I was 78 yesterday, I'm 64 today — why?")

**Named states carry semantic content:**
- `UNDERFUELLED` tells you immediately what the problem is and what to do about it
- `OPTIMISING` is meaningful: you are doing what the goal requires
- `DRIFTING` communicates "your inputs don't have a pattern yet" — a fundamentally different message than a declining number
- The state label reads as a system read on your physiology, not a grade

**States resist gaming:**
- A state requires 3–4 consecutive qualifying days to change. One good day doesn't move you to `OPTIMISING`. This filters out noise and prevents users from chasing the metric.

**The reference points (WHOOP, Oura) all have scores:**
- This is a deliberate differentiation. Nouriq's bet: a meaningful classification outperforms an arbitrary number for behavior change.

---

## Consequences

- STATE computation is more complex than a formula — it requires AI judgment
- Users accustomed to numeric scores may initially miss the concreteness
- STATE cannot be used for comparison ("I was 72 vs. 78") — only for pattern tracking ("I held OPTIMISING for 9 days")
- Weekly SIGNAL report uses state + delta + adherence %, which together provide the quantitative context

---

## Rejected Alternative

**Numeric score with named thresholds (0–100, labeled at ranges):**
Users will remember the number, not the label. The number will become the proxy. Rejected.
