from datetime import datetime
from pathlib import Path as PathlibPath
from typing import Optional

from fastapi import APIRouter, File, HTTPException, Path, Query, UploadFile
from pydantic import BaseModel

from src.config.db import get_db


router = APIRouter()


class CreateMakeupLookRequest(BaseModel):
    look_name: str
    category: Optional[str] = None
    description: Optional[str] = None
    skin_tone_match: Optional[str] = None
    difficulty_level: Optional[str] = None
    image_url: Optional[str] = None
    created_by: Optional[int] = None


@router.get("/")
def list_makeup_looks(limit: int = Query(default=25, ge=1, le=200), offset: int = Query(default=0, ge=0)):
    db = get_db()
    rows = db.execute(
        """
        SELECT id, look_name, category, description, skin_tone_match,
               difficulty_level, image_url, created_by, created_at
        FROM makeup_looks
        ORDER BY created_at DESC, id DESC
        LIMIT ? OFFSET ?
        """,
        (limit, offset),
    ).fetchall()

    return {"data": rows, "meta": {"limit": limit, "offset": offset}}


@router.get("/{look_id}")
def get_makeup_look(look_id: int = Path(..., gt=0)):
    db = get_db()
    row = db.execute(
        """
        SELECT id, look_name, category, description, skin_tone_match,
               difficulty_level, image_url, created_by, created_at
        FROM makeup_looks
        WHERE id = ?
        """,
        (look_id,),
    ).fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail=f"Makeup look {look_id} not found")

    return {"data": row}


@router.post("/", status_code=201)
def create_makeup_look(req: CreateMakeupLookRequest):
    db = get_db()

    if not req.look_name or not req.look_name.strip():
        raise HTTPException(status_code=400, detail="look_name is required")

    valid_difficulty = ("Beginner", "Intermediate", "Advanced")
    if req.difficulty_level and req.difficulty_level not in valid_difficulty:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid difficulty_level. Must be one of: {', '.join(valid_difficulty)}",
        )

    if req.created_by is not None:
        user = db.execute("SELECT id FROM users WHERE id = ?", (req.created_by,)).fetchone()
        if user is None:
            raise HTTPException(status_code=404, detail=f"User {req.created_by} not found")

    try:
        cur = db.execute(
            """
            INSERT INTO makeup_looks
            (look_name, category, description, skin_tone_match, difficulty_level, image_url, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                req.look_name,
                req.category,
                req.description,
                req.skin_tone_match,
                req.difficulty_level,
                req.image_url,
                req.created_by,
            ),
        )
        db.commit()

        created = db.execute(
            """
            SELECT id, look_name, category, description, skin_tone_match,
                   difficulty_level, image_url, created_by, created_at
            FROM makeup_looks
            WHERE id = ?
            """,
            (cur.lastrowid,),
        ).fetchone()

        return {"data": created}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create makeup look: {exc}")


@router.post("/{look_id}/image", status_code=201)
async def upload_makeup_look_image(look_id: int = Path(..., gt=0), file: UploadFile = File(...)):
    db = get_db()

    look = db.execute("SELECT id FROM makeup_looks WHERE id = ?", (look_id,)).fetchone()
    if look is None:
        raise HTTPException(status_code=404, detail=f"Makeup look {look_id} not found")

    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    uploads_dir = PathlibPath("backend/data/uploads")
    uploads_dir.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_filename = f"look_{look_id}_{timestamp}_{file.filename}"
    file_path = uploads_dir / safe_filename

    try:
        content = await file.read()
        with open(file_path, "wb") as out:
            out.write(content)

        storage_url = f"/data/uploads/{safe_filename}"

        db.execute(
            """
            INSERT INTO uploads (mime_type, storage_url, original_filename)
            VALUES (?, ?, ?)
            """,
            (file.content_type or "application/octet-stream", storage_url, file.filename),
        )

        db.execute(
            "UPDATE makeup_looks SET image_url = ? WHERE id = ?",
            (storage_url, look_id),
        )
        db.commit()

        row = db.execute(
            """
            SELECT id, look_name, category, description, skin_tone_match,
                   difficulty_level, image_url, created_by, created_at
            FROM makeup_looks
            WHERE id = ?
            """,
            (look_id,),
        ).fetchone()

        return {"data": row}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to upload image: {exc}")
