from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from src.config.db import get_db


router = APIRouter()


class CreateEffectsMakeupRequest(BaseModel):
    character_id: int
    effect_type: str
    materials_used: Optional[str] = None
    application_time_minutes: Optional[int] = None
    removal_notes: Optional[str] = None


@router.get("/")
def list_effects_makeup(limit: int = Query(default=50, ge=1, le=500), offset: int = Query(default=0, ge=0)):
    db = get_db()
    rows = db.execute(
        """
        SELECT
          em.id,
          em.character_id,
          cm.character_name,
          em.effect_type,
          em.materials_used,
          em.application_time_minutes,
          em.removal_notes,
          em.created_at
        FROM effects_makeup em
        JOIN character_makeup cm ON cm.id = em.character_id
        ORDER BY em.created_at DESC, em.id DESC
        LIMIT ? OFFSET ?
        """,
        (limit, offset),
    ).fetchall()

    return {"data": rows, "meta": {"limit": limit, "offset": offset}}


@router.get("/character-options")
def list_character_options():
    db = get_db()
    rows = db.execute(
        """
        SELECT id, character_name, production_id
        FROM character_makeup
        ORDER BY character_name ASC
        """
    ).fetchall()
    return {"data": rows}


@router.post("/", status_code=201)
def create_effects_makeup(req: CreateEffectsMakeupRequest):
    valid_types = ("Bruise", "Cut", "Burn", "Zombie", "Old Age", "Fantasy", "Prosthetic")
    if req.effect_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid effect_type. Must be one of: {', '.join(valid_types)}",
        )

    db = get_db()
    character = db.execute("SELECT id FROM character_makeup WHERE id = ?", (req.character_id,)).fetchone()
    if not character:
        raise HTTPException(status_code=404, detail=f"character_id {req.character_id} not found")

    try:
        cur = db.execute(
            """
            INSERT INTO effects_makeup
            (character_id, effect_type, materials_used, application_time_minutes, removal_notes)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                req.character_id,
                req.effect_type,
                req.materials_used,
                req.application_time_minutes,
                req.removal_notes,
            ),
        )
        db.commit()

        row = db.execute(
            """
            SELECT
              em.id,
              em.character_id,
              cm.character_name,
              em.effect_type,
              em.materials_used,
              em.application_time_minutes,
              em.removal_notes,
              em.created_at
            FROM effects_makeup em
            JOIN character_makeup cm ON cm.id = em.character_id
            WHERE em.id = ?
            """,
            (cur.lastrowid,),
        ).fetchone()
        return {"data": row}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create effects makeup row: {exc}")
