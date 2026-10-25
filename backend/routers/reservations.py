from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from datetime import date, datetime
from typing import List, Optional
import uuid

from database import get_db
from models import Table, Reservation, User, TableStatusEnum, ReservationStatusEnum, PaymentStatusEnum, WaitingList, WaitingListStatusEnum
import hashlib
import random
from schemas import (
    TableOut, ReservationCreate, ReservationOut
)
from auth import get_current_user, get_optional_current_user

router = APIRouter()

@router.get("/tables", response_model=List[TableOut])
async def get_all_tables(db: AsyncSession = Depends(get_db)):
    query = select(Table).options(selectinload(Table.seats))
    result = await db.execute(query)
    tables = result.scalars().all()
    return tables

@router.get("/tables/{table_id}", response_model=TableOut)
async def get_table(table_id: int, db: AsyncSession = Depends(get_db)):
    query = select(Table).where(Table.id == table_id).options(selectinload(Table.seats))
    result = await db.execute(query)
    table = result.scalars().first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    return table

@router.get("/availability")
async def check_availability(
    res_date: str = Query(..., alias="date", description="YYYY-MM-DD"),
    time_slot: str = Query(..., description="e.g. 19:00"),
    party_size: int = Query(..., ge=1, le=20),
    zone: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    try:
        parsed_date = datetime.strptime(res_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    # Get all tables
    tbl_query = select(Table).options(selectinload(Table.seats))
    if zone and zone != "any":
        tbl_query = tbl_query.where(Table.zone == zone)
    tbl_result = await db.execute(tbl_query)
    all_tables = tbl_result.scalars().all()

    # Get real booked reservations for this date & slot
    res_query = select(Reservation).where(
        Reservation.date == parsed_date,
        Reservation.time_slot == time_slot,
        Reservation.status.in_([ReservationStatusEnum.confirmed, ReservationStatusEnum.pending])
    )
    res_result = await db.execute(res_query)
    booked_reservations = res_result.scalars().all()
    booked_table_ids = {r.table_id for r in booked_reservations}

    # Get real active waiting list entries for this date & slot
    wl_query = select(WaitingList).where(
        WaitingList.date == parsed_date,
        WaitingList.time_slot == time_slot,
        WaitingList.status.in_([WaitingListStatusEnum.waiting, WaitingListStatusEnum.offered])
    )
    wl_result = await db.execute(wl_query)
    waiting_entries = wl_result.scalars().all()
    real_waiting_count = len(waiting_entries)

    # ── Deterministic dynamic occupancy for every date & slot ───────────────
    # Ensures every date automatically has an active mix of booked, waiting & free tables
    slot_hash_key = f"{res_date}_{time_slot}_royal_rasoi"
    slot_seed = int(hashlib.md5(slot_hash_key.encode()).hexdigest()[:8], 16)
    rng = random.Random(slot_seed)

    hour = int(time_slot.split(":")[0]) if ":" in time_slot else 19
    is_dinner = hour >= 18

    # Dinner hours and weekend dates naturally vary in demand
    day_of_week = parsed_date.weekday() # 0=Mon, 6=Sun
    is_weekend = day_of_week in [4, 5, 6] # Fri, Sat, Sun

    # Dynamic target occupancy that changes with date & time
    base_booked = 8 if (is_dinner and is_weekend) else (6 if is_dinner else (5 if is_weekend else 3))
    # Small slot-based pseudo-random variation (-1 to +2)
    booked_variation = (slot_seed % 4) - 1
    target_booked_count = max(2, min(14, base_booked + booked_variation))

    base_waiting = 4 if (is_dinner and is_weekend) else (3 if is_dinner else 2)
    waiting_variation = ((slot_seed >> 4) % 3) - 1
    target_waiting_count = max(1, min(6, base_waiting + waiting_variation))

    # Collect available tables not already booked by real users in the DB
    candidate_table_ids = [
        t.id for t in all_tables 
        if t.id not in booked_table_ids and t.status != TableStatusEnum.maintenance
    ]
    rng.shuffle(candidate_table_ids)

    # Dynamic demo booked tables (supplementing real bookings if needed)
    needed_booked = max(0, target_booked_count - len(booked_table_ids))
    auto_booked_ids = set(candidate_table_ids[:needed_booked])

    # Dynamic demo waitlisted tables from remaining pool
    remaining_ids = [tid for tid in candidate_table_ids if tid not in auto_booked_ids]
    needed_waiting = max(real_waiting_count, target_waiting_count)
    auto_waiting_ids = set(remaining_ids[:needed_waiting])

    availability_list = []
    for table in all_tables:
        if table.status == TableStatusEnum.maintenance:
            computed_status = "maintenance"
        elif table.id in booked_table_ids or table.id in auto_booked_ids:
            computed_status = "booked"
        elif table.id in auto_waiting_ids:
            computed_status = "waiting"
        else:
            computed_status = "available"

        availability_list.append({
            "id": table.id,
            "name": table.name,
            "capacity": table.capacity,
            "zone": table.zone.value if hasattr(table.zone, 'value') else table.zone,
            "position_x": table.position_x,
            "position_y": table.position_y,
            "position_z": table.position_z,
            "status": computed_status,
            "is_waitlist": computed_status == "waiting",
            "suitable_for_party": table.capacity >= party_size,
            "seats": [
                {
                    "id": s.id,
                    "table_id": s.table_id,
                    "seat_number": s.seat_number,
                    "position_offset_x": s.position_offset_x,
                    "position_offset_y": s.position_offset_y
                } for s in table.seats
            ]
        })

    return {
        "date": res_date,
        "time_slot": time_slot,
        "party_size": party_size,
        "tables": availability_list,
        "counts": {
            "total": len(availability_list),
            "available": sum(1 for t in availability_list if t["status"] == "available"),
            "booked": sum(1 for t in availability_list if t["status"] == "booked"),
            "waiting": sum(1 for t in availability_list if t["status"] == "waiting"),
        },
        "total_available": sum(1 for t in availability_list if t["status"] == "available" and t["suitable_for_party"])
    }

@router.post("/", response_model=ReservationOut, status_code=status.HTTP_201_CREATED)
async def create_reservation(
    res_in: ReservationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify table
    tbl_res = await db.execute(select(Table).where(Table.id == res_in.table_id))
    table = tbl_res.scalars().first()
    if not table:
        raise HTTPException(status_code=404, detail="Selected table does not exist")

    if table.capacity < res_in.party_size:
        raise HTTPException(status_code=400, detail=f"Table capacity ({table.capacity}) is less than party size ({res_in.party_size})")

    # Check clash
    conflict = await db.execute(
        select(Reservation).where(
            Reservation.table_id == res_in.table_id,
            Reservation.date == res_in.date,
            Reservation.time_slot == res_in.time_slot,
            Reservation.status.in_([ReservationStatusEnum.confirmed, ReservationStatusEnum.pending])
        )
    )
    if conflict.scalars().first():
        raise HTTPException(status_code=409, detail="Table is already reserved for this date and time slot.")

    # Calculate Deposit (₹300 flat or 30%)
    deposit = max(300.0, float(res_in.party_size * 150.0))
    booking_ref = f"RR-{uuid.uuid4().hex[:6].upper()}"

    reservation = Reservation(
        user_id=current_user.id,
        table_id=res_in.table_id,
        date=res_in.date,
        time_slot=res_in.time_slot,
        party_size=res_in.party_size,
        special_requests=res_in.special_requests,
        status=ReservationStatusEnum.pending,
        deposit_amount=deposit,
        total_amount=deposit,
        booking_ref=booking_ref,
        payment_status=PaymentStatusEnum.pending
    )

    db.add(reservation)
    await db.commit()
    await db.refresh(reservation)

    # Return with relations loaded
    query = select(Reservation).where(Reservation.id == reservation.id).options(
        selectinload(Reservation.table),
        selectinload(Reservation.user)
    )
    res = await db.execute(query)
    return res.scalars().first()

@router.get("/my", response_model=List[ReservationOut])
async def get_my_reservations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Reservation).where(Reservation.user_id == current_user.id).options(
        selectinload(Reservation.table),
        selectinload(Reservation.user)
    ).order_by(Reservation.created_at.desc())
    res = await db.execute(query)
    return res.scalars().all()

@router.get("/{booking_ref}", response_model=ReservationOut)
async def get_by_reference(booking_ref: str, db: AsyncSession = Depends(get_db)):
    query = select(Reservation).where(Reservation.booking_ref == booking_ref).options(
        selectinload(Reservation.table),
        selectinload(Reservation.user)
    )
    res = await db.execute(query)
    item = res.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return item

@router.put("/{reservation_id}/cancel")
async def cancel_reservation(
    reservation_id: int,
    reason: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Reservation).where(
        Reservation.id == reservation_id,
        Reservation.user_id == current_user.id
    )
    res = await db.execute(query)
    item = res.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if item.status == ReservationStatusEnum.cancelled:
        return {"message": "Reservation is already cancelled", "refund_amount": 0.0}

    # Policy refund check
    # >24 hrs: 100%, 12-24 hrs: 50%, <12 hrs: 0%
    now = datetime.now()
    res_datetime = datetime.combine(item.date, datetime.strptime(item.time_slot, "%H:%M").time())
    diff_hours = (res_datetime - now).total_seconds() / 3600.0

    refund_pct = 0.0
    if diff_hours >= 24:
        refund_pct = 1.0
    elif diff_hours >= 12:
        refund_pct = 0.5
    else:
        refund_pct = 0.0

    refund_amount = round(item.deposit_amount * refund_pct, 2)

    item.status = ReservationStatusEnum.cancelled
    item.cancellation_reason = reason or "Cancelled by user"
    item.cancelled_at = datetime.utcnow()
    if refund_pct > 0:
        item.payment_status = PaymentStatusEnum.refunded if refund_pct == 1.0 else PaymentStatusEnum.partial_refund

    await db.commit()
    return {
        "message": "Reservation cancelled successfully",
        "booking_ref": item.booking_ref,
        "refund_percentage": f"{int(refund_pct * 100)}%",
        "refund_amount": refund_amount,
        "policy_applied": f"Cancelled {round(diff_hours, 1)} hours prior to reservation time."
    }

@router.put("/{reservation_id}/confirm-payment")
async def confirm_payment(
    reservation_id: int,
    db: AsyncSession = Depends(get_db)
):
    query = select(Reservation).where(Reservation.id == reservation_id)
    res = await db.execute(query)
    item = res.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Reservation not found")

    item.status = ReservationStatusEnum.confirmed
    item.payment_status = PaymentStatusEnum.paid
    await db.commit()
    return {"message": "Payment confirmed and booking finalized", "booking_ref": item.booking_ref}
