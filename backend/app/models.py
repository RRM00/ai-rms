"""SQLAlchemy ORM models for the AI-RMS database."""

from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, JSON, ForeignKey
)
from app.database import Base


class User(Base):
    """Restaurant staff / admin user accounts."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False, default="staff")  # "staff" | "admin"
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )


class MenuItem(Base):
    """Items available on the restaurant menu."""
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    category = Column(String(50), nullable=False, index=True)  # Appetizers, Mains, etc.
    image_url = Column(String(255), nullable=True)
    is_available = Column(Boolean, nullable=False, default=True)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )


class Order(Base):
    """A customer order containing one or more menu items."""
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(
        String(20), nullable=False, default="Received"
    )  # Received | Preparing | Ready | Delivered
    total = Column(Float, nullable=False, default=0.0)
    items = Column(JSON, nullable=False)  # [{menu_item_id, name, quantity, price}, ...]
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc),
        index=True,
    )


class CustomerReview(Base):
    """Customer feedback linked to a specific order."""
    __tablename__ = "customer_reviews"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    review_text = Column(Text, nullable=False)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
