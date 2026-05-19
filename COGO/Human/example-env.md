# Example env (names only)

Aligned with [`STACK.md`](../STACK.md). **No secrets in git** — copy to `.env.local` / secret manager / CI.

```bash
# Platform
NODE_ENV=development
PORT=3000

# Next / app URL (browser + server callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Better Auth + DB (defaults in STACK)
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DBNAME

# AI (when used)
OPENAI_API_KEY=

# Cache / jobs (optional)
REDIS_URL=

# OAuth / email (optional; trim unused)
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
OAUTH_ISSUER_URL=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

# Object storage (optional)
S3_BUCKET=
S3_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Payments (optional)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Observability (optional)
LOG_LEVEL=debug
SENTRY_DSN=
DATADOG_API_KEY=

# Third-party APIs (optional)
API_KEY_EXTERNAL_SERVICE=
```

## Optional — Antelope / local tooling (this repo)

Use only if you add scripts, CDT, or RPC clients; **names only**, no keys in git.

```bash
# Chain RPC (read or push transactions from tooling)
CHAIN_API_URL=
CHAIN_ID=

# Local wallet / dev keys (never commit values)
DEV_PRIVATE_KEY=
```

Prune unused keys → rotate anything leaked → prefer provider-native secret names when mirroring prod.
