from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from database import get_db
from models import MenuItem, CategoryEnum
from schemas import MenuItemOut

router = APIRouter()

@router.get("/", response_model=List[MenuItemOut])
async def get_menu(
    category: Optional[str] = Query(None),
    is_veg: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = select(MenuItem).where(MenuItem.is_available == True)
    
    if category and category.lower() != "all":
        query = query.where(MenuItem.category == category.lower())
    
    if is_veg is not None:
        query = query.where(MenuItem.is_veg == is_veg)

    if search:
        query = query.where(MenuItem.name.ilike(f"%{search}%"))

    res = await db.execute(query)
    return res.scalars().all()

@router.get("/categories")
async def get_categories():
    return [
        {"id": "all", "label": "All Dishes"},
        {"id": "appetizer", "label": "Royal Starters"},
        {"id": "main_course", "label": "Main Course"},
        {"id": "biryani", "label": "Dum Biryanis"},
        {"id": "breads", "label": "Tandoori Breads"},
        {"id": "dessert", "label": "Mithai & Desserts"},
        {"id": "beverages", "label": "Beverages & Lassi"}
    ]

@router.get("/{item_id}", response_model=MenuItemOut)
async def get_menu_item(item_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(MenuItem).where(MenuItem.id == item_id))
    item = res.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Dish not found")
    return item
