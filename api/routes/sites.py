from fastapi import APIRouter, HTTPException
from ..db.client import supabase

router = APIRouter(prefix="/sites", tags=["sites"])


@router.get("/{slug}")
def get_site(slug: str):
    result = (
        supabase.table("demo_sites")
        .select("*, leads(*)")
        .eq("slug", slug)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Site not found")
    return result.data
