import asyncio
import sys
from datetime import datetime, timedelta, timezone
from sqlalchemy import select, delete

from database import AsyncSessionLocal
from models.user import User
from models.plant import Plant, PlantKind, PlantStatus


async def seed():
    async with AsyncSessionLocal() as db:
        # Find first user
        result = await db.execute(select(User))
        user = result.scalars().first()
        if not user:
            print("ERROR: No users found in the database.")
            print("Please open Rootly in your browser, complete the setup/registration first, and then run the seed script again.")
            sys.exit(1)

        print(f"Seeding mock plants for user: {user.email} (ID: {user.id})")

        # Seed areas first
        from models.area import Area
        await db.execute(delete(Area).where(Area.user_id == user.id))

        areas_list = [
            Area(user_id=user.id, name="Living room"),
            Area(user_id=user.id, name="Bedroom"),
            Area(user_id=user.id, name="Office"),
            Area(user_id=user.id, name="Kitchen"),
        ]
        db.add_all(areas_list)
        await db.commit()

        # Delete existing plants for this user to make seeding idempotent
        await db.execute(delete(Plant).where(Plant.user_id == user.id))

        now = datetime.utcnow()

        plants = [
            Plant(
                user_id=user.id,
                name="Monstera",
                species="Monstera deliciosa",
                kind=PlantKind.monstera,
                room="Living room",
                moisture=0.72,
                status=PlantStatus.thriving,
                every=9,
                light="Bright, indirect",
                note="Soil looks good for now.",
                growth=[3.0, 4.0, 4.0, 5.0, 6.0, 6.0, 7.0],
                last_water=now - timedelta(days=5),
            ),
            Plant(
                user_id=user.id,
                name="Fiddle-leaf fig",
                species="Ficus lyrata",
                kind=PlantKind.fig,
                room="Living room",
                moisture=0.22,
                status=PlantStatus.dry,
                every=7,
                light="Bright, indirect",
                note="Due for a drink.",
                growth=[2.0, 2.0, 3.0, 3.0, 4.0, 4.0, 4.0],
                last_water=now - timedelta(days=8),
            ),
            Plant(
                user_id=user.id,
                name="Pothos",
                species="Epipremnum aureum",
                kind=PlantKind.pothos,
                room="Bedroom",
                moisture=0.94,
                status=PlantStatus.watered,
                every=6,
                light="Low to bright",
                note="Watered today.",
                growth=[5.0, 6.0, 6.0, 7.0, 8.0, 9.0, 11.0],
                last_water=now,
            ),
            Plant(
                user_id=user.id,
                name="Snake plant",
                species="Dracaena trifasciata",
                kind=PlantKind.snake,
                room="Office",
                moisture=0.48,
                status=PlantStatus.soon,
                every=14,
                light="Any",
                note="Watering scheduled for tomorrow.",
                growth=[4.0, 4.0, 5.0, 5.0, 5.0, 6.0, 6.0],
                last_water=now - timedelta(days=11),
            ),
            Plant(
                user_id=user.id,
                name="Echeveria",
                species="Echeveria elegans",
                kind=PlantKind.succulent,
                room="Kitchen",
                moisture=0.60,
                status=PlantStatus.thriving,
                every=18,
                light="Direct sun",
                note="Growth is steady this week.",
                growth=[1.0, 1.0, 2.0, 2.0, 2.0, 3.0, 3.0],
                last_water=now - timedelta(days=7),
            )
        ]

        db.add_all(plants)
        await db.commit()
        print("Successfully seeded 5 mock plants!")


if __name__ == "__main__":
    asyncio.run(seed())
