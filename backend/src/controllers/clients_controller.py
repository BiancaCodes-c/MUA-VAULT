from fastapi import APIRouter, Query, HTTPException, Path
from pydantic import BaseModel
from typing import Optional

from src.config.db import get_db


router = APIRouter()


class CreateClientRequest(BaseModel):
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    instagram_handle: Optional[str] = None
    skin_tone: Optional[str] = None
    undertone: Optional[str] = None
    skin_type: Optional[str] = None
    allergies: Optional[str] = None
    sensitivity_notes: Optional[str] = None
    preferred_brands: Optional[str] = None
    notes: Optional[str] = None
    photo_url: Optional[str] = None


@router.get("/")
def list_clients(limit: int = Query(default=25, ge=0), offset: int = Query(default=0, ge=0)):
    db = get_db()
    rows = db.execute(
        """
        SELECT id, full_name, email, phone, instagram_handle, skin_tone, undertone, skin_type, 
               allergies, sensitivity_notes, preferred_brands, notes, photo_url, created_at, updated_at
        FROM clients
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
        """,
        (limit, offset),
    ).fetchall()

    return {"data": rows, "meta": {"limit": limit, "offset": offset}}


@router.post("/")
def create_client(req: CreateClientRequest):
    """Create a new client with all profile details."""
    db = get_db()
    
    # Validate full_name
    if not req.full_name or not req.full_name.strip():
        raise HTTPException(status_code=400, detail="full_name is required")
    
    # Validate skin_tone if provided
    valid_skin_tones = ('Fair', 'Light', 'Medium', 'Tan', 'Deep')
    if req.skin_tone and req.skin_tone not in valid_skin_tones:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid skin_tone. Must be one of: {', '.join(valid_skin_tones)}"
        )
    
    # Validate undertone if provided
    valid_undertones = ('Cool', 'Warm', 'Neutral', 'Olive')
    if req.undertone and req.undertone not in valid_undertones:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid undertone. Must be one of: {', '.join(valid_undertones)}"
        )
    
    # Validate skin_type if provided
    valid_skin_types = ('Oily', 'Dry', 'Combination', 'Sensitive', 'Normal')
    if req.skin_type and req.skin_type not in valid_skin_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid skin_type. Must be one of: {', '.join(valid_skin_types)}"
        )
    
    # Check if email already exists (if provided)
    if req.email:
        existing = db.execute("SELECT id FROM clients WHERE email = ?", (req.email,)).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail=f"Email {req.email} already exists")
    
    try:
        cursor = db.execute(
            """
            INSERT INTO clients
            (full_name, phone, email, instagram_handle, skin_tone, undertone, skin_type,
             allergies, sensitivity_notes, preferred_brands, notes, photo_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                req.full_name,
                req.phone,
                req.email,
                req.instagram_handle,
                req.skin_tone,
                req.undertone,
                req.skin_type,
                req.allergies,
                req.sensitivity_notes,
                req.preferred_brands,
                req.notes,
                req.photo_url,
            ),
        )
        db.commit()

        # Use cursor.lastrowid (works with row_factory that returns dicts)
        client_id = getattr(cursor, "lastrowid", None)
        if not client_id:
            # Fallback: try selecting last_insert_rowid() and read by column name
            row = db.execute("SELECT last_insert_rowid() AS last_id").fetchone()
            client_id = row.get("last_id") if isinstance(row, dict) else row[0]

        client = db.execute(
            """
            SELECT id, full_name, phone, email, instagram_handle, skin_tone, undertone, skin_type,
                   allergies, sensitivity_notes, preferred_brands, notes, photo_url, created_at, updated_at
            FROM clients WHERE id = ?
            """,
            (client_id,),
        ).fetchone()

        return {"data": client, "id": client_id, "message": "Client created successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create client: {str(e)}")


@router.get("/{client_id}")
def get_client(client_id: int = Path(..., gt=0)):
    """Get a specific client's profile details."""
    db = get_db()
    
    client = db.execute(
        """
        SELECT id, full_name, phone, email, instagram_handle, skin_tone, undertone, skin_type,
               allergies, sensitivity_notes, preferred_brands, notes, photo_url, created_at, updated_at
        FROM clients WHERE id = ?
        """,
        (client_id,),
    ).fetchone()
    
    if not client:
        raise HTTPException(status_code=404, detail=f"Client {client_id} not found")
    
    return {"data": client}


@router.delete("/{client_id}")
def delete_client(client_id: int = Path(..., gt=0)):
    """Delete a client and clean up related image links."""
    db = get_db()

    client = db.execute("SELECT id FROM clients WHERE id = ?", (client_id,)).fetchone()
    if not client:
        raise HTTPException(status_code=404, detail=f"Client {client_id} not found")

    linked_upload_rows = db.execute(
        """
        SELECT ul.upload_id
        FROM upload_links ul
        WHERE ul.entity_type = 'clients' AND ul.entity_id = ?
        """,
        (client_id,),
    ).fetchall()

    upload_ids = []
    for row in linked_upload_rows:
        upload_id = row.get("upload_id") if isinstance(row, dict) else row[0]
        if upload_id is not None:
            upload_ids.append(upload_id)

    try:
        db.execute(
            "DELETE FROM upload_links WHERE entity_type = 'clients' AND entity_id = ?",
            (client_id,),
        )
        db.execute("DELETE FROM clients WHERE id = ?", (client_id,))

        for upload_id in upload_ids:
            remaining = db.execute(
                "SELECT COUNT(*) AS count FROM upload_links WHERE upload_id = ?",
                (upload_id,),
            ).fetchone()
            remaining_count = remaining.get("count") if isinstance(remaining, dict) else remaining[0]
            if remaining_count == 0:
                db.execute("DELETE FROM uploads WHERE id = ?", (upload_id,))

        db.commit()
        return {"message": f"Client {client_id} deleted successfully"}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to delete client: {exc}")
