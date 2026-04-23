from fastapi import APIRouter, HTTPException, Path, Query
from pydantic import BaseModel
from typing import Optional

from src.config.db import get_db


router = APIRouter()


class CreateClientHistoryRequest(BaseModel):
    client_id: int
    appointment_id: Optional[int] = None
    look_id: Optional[int] = None
    date: str
    notes: Optional[str] = None
    client_feedback: Optional[str] = None
    would_recommend: Optional[int] = None


@router.get("/client/{client_id}")
def get_client_history(client_id: int = Path(..., gt=0)):
    """Get service history for a specific client."""
    db = get_db()
    
    # Verify client exists
    client = db.execute("SELECT id FROM clients WHERE id = ?", (client_id,)).fetchone()
    if not client:
        raise HTTPException(status_code=404, detail=f"Client {client_id} not found")
    
    rows = db.execute(
        """
        SELECT ch.id, ch.client_id, ch.appointment_id, ch.look_id, ch.date,
               ch.notes, ch.client_feedback, ch.would_recommend,
               a.event_type, ml.look_name
        FROM client_history ch
        LEFT JOIN appointments a ON a.id = ch.appointment_id
        LEFT JOIN makeup_looks ml ON ml.id = ch.look_id
        WHERE ch.client_id = ?
        ORDER BY ch.date DESC
        """,
        (client_id,),
    ).fetchall()
    
    return {"data": rows, "client_id": client_id}


@router.get("/")
def list_client_history(limit: int = Query(default=25, ge=0), offset: int = Query(default=0, ge=0)):
    """List all client history records with pagination."""
    db = get_db()
    
    rows = db.execute(
        """
        SELECT ch.id, ch.client_id, ch.appointment_id, ch.look_id, ch.date,
               ch.notes, ch.client_feedback, ch.would_recommend,
               c.full_name, a.event_type, ml.look_name
        FROM client_history ch
        JOIN clients c ON c.id = ch.client_id
        LEFT JOIN appointments a ON a.id = ch.appointment_id
        LEFT JOIN makeup_looks ml ON ml.id = ch.look_id
        ORDER BY ch.date DESC
        LIMIT ? OFFSET ?
        """,
        (limit, offset),
    ).fetchall()
    
    return {"data": rows, "meta": {"limit": limit, "offset": offset}}


@router.post("/")
def create_client_history(req: CreateClientHistoryRequest):
    """Record a service history entry for a client."""
    db = get_db()
    
    # Verify client exists
    client = db.execute("SELECT id FROM clients WHERE id = ?", (req.client_id,)).fetchone()
    if not client:
        raise HTTPException(status_code=404, detail=f"Client {req.client_id} not found")
    
    # Verify appointment exists if provided
    if req.appointment_id:
        appointment = db.execute("SELECT id FROM appointments WHERE id = ?", (req.appointment_id,)).fetchone()
        if not appointment:
            raise HTTPException(status_code=404, detail=f"Appointment {req.appointment_id} not found")
        
        # Check for duplicate (unique constraint on appointment_id in schema)
        existing = db.execute(
            "SELECT id FROM client_history WHERE appointment_id = ?",
            (req.appointment_id,),
        ).fetchone()
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"History record already exists for appointment {req.appointment_id}"
            )
    
    # Verify look exists if provided
    if req.look_id:
        look = db.execute("SELECT id FROM makeup_looks WHERE id = ?", (req.look_id,)).fetchone()
        if not look:
            raise HTTPException(status_code=404, detail=f"Look {req.look_id} not found")
    
    # Validate would_recommend if provided
    if req.would_recommend is not None and req.would_recommend not in (0, 1):
        raise HTTPException(status_code=400, detail="would_recommend must be 0 or 1")
    
    try:
        db.execute(
            """
            INSERT INTO client_history
            (client_id, appointment_id, look_id, date, notes, client_feedback, would_recommend)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                req.client_id,
                req.appointment_id,
                req.look_id,
                req.date,
                req.notes,
                req.client_feedback,
                req.would_recommend,
            ),
        )
        db.commit()
        
        # Fetch and return the created history record
        result = db.execute("SELECT last_insert_rowid()").fetchone()
        history_id = result[0]
        
        history = db.execute(
            """
            SELECT ch.id, ch.client_id, ch.appointment_id, ch.look_id, ch.date,
                   ch.notes, ch.client_feedback, ch.would_recommend,
                   a.event_type, ml.look_name
            FROM client_history ch
            LEFT JOIN appointments a ON a.id = ch.appointment_id
            LEFT JOIN makeup_looks ml ON ml.id = ch.look_id
            WHERE ch.id = ?
            """,
            (history_id,),
        ).fetchone()
        
        return {"data": history, "id": history_id, "message": "Client history record created successfully"}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create client history: {str(e)}")
