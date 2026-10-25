"""
Seed data for Royal Rasoi restaurant.
Populates tables, seats, menu items, demo users, and demo reservations.
"""
from datetime import date, datetime, timedelta
import random
import string

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from models import (
    User, Table, Seat, Reservation, WaitingList, MenuItem,
    ZoneEnum, TableStatusEnum, ReservationStatusEnum, PaymentStatusEnum,
    WaitingListStatusEnum, CategoryEnum, SpiceLevelEnum,
)
from auth import get_password_hash


def generate_booking_ref() -> str:
    chars = string.ascii_uppercase + string.digits
    return "RR" + "".join(random.choices(chars, k=8))


# ── Table definitions ─────────────────────────────────────────────────────

TABLE_DATA = [
    # Main Hall (1–10)
    {"name": "Table 1",  "capacity": 2, "zone": ZoneEnum.main_hall, "x": 1.0, "y": 1.0, "z": 0.0},
    {"name": "Table 2",  "capacity": 4, "zone": ZoneEnum.main_hall, "x": 2.0, "y": 1.0, "z": 0.0},
    {"name": "Table 3",  "capacity": 4, "zone": ZoneEnum.main_hall, "x": 3.0, "y": 1.0, "z": 0.0},
    {"name": "Table 4",  "capacity": 6, "zone": ZoneEnum.main_hall, "x": 4.0, "y": 1.0, "z": 0.0},
    {"name": "Table 5",  "capacity": 6, "zone": ZoneEnum.main_hall, "x": 5.0, "y": 1.0, "z": 0.0},
    {"name": "Table 6",  "capacity": 8, "zone": ZoneEnum.main_hall, "x": 1.0, "y": 3.0, "z": 0.0},
    {"name": "Table 7",  "capacity": 2, "zone": ZoneEnum.main_hall, "x": 2.0, "y": 3.0, "z": 0.0},
    {"name": "Table 8",  "capacity": 4, "zone": ZoneEnum.main_hall, "x": 3.0, "y": 3.0, "z": 0.0},
    {"name": "Table 9",  "capacity": 4, "zone": ZoneEnum.main_hall, "x": 4.0, "y": 3.0, "z": 0.0},
    {"name": "Table 10", "capacity": 6, "zone": ZoneEnum.main_hall, "x": 5.0, "y": 3.0, "z": 0.0},
    # Outdoor/Terrace (11–14)
    {"name": "Table 11", "capacity": 4, "zone": ZoneEnum.outdoor, "x": 1.0, "y": 6.0, "z": 0.0},
    {"name": "Table 12", "capacity": 4, "zone": ZoneEnum.outdoor, "x": 2.0, "y": 6.0, "z": 0.0},
    {"name": "Table 13", "capacity": 6, "zone": ZoneEnum.outdoor, "x": 3.0, "y": 7.0, "z": 0.0},
    {"name": "Table 14", "capacity": 2, "zone": ZoneEnum.outdoor, "x": 4.0, "y": 8.0, "z": 0.0},
    # Private Dining (15–17)
    {"name": "Table 15", "capacity": 8,  "zone": ZoneEnum.private, "x": 6.0, "y": 1.0, "z": 0.0},
    {"name": "Table 16", "capacity": 10, "zone": ZoneEnum.private, "x": 7.0, "y": 2.0, "z": 0.0},
    {"name": "Table 17", "capacity": 6,  "zone": ZoneEnum.private, "x": 8.0, "y": 3.0, "z": 0.0},
    # Bar Seating (18–20)
    {"name": "Table 18", "capacity": 2, "zone": ZoneEnum.bar, "x": 7.0, "y": 4.0, "z": 0.0},
    {"name": "Table 19", "capacity": 2, "zone": ZoneEnum.bar, "x": 8.0, "y": 4.0, "z": 0.0},
    {"name": "Table 20", "capacity": 4, "zone": ZoneEnum.bar, "x": 9.0, "y": 5.0, "z": 0.0},
]

# ── Menu definitions ──────────────────────────────────────────────────────

MENU_ITEMS = [
    # Appetizers
    {"name": "Paneer Tikka", "description": "Marinated cottage cheese grilled in tandoor with spices", "price": 320, "category": CategoryEnum.appetizer, "is_veg": True, "spice_level": SpiceLevelEnum.medium, "image_url": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400"},
    {"name": "Chicken Tikka", "description": "Tender chicken marinated in yogurt and spices, grilled to perfection", "price": 380, "category": CategoryEnum.appetizer, "is_veg": False, "spice_level": SpiceLevelEnum.medium, "image_url": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400"},
    {"name": "Hara Bhara Kebab", "description": "Spinach and peas kebab with aromatic herbs", "price": 280, "category": CategoryEnum.appetizer, "is_veg": True, "spice_level": SpiceLevelEnum.mild, "image_url": "https://carveyourcraving.com/wp-content/uploads/2024/03/hara-bhara-kebab_.jpg"},
    {"name": "Seekh Kebab", "description": "Minced lamb skewers with fresh herbs and spices", "price": 360, "category": CategoryEnum.appetizer, "is_veg": False, "spice_level": SpiceLevelEnum.hot, "image_url": "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400"},
    {"name": "Dahi Ke Sholay", "description": "Crispy yogurt filled parcels with chutney", "price": 260, "category": CategoryEnum.appetizer, "is_veg": True, "spice_level": SpiceLevelEnum.mild, "image_url": "https://binjalsvegkitchen.com/wp-content/uploads/2026/03/Dahi-Ke-Sholey-H1.jpg"},
    {"name": "Malai Tikka", "description": "Creamy chicken tikka with a mild cashew marinade", "price": 340, "category": CategoryEnum.appetizer, "is_veg": False, "spice_level": SpiceLevelEnum.mild, "image_url": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400"},
    {"name": "Aloo Tikki", "description": "Crispy potato patties served with mint and tamarind chutney", "price": 220, "category": CategoryEnum.appetizer, "is_veg": True, "spice_level": SpiceLevelEnum.mild, "image_url": "https://sinfullyspicy.com/wp-content/uploads/2023/03/1-1.jpg"},
    {"name": "Chicken 65", "description": "Spicy deep-fried chicken with curry leaves and green chillies", "price": 400, "category": CategoryEnum.appetizer, "is_veg": False, "spice_level": SpiceLevelEnum.hot, "image_url": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400"},
    # Main Course
    {"name": "Butter Chicken", "description": "Tender chicken in rich tomato-butter gravy", "price": 460, "category": CategoryEnum.main_course, "is_veg": False, "spice_level": SpiceLevelEnum.mild, "image_url": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400"},
    {"name": "Paneer Butter Masala", "description": "Cottage cheese in creamy tomato-butter sauce", "price": 380, "category": CategoryEnum.main_course, "is_veg": True, "spice_level": SpiceLevelEnum.mild, "image_url": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400"},
    {"name": "Dal Makhani", "description": "Slow-cooked black lentils with butter and cream", "price": 320, "category": CategoryEnum.main_course, "is_veg": True, "spice_level": SpiceLevelEnum.mild, "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400"},
    {"name": "Lamb Rogan Josh", "description": "Aromatic Kashmiri lamb curry with whole spices", "price": 520, "category": CategoryEnum.main_course, "is_veg": False, "spice_level": SpiceLevelEnum.hot, "image_url": "https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=400"},
    {"name": "Chicken Kadai", "description": "Chicken cooked with bell peppers in kadai masala", "price": 440, "category": CategoryEnum.main_course, "is_veg": False, "spice_level": SpiceLevelEnum.medium, "image_url": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400"},
    {"name": "Palak Paneer", "description": "Cottage cheese cubes in creamy spinach gravy", "price": 360, "category": CategoryEnum.main_course, "is_veg": True, "spice_level": SpiceLevelEnum.mild, "image_url": "https://www.indianveggiedelight.com/wp-content/uploads/2017/10/palak-paneer-recipe-featured.jpg"},
    {"name": "Mutton Biryani", "description": "Fragrant basmati rice cooked with tender mutton", "price": 580, "category": CategoryEnum.main_course, "is_veg": False, "spice_level": SpiceLevelEnum.medium, "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400"},
    {"name": "Chana Masala", "description": "Spiced chickpea curry with tangy tomatoes", "price": 300, "category": CategoryEnum.main_course, "is_veg": True, "spice_level": SpiceLevelEnum.medium, "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400"},
    {"name": "Fish Curry", "description": "Coastal style fish in tangy coconut gravy", "price": 480, "category": CategoryEnum.main_course, "is_veg": False, "spice_level": SpiceLevelEnum.hot, "image_url": "https://vismaifood.com/storage/app/uploads/public/daa/96d/7bc/thumb__700_0_0_0_auto.jpg"},
    {"name": "Shahi Paneer", "description": "Royal cottage cheese curry in rich mughlai sauce", "price": 400, "category": CategoryEnum.main_course, "is_veg": True, "spice_level": SpiceLevelEnum.mild, "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400"},
    {"name": "Chicken Korma", "description": "Mild chicken curry with cashew and cream sauce", "price": 460, "category": CategoryEnum.main_course, "is_veg": False, "spice_level": SpiceLevelEnum.mild, "image_url": "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400"},
    {"name": "Mixed Veg Curry", "description": "Seasonal vegetables in aromatic curry sauce", "price": 320, "category": CategoryEnum.main_course, "is_veg": True, "spice_level": SpiceLevelEnum.mild, "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400"},
    # Biryani
    {"name": "Hyderabadi Chicken Biryani", "description": "Dum cooked chicken biryani with saffron and fried onions", "price": 520, "category": CategoryEnum.biryani, "is_veg": False, "spice_level": SpiceLevelEnum.medium, "image_url": "https://www.licious.in/blog/wp-content/uploads/2022/06/chicken-hyderabadi-biryani-01.jpg"},
    {"name": "Mutton Dum Biryani", "description": "Slow-cooked dum biryani with tender mutton pieces", "price": 620, "category": CategoryEnum.biryani, "is_veg": False, "spice_level": SpiceLevelEnum.medium, "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400"},
    {"name": "Vegetable Biryani", "description": "Fragrant basmati rice with fresh garden vegetables", "price": 420, "category": CategoryEnum.biryani, "is_veg": True, "spice_level": SpiceLevelEnum.mild, "image_url": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400"},
    {"name": "Prawn Biryani", "description": "Spiced basmati rice with succulent prawns", "price": 680, "category": CategoryEnum.biryani, "is_veg": False, "spice_level": SpiceLevelEnum.hot, "image_url": "https://www.cubesnjuliennes.com/wp-content/uploads/2020/12/Prawn-Biryani-Recipe.jpg"},
    {"name": "Paneer Biryani", "description": "Aromatic biryani with marinated paneer and spices", "price": 460, "category": CategoryEnum.biryani, "is_veg": True, "spice_level": SpiceLevelEnum.mild, "image_url": "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=400"},
    # Breads
    {"name": "Butter Naan", "description": "Soft leavened bread baked in tandoor with butter", "price": 60, "category": CategoryEnum.breads, "is_veg": True, "spice_level": None, "image_url": "https://static.toiimg.com/thumb/53338316.cms?imgsize=223266&width=800&height=800"},
    {"name": "Garlic Naan", "description": "Naan topped with fresh garlic and coriander", "price": 80, "category": CategoryEnum.breads, "is_veg": True, "spice_level": None, "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400"},
    {"name": "Tandoori Roti", "description": "Whole wheat bread baked fresh in tandoor", "price": 40, "category": CategoryEnum.breads, "is_veg": True, "spice_level": None, "image_url": "https://www.indianhealthyrecipes.com/wp-content/uploads/2023/09/tandoori-roti-recipe.jpg"},
    {"name": "Paratha", "description": "Flaky whole wheat flatbread cooked with ghee", "price": 70, "category": CategoryEnum.breads, "is_veg": True, "spice_level": None, "image_url": "https://www.jcookingodyssey.com/wp-content/uploads/2025/03/paneer-paratha.jpg"},
    {"name": "Laccha Paratha", "description": "Layered crispy paratha made with refined flour", "price": 80, "category": CategoryEnum.breads, "is_veg": True, "spice_level": None, "image_url": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400"},
    {"name": "Kulcha", "description": "Soft leavened bread stuffed with spiced onion filling", "price": 90, "category": CategoryEnum.breads, "is_veg": True, "spice_level": None, "image_url": "https://www.indianhealthyrecipes.com/wp-content/uploads/2022/01/kulcha-recipe.jpg"},
    # Desserts
    {"name": "Gulab Jamun", "description": "Soft milk dumplings soaked in rose-flavoured sugar syrup", "price": 180, "category": CategoryEnum.dessert, "is_veg": True, "spice_level": None, "image_url": "https://images.unsplash.com/photo-1601303516534-bf4ec6b4a19e?w=400"},
    {"name": "Rasgulla", "description": "Spongy cottage cheese balls in light sugar syrup", "price": 180, "category": CategoryEnum.dessert, "is_veg": True, "spice_level": None, "image_url": "https://images.unsplash.com/photo-1601303517819-a02428e13cf1?w=400"},
    {"name": "Kheer", "description": "Creamy rice pudding flavoured with cardamom and saffron", "price": 200, "category": CategoryEnum.dessert, "is_veg": True, "spice_level": None, "image_url": "https://shivanilovesfood.com/wp-content/uploads/2024/01/Creamy-Kheer-4.jpg"},
    {"name": "Gajar Ka Halwa", "description": "Slow-cooked carrot dessert with nuts and khoya", "price": 220, "category": CategoryEnum.dessert, "is_veg": True, "spice_level": None, "image_url": "https://www.kuchpakrahahai.in/wp-content/uploads/2024/01/Gajar-halwa.jpg"},
    {"name": "Kulfi Falooda", "description": "Traditional Indian ice cream with vermicelli and rose syrup", "price": 260, "category": CategoryEnum.dessert, "is_veg": True, "spice_level": None, "image_url": "https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=400"},
    # Beverages
    {"name": "Mango Lassi", "description": "Chilled yogurt drink blended with fresh Alphonso mango", "price": 180, "category": CategoryEnum.beverages, "is_veg": True, "spice_level": None, "image_url": "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400"},
    {"name": "Sweet Lassi", "description": "Refreshing chilled yogurt drink with a hint of cardamom", "price": 160, "category": CategoryEnum.beverages, "is_veg": True, "spice_level": None, "image_url": "https://shwetainthekitchen.com/wp-content/uploads/2021/05/Sweet-lassi.jpg"},
    {"name": "Masala Chai", "description": "Freshly brewed spiced Indian tea with ginger and cardamom", "price": 80, "category": CategoryEnum.beverages, "is_veg": True, "spice_level": None, "image_url": "https://www.theflavorbender.com/wp-content/uploads/2021/01/Masala-Chai-9998-2.jpg"},
    {"name": "Fresh Lime Soda", "description": "Freshly squeezed lime with chilled soda water", "price": 120, "category": CategoryEnum.beverages, "is_veg": True, "spice_level": None, "image_url": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400"},
    {"name": "Chaas", "description": "Traditional thin buttermilk with roasted cumin and coriander", "price": 100, "category": CategoryEnum.beverages, "is_veg": True, "spice_level": None, "image_url": "https://www.indianveggiedelight.com/wp-content/uploads/2023/01/masala-chaas-featured.jpg"},
    {"name": "Rose Sharbat", "description": "Refreshing chilled rose syrup drink with basil seeds", "price": 140, "category": CategoryEnum.beverages, "is_veg": True, "spice_level": None, "image_url": "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400"},
]


async def ensure_daily_demo_reservations(db: AsyncSession) -> None:
    """Ensure that for today and surrounding days, realistic demo reservations exist."""
    today = date.today()
    
    # Check demo users
    user_res = await db.execute(select(User).limit(5))
    users = user_res.scalars().all()
    if not users:
        return

    # Check tables
    tbl_res = await db.execute(select(Table))
    tables = tbl_res.scalars().all()
    if not tables:
        return

    table_map = {t.id: t for t in tables}

    # For today, tomorrow, and day after tomorrow
    for day_offset in range(0, 4):
        cur_date = today + timedelta(days=day_offset)
        
        # Check if reservations already exist for this date
        count_res = await db.execute(
            select(func.count()).select_from(Reservation).where(Reservation.date == cur_date)
        )
        existing_count = count_res.scalar() or 0
        if existing_count >= 8:
            continue  # Sufficient demo data for this date

        # Demo reservations across lunch and dinner
        demo_slots = [
            # Lunch
            {"tid": 1, "time": "12:00", "party": 2, "user": users[0 % len(users)], "status": ReservationStatusEnum.confirmed},
            {"tid": 2, "time": "13:00", "party": 4, "user": users[1 % len(users)], "status": ReservationStatusEnum.confirmed},
            {"tid": 5, "time": "13:00", "party": 4, "user": users[0 % len(users)], "status": ReservationStatusEnum.confirmed},
            {"tid": 8, "time": "14:00", "party": 4, "user": users[1 % len(users)], "status": ReservationStatusEnum.confirmed},
            # Peak Dinner
            {"tid": 1,  "time": "19:00", "party": 2, "user": users[0 % len(users)], "status": ReservationStatusEnum.confirmed},
            {"tid": 2,  "time": "19:00", "party": 4, "user": users[1 % len(users)], "status": ReservationStatusEnum.confirmed},
            {"tid": 7,  "time": "19:00", "party": 2, "user": users[0 % len(users)], "status": ReservationStatusEnum.confirmed},
            {"tid": 10, "time": "20:00", "party": 6, "user": users[1 % len(users)], "status": ReservationStatusEnum.confirmed},
            {"tid": 13, "time": "20:00", "party": 6, "user": users[0 % len(users)], "status": ReservationStatusEnum.confirmed},
            {"tid": 16, "time": "20:00", "party": 8, "user": users[1 % len(users)], "status": ReservationStatusEnum.confirmed},
            {"tid": 19, "time": "21:00", "party": 2, "user": users[0 % len(users)], "status": ReservationStatusEnum.confirmed},
            {"tid": 4,  "time": "21:00", "party": 4, "user": users[1 % len(users)], "status": ReservationStatusEnum.pending},
        ]

        for i, item in enumerate(demo_slots):
            tbl = table_map.get(item["tid"]) or tables[i % len(tables)]
            ref = f"RR{cur_date.strftime('%m%d')}{str(i+1).zfill(4)}"
            
            # Check if duplicate ref
            dup_res = await db.execute(select(Reservation).where(Reservation.booking_ref == ref))
            if dup_res.scalars().first():
                continue

            dep = max(300, tbl.capacity * 150)
            res = Reservation(
                user_id=item["user"].id,
                table_id=tbl.id,
                date=cur_date,
                time_slot=item["time"],
                party_size=min(item["party"], tbl.capacity),
                status=item["status"],
                payment_status=PaymentStatusEnum.paid if item["status"] == ReservationStatusEnum.confirmed else PaymentStatusEnum.pending,
                deposit_amount=dep,
                total_amount=dep * 3,
                booking_ref=ref,
                special_requests="Window side preference / Anniversary arrangement" if i % 2 == 0 else ""
            )
            db.add(res)

        # Also add demo waitlist entries for dinner
        wl_count_res = await db.execute(
            select(func.count()).select_from(WaitingList).where(WaitingList.date == cur_date)
        )
        if (wl_count_res.scalar() or 0) < 2:
            wl1 = WaitingList(
                user_id=users[0].id,
                date=cur_date,
                time_slot="20:00",
                party_size=4,
                position=1,
                status=WaitingListStatusEnum.waiting,
            )
            wl2 = WaitingList(
                user_id=users[1 % len(users)].id,
                date=cur_date,
                time_slot="21:00",
                party_size=2,
                position=2,
                status=WaitingListStatusEnum.waiting,
            )
            db.add(wl1)
            db.add(wl2)

    await db.commit()
    print(f"[+] Verified and updated daily demo reservations for current date window (starting {today})")


async def seed_database(db: AsyncSession) -> None:
    """Populate the database with initial data if empty."""

    # Check if tables already seeded
    result = await db.execute(select(func.count()).select_from(Table))
    count = result.scalar()
    if count and count > 0:
        await ensure_daily_demo_reservations(db)
        return  # Tables exist, ensured daily reservations exist

    print("[+] Seeding Royal Rasoi database...")

    # ── Create tables ─────────────────────────────────────────────────────
    db_tables = []
    for t in TABLE_DATA:
        db_table = Table(
            name=t["name"],
            capacity=t["capacity"],
            zone=t["zone"],
            position_x=t["x"],
            position_y=t["y"],
            position_z=t["z"],
            status=TableStatusEnum.available,
        )
        db.add(db_table)
        db_tables.append(db_table)

    await db.flush()

    # ── Create seats for each table ───────────────────────────────────────
    seat_offsets = {
        2:  [(0.3, 0.0), (-0.3, 0.0)],
        4:  [(0.3, 0.3), (-0.3, 0.3), (0.3, -0.3), (-0.3, -0.3)],
        6:  [(0.4, 0.3), (0.0, 0.3), (-0.4, 0.3), (0.4, -0.3), (0.0, -0.3), (-0.4, -0.3)],
        8:  [(0.4, 0.4), (0.0, 0.4), (-0.4, 0.4), (0.4, 0.0), (-0.4, 0.0), (0.4, -0.4), (0.0, -0.4), (-0.4, -0.4)],
        10: [(0.5, 0.4), (0.2, 0.4), (-0.2, 0.4), (-0.5, 0.4), (0.5, -0.4), (0.2, -0.4), (-0.2, -0.4), (-0.5, -0.4), (0.0, 0.4), (0.0, -0.4)],
    }

    for db_table in db_tables:
        cap = db_table.capacity
        offsets = seat_offsets.get(cap, [(0.0, 0.0)] * cap)
        for i, (ox, oy) in enumerate(offsets[:cap], start=1):
            seat = Seat(
                table_id=db_table.id,
                seat_number=i,
                position_offset_x=ox,
                position_offset_y=oy,
            )
            db.add(seat)

    # ── Create menu items ─────────────────────────────────────────────────
    for item in MENU_ITEMS:
        db_item = MenuItem(
            name=item["name"],
            description=item["description"],
            price=item["price"],
            category=item["category"],
            image_url=item["image_url"],
            is_available=True,
            is_veg=item["is_veg"],
            spice_level=item["spice_level"],
        )
        db.add(db_item)

    # ── Create demo users ─────────────────────────────────────────────────
    user1 = User(
        name="Arjun Sharma",
        email="arjun@example.com",
        phone="+91 98765 43210",
        password_hash=get_password_hash("password123"),
        is_active=True,
    )
    user2 = User(
        name="Priya Patel",
        email="priya@example.com",
        phone="+91 87654 32109",
        password_hash=get_password_hash("password123"),
        is_active=True,
    )
    db.add(user1)
    db.add(user2)
    await db.flush()

    # ── Create demo reservations ──────────────────────────────────────────
    today = date.today()

    demo_reservations = [
        # 5 confirmed for today
        {"user": user1, "table": db_tables[0],  "time": "12:00", "party": 2,  "status": ReservationStatusEnum.confirmed, "pay": PaymentStatusEnum.paid,    "deposit": 300,  "total": 1200},
        {"user": user2, "table": db_tables[1],  "time": "13:00", "party": 4,  "status": ReservationStatusEnum.confirmed, "pay": PaymentStatusEnum.paid,    "deposit": 540,  "total": 1800},
        {"user": user1, "table": db_tables[4],  "time": "19:00", "party": 4,  "status": ReservationStatusEnum.confirmed, "pay": PaymentStatusEnum.paid,    "deposit": 480,  "total": 1600},
        {"user": user2, "table": db_tables[7],  "time": "20:00", "party": 3,  "status": ReservationStatusEnum.confirmed, "pay": PaymentStatusEnum.paid,    "deposit": 390,  "total": 1300},
        {"user": user1, "table": db_tables[14], "time": "21:00", "party": 6,  "status": ReservationStatusEnum.confirmed, "pay": PaymentStatusEnum.paid,    "deposit": 720,  "total": 2400},
        # 3 pending for today
        {"user": user2, "table": db_tables[2],  "time": "14:00", "party": 3,  "status": ReservationStatusEnum.pending,   "pay": PaymentStatusEnum.pending, "deposit": 300,  "total": 1000},
        {"user": user1, "table": db_tables[10], "time": "19:00", "party": 4,  "status": ReservationStatusEnum.pending,   "pay": PaymentStatusEnum.pending, "deposit": 420,  "total": 1400},
        {"user": user2, "table": db_tables[17], "time": "22:00", "party": 2,  "status": ReservationStatusEnum.pending,   "pay": PaymentStatusEnum.pending, "deposit": 300,  "total": 800},
    ]

    booked_table_ids = set()
    for i, r in enumerate(demo_reservations):
        ref = f"RR{str(i+1).zfill(8)}"
        res = Reservation(
            user_id=r["user"].id,
            table_id=r["table"].id,
            date=today,
            time_slot=r["time"],
            party_size=r["party"],
            status=r["status"],
            payment_status=r["pay"],
            deposit_amount=r["deposit"],
            total_amount=r["total"],
            booking_ref=ref,
        )
        db.add(res)
        if r["status"] == ReservationStatusEnum.confirmed:
            booked_table_ids.add(r["table"].id)

    # Update statuses for booked tables
    for db_table in db_tables:
        if db_table.id in booked_table_ids:
            db_table.status = TableStatusEnum.booked

    # ── Create waiting list entries ───────────────────────────────────────
    wl1 = WaitingList(
        user_id=user1.id,
        date=today,
        time_slot="20:00",
        party_size=4,
        position=1,
        status=WaitingListStatusEnum.waiting,
    )
    wl2 = WaitingList(
        user_id=user2.id,
        date=today,
        time_slot="21:00",
        party_size=2,
        position=2,
        status=WaitingListStatusEnum.waiting,
    )
    db.add(wl1)
    db.add(wl2)

    await db.commit()
    print("[SUCCESS] Database seeded successfully!")
