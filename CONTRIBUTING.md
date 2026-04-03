# Contributing to FineGuard Pro

Thank you for your interest in contributing. This guide covers reporting bugs, requesting features, and submitting code.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). All contributors are expected to uphold it.

## Reporting Bugs

1. **Check existing issues** first at [GitHub Issues](https://github.com/allin50-cmd/manus-ai/issues).
2. Open a **Bug Report** using the issue template and include:
   - Steps to reproduce
   - Expected vs. actual behaviour
   - Node.js version, OS, browser (if frontend)
   - Relevant error logs or screenshots

Do **not** report security vulnerabilities as public issues — see [SECURITY.md](SECURITY.md).

## Suggesting Features

Open a **Feature Request** issue. Clearly describe the problem the feature would solve and any alternatives you've considered.

## Pull Requests

### Setup

```bash
git clone https://github.com/allin50-cmd/manus-ai.git
cd manus-ai
npm install
cp .env.example .env
# Fill in DB credentials and API keys
npm run dev
```

### Workflow

1. Fork the repo and branch from `main`:
   ```bash
   git checkout -b feat/your-feature
   ```

2. Make your changes.

3. Check for type errors and linting:
   ```bash
   npm run typecheck
   npm run lint
   ```

4. Commit with [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add bulk company import via CSV
   fix: resolve N+1 in getClients query
   docs: add tRPC router reference
   ```

5. Push and open a PR against `main`. Complete the PR template.

### Code Style

- TypeScript strict mode; no `any` without justification
- Prettier for formatting (config in `package.json`)
- ESLint for linting — run `npm run lint` before committing
- No `console.log` in production code paths (use the logger service)
- Keep PRs focused on one concern

### Database Migrations

- All schema changes go through Drizzle migrations: `npm run db:generate && npm run db:migrate`
- Never edit migration files after they've been committed to `main`

## Review Process

- PRs reviewed within 2 business days
- CI (lint + typecheck + build) must pass
- At least one approving review required
- Squash merge into `main`

## Questions?

Email [support@fineguardpro.com](mailto:support@fineguardpro.com) or open a [Discussion](https://github.com/allin50-cmd/manus-ai/discussions).
