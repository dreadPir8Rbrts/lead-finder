from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid


class PipelineRunCreate(BaseModel):
    niche: str = "lawn_care"
    trigger: str = "manual"
    filters: dict = {}


class TestLeadCreate(BaseModel):
    niche: str = "chiropractor"
    business_name: str
    city: str
    state: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None


class PipelineRunOut(BaseModel):
    id: uuid.UUID
    niche: str
    trigger: str
    filters: Optional[dict]
    status: str
    error: Optional[str]
    started_at: datetime
    completed_at: Optional[datetime]
    leads_found: int
    leads_scored: int
    sites_generated: int
    emails_queued: int


class LeadOut(BaseModel):
    id: uuid.UUID
    pipeline_run_id: Optional[uuid.UUID]
    business_name: str
    niche: str
    city: Optional[str]
    state: Optional[str]
    gbp_url: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    slug: str
    lead_score: int
    has_website: bool
    scraped_at: datetime
