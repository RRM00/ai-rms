"""Pydantic schemas for request/response validation."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# ── Auth ──────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    name: str = Field(..., max_length=100)
    password: str = Field(..., min_length=6)
    role: str = Field("staff", pattern="^(staff|admin)$")


class UserResponse(BaseModel):
    id: int
    username: str
    name: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Menu ──────────────────────────────────────────────────────────────────────

class MenuItemCreate(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    category: str = Field(..., max_length=50)
    image_url: Optional[str] = None
    is_available: bool = True


class MenuItemUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    category: Optional[str] = Field(None, max_length=50)
    image_url: Optional[str] = None
    is_available: Optional[bool] = None


class MenuItemResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: float
    category: str
    image_url: Optional[str]
    is_available: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Orders ────────────────────────────────────────────────────────────────────

class OrderItemPayload(BaseModel):
    """A single item in the cart payload."""
    menu_item_id: int
    quantity: int = Field(..., ge=1)


class OrderCreate(BaseModel):
    """Cart submission payload."""
    items: List[OrderItemPayload] = Field(..., min_length=1)


class OrderItemDetail(BaseModel):
    """Resolved item stored in Order.items JSON."""
    menu_item_id: int
    name: str
    quantity: int
    unit_price: float
    subtotal: float


class OrderResponse(BaseModel):
    id: int
    status: str
    total: float
    items: List[OrderItemDetail]
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str = Field(
        ..., pattern="^(Received|Preparing|Ready|Delivered)$"
    )


# ── Reviews ───────────────────────────────────────────────────────────────────

class ReviewCreate(BaseModel):
    order_id: int
    review_text: str = Field(..., min_length=1)


class ReviewResponse(BaseModel):
    id: int
    order_id: int
    review_text: str
    created_at: datetime

    model_config = {"from_attributes": True}
