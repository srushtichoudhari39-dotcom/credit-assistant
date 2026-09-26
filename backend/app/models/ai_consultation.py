from datetime import datetime
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class AIConsultation(Base):
    __tablename__ = "ai_consultations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    input_snapshot = Column(Text, nullable=False)  # JSON serialized snapshot of user's financial profile
    ai_response = Column(Text, nullable=False)     # JSON serialized Gemini advice response
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="ai_consultations")
