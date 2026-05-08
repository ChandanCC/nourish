# Nouriq — External API Dependency Map

Authoritative record of every external service or API the product depends on. Updated when dependencies are added or removed.

---

## Classification Key

| Tier | Meaning |
|---|---|
| `REQUIRED_NOW` | App cannot function without this today |
| `MVP_LATER` | Needed before production but not for local dev |
| `PRODUCTION_ONLY` | Not needed locally; required in deployed environment |
| `FUTURE_OPTIONAL` | Roadmapped but not yet started |
| `EXPERIMENTAL` | Evaluated, no commitment made |

---

## 1. Anthropic API

| Field | Value |
|---|---|
| **Service** | Anthropic Messages API |
| **Purpose** | Natural language food parsing and Tier 3 AI signal synthesis |
| **Why needed** | Core product mechanic — user types food in natural language, Claude returns structured nutrition |
| **Criticality** | CRITICAL — food logging is non-functional without it |
| **MVP necessity** | `REQUIRED_NOW` |
| **Cost profile** | ~$0.002 per food entry (claude-sonnet-4-6, ~512 output tokens). Negligible at MVP scale. |
| **Vendor lock-in** | HIGH — system prompt tuned to Claude's instruction-following. Swappable in principle via `POST /api/analyse` abstraction. |
| **Fallback** | None currently. Could fall back to manual numeric entry UX. |
| **Failure impact** | Food logging fails silently. App degrades to read-only history view. |
| **Abstraction layer** | `backend/src/routes/analyse.ts` — all AI calls flow through this single route |
| **API keys** | `ANTHROPIC_API_KEY` |
| **Env vars** | `ANTHROPIC_API_KEY` |
| **Rate limits** | Tier 1: 50 RPM, 40K TPM (claude-sonnet-4-6). Sufficient for single-user MVP. |
| **Data privacy** | Food text sent to Anthropic. No PII in payload by design. Retention per Anthropic policy. |

---

## 2. Google OAuth 2.0

| Field | Value |
|---|---|
| **Service** | Google Identity Services (OAuth 2.0) |
| **Purpose** | User authentication — Google Sign-In flow |
| **Why needed** | No custom auth. Google handles credential verification and identity. |
| **Criticality** | CRITICAL — no auth = no access to any user data |
| **MVP necessity** | `REQUIRED_NOW` |
| **Cost profile** | Free |
| **Vendor lock-in** | MEDIUM — swappable to any OAuth provider. JWT issuance is internal; only the ID token exchange depends on Google. |
| **Fallback** | None. Could add email/password auth as secondary method in future. |
| **Failure impact** | New logins fail. Existing sessions (JWT-gated) continue to work until JWT expires. |
| **Abstraction layer** | `backend/src/routes/auth.ts` — ID token verification and internal JWT issuance |
| **API keys** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| **Env vars** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (backend) |
| **Rate limits** | Effectively unlimited for this use case |
| **Data privacy** | Only email and Google profile ID stored. No Google account data persisted beyond first login. |

---

## 3. MongoDB Atlas

| Field | Value |
|---|---|
| **Service** | MongoDB Atlas (M0 free tier → M2+ for production) |
| **Purpose** | Primary data store — users, food entries, day aggregates, signal states |
| **Why needed** | Persistent storage for all application data |
| **Criticality** | CRITICAL — app is stateless without it |
| **MVP necessity** | `REQUIRED_NOW` |
| **Cost profile** | M0 free (512MB, shared). M2 ~$9/month for dedicated. M10 ~$57/month for production. |
| **Vendor lock-in** | MEDIUM — Mongoose ODM; swappable to any MongoDB-compatible DB with minimal changes |
| **Fallback** | None. Local MongoDB for dev. |
| **Failure impact** | Total application failure |
| **Abstraction layer** | Mongoose models in `backend/src/models/` |
| **API keys** | Connection string (includes credentials) |
| **Env vars** | `MONGODB_URI` |
| **Rate limits** | M0: 500 max connections, 100 IOPS. Sufficient for single-digit users. |
| **Data privacy** | All user nutrition data stored here. Atlas encryption at rest (M2+). M0 has shared infrastructure. |

---

## 4. AWS (Lambda + API Gateway + S3 + CloudFront)

| Field | Value |
|---|---|
| **Service** | AWS Lambda, API Gateway, S3, CloudFront |
| **Purpose** | Backend compute (Lambda), HTTP routing (API Gateway), frontend hosting (S3 + CloudFront) |
| **Why needed** | Serverless deployment target — no always-on server needed |
| **Criticality** | HIGH for production. Local dev uses Express directly. |
| **MVP necessity** | `PRODUCTION_ONLY` — not needed for local development |
| **Cost profile** | Lambda: ~$0 at MVP scale (1M free requests/month). API Gateway: $3.50/million. CloudFront: first 1TB free. S3: negligible. |
| **Vendor lock-in** | MEDIUM — SAM/Lambda-specific config. Core Express app is portable. |
| **Fallback** | Run Express directly (already works locally) |
| **Failure impact** | Production deployment down. No impact on local dev. |
| **Abstraction layer** | `infra/` — SAM template + Lambda handler wrapping Express |
| **API keys** | AWS IAM credentials |
| **Env vars** | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` (CI/CD only, not in app runtime) |
| **Rate limits** | Lambda: 1000 concurrent executions default (regional). Cold start ~800ms (acceptable per constraints). |
| **Data privacy** | No user data in S3 or CloudFront. Only static assets. Lambda receives request data in-flight only. |

---

## 5. Nutritionix API *(not yet integrated)*

| Field | Value |
|---|---|
| **Service** | Nutritionix Track API |
| **Purpose** | Barcode scanning and structured food database lookup |
| **Why needed** | v2.0 feature: barcode scanning for packaged foods |
| **Criticality** | LOW — Claude covers unstructured input; this handles barcodes |
| **MVP necessity** | `FUTURE_OPTIONAL` — roadmapped for v2.0 |
| **Cost profile** | Free tier: 500 API calls/day. $99/month for 10K/day. |
| **Vendor lock-in** | LOW — abstracted behind same `POST /api/analyse` route via fallback chain |
| **Fallback** | Claude parses natural language input instead |
| **Failure impact** | Barcode scan feature unavailable; manual entry still works |
| **Abstraction layer** | Would extend `backend/src/routes/analyse.ts` |
| **API keys** | `NUTRITIONIX_APP_ID`, `NUTRITIONIX_APP_KEY` |
| **Env vars** | `NUTRITIONIX_APP_ID`, `NUTRITIONIX_APP_KEY` |
| **Rate limits** | 500/day free tier |
| **Data privacy** | Query text sent to Nutritionix. No PII in queries by design. |

---

## 6. Apple HealthKit / Google Fit *(not yet integrated)*

| Field | Value |
|---|---|
| **Service** | Apple HealthKit (via Capacitor), Google Fit / Health Connect |
| **Purpose** | Workout and biometric data ingestion (step count, HRV, sleep, weight) |
| **Why needed** | v2.0 training integration — cross-referencing nutrition with recovery data |
| **Criticality** | NOT CRITICAL — pure enrichment layer |
| **MVP necessity** | `FUTURE_OPTIONAL` — roadmapped for v2.0, requires native app wrapper |
| **Cost profile** | Free (on-device APIs) |
| **Vendor lock-in** | HIGH — platform-specific. Capacitor plugin wraps both. |
| **Fallback** | Manual workout logging |
| **Failure impact** | Training data absent; signal state computed from nutrition only |
| **Abstraction layer** | Would be a Capacitor plugin layer + `backend/src/routes/training.ts` |
| **API keys** | None (device-local permissions only) |
| **Env vars** | None |
| **Rate limits** | None (device-local) |
| **Data privacy** | Biometric data stored on-device; only aggregates sent to backend |

---

## 7. Push Notifications *(not yet integrated)*

| Field | Value |
|---|---|
| **Service** | Firebase Cloud Messaging (FCM) or APNs direct |
| **Purpose** | Logging reminders, signal change alerts |
| **Why needed** | Re-engagement mechanic for consistent logging |
| **Criticality** | LOW — engagement feature, not core |
| **MVP necessity** | `FUTURE_OPTIONAL` |
| **Cost profile** | FCM: free |
| **Vendor lock-in** | MEDIUM — FCM abstracts APNs + FCM, but requires Firebase project |
| **Fallback** | No push; in-app indicators only |
| **Failure impact** | Users see no notifications; no functional impact |
| **Abstraction layer** | Would be a backend notification service |
| **API keys** | Firebase service account key |
| **Env vars** | `FIREBASE_SERVICE_ACCOUNT` (JSON blob) |
| **Rate limits** | Effectively unlimited at MVP scale |
| **Data privacy** | Device tokens stored; no notification content contains PII |

---

## 8. Observability *(not yet integrated)*

| Field | Value |
|---|---|
| **Service** | Datadog, Sentry, or AWS CloudWatch |
| **Purpose** | Error tracking, latency monitoring, alerting |
| **Why needed** | Production visibility without SSH access to Lambda |
| **Criticality** | HIGH for production sustainability |
| **MVP necessity** | `PRODUCTION_ONLY` — CloudWatch is implicit with Lambda at no extra cost |
| **Cost profile** | CloudWatch: free up to 5GB logs/month. Sentry: free tier sufficient for early production. |
| **Vendor lock-in** | LOW for CloudWatch (implicit). MEDIUM for Sentry/Datadog. |
| **Fallback** | CloudWatch structured logs already emitted via `requestLogger` middleware |
| **Failure impact** | Blind to production errors |
| **Abstraction layer** | `backend/src/middleware/requestLogger.ts` emits structured JSON to stdout |
| **API keys** | DSN (Sentry) or none (CloudWatch) |
| **Env vars** | `SENTRY_DSN` (optional) |
| **Rate limits** | N/A |
| **Data privacy** | Structured logs contain requestId, path, userId hash, status — no nutrition payload content |

---

## Summary: Minimum Viable Key Set

To run Nouriq meaningfully today (local dev or first deployment), five credentials are required:

```
ANTHROPIC_API_KEY      ← AI food parsing
GOOGLE_CLIENT_ID       ← Auth
GOOGLE_CLIENT_SECRET   ← Auth
JWT_SECRET             ← Session integrity
MONGODB_URI            ← Data persistence
```

Everything else is deferred by explicit decision. Adding any other service before these are stable creates premature complexity.
