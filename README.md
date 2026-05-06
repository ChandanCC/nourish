# Nourish — Nutrition Logger

Full-stack nutrition tracker with AI-powered food analysis.

```
nourish/
├── frontend/          React + Vite + React Query + Tailwind
├── backend/           Express + MongoDB Atlas → AWS Lambda
└── infra/             SAM (Lambda/API GW) + CDK (S3/CloudFront)
```

---

## Local Development

### 1. MongoDB Atlas (free M0)
1. Go to https://cloud.mongodb.com → create free M0 cluster
2. Create DB user → whitelist IP (0.0.0.0/0 for dev)
3. Get connection string: `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/nourish`

### 2. Backend
```bash
cd backend
cp .env.example .env
# Fill in MONGODB_URI in .env

npm install
npm run dev          # runs on http://localhost:4000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:4000/api (default)

npm install
npm run dev          # runs on http://localhost:5173
```

---

## AWS Deployment (Free Tier)

### What's free
| Service | Free tier |
|---|---|
| Lambda | 1M requests/month, 400K GB-sec compute |
| API Gateway | 1M API calls/month (first 12 months) |
| S3 | 5GB storage, 20K GET, 2K PUT/month |
| CloudFront | 1TB transfer, 10M requests/month |
| MongoDB Atlas M0 | 512MB, free forever |

### Step 1 — Deploy Backend (Lambda + API Gateway)

Install AWS SAM CLI: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html

```bash
cd backend
npm run build        # compiles TypeScript → dist/

cd ../infra
sam build
sam deploy --guided
# When prompted:
#   Stack name: nourish-api
#   Region: ap-south-1
#   MongoDBUri: <your atlas URI>
#   CorsOrigin: * (change to CloudFront URL after frontend deploy)
```

Note the **ApiUrl** output — you'll need it for the frontend.

### Step 2 — Build Frontend

```bash
cd frontend
# Set production API URL
echo "VITE_API_URL=https://<your-api-gateway-id>.execute-api.ap-south-1.amazonaws.com/prod/api" > .env.production

npm run build        # outputs to dist/
```

### Step 3 — Deploy Frontend (S3 + CloudFront)

Install AWS CDK: `npm install -g aws-cdk`

```bash
cd infra
npm install
cdk bootstrap        # one-time per account/region
cdk deploy           # deploys S3 + CloudFront
```

Note the **CloudFrontDomain** output.

### Step 4 — Update CORS

Go back and re-deploy the backend with the real CloudFront URL:

```bash
cd infra
sam deploy \
  --parameter-overrides \
    MongoDBUri="<your-uri>" \
    CorsOrigin="https://<your-cloudfront-domain>"
```

---

## Environment Variables

### Backend
| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `CORS_ORIGIN` | Allowed frontend origin |
| `PORT` | Local dev port (default 4000) |
| `NODE_ENV` | `development` or `production` |

### Frontend
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

---

## API Reference

All requests require `x-user-id` header (set automatically from localStorage UUID).

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/logs?days=15` | Fetch history |
| GET | `/api/logs/:dateKey` | Fetch single day |
| POST | `/api/logs/:dateKey/entries` | Add food entry |
| DELETE | `/api/logs/:dateKey/entries/:entryId` | Delete entry |
| DELETE | `/api/logs/:dateKey` | Delete whole day |

---

## Architecture

```
User Browser
    │
    ├── React App (CloudFront + S3)
    │       │ React Query
    │       ▼
    │   API Gateway (AWS, free tier)
    │       │
    │       ▼
    │   Lambda Function (Node.js/Express)
    │       │ Mongoose
    │       ▼
    │   MongoDB Atlas M0 (free forever)
    │
    └── Anthropic API (Claude Sonnet)
            └── Food analysis / macro+micro extraction
```
