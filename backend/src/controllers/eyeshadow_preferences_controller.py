from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel
from typing import Optional

from src.config.db import get_db


router = APIRouter()


class CreateEyeshadowPreferenceRequest(BaseModel):
    client_id: int
    finish_preference: Optional[str] = None
    color_preference: Optional[str] = None
    notes: Optional[str] = None


@router.get("/client/{client_id}")
def get_eyeshadow_preference(client_id: int = Path(..., gt=0)):
    """Get eyeshadow preferences for a specific client."""
    db = get_db()
    
    # Verify client exists
    client = db.execute("SELECT id FROM clients WHERE id = ?", (client_id,)).fetchone()
    if not client:
        raise HTTPException(status_code=404, detail=f"Client {client_id} not found")
    
    row = db.execute(
        """
        SELECT id, client_id, finish_preference, color_preference, notes
        FROM eyeshadow_preferences
        WHERE client_id = ?
        """,
        (client_id,),
    ).fetchone()
    
    if not row:
        return {"data": None, "client_id": client_id, "message": "No preferences recorded"}
    
    return {"data": row, "client_id": client_id}


@router.post("/")
def create_or_update_eyeshadow_preference(req: CreateEyeshadowPreferenceRequest):
    """Create or update eyeshadow preferences for a client (one per client)."""
    db = get_db()
    
    # Verify client exists
    client = db.execute("SELECT id FROM clients WHERE id = ?", (req.client_id,)).fetchone()
    if not client:
        raise HTTPException(status_code=404, detail=f"Client {req.client_id} not found")
    
    # Validate finish_preference if provided
    valid_finishes = ('Matte', 'Shimmer', 'Glitter', 'Satin')
    if req.finish_preference and req.finish_preference not in valid_finishes:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid finish_preference. Must be one of: {', '.join(valid_finishes)}"
        )
    
    # Check if preference already exists
    existing = db.execute(
        "SELECT id FROM eyeshadow_preferences WHERE client_id = ?",
        (req.client_id,),
    ).fetchone()
    
    try:
        if existing:
            # Update existing preference
            db.execute(
                """
                UPDATE eyeshadow_preferences
                SET finish_preference = ?, color_preference = ?, notes = ?
                WHERE client_id = ?
                """,
                (
                    req.finish_preference,
                    req.color_preference,
                    req.notes,
                    req.client_id,
                ),
            )
            db.commit()
            message = "Eyeshadow preferences updated successfully"
            preference_id = existing[0]
        else:
            # Create new preference
            db.execute(
                """
                INSERT INTO eyeshadow_preferences
                (client_id, finish_preference, color_preference, notes)
                VALUES (?, ?, ?, ?)
                """,
                (
                    req.client_id,
                    req.finish_preference,
                    req.color_preference,
                    req.notes,
                ),
            )
            db.commit()
            result = db.execute("SELECT last_insert_rowid()").fetchone()
            preference_id = result[0]
            message = "Eyeshadow preferences created successfully"
        
        # Fetch and return the preference
        preference = db.execute(
            """
            SELECT id, client_id, finish_preference, color_preference, notes
            FROM eyeshadow_preferences WHERE id = ?
            """,
            (preference_id,),
        ).fetchone()
        
        return {"data": preference, "id": preference_id, "message": message}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to save eyeshadow preferences: {str(e)}")


@router.delete("/client/{client_id}")
def delete_eyeshadow_preference(client_id: int = Path(..., gt=0)):
    """Delete eyeshadow preferences for a client."""
    db = get_db()
    
    # Verify preference exists
    preference = db.execute(
        "SELECT id FROM eyeshadow_preferences WHERE client_id = ?",
        (client_id,),
    ).fetchone()
    if not preference:
        raise HTTPException(status_code=404, detail=f"No eyeshadow preferences found for client {client_id}")
    
    try:
        db.execute("DELETE FROM eyeshadow_preferences WHERE client_id = ?", (client_id,))
        db.commit()
        
        return {"message": "Eyeshadow preferences deleted successfully", "client_id": client_id}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to delete eyeshadow preferences: {str(e)}")
