from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from database import get_db
from models import Order, OrderItem, MenuItem, User, OrderStatusEnum
from schemas import OrderCreate, OrderOut
from auth import get_current_user

router = APIRouter()

@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not order_in.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    total_amount = 0.0
    order_items_to_create = []

    for item in order_in.items:
        res = await db.execute(select(MenuItem).where(MenuItem.id == item.menu_item_id))
        menu_item = res.scalars().first()
        if not menu_item:
            raise HTTPException(status_code=404, detail=f"Dish ID {item.menu_item_id} not found")

        item_subtotal = menu_item.price * item.quantity
        total_amount += item_subtotal

        order_items_to_create.append(
            OrderItem(
                menu_item_id=menu_item.id,
                quantity=item.quantity,
                price=menu_item.price,
                special_instructions=item.special_instructions
            )
        )

    # 30% advance deposit for kitchen pre-order preparation
    advance = round(total_amount * 0.30, 2)

    order = Order(
        reservation_id=order_in.reservation_id,
        user_id=current_user.id,
        status=OrderStatusEnum.pending,
        total_amount=total_amount,
        advance_paid=advance,
        items=order_items_to_create
    )

    db.add(order)
    await db.commit()
    await db.refresh(order)

    # Reload with relations
    res = await db.execute(
        select(Order).where(Order.id == order.id).options(
            selectinload(Order.items).selectinload(OrderItem.menu_item)
        )
    )
    return res.scalars().first()

@router.get("/my", response_model=List[OrderOut])
async def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Order).where(Order.user_id == current_user.id).options(
            selectinload(Order.items).selectinload(OrderItem.menu_item)
        ).order_by(Order.created_at.desc())
    )
    return res.scalars().all()
