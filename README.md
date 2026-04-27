# MUA Vault

MUA Vault is a FastAPI + SQLite makeup operations platform with a styled React frontend (served as static files from the backend).

It supports:
- Dashboard metrics and statuses
- Client and appointment workflows
- Looks management (including Runway and FX views)
- Section-based uploads with image previews
- Multi-photo libraries by section
- Foundation choices view with API-backed cards
- Operator login display and activity history

## Tech Stack

- Backend: FastAPI, SQLite
- Frontend: React (single-file app served via /studio)
- Uploads: Local file storage under backend/data/uploads with linked metadata in SQLite

## Project Structure

- backend: API server, controllers, routes, DB scripts, and data files
- frontend: static UI files served by FastAPI at /studio
- SCHEMA: database schema file
- SEED.sql: seed data

## Quick Start

### 1. Setup Python environment

From the repository root:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Initialize database

```bash
PYTHONPATH=. python scripts/init_db.py
PYTHONPATH=. python scripts/seed_db.py
```

### 3. Run server

```bash
PYTHONPATH=. uvicorn src.server:app --reload --port 4000
```

### 4. Open the app

- Frontend: http://127.0.0.1:4000/studio/
- API root prefix: http://127.0.0.1:4000/api

## Authentication

Login endpoint:
- POST /api/users/login

The frontend now:
- Persists current operator in local storage
- Shows operator identity and activity count in the top bar after login
- Includes a Log Out button

If you seeded demo data, supported demo passwords include:
- admin123 (admin placeholder)
- artist123 (artist placeholders)

## Uploads and Photo Libraries

Main upload endpoints:
- POST /api/uploads
- POST /api/uploads/linked-image
- GET /api/uploads

Behavior:
- You can upload multiple photos per section/entity over time
- Uploaded photos are displayed in section libraries (not only status text)
- Click any thumbnail to open image preview

Sections with library display include:
- Productions (Film)
- Appointments
- Clients
- FX Makeup
- Call Sheets

## Key API Endpoints

### Health
- GET /api/health

### Dashboard
- GET /api/industry/dashboard
- GET /api/industry/dashboard/statuses

### Users
- POST /api/users/login
- POST /api/users
- GET /api/users

### Core Entities
- GET/POST /api/clients
- GET/POST /api/appointments
- GET/POST /api/makeup-looks
- GET/POST /api/productions
- GET/POST /api/effects-makeup
- GET/POST /api/call-sheets
- GET/POST /api/products

### Foundation + External Feed
- GET /api/foundation-shades
- GET /api/products/external/lipsticks

### Static Uploaded Files
- GET /data/uploads/<filename>

## Frontend Routes (Hash-Based)

Examples:
- /studio/#/dashboard
- /studio/#/clients
- /studio/#/appointments
- /studio/#/uploads
- /studio/#/foundations
- /studio/#/looks/runway
- /studio/#/looks/fx

## Troubleshooting

### Images not showing
- Hard refresh browser (Cmd+Shift+R)
- Verify URL returns 200 under /data/uploads/<filename>
- Confirm file exists in backend/data/uploads

### Login not working
- Ensure backend is running on port 4000
- Verify account exists in users table
- Check demo password mapping if using placeholder seeded hashes

### Changes not reflected
- Restart backend server
- Clear browser cache and reload /studio

## Backend-Only Docs

For backend-specific details, see:
- backend/README.md
