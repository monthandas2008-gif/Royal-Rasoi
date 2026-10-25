from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, field_validator
import re


# ── User Schemas ──────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    created_at: datetime
    is_active: bool

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── Table Schemas ─────────────────────────────────────────────────────────

class SeatOut(BaseModel):
    id: int
    table_id: int
    seat_number: int
    position_offset_x: float
    position_offset_y: float

    model_config = {"from_attributes": True}


class TableOut(BaseModel):
    id: int
    name: str
    capacity: int
    zone: str
    position_x: float
    position_y: float
    position_z: float
    status: str
    seats: List[SeatOut] = []

    model_config = {"from_attributes": True}


class TableAvailability(BaseModel):
    table: TableOut
    is_available: bool
    next_available_slot: Optional[str] = None


# ── Reservation Schemas ───────────────────────────────────────────────────

class ReservationCreate(BaseModel):
    table_id: int
    date: date
    time_slot: str
    party_size: int = Field(..., ge=1, le=20)
    special_requests: Optional[str] = None

    @field_validator("time_slot")
    @classmethod
    def validate_time_slot(cls, v: str) -> str:
        valid_slots = ["12:00", "13:00", "14:00", "15:00", "19:00", "20:00", "21:00", "22:00"]
        if v not in valid_slots:
            raise ValueError(f"Invalid time slot. Choose from: {', '.join(valid_slots)}")
        return v


class ReservationOut(BaseModel):
    id: int
    user_id: int
    table_id: int
    date: date
    time_slot: str
    party_size: int
    special_requests: Optional[str] = None
    status: str
    deposit_amount: float
    total_amount: float
    booking_ref: str
    created_at: datetime
    payment_status: str
    cancellation_reason: Optional[str] = None
    cancelled_at: Optional[datetime] = None
    table: Optional[TableOut] = None
    user: Optional[UserOut] = None

    model_config = {"from_attributes": True}


class ReservationCancel(BaseModel):
    reason: Optional[str] = None


class PaymentConfirm(BaseModel):
    booking_ref: str
    amount: float


# ── Waiting List Schemas ──────────────────────────────────────────────────

class WaitingListCreate(BaseModel):
    date: date
    time_slot: str
    party_size: int = Field(..., ge=1, le=20)
    special_requests: Optional[str] = None
    phone: Optional[str] = None
    table_id: Optional[int] = None

    @field_validator("time_slot")
    @classmethod
    def validate_time_slot(cls, v: str) -> str:
        valid_slots = ["12:00", "13:00", "14:00", "15:00", "19:00", "20:00", "21:00", "22:00"]
        if v not in valid_slots:
            raise ValueError(f"Invalid time slot. Choose from: {', '.join(valid_slots)}")
        return v


class WaitingListOut(BaseModel):
    id: int
    user_id: int
    table_id: Optional[int] = None
    date: date
    time_slot: str
    party_size: int
    position: int
    status: str
    token_ref: Optional[str] = None
    payment_amount: float = 0.0
    payment_status: str = "pending"
    special_requests: Optional[str] = None
    phone: Optional[str] = None
    offer_expires_at: Optional[datetime] = None
    confirmed_at: Optional[datetime] = None
    refunded_at: Optional[datetime] = None
    created_at: datetime
    notified_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ── Menu Schemas ──────────────────────────────────────────────────────────

class MenuItemOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    category: str
    image_url: Optional[str] = None
    is_available: bool
    is_veg: bool
    spice_level: Optional[str] = None

    model_config = {"from_attributes": True}


# ── Order Schemas ─────────────────────────────────────────────────────────

class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int = Field(..., ge=1, le=50)
    special_instructions: Optional[str] = None


class OrderCreate(BaseModel):
    reservation_id: Optional[int] = None
    items: List[OrderItemCreate] = Field(..., min_length=1)


class OrderItemOut(BaseModel):
    id: int
    order_id: int
    menu_item_id: int
    quantity: int
    price: float
    special_instructions: Optional[str] = None
    menu_item: Optional[MenuItemOut] = None

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: int
    reservation_id: Optional[int] = None
    user_id: int
    status: str
    total_amount: float
    advance_paid: float
    created_at: datetime
    items: List[OrderItemOut] = []

    model_config = {"from_attributes": True}


# ── Payment Schemas ───────────────────────────────────────────────────────

class PaymentProcess(BaseModel):
    booking_ref: str
    amount: float
    payment_method: str = "card"


class RefundRequest(BaseModel):
    booking_ref: str
    reason: Optional[str] = None


class PaymentResponse(BaseModel):
    success: bool
    transaction_id: str
    amount: float
    message: str
    booking_ref: str
    payment_status: str


# ── General ───────────────────────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str
