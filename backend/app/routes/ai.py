import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.financial_profile import FinancialProfile
from app.models.ai_consultation import AIConsultation
from app.schemas.ai import (
    AIConsultationRequest,
    AIConsultationResponse,
    RoadmapStep
)
from app.auth.dependencies import get_current_user
from app.services.gemini_service import get_ai_credit_advice

router = APIRouter(prefix="/ai", tags=["AI Advisor"])

@router.post("/advice", response_model=AIConsultationResponse)
async def request_ai_advice(
    request_in: AIConsultationRequest = AIConsultationRequest(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Scenario 2: AI Financial Consultation.
    Aggregates user's financial metrics securely, sends structured prompt to Google Gemini
    (with local compliant fallback), archives the consultation, and returns structured roadmap.
    """
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot generate AI consultation without a completed financial profile. Please complete your profile first."
        )

    financial_data = {
        "user_name": current_user.name,
        "credit_score": profile.credit_score,
        "monthly_income": profile.monthly_income,
        "monthly_expenses": profile.monthly_expenses,
        "total_debt": profile.total_debt,
        "monthly_debt_payment": profile.monthly_debt_payment,
        "credit_limit": profile.credit_limit,
        "credit_balance": profile.credit_balance,
        "credit_utilization": profile.credit_utilization,
        "dti_ratio": profile.dti_ratio,
        "missed_payments": profile.missed_payments,
        "active_loans": profile.active_loans,
        "loan_types": profile.loan_types,
        "additional_notes": request_in.additional_notes
    }

    # Execute AI consultation
    ai_result = await get_ai_credit_advice(financial_data)

    # Persist consultation to database
    consultation = AIConsultation(
        user_id=current_user.id,
        input_snapshot=json.dumps(financial_data),
        ai_response=json.dumps(ai_result),
        created_at=datetime.utcnow()
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)

    # Convert roadmap items to RoadmapStep schema
    raw_roadmap = ai_result.get("five_step_roadmap", [])
    roadmap_steps = []
    for step in raw_roadmap:
        if isinstance(step, dict):
            roadmap_steps.append(
                RoadmapStep(
                    step_number=step.get("step_number", len(roadmap_steps) + 1),
                    title=step.get("title", "Action Step"),
                    action=step.get("action", ""),
                    rationale=step.get("rationale", ""),
                    timeframe=step.get("timeframe", "Immediate")
                )
            )

    return AIConsultationResponse(
        id=consultation.id,
        summary=ai_result.get("summary", ""),
        credit_health_status=ai_result.get("credit_health_status", "Active Assessment"),
        bottlenecks=ai_result.get("bottlenecks", []),
        recommendations=ai_result.get("recommendations", []),
        five_step_roadmap=roadmap_steps,
        assumptions=ai_result.get("assumptions", []),
        disclaimer=ai_result.get("disclaimer", ""),
        created_at=consultation.created_at
    )


@router.get("/history", response_model=List[AIConsultationResponse])
def get_ai_consultation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns previous AI consultations logged for the current user.
    """
    records = (
        db.query(AIConsultation)
        .filter(AIConsultation.user_id == current_user.id)
        .order_by(AIConsultation.created_at.desc())
        .limit(10)
        .all()
    )

    history = []
    for rec in records:
        try:
            parsed = json.loads(rec.ai_response)
            raw_roadmap = parsed.get("five_step_roadmap", [])
            steps = [
                RoadmapStep(
                    step_number=s.get("step_number", i + 1),
                    title=s.get("title", ""),
                    action=s.get("action", ""),
                    rationale=s.get("rationale", ""),
                    timeframe=s.get("timeframe", "")
                )
                for i, s in enumerate(raw_roadmap)
            ]
            history.append(
                AIConsultationResponse(
                    id=rec.id,
                    summary=parsed.get("summary", ""),
                    credit_health_status=parsed.get("credit_health_status", ""),
                    bottlenecks=parsed.get("bottlenecks", []),
                    recommendations=parsed.get("recommendations", []),
                    five_step_roadmap=steps,
                    assumptions=parsed.get("assumptions", []),
                    disclaimer=parsed.get("disclaimer", ""),
                    created_at=rec.created_at
                )
            )
        except Exception:
            continue

    return history
