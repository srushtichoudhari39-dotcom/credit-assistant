from datetime import datetime
from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class CreditHistory(Base):
    __tablename__ = "credit_histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    credit_score = Column(Integer, nullable=False)
    credit_utilization = Column(Float, nullable=False)
    dti_ratio = Column(Float, nullable=False)
    
    # Financial snapshot details for delta analysis
    total_debt = Column(Float, nullable=True)
    monthly_debt_payment = Column(Float, nullable=True)
    monthly_income = Column(Float, nullable=True)
    missed_payments = Column(Integer, nullable=True, default=0)

    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="credit_history")
