# 008 — Modular Monolith on Two Lambda Functions; SQS FIFO Job Queue

**Date:** 2026-05-07
**Status:** Active
**References:** D-020 in DECISION_LOG.md

## Decision

The backend is a single Express application (modular monolith) deployed as two Lambda functions: `api-handler` (synchronous, 29s timeout) and `job-worker` (asynchronous, 5-minute timeout). At early scale, background jobs are triggered via Lambda async invocation. At v1.1+, jobs are queued via SQS FIFO with per-user message groups and 5-minute deduplication windows.

## Context

The backend needed a deployment topology that handles two distinct latency profiles: API responses (must complete in < 29s to satisfy API Gateway) and background AI jobs (SIGNAL recomputation, baseline recalibration — can take up to 5 minutes). A single Lambda function would either cap all timeouts at 29s or require all API calls to be async.

## Reasoning

Microservices impose coordination cost without value at sub-500 DAU. A single codebase with clear internal module boundaries (`routes/`, `services/`, `jobs/`, `ai/`) provides the same separation with far less operational overhead. Extracting a service later, if necessary, is a one-day operation.

Two Lambda functions (not one) are needed because the timeout profiles are fundamentally different. SQS FIFO was chosen over Lambda async invocation for the job layer because it provides retry semantics, dead-letter queues, and deduplication — at no additional infrastructure complexity vs. direct Lambda invocation at this scale.

## Tradeoffs

- Cold starts affect both functions independently. At low DAU, this can add 2-5s to the first request after idle periods.
- SQS FIFO has a maximum deduplication window of 5 minutes — this is sufficient but not configurable.
- The monolith boundary is a convention, not enforced by the runtime. Discipline required to not let services bleed across module boundaries.

## Superseded by

—
