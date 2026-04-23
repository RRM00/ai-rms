"""Menu CRUD routes."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import MenuItem
from app.schemas import MenuItemCreate, MenuItemUpdate, MenuItemResponse
from app.dependencies import require_admin, get_current_user

router = APIRouter(prefix="/api/menu", tags=["Menu"])


@router.get("", response_model=list[MenuItemResponse])
async def list_menu_items(
    category: Optional[str] = Query(None, description="Filter by category"),
    db: AsyncSession = Depends(get_db),
):
    """List all available menu items, optionally filtered by category."""
    query = select(MenuItem).where(MenuItem.is_available == True)
    if category:
        query = query.where(MenuItem.category == category)
    query = query.order_by(MenuItem.category, MenuItem.name)
    result = await db.execute(query)
    return result.scalars().all()


@router.post(
    "", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED
)
async def create_menu_item(
    body: MenuItemCreate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    """Create a new menu item (admin only)."""
    item = MenuItem(**body.model_dump())
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=MenuItemResponse)
async def update_menu_item(
    item_id: int,
    body: MenuItemUpdate,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    """Update a menu item's details (admin only)."""
    result = await db.execute(select(MenuItem).where(MenuItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    await db.flush()
    await db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_menu_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    _admin=Depends(require_admin),
):
    """Delete a menu item (admin only)."""
    result = await db.execute(select(MenuItem).where(MenuItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    await db.delete(item)
