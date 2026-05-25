"""AI-powered endpoints: analytics and sentiment analysis."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.schemas import (
    AnalyticsRequest,
    AnalyticsResponse,
    SentimentRequest,
    SentimentResponse,
)

router = APIRouter(prefix="/api/ai", tags=["AI"])


def _check_api_key() -> None:
    """Raise 503 if the Google API key is not configured."""
    if not settings.GOOGLE_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI features are unavailable — GOOGLE_API_KEY is not configured.",
        )


@router.post("/analytics", response_model=AnalyticsResponse)
async def analytics(
    body: AnalyticsRequest,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    """Run a natural-language analytics query against the database (admin only)."""
    _check_api_key()

    from app.ai.analytics import run_analytics

    try:
        result = await run_analytics(body.question, db)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analytics query failed: {exc}",
        )
    return result


@router.post("/sentiment", response_model=SentimentResponse)
async def sentiment(
    body: SentimentRequest,
    _user=Depends(get_current_user),
):
    """Analyse the sentiment of a review text (authenticated users)."""
    _check_api_key()

    from app.ai.sentiment import analyze_sentiment

    try:
        result = await analyze_sentiment(body.review_text)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sentiment analysis failed: {exc}",
        )
    return result
