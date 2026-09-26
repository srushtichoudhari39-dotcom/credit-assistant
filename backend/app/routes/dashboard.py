from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.financial_profile import FinancialProfile
from app.models.credit_history import CreditHistory
from app.schemas.dashboard import DashboardResponse, MetricDelta
from app.schemas.credit_history import CreditHistoryResponse
from app.routes.financial_profile import format_profile_response
from app.auth.dependencies import get_current_user
from app.services.calculations import (
    identify_bottlenecks,
    calculate_metric_deltas
)
from app.utils.constants import MANDATORY_DISCLAIMER, get_credit_score_status

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardResponse)
def get_dashboard_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns aggregated dashboard metrics, progress deltas (since first & previous records),
    historical trendlines for charts, bottleneck diagnosis, and mandatory educational disclaimer.
    """
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    
    if not profile:
        return DashboardResponse(
            user_name=current_user.name,
            user_email=current_user.email,
            has_profile=False,
            profile=None,
            first_record_delta=None,
            previous_record_delta=None,
            score_history=[],
            bottlenecks=[],
            disclaimer=MANDATORY_DISCLAIMER
        )

    formatted_profile = format_profile_response(profile)

    # Fetch credit history sorted chronologically
    history_records = (
        db.query(CreditHistory)
        .filter(CreditHistory.user_id == current_user.id)
        .order_by(CreditHistory.recorded_at.asc())
        .all()
    )

    history_items: List[CreditHistoryResponse] = []
    for rec in history_records:
        history_items.append(
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

    # Current snapshot dict for delta calculation
    current_snapshot = {
        "credit_score": profile.credit_score,
        "credit_utilization": profile.credit_utilization,
        "dti_ratio": profile.dti_ratio,
        "total_debt": profile.total_debt,
        "missed_payments": profile.missed_payments,
    }

    first_record_delta = None
    previous_record_delta = None

    if len(history_records) > 0:
        first_rec = history_records[0]
        first_snapshot = {
            "credit_score": first_rec.credit_score,
            "credit_utilization": first_rec.credit_utilization,
            "dti_ratio": first_rec.dti_ratio,
            "total_debt": first_rec.total_debt or 0.0,
            "missed_payments": first_rec.missed_payments or 0,
        }
        
        delta_first = calculate_metric_deltas(current_snapshot, first_snapshot)
        score_diff = delta_first["score_change"]
        sign_str = f"+{score_diff}" if score_diff > 0 else f"{score_diff}"
        wording_first = (
            f"Change since your first recorded score: {sign_str} points"
            if len(history_records) > 1
            else "Initial assessment recorded."
        )
        
        first_record_delta = MetricDelta(
            has_baseline=len(history_records) > 1,
            score_change=delta_first["score_change"],
            utilization_change=delta_first["utilization_change"],
            dti_change=delta_first["dti_change"],
            debt_change=delta_first["debt_change"],
            missed_payments_change=delta_first["missed_payments_change"],
            wording=wording_first
        )

    if len(history_records) >= 2:
        prev_rec = history_records[-2]  # Immediate previous record before the current one
        prev_snapshot = {
            "credit_score": prev_rec.credit_score,
            "credit_utilization": prev_rec.credit_utilization,
            "dti_ratio": prev_rec.dti_ratio,
            "total_debt": prev_rec.total_debt or 0.0,
            "missed_payments": prev_rec.missed_payments or 0,
        }
        delta_prev = calculate_metric_deltas(current_snapshot, prev_snapshot)
        score_diff_prev = delta_prev["score_change"]
        sign_prev = f"+{score_diff_prev}" if score_diff_prev > 0 else f"{score_diff_prev}"
        wording_prev = f"Change since previous record: {sign_prev} points"

        previous_record_delta = MetricDelta(
            has_baseline=True,
            score_change=delta_prev["score_change"],
            utilization_change=delta_prev["utilization_change"],
            dti_change=delta_prev["dti_change"],
            debt_change=delta_prev["debt_change"],
            missed_payments_change=delta_prev["missed_payments_change"],
            wording=wording_prev
        )

    # Identify financial bottlenecks
    bottlenecks = identify_bottlenecks(
        credit_score=profile.credit_score,
        credit_utilization=profile.credit_utilization,
        dti_ratio=profile.dti_ratio,
        missed_payments=profile.missed_payments,
        credit_balance=profile.credit_balance,
        credit_limit=profile.credit_limit
    )

    return DashboardResponse(
        user_name=current_user.name,
        user_email=current_user.email,
        has_profile=True,
        profile=formatted_profile,
        first_record_delta=first_record_delta,
        previous_record_delta=previous_record_delta,
        score_history=history_items,
        bottlenecks=bottlenecks,
        disclaimer=MANDATORY_DISCLAIMER
    )
