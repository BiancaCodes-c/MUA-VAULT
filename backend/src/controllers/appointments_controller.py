from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from src.config.db import get_db


router = APIRouter()


class BookAppointmentRequest(BaseModel):
    client_id: int
    appointment_date: str = Field(..., description="Date in YYYY-MM-DD format")
    start_time: str = Field(..., description="Start time in HH:MM format")
    end_time: Optional[str] = Field(None, description="End time in HH:MM format")
    event_type: str = Field(..., description="Type of service (e.g., 'Bridal', 'Editorial')")
    location: Optional[str] = None
    status: str = Field(default="Booked", description="Booked, Completed, or Cancelled")
    price: Optional[float] = None
    deposit_paid: int = Field(default=0, description="0 or 1")
    deposit_amount: Optional[float] = None
    look_id: Optional[int] = None
    notes: Optional[str] = None


@router.get("/")
def list_appointments():
    db = get_db()
    rows = db.execute(
        """
        SELECT
          a.id,
          a.appointment_date,
          a.start_time,
          a.end_time,
          a.event_type,
          a.status,
          a.price,
          c.full_name AS client_name,
          p.production_name,
          sd.shoot_date
        FROM appointments a
        JOIN clients c ON c.id = a.client_id
        LEFT JOIN productions p ON p.id = a.production_id
        LEFT JOIN shoot_days sd ON sd.id = a.shoot_day_id
        ORDER BY a.appointment_date DESC
        """
    ).fetchall()

    return {"data": rows}


@router.post("/")
def book_appointment(req: BookAppointmentRequest):
    """Book a new appointment with all details."""
    db = get_db()
    
    # Validate client exists
    client = db.execute("SELECT id FROM clients WHERE id = ?", (req.client_id,)).fetchone()
    if not client:
        raise HTTPException(status_code=404, detail=f"Client {req.client_id} not found")
    
    # Validate look exists if provided
    if req.look_id:
        look = db.execute("SELECT id FROM makeup_looks WHERE id = ?", (req.look_id,)).fetchone()
        if not look:
            raise HTTPException(status_code=404, detail=f"Look {req.look_id} not found")
    
    # Validate status
    valid_statuses = ('Booked', 'Completed', 'Cancelled')
    if req.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    # Validate deposit_paid is 0 or 1
    if req.deposit_paid not in (0, 1):
        raise HTTPException(status_code=400, detail="deposit_paid must be 0 or 1")
    
    # Validate date format
    try:
        datetime.strptime(req.appointment_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="appointment_date must be in YYYY-MM-DD format")
    
    # Validate time format if provided
    if req.start_time:
        try:
            datetime.strptime(req.start_time, "%H:%M")
        except ValueError:
            raise HTTPException(status_code=400, detail="start_time must be in HH:MM format")
    
    if req.end_time:
        try:
            datetime.strptime(req.end_time, "%H:%M")
        except ValueError:
            raise HTTPException(status_code=400, detail="end_time must be in HH:MM format")
    
    try:
        cursor = db.execute(
            """
            INSERT INTO appointments
            (client_id, look_id, appointment_date, start_time, end_time, event_type, 
             location, status, price, deposit_paid, deposit_amount, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                req.client_id,
                req.look_id,
                req.appointment_date,
                req.start_time,
                req.end_time,
                req.event_type,
                req.location,
                req.status,
                req.price,
                req.deposit_paid,
                req.deposit_amount,
                req.notes,
            ),
        )
        db.commit()

        # Use the cursor's lastrowid (works with row_factory that returns dicts)
        appointment_id = getattr(cursor, "lastrowid", None)
        if not appointment_id:
            # Fallback: try selecting last_insert_rowid() and read by column name
            row = db.execute("SELECT last_insert_rowid() AS last_id").fetchone()
            appointment_id = row.get("last_id") if isinstance(row, dict) else row[0]

        appointment = db.execute(
            """
            SELECT id, client_id, look_id, appointment_date, start_time, end_time,
                   event_type, location, status, price, deposit_paid, deposit_amount, notes
            FROM appointments WHERE id = ?
            """,
            (appointment_id,),
        ).fetchone()

        return {"data": appointment, "id": appointment_id, "message": "Appointment booked successfully"}
    
    except Exception as e:
        db.rollback()
        # Return repr(e) temporarily for debugging to capture full error details
        raise HTTPException(status_code=400, detail=f"Failed to book appointment: {repr(e)}")

