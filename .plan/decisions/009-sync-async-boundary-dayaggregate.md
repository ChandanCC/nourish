# 009 — Sync/Async Boundary at DayAggregate

**Date:** 2026-05-07
**Status:** Active
**References:** D-021 in DECISION_LOG.md

## Decision

DayAggregate recomputation is synchronous — it runs before the API response is returned. SIGNAL recomputation is always asynchronous — it is queued and runs after the response. The user sees updated macro totals immediately after logging; updated SIGNAL state on the next home screen load.

## Context

Every food log write must trigger downstream computation: daily macro summation (DayAggregate), pattern analysis (SIGNAL state, baseline). The question was which computations block the HTTP response and which run after.

## Reasoning

Macro counts are facts the user just created — they need to see the updated number immediately after saving an entry. Waiting for SIGNAL recomputation (which calls AI) while the user watches a spinner is the wrong tradeoff.

SIGNAL is a pattern derived from AI synthesis across multiple days. It cannot be more current than the underlying data, and it does not need to be. The user's pattern does not change meaningfully with one entry. Showing a 2-second-old SIGNAL state after logging is correct behavior.

The boundary also has a performance consequence: GET /api/home is always a pure read of pre-computed state, never a computation trigger. This guarantees sub-50ms home screen loads regardless of the AI service's latency.

## Tradeoffs

- The synchronous DayAggregate step adds ~20ms to every food log write. This is acceptable.
- SIGNAL state on the home screen may be up to one async job cycle behind the latest log. This is by design.
- If the SIGNAL job fails, the displayed state is the previous state, not an error. Correct behavior.

## Superseded by

—
