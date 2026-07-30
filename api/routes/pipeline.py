import uuid
from fastapi import APIRouter, BackgroundTasks
from ..db.client import supabase
from ..db.models import PipelineRunCreate
from ..pipeline.run import run_pipeline

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
