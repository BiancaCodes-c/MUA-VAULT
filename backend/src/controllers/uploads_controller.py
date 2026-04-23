from fastapi import APIRouter, Query, UploadFile, File
import os
from pathlib import Path
from datetime import datetime

from src.config.db import get_db


router = APIRouter()


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
    
    # Create uploads directory if it doesn't exist
    upload_dir = Path("backend/data/uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    results = []
    
    try:
        for file in files:
            if not file.filename:
                continue
            
            # Read file content
            content = await file.read()
            
            # Create safe filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_filename = f"{timestamp}_{file.filename}"
            file_path = upload_dir / safe_filename
            
            # Save file to disk
            with open(file_path, "wb") as f:
                f.write(content)
            
            # Insert into database
            storage_url = f"/data/uploads/{safe_filename}"
            db.execute(
                """
                INSERT INTO uploads (mime_type, storage_url, original_filename)
                VALUES (?, ?, ?)
                """,
                (file.content_type or "application/octet-stream", storage_url, file.filename)
            )
            db.commit()
            
            results.append({
                "filename": file.filename,
                "storage_url": storage_url,
                "size": len(content),
            })
    
    except Exception as e:
        db.rollback()
        raise
    
    return {"data": results, "count": len(results)}

