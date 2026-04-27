from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from src.config.db import get_db


router = APIRouter()


class CreateProductionRequest(BaseModel):
    production_name: str
    production_type: str
    director_name: Optional[str] = None
    producer_name: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None


@router.get("/")
def list_productions(limit: int = Query(default=50, ge=1, le=500), offset: int = Query(default=0, ge=0)):
    db = get_db()
    rows = db.execute(
        """
        SELECT
          id,
          production_name,
          production_type,
          director_name,
          producer_name,
          start_date,
          end_date,
          location,
          notes,
          created_at
        FROM productions
        ORDER BY created_at DESC, id DESC
        LIMIT ? OFFSET ?
        """,
        (limit, offset),
    ).fetchall()

    return {"data": rows, "meta": {"limit": limit, "offset": offset}}


@router.post("/", status_code=201)
def create_production(req: CreateProductionRequest):
    if not req.production_name or not req.production_name.strip():
        raise HTTPException(status_code=400, detail="production_name is required")
    if not req.production_type or not req.production_type.strip():
        raise HTTPException(status_code=400, detail="production_type is required")

    valid_types = (
        "Film",
        "TV Show",
        "Commercial",
        "Photoshoot",
        "Theater",
        "Music Video",
        "Editorial",
    )
    if req.production_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid production_type. Must be one of: {', '.join(valid_types)}",
        )

    db = get_db()
    try:
        cur = db.execute(
            """
            INSERT INTO productions
            (production_name, production_type, director_name, producer_name, start_date, end_date, location, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                req.production_name,
                req.production_type,
                req.director_name,
                req.producer_name,
                req.start_date,
                req.end_date,
                req.location,
                req.notes,
            ),
        )
        db.commit()

        row = db.execute(
            """
            SELECT
              id,
              production_name,
              production_type,
              director_name,
              producer_name,
              start_date,
              end_date,
              location,
              notes,
              created_at
            FROM productions
            WHERE id = ?
            """,
            (cur.lastrowid,),
        ).fetchone()
        return {"data": row}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create production: {exc}")
