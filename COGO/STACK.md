# Preferred stack

Canonical defaults for COGO-guided work. When the **repo differs**, record deltas in `Current-Project.md` (stack overrides) and capture durable choices as Brain pipe lines (`Brain/cogo-memory-format.md`).

## Platform

- **TypeScript** strict · **Node 22 LTS** · **pnpm** · LF / UTF-8

## Frontend

- **Next.js App Router** · **Tailwind** · **shadcn/ui**
- Prefer **Server Components**; client components only for interactivity / browser APIs

## Backend

- **Hono** · **REST-first** · handlers/modules **colocated by domain**
- Validate at boundaries (**e.g. Zod**); typed responses; consistent error shape

## Data

- **PostgreSQL** · **Drizzle ORM** · **versioned migrations** in-repo · indexes for hot queries

## Auth

- **Better Auth** · wallet/session variants **only when product requires**

## AI

- **OpenAI** (SDK + `OPENAI_API_KEY`) · RAG/agents **only when specified**

## Deploy & hosting

- App: **Vercel** · CDN/DNS/WAF: **Cloudflare** when needed · **Docker** for local parity + auxiliary services

## Observability & ops

- Prod errors: **Sentry** (optional) · structured logs in prod · health/readiness endpoints on services

## Quality

- **Vitest** (unit/integration) · **Playwright** (critical user paths only)
- CI on PR: **lint + typecheck + tests** (adjust script names to repo)

## Secrets & env

- Dev: **`.env.local`** (gitignored) · prod/staging: host **secret manager**
- Document names only in `Human/example-env.md` — never commit values

## Avoid

Redux unless proven need · config mega-frameworks · opaque “enterprise” layering · unrelated edits (see `COGO.md`)
