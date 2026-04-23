from typing import Literal

from fastapi import APIRouter, Body, Query

from src.config.db import get_db
from src.utils.http_error import HttpError


router = APIRouter()


@router.get("/")
def list_looks_morgue(
    category: str | None = None,
    skinTone: str | None = None,
    difficulty: str | None = None,
    limit: int = Query(default=40, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    db = get_db()

    conditions = []
    params = []

    if category and category != "all":
        conditions.append("lm.category = ?")
        params.append(category)

    if difficulty and difficulty != "all":
        conditions.append("lm.difficulty = ?")
        params.append(difficulty)

    if skinTone and skinTone != "all":
        conditions.append(
            "EXISTS (SELECT 1 FROM json_each(lm.skin_tone_tags) jt WHERE LOWER(CAST(jt.value AS TEXT)) = LOWER(?))"
        )
        params.append(skinTone)

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    sql = f"""
      SELECT
        lm.id,
        lm.look_name,
        lm.category,
        lm.difficulty,
        lm.skin_tone_tags,
        lm.occasion_tags,
        lm.image_url,
        lm.gallery_urls,
        lm.products_used,
        lm.color_palette,
        lm.created_by,
        lm.created_at
      FROM looks_morgue lm
      {where_clause}
      ORDER BY lm.created_at DESC, lm.id DESC
      LIMIT ? OFFSET ?
    """

    rows = db.execute(sql, tuple(params + [limit, offset])).fetchall()

    return {
        "data": rows,
        "meta": {
            "filters": {
                "category": category or "all",
                "skinTone": skinTone or "all",
                "difficulty": difficulty or "all",
            },
            "limit": limit,
            "offset": offset,
        },
    }


@router.get("/{look_id}")
def get_look_by_id(look_id: int):
    if look_id <= 0:
        raise HttpError(400, "Invalid look id")

    db = get_db()
    row = db.execute(
        """
        SELECT
          id,
          look_name,
          category,
          difficulty,
          skin_tone_tags,
          occasion_tags,
          image_url,
          gallery_urls,
          products_used,
          color_palette,
          created_by,
          created_at
        FROM looks_morgue
        WHERE id = ?
        """,
        (look_id,),
    ).fetchone()

    if row is None:
        raise HttpError(404, "Look not found")

    return {"data": row}


@router.post("/{look_id}/assign", status_code=201)
def assign_look_to_client(
    look_id: int,
    body: dict = Body(...),
):
    if look_id <= 0:
        raise HttpError(400, "Invalid look id")

    client_id = body.get("clientId")
    assigned_by = body.get("assignedBy")
    notes = body.get("notes")

    if not isinstance(client_id, int) or client_id <= 0:
        raise HttpError(400, "Invalid assignment payload", {"clientId": ["Must be a positive integer"]})
    if assigned_by is not None and (not isinstance(assigned_by, int) or assigned_by <= 0):
        raise HttpError(400, "Invalid assignment payload", {"assignedBy": ["Must be a positive integer"]})
    if notes is not None and (not isinstance(notes, str) or len(notes) > 500):
        raise HttpError(400, "Invalid assignment payload", {"notes": ["Must be a string up to 500 chars"]})

    db = get_db()

    look_exists = db.execute("SELECT id FROM looks_morgue WHERE id = ?", (look_id,)).fetchone()
    if look_exists is None:
        raise HttpError(404, "Look not found")

    client_exists = db.execute("SELECT id FROM clients WHERE id = ?", (client_id,)).fetchone()
    if client_exists is None:
        raise HttpError(404, "Client not found")

    cur = db.execute(
        """
        INSERT INTO look_morgue_assignments (look_morgue_id, client_id, assigned_by, notes)
        VALUES (?, ?, ?, ?)
        """,
        (look_id, client_id, assigned_by, notes),
    )
    db.commit()

    created = db.execute(
        """
        SELECT id, look_morgue_id, client_id, assigned_by, notes, assigned_at
        FROM look_morgue_assignments
        WHERE id = ?
        """,
        (cur.lastrowid,),
    ).fetchone()

    return {"data": created}
