# Lead Generator

An internal prospecting tool: scrape Google Business Profile listings, filter businesses
without websites, generate personalized demo copy, and review leads in a Next.js dashboard.
The API uses FastAPI, Outscraper, Anthropic, and Supabase. Email delivery is still a stub.

## Local setup

Use Node 22 (`app/.nvmrc`) and Python 3.14.3 (`runtime.txt`).

1. Copy `.env.example` to `.env` at the repository root and fill in backend credentials.
2. Copy `app/.env.example` to `app/.env.local`. Set the same Supabase URL/service key,
   plus `NEXT_PUBLIC_API_URL=http://localhost:8000` for browser requests to FastAPI.
   Never prefix the service key with `NEXT_PUBLIC_`.
3. Install Python dependencies with `pip install -r requirements.txt` in your virtual
   environment. Run `nvm install` and `nvm use` from `app/`, then `npm ci`.
4. Ensure the database has both migrations from `supabase/migrations/`, in order.
   The second adds `leads.logo_url` and `demo_sites.style`, required by the merged UI.

From the repository root, start the API:

```bash
source .venv/bin/activate
uvicorn api.main:app --reload --reload-dir api
```

In a second terminal:

```bash
cd app
npm run dev
```

Open http://localhost:3000/admin. Port 3001 is also allowed by the API's local CORS settings.
Development and production builds use webpack for compatibility with the local build tooling.

## Merge features and limits

- Four chiropractic demo pages: Home, About, Conditions Treated, and Contact.
- Classic and Warm & Earthy styles, selected when generating a demo.
- Optional business logos with a fallback that hides broken images.
- Lead search/filtering over up to 1,000 loaded records.
- Three-second admin polling while a run among the latest ten is active and under one hour old.

The appointment form is presentational. Lawn-care copy generation exists, but the demo
template is still chiropractic. Outreach does not send email. Admin/API authentication
and deployment hardening remain required before public hosting.

## Checks

From `app/`:

```bash
npm run lint
npx tsc --noEmit --incremental false
npm run build
```

The build downloads the configured Google fonts, so it requires network access.
Database failures now produce an error page rather than an empty dashboard or a false 404.
Check server logs for the database error code; check migrations and environment settings
when setting up a new checkout.

## DigitalOcean App Platform

Commit and push the repository before creating services. Use one App Platform app
with two Web Service components from the same GitHub repository and branch.

| Setting | Frontend (`web`) | Backend (`api`) |
| --- | --- | --- |
| Source directory | `app` | `/` |
| Build command | `npm run build` | Leave blank; buildpack installs root requirements |
| Run command | `npm run start -- --hostname 0.0.0.0 --port 8080` | `python -m uvicorn api.main:app --host 0.0.0.0 --port 8080 --root-path /api` |
| HTTP port | `8080` | `8080` |
| Health-check path | `/` | `/health` |
| Public route | `/` | `/api` with **Trim Prefix** |

The root `requirements.txt` includes `api/requirements.txt`, allowing Python detection
without moving the API package. The root `Procfile` also supplies a backend startup
command if the platform auto-detects it. `runtime.txt` selects Python 3.14.3;
`app/package.json` selects Node 22. Do not run the frontend as a static site or use
development commands (`next dev`, `uvicorn --reload`) in production.

Set these variables on the individual components in the DigitalOcean UI:

| Component | Variable | Scope | Encrypt |
| --- | --- | --- | --- |
| `web` | `SUPABASE_URL` | Build and runtime | No |
| `web` | `SUPABASE_SERVICE_KEY` | Build and runtime | Yes |
| `web` | `NEXT_PUBLIC_API_URL=/api` | Build and runtime | No |
| `api` | `SUPABASE_URL` | Runtime | No |
| `api` | `SUPABASE_SERVICE_KEY` | Runtime | Yes |
| `api` | `ANTHROPIC_API_KEY` | Runtime | Yes |
| `api` | `OUTSCRAPER_API_KEY` | Runtime | Yes |

Keep the existing Supabase database. Do not commit environment files or put secret
keys in `NEXT_PUBLIC_` variables. Instantly variables are optional while delivery is a stub.

Under **Networking → Component routing rules**, send `/` to `web` and `/api` to `api`
with **Trim Prefix**. A request to `/api/pipeline/run` must arrive at FastAPI as
`/pipeline/run`. The backend's `--root-path /api` describes the proxy prefix for
generated URLs and API docs; the router still needs to trim it. The frontend calls
the API on the same origin, so no production CORS change is required for this setup.
Changing `NEXT_PUBLIC_API_URL` requires a frontend rebuild.

After deployment, verify `/api/health` returns `{"status":"ok"}`, `/api/docs` loads
its schema, `/admin` loads your data, and an existing `/demo/<slug>` renders.
Start with one instance per service. Pipeline tasks run inside the API process;
deploys or restarts can interrupt them, and they do not automatically resume.

Deployment configuration does not add authentication. Protect the admin and API
before public use: they currently expose lead data and paid pipeline triggers.

References: [DigitalOcean Python buildpack](https://docs.digitalocean.com/products/app-platform/reference/buildpacks/python/),
[Node.js buildpack](https://docs.digitalocean.com/products/app-platform/reference/buildpacks/nodejs/),
[monorepo setup](https://docs.digitalocean.com/products/app-platform/how-to/deploy-from-monorepo/),
[routing](https://docs.digitalocean.com/products/app-platform/how-to/url-rewrites/).
