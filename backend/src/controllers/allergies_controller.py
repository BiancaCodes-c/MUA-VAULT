from fastapi import APIRouter, Query, HTTPException, Path
from pydantic import BaseModel
from typing import Optional

from src.config.db import get_db


router = APIRouter()


class CreateAllergyRequest(BaseModel):
    client_id: int
    allergy_name: str
    reaction_notes: Optional[str] = None
    severity: Optional[str] = None


@router.get("/client/{client_id}")
def get_client_allergies(client_id: int = Path(..., gt=0)):
    """Get all allergies for a specific client."""
    db = get_db()
    
    # Verify client exists
    client = db.execute("SELECT id FROM clients WHERE id = ?", (client_id,)).fetchone()
    if not client:
        raise HTTPException(status_code=404, detail=f"Client {client_id} not found")
    
    rows = db.execute(
        """
        SELECT id, client_id, allergy_name, reaction_notes, severity, created_at
        FROM client_allergies
        WHERE client_id = ?
        ORDER BY created_at DESC
        """,
        (client_id,),
    ).fetchall()
    
    return {"data": rows, "client_id": client_id}


@router.post("/")
def create_allergy(req: CreateAllergyRequest):
    """Create a new allergy record for a client."""
    db = get_db()
    
    # Verify client exists
    client = db.execute("SELECT id FROM clients WHERE id = ?", (req.client_id,)).fetchone()
    if not client:
        raise HTTPException(status_code=404, detail=f"Client {req.client_id} not found")
    
    # Validate allergy_name
    if not req.allergy_name or not req.allergy_name.strip():
        raise HTTPException(status_code=400, detail="allergy_name is required")
    
    # Validate severity if provided
    valid_severities = ('Mild', 'Moderate', 'Severe')
    if req.severity and req.severity not in valid_severities:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid severity. Must be one of: {', '.join(valid_severities)}"
        )
    
    # Check for duplicate allergy
    existing = db.execute(
        "SELECT id FROM client_allergies WHERE client_id = ? AND allergy_name = ?",
        (req.client_id, req.allergy_name),
    ).fetchone()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Allergy '{req.allergy_name}' already exists for this client"
        )
    
    try:
        db.execute(
            """
            INSERT INTO client_allergies
            (client_id, allergy_name, reaction_notes, severity)
            VALUES (?, ?, ?, ?)
            """,
            (
                req.client_id,
                req.allergy_name,
                req.reaction_notes,
                req.severity,
            ),
        )
        db.commit()
        
        # Fetch and return the created allergy
        result = db.execute("SELECT last_insert_rowid()").fetchone()
        allergy_id = result[0]
        
        allergy = db.execute(
            """
            SELECT id, client_id, allergy_name, reaction_notes, severity, created_at
            FROM client_allergies WHERE id = ?
            """,
            (allergy_id,),
        ).fetchone()
        
        return {"data": allergy, "id": allergy_id, "message": "Allergy record created successfully"}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create allergy: {str(e)}")
