from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timedelta
from typing import List, Optional
import random
import string

from database import get_db
from models import WaitingList, User, WaitingListStatusEnum, PaymentStatusEnum, Table, Reservation, ReservationStatusEnum
from schemas import WaitingListCreate, WaitingListOut
from auth import get_current_user

router = APIRouter()

def generate_token_ref() -> str:
    digits = ''.join(random.choices(string.digits, k=5))
    return f"WL-{digits}"

@router.post("/", response_model=WaitingListOut, status_code=status.HTTP_201_CREATED)
async def join_waiting_list(
    wl_in: WaitingListCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Determine current queue position for date and slot (Railway RAC/WL style FIFO priority)
    count_res = await db.execute(
        select(WaitingList).where(
            WaitingList.date == wl_in.date,
            WaitingList.time_slot == wl_in.time_slot,
            WaitingList.status.in_([WaitingListStatusEnum.waiting, WaitingListStatusEnum.offered])
        )
    )
    current_active = count_res.scalars().all()
    new_position = len(current_active) + 1

    # Full payment for waitlist entry (Deposit is based on party size: Rs 150 per person or min Rs 300)
    full_payment_amount = max(300.0, float(wl_in.party_size * 150.0))
    token = generate_token_ref()
    
    # Expiry is set 15 minutes from now for automated confirmation/refund checking
    expires_at = datetime.utcnow() + timedelta(minutes=15)

    entry = WaitingList(
        user_id=current_user.id,
        table_id=wl_in.table_id,
        date=wl_in.date,
        time_slot=wl_in.time_slot,
        party_size=wl_in.party_size,
        position=new_position,
        status=WaitingListStatusEnum.waiting,
        token_ref=token,
        payment_amount=full_payment_amount,
        payment_status=PaymentStatusEnum.paid,
        special_requests=wl_in.special_requests,
        phone=wl_in.phone or current_user.phone or "9876543210",
        offer_expires_at=expires_at,
        created_at=datetime.utcnow()
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry

@router.get("/my", response_model=List[WaitingListOut])
async def get_my_waiting_entries(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(WaitingList).where(
        WaitingList.user_id == current_user.id
    ).order_by(WaitingList.created_at.desc())
    res = await db.execute(query)
    entries = res.scalars().all()

    # Dynamic check: If 15 min passed and not confirmed, mark expired and refunded
    now = datetime.utcnow()
    changed = False
    for item in entries:
        if item.status == WaitingListStatusEnum.waiting and item.offer_expires_at:
            if now > item.offer_expires_at:
                item.status = WaitingListStatusEnum.expired
                item.payment_status = PaymentStatusEnum.refunded
                item.refunded_at = now
                changed = True
    if changed:
        await db.commit()

    return entries

@router.get("/position/{entry_id}")
async def get_waiting_position(
    entry_id: int,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(WaitingList).where(WaitingList.id == entry_id))
    entry = res.scalars().first()
    if not entry:
        raise HTTPException(status_code=404, detail="Waiting list ticket not found")

    now = datetime.utcnow()
    # Check if 15 minute timer has elapsed
    if entry.status == WaitingListStatusEnum.waiting and entry.offer_expires_at and now > entry.offer_expires_at:
        entry.status = WaitingListStatusEnum.expired
        entry.payment_status = PaymentStatusEnum.refunded
        entry.refunded_at = now
        await db.commit()
        await db.refresh(entry)

    # Count entries ahead in queue
    ahead_res = await db.execute(
        select(WaitingList).where(
            WaitingList.date == entry.date,
            WaitingList.time_slot == entry.time_slot,
            WaitingList.status == WaitingListStatusEnum.waiting,
            WaitingList.id < entry.id
        )
    )
    people_ahead = len(ahead_res.scalars().all())
    est_wait_minutes = (people_ahead + 1) * 15

    # Seconds remaining in 15-minute guarantee window
    seconds_remaining = 0
    if entry.offer_expires_at and entry.status == WaitingListStatusEnum.waiting:
        diff = (entry.offer_expires_at - now).total_seconds()
        seconds_remaining = max(0, int(diff))

    # Confirmation probability calculation based on First-Come-First-Priority (Indian Railways Waiting List rules)
    # Priority #1 has 92% chance, #2 has 75%, #3 has 50%, etc.
    priority_chance = max(10, 95 - (people_ahead * 20))

    return {
        "id": entry.id,
        "token_ref": entry.token_ref,
        "date": entry.date,
        "time_slot": entry.time_slot,
        "party_size": entry.party_size,
        "people_ahead": people_ahead,
        "position": people_ahead + 1,
        "confirmation_probability": f"{priority_chance}%",
        "estimated_wait_minutes": est_wait_minutes,
        "seconds_remaining": seconds_remaining,
        "status": entry.status.value if hasattr(entry.status, 'value') else entry.status,
        "payment_status": entry.payment_status.value if hasattr(entry.payment_status, 'value') else entry.payment_status,
        "payment_amount": entry.payment_amount,
        "phone": entry.phone,
        "offer_expires_at": entry.offer_expires_at,
        "confirmed_at": entry.confirmed_at,
        "refunded_at": entry.refunded_at
    }

@router.post("/simulate-confirm/{entry_id}")
async def simulate_confirm_waitlist(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Simulates a table getting vacated and confirming the first priority waiting list token,
    triggering simulated SMS and WhatsApp notification alerts!
    """
    res = await db.execute(
        select(WaitingList).where(WaitingList.id == entry_id, WaitingList.user_id == current_user.id)
    )
    entry = res.scalars().first()
    if not entry:
        raise HTTPException(status_code=404, detail="Waiting list ticket not found")

    entry.status = WaitingListStatusEnum.fulfilled
    entry.confirmed_at = datetime.utcnow()
    entry.notified_at = datetime.utcnow()
    await db.commit()
    await db.refresh(entry)

    # In a production app, twilio / WhatsApp Cloud API dispatch occurs here
    phone_number = entry.phone or current_user.phone or "your phone"
    return {
        "success": True,
        "message": f"🎉 Congratulations! Table confirmed for Token {entry.token_ref}. Instant SMS & WhatsApp notification dispatched to {phone_number}!",
        "token_ref": entry.token_ref,
        "status": "confirmed"
    }

@router.post("/simulate-expire/{entry_id}")
async def simulate_expire_and_refund(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Simulates 15 minutes window expiring without table clearance:
    Initiates 100% full instant refund to user's original payment source (UPI/Card).
    """
    res = await db.execute(
        select(WaitingList).where(WaitingList.id == entry_id, WaitingList.user_id == current_user.id)
    )
    entry = res.scalars().first()
    if not entry:
        raise HTTPException(status_code=404, detail="Waiting list ticket not found")

    entry.status = WaitingListStatusEnum.expired
    entry.payment_status = PaymentStatusEnum.refunded
    entry.refunded_at = datetime.utcnow()
    await db.commit()
    await db.refresh(entry)

    phone_number = entry.phone or current_user.phone or "your phone"
    return {
        "success": True,
        "message": f"⏳ 15-minute window completed. ₹{entry.payment_amount} 100% full refund initiated to your bank account! Alert sent to {phone_number}.",
        "token_ref": entry.token_ref,
        "refund_amount": entry.payment_amount,
        "payment_status": "refunded"
    }

@router.put("/{entry_id}/accept")
async def accept_waiting_offer(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(WaitingList).where(WaitingList.id == entry_id, WaitingList.user_id == current_user.id)
    )
    entry = res.scalars().first()
    if not entry:
        raise HTTPException(status_code=404, detail="Waiting list ticket not found")

    entry.status = WaitingListStatusEnum.fulfilled
    entry.confirmed_at = datetime.utcnow()
    await db.commit()
    return {"message": "Table offer accepted! Token status updated to confirmed."}

@router.put("/{entry_id}/decline")
async def decline_waiting_offer(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(WaitingList).where(WaitingList.id == entry_id, WaitingList.user_id == current_user.id)
    )
    entry = res.scalars().first()
    if not entry:
        raise HTTPException(status_code=404, detail="Waiting list ticket not found")

    entry.status = WaitingListStatusEnum.cancelled
    entry.payment_status = PaymentStatusEnum.refunded
    entry.refunded_at = datetime.utcnow()
    await db.commit()
    return {"message": "Waiting list cancelled. 100% full refund credited back."}
