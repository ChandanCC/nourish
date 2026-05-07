# 011 — Deterministic SIGNAL Fallback When AI Synthesis Fails

**Date:** 2026-05-07
**Status:** Active
**References:** D-023 in DECISION_LOG.md

## Decision

When the AI synthesis call (Tier 3) fails, times out, or returns an invalid response, the system falls back to a deterministic state from Tier 1 + Tier 2 output. Fallback rule: if a Tier 1 safety state fired, return it. If confidence < 60, return DRIFTING. Otherwise, return the top pre-qualified candidate with `ai_instruction = null`. The previous SignalState is retained if fallback computation also fails.

## Context

The SIGNAL state is served on every home screen load. If the AI call fails (timeout, rate limit, provider outage), the system needs a defined behavior. Options: show an error state, show a loading indicator, or compute a degraded-but-valid state.

## Reasoning

The user must always see a valid state. An error screen in the hero zone destroys trust immediately. A loading spinner that never resolves is worse. The system's credibility depends on always producing something meaningful.

The deterministic fallback produces a less-precise but correct state. DRIFTING (when OPTIMISING might be accurate) is honest: the system could not compute a confident answer. This is better than either an error or a confident-but-hallucinated state.

The `is_stale` flag on the SignalState document allows the frontend to indicate (subtly, without distress) that the state may be less precise than normal. The system is transparent without being alarming.

## Tradeoffs

- The fallback state may be less accurate than the AI-synthesized state.
- DRIFTING is over-represented in fallback scenarios — users who are actually OPTIMISING may see DRIFTING during Claude outages.
- Bugs in Tier 1/2 computation are not caught by the fallback (the fallback relies on the same deterministic logic). Tier 1/2 correctness is load-bearing.

## Superseded by

—
