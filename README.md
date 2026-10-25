# 👑 Royal Rasoi — Fine Indian Dining & Intelligent Hospitality Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Three.js](https://img.shields.io/badge/Three.js-r167-black?style=flat-square&logo=three.js)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=flat-square&logo=python)](https://www.python.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

> **Next-Generation Table Reservation, 3D Spatial Digital Floor Twin, Priority Waitlist Engine & Intelligent AI Dining Concierge.**  
> *Engineered for Royal Rasoi, Boisar — where heritage Awadhi & Mughlai culinary excellence meets state-of-the-art hospitality technology.*

---

## 🌟 Key Highlights & Core Capabilities

### 1. 🏛️ Digital Spatial Twin (Interactive 3D Floor Plan & 2D Synchronized Grid)
- **Problem Addressed**: Standard reservation platforms ask guests to choose arbitrary numbers without knowing the ambience, window adjacency, or hall acoustics.
- **Engineered Solution**:
  - Open-concept, wall-free 3D architectural digital twin developed using **Three.js** and **React Three Fiber (`@react-three/fiber`)**.
  - Smooth 360° orbit rotation, fluid pan, zoom, and dynamic table highlighting.
  - Realistic seated guest avatars indicate occupied booths in real-time.
  - Real-time two-way synchronization between **3D Spatial View** and **2D Floor Grid**.
  - Dynamic occupancy algorithm that adjusts live availability according to date (weekday vs weekend) and time slot (lunch vs dinner).

### 2. ⏳ Priority Waiting List with 15-Minute 100% Refund Guarantee
- **Problem Addressed**: Walk-in and unorganized queues leave patrons waiting indefinitely during rush hours without clarity or financial security.
- **Engineered Solution**:
  - Direct waitlist table selection across all restaurant zones with convenient **12-hour session scheduling** (`12:00 PM – 03:30 PM`, `07:00 PM – 11:30 PM`).
  - First-come priority queue calculation with live position and confirmation probability estimation.
  - **15-Minute Guaranteed Window**: If an occupied table is not vacated and assigned within 15 minutes, a **100% full refund** is automatically initiated with zero penalty or deduction.
  - Cryptographic token generation (`#WL-XXXXX`) accompanied by official downloadable/printable booking receipts.
  - Auto-dismissing and dismissible confirmed status bar ensuring smooth navigation for new reservations.

### 3. 🤖 Intelligent AI Dining Concierge
- **Problem Addressed**: Diners frequently seek information regarding ingredients, allergies, nutritional summaries, table statuses, or general dining questions.
- **Engineered Solution**:
  - Interactive site-wide assistant powered by **Google GenAI SDK (`google-genai`)** with models `gemini-3.5-flash-lite` and `gemini-3.8-flash`.
  - Capable of answering **both internal restaurant questions** (recipes, spices, handi biryani, table booking, token chances, timings) and **external general knowledge inquiries** (recommendations, culinary history, science, etiquette) in an articulate and natural tone.
  - Full multilingual support across **Hindi, English, Hinglish, and regional dialects**.
  - Seamless in-chat direct table reservation and instant payment verification.

### 4. 🍽️ Interactive Culinary Menu & Dish-Level Nutritional Intelligence
- Dedicated **"Ask AI"** inspection button on every dish card.
- Instantly displays calorie breakdowns, core ingredients, and chef pairing suggestions.
- Interactive follow-up Q&A for custom dietary preferences (gluten-free, spice level, vegan options).

### 5. 💳 Multi-Stage Simulated Banking Gateway
- High-fidelity 256-bit encrypted checkout flow simulating UPI FastPay (VPA), Credit/Debit Cards (3D Secure), and NetBanking.
- Instant SMS & WhatsApp notification dispatch simulation.

---

## 🏗️ Technical Architecture & System Design

```
Royal-Rasoi/
├── backend/
│   ├── routers/
│   │   ├── auth.py            # Patron authentication & JWT session management
│   │   ├── reservations.py    # Spatial table allocation & dynamic date/time availability
│   │   ├── waiting_list.py    # Priority queue tokens, timer & simulated refunds
│   │   ├── menu.py            # Culinary menu catalogue & category filtering
│   │   ├── orders.py          # Food pre-orders & table service sync
│   │   ├── payments.py        # Simulated 256-bit banking transaction gateway
│   │   └── chatbot.py         # AI Concierge powered by Google GenAI (Gemini)
│   ├── database.py            # Async SQLAlchemy engine with SQLite / PostgreSQL
│   ├── models.py              # Normalized relational schemas (Users, Tables, Bookings, Tokens)
│   ├── seed_data.py           # Database initial seeder with 20 tables & signature dishes
│   └── requirements.txt       # Production Python dependencies
├── frontend/
│   ├── app/
│   │   ├── book/              # Multi-step table reservation with 12-hour session selection
│   │   ├── seating/           # 3D spatial floor twin & synchronized 2D floor grid
│   │   ├── waiting-list/      # Live priority token queue & tracking dashboard
│   │   ├── menu/              # Dish cards with chef insights & "Ask AI" modal
│   │   ├── bookings/          # Patron reservation history & downloadable vouchers
│   │   └── page.tsx           # Luxury guest landing page with high-contrast trust bar
│   ├── components/
│   │   ├── seating/           # React Three Fiber 3D architectural canvas & shaders
│   │   ├── chat/              # GlobalChatbotDrawer site-wide conversational concierge
│   │   └── layout/            # Navbar, footer, and floating waitlist tracker widget
│   └── lib/                   # Axios API client, Zustand stores, and styling utilities
└── README.md                  # Comprehensive repository documentation
```

---

## 💻 Tech Stack Summary

| Domain | Technology / Library |
|---|---|
| **Frontend Framework** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling & Motion** | Tailwind CSS, Framer Motion, Lucide React |
| **3D Visualization** | Three.js, `@react-three/fiber`, `@react-three/drei` |
| **Client State** | Zustand (Persistent local storage & reactive session sync) |
| **Backend Framework** | FastAPI (ASGI), Uvicorn, Python 3.10+ |
| **ORM & Database** | SQLAlchemy 2.0 (AsyncIO), `aiosqlite`, SQLite |
| **AI Engine** | Google GenAI SDK (`google-genai`), Gemini Models |
| **Auth & Security** | JWT (JSON Web Tokens), Passlib (Bcrypt), CORS Middleware |

---

## 🚀 Quickstart & Local Installation Guide

### Prerequisites
- **Node.js** (v18.17 or higher) & **npm**
- **Python** (v3.10 or higher) & **pip**
- **Git**

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/monthandas2008-gif/Royal-Rasoi.git
cd Royal-Rasoi
```

---

### Step 2: Backend Setup
```bash
cd backend

# Create and activate a Python virtual environment (optional but recommended)
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install required backend packages
pip install -r requirements.txt

# Configure your environment variables:
cp .env.example .env
# Open .env and add your GEMINI_API_KEY if you wish to enable custom Gemini AI keys:
# GEMINI_API_KEY=your_gemini_api_key_here

# Launch the FastAPI ASGI server
uvicorn main:app --reload --port 8000
```
> The API will be accessible at `http://localhost:8000`.  
> Interactive OpenAPI documentation is available at `http://localhost:8000/docs`.

---

### Step 3: Frontend Setup
Open a new terminal window in the root directory:
```bash
cd frontend

# Install frontend dependencies
npm install

# Run the Next.js development server
npm run dev
```
> Open your browser and navigate to `http://localhost:3000`.

---

## 🧪 Testing & Verification Suite

### Frontend Typecheck & Production Build
```bash
cd frontend
npm run build
```
*Expected Output: `✓ Compiled successfully`, `✓ Linting and checking validity of types`, `✓ Generating static pages (13/13)`.*

### Backend Endpoint Verification
```bash
# Verify availability sync endpoint
curl -X GET "http://127.0.0.1:8000/reservations/availability?date=2026-10-26&time_slot=19:00&party_size=2"

# Verify AI Concierge message endpoint
curl -X POST "http://127.0.0.1:8000/chatbot/message" \
     -H "Content-Type: application/json" \
     -d '{"message": "What is Dum Pukht Mutton Biryani?"}'
```

---

## 🔐 Environment Variables

| Variable | Location | Description |
|---|---|---|
| `GEMINI_API_KEY` | `backend/.env` | Google Gemini API Key for conversational AI Concierge |
| `NEXT_PUBLIC_API_URL` | `frontend/.env.local` | Base URL for FastAPI backend (default: `http://localhost:8000`) |

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).

---

## 👑 Royal Rasoi Dining Information
- **Location**: Shop 12, Shivaji Nagar Main Road, Boisar, Palghar - 401501
- **Hours (12-Hour Format)**: 
  - Lunch Session: `12:00 PM – 03:30 PM`
  - Dinner Session: `07:00 PM – 11:30 PM`
- **Contact**: `+91 98765 43210`
