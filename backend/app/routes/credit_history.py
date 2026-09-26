from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.financial_profile import FinancialProfile
from app.models.credit_history import CreditHistory
from app.schemas.credit_history import (
    CreditHistoryCreate,
    CreditHistoryResponse,
    CreditHistorySummary
)
from app.auth.dependencies import get_current_user
from app.utils.constants import get_credit_score_status

router = APIRouter(prefix="/credit-history", tags=["Credit History"])

@router.get("", response_model=CreditHistorySummary)
def get_credit_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns full chronological credit score history for the user,
    with baseline change calculations.
    """
    records = (
        db.query(CreditHistory)
        .filter(CreditHistory.user_id == current_user.id)
        .order_by(CreditHistory.recorded_at.asc())
        .all()
    )

    formatted_records = []
    for rec in records:
        formatted_records.append(
            CreditHistoryResponse(
                id=rec.id,
                user_id=rec.user_id,
                credit_score=rec.credit_score,
                credit_utilization=rec.credit_utilization,
                dti_ratio=rec.dti_ratio,
                total_debt=rec.total_debt,
                monthly_debt_payment=rec.monthly_debt_payment,
                monthly_income=rec.monthly_income,
                missed_payments=rec.missed_payments,
                recorded_at=rec.recorded_at,
                score_status=get_credit_score_status(rec.credit_score)
            )
        )

    if not records:
        return CreditHistorySummary(
            records=[],
            total_records=0,
            earliest_score=None,
            latest_score=None,
            net_score_change=None,
            wording="No credit history recorded yet."
        )

    earliest = records[0].credit_score
    latest = records[-1].credit_score
    net_change = latest - earliest

    sign = f"+{net_change}" if net_change > 0 else f"{net_change}"
    wording = (
        f"Change since your first recorded score: {sign} points"
        if len(records) > 1
        else "Baseline assessment logged."
    )

    return CreditHistorySummary(
        records=formatted_records,
        total_records=len(records),
        earliest_score=earliest,
        latest_score=latest,
        net_score_change=net_change,
        wording=wording
    )


@router.post("", response_model=CreditHistoryResponse, status_code=status.HTTP_201_CREATED)
def add_credit_history_entry(
    entry_in: CreditHistoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Manually records a periodic credit score update (e.g. after receiving a new monthly bureau report).
    Also syncs the updated score to the user's active FinancialProfile.
    """
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()

    utilization = entry_in.credit_utilization if entry_in.credit_utilization is not None else (profile.credit_utilization if profile else 0.0)
    dti = entry_in.dti_ratio if entry_in.dti_ratio is not None else (profile.dti_ratio if profile else 0.0)
    total_debt = entry_in.total_debt if entry_in.total_debt is not None else (profile.total_debt if profile else 0.0)
    monthly_debt = entry_in.monthly_debt_payment if entry_in.monthly_debt_payment is not None else (profile.monthly_debt_payment if profile else 0.0)
    monthly_income = entry_in.monthly_income if entry_in.monthly_income is not None else (profile.monthly_income if profile else 0.0)
    missed = entry_in.missed_payments if entry_in.missed_payments is not None else (profile.missed_payments if profile else 0)

    history = CreditHistory(
        user_id=current_user.id,
        credit_score=entry_in.credit_score,
        credit_utilization=utilization,
        dti_ratio=dti,
        total_debt=total_debt,
        monthly_debt_payment=monthly_debt,
        monthly_income=monthly_income,
        missed_payments=missed,
        recorded_at=datetime.utcnow()
    )
    db.add(history)

    # Sync score to profile if profile exists
    if profile:
        profile.credit_score = entry_in.credit_score
        profile.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(history)

    return CreditHistoryResponse(
        id=history.id,
        user_id=history.user_id,
        credit_score=history.credit_score,
        credit_utilization=history.credit_utilization,
        dti_ratio=history.dti_ratio,
        total_debt=history.total_debt,
        monthly_debt_payment=history.monthly_debt_payment,
        monthly_income=history.monthly_income,
        missed_payments=history.missed_payments,
        recorded_at=history.recorded_at,
        score_status=get_credit_score_status(history.credit_score)
    )
