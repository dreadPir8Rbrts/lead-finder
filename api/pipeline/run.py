from datetime import datetime, timezone
from anthropic import Anthropic

from .scraper import scrape_gbp
from .filters import filter_and_score, make_slug
from .site_gen import generate_copy
from .outreach import queue_email
from ..db.client import supabase
from ..config import settings

anthropic_client = Anthropic(api_key=settings.anthropic_api_key)


def update_run(run_id: str, **kwargs):
    supabase.table("pipeline_runs").update(kwargs).eq("id", run_id).execute()


def run_pipeline(filters: dict, run_id: str):
    try:
        # Stage 1: Scrape
        update_run(run_id, status="scraping")
        raw_leads = scrape_gbp(filters)
        update_run(run_id, leads_found=len(raw_leads))

        # Stage 2: Filter + Score
        update_run(run_id, status="filtering")
        scored_leads = filter_and_score(raw_leads)
        update_run(run_id, leads_scored=len(scored_leads))

        lead_ids = []
        for lead in scored_leads:
            slug = make_slug(
                lead.get("name", "business"),
                lead.get("city", ""),
                lead.get("state_code", ""),
            )
            result = supabase.table("leads").insert({
                "pipeline_run_id": run_id,
                "business_name": lead.get("name", ""),
                "niche": filters.get("niche", "lawn_care"),
                "city": lead.get("city"),
                "state": lead.get("state_code"),
                "gbp_url": lead.get("location_link"),
                "email": lead.get("email"),
                "phone": lead.get("phone"),
                "address": lead.get("address"),
                "slug": slug,
                "lead_score": lead["lead_score"],
                "has_website": bool(lead.get("website")),
            }).execute()
            if result.data:
                lead_ids.append(result.data[0]["id"])

        # Stage 3: Site Generation
        update_run(run_id, status="generating")
        sites_generated = 0
        for lead_id in lead_ids:
            lead = supabase.table("leads").select("*").eq("id", lead_id).single().execute().data
            try:
                copy = generate_copy(anthropic_client, lead)
                supabase.table("demo_sites").insert({
                    "lead_id": lead_id,
                    "slug": lead["slug"],
                    "status": "generated",
                    "site_data": copy,
                }).execute()
                sites_generated += 1
            except Exception as e:
                print(f"[site_gen] failed for lead {lead_id}: {e}")
        update_run(run_id, sites_generated=sites_generated)

        # Stage 4: Queue Outreach
        update_run(run_id, status="queuing_outreach")
        emails_queued = 0
        for lead_id in lead_ids:
            if queue_email(lead_id):
                emails_queued += 1
        update_run(run_id, emails_queued=emails_queued)

        update_run(
            run_id,
            status="complete",
            completed_at=datetime.now(timezone.utc).isoformat(),
        )

    except Exception as e:
        update_run(run_id, status="failed", error=str(e))
        raise
