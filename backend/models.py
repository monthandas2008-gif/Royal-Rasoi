from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime,
    ForeignKey, Text, Enum as SAEnum, Date, Time
)
from sqlalchemy.orm import relationship
import enum

from database import Base


# ── Enums ──────────────────────────────────────────────────────────────────

class ZoneEnum(str, enum.Enum):
    main_hall = "main_hall"
    outdoor = "outdoor"
    private = "private"
    bar = "bar"


class TableStatusEnum(str, enum.Enum):
    available = "available"
    booked = "booked"
    reserved = "reserved"
    maintenance = "maintenance"


class ReservationStatusEnum(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"


class PaymentStatusEnum(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    refunded = "refunded"
    partial_refund = "partial_refund"


class WaitingListStatusEnum(str, enum.Enum):
    waiting = "waiting"
    offered = "offered"
    expired = "expired"
    fulfilled = "fulfilled"
    cancelled = "cancelled"


class CategoryEnum(str, enum.Enum):
    appetizer = "appetizer"
    main_course = "main_course"
    dessert = "dessert"
    beverages = "beverages"
    breads = "breads"
    biryani = "biryani"


class SpiceLevelEnum(str, enum.Enum):
    mild = "mild"
    medium = "medium"
    hot = "hot"


class OrderStatusEnum(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    preparing = "preparing"
    ready = "ready"
    delivered = "delivered"
    cancelled = "cancelled"


# ── Models ─────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    reservations = relationship("Reservation", back_populates="user")
    waiting_list = relationship("WaitingList", back_populates="user")
    orders = relationship("Order", back_populates="user")


class Table(Base):
    __tablename__ = "tables"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    capacity = Column(Integer, nullable=False)
    zone = Column(SAEnum(ZoneEnum), nullable=False, default=ZoneEnum.main_hall)
    position_x = Column(Float, default=0.0)
    position_y = Column(Float, default=0.0)
    position_z = Column(Float, default=0.0)
    status = Column(SAEnum(TableStatusEnum), nullable=False, default=TableStatusEnum.available)

    seats = relationship("Seat", back_populates="table", cascade="all, delete-orphan")
    reservations = relationship("Reservation", back_populates="table")


class Seat(Base):
    __tablename__ = "seats"

    id = Column(Integer, primary_key=True, index=True)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=False)
    seat_number = Column(Integer, nullable=False)
    position_offset_x = Column(Float, default=0.0)
    position_offset_y = Column(Float, default=0.0)

    table = relationship("Table", back_populates="seats")


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=False)
    date = Column(Date, nullable=False)
    time_slot = Column(String(10), nullable=False)
    party_size = Column(Integer, nullable=False)
    special_requests = Column(Text, nullable=True)
    status = Column(
        SAEnum(ReservationStatusEnum),
        nullable=False,
        default=ReservationStatusEnum.pending,
    )
    deposit_amount = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    booking_ref = Column(String(20), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    payment_status = Column(
        SAEnum(PaymentStatusEnum),
        nullable=False,
        default=PaymentStatusEnum.pending,
    )
    cancellation_reason = Column(Text, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="reservations")
    table = relationship("Table", back_populates="reservations")
    orders = relationship("Order", back_populates="reservation")


class WaitingList(Base):
    __tablename__ = "waiting_list"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    time_slot = Column(String(10), nullable=False)
    party_size = Column(Integer, nullable=False)
    position = Column(Integer, nullable=False)
    status = Column(
        SAEnum(WaitingListStatusEnum),
        nullable=False,
        default=WaitingListStatusEnum.waiting,
    )
    # Payment & token fields
    token_ref = Column(String(20), unique=True, nullable=True)          # e.g. WL-00123
    payment_amount = Column(Float, default=0.0)                         # Full advance paid
    payment_status = Column(
        SAEnum(PaymentStatusEnum),
        nullable=False,
        default=PaymentStatusEnum.pending,
    )
    special_requests = Column(Text, nullable=True)
    phone = Column(String(20), nullable=True)                           # For SMS/WhatsApp
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=True)
    offer_expires_at = Column(DateTime, nullable=True)                  # 15-min window
    confirmed_at = Column(DateTime, nullable=True)                      # When slot confirmed
    refunded_at = Column(DateTime, nullable=True)                       # When auto-refunded
    created_at = Column(DateTime, default=datetime.utcnow)
    notified_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="waiting_list")


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    category = Column(SAEnum(CategoryEnum), nullable=False)
    image_url = Column(String(500), nullable=True)
    is_available = Column(Boolean, default=True)
    is_veg = Column(Boolean, default=True)
    spice_level = Column(SAEnum(SpiceLevelEnum), nullable=True)

    order_items = relationship("OrderItem", back_populates="menu_item")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(
        SAEnum(OrderStatusEnum),
        nullable=False,
        default=OrderStatusEnum.pending,
    )
    total_amount = Column(Float, default=0.0)
    advance_paid = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    reservation = relationship("Reservation", back_populates="orders")
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    price = Column(Float, nullable=False)
    special_instructions = Column(Text, nullable=True)

    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem", back_populates="order_items")
