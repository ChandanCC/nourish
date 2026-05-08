# Nouriq — Service Classification

Maps every external dependency to its current status. Updated when integration decisions change.

---

## REQUIRED_NOW
*App cannot function at all without these. Must be configured before any development.*

| Service | Env Var(s) | Purpose |
|---|---|---|
| Anthropic API | `ANTHROPIC_API_KEY` | Food parsing (natural language → nutrition struct) |
| MongoDB Atlas | `MONGODB_URI` | All persistent data |
| Google OAuth 2.0 | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | User authentication |
| JWT signing | `JWT_SECRET` | Session integrity |

**Minimum local dev setup**: 5 env vars. All other services are deferred.

---

## PRODUCTION_ONLY
*Not needed for local development. Required before deploying to users.*

| Service | Env Var(s) | Why deferred locally |
|---|---|---|
| AWS Lambda + API Gateway | IAM credentials (CI/CD only) | Express runs directly locally |
| AWS S3 + CloudFront | IAM credentials (CI/CD only) | Vite dev server used locally |
| CORS origin lock | `FRONTEND_ORIGIN` | localhost allowed by default |
| Structured log aggregation | None (stdout → CloudWatch) | Console output sufficient locally |

**Note**: CloudWatch structured logging works automatically with Lambda — `requestLogger` middleware already emits JSON to stdout. No additional integration needed.

---

## MVP_LATER
*Required before the product is stable for real users, but not blocking early local testing.*

| Service | Env Var(s) | Trigger for integration |
|---|---|---|
| Sentry (or equivalent) | `SENTRY_DSN` | First external beta user |
| MongoDB Atlas M2+ | `MONGODB_URI` (same var) | M0 512MB limit approached or production SLA needed |

---

## FUTURE_OPTIONAL
*Explicitly roadmapped. Do not add until the roadmap item is active.*

| Service | Env Var(s) | Roadmap milestone | Why deferred |
|---|---|---|---|
| Nutritionix Track API | `NUTRITIONIX_APP_ID`, `NUTRITIONIX_APP_KEY` | v2.0 (barcode scan) | Claude handles unstructured input; barcodes require native camera |
| Apple HealthKit | None (device permission) | v2.0 (Capacitor native) | Requires Capacitor wrapper; web app cannot access HealthKit |
| Google Health Connect | None (device permission) | v2.0 (Capacitor native) | Same as above |
| Firebase Cloud Messaging | `FIREBASE_SERVICE_ACCOUNT` | Post-v1 engagement work | Re-engagement feature; core loop first |

---

## EXPERIMENTAL
*Evaluated but no integration decision made. Track here to avoid re-evaluating.*

| Service | Status | Notes |
|---|---|---|
| OpenAI GPT-4o | Evaluated — not selected | Claude instruction-following superior for structured JSON extraction |
| USDA FoodData Central | Evaluated — not selected | Free but requires query normalization layer; Claude handles this already |
| Supabase (auth/DB) | Evaluated — not selected | Would replace Google OAuth + MongoDB Atlas stack; more migrations than value |
| Mixpanel / PostHog | Not evaluated | Deferred until user behavior data is needed at scale |

---

## Decision rationale

**Why only 5 credentials at MVP?**

The tri-tier intelligence architecture (deterministic → statistical → AI synthesis) means Tier 1 and Tier 2 run entirely on data already in MongoDB. Claude is only called at the point of food logging — once per entry, not on every page load. No other external service is in the critical path.

**Why defer nutrition databases?**

Claude already returns structured nutrition data with IFCT references for Indian food. Adding a separate database API creates a second parse/merge step that would reduce reliability for no gain at MVP scale. Nutritionix adds value only when barcode scanning is added.

**Why defer observability?**

CloudWatch structured logs are implicit with Lambda — `requestLogger` emits JSON to stdout and Lambda routes it automatically. This is operationally sufficient for single-user MVP. A dedicated observability service adds cost and setup overhead before the signal quality is worth monitoring.

**Why defer push notifications?**

The core loop (log → signal) must be proven before building re-engagement mechanics. Premature notifications for a product the user hasn't validated daily = churn, not retention.
