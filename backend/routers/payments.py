from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database import get_db
from models import Reservation, ReservationStatusEnum, PaymentStatusEnum
from auth import get_optional_current_user

router = APIRouter()

class PaymentProcessRequest(BaseModel):
    booking_ref: str
    amount: float
    payment_method: str = Field(..., description="card, upi, or netbanking")
    card_number: Optional[str] = None
    upi_id: Optional[str] = None
    bank_name: Optional[str] = None
    accepted_policy: bool = Field(..., description="Must accept terms and cancellation policy")

@router.post("/process")
async def process_payment(req: PaymentProcessRequest, db: AsyncSession = Depends(get_db)):
    if not req.accepted_policy:
        raise HTTPException(status_code=400, detail="You must read and accept the cancellation policy before completing payment.")

    res = await db.execute(select(Reservation).where(Reservation.booking_ref == req.booking_ref))
    booking = res.scalars().first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking reference not found")

    # Simulate realistic payment processing
    txn_id = f"TXN-RR-{uuid.uuid4().hex[:10].upper()}"
    booking.status = ReservationStatusEnum.confirmed
    booking.payment_status = PaymentStatusEnum.paid

    await db.commit()

    return {
        "status": "success",
        "message": "Payment simulation successful. Table reserved!",
        "transaction_id": txn_id,
        "booking_ref": booking.booking_ref,
        "amount_paid": req.amount,
        "payment_method": req.payment_method,
        "timestamp": datetime.utcnow().isoformat(),
        "is_simulated": True
    }

@router.get("/{booking_ref}")
async def get_payment_status(booking_ref: str, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Reservation).where(Reservation.booking_ref == booking_ref))
    booking = res.scalars().first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    return {
        "booking_ref": booking.booking_ref,
        "deposit_amount": booking.deposit_amount,
        "payment_status": booking.payment_status.value if hasattr(booking.payment_status, 'value') else booking.payment_status,
        "booking_status": booking.status.value if hasattr(booking.status, 'value') else booking.status,
    }
