from fastapi import APIRouter, Query, UploadFile, File, Form, HTTPException
from pathlib import Path
from datetime import datetime

from src.config.db import get_db


router = APIRouter()

BASE_DIR = Path(__file__).resolve().parents[2]
UPLOADS_DIR = BASE_DIR / "data" / "uploads"
ALLOWED_ENTITY_TYPES = {
    "clients",
    "appointments",
    "before_after_photos",
    "productions",
    "shoot_days",
    "call_sheets",
    "script_sides",
    "character_makeup",
    "effects_makeup",
    "lighting_conditions",
    "continuity_photos",
}


async def _store_upload(db, file: UploadFile):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

    content = await file.read()
    size_bytes = len(content)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_name = Path(file.filename).name
    safe_filename = f"{timestamp}_{safe_name}"
    file_path = UPLOADS_DIR / safe_filename

    with open(file_path, "wb") as out:
        out.write(content)

    storage_url = f"/data/uploads/{safe_filename}"
    cur = db.execute(
        """
        INSERT INTO uploads (mime_type, storage_url, original_filename)
        VALUES (?, ?, ?)
        """,
        (file.content_type or "application/octet-stream", storage_url, safe_name),
    )
    return cur.lastrowid, storage_url, safe_name, size_bytes


@router.get("/")
def list_upload_links(entityType: str | None = None, entityId: int | None = Query(default=None, ge=1)):
    db = get_db()

    sql = """
      SELECT
        upload_link_id,
        upload_id,
        entity_type,
        entity_id,
        field_name,
        original_filename,
        mime_type,
        storage_url,
        production_name,
        shoot_date
      FROM v_uploads_by_production_day
      WHERE 1 = 1
    """

    params = []
    if entityType:
        sql += " AND entity_type = ?"
        params.append(entityType)
    if entityId:
        sql += " AND entity_id = ?"
        params.append(entityId)

    sql += " ORDER BY uploaded_at DESC"

    rows = db.execute(sql, tuple(params)).fetchall()
    return {"data": rows}


@router.post("/")
async def upload_files(files: list[UploadFile] = File(...)):
    """Upload portfolio files and store them locally."""
    db = get_db()

    results = []

    try:
        for file in files:
            upload_id, storage_url, original_filename, size_bytes = await _store_upload(db, file)
            db.commit()
            results.append({
                "upload_id": upload_id,
                "filename": original_filename,
                "storage_url": storage_url,
                "size": size_bytes,
            })
    except Exception as e:
        db.rollback()
        raise

    return {"data": results, "count": len(results)}


@router.post("/linked-image")
async def upload_linked_image(
    file: UploadFile = File(...),
    entityType: str = Form(...),
    entityId: int = Form(..., ge=1),
    fieldName: str = Form(...),
    isPrimary: int = Form(default=1, ge=0, le=1),
    notes: str | None = Form(default=None),
):
    db = get_db()

    if entityType not in ALLOWED_ENTITY_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid entityType: {entityType}")
    if not fieldName or not fieldName.strip():
        raise HTTPException(status_code=400, detail="fieldName is required")

    try:
        upload_id, storage_url, original_filename, _size_bytes = await _store_upload(db, file)

        if entityType == "clients":
            db.execute("UPDATE clients SET photo_url = ? WHERE id = ?", (storage_url, entityId))

        db.execute(
            """
            INSERT INTO upload_links (upload_id, entity_type, entity_id, field_name, is_primary, notes)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (upload_id, entityType, entityId, fieldName, isPrimary, notes),
        )
        db.commit()

        return {
            "data": {
                "upload_id": upload_id,
                "storage_url": storage_url,
                "original_filename": original_filename,
                "entity_type": entityType,
                "entity_id": entityId,
                "field_name": fieldName,
                "is_primary": isPrimary,
            }
        }
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to upload linked image: {exc}")

