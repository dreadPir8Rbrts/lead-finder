-- pipeline_runs created first — leads references it
create table if not exists pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  niche text not null,
  trigger text not null check (trigger in ('scheduled', 'manual')),
  filters jsonb,
  status text not null default 'queued' check (status in (
    'queued', 'scraping', 'filtering', 'generating', 'queuing_outreach', 'complete', 'failed'
  )),
  error text,
  started_at timestamptz default now(),
  completed_at timestamptz,
  leads_found int default 0,
  leads_scored int default 0,
  sites_generated int default 0,
  emails_queued int default 0
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  pipeline_run_id uuid references pipeline_runs(id),
  business_name text not null,
  niche text not null default 'lawn_care',
  city text,
  state text,
  gbp_url text,
  email text,
  phone text,
  address text,
  slug text unique not null,
  lead_score int default 0 check (lead_score between 0 and 3),
  has_website boolean default false,
  last_activity_date date,
  scraped_at timestamptz default now()
);

create table if not exists demo_sites (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id),
  slug text not null,
  status text not null default 'pending' check (status in ('pending', 'generated', 'published')),
  site_data jsonb,
  generated_at timestamptz default now()
);

create table if not exists outreach (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id),
  channel text not null default 'email' check (channel in ('email', 'mail', 'dm')),
  domain_used text,
  sent_at timestamptz,
  status text not null default 'queued' check (status in ('queued', 'sent', 'replied', 'converted')),
  created_at timestamptz default now()
);

-- Indexes
create index if not exists leads_pipeline_run_id_idx on leads(pipeline_run_id);
create index if not exists leads_niche_idx on leads(niche);
create index if not exists leads_score_idx on leads(lead_score desc);
create index if not exists demo_sites_lead_id_idx on demo_sites(lead_id);
create index if not exists demo_sites_slug_idx on demo_sites(slug);
create index if not exists outreach_lead_id_idx on outreach(lead_id);
create index if not exists outreach_status_idx on outreach(status);
