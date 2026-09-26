from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.schemas.financial_profile import FinancialProfileResponse
from app.schemas.credit_history import CreditHistoryResponse

class MetricDelta(BaseModel):
    has_baseline: bool
    score_change: int
    utilization_change: float
    dti_change: float
    debt_change: float
    missed_payments_change: int
    wording: str

class DashboardResponse(BaseModel):
    user_name: str
    user_email: str
    has_profile: bool
    profile: Optional[FinancialProfileResponse] = None
    
    # Baseline deltas
    first_record_delta: Optional[MetricDelta] = None
    previous_record_delta: Optional[MetricDelta] = None
    
    # Charts data
    score_history: List[CreditHistoryResponse] = []
    
    # Financial health analysis
    bottlenecks: List[Dict[str, Any]] = []
    disclaimer: str
