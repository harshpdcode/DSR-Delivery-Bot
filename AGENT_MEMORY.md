# AGENT_MEMORY.md Ã¢â‚¬â€ DSR Go Project State

> **Last Updated:** 2026-05-22T13:56:00+05:30
> **Project:** DSR Go Ã¢â‚¬â€ Smart Autonomous Campus Delivery Robot Platform
> **Client:** Silver Oak University, Ahmedabad
> **Stack:** FastAPI + PostgreSQL + Redis + MQTT + Celery | Next.js 15 (App Router) + TailwindCSS + Recharts + Zustand

---

## 1. Project Status Summary

| Phase | Status | Notes |
|---|---|---|
| Phase 1 Ã¢â‚¬â€ Root Scaffold | Ã¢Å“â€¦ COMPLETE | `.env`, `.gitignore`, `README.md`, Docker files, CI/CD |
| Phase 2 Ã¢â‚¬â€ Backend (FastAPI) | Ã¢Å“â€¦ COMPLETE | All routers, models, Alembic, Celery, MQTT |
| Phase 3 Ã¢â‚¬â€ Frontend (Next.js 15) | Ã¢Å“â€¦ COMPLETE | All pages created and wired |
| Phase 4 Ã¢â‚¬â€ Docker & Nginx | Ã¢Å“â€¦ COMPLETE | docker-compose.yml, prod, nginx.conf, Dockerfiles |
| Phase 5 Ã¢â‚¬â€ Docs & Polish | Ã°Å¸â€â€ž IN PROGRESS | README exists, need SETUP.md, DEPLOYMENT.md, API.md |

---

## 2. Folder Structure

```
DSR delivery bot/
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ .env                          # Populated env vars (dev)
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ .env.example                  # Template for new devs
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ .gitignore
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ README.md
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ AGENT_MEMORY.md               # Ã¢â€ Â THIS FILE
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ docker-compose.yml            # Dev compose (7 services)
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ docker-compose.prod.yml       # Production compose
Ã¢â€â€š
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ .github/
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ workflows/
Ã¢â€â€š       Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ ci.yml                # Lint + Type-check + Build
Ã¢â€â€š       Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ cd.yml                # Docker deploy workflow
Ã¢â€â€š
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ docker/
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ nginx/
Ã¢â€â€š   Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ nginx.conf            # Reverse proxy: /api Ã¢â€ â€™ backend, / Ã¢â€ â€™ frontend, /ws Ã¢â€ â€™ WS
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ mosquitto/
Ã¢â€â€š       Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ mosquitto.conf
Ã¢â€â€š
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ backend/
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Dockerfile
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ requirements.txt
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ alembic.ini
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ alembic/
Ã¢â€â€š   Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ env.py                # Async Alembic config
Ã¢â€â€š   Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ script.py.mako
Ã¢â€â€š   Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ versions/.gitkeep
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ app/
Ã¢â€â€š       Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ __init__.py
Ã¢â€â€š       Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ main.py               # FastAPI app, lifespan, middleware, router mounts
Ã¢â€â€š       Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ celery_app.py         # Celery config (Redis broker)
Ã¢â€â€š       Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ core/
Ã¢â€â€š       Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ config.py         # Pydantic Settings (from .env)
Ã¢â€â€š       Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ database.py       # AsyncSession + engine (PostgreSQL)
Ã¢â€â€š       Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ redis.py          # aioredis connection
Ã¢â€â€š       Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ security.py       # JWT create/decode, bcrypt hash/verify
Ã¢â€â€š       Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ deps.py           # get_current_user, require_role dependencies
Ã¢â€â€š       Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ mqtt.py           # MQTT client service
Ã¢â€â€š       Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ models/
Ã¢â€â€š       Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ __init__.py       # Registers all models for Alembic
Ã¢â€â€š       Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ user.py           # User + UserRole enum
Ã¢â€â€š       Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ robot.py          # Robot + RobotStatus enum
Ã¢â€â€š       Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ delivery.py       # Delivery + DeliveryStatus enum + CampusBlock enum
Ã¢â€â€š       Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ supporting.py     # Telemetry, RobotHealth, OTPLog, Notification, DeliveryHistory, AuditLog
Ã¢â€â€š       Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ schemas/
Ã¢â€â€š       Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ __init__.py
Ã¢â€â€š       Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ schemas.py        # All Pydantic request/response models
Ã¢â€â€š       Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ routers/
Ã¢â€â€š       Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ __init__.py
Ã¢â€â€š       Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ auth.py           # POST /register, /login, /refresh, GET /me, POST /logout
Ã¢â€â€š       Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ robots.py         # GET /robots, GET /robots/{id}, PUT /robots/{id}/status, GET /health, GET /telemetry
Ã¢â€â€š       Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ deliveries.py     # CRUD + /start, /complete
Ã¢â€â€š       Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ otp.py            # POST /generate, /verify
Ã¢â€â€š       Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ analytics.py      # GET /overview, /deliveries, /robots, /heatmap
Ã¢â€â€š       Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ tracking.py       # WebSocket /ws/tracking/{delivery_id}, /ws/notifications/{user_id}
Ã¢â€â€š       Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ services/
Ã¢â€â€š       Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ (future services)
Ã¢â€â€š       Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ tasks/
Ã¢â€â€š           Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ tasks.py          # Celery tasks (push notification, OTP expiry, telemetry aggregation)
Ã¢â€â€š
Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ frontend/
    Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Dockerfile
    Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ package.json              # Next 15, React 19, recharts, zustand, lucide, sonner, mapbox-gl, framer-motion
    Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ tsconfig.json             # @/* Ã¢â€ â€™ ./src/*
    Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ next.config.ts            # Rewrites: /api Ã¢â€ â€™ backend:8000, /ws Ã¢â€ â€™ backend:8000
    Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ tailwind.config.js        # Custom theme (brand, surface, status colors)
    Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ postcss.config.js
    Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ src/
        Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ store/
        Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ authStore.ts      # Zustand: user, token, login(), register(), logout(), initialize()
        Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ app/
            Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ globals.css       # @tailwind directives, glassmorphism, scrollbar, ring-indicator animation
            Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ layout.tsx        # Root layout with Inter font, <Providers>
            Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ providers.tsx     # QueryClientProvider + Sonner Toaster
            Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ page.tsx          # Landing/marketing page (animated hero)
            Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ login/
            Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ page.tsx      # Zod + React Hook Form login
            Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ register/
            Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ page.tsx      # Zod + React Hook Form register
            Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ dashboard/
                Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ layout.tsx    # Sidebar + Header + Auth guard + Mobile drawer
                Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ page.tsx      # Overview metrics dashboard
                Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ robots/
                Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ page.tsx  # Fleet grid (battery bars, status badges)
                Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ [id]/
                Ã¢â€â€š       Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ page.tsx  # Diagnostics: specs, sensor array, telemetry logs, control panel override
                Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ delivery/
                Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ new/
                Ã¢â€â€š   Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ page.tsx  # New delivery form (robot + block select)
                Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ [id]/
                Ã¢â€â€š       Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ page.tsx  # Live Tracking: SVG campus map, OTP flow, WebSocket telemetry
                Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ analytics/
                Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ page.tsx  # AreaChart trends, PieChart heatmap, BarChart fleet, metrics cards
                Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ notifications/
                Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ page.tsx  # Real-time WS alerts, localStorage persistence, Sonner toasts
                Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ settings/
                    Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ page.tsx  # Profile, preference toggles, developer JWT tools
```

---

## 3. API Endpoints (Backend)

All routers mounted under `prefix="/api/v1"` except tracking WebSockets.

### Auth (`/api/v1/auth`)
| Method | Path | Purpose |
|---|---|---|
| POST | `/register` | Create new user |
| POST | `/login` | JWT token pair |
| POST | `/refresh` | Refresh access token |
| GET | `/me` | Current user profile |
| POST | `/logout` | Client-side token discard |

### Robots (`/api/v1/robots`)
| Method | Path | Purpose |
|---|---|---|
| GET | `/` | List all robots (optional `status_filter` query) |
| GET | `/{robot_id}` | Single robot details |
| PUT | `/{robot_id}/status` | Manual status override (admin/operator/maintenance) |
| GET | `/{robot_id}/health` | Sensor health records (last 50) |
| GET | `/{robot_id}/telemetry` | Telemetry log (last N, max 500) |

### Deliveries (`/api/v1/deliveries`)
| Method | Path | Purpose |
|---|---|---|
| POST | `/` | Create delivery |
| GET | `/` | List user deliveries |
| GET | `/{id}` | Get delivery details |
| POST | `/{id}/start` | Begin mission |
| POST | `/{id}/complete` | Mark completed |

### OTP (`/api/v1/otp`)
| Method | Path | Purpose |
|---|---|---|
| POST | `/generate` | Generate 6-digit OTP |
| POST | `/verify` | Verify OTP Ã¢â€ â€™ unlock compartment |

### Analytics (`/api/v1/analytics`)
| Method | Path | Purpose |
|---|---|---|
| GET | `/overview` | Top-level stats (totals, success rate, avg time) |
| GET | `/deliveries?days=N` | Daily delivery trend counts |
| GET | `/robots` | Per-robot efficiency stats |
| GET | `/heatmap` | Delivery count per destination block |

### WebSockets (no `/api/v1` prefix)
| Path | Purpose |
|---|---|
| `/ws/tracking/{delivery_id}` | Live telemetry + status updates |
| `/ws/notifications/{user_id}` | Real-time user alerts |

---

## 4. Design System

### Color Palette (Tailwind tokens)
| Token | Hex | Usage |
|---|---|---|
| `brand-lime` | `#C6FF00` | Primary accent, CTA buttons, active states |
| `brand-yellow` | `#F5E14B` | Secondary accent, robot icons, warnings |
| `brand-black` | `#111111` | Text on lime buttons |
| `brand-graphite` | `#2B2B2B` | Borders, cards |
| `brand-white` | `#F5F5F3` | Body text |
| `brand-gray` | `#EAEAEA` | Muted text (used with opacity) |
| `surface-0` | `#0A0A0A` | Page background |
| `surface-1` | `#111111` | Card backgrounds |
| `surface-2` | `#1A1A1A` | Elevated surfaces |
| `surface-3` | `#222222` | Borders, dividers |
| `surface-4` | `#2B2B2B` | Subtle borders |
| `status-success` | `#22C55E` | Completed, healthy |
| `status-warning` | `#EAB308` | Caution states |
| `status-error` | `#EF4444` | Errors, maintenance |
| `status-info` | `#3B82F6` | Informational |

### Typography
- **Font:** Inter (Google Fonts), SF Pro Display fallback
- **Sizes:** `display-lg` (3.5rem) Ã¢â€ â€™ `display` (2.5rem) Ã¢â€ â€™ `heading` (1.75rem) Ã¢â€ â€™ `title` (1.25rem) Ã¢â€ â€™ `body` (0.9375rem) Ã¢â€ â€™ `caption` (0.8125rem) Ã¢â€ â€™ `micro` (0.6875rem)

### UI Patterns
- **Glassmorphism:** `glassmorphism` utility class Ã¢â€ â€™ `bg-surface-2/60 backdrop-blur-md border border-surface-4/40`
- **Shadows:** `shadow-glow-lime` Ã¢â€ â€™ `0 0 20px rgba(198,255,0,0.3)`
- **Animations:** `fade-in`, `slide-up`, `slide-in-right`, `pulse-slow`, `spin-slow`, `robot-move`
- **Cards:** Rounded `2xl`/`3xl` with `border border-surface-4` + hover `border-brand-lime/20`

---

## 5. Database Models

### Users
- `id`, `email`, `full_name`, `phone`, `hashed_password`, `role` (enum: admin/operator/security/maintenance/user), `avatar_url`, `is_active`, `is_verified`, `created_at`, `deleted_at`

### Robots
- `id`, `name`, `serial_number`, `status` (enum: idle/en_route/delivering/charging/maintenance/offline), `battery_level`, `location_lat`, `location_lng`, `heading`, `speed`, `firmware_version`, `payload_capacity_kg`, `model_type`, `last_maintenance`, `error_message`, `created_at`, `deleted_at`

### Deliveries
- `id`, `tracking_code`, `robot_id`, `sender_id`, `receiver_id`, `receiver_phone`, `receiver_name`, `origin_block`, `destination_block` (enum: A/B/C/D/E Block), `status` (enum: pending/en_route/arrived/waiting_otp/otp_verified/completed/cancelled/returning), `package_description`, `package_weight_kg`, `priority`, `estimated_arrival`, `actual_arrival`, `created_at`, `completed_at`, `deleted_at`

### Supporting Tables
- **Telemetry:** `robot_id`, `latitude`, `longitude`, `speed`, `heading`, `battery_level`, `temperature`, `signal_strength`, `timestamp`
- **RobotHealth:** `robot_id`, `sensor_name`, `status`, `value`, `unit`, `message`, `recorded_at`
- **OTPLog:** `delivery_id`, `otp_hash`, `attempts`, `max_attempts`, `expires_at`, `verified_at`, `sent_via`, `created_at`
- **Notification:** `user_id`, `title`, `body`, `type`, `read`, `metadata` (JSON), `created_at`
- **DeliveryHistory:** `delivery_id`, `status`, `note`, `changed_by`, `timestamp`
- **AuditLog:** `user_id`, `action`, `resource`, `resource_id`, `metadata` (JSON), `ip_address`, `user_agent`, `created_at`

---

## 6. Docker Services (Development)

| Service | Image | Port | Notes |
|---|---|---|---|
| `postgres` | postgres:16-alpine | 5432 | DB: `dsr_go`, User: `dsr_go_user` |
| `redis` | redis:7-alpine | 6379 | Celery broker + caching |
| `mqtt` | eclipse-mosquitto:2 | 1883, 9001 | Robot telemetry MQTT broker |
| `backend` | Custom (Dockerfile) | 8000 | Uvicorn with `--reload` |
| `celery` | Same as backend | Ã¢â‚¬â€ | 4 workers |
| `frontend` | Custom (Dockerfile) | 3000 | `npm run dev --turbopack` |
| `nginx` | nginx:alpine | 80, 443 | Reverse proxy |

---

## 7. Key Dependencies

### Backend (`requirements.txt`)
- `fastapi`, `uvicorn[standard]`, `sqlalchemy[asyncio]`, `asyncpg`, `alembic`
- `python-jose[cryptography]`, `passlib[bcrypt]`, `python-multipart`
- `pydantic[email]`, `pydantic-settings`, `orjson`
- `redis`, `celery`, `paho-mqtt`, `loguru`, `httpx`

### Frontend (`package.json`)
- `next@^15.1.0`, `react@^19.0.0`, `react-dom@^19.0.0`
- `@tanstack/react-query@^5.62.0`, `zustand@^5.0.2`
- `recharts@^2.15.0`, `lucide-react@^0.468.0`, `sonner@^1.7.1`
- `react-hook-form@^7.54.0`, `zod@^3.24.1`, `@hookform/resolvers@^3.9.1`
- `framer-motion@^11.15.0`, `mapbox-gl@^3.8.0`, `socket.io-client@^4.8.1`
- `date-fns@^4.1.0`, `next-themes@^0.4.4`
- Radix UI primitives (avatar, dialog, dropdown-menu, label, progress, select, separator, slot, tabs, toast, tooltip)
- TailwindCSS 3, PostCSS, Autoprefixer

---

## 8. Architecture Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-05-22 | Async SQLAlchemy + asyncpg | Non-blocking DB I/O for WebSocket-heavy workload |
| 2026-05-22 | Native WebSocket over Socket.IO on backend | Simpler FastAPI integration; Socket.IO client on frontend only if needed |
| 2026-05-22 | Zustand over Redux | Minimal boilerplate for auth state; scales well with React 19 |
| 2026-05-22 | TanStack React Query for API | Auto-caching, retry, refetch; eliminates manual loading states |
| 2026-05-22 | SVG Campus Map (not Mapbox) for tracking | Campus-specific block layout; no external API key needed |
| 2026-05-22 | OTP simulation in dev mode | API returns Dev OTP in response message for testing without SMS gateway |
| 2026-05-22 | Mock sensor data fallback | Robot details page pre-seeds 8 mock sensors when DB has no health records |
| 2026-05-22 | localStorage for notifications | Client-side notification persistence; real-time via WebSocket overlay |
| 2026-05-22 | Recharts for analytics | Lightweight, React-native charting; SSR-safe with `mounted` guard |

---

## 9. Pending Tasks

- [x] Create `/docs/SETUP.md` Ã¢â‚¬â€ Local development setup guide
- [x] Create `/docs/DEPLOYMENT.md` Ã¢â‚¬â€ Docker + production deployment guide
- [x] Create `/docs/API.md` Ã¢â‚¬â€ Full API reference documentation
- [x] Run `npm install` + `npm run build` for frontend type verification
- [x] Update `task.md` artifact with final completion status
- [x] Create `walkthrough.md` artifact summarizing all changes

---

## 10. Bug Fixes & Known Issues

| Issue | Status | Notes |
|---|---|---|
| `next` command not found | Ã°Å¸â€Â§ FIX: Run `npm install` first | node_modules not committed; needs install on fresh clone |
| eslint-visitor-keys engine warning | Ã¢Å¡Â Ã¯Â¸Â WARN | Non-blocking; requires Node Ã¢â€°Â¥20.19 for full compat |
| `@types/mapbox-gl` deprecated | Ã¢Å¡Â Ã¯Â¸Â WARN | mapbox-gl ships own types now; can remove from devDeps |

---

## 11. Campus Block Coordinates (SVG Map)

Used in `/dashboard/delivery/[id]` tracking page:

| Block | Label | SVG X | SVG Y | Name |
|---|---|---|---|---|
| A Block | A | 120 | 320 | Main Administration |
| B Block | B | 260 | 150 | Science & Tech |
| C Block | C | 420 | 180 | Engineering & Lab |
| D Block | D | 180 | 80 | Computer Applications |
| E Block | E | 480 | 350 | Management & Humanities |

---

## 12. Environment Variables (from `.env`)

```
APP_NAME=DSR Go
APP_VERSION=1.0.0
APP_ENV=development
SECRET_KEY=<jwt-secret>
POSTGRES_HOST=postgres (docker) / localhost (local)
POSTGRES_PORT=5432
POSTGRES_DB=dsr_go
POSTGRES_USER=dsr_go_user
POSTGRES_PASSWORD=dsr_go_dev_pass
REDIS_HOST=redis (docker) / localhost (local)
REDIS_PORT=6379
MQTT_BROKER_HOST=mqtt (docker) / localhost (local)
MQTT_BROKER_PORT=1883
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:3000,http://localhost:80
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```
