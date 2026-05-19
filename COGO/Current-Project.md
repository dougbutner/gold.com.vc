# Current Project

## Objective

Ship and maintain **gold.com.vc** (SOLOMON / gold branding): marketing and info pages plus reference **Antelope (EOSIO-style) C++ contracts** and domain skills for Alcor / AtomicAssets / related stacks.

## Current Focus

Keep static site (`index.html`, `*.html`, `assets/`) and `contracts/` coherent; use COGO docs + `skill/` (and mirrored `COGO/skill/`) when extending chain-facing behavior or copy.

## Stack vs `COGO/STACK.md`

Canonical COGO stack is Next.js / Hono / PostgreSQL. **This repo differs** — record deltas here.

- **Frontend:** Static HTML, CSS (`assets/css/site.css`), vanilla JS (`assets/js/*.js`). HTML is **generated** from `content/site-copy.md` via `scripts/build-site.mjs`; do not hand-edit the root `*.html` files — they will be overwritten on the next `npm run build`.
- **Copy source of truth:** [`content/site-copy.md`](../content/site-copy.md) — every public-site word (nav, pages, concepts glossary, legal) lives here. Sections are delimited with `<!-- PAGE: slug -->` and each starts with YAML frontmatter (title, description, eyebrow, include_concepts, …).
- **Build:** `npm run build` (or `npm run watch` for local iteration) reads the MD, applies templates in `templates/` (`page.html` + `home.html` shell that preserves the WebGL canvas), and writes the root HTML. Dependencies: `marked`, `js-yaml`.
- **“Backend” / on-chain:** C++ headers/sources under `contracts/` (Antelope patterns: `eosio.token`, Alcor exchange headers, `atomicassets` interface, `web4` helpers). Not a Node API.
- **Database / auth / deploy:** Not present as application code in-tree; site is static-first. Deployment/hosting TBD per your pipeline (e.g. static host + separate contract deploy).
- **Deploy / hosting:** Static assets + generated HTML; contract deployment is chain-specific (tooling outside this tree unless added later).
- **Secrets location (e.g. `.env.local`, Vault, Vercel env):** None required for pure static serving; add `.env.local` (gitignored) only if you introduce a build step, RPC proxies, or serverless later.

## Recent Decisions

- **2026-05-11:** COGO `/install-project` (Workflow A) — profiled repo; aligned Cursor root rules with `COGO/COGO.md`; documented stack divergence from `STACK.md`.
- **2026-05-11:** Added single-source-of-truth copy workflow — `content/site-copy.md` + `scripts/build-site.mjs` regenerates all root `*.html`. New pages **Types of Tokens** and **Generating Wealth**, expandable **Concepts** glossary, and **Digitally Conductive** positioning on the Types of Gold page are all driven by this MD.

## Blockers

- None identified from repo scan; confirm target chain(s) and deploy path when changing contracts or adding scripted deploys.

## Next Steps

- Commit `COGO/` + root `HUMAN-README.md` / `README.md` when ready so agents share one source of truth.
- If adding Node tooling, update this file and `STACK.md` alignment (or keep overrides here).
- Prune duplicate `skill/` vs `COGO/skill/` over time if one location should be canonical.
