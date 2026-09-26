from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.utils.constants import MIN_CREDIT_SCORE, MAX_CREDIT_SCORE

class CreditHistoryCreate(BaseModel):
    credit_score: int = Field(..., ge=MIN_CREDIT_SCORE, le=MAX_CREDIT_SCORE)
    credit_utilization: Optional[float] = None
    dti_ratio: Optional[float] = None
    total_debt: Optional[float] = None
    monthly_debt_payment: Optional[float] = None
    monthly_income: Optional[float] = None
    missed_payments: Optional[int] = 0

class CreditHistoryResponse(BaseModel):
    id: int
    user_id: int
    credit_score: int
    credit_utilization: float
    dti_ratio: float
    total_debt: Optional[float] = None
    monthly_debt_payment: Optional[float] = None
    monthly_income: Optional[float] = None
    missed_payments: Optional[int] = 0
    recorded_at: datetime
    score_status: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class CreditHistorySummary(BaseModel):
    records: List[CreditHistoryResponse]
    total_records: int
    earliest_score: Optional[int] = None
    latest_score: Optional[int] = None
    net_score_change: Optional[int] = None
    wording: str
