import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, AsyncSessionLocal
from seed_data import seed_database
from routers import auth, reservations, waiting_list, menu, orders, payments, chatbot

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schemas
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Auto-seed initial tables, menu, demo users if empty
    async with AsyncSessionLocal() as session:
        await seed_database(session)
    yield

app = FastAPI(
    title="Royal Rasoi Restaurant API",
    description="Fine Indian Dining Reservation & Food Ordering System - Boisar",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(reservations.router, prefix="/reservations", tags=["Reservations & Seating"])
app.include_router(waiting_list.router, prefix="/waiting-list", tags=["Smart Waiting List"])
app.include_router(menu.router, prefix="/menu", tags=["Menu & Dishes"])
app.include_router(orders.router, prefix="/orders", tags=["Food Pre-Orders"])
app.include_router(payments.router, prefix="/payments", tags=["Simulated Payment Gateway"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["AI Concierge Assistant"])

@app.get("/")
async def root():
    return {
        "restaurant": "Royal Rasoi",
        "tagline": "Fine Indian Dining • Boisar",
        "status": "online",
        "contact": "+91 98765 43210",
        "address": "Shop 12, Shivaji Nagar, Boisar, Palghar - 401501"
    }
