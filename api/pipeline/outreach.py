"""
Outreach — implement after Instantly / Smartlead account and campaign are set up.
The queue_email function is called per-lead after site generation.
"""
import httpx
from ..db.client import supabase
from ..config import settings


def queue_email(lead_id: str) -> bool:
    """
    Add a lead to the active Instantly campaign.
    Returns True if queued, False if skipped (no email on GBP).
    """
    lead = supabase.table("leads").select("*").eq("id", lead_id).single().execute().data

    if not lead.get("email"):
        return False

    # Uncomment after Instantly campaign is configured:
    # with httpx.Client() as http:
    #     resp = http.post(
    #         f"{settings.instantly_api_url}/leads",
    #         headers={"Authorization": f"Bearer {settings.instantly_api_key}"},
    #         json={
    #             "email": lead["email"],
    #             "first_name": lead["business_name"],
    #             "custom_variables": {
    #                 "demo_url": f"https://your-domain.com/demo/{lead['slug']}"
    #             },
    #             "campaign_id": settings.instantly_campaign_id,
    #         },
    #     )
    #     resp.raise_for_status()

    supabase.table("outreach").insert({
        "lead_id": lead_id,
        "channel": "email",
        "status": "queued",
    }).execute()
    return True
