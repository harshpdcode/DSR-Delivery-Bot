# 🤖 DSR Go — Autonomous Campus Delivery Robot System

> **Smart Autonomous Campus Delivery Robot Platform for Silver Oak University**  
> A full-stack, real-time autonomous robot delivery system featuring live telemetry tracking, OTP-based secure compartment unlocking, sender/receiver audit trails, and interactive fleet simulation.

---

## ✨ Features

- **🚀 One-Command Launch**: Run both Next.js frontend and FastAPI backend with a single `npm run dev` command.
- **📍 Real-Time Telemetry Tracking**: Live map featuring animated robot movement, heading direction, speed, battery level, and Silver Oak campus block waypoints (A, B, C, D, E Blocks).
- **🔑 Secure OTP Cargo Unlock**: Deterministic 6-digit OTP code generation with one-click copy button for senders and an interactive PIN keypad station for receivers.
- **🛡️ Sender & Receiver Audit Trail**: Complete record logging of order creator, package retriever, verification timestamps, and compartment hatch disengagement notes.
- **🤖 Fleet Management & Simulator**: Admin fleet controls to manage robot statuses (Idle, En Route, Charging, Offline), view sensor telemetry, and simulate campus navigation.
- **🎨 Modern Dark UI**: Sleek glassmorphism aesthetic with responsive sidebars (sticky for users, scrollable for admins).

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router, Turbopack), React 19, TypeScript, TailwindCSS, Lucide Icons, Sonner Toasts
- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.0 (AsyncIO), Uvicorn, WebSockets, Pydantic v2
- **Database**: SQLite (built-in fallback for zero-config dev) or PostgreSQL (`postgresql+asyncpg`)

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/dsr-autonomous-delivery-system.git
cd dsr-autonomous-delivery-system
```

### 2. Set Up Environment Files
- Copy `.env.example` to `.env` in the root folder.

### 3. Run the Development Server
```bash
npm run dev
```

The application will be accessible at:
- **Frontend Dashboard**: `http://localhost:3000`
- **Backend Swagger Docs**: `http://localhost:8000/docs`

---

## 🔐 Credentials (Demo / Testing)

| Role | Email | Password | Phone |
| :--- | :--- | :--- | :--- |
| **Admin** | `test@example.com` | `password123` | `+1234567890` |
| **User** | `user@example.com` | `password123` | `+1987654321` |

---

## 📁 Project Structure

```
DSR delivery bot/
├── backend/                  # FastAPI Backend API
│   ├── app/
│   │   ├── core/            # Config, Security, Database
│   │   ├── models/          # SQLAlchemy Models (Delivery, Robot, User, Supporting)
│   │   ├── routers/         # API Routes (Auth, Deliveries, Robots, OTP, Analytics, Tracking)
│   │   └── schemas/         # Pydantic Schemas
│   ├── seed.py              # Auto-seeding script for initial database setup
│   └── requirements.txt     # Python Dependencies
├── frontend/                 # Next.js Frontend Application
│   ├── src/
│   │   ├── app/             # App Router Pages (/dashboard, /delivery, /otp, /simulator)
│   │   ├── components/      # Reusable UI Components & Navigation Layouts
│   │   └── store/           # Zustand Auth & State Management
│   └── package.json
├── DEPLOYMENT.md             # Production Deployment Guide
├── .env.example              # Environment Variables Template
└── package.json              # Root Concurrent Development Launcher
```

---

## 📖 Production Deployment

For complete instructions on deploying to cloud VPS, Render, Railway, or Vercel, check out the [DEPLOYMENT.md](DEPLOYMENT.md) guide.

---

## 📄 License
MIT License. Created for Silver Oak University Campus Delivery Bot Project.
