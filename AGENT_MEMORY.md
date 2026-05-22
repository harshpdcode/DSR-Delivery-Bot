# AGENT_MEMORY.md â€” DSR Delivery Bot Project State

> **Last Updated:** 2026-05-22T13:56:00+05:30
> **Project:** DSR Delivery Bot â€” Smart Autonomous Campus Delivery Robot Platform
> **Client:** Silver Oak University, Ahmedabad
> **Stack:** FastAPI + PostgreSQL + Redis + MQTT + Celery | Next.js 15 (App Router) + TailwindCSS + Recharts + Zustand

---

## 1. Project Status Summary

| Phase | Status | Notes |
|---|---|---|
| Phase 1 â€” Root Scaffold | âœ… COMPLETE | `.env`, `.gitignore`, `README.md`, Docker files, CI/CD |
| Phase 2 â€” Backend (FastAPI) | âœ… COMPLETE | All routers, models, Alembic, Celery, MQTT |
| Phase 3 â€” Frontend (Next.js 15) | âœ… COMPLETE | All pages created and wired |
| Phase 4 â€” Docker & Nginx | âœ… COMPLETE | docker-compose.yml, prod, nginx.conf, Dockerfiles |
| Phase 5 â€” Docs & Polish | ðŸ”„ IN PROGRESS | README exists, need SETUP.md, DEPLOYMENT.md, API.md |

---

## 2. Folder Structure

```
DSR delivery bot/
â”œâ”€â”€ .env                          # Populated env vars (dev)
â”œâ”€â”€ .env.example                  # Template for new devs
â”œâ”€â”€ .gitignore
â”œâ”€â”€ README.md
â”œâ”€â”€ AGENT_MEMORY.md               # â† THIS FILE
â”œâ”€â”€ docker-compose.yml            # Dev compose (7 services)
â”œâ”€â”€ docker-compose.prod.yml       # Production compose
â”‚
â”œâ”€â”€ .github/
â”‚   â””â”€â”€ workflows/
â”‚       â”œâ”€â”€ ci.yml                # Lint + Type-check + Build
â”‚       â””â”€â”€ cd.yml                # Docker deploy workflow
â”‚
â”œâ”€â”€ docker/
â”‚   â”œâ”€â”€ nginx/
â”‚   â”‚   â””â”€â”€ nginx.conf            # Reverse proxy: /api â†’ backend, / â†’ frontend, /ws â†’ WS
â”‚   â””â”€â”€ mosquitto/
â”‚       â””â”€â”€ mosquitto.conf
â”‚
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ Dockerfile
â”‚   â”œâ”€â”€ requirements.txt
â”‚   â”œâ”€â”€ alembic.ini
â”‚   â”œâ”€â”€ alembic/
â”‚   â”‚   â”œâ”€â”€ env.py                # Async Alembic config
â”‚   â”‚   â”œâ”€â”€ script.py.mako
â”‚   â”‚   â””â”€â”€ versions/.gitkeep
â”‚   â””â”€â”€ app/
â”‚       â”œâ”€â”€ __init__.py
â”‚       â”œâ”€â”€ main.py               # FastAPI app, lifespan, middleware, router mounts
â”‚       â”œâ”€â”€ celery_app.py         # Celery config (Redis broker)
â”‚       â”œâ”€â”€ core/
â”‚       â”‚   â”œâ”€â”€ config.py         # Pydantic Settings (from .env)
â”‚       â”‚   â”œâ”€â”€ database.py       # AsyncSession + engine (PostgreSQL)
â”‚       â”‚   â”œâ”€â”€ redis.py          # aioredis connection
â”‚       â”‚   â”œâ”€â”€ security.py       # JWT create/decode, bcrypt hash/verify
â”‚       â”‚   â”œâ”€â”€ deps.py           # get_current_user, require_role dependencies
â”‚       â”‚   â””â”€â”€ mqtt.py           # MQTT client service
â”‚       â”œâ”€â”€ models/
â”‚       â”‚   â”œâ”€â”€ __init__.py       # Registers all models for Alembic
â”‚       â”‚   â”œâ”€â”€ user.py           # User + UserRole enum
â”‚       â”‚   â”œâ”€â”€ robot.py          # Robot + RobotStatus enum
â”‚       â”‚   â”œâ”€â”€ delivery.py       # Delivery + DeliveryStatus enum + CampusBlock enum
â”‚       â”‚   â””â”€â”€ supporting.py     # Telemetry, RobotHealth, OTPLog, Notification, DeliveryHistory, AuditLog
â”‚       â”œâ”€â”€ schemas/
â”‚       â”‚   â”œâ”€â”€ __init__.py
â”‚       â”‚   â””â”€â”€ schemas.py        # All Pydantic request/response models
â”‚       â”œâ”€â”€ routers/
â”‚       â”‚   â”œâ”€â”€ __init__.py
â”‚       â”‚   â”œâ”€â”€ auth.py           # POST /register, /login, /refresh, GET /me, POST /logout
â”‚       â”‚   â”œâ”€â”€ robots.py         # GET /robots, GET /robots/{id}, PUT /robots/{id}/status, GET /health, GET /telemetry
â”‚       â”‚   â”œâ”€â”€ deliveries.py     # CRUD + /start, /complete
â”‚       â”‚   â”œâ”€â”€ otp.py            # POST /generate, /verify
â”‚       â”‚   â”œâ”€â”€ analytics.py      # GET /overview, /deliveries, /robots, /heatmap
â”‚       â”‚   â””â”€â”€ tracking.py       # WebSocket /ws/tracking/{delivery_id}, /ws/notifications/{user_id}
â”‚       â”œâ”€â”€ services/
â”‚       â”‚   â””â”€â”€ (future services)
â”‚       â””â”€â”€ tasks/
â”‚           â””â”€â”€ tasks.py          # Celery tasks (push notification, OTP expiry, telemetry aggregation)
â”‚
â””â”€â”€ frontend/
    â”œâ”€â”€ Dockerfile
    â”œâ”€â”€ package.json              # Next 15, React 19, recharts, zustand, lucide, sonner, mapbox-gl, framer-motion
    â”œâ”€â”€ tsconfig.json             # @/* â†’ ./src/*
    â”œâ”€â”€ next.config.ts            # Rewrites: /api â†’ backend:8000, /ws â†’ backend:8000
    â”œâ”€â”€ tailwind.config.js        # Custom theme (brand, surface, status colors)
    â”œâ”€â”€ postcss.config.js
    â””â”€â”€ src/
        â”œâ”€â”€ store/
        â”‚   â””â”€â”€ authStore.ts      # Zustand: user, token, login(), register(), logout(), initialize()
        â””â”€â”€ app/
            â”œâ”€â”€ globals.css       # @tailwind directives, glassmorphism, scrollbar, ring-indicator animation
            â”œâ”€â”€ layout.tsx        # Root layout with Inter font, <Providers>
            â”œâ”€â”€ providers.tsx     # QueryClientProvider + Sonner Toaster
            â”œâ”€â”€ page.tsx          # Landing/marketing page (animated hero)
            â”œâ”€â”€ login/
            â”‚   â””â”€â”€ page.tsx      # Zod + React Hook Form login
            â”œâ”€â”€ register/
            â”‚   â””â”€â”€ page.tsx      # Zod + React Hook Form register
            â””â”€â”€ dashboard/
                â”œâ”€â”€ layout.tsx    # Sidebar + Header + Auth guard + Mobile drawer
                â”œâ”€â”€ page.tsx      # Overview metrics dashboard
                â”œâ”€â”€ robots/
                â”‚   â”œâ”€â”€ page.tsx  # Fleet grid (battery bars, status badges)
                â”‚   â””â”€â”€ [id]/
                â”‚       â””â”€â”€ page.tsx  # Diagnostics: specs, sensor array, telemetry logs, control panel override
                â”œâ”€â”€ delivery/
                â”‚   â”œâ”€â”€ new/
                â”‚   â”‚   â””â”€â”€ page.tsx  # New delivery form (robot + block select)
                â”‚   â””â”€â”€ [id]/
                â”‚       â””â”€â”€ page.tsx  # Live Tracking: SVG campus map, OTP flow, WebSocket telemetry
                â”œâ”€â”€ analytics/
                â”‚   â””â”€â”€ page.tsx  # AreaChart trends, PieChart heatmap, BarChart fleet, metrics cards
                â”œâ”€â”€ notifications/
                â”‚   â””â”€â”€ page.tsx  # Real-time WS alerts, localStorage persistence, Sonner toasts
                â””â”€â”€ settings/
                    â””â”€â”€ page.tsx  # Profile, preference toggles, developer JWT tools
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
| POST | `/verify` | Verify OTP â†’ unlock compartment |

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
- **Sizes:** `display-lg` (3.5rem) â†’ `display` (2.5rem) â†’ `heading` (1.75rem) â†’ `title` (1.25rem) â†’ `body` (0.9375rem) â†’ `caption` (0.8125rem) â†’ `micro` (0.6875rem)

### UI Patterns
- **Glassmorphism:** `glassmorphism` utility class â†’ `bg-surface-2/60 backdrop-blur-md border border-surface-4/40`
- **Shadows:** `shadow-glow-lime` â†’ `0 0 20px rgba(198,255,0,0.3)`
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
| `postgres` | postgres:16-alpine | 5432 | DB: `dsr_delivery_bot`, User: `dsr_delivery_bot_user` |
| `redis` | redis:7-alpine | 6379 | Celery broker + caching |
| `mqtt` | eclipse-mosquitto:2 | 1883, 9001 | Robot telemetry MQTT broker |
| `backend` | Custom (Dockerfile) | 8000 | Uvicorn with `--reload` |
| `celery` | Same as backend | â€” | 4 workers |
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

- [x] Create `/docs/SETUP.md` â€” Local development setup guide
- [x] Create `/docs/DEPLOYMENT.md` â€” Docker + production deployment guide
- [x] Create `/docs/API.md` â€” Full API reference documentation
- [x] Run `npm install` + `npm run build` for frontend type verification
- [x] Update `task.md` artifact with final completion status
- [x] Create `walkthrough.md` artifact summarizing all changes

---

## 10. Bug Fixes & Known Issues

| Issue | Status | Notes |
|---|---|---|
| `next` command not found | ðŸ”§ FIX: Run `npm install` first | node_modules not committed; needs install on fresh clone |
| eslint-visitor-keys engine warning | âš ï¸ WARN | Non-blocking; requires Node â‰¥20.19 for full compat |
| `@types/mapbox-gl` deprecated | âš ï¸ WARN | mapbox-gl ships own types now; can remove from devDeps |

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
APP_NAME=DSR Delivery Bot
APP_VERSION=1.0.0
APP_ENV=development
SECRET_KEY=<jwt-secret>
POSTGRES_HOST=postgres (docker) / localhost (local)
POSTGRES_PORT=5432
POSTGRES_DB=dsr_delivery_bot
POSTGRES_USER=dsr_delivery_bot_user
POSTGRES_PASSWORD=dsr_delivery_bot_dev_pass
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
