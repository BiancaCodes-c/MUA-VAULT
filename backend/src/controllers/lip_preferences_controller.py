from typing import Optional

from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel

from src.config.db import get_db


router = APIRouter()


class UpsertLipPreferenceRequest(BaseModel):
    client_id: int
    lipstick_finish: Optional[str] = None
    lipgloss_preference: Optional[int] = None
    notes: Optional[str] = None


@router.get("/client/{client_id}")
def get_lip_preference(client_id: int = Path(..., gt=0)):
    db = get_db()

    client = db.execute("SELECT id FROM clients WHERE id = ?", (client_id,)).fetchone()
    if client is None:
        raise HTTPException(status_code=404, detail=f"Client {client_id} not found")

    row = db.execute(
        """
        SELECT id, client_id, lipstick_finish, lipgloss_preference, notes
        FROM lip_preferences
        WHERE client_id = ?
        """,
        (client_id,),
    ).fetchone()

    return {"data": row}


@router.post("/")
def upsert_lip_preference(req: UpsertLipPreferenceRequest):
    db = get_db()

    client = db.execute("SELECT id FROM clients WHERE id = ?", (req.client_id,)).fetchone()
    if client is None:
        raise HTTPException(status_code=404, detail=f"Client {req.client_id} not found")

    valid_finishes = ("Matte", "Satin", "Glossy", "Liquid")
    if req.lipstick_finish and req.lipstick_finish not in valid_finishes:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid lipstick_finish. Must be one of: {', '.join(valid_finishes)}",
        )

    if req.lipgloss_preference is not None and req.lipgloss_preference not in (0, 1):
        raise HTTPException(status_code=400, detail="lipgloss_preference must be 0 or 1")

    try:
        existing = db.execute("SELECT id FROM lip_preferences WHERE client_id = ?", (req.client_id,)).fetchone()

        if existing:
            db.execute(
                """
                UPDATE lip_preferences
                SET lipstick_finish = ?, lipgloss_preference = ?, notes = ?
                WHERE client_id = ?
                """,
                (
                    req.lipstick_finish,
                    req.lipgloss_preference,
                    req.notes,
                    req.client_id,
                ),
            )
            pref_id = existing[0]
            message = "Lip preference updated successfully"
        else:
            cur = db.execute(
                """
                INSERT INTO lip_preferences (client_id, lipstick_finish, lipgloss_preference, notes)
                VALUES (?, ?, ?, ?)
                """,
                (
                    req.client_id,
                    req.lipstick_finish,
                    req.lipgloss_preference,
                    req.notes,
                ),
            )
            pref_id = cur.lastrowid
            message = "Lip preference created successfully"

        db.commit()

        row = db.execute(
            """
            SELECT id, client_id, lipstick_finish, lipgloss_preference, notes
            FROM lip_preferences
            WHERE id = ?
            """,
            (pref_id,),
        ).fetchone()

        return {"data": row, "message": message}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to save lip preference: {exc}")


@router.delete("/client/{client_id}")
def delete_lip_preference(client_id: int = Path(..., gt=0)):
    db = get_db()

    existing = db.execute("SELECT id FROM lip_preferences WHERE client_id = ?", (client_id,)).fetchone()
    if existing is None:
        raise HTTPException(status_code=404, detail=f"No lip preference found for client {client_id}")

    db.execute("DELETE FROM lip_preferences WHERE client_id = ?", (client_id,))
    db.commit()

    return {"message": "Lip preference deleted successfully", "client_id": client_id}
