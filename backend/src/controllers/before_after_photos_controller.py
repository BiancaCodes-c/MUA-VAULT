from typing import Optional

from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel

from src.config.db import get_db


router = APIRouter()


class CreateBeforeAfterPhotoRequest(BaseModel):
    appointment_id: int
    image_type: str
    image_url: str
    notes: Optional[str] = None


@router.get("/appointment/{appointment_id}")
def list_before_after_photos(appointment_id: int = Path(..., gt=0)):
    db = get_db()

    appointment = db.execute("SELECT id FROM appointments WHERE id = ?", (appointment_id,)).fetchone()
    if appointment is None:
        raise HTTPException(status_code=404, detail=f"Appointment {appointment_id} not found")

    rows = db.execute(
        """
        SELECT id, appointment_id, image_type, image_url, notes
        FROM before_after_photos
        WHERE appointment_id = ?
        ORDER BY id DESC
        """,
        (appointment_id,),
    ).fetchall()

    return {"data": rows, "appointment_id": appointment_id}


@router.post("/", status_code=201)
def create_before_after_photo(req: CreateBeforeAfterPhotoRequest):
    db = get_db()

    appointment = db.execute("SELECT id FROM appointments WHERE id = ?", (req.appointment_id,)).fetchone()
    if appointment is None:
        raise HTTPException(status_code=404, detail=f"Appointment {req.appointment_id} not found")

    valid_types = ("Before", "After")
    if req.image_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid image_type. Must be one of: {', '.join(valid_types)}",
        )

    if not req.image_url or not req.image_url.strip():
        raise HTTPException(status_code=400, detail="image_url is required")

    try:
        cur = db.execute(
            """
            INSERT INTO before_after_photos (appointment_id, image_type, image_url, notes)
            VALUES (?, ?, ?, ?)
            """,
            (req.appointment_id, req.image_type, req.image_url, req.notes),
        )
        db.commit()

        created = db.execute(
            """
            SELECT id, appointment_id, image_type, image_url, notes
            FROM before_after_photos
            WHERE id = ?
            """,
            (cur.lastrowid,),
        ).fetchone()

        return {"data": created}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create before/after photo: {exc}")


@router.delete("/{photo_id}")
def delete_before_after_photo(photo_id: int = Path(..., gt=0)):
    db = get_db()

    existing = db.execute("SELECT id FROM before_after_photos WHERE id = ?", (photo_id,)).fetchone()
    if existing is None:
        raise HTTPException(status_code=404, detail=f"Photo {photo_id} not found")

    db.execute("DELETE FROM before_after_photos WHERE id = ?", (photo_id,))
    db.commit()

    return {"message": "Before/after photo deleted successfully", "id": photo_id}
