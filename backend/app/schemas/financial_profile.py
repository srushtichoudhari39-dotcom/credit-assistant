from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator
from app.utils.constants import MIN_CREDIT_SCORE, MAX_CREDIT_SCORE

class FinancialProfileBase(BaseModel):
    credit_score: int = Field(
        ...,
        ge=MIN_CREDIT_SCORE,
        le=MAX_CREDIT_SCORE,
        description=f"Current credit score (India scale: {MIN_CREDIT_SCORE} to {MAX_CREDIT_SCORE})"
    )
    monthly_income: float = Field(..., ge=0.0, description="Gross monthly income in INR (₹)")
    monthly_expenses: float = Field(..., ge=0.0, description="Estimated monthly living expenses in INR (₹)")
    total_debt: float = Field(..., ge=0.0, description="Total outstanding debt principal in INR (₹)")
    monthly_debt_payment: float = Field(..., ge=0.0, description="Total monthly EMI payments in INR (₹)")
    credit_limit: float = Field(..., ge=0.0, description="Total credit limit across all credit cards in INR (₹)")
    credit_balance: float = Field(..., ge=0.0, description="Total outstanding credit card balance in INR (₹)")
    missed_payments: int = Field(0, ge=0, description="Number of missed or late payments in past 24-36 months")
    active_loans: int = Field(0, ge=0, description="Number of currently active loan accounts")
    existing_credit_cards: int = Field(1, ge=0, description="Number of active credit cards")
    loan_types: Optional[str] = Field(None, description="Types of loans (e.g. Home Loan, Auto Loan, Personal Loan)")

    @field_validator("monthly_income")
    @classmethod
    def validate_income(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Monthly income cannot be negative.")
        return v

class FinancialProfileCreate(FinancialProfileBase):
    pass

class FinancialProfileUpdate(FinancialProfileBase):
    pass

class FinancialProfileResponse(FinancialProfileBase):
    id: int
    user_id: int
    credit_utilization: float
    dti_ratio: float
    updated_at: datetime
    
    # Educational indicators
    score_status: Dict[str, Any]
    dti_status: Dict[str, Any]
    utilization_status: Dict[str, Any]
    
    # Inconsistency / Limit alert
    validation_warning: Optional[str] = None

    class Config:
        from_attributes = True
