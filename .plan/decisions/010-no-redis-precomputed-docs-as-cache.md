# 010 — No Redis; Pre-Computed MongoDB Documents as Cache

**Date:** 2026-05-07
**Status:** Active
**References:** D-022 in DECISION_LOG.md

## Decision

There is no caching layer (Redis, ElastiCache, CDN API cache). Expensive operations — daily macro summation, baseline computation, AI synthesis — are run once on the write path and stored as documents. Fast reads serve pre-computed state. The "cache" is three document types: `DayAggregate`, `SignalState`, `BaselineSnapshot`.

## Context

The home screen hydration endpoint (GET /api/home) must be fast and cheap. The naive implementation would sum all food logs per day and run SIGNAL computation on every request. The question was what caching strategy to use.

## Reasoning

Redis adds operational complexity (another managed service, another connection pool, another failure mode, TTL management, cache invalidation) for no meaningful benefit at sub-500 DAU. The pre-computed document model achieves sub-50ms GET /api/home reads from MongoDB with correct indexes, without any additional infrastructure.

The write path is slightly more complex: every food log write must update DayAggregate synchronously. But writes are infrequent (average 5 per user per active day), and the computation is simple arithmetic (not AI). This tradeoff is clearly correct.

Redis becomes necessary when MongoDB read latency is the bottleneck — that happens at roughly 5,000+ DAU, not before. The migration path is clear: wrap the MongoDB reads in a Redis cache layer without changing the data model.

## Tradeoffs

- Write paths carry more logic than a pure log-and-compute approach.
- Pre-computed documents can become stale if a write pipeline bug fails to update them. Requires careful testing.
- DayAggregate documents must be invalidated correctly when entries are soft-deleted.

## Superseded by

—
