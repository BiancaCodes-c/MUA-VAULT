from fastapi import APIRouter, Query, UploadFile, File, Form, HTTPException
from pathlib import Path
from datetime import datetime

from src.config.db import get_db


router = APIRouter()

BASE_DIR = Path(__file__).resolve().parents[2]
UPLOADS_DIR = BASE_DIR / "data" / "uploads"
ALLOWED_ENTITY_TYPES = {
    "clients",
    "products",
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


def ensure_upload_links_schema(db):
    """Ensure upload_links entity_type CHECK includes 'products'."""
    row = db.execute(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name='upload_links'"
    ).fetchone()
    schema_sql = (row.get("sql") if isinstance(row, dict) else row[0]) if row else ""
    if schema_sql and "'products'" in schema_sql:
        return

    try:
        db.execute("PRAGMA foreign_keys = OFF")
        db.execute("BEGIN")
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS upload_links_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                upload_id INTEGER NOT NULL,
                entity_type TEXT NOT NULL CHECK (
                    entity_type IN (
                        'clients',
                        'products',
                        'appointments',
                        'before_after_photos',
                        'productions',
                        'shoot_days',
                        'call_sheets',
                        'script_sides',
                        'character_makeup',
                        'effects_makeup',
                        'lighting_conditions',
                        'continuity_photos'
                    )
                ),
                entity_id INTEGER NOT NULL,
                field_name TEXT NOT NULL,
                is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
                notes TEXT,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (upload_id) REFERENCES uploads (id) ON DELETE CASCADE,
                UNIQUE (upload_id, entity_type, entity_id, field_name)
            )
            """
        )
        db.execute(
            """
            INSERT INTO upload_links_new
            (id, upload_id, entity_type, entity_id, field_name, is_primary, notes, created_at)
            SELECT id, upload_id, entity_type, entity_id, field_name, is_primary, notes, created_at
            FROM upload_links
            """
        )
        db.execute("DROP TABLE upload_links")
        db.execute("ALTER TABLE upload_links_new RENAME TO upload_links")
        db.execute("CREATE INDEX IF NOT EXISTS idx_upload_links_entity ON upload_links (entity_type, entity_id)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_upload_links_upload_id ON upload_links (upload_id)")
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.execute("PRAGMA foreign_keys = ON")


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
    ensure_upload_links_schema(db)

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


@router.get("/{entity_type}/{entity_id}/images")
def get_entity_images(entity_type: str, entity_id: int):
    """Get all images linked to a specific entity."""
    db = get_db()

    if entity_type not in ALLOWED_ENTITY_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid entity_type: {entity_type}")

    rows = db.execute(
        """
        SELECT 
            ul.id,
            u.storage_url,
            u.original_filename,
            u.mime_type,
            ul.field_name,
            ul.is_primary,
            ul.notes,
            ul.created_at
        FROM upload_links ul
        JOIN uploads u ON u.id = ul.upload_id
        WHERE ul.entity_type = ? AND ul.entity_id = ?
        ORDER BY ul.is_primary DESC, ul.created_at DESC
        """,
        (entity_type, entity_id),
    ).fetchall()

    return {"data": rows, "entity_type": entity_type, "entity_id": entity_id, "count": len(rows)}


@router.post("/linked-images")
async def upload_multiple_linked_images(
    files: list[UploadFile] = File(...),
    entityType: str = Form(...),
    entityId: int = Form(..., ge=1),
    fieldName: str = Form(default="gallery"),
    notes: str | None = Form(default=None),
):
    """Upload multiple images linked to the same entity."""
    db = get_db()
    ensure_upload_links_schema(db)

    if entityType not in ALLOWED_ENTITY_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid entityType: {entityType}")
    if not fieldName or not fieldName.strip():
        raise HTTPException(status_code=400, detail="fieldName is required")
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="No files uploaded")

    results = []
    try:
        for idx, file in enumerate(files):
            upload_id, storage_url, original_filename, size_bytes = await _store_upload(db, file)
            
            is_primary = 1 if idx == 0 else 0
            
            db.execute(
                """
                INSERT INTO upload_links (upload_id, entity_type, entity_id, field_name, is_primary, notes)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (upload_id, entityType, entityId, fieldName, is_primary, notes),
            )
            
            results.append({
                "upload_id": upload_id,
                "storage_url": storage_url,
                "original_filename": original_filename,
                "is_primary": is_primary,
            })
        
        db.commit()
        return {
            "data": results,
            "count": len(results),
            "entity_type": entityType,
            "entity_id": entityId,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to upload images: {str(e)}")


@router.delete("/{upload_link_id}")
def delete_linked_image(upload_link_id: int):
    """Delete a linked image."""
    db = get_db()

    link = db.execute(
        "SELECT upload_id FROM upload_links WHERE id = ?",
        (upload_link_id,),
    ).fetchone()

    if not link:
        raise HTTPException(status_code=404, detail=f"Upload link {upload_link_id} not found")

    upload_id = link["upload_id"]
    
    db.execute("DELETE FROM upload_links WHERE id = ?", (upload_link_id,))
    
    # Check if upload is still referenced by other links
    remaining = db.execute(
        "SELECT COUNT(*) as count FROM upload_links WHERE upload_id = ?",
        (upload_id,),
    ).fetchone()
    
    if remaining["count"] == 0:
        db.execute("DELETE FROM uploads WHERE id = ?", (upload_id,))
    
    db.commit()
    return {"message": "Image deleted successfully"}

