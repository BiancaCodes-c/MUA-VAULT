from typing import Optional
from pathlib import Path

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


@router.delete("/{production_id}")
def delete_production(production_id: int):
    db = get_db()

    production = db.execute(
        "SELECT id FROM productions WHERE id = ?",
        (production_id,),
    ).fetchone()
    if production is None:
        raise HTTPException(status_code=404, detail=f"Production {production_id} not found")

    linked_upload_rows = db.execute(
        """
        SELECT ul.upload_id, u.storage_url
        FROM upload_links ul
        JOIN uploads u ON u.id = ul.upload_id
        WHERE ul.entity_type = 'productions' AND ul.entity_id = ?
        """,
        (production_id,),
    ).fetchall()

    upload_ids = []
    storage_urls = []
    for row in linked_upload_rows:
        upload_id = row.get("upload_id") if isinstance(row, dict) else row[0]
        storage_url = row.get("storage_url") if isinstance(row, dict) else row[1]
        if upload_id is not None:
            upload_ids.append(upload_id)
        if storage_url:
            storage_urls.append(storage_url)

    try:
        db.execute(
            "DELETE FROM upload_links WHERE entity_type = 'productions' AND entity_id = ?",
            (production_id,),
        )
        db.execute("DELETE FROM productions WHERE id = ?", (production_id,))

        for upload_id, storage_url in zip(upload_ids, storage_urls):
            remaining = db.execute(
                "SELECT COUNT(*) AS count FROM upload_links WHERE upload_id = ?",
                (upload_id,),
            ).fetchone()
            remaining_count = remaining.get("count") if isinstance(remaining, dict) else remaining[0]
            if remaining_count == 0:
                db.execute("DELETE FROM uploads WHERE id = ?", (upload_id,))
                if storage_url and str(storage_url).startswith("/data/uploads/"):
                    file_path = Path(__file__).resolve().parents[2] / str(storage_url).lstrip("/")
                    if file_path.exists():
                        file_path.unlink()

        db.commit()
        return {"message": f"Production {production_id} deleted successfully"}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to delete production: {exc}")
