from app.routes.auth import router as auth_router
from app.routes.financial_profile import router as financial_profile_router
from app.routes.dashboard import router as dashboard_router
from app.routes.credit_history import router as credit_history_router
from app.routes.ai import router as ai_router

__all__ = [
    "auth_router",
    "financial_profile_router",
    "dashboard_router",
    "credit_history_router",
    "ai_router",
]
