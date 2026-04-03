# FineGuard Pro

> UK Companies House compliance monitoring SaaS for accountancy firms and UK businesses — automated filing deadline tracking, risk scoring, and intelligent alerts.

[![CI](https://github.com/allin50-cmd/manus-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/allin50-cmd/manus-ai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Overview

FineGuard Pro helps UK accountancy firms and limited companies stay on top of [Companies House](https://www.gov.uk/government/organisations/companies-house) filing obligations — automatically.

**Core features:**

- **Company monitoring** — real-time Companies House API integration; track unlimited UK companies
- **Smart alerts** — configurable thresholds for overdue, at-risk, and upcoming deadlines
- **Client management** — multi-user firm dashboard with role-based access (Admin / Manager / Viewer)
- **Risk scoring** — automated compliance health scores with trend analysis
- **White-label** — custom branding for accountancy firms
- **Integrations** — ClickSend SMS/email notifications, Stripe billing, Stripe webhooks

**Operated by:** FINE GUARD LTD (Company No. 16895564), Devonshire Green, Sheffield, South Yorkshire.

## Architecture

```
manus-ai/
├── client/                  # React SPA (Vite + TypeScript + Tailwind)
│   └── src/
│       ├── pages/           # Route-level page components (100+ routes)
│       ├── components/      # Shared UI components
│       └── App.tsx          # Router with public/private path splitting
├── server/                  # Express + tRPC API
│   ├── routes.ts            # Main tRPC app router (40+ sub-routers)
│   ├── routes/              # Route-specific handlers (Stripe webhook, etc.)
│   └── services/            # Business logic (alert sweep, scheduler, CH API)
├── shared/                  # Types and constants shared between client/server
├── Dockerfile               # Multi-stage build for Azure Container Apps
└── .github/workflows/       # CI/CD pipelines
```

**Stack:**
- Frontend: React 18, TypeScript, Tailwind CSS, Vite, Wouter routing, tRPC client
- Backend: Node.js, Express, tRPC, Drizzle ORM + MySQL
- Infra: Azure Container Apps (UK South), Stripe, ClickSend, Companies House API

## Prerequisites

- Node.js 20+
- MySQL 8.0+
- A [Companies House API key](https://developer.company-information.service.gov.uk/)

## Quick Start

```bash
git clone https://github.com/allin50-cmd/manus-ai.git
cd manus-ai
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your DB credentials, CH API key, Stripe keys, etc.

# Run database migrations
npm run db:migrate

# Start development server (client + server)
npm run dev
```

App available at `http://localhost:5000`.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MySQL connection string |
| `COMPANIES_HOUSE_API_KEY` | Companies House REST API key |
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `CLICKSEND_USERNAME` | ClickSend API username |
| `CLICKSEND_API_KEY` | ClickSend API key |
| `SESSION_SECRET` | Express session secret |
| `ADMIN_EMAILS` | Comma-separated admin email addresses |

## API

tRPC router with 40+ sub-routers. Full API documentation available at `/docs/api` when the server is running.

## Deployment

Deploys to Azure Container Apps via GitHub Actions on push to `main`.

```bash
# Build Docker image
docker build -t fineguard-api:latest .

# Push to ACR
az acr build --registry ultratechreg2359 --image fineguard-api:latest .

# Update Container App
az containerapp update --name fineguard-api --resource-group ultratech-rg \
  --image ultratechreg2359.azurecr.io/fineguard-api:latest
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full runbook.

## Legal

- [Terms of Service](https://fineguardpro.com/terms)
- [Privacy Policy](https://fineguardpro.com/privacy)
- [Cookie Policy](https://fineguardpro.com/cookies)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Security

To report a vulnerability, see [SECURITY.md](SECURITY.md). Do not open public issues for security bugs.

## License

MIT — see [LICENSE](LICENSE). Crown copyright data sourced from Companies House is subject to the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).
