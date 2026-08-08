# DSR Go — Production Deployment Guide

Autonomous Campus Delivery Robot Platform — Silver Oak University

---

## 📋 System Requirements

- **Node.js**: `v18.x` or `v20.x`
- **Python**: `v3.10+` or `v3.12+`
- **Database**: SQLite (default fallback) or PostgreSQL (`postgresql+asyncpg`)
- **Web Server / Reverse Proxy**: Nginx, Caddy, or Cloudflare Tunnel (optional, for SSL/HTTPS)

---

## 🛠️ Step 1: Backend Setup & Production Configuration

1. **Navigate to the Backend Directory**:
   ```bash
   cd backend
   ```

2. **Create Python Virtual Environment**:
   ```bash
   python -m venv .venv
   ```

3. **Activate Environment & Install Dependencies**:
   - **Windows**:
     ```powershell
     .venv\Scripts\activate
     pip install -r requirements.txt
     ```
   - **Linux/macOS**:
     ```bash
     source .venv/bin/activate
     pip install -r requirements.txt
     ```

4. **Environment Variables Configuration**:
   Create a `.env` file inside the `backend/` directory or root directory based on `.env.example`:
   ```env
   APP_ENV=production
   SECRET_KEY=change_this_to_a_secure_64_character_random_hex_string
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   CORS_ORIGINS=["http://localhost:3000","https://yourdomain.com"]
   ```

5. **Initialize Database & Seed Initial Data**:
   ```bash
   python seed.py
   ```

6. **Run Backend Production Server (Uvicorn)**:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

---

## 💻 Step 2: Frontend Setup & Production Build

1. **Navigate to Frontend Directory**:
   ```bash
   cd frontend
   ```

2. **Install Node Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create `.env.production` in `frontend/`:
   ```env
   NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1
   NEXT_PUBLIC_WS_URL=wss://yourdomain.com/ws
   ```

4. **Build Production Assets**:
   ```bash
   npm run build
   ```

5. **Start Production Next.js Server**:
   ```bash
   npm run start -p 3000
   ```

---

## 🚀 Step 3: Combined One-Command Deployment

From the root directory of the project, you can launch both services together:

```bash
npm run dev
```

---

## 🔐 Accounts for Demo / Production Testing

| Role | Email | Default Password |
| :--- | :--- | :--- |
| **Admin** | `test@example.com` | `password123` |
| **User** | `user@example.com` | `password123` |
