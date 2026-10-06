# Lead Generator

An internal prospecting tool: scrape Google Business Profile listings, filter businesses
without websites, generate personalized demo copy, and review leads in a Next.js dashboard.
The API uses FastAPI, Outscraper, Anthropic, and Supabase. Email delivery is still a stub.

## Local setup

Use Node 20 (`app/.nvmrc`) and the Python virtual environment.

1. Copy `.env.example` to `.env` at the repository root and fill in backend credentials.
2. Copy `app/.env.example` to `app/.env.local`. Set the same Supabase URL/service key,
   plus `NEXT_PUBLIC_API_URL=http://localhost:8000` for browser requests to FastAPI.
   Never prefix the service key with `NEXT_PUBLIC_`.
3. Install Python dependencies with `pip install -r api/requirements.txt` in your virtual
   environment. Run `npm ci` from `app/` under Node 20.
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
