import uuid
from fastapi import APIRouter, BackgroundTasks
from anthropic import Anthropic
from ..db.client import supabase
from ..db.models import PipelineRunCreate, TestLeadCreate
from ..pipeline.run import run_pipeline
from ..pipeline.filters import make_slug
from ..pipeline.site_gen import generate_copy
from ..config import settings

router = APIRouter(prefix="/pipeline", tags=["pipeline"])


@router.post("/run", status_code=202)
def trigger_run(body: PipelineRunCreate, background_tasks: BackgroundTasks):
    run_id = str(uuid.uuid4())
    supabase.table("pipeline_runs").insert({
        "id": run_id,
        "niche": body.niche,
        "trigger": body.trigger,
        "filters": body.filters,
        "status": "queued",
    }).execute()
    background_tasks.add_task(run_pipeline, {**body.filters, "niche": body.niche}, run_id)
    return {"run_id": run_id}


@router.post("/test-lead", status_code=201)
def create_test_lead(body: TestLeadCreate):
    slug = make_slug(body.business_name, body.city, body.state)
    lead_data = {
        "business_name": body.business_name,
        "niche": body.niche,
        "city": body.city,
        "state": body.state,
        "phone": body.phone,
        "email": body.email,
        "address": body.address,
        "logo_url": body.logo_url,
        "slug": slug,
        "lead_score": sum([bool(body.address), bool(body.email), bool(body.phone)]),
        "has_website": False,
    }
    lead_result = supabase.table("leads").insert(lead_data).execute()
    lead_id = lead_result.data[0]["id"]

    lead_for_gen = {**lead_data, "id": lead_id}
    client = Anthropic(api_key=settings.anthropic_api_key)
    copy = generate_copy(client, lead_for_gen)

    supabase.table("demo_sites").insert({
        "lead_id": lead_id,
        "slug": slug,
        "status": "generated",
        "style": body.style,
        "site_data": copy,
    }).execute()

    return {"slug": slug, "demo_url": f"/demo/{slug}"}


@router.get("/runs")
def list_runs(limit: int = 20):
    result = (
        supabase.table("pipeline_runs")
        .select("*")
        .order("started_at", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data


@router.get("/runs/{run_id}")
def get_run(run_id: str):
    result = (
        supabase.table("pipeline_runs")
        .select("*")
        .eq("id", run_id)
        .single()
        .execute()
    )
    return result.data
