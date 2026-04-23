"""Order processing and history routes."""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Order, MenuItem
from app.schemas import (
    OrderCreate,
    OrderResponse,
    OrderStatusUpdate,
    OrderItemDetail,
)
from app.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.get("", response_model=list[OrderResponse])
async def list_orders(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    date_from: Optional[datetime] = Query(None, description="Filter from date (ISO)"),
    date_to: Optional[datetime] = Query(None, description="Filter to date (ISO)"),
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    """List order history for admin dashboard with optional date filtering."""
    query = select(Order)
    if date_from:
        query = query.where(Order.created_at >= date_from)
    if date_to:
        query = query.where(Order.created_at <= date_to)
    query = query.order_by(Order.created_at.desc()).limit(limit).offset(offset)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    body: OrderCreate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    """Submit a cart payload to create a new order.

    Resolves menu item IDs to current names/prices and computes the total.
    """
    resolved_items: list[dict] = []
    total = 0.0

    for cart_item in body.items:
        result = await db.execute(
            select(MenuItem).where(MenuItem.id == cart_item.menu_item_id)
        )
        menu_item = result.scalar_one_or_none()
        if not menu_item:
            raise HTTPException(
                status_code=400,
                detail=f"Menu item {cart_item.menu_item_id} not found",
            )
        if not menu_item.is_available:
            raise HTTPException(
                status_code=400,
                detail=f"'{menu_item.name}' is currently unavailable",
            )

        subtotal = round(menu_item.price * cart_item.quantity, 2)
        total += subtotal
        resolved_items.append(
            OrderItemDetail(
                menu_item_id=menu_item.id,
                name=menu_item.name,
                quantity=cart_item.quantity,
                unit_price=menu_item.price,
                subtotal=subtotal,
            ).model_dump()
        )

    order = Order(
        items=resolved_items,
        total=round(total, 2),
        status="Received",
    )
    db.add(order)
    await db.flush()
    await db.refresh(order)
    return order


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    """Fetch a single order by ID."""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    body: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    """Update an order's status (kitchen workflow)."""
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = body.status
    await db.flush()
    await db.refresh(order)
    return order
