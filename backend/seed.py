"""Database seed script — populates menu items and creates a default admin user."""

import asyncio
from app.database import engine, Base, AsyncSessionLocal
from app.models import User, MenuItem
from app.dependencies import hash_password

# Import all models so metadata is complete
import app.models  # noqa: F401


SAMPLE_MENU = [
    # Appetizers
    {"name": "Spring Rolls", "description": "Crispy vegetable spring rolls with sweet chili dip", "price": 5.99, "category": "Appetizers", "is_available": True},
    {"name": "Garlic Bread", "description": "Toasted ciabatta with roasted garlic butter and herbs", "price": 4.49, "category": "Appetizers", "is_available": True},
    {"name": "Chicken Wings", "description": "Smoky BBQ glazed wings with blue cheese dressing", "price": 8.99, "category": "Appetizers", "is_available": True},
    # Mains
    {"name": "Grilled Salmon", "description": "Atlantic salmon fillet with lemon dill sauce and seasonal veg", "price": 18.99, "category": "Mains", "is_available": True},
    {"name": "Butter Chicken", "description": "Tender chicken in a rich tomato-cream sauce with basmati rice", "price": 14.99, "category": "Mains", "is_available": True},
    {"name": "Margherita Pizza", "description": "San Marzano tomato, fresh mozzarella, and basil on sourdough crust", "price": 12.99, "category": "Mains", "is_available": True},
    {"name": "Spicy Thai Curry", "description": "Red curry with coconut milk, vegetables, and jasmine rice", "price": 13.49, "category": "Mains", "is_available": True},
    # Drinks
    {"name": "Iced Lemonade", "description": "Fresh-squeezed lemon with a hint of mint", "price": 3.99, "category": "Drinks", "is_available": True},
    {"name": "Mango Lassi", "description": "Creamy yogurt blended with Alphonso mango", "price": 4.99, "category": "Drinks", "is_available": True},
    {"name": "Espresso", "description": "Double-shot single-origin espresso", "price": 2.99, "category": "Drinks", "is_available": True},
    # Desserts
    {"name": "Chocolate Lava Cake", "description": "Warm dark chocolate cake with a molten center and vanilla ice cream", "price": 7.99, "category": "Desserts", "is_available": True},
    {"name": "Tiramisu", "description": "Classic Italian dessert with mascarpone, espresso, and cocoa", "price": 6.99, "category": "Desserts", "is_available": True},
]

DEFAULT_ADMIN = {
    "username": "admin",
    "name": "Restaurant Admin",
    "role": "admin",
    "password": "admin123",
}

DEFAULT_STAFF = {
    "username": "staff",
    "name": "Front Desk",
    "role": "staff",
    "password": "staff123",
}


async def seed():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Seed admin user
        admin = User(
            username=DEFAULT_ADMIN["username"],
            name=DEFAULT_ADMIN["name"],
            role=DEFAULT_ADMIN["role"],
            hashed_password=hash_password(DEFAULT_ADMIN["password"]),
        )
        session.add(admin)

        # Seed staff user
        staff = User(
            username=DEFAULT_STAFF["username"],
            name=DEFAULT_STAFF["name"],
            role=DEFAULT_STAFF["role"],
            hashed_password=hash_password(DEFAULT_STAFF["password"]),
        )
        session.add(staff)

        # Seed menu items
        for item_data in SAMPLE_MENU:
            session.add(MenuItem(**item_data))

        await session.commit()
        print(f"✓ Seeded {len(SAMPLE_MENU)} menu items")
        print(f"✓ Created admin user  (username: {DEFAULT_ADMIN['username']}, password: {DEFAULT_ADMIN['password']})")
        print(f"✓ Created staff user  (username: {DEFAULT_STAFF['username']}, password: {DEFAULT_STAFF['password']})")


if __name__ == "__main__":
    asyncio.run(seed())
