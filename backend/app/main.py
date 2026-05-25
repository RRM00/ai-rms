"""FastAPI application entry point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base

# Import all models so Base.metadata knows about them
import app.models  # noqa: F401

# Import route modules
from app.routes import auth, menu, orders, kitchen, reviews, ai


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="AI-RMS — Restaurant Management System",
    description="AI-Enhanced Point of Sale and Restaurant Management API",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow the React frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(menu.router)
app.include_router(orders.router)
app.include_router(kitchen.router)
app.include_router(reviews.router)
app.include_router(ai.router)


@app.get("/", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": "AI-RMS"}
