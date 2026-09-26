from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class RoadmapStep(BaseModel):
    step_number: int
    title: str
    action: str
    rationale: str
    timeframe: str

class AIConsultationRequest(BaseModel):
    # Optional override or notes, otherwise uses active FinancialProfile
    additional_notes: Optional[str] = None

class AIConsultationResponse(BaseModel):
    id: Optional[int] = None
    summary: str
    credit_health_status: str
    bottlenecks: List[str]
    recommendations: List[str]
    five_step_roadmap: List[RoadmapStep]
    assumptions: List[str]
    disclaimer: str
    created_at: Optional[datetime] = None
