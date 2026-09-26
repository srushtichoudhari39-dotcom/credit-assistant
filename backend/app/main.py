import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import engine, Base
from app.routes.auth import router as auth_router
from app.routes.financial_profile import router as financial_profile_router
from app.routes.dashboard import router as dashboard_router
from app.routes.credit_history import router as credit_history_router
from app.routes.ai import router as ai_router

load_dotenv()

# Automatically create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Credit Assistant API",
    description="AI-driven financial platform designed for the Indian credit ecosystem.",
    version="1.0.0"
)

# CORS configuration
cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000")
origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers under /api
app.include_router(auth_router, prefix="/api")
app.include_router(financial_profile_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(credit_history_router, prefix="/api")
app.include_router(ai_router, prefix="/api")

@app.get("/api/health", tags=["Health"])
def health_check():
    """
    Health check endpoint to verify backend service and database readiness.
    """
    return {
        "status": "healthy",
        "service": "Credit Assistant API",
        "version": "1.0.0",
        "ecosystem": "Indian Retail Credit (INR ₹)"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception fallback returning consistent JSON error structures.
    """
    return JSONResponse(
        status_code=500,
        content={"detail": f"An unexpected internal error occurred: {str(exc)}"}
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
