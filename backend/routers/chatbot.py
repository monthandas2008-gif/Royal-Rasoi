import os
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, date, timedelta

from database import get_db
from models import Table, Reservation, WaitingList, MenuItem, User, ReservationStatusEnum, WaitingListStatusEnum, PaymentStatusEnum
from auth import get_optional_current_user

router = APIRouter()

# Pydantic models for chat
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    user_context: Optional[Dict[str, Any]] = None

class DishDetailRequest(BaseModel):
    dish_id: int
    dish_name: str
    dish_description: Optional[str] = ""
    dish_price: Optional[float] = 0.0
    is_veg: Optional[bool] = True
    user_question: Optional[str] = None

class QuickBookRequest(BaseModel):
    guest_name: str
    phone: str
    date_str: str  # YYYY-MM-DD
    time_slot: str # e.g. "19:00"
    party_size: int
    special_requests: Optional[str] = "Booked via Royal Rasoi AI Concierge"
    table_id: Optional[int] = None
    payment_method: Optional[str] = "upi"

# Dish Nutritional Knowledge Base
DISH_NUTRITIONAL_DATA: Dict[str, Dict[str, Any]] = {
    "Dum Pukht Mutton Biryani": {
        "calories": "680 kcal per portion",
        "ingredients": "Aged Royal Basmati Rice, Tender Bone-in Goat Meat, Pure Saffron, Desi Ghee, Mint Leaves, Caramelized Onions, Hand-ground Shahi Biryani Masala",
        "best_for": "Rich family feasts, lovers of slow-cooked authentic Awadhi dum recipes, high-protein indulgence"
    },
    "Mutton Biryani": {
        "calories": "650 kcal per portion",
        "ingredients": "Basmati rice, tender goat meat pieces, fried golden onions, saffron milk, whole royal spices, mint",
        "best_for": "Classic celebratory lunch or dinner, rich Mughlai flavor lovers"
    },
    "Mutton Dum Biryani": {
        "calories": "680 kcal per portion",
        "ingredients": "Aged Basmati, slow-steamed mutton, mint, curd marinade, mace & cardamom",
        "best_for": "Weekend dinners, high-protein royal dining"
    },
    "Hyderabadi Chicken Biryani": {
        "calories": "580 kcal per portion",
        "ingredients": "Kachchi Yakhni Chicken, Aged Basmati Rice, Saffron, Fried Shallots, Mint, Fresh Spiced Curd",
        "best_for": "Aromatic spicy chicken lovers, authentic Hyderabadi culinary enthusiasts"
    },
    "Butter Chicken": {
        "calories": "520 kcal per serving",
        "ingredients": "Charcoal-grilled Tandoori Chicken chunks, Ripe Plum Tomatoes, White Churned Butter, Cashew Paste, Kasuri Methi, Fresh Farm Cream",
        "best_for": "Comfort dining, mild spice preference, pairs extraordinarily with Garlic Naan or Butter Naan"
    },
    "Paneer Butter Masala": {
        "calories": "440 kcal per serving",
        "ingredients": "Fresh Malai Cottage Cheese (Paneer), Tomato-Cashew Velouté, Pure Ghee, Fenugreek Leaves, Cream",
        "best_for": "Pure vegetarian luxury, creamy rich textures, children and mild flavor lovers"
    },
    "Dal Makhani": {
        "calories": "380 kcal per serving",
        "ingredients": "Black Urad Lentils, Rajma (Kidney Beans), 24-hr Slow Simmer on Live Charcoal, Cream, Makkhan",
        "best_for": "Hearty comfort meals, rich in vegetarian protein and dietary fiber"
    },
    "Hara Bhara Kebab": {
        "calories": "220 kcal (4 pieces)",
        "ingredients": "Fresh Farm Spinach, Green Peas, Roasted Bengal Gram (Chana), Mint, Green Chillies, Chaat Masala",
        "best_for": "Light & healthy vegetarian starter, iron-rich, pairs with fresh mint coriander chutney"
    },
    "Paneer Tikka": {
        "calories": "310 kcal (5 skewers)",
        "ingredients": "Thick Paneer Cubes, Bell Peppers, Onions, Kashmiri Chilli & Mustard Oil Yogurt Marinade, Charred in Clay Tandoor",
        "best_for": "High-protein vegetarian appetizer, keto-friendly dining"
    },
    "Chicken Tikka": {
        "calories": "340 kcal (6 pieces)",
        "ingredients": "Tender boneless chicken breast, spiced hung curd marinade, lemon juice, roasted cumin",
        "best_for": "Low-carb high-protein dining, barbecue lovers"
    },
    "Butter Naan": {
        "calories": "260 kcal per naan",
        "ingredients": "Refined flour, fermented dough, farm butter, charred in traditional tandoor",
        "best_for": "Accompaniment with rich gravies like Butter Chicken & Dal Makhani"
    },
    "Garlic Naan": {
        "calories": "270 kcal per naan",
        "ingredients": "Leavened flour, fresh roasted garlic flakes, nigella seeds (kalonji), fresh coriander, butter",
        "best_for": "Garlic aroma lovers, pairs perfectly with all Mughlai curries"
    },
    "Gulab Jamun": {
        "calories": "290 kcal (2 pieces)",
        "ingredients": "Reduced milk solid khoya, saffron, rose water sugar syrup, green cardamom",
        "best_for": "Traditional sweet tooth cravings, celebratory finish to your meal"
    }
}

def get_gemini_client():
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        return None
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        return client
    except Exception:
        return None

# Dish Summary & Follow-up Endpoint
@router.post("/dish-info")
async def get_dish_info(req: DishDetailRequest):
    # Lookup in local curated knowledge base
    matched_key = None
    for k in DISH_NUTRITIONAL_DATA.keys():
        if k.lower() in req.dish_name.lower() or req.dish_name.lower() in k.lower():
            matched_key = k
            break
    
    local_data = DISH_NUTRITIONAL_DATA.get(matched_key) if matched_key else {
        "calories": "Approx 350-480 kcal per portion",
        "ingredients": "Authentic heritage Indian spices, fresh produce, ghee & aromatic herbs",
        "best_for": "Signature Royal Rasoi dining experience"
    }

    # If follow-up user question is present
    answer = None
    if req.user_question:
        client = get_gemini_client()
        if client:
            prompt = f"""You are the Chef Concierge at Royal Rasoi Restaurant in Boisar.
Dish: {req.dish_name}
Known details:
- Calories: {local_data['calories']}
- Ingredients: {local_data['ingredients']}
- Best for: {local_data['best_for']}
- Price: Rs {req.dish_price} ({'Pure Veg' if req.is_veg else 'Non-Veg'})

Customer Question: "{req.user_question}"

Respond warmly, helpfully, and concisely in 2-3 sentences. Answer in the same tone/language used by the customer."""
            for model_name in ["gemini-3.5-flash-lite", "gemini-3.8-flash"]:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt
                    )
                    if response and response.text:
                        answer = response.text.strip()
                        break
                except Exception:
                    continue
        if not answer:
            answer = f"The {req.dish_name} ({local_data['calories']}) is prepared fresh using {local_data['ingredients']}. It is best enjoyed hot with our tandoori breads!"

    return {
        "dish_name": req.dish_name,
        "calories": local_data["calories"],
        "ingredients": local_data["ingredients"],
        "best_for": local_data["best_for"],
        "follow_up_answer": answer
    }

# Main Site-Wide Assistant Endpoint
@router.post("/message")
async def chat_with_concierge(
    req: ChatRequest,
    db: AsyncSession = Depends(get_db)
):
    user_msg = req.message.strip()
    
    # Check if user asks about a token or waitlist status
    # e.g., "WL-12345" or "token"
    token_query = None
    words = user_msg.replace("#", "").split()
    for w in words:
        if w.upper().startswith("WL-") or (w.isdigit() and len(w) == 5):
            token_query = w.upper() if w.upper().startswith("WL-") else f"WL-{w}"
            break

    token_info = None
    if token_query:
        res = await db.execute(select(WaitingList).where(WaitingList.token_ref == token_query))
        wl_entry = res.scalars().first()
        if wl_entry:
            ahead_res = await db.execute(
                select(WaitingList).where(
                    WaitingList.date == wl_entry.date,
                    WaitingList.time_slot == wl_entry.time_slot,
                    WaitingList.status == WaitingListStatusEnum.waiting,
                    WaitingList.id < wl_entry.id
                )
            )
            ahead = len(ahead_res.scalars().all())
            chance = max(10, 95 - (ahead * 20))
            token_info = {
                "token": wl_entry.token_ref,
                "position": ahead + 1,
                "people_ahead": ahead,
                "confirmation_chance": f"{chance}%",
                "status": wl_entry.status.value if hasattr(wl_entry.status, 'value') else wl_entry.status,
                "date": str(wl_entry.date),
                "time_slot": wl_entry.time_slot,
                "party_size": wl_entry.party_size,
                "payment_status": wl_entry.payment_status.value if hasattr(wl_entry.payment_status, 'value') else wl_entry.payment_status,
                "amount": wl_entry.payment_amount
            }

    # Fetch snapshot of tables availability
    today = date.today()
    avail_res = await db.execute(
        select(Reservation).where(
            Reservation.date == today,
            Reservation.status == ReservationStatusEnum.confirmed
        )
    )
    booked_count = len(avail_res.scalars().all())

    # Build system context
    system_context = f"""You are 'Rasoi AI Concierge', the intelligent, articulate, cultured, and conversational virtual concierge of Royal Rasoi Fine Indian Dining Restaurant in Boisar, Palghar.

Core Directives:
1. You can answer ANY question naturally, comprehensively, and accurately — including both inside-restaurant questions (menu, ingredients, recipes, tables, timings, pricing, parking, party bookings, waitlist tokens) AND outside questions (general knowledge, science, cuisine history, geography, lifestyle, recommendations, culture, etiquette, coding, mathematics, or anything the patron asks).
2. Never mention or reveal specific underlying model names or technologies (do not say you are ChatGPT, GPT, Gemini, Claude, etc.). If asked who you are, state with pride that you are the personal AI Dining Concierge of Royal Rasoi.
3. Restaurant Knowledge:
   - Name: Royal Rasoi (Fine Mughlai, Awadhi, Tandoori & North Indian Dining)
   - Location: Shop 12, Shivaji Nagar Main Road, Boisar, Palghar - 401501
   - Hours (12-hour format): Lunch 12:00 PM to 03:30 PM | Dinner 07:00 PM to 11:30 PM
   - Contact: +91 98765 43210
   - Signature Delicacies: Dum Pukht Mutton Biryani (₹580), Butter Chicken (₹460), Dal Makhani (₹320), Hara Bhara Kebab (₹280), Paneer Tikka (₹320), Garlic Naan (₹80), Kesar Mango Lassi (₹180).
   - Features: Real-time 3D interactive table selection, 2D floor grid, Priority Waiting List with full advance payment and 15-minute 100% full refund guarantee.

4. Live Waitlist Token Data:
   {f"Active Token Queried: {token_info}" if token_info else "No specific token asked in this turn."}

5. Communication:
   - Always respond in the language or dialect used by the guest (Hindi, English, Hinglish, Marathi, etc.).
   - Be helpful, engaging, smart, and polite. Provide detailed, well-structured, and helpful answers instead of short boilerplate lines.
"""

    reply = None
    client = get_gemini_client()
    if client:
        # Try active models with fallback
        for model_name in ["gemini-3.5-flash-lite", "gemini-3.8-flash"]:
            try:
                contents = [system_context]
                for h in (req.history or [])[-8:]:
                    contents.append(f"{h.role}: {h.content}")
                contents.append(f"user: {user_msg}")

                response = client.models.generate_content(
                    model=model_name,
                    contents="\n\n".join(contents)
                )
                if response and response.text:
                    reply = response.text.strip()
                    break
            except Exception:
                continue

    if not reply:
        reply = generate_smart_fallback(user_msg, token_info)

    # Detect if booking intent is ready
    booking_trigger = False
    if any(k in user_msg.lower() for k in ["book a table", "table book", "reserve a table", "confirm booking", "booking karna"]):
        booking_trigger = True

    return {
        "reply": reply,
        "token_data": token_info,
        "booking_trigger": booking_trigger
    }

def generate_smart_fallback(msg: str, token_info: Optional[Dict[str, Any]] = None) -> str:
    m = msg.lower()
    if token_info:
        return (
            f"Aapke Token #{token_info['token']} ka status abhi '{token_info['status'].upper()}' hai!\n\n"
            f"• Queue Position: #{token_info['position']} (Aapke aage {token_info['people_ahead']} log hain)\n"
            f"• Confirmation Chance: approximately {token_info['confirmation_chance']}\n"
            f"• Date & Slot: {token_info['date']} at {token_info['time_slot']}\n\n"
            f"Agar 15 minute ke window me table confirm nahi ho paati, to ₹{token_info['amount']} ka 100% full refund bina kisi deduction ke aapke account me turant wapas aa jayega!"
        )
    if any(k in m for k in ["menu", "dish", "food", "khana", "starter", "biryani"]):
        return "Royal Rasoi ke signature menu me:\n• Dum Pukht Mutton Biryani (₹580) - Slow-cooked aged basmati with rich Awadhi spices\n• Butter Chicken (₹460) - Tandoori chicken chunks in velvety tomato cashew gravy\n• Dal Makhani (₹320) - 24-hr slow-simmered black lentils with cream\n• Hara Bhara Kebab (₹280) - Spinach, peas & roasted chana patties\n• Garlic Naan (₹80) & Kesar Mango Lassi (₹180)\n\nAap hamare Menu page se direct pre-order bhi kar sakte hain!"
    if any(k in m for k in ["time", "timing", "open", "close", "hour"]):
        return "Royal Rasoi ke operational timings:\n• Lunch Service: 12:00 PM to 03:30 PM\n• Dinner Service: 07:00 PM to 11:30 PM\n\nHum hafte ke saaton din khule rehte hain. Aap apni pasand ke time slot par advance reservation kar sakte hain."
    if any(k in m for k in ["waitlist", "waiting", "refund", "token"]):
        return "Hamara Priority Waiting List system 100% automated aur transparent hai:\n1. Jab sabhi tables occupied hoti hain, aap advance deposit pay karke Priority Token lete hain.\n2. Table khali hote hi live algorithm aapko seating assign karke SMS & WhatsApp alert bhejta hai.\n3. Agar 15 minute me table confirm na ho, to 100% full refund direct aapke account me credit ho jata hai."
    if any(k in m for k in ["book", "table", "reserve", "seating"]):
        return "Aap bilkul yahi se table book kar sakte hain! Kripya batayein:\n1. Date\n2. Time Slot (e.g., 07:00 PM, 08:00 PM, 09:00 PM)\n3. Guests (Party size)\n4. Aapka Naam aur Mobile Number\n\nNeeche diye form se bhi aap turant confirm kar sakte hain!"
    return f"Aapka sawal mil gaya! Main Royal Rasoi ka AI Dining Concierge hoon. Chahe Royal Rasoi ke culinary heritage, authentic ingredients, 3D floor plan seating, waitlist tokens ke baare me ho ya kisi bhi aam vishay par — main aapki poori sahayata karne ke liye tayyar hoon. Kripya batayein aap aur kya janna chahte hain?"

# Direct Booking from Chat Endpoint
@router.post("/quick-book")
async def quick_book_from_chat(
    req: QuickBookRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        parsed_date = datetime.strptime(req.date_str, "%Y-%m-%d").date()
    except Exception:
        parsed_date = date.today()

    # Find an available table for party size
    tbl_res = await db.execute(
        select(Table).where(Table.capacity >= req.party_size).order_by(Table.capacity.asc())
    )
    assigned_table = tbl_res.scalars().first()
    if not assigned_table:
        assigned_table_id = 1
        table_name = "Table 1 (Main Hall)"
    else:
        assigned_table_id = assigned_table.id
        table_name = assigned_table.name

    # Create demo or authenticated user
    user_res = await db.execute(select(User).where(User.phone == req.phone))
    customer = user_res.scalars().first()
    if not customer:
        customer = User(
            name=req.guest_name,
            email=f"{req.phone.replace('+', '').strip()}@royalrasoi.guest",
            phone=req.phone,
            password_hash="concierge_direct_booking"
        )
        db.add(customer)
        await db.commit()
        await db.refresh(customer)

    deposit_amount = max(300.0, float(req.party_size * 150.0))
    booking_ref = f"RR-{int(datetime.utcnow().timestamp()) % 100000}"

    reservation = Reservation(
        user_id=customer.id,
        table_id=assigned_table_id,
        date=parsed_date,
        time_slot=req.time_slot,
        party_size=req.party_size,
        special_requests=req.special_requests,
        status=ReservationStatusEnum.confirmed,
        deposit_amount=deposit_amount,
        total_amount=deposit_amount,
        booking_ref=booking_ref,
        payment_status=PaymentStatusEnum.paid,
        created_at=datetime.utcnow()
    )
    db.add(reservation)
    await db.commit()
    await db.refresh(reservation)

    return {
        "success": True,
        "booking_ref": booking_ref,
        "guest_name": req.guest_name,
        "table_name": table_name,
        "date": str(parsed_date),
        "time_slot": req.time_slot,
        "party_size": req.party_size,
        "deposit_amount": deposit_amount,
        "message": f"🎉 Table successfully booked for {req.guest_name}! Booking Ref: #{booking_ref} on {table_name}."
    }
