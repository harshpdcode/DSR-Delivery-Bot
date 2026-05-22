# DSR Delivery Bot â€” Local Development Setup Guide

This document outlines the detailed instructions required to set up the **DSR Delivery Bot (Smart Autonomous Campus Delivery Robot Platform)** on a local machine for development and testing.

---

## ðŸ“‹ Prerequisites

Before starting, ensure you have the following software installed:

*   **Node.js** (v20.15.0 or later, preferably Node v20.19.0+ / v22.13.0+)
*   **Python** (v3.10 or v3.11)
*   **Docker & Docker Compose** (for database, broker, and worker services)
*   **Git** (for version control)
*   **MQTT Client** (e.g., [MQTTX](https://mqttx.app/) for manual testing/simulating robot messages)

---

## ðŸ› ï¸ Step 1: Clone the Repository & Configure Environments

1. Clone the project to your local workspace:
   ```bash
   git clone <repository_url> "DSR delivery bot"
   cd "DSR delivery bot"
   ```

2. Copy the environment template to create your active `.env` file:
   ```bash
   copy .env.example .env
   ```

3. Update the variables in `.env` if necessary. The default configuration is tuned for a zero-configuration launch out of the box using Docker containers:
   ```env
   APP_NAME=DSR Delivery Bot
   APP_VERSION=1.0.0
   APP_ENV=development
   SECRET_KEY=dev_secret_key_change_me_in_production_1234567890
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=dsr_delivery_bot
   POSTGRES_USER=dsr_delivery_bot_user
   POSTGRES_PASSWORD=dsr_delivery_bot_dev_pass
   REDIS_HOST=localhost
   REDIS_PORT=6379
   MQTT_BROKER_HOST=localhost
   MQTT_BROKER_PORT=1883
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   REFRESH_TOKEN_EXPIRE_DAYS=7
   CORS_ORIGINS=http://localhost:3000,http://localhost:80
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_WS_URL=ws://localhost:8000
   ```

---

## ðŸ³ Step 2: Spin Up Infrastructure (PostgreSQL, Redis, MQTT)

The backend relies on three primary infrastructure pieces. Run them locally using Docker to avoid complex local database installations:

1. **Start infrastructure services**:
   ```bash
   docker-compose up -d postgres redis mqtt
   ```

2. **Verify services are running**:
   ```bash
   docker-compose ps
   ```
   You should see:
   *   `postgres` listening on port `5432`
   *   `redis` listening on port `6379`
   *   `mqtt` (Eclipse Mosquitto) listening on ports `1883` and `9001`

---

## ðŸ Step 3: Backend Setup (FastAPI)

1. **Navigate to the backend folder**:
   ```bash
   cd backend
   ```

2. **Create a virtual environment**:
   * **Windows (PowerShell)**:
     ```powershell
     python -m venv .venv
     .venv\Scripts\Activate.ps1
     ```
   * **macOS / Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. **Install python packages**:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Initialize and run Database Migrations**:
   The database uses **Alembic** for managing PostgreSQL schemas.
   
   Initialize the database schema:
   ```bash
   # Run the latest migration script to create all tables
   alembic upgrade head
   ```

5. **Start the FastAPI Application Server**:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   
   Once running, you can access:
   *   **FastAPI API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)
   *   **Alternative API Docs**: [http://localhost:8000/redoc](http://localhost:8000/redoc) (ReDoc UI)

6. **Start the Celery Worker** (in a separate terminal inside `.venv`):
   ```bash
   celery -A app.celery_app worker --loglevel=info
   ```

---

## âš›ï¸ Step 4: Frontend Setup (Next.js 15)

1. **Open a new terminal window** and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Launch the Next.js Turbopack development server**:
   ```bash
   npm run dev
   ```

4. **Open the browser** and go to [http://localhost:3000](http://localhost:3000).

---

## ðŸ§ª Step 5: Verification & Seeding Demo Data

Once both the backend and frontend are running, you can verify and populate the system with standard robot and delivery instances for testing.

### Creating an Admin / Operator Account
1. Open the signup page: [http://localhost:3000/register](http://localhost:3000/register).
2. Register a new user. The first user created will default to a standard user, but you can update their role via direct DB query or the settings developer tools if needed.
3. Once registered, log in to access the fleet overview.

### Pre-seeding Robots (Dev Simulation)
When the application starts in development, the database requires registered robots to trigger delivery simulation:
*   Use the FastAPI Swagger docs at [http://localhost:8000/docs#/robots/create_robot_api_v1_robots_post](http://localhost:8000/docs) to register a new robot.
*   Or trigger the automatic developer seed script if available.

### Live Telemetry Simulation (MQTT)
You can mock robot telemetry updates by publishing JSON payloads to the `robot/+/telemetry` MQTT topic:
*   **Topic**: `robot/ROBOT-ID-HERE/telemetry`
*   **Payload**:
    ```json
    {
      "latitude": 23.0768,
      "longitude": 72.5350,
      "speed": 1.2,
      "heading": 90.0,
      "battery_level": 88.5,
      "temperature": 26.4,
      "signal_strength": 92
    }
    ```
*   Publishing this payload triggers real-time updates inside the tracking WebSocket and updates the robot positions on the SVG map.

---

## ðŸ” Troubleshooting

### 1. Database Connection Errors
*   Ensure that the `postgres` container is up and healthy.
*   Verify that your local `.env` variables (`POSTGRES_HOST`, `POSTGRES_PORT`, etc.) match your Docker database settings.

### 2. MQTT Communication Fails
*   Check that Mosquitto is active on port `1883`.
*   Ensure that your backend service successfully connects during boot (check FastAPI logs for `"MQTT connected successfully"`).

### 3. Next.js Hydration Errors
*   Our Next.js 15 codebase includes custom `mounted` wrappers for Recharts and client-only elements to bypass SSR hydration issues. If you notice styling flickering, clear your browser cache and restart the dev server.
