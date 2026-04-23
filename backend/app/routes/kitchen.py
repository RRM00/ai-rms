"""Kitchen status routes."""

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Order
from app.schemas import OrderResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/kitchen", tags=["Kitchen"])


@router.get("/active", response_model=list[OrderResponse])
async def get_active_orders(
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    """Return all active (not yet delivered) orders, oldest first."""
    result = await db.execute(
        select(Order)
        .where(Order.status != "Delivered")
        .order_by(Order.created_at.asc())
    )
    return result.scalars().all()
