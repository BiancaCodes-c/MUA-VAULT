from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel
from typing import Optional

from src.config.db import get_db


router = APIRouter()


@router.get("/")
def list_foundation_shades():
        db = get_db()
        rows = db.execute(
                """
                SELECT
                    fs.id,
                    fs.client_id,
            COALESCE(NULLIF(c.full_name, ''), 'Unknown Client') AS client_name,
            COALESCE(NULLIF(fs.brand, ''), 'Unknown Brand') AS brand,
            COALESCE(NULLIF(fs.shade_name, ''), 'Unknown Shade') AS shade_name,
            COALESCE(NULLIF(fs.shade_code, ''), 'N/A') AS shade_code,
            COALESCE(NULLIF(fs.undertone, ''), 'Neutral') AS undertone,
            COALESCE(NULLIF(fs.notes, ''), 'No notes') AS notes,
            fs.created_at,
            ('https://picsum.photos/seed/foundation-' || fs.id || '/960/720') AS image_link
                FROM foundation_shades fs
                JOIN clients c ON c.id = fs.client_id
                ORDER BY fs.created_at DESC, fs.id DESC
                """
        ).fetchall()

        return {"data": rows}


class CreateFoundationShadeRequest(BaseModel):
    client_id: int
    brand: str
    shade_name: str
    shade_code: Optional[str] = None
    undertone: Optional[str] = None
    notes: Optional[str] = None


@router.get("/client/{client_id}")
def get_client_foundation_shades(client_id: int = Path(..., gt=0)):
    """Get all foundation shades for a specific client."""
    db = get_db()
    
    # Verify client exists
    client = db.execute("SELECT id FROM clients WHERE id = ?", (client_id,)).fetchone()
    if not client:
        raise HTTPException(status_code=404, detail=f"Client {client_id} not found")
    
    rows = db.execute(
        """
        SELECT id, client_id, brand, shade_name, shade_code, undertone, notes, created_at
        FROM foundation_shades
        WHERE client_id = ?
        ORDER BY created_at DESC
        """,
        (client_id,),
    ).fetchall()
    
    return {"data": rows, "client_id": client_id}


@router.post("/")
def create_foundation_shade(req: CreateFoundationShadeRequest):
    """Create a new foundation shade record for a client."""
    db = get_db()
    
    # Verify client exists
    client = db.execute("SELECT id FROM clients WHERE id = ?", (req.client_id,)).fetchone()
    if not client:
        raise HTTPException(status_code=404, detail=f"Client {req.client_id} not found")
    
    # Validate brand
    if not req.brand or not req.brand.strip():
        raise HTTPException(status_code=400, detail="brand is required")
    
    # Validate shade_name
    if not req.shade_name or not req.shade_name.strip():
        raise HTTPException(status_code=400, detail="shade_name is required")
    
    # Validate undertone if provided
    valid_undertones = ('Cool', 'Warm', 'Neutral', 'Olive')
    if req.undertone and req.undertone not in valid_undertones:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid undertone. Must be one of: {', '.join(valid_undertones)}"
        )
    
    # Check for duplicate foundation shade (unique constraint)
    existing = db.execute(
        """
        SELECT id FROM foundation_shades 
        WHERE client_id = ? AND brand = ? AND shade_name = ? AND shade_code = ?
        """,
        (req.client_id, req.brand, req.shade_name, req.shade_code),
    ).fetchone()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Foundation shade '{req.brand} - {req.shade_name}' already exists for this client"
        )
    
    try:
        db.execute(
            """
            INSERT INTO foundation_shades
            (client_id, brand, shade_name, shade_code, undertone, notes)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                req.client_id,
                req.brand,
                req.shade_name,
                req.shade_code,
                req.undertone,
                req.notes,
            ),
        )
        db.commit()
        
        # Fetch and return the created foundation shade
        result = db.execute("SELECT last_insert_rowid()").fetchone()
        shade_id = result[0]
        
        shade = db.execute(
            """
            SELECT id, client_id, brand, shade_name, shade_code, undertone, notes, created_at
            FROM foundation_shades WHERE id = ?
            """,
            (shade_id,),
        ).fetchone()
        
        return {"data": shade, "id": shade_id, "message": "Foundation shade created successfully"}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create foundation shade: {str(e)}")
