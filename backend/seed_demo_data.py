"""
Database seeder for local demo and testing.
Seeds user Arjun Verma with rich historical Indian credit data.
"""
import os
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base
from app.models.user import User
from app.models.financial_profile import FinancialProfile
from app.models.credit_history import CreditHistory
from app.auth.passwords import hash_password
from app.services.calculations import calculate_dti, calculate_credit_utilization

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    demo_email = "arjun.verma@example.com"
    existing = db.query(User).filter(User.email == demo_email).first()
    if existing:
        print(f"Demo user {demo_email} already exists. Cleaning up and re-seeding...")
        db.delete(existing)
        db.commit()

    # Create demo user
    user = User(
        name="Arjun Verma",
        email=demo_email,
        password_hash=hash_password("Password123!"),
        created_at=datetime.utcnow() - timedelta(days=120)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 4 Historical progression milestones
    history_milestones = [
        {
            "days_ago": 120,
            "score": 680,
            "income": 70000.0,
            "debt": 390000.0,
            "emi": 22400.0,
            "limit": 150000.0,
            "balance": 97500.0,  # 65% utilization
            "missed": 1
        },
        {
            "days_ago": 90,
            "score": 700,
            "income": 70000.0,
            "debt": 360000.0,
            "emi": 19600.0,
            "limit": 150000.0,
            "balance": 72000.0,  # 48% utilization
            "missed": 0
        },
        {
            "days_ago": 45,
            "score": 725,
            "income": 75000.0,
            "debt": 340000.0,
            "emi": 19500.0,
            "limit": 150000.0,
            "balance": 52500.0,  # 35% utilization
            "missed": 0
        },
        {
            "days_ago": 0,
            "score": 742,
            "income": 75000.0,
            "debt": 320000.0,
            "emi": 18500.0,
            "limit": 150000.0,
            "balance": 42000.0,  # 28% utilization
            "missed": 0
        }
    ]

    for m in history_milestones:
        dti = calculate_dti(m["emi"], m["income"])
        util = calculate_credit_utilization(m["balance"], m["limit"])
        hist = CreditHistory(
            user_id=user.id,
            credit_score=m["score"],
            credit_utilization=util,
            dti_ratio=dti,
            total_debt=m["debt"],
            monthly_debt_payment=m["emi"],
            monthly_income=m["income"],
            missed_payments=m["missed"],
            recorded_at=datetime.utcnow() - timedelta(days=m["days_ago"])
        )
        db.add(hist)

    # Active profile (current)
    latest = history_milestones[-1]
    curr_dti = calculate_dti(latest["emi"], latest["income"])
    curr_util = calculate_credit_utilization(latest["balance"], latest["limit"])

    profile = FinancialProfile(
        user_id=user.id,
        credit_score=latest["score"],
        monthly_income=latest["income"],
        monthly_expenses=35000.0,
        total_debt=latest["debt"],
        monthly_debt_payment=latest["emi"],
        credit_limit=latest["limit"],
        credit_balance=latest["balance"],
        credit_utilization=curr_util,
        dti_ratio=curr_dti,
        missed_payments=latest["missed"],
        active_loans=1,
        existing_credit_cards=2,
        loan_types="Personal Loan, Two-Wheeler Loan",
        updated_at=datetime.utcnow()
    )
    db.add(profile)
    db.commit()

    print(f"Successfully seeded demo user: {demo_email} with 4 historical milestones!")
    db.close()

if __name__ == "__main__":
    seed()
