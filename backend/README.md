# MUA Vault Backend

FastAPI + SQLite backend for the MUA Vault app.

## 1) Setup

1. Create and activate a virtual environment (recommended):
   - `python3 -m venv .venv`
   - `source .venv/bin/activate`
2. Copy environment file:
   - `cp .env.example .env`
3. Install dependencies:
   - `pip install -r requirements.txt`
4. Initialize database schema:
   - `PYTHONPATH=. python scripts/init_db.py`
5. Seed mock data:
   - `PYTHONPATH=. python scripts/seed_db.py`
6. Start API:
   - `PYTHONPATH=. uvicorn src.server:app --reload --port 4000`

## 2) API Base

- `http://localhost:4000/api`

## 3) Endpoints

- `GET /api/health`
- `GET /api/clients`
- `GET /api/appointments`
- `GET /api/industry/dashboard`
- `GET /api/industry/productions/{productionId}/uploads`
- `GET /api/uploads`
- `GET /api/looks-morgue?category=all&skinTone=all&difficulty=all&limit=40&offset=0`
- `GET /api/looks-morgue/{id}`
- `POST /api/looks-morgue/{id}/assign`

## 4) Structure

- `src/config`: env + db config
- `src/controllers`: route handlers
- `src/routes`: endpoint definitions
- `src/middleware`: error handlers
- `src/utils`: shared helper utilities
- `scripts`: DB init/seed scripts

## 5) Notes

- Database scripts point to top-level schema files by default:
  - `../SCHEMA`
  - `../SEED.sql`
- Update `.env` if paths change.
