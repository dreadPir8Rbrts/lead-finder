# Lead Generator — Developer / LLM Handoff

_Last updated: 2026-10-06. Repository baseline: `613fd73` (`digital ocean deployment updates`)._

This is a project handoff, not an executable script. Read it before continuing development.
It is intended to travel with the repository and does not require the previous chat history.
When it conflicts with newer code or instructions, inspect the current checkout and follow
current user instructions. Update this document when implementation or deployment changes.

## 1. What the product does

An internal client-acquisition tool for selling website development services to local
businesses that do not have websites. The workflow is:

```text
Admin submits niche + city/state + limit + visual style
  → FastAPI creates pipeline_runs row and schedules an in-process background task
  → Outscraper searches Google Business Profile / Google Maps listings
  → Python filters and scores businesses
  → Python resolves logos and inserts leads
  → Claude generates JSON copy, saved as demo_sites.site_data
  → Next.js renders personalized demo pages at /demo/<slug>
  → Outreach stub inserts queued database records for leads with email
```

No email is actually sent. The app is a deployed MVP, not a finished acquisition system.
There is no LangGraph, Redis, durable job queue, or multi-agent orchestration, despite
older plans and the repository name. Keep the existing sequential architecture unless
there is a concrete requirement to change it.

The backend supports `chiropractor` and `lawn_care` filters/prompts. The frontend demo
is chiropractic-specific for both. Current product attention is on chiropractors.

## 2. Current state and deployment evidence

- User confirmed successful DigitalOcean deployment on 2026-10-06.
- Deployment URL, DigitalOcean app ID, region, actual resource sizes, domain, and
  auto-deploy branch/settings were not provided. Obtain these from the owner/control panel
  when needed; do not invent them or assume the local branch is deployed.
- The documented deployment is one App Platform app with two Web Services and external
  Supabase. Production endpoint checks were not independently performed in this session.
- Admin/API authentication is absent from the repo. Database RLS was previously reported
  disabled; migrations do not enable it. Do not assume hosting provides access protection.
- Working tree was clean immediately before creating this handoff. Check `git status`
  yourself before editing: later user changes may exist.

### Implemented frontend

- `/` redirects to `/admin`.
- Admin: run pipeline, generate manual test demo, recent runs, lead table, demo/GBP links.
- Default run form: Chiropractor / Fresno / CA / limit 50.
- Lead search: business name, city, phone, email. Filters: niche, state, minimum score,
  demo availability, outreach status. Only the top 1,000 loaded leads are searched.
- Latest ten runs displayed. Polling refreshes every three seconds while an unfinished
  run among those ten is under one hour old. Older unfinished runs are ignored for polling,
  not marked failed in the database.
- `connection()` makes `/admin` render per request; preserve this to avoid a stale
  production build-time snapshot. Successful run/test-demo submissions refresh the page.
- Database errors have explicit error boundaries instead of silent empty data/false 404s.
- Demo pages: Home, About, Conditions Treated, Contact; shared sticky header/footer,
  map and phone/email links, generated copy, optional logos.
- Style choices: `classic` (Classic) and `warm` (Warm & Earthy), via shared CSS variables.
- Home and About headings use **Meet Your Chiropractor**.

### Logo behavior — latest feature

The pipeline reads Outscraper's `logo`. `resolve_logo_url()` tries a larger Google image
URL (256px), then the original. It retains the original on failure instead of discarding
it, allowing the admin to distinguish a broken URL from no saved URL.

The admin **Logo** column loads the saved image in the browser:

| Label | Meaning |
| --- | --- |
| Checking… | Image request is pending |
| Included | Image loads and a demo row with a slug exists |
| Available | Image loads but no demo exists yet |
| Not available | No logo URL is saved |
| Failed to load | Saved image fails to load in this browser |

Successful images show a thumbnail. Status is not a separate persisted database field
and is not proof of the image being the correct business logo. Older discarded URLs
cannot be diagnosed retroactively. Demo logos hide on image failure and recover if their
URL changes. The manual test form accepts a logo URL; it does not discover the GBP/logo.

## 3. Repository map

| Path | Responsibility |
| --- | --- |
| `README.md` | Setup, verification commands, DigitalOcean settings |
| `requirements.txt` | Root Python detection; includes `api/requirements.txt` |
| `runtime.txt` | Python 3.14.3 selection for hosting |
| `Procfile` | Production API startup with `/api` root path |
| `api/main.py` | FastAPI app, CORS, routers, health endpoint |
| `api/config.py` | Pydantic settings from root `.env` / environment |
| `api/db/client.py` | Backend service-key Supabase client |
| `api/db/models.py` | Request models and output types; not all routes use output models |
| `api/routes/pipeline.py` | Run trigger/list/detail and synchronous test-demo endpoint |
| `api/routes/leads.py` | Lead queries and outreach-status update |
| `api/routes/sites.py` | Demo lookup endpoint |
| `api/pipeline/run.py` | Sequential orchestration and progress updates |
| `api/pipeline/scraper.py` | Outscraper request and response unwrapping |
| `api/pipeline/filters.py` | Hard filters, contact scoring, randomized slugs |
| `api/pipeline/logos.py` | Logo candidate selection / fallback |
| `api/pipeline/site_gen.py` | Niche prompts, model call, JSON cleanup |
| `api/pipeline/outreach.py` | Database-only outreach stub |
| `api/tests/test_logos.py` | Five mocked logo-resolution unit tests |
| `supabase/migrations/` | Initial schema and logo/style columns |
| `app/package.json`, `app/package-lock.json`, `app/.nvmrc` | Node 22, dependencies, webpack scripts |
| `app/AGENTS.md` | Required Next.js development guidance |
| `app/lib/supabase.ts` | Service-key client guarded by `server-only` |
| `app/lib/themes.ts` | Both visual themes, defaults, style-picker options |
| `app/app/admin/` | Dashboard, forms, table, logo status, polling, error boundary |
| `app/app/demo/[slug]/_data.ts` | Shared demo query and copy shape/defaults |
| `app/app/demo/[slug]/` | Four demo pages, shared layout, logo component |
| `app/app/demo/error.tsx` | Error boundary above slug layout |
| `app/app/layout.tsx`, `globals.css` | Root metadata/fonts and global CSS |

`current_status.md`, `phase-1-architecture.md`, `lead-generator-project-overview.md`, and
`langgraph-self-hosted-guide.md` are ignored local planning/status documents. They may
not exist after cloning. Older docs mention Railway, Node 20, missing demo pages, or
LangGraph; those descriptions are superseded. `app/README.md` is scaffold documentation.
Ignored `.agents/`, `.claude/`, and `.mcp.json` tooling is also not a clone prerequisite.
This handoff is not Git-ignored; include it in the next commit.

## 4. Fresh-machine local setup

### Prerequisites and access

Install Git, Python **3.14.3** with pip/venv, and Node **22.x** with npm. The commands
below assume macOS/Linux with bash/zsh and `nvm` installed. Python installation must
provide `python3.14`; confirm its patch version. Do not copy another machine's `.venv`
or `node_modules` folders. Native dependencies must be installed on the new machine.

Obtain through a secure channel:

- Repository clone URL and branch/access.
- Supabase project URL and service-role key for the intended environment.
- Anthropic API key and access to the model configured in `site_gen.py`.
- Outscraper key/credits for real pipeline runs.
- DigitalOcean access only if managing the deployment.

No credentials are contained in this document. Real generation costs money and writes
rows. Reusing production Supabase credentials means local actions modify production data.
Prefer a separate development Supabase project when testing changes.

### Clone and create Python environment

Replace the placeholder clone URL with the owner's actual repository URL:

```bash
git clone <repository-url> lead-finder-swarm
cd lead-finder-swarm
python3.14 --version
python3.14 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
cp .env.example .env
```

Run `cp` only for initial setup; do not overwrite an existing populated environment file.
On Windows PowerShell, use `py -3.14 -m venv .venv` and
`.\.venv\Scripts\Activate.ps1`; use a Windows-compatible Node version manager or install
Node 22 directly. The remaining Python/npm commands are the same.

### Configure backend environment

Edit root `.env` with actual values:

```dotenv
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_KEY=<service-role-key>
ANTHROPIC_API_KEY=<anthropic-key>
OUTSCRAPER_API_KEY=<outscraper-key>
```

Supabase and Anthropic settings are required at app import/startup. Outscraper is needed
only for scraping. Instantly settings are optional while outreach remains a stub.
`NEXT_PUBLIC_API_URL` belongs in the frontend environment; backend settings accept it
only for compatibility with an older mistaken example. Unknown extra root dotenv fields
may produce Pydantic validation errors. Start FastAPI from the repo root so `.env` resolves.

### Install and configure frontend

```bash
cd app
nvm install
nvm use
node --version
npm ci
cp .env.example .env.local
```

Edit `app/.env.local`:

```dotenv
SUPABASE_URL=https://<same-project-ref>.supabase.co
SUPABASE_SERVICE_KEY=<same-service-role-key>
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Both services must point at the intended same database. Never prefix the service key
with `NEXT_PUBLIC_`; that prefix bundles values into browser code. Next.js does not
load the repository-root `.env` when run from `app/`.

### Database setup: choose the correct path

**Existing project:** obtain the credentials from the owner and check that all four
tables and the logo/style columns exist. Do not reset data or replay migrations merely
to start the app. Historical project reference: `vzyktisxcxsovjtnuycj`.

**New development project:** create a separate Supabase project, then apply the existing
migration files in order using the Supabase SQL Editor (or an established migration
workflow for that project):

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_logo_and_style.sql`

Use that project's URL/service key in both environment files. No local Supabase/Docker
stack is required for this hosted-development setup. The repo does not include a
complete Supabase CLI local-stack configuration. The initial migrations do not configure
RLS; review access controls before treating a new project as production-ready.

The shared project had the logo/style columns verified during earlier work. That does
not establish the schema of a newly created project.

### Start both services

Terminal 1, from the repo root:

```bash
source .venv/bin/activate
python -m uvicorn api.main:app --reload --reload-dir api
```

Terminal 2, from the repo root:

```bash
cd app
nvm use
npm run dev
```

Visit http://localhost:3000/admin. If Next.js selects port 3001, use its printed URL.
FastAPI CORS allows `http://localhost:3000` and `http://localhost:3001`, not arbitrary
ports or `127.0.0.1` browser origins. Stop each server with Ctrl+C.

Local API paths have **no `/api` prefix**. Do not use the production `Procfile` command
for the standard local setup, and do not use `NEXT_PUBLIC_API_URL=/api` locally unless
you also configure a reverse proxy.

### Verify local setup

1. Open http://localhost:8000/health — expect `{"status":"ok"}`. This is a process
   health check, not a database or third-party credential check.
2. Open http://localhost:8000/docs — inspect the API routes.
3. Open `/admin` — should show records or an empty table, not the error boundary.
4. If you intend to spend an Anthropic call and create test data, use **Generate Test
   Demo Site** with a fictional chiropractor business. It bypasses Outscraper and does
   not create a pipeline-run/outreach record. Follow the returned demo link.
5. When ready for paid scraping, run a small batch from **Run Pipeline**. Zero qualifying
   leads is valid: businesses with website URLs are filtered out.

Do not use the appointment form as proof of a working submission flow; it is UI only.

## 5. Database and API contracts

Relationships:

```text
pipeline_runs  ← leads.pipeline_run_id (nullable for manual test leads)
leads          ← demo_sites.lead_id (required)
leads          ← outreach.lead_id (required)
```

There are no cascade deletes declared. Randomized unique lead slugs prevent URL collisions,
not duplicate businesses. Demo slugs are indexed but not unique; demo/outreach relationships
are not constrained to one row per lead. The admin takes the first related row.

| Table | Main data |
| --- | --- |
| `pipeline_runs` | niche, trigger, filters JSON, status/error, timestamps and stage counters |
| `leads` | business/contact/location details, niche, GBP/logo URLs, slug, score, run ID |
| `demo_sites` | lead ID, slug, status, style, generated copy JSON, generation timestamp |
| `outreach` | lead ID, channel, status, optional domain/sent timestamp |

Run states: `queued → scraping → filtering → generating → queuing_outreach → complete`,
with `failed` on outer exceptions. Per-lead generation exceptions are caught and printed;
the run can still finish `complete` with fewer demos than leads.

Site states: `pending`, `generated`, `published`. The generator writes `generated`;
there is no publish-approval gate on demo rendering.
Outreach states: `queued`, `sent`, `replied`, `converted`; only queueing is automated.

Local API surface (production adds `/api` externally):

| Method/path | Notes |
| --- | --- |
| `GET /health` | Process check |
| `POST /pipeline/run` | 202 with run ID; body includes niche, trigger, filters |
| `GET /pipeline/runs` | Recent runs |
| `GET /pipeline/runs/{run_id}` | One run |
| `POST /pipeline/test-lead` | Synchronous copy generation; returns slug/demo URL |
| `GET /leads/` | Optional niche/min_score/limit |
| `GET /leads/{lead_id}` | Lead with related records |
| `PATCH /leads/{lead_id}/outreach-status` | `status` is a query parameter, not JSON body |
| `GET /sites/{slug}` | Demo record with business |

Example run body (submitting incurs provider usage):

```json
{
  "niche": "chiropractor",
  "trigger": "manual",
  "filters": {"city": "Fresno", "state": "CA", "limit": 10, "style": "classic"}
}
```

The dashboard and demos query Supabase directly in Next.js server components; they do
not read through FastAPI. Browser form submissions call FastAPI. Debug those paths separately.

Generated chiropractic copy uses: `hero`, `uvp`, `doctor`, `conditions`, `services`,
`about`, `office`, `testimonials`, `faq`, `service_area`, `cta`.
Check `ChiroCopy` in `_data.ts` and `SYSTEM_PROMPTS` together when changing the contract.
TypeScript overrides/partial defaults do not validate arbitrary JSON at runtime.

## 6. DigitalOcean deployment configuration

Documented setup; inspect the actual UI before changing a live deployment:

| Setting | `web` | `api` |
| --- | --- | --- |
| Type | Web Service | Web Service |
| Source directory | `app` | `/` |
| Runtime | Node 22 | Python 3.14.3 |
| Build command | `npm run build` | Blank; Python buildpack installs root requirements |
| Run command | `npm run start -- --hostname 0.0.0.0 --port 8080` | `python -m uvicorn api.main:app --host 0.0.0.0 --port 8080 --root-path /api` |
| HTTP port | 8080 | 8080 |
| Health check | `/` | `/health` |
| Public route | `/` | `/api`, **Trim Prefix** |

Frontend variables: `SUPABASE_URL`, encrypted `SUPABASE_SERVICE_KEY`, and
`NEXT_PUBLIC_API_URL=/api`, all available at build and runtime. Backend runtime variables:
`SUPABASE_URL`, encrypted `SUPABASE_SERVICE_KEY`, encrypted `ANTHROPIC_API_KEY`, encrypted
`OUTSCRAPER_API_KEY`. Instantly variables remain optional.

A browser request to `/api/pipeline/run` must arrive at the API as `/pipeline/run`.
`--root-path /api` informs generated URLs/docs; routing still needs prefix trimming.
Same-origin routing avoids a production CORS change. Public environment changes require
rebuilding Next.js. Use GitHub commits/pushes and verify the deployed commit in the UI.

Check `/api/health`, `/api/docs`, `/admin`, and a real `/demo/<slug>` after deployment.
Do not redeploy during active runs: in-process tasks have no durable retry/resume.
No cron/scheduling setup is supplied by the repo. No separate DigitalOcean database is needed.

## 7. Tests, evidence, and troubleshooting

From repo root, with the Python environment activated:

```bash
python -m unittest discover -s api/tests -v
```

From `app/`, under Node 22:

```bash
npm run lint
npx tsc --noEmit --incremental false
npm run build
```

Previously passed: these five logo tests, lint, TypeScript, Node 22 webpack production
build, Python startup/syntax/settings checks, and FastAPI health/docs/schema with `/api`
root path. Local browser checks covered both themes, four demo pages, valid/missing/broken
logos, logo-status labels, and error/404 handling. Browser checks used temporary fixture
scripts and Playwright outside the repo; **there is no committed browser test suite**.
Do not rely on `/tmp` files, preinstalled browsers, or the old machine's absolute paths.

The Python requirements use minimum versions rather than a lockfile. A new machine can
resolve different dependencies than the tested environment. `npm ci` uses the committed
frontend lockfile. Record dependency changes deliberately rather than silently upgrading.

| Symptom | First checks |
| --- | --- |
| Backend fails at import | Root working directory, active venv, required `.env` fields, unexpected dotenv keys |
| `No module named api` | Start from repo root; backend source directory must be `/` on DigitalOcean |
| Frontend cannot reach API | API process running; correct `NEXT_PUBLIC_API_URL`; allowed localhost browser origin; restart after env edits |
| Dashboard error / missing columns | Supabase credentials and project, migration 002, server log error code |
| No leads after scrape | Website/category/country filters; niche spelling; source results |
| Demo has no logo | Logo status column; saved URL availability; older discarded URLs cannot be recovered from DB alone |
| Native CSS build errors | Correct Node version; fresh `npm ci`; keep webpack scripts |
| Build cannot fetch Geist fonts | Network access to Google Fonts; root layout uses `next/font/google` |
| Generation fails | Provider balance/model access, Anthropic response, malformed/truncated JSON, server logs |
| API 404 only in production | `/api` component routing and Trim Prefix; separate backend internal paths from external URLs |
| Run stuck after restart | No recovery worker exists; an old status does not prove execution is active |
| Supabase connectivity fails | Project availability in dashboard, URL/DNS/network; do not assume a free-tier auto-pause toggle exists |

`site_gen.py` currently hardcodes `claude-sonnet-5`. This records the code, not a guarantee
of future provider availability. Check current provider documentation/account access if
it fails. Parser finds text content blocks, removes code fences and trailing commas;
it does not check the full schema or retry truncated output.

## 8. Known gaps and next priorities

1. **Deployed access protection:** admin/API auth and database permissions/RLS review.
   CORS and a server-only service key do not protect publicly reachable endpoints.
2. **Production verification:** obtain the URL/settings and verify a small real run once
   access is protected. Deployment success alone is not a full workflow test.
3. **Demo completion:** mobile header navigation, functional or clearly labeled contact
   experience, accurate hours/doctor facts/testimonials, metadata, and niche-specific rendering.
   Prompts currently invite fabricated testimonials/doctor details; no claim of verified content.
4. **Pipeline correctness:** only queue outreach for successful demos; deduplicate business
   identities; validate input and generated JSON; track per-lead failures and safe retries.
   A test-lead failure can leave a lead without a demo because inserts are not transactional.
5. **Filtering:** recent activity within the last year was planned but is not implemented.
   Current logic only rejects permanently closed businesses and accepts temporarily closed ones.
6. **Outreach integration:** choose/configure provider, verify its current API, add actual
   delivery/reply tracking and real hosted demo URLs. Do not just uncomment the old sample.
7. **Scheduling/recovery:** add recurring execution after reliable small batches; consider
   durable jobs when restart safety is required. Avoid introducing orchestration without need.
8. **Admin scale:** pagination/server-side filtering past 1,000 loaded leads, better handling
   of multiple related outreach/site records, and visibility for old/interrupted runs.

Additional review targets: external logo requests follow redirects without host restrictions;
API request constraints are broad; FAQ JSON is embedded in a script without explicit `<`
escaping. These deserve review as part of public-facing hardening, not assumptions that
all production security work is complete.

## 9. Continuation checklist for the next model

- Read `README.md`, this handoff, and applicable `AGENTS.md`; inspect git status/history.
- `app/AGENTS.md` requires reading relevant installed Next.js docs under
  `app/node_modules/next/dist/docs/` before writing frontend code. Install dependencies first.
  This repo uses Next.js 16.3.1; older assumptions about APIs can be wrong. Error boundaries
  currently use `retry()`; preserve request-time admin rendering.
- Preserve the user's work and existing choices: DigitalOcean hosting, Node 22, webpack,
  chiropractic wording, both styles, and logo visibility.
- If local Supabase skills/tooling exist, follow their current instructions. Do not assume
  tools or ignored skill files from the previous machine are installed here.
- Identify the database/environment before writes. Do not repeat the previous reset:
  on 2026-10-06, the user requested deletion of 121 leads, 87 demos, and 18 runs, and the
  tables were verified empty then. That authorization was for that reset only; new data
  has since been generated. Outreach was empty at reset time.
- Confirm credentials/configuration without printing keys. Keep service clients server-only.
- Use mocked/unit checks for logic and isolated fixtures for UI where possible. Distinguish
  local checks, user-reported deployment, and verified production behavior in reports.
- Keep schema migrations and app contracts aligned. Do not recreate the database to fix
  a missing column, infer current row counts from this file, or apply destructive changes
  from historical notes.
- Update this handoff/README after meaningful changes. `current_status.md` may be updated
  locally too, but it is ignored and will not carry context to a new clone.

## 10. External references

Consult current official docs when implementing provider/platform changes:

- [DigitalOcean monorepos](https://docs.digitalocean.com/products/app-platform/how-to/deploy-from-monorepo/)
- [DigitalOcean Python buildpack](https://docs.digitalocean.com/products/app-platform/reference/buildpacks/python/)
- [DigitalOcean Node buildpack](https://docs.digitalocean.com/products/app-platform/reference/buildpacks/nodejs/)
- [DigitalOcean routing](https://docs.digitalocean.com/products/app-platform/how-to/url-rewrites/)
- [DigitalOcean environment variables](https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/)
- [Outscraper Maps search](https://docs.outscraper.com/endpoints/maps-search/)
- [Supabase documentation](https://supabase.com/docs)

Pending information to capture when available: production URL and app ID, deployed branch,
actual access protection outside the repo, deployment region/resource sizes, development
Supabase project choice, outreach-provider account/campaign, and production smoke-test results.
