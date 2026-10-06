-- GBP logo URL from Outscraper, shown in the demo site header/footer
alter table leads add column if not exists logo_url text;

-- Visual style the demo site was generated with (see app/lib/themes.ts)
alter table demo_sites add column if not exists style text not null default 'classic';
