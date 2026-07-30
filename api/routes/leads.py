from typing import Optional
from fastapi import APIRouter, Query
from ..db.client import supabase

router = APIRouter(prefix="/leads", tags=["leads"])


@router.get("/")
def list_leads(
    niche: Optional[str] = None,
    min_score: Optional[int] = None,
    limit: int = Query(default=100, le=500),
):
    query = (
        supabase.table("leads")
        .select("*, demo_sites(status), outreach(status)")
        .order("lead_score", desc=True)
        .limit(limit)
    )
    if niche:
        query = query.eq("niche", niche)
    if min_score is not None:
        query = query.gte("lead_score", min_score)
    return query.execute().data


@router.get("/{lead_id}")
def get_lead(lead_id: str):
    return (
        supabase.table("leads")
        .select("*, demo_sites(*), outreach(*)")
        .eq("id", lead_id)
        .single()
        .execute()
        .data
    )


@router.patch("/{lead_id}/outreach-status")
def update_outreach_status(lead_id: str, status: str):
    return (
        supabase.table("outreach")
        .update({"status": status})
        .eq("lead_id", lead_id)
        .execute()
        .data
    )
