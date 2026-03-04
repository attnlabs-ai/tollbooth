# Tollbooth MVP

Tollbooth is a Chrome extension + backend + dashboard MVP that adds real-time financial friction at checkout for user-selected categories.

## Repo Structure
- `extension/` Chrome extension (MV3)
- `backend/` Node.js + Express API
- `dashboard/` React + Vite dashboard

## Quick Start

### 1) Backend + Postgres (Docker)
```bash
docker compose up --build
```

Initialize DB schema:
```bash
psql postgres://postgres:postgres@localhost:5432/tollbooth -f backend/db/schema.sql
```

Backend runs on `http://localhost:4000`.

### 2) Dashboard
```bash
cd dashboard
npm install
npm run dev
```
Dashboard runs on `http://localhost:5173`.

### 3) Chrome Extension
1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `extension/` directory

The popup provides a quick enable toggle and a link to the dashboard.

## API Overview
- `POST /api/auth/register` { email, password }
- `POST /api/auth/login` { email, password }
- `GET /api/settings` (JWT)
- `PUT /api/settings` (JWT) { settings }
- `POST /api/events` (JWT) { timestamp, category, domain, mode, action, frictionPercent, amount }
- `GET /api/events/dashboard` (JWT)

## Extension Notes
- Offline-first with `chrome.storage.local`
- Intercepts checkout clicks and form submissions
- Modal overlay injected into the page DOM
- Cool-down option persists per category + domain

## Env Vars
Copy `backend/.env.example` to `backend/.env` and adjust as needed.
