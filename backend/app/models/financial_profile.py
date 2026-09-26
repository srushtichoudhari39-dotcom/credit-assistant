from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class FinancialProfile(Base):
    __tablename__ = "financial_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    # Core Financial Profile Fields
    credit_score = Column(Integer, nullable=False, default=700)
    monthly_income = Column(Float, nullable=False, default=0.0)
    monthly_expenses = Column(Float, nullable=False, default=0.0)
    total_debt = Column(Float, nullable=False, default=0.0)
    monthly_debt_payment = Column(Float, nullable=False, default=0.0)  # EMI payments
    credit_limit = Column(Float, nullable=False, default=0.0)
    credit_balance = Column(Float, nullable=False, default=0.0)  # Credit card outstanding balance
    
    # Auto-calculated and stored metrics
    credit_utilization = Column(Float, nullable=False, default=0.0)  # in percentage
    dti_ratio = Column(Float, nullable=False, default=0.0)  # in percentage

    # Additional Risk Factors in Indian Context
    missed_payments = Column(Integer, nullable=False, default=0)
    active_loans = Column(Integer, nullable=False, default=0)
    existing_credit_cards = Column(Integer, nullable=False, default=1)
    loan_types = Column(String(255), nullable=True, default="")  # e.g., "Home Loan, Personal Loan"

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="financial_profile")
