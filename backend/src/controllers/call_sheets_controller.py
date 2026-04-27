from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from src.config.db import get_db


router = APIRouter()


class CreateCallSheetRequest(BaseModel):
    shoot_day_id: int
    call_sheet_file: Optional[str] = None
    crew_call_time: Optional[str] = None
    talent_call_time: Optional[str] = None
    notes: Optional[str] = None


@router.get("/")
def list_call_sheets(limit: int = Query(default=50, ge=1, le=500), offset: int = Query(default=0, ge=0)):
    db = get_db()
    rows = db.execute(
        """
        SELECT
          cs.id,
          cs.shoot_day_id,
          sd.shoot_date,
          p.production_name,
          cs.call_sheet_file,
          cs.crew_call_time,
          cs.talent_call_time,
          cs.notes,
          cs.created_at
        FROM call_sheets cs
        JOIN shoot_days sd ON sd.id = cs.shoot_day_id
        JOIN productions p ON p.id = sd.production_id
        ORDER BY sd.shoot_date DESC, cs.id DESC
        LIMIT ? OFFSET ?
        """,
        (limit, offset),
    ).fetchall()

    return {"data": rows, "meta": {"limit": limit, "offset": offset}}


@router.get("/shoot-day-options")
def list_shoot_day_options():
        db = get_db()
        rows = db.execute(
                """
                SELECT
                    sd.id,
                    sd.shoot_date,
                    p.production_name
                FROM shoot_days sd
                JOIN productions p ON p.id = sd.production_id
                ORDER BY sd.shoot_date DESC, sd.id DESC
                """
        ).fetchall()
        return {"data": rows}


@router.post("/", status_code=201)
def create_call_sheet(req: CreateCallSheetRequest):
    db = get_db()
    shoot_day = db.execute("SELECT id FROM shoot_days WHERE id = ?", (req.shoot_day_id,)).fetchone()
    if not shoot_day:
        raise HTTPException(status_code=404, detail=f"shoot_day_id {req.shoot_day_id} not found")

    existing = db.execute("SELECT id FROM call_sheets WHERE shoot_day_id = ?", (req.shoot_day_id,)).fetchone()
    if existing:
        raise HTTPException(status_code=400, detail="A call sheet already exists for this shoot_day_id")

    try:
        cur = db.execute(
            """
            INSERT INTO call_sheets
            (shoot_day_id, call_sheet_file, crew_call_time, talent_call_time, notes)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                req.shoot_day_id,
                req.call_sheet_file,
                req.crew_call_time,
                req.talent_call_time,
                req.notes,
            ),
        )
        db.commit()

        row = db.execute(
            """
            SELECT
              cs.id,
              cs.shoot_day_id,
              sd.shoot_date,
              p.production_name,
              cs.call_sheet_file,
              cs.crew_call_time,
              cs.talent_call_time,
              cs.notes,
              cs.created_at
            FROM call_sheets cs
            JOIN shoot_days sd ON sd.id = cs.shoot_day_id
            JOIN productions p ON p.id = sd.production_id
            WHERE cs.id = ?
            """,
            (cur.lastrowid,),
        ).fetchone()
        return {"data": row}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create call sheet: {exc}")
