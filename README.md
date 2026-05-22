# DSR Delivery Bot â€” Smart Autonomous Campus Delivery Robot System

DSR Delivery Bot is a production-grade autonomous robot delivery platform designed for Silver Oak University, Ahmedabad. The system coordinates a fleet of autonomous delivery robots, allowing users to send packages across different campus blocks, verify receipt using secure OTP-based compartment locking, and track the robot's real-time position on a live Mapbox dashboard.

## ðŸš€ Key Features

* **Real-time Live Tracking**: Live telemetry (latitude, longitude, speed, battery, heading) broadcasted via MQTT from robots, aggregated in FastAPI, and pushed to Next.js via WebSockets.
* **OTP Secure Delivery**: Two-factor verification for unlocking the robot's delivery compartment upon arrival.
* **Intelligent Fleet Management**: Monitor robot status, sensor health, and battery levels dynamically.
* **Next.js 15 UI**: Dark mode first, premium aesthetics using Tailwind, Framer Motion, and shadcn/ui components.
* **FastAPI Backend**: Async SQLAlchemy, PostgreSQL database, Redis caching, Celery background tasks, and native WebSockets.
* **Dockerized Setup**: Multi-container architecture with PostgreSQL, Redis, Mosquitto MQTT, Celery, FastAPI, Next.js, and Nginx.

---

## ðŸ—ï¸ Architecture

```
DSR Delivery Bot/
â”œâ”€â”€ frontend/          â† Next.js 15 + TypeScript + Tailwind + shadcn/ui
â”œâ”€â”€ backend/           â† FastAPI + PostgreSQL + Redis + MQTT
â”œâ”€â”€ shared/            â† Shared TypeScript types / Pydantic schemas
â”œâ”€â”€ docker/            â† Docker Compose + Nginx & Mosquitto configs
â”œâ”€â”€ .github/           â† GitHub Actions CI/CD workflows
â””â”€â”€ docs/              â† Detailed setup, deployment, and API guides
```

---

## ðŸ› ï¸ Quick Start

### Prerequisites

* Docker & Docker Compose
* Mapbox Access Token (for live map tracking)

### Running locally with Docker Compose

1. **Clone the repository and copy the environment template**:
   ```bash
   copy .env.example .env
   ```
2. **Build and start the application**:
   ```bash
   docker-compose up --build
   ```
3. **Access the application components**:
   * **Frontend**: `http://localhost:3000`
   * **Backend API Docs**: `http://localhost:8000/docs`
   * **Nginx Reverse Proxy**: `http://localhost:80`
   * **MQTT Broker**: `localhost:1883`

---

## ðŸ“‚ Development

### Backend Setup (FastAPI)

1. Navigate to `/backend`:
   ```bash
   cd backend
   ```
2. Create and activate a python virtual environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations and start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup (Next.js)

1. Navigate to `/frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in development mode:
   ```bash
   npm run dev
   ```

---

## ðŸ“œ License

This project is licensed under the MIT License.
