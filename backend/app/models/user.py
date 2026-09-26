from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    financial_profile = relationship("FinancialProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    credit_history = relationship("CreditHistory", back_populates="user", cascade="all, delete-orphan", order_by="CreditHistory.recorded_at.asc()")
    ai_consultations = relationship("AIConsultation", back_populates="user", cascade="all, delete-orphan", order_by="AIConsultation.created_at.desc()")
