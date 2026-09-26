from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.financial_profile import FinancialProfile
from app.models.credit_history import CreditHistory
from app.schemas.financial_profile import (
    FinancialProfileCreate,
    FinancialProfileUpdate,
    FinancialProfileResponse
)
from app.auth.dependencies import get_current_user
from app.services.calculations import (
    calculate_dti,
    calculate_credit_utilization
)
from app.utils.constants import (
    get_credit_score_status,
    get_dti_status,
    get_utilization_status
)

router = APIRouter(prefix="/financial-profile", tags=["Financial Profile"])

def format_profile_response(profile: FinancialProfile) -> FinancialProfileResponse:
    """
    Constructs FinancialProfileResponse with educational status tags and validation warnings.
    """
    score_status = get_credit_score_status(profile.credit_score)
    dti_status = get_dti_status(profile.dti_ratio)
    utilization_status = get_utilization_status(profile.credit_utilization)

    validation_warning = None
    if profile.credit_limit > 0 and profile.credit_balance > profile.credit_limit:
        validation_warning = (
            f"Validation Warning: Reported card balance (₹{profile.credit_balance:,.0f}) exceeds "
            f"total credit limit (₹{profile.credit_limit:,.0f}). Operating above limit may trigger penalties "
            "and significantly dampen credit scores."
        )

    return FinancialProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        credit_score=profile.credit_score,
        monthly_income=profile.monthly_income,
        monthly_expenses=profile.monthly_expenses,
        total_debt=profile.total_debt,
        monthly_debt_payment=profile.monthly_debt_payment,
        credit_limit=profile.credit_limit,
        credit_balance=profile.credit_balance,
        credit_utilization=profile.credit_utilization,
        dti_ratio=profile.dti_ratio,
        missed_payments=profile.missed_payments,
        active_loans=profile.active_loans,
        existing_credit_cards=profile.existing_credit_cards,
        loan_types=profile.loan_types,
        updated_at=profile.updated_at,
        score_status=score_status,
        dti_status=dti_status,
        utilization_status=utilization_status,
        validation_warning=validation_warning
    )


@router.get("", response_model=FinancialProfileResponse)
def get_financial_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves the current user's financial profile.
    """
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Financial profile not found. Please complete the initial financial onboarding."
        )

    return format_profile_response(profile)


@router.post("", response_model=FinancialProfileResponse, status_code=status.HTTP_201_CREATED)
def create_financial_profile(
    profile_in: FinancialProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Scenario 1: Initial User Onboarding & Assessment.
    Calculates DTI & utilization, saves profile, and records the initial credit history baseline.
    """
    existing_profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Financial profile already exists. Use PUT to update your information."
        )

    # Automatic financial calculations
    dti = calculate_dti(profile_in.monthly_debt_payment, profile_in.monthly_income)
    utilization = calculate_credit_utilization(profile_in.credit_balance, profile_in.credit_limit)

    profile = FinancialProfile(
        user_id=current_user.id,
        credit_score=profile_in.credit_score,
        monthly_income=profile_in.monthly_income,
        monthly_expenses=profile_in.monthly_expenses,
        total_debt=profile_in.total_debt,
        monthly_debt_payment=profile_in.monthly_debt_payment,
        credit_limit=profile_in.credit_limit,
        credit_balance=profile_in.credit_balance,
        credit_utilization=utilization,
        dti_ratio=dti,
        missed_payments=profile_in.missed_payments,
        active_loans=profile_in.active_loans,
        existing_credit_cards=profile_in.existing_credit_cards,
        loan_types=profile_in.loan_types or "",
        updated_at=datetime.utcnow()
    )
    db.add(profile)
    db.flush()

    # Automatically create the initial baseline snapshot in CreditHistory
    initial_history = CreditHistory(
        user_id=current_user.id,
        credit_score=profile.credit_score,
        credit_utilization=profile.credit_utilization,
        dti_ratio=profile.dti_ratio,
        total_debt=profile.total_debt,
        monthly_debt_payment=profile.monthly_debt_payment,
        monthly_income=profile.monthly_income,
        missed_payments=profile.missed_payments,
        recorded_at=datetime.utcnow()
    )
    db.add(initial_history)
    db.commit()
    db.refresh(profile)

    return format_profile_response(profile)


@router.put("", response_model=FinancialProfileResponse)
def update_financial_profile(
    profile_in: FinancialProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Scenario 4: Real-Time Credit Health Monitoring.
    Recalculates DTI & utilization, updates profile, and archives a new credit history entry.
    """
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Financial profile does not exist yet. Please create it first."
        )

    # Recalculate indicators
    dti = calculate_dti(profile_in.monthly_debt_payment, profile_in.monthly_income)
    utilization = calculate_credit_utilization(profile_in.credit_balance, profile_in.credit_limit)

    profile.credit_score = profile_in.credit_score
    profile.monthly_income = profile_in.monthly_income
    profile.monthly_expenses = profile_in.monthly_expenses
    profile.total_debt = profile_in.total_debt
    profile.monthly_debt_payment = profile_in.monthly_debt_payment
    profile.credit_limit = profile_in.credit_limit
    profile.credit_balance = profile_in.credit_balance
    profile.credit_utilization = utilization
    profile.dti_ratio = dti
    profile.missed_payments = profile_in.missed_payments
    profile.active_loans = profile_in.active_loans
    profile.existing_credit_cards = profile_in.existing_credit_cards
    if profile_in.loan_types is not None:
        profile.loan_types = profile_in.loan_types
    profile.updated_at = datetime.utcnow()

    # Append new historical record
    history_entry = CreditHistory(
        user_id=current_user.id,
        credit_score=profile.credit_score,
        credit_utilization=profile.credit_utilization,
        dti_ratio=profile.dti_ratio,
        total_debt=profile.total_debt,
        monthly_debt_payment=profile.monthly_debt_payment,
        monthly_income=profile.monthly_income,
        missed_payments=profile.missed_payments,
        recorded_at=datetime.utcnow()
    )
    db.add(history_entry)
    db.commit()
    db.refresh(profile)

    return format_profile_response(profile)
