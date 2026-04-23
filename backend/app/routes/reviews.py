"""Customer review routes."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import CustomerReview, Order
from app.schemas import ReviewCreate, ReviewResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    body: ReviewCreate,
    db: AsyncSession = Depends(get_db),
):
    """Submit a customer review for a completed order (public endpoint)."""
    # Verify the order exists
    result = await db.execute(select(Order).where(Order.id == body.order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    review = CustomerReview(**body.model_dump())
    db.add(review)
    await db.flush()
    await db.refresh(review)
    return review


@router.get("", response_model=list[ReviewResponse])
async def list_reviews(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    """List customer reviews (authenticated users only)."""
    result = await db.execute(
        select(CustomerReview)
        .order_by(CustomerReview.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return result.scalars().all()
