from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel
from typing import Optional

from src.config.db import get_db


router = APIRouter()


class CreateAppointmentProductRequest(BaseModel):
    appointment_id: int
    product_id: int
    quantity_used: Optional[str] = None


@router.get("/appointment/{appointment_id}")
def get_appointment_products(appointment_id: int = Path(..., gt=0)):
    """Get all products used in a specific appointment."""
    db = get_db()
    
    # Verify appointment exists
    appointment = db.execute("SELECT id FROM appointments WHERE id = ?", (appointment_id,)).fetchone()
    if not appointment:
        raise HTTPException(status_code=404, detail=f"Appointment {appointment_id} not found")
    
    rows = db.execute(
        """
        SELECT ap.id, ap.appointment_id, ap.product_id, ap.quantity_used,
               p.name, p.brand, p.category, p.shade
        FROM appointment_products ap
        JOIN products p ON p.id = ap.product_id
        WHERE ap.appointment_id = ?
        ORDER BY ap.id DESC
        """,
        (appointment_id,),
    ).fetchall()
    
    return {"data": rows, "appointment_id": appointment_id}


@router.get("/product/{product_id}")
def get_product_appointments(product_id: int = Path(..., gt=0)):
    """Get all appointments where a specific product was used."""
    db = get_db()
    
    # Verify product exists
    product = db.execute("SELECT id FROM products WHERE id = ?", (product_id,)).fetchone()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product {product_id} not found")
    
    rows = db.execute(
        """
        SELECT ap.id, ap.appointment_id, ap.product_id, ap.quantity_used,
               a.appointment_date, c.full_name
        FROM appointment_products ap
        JOIN appointments a ON a.id = ap.appointment_id
        JOIN clients c ON c.id = a.client_id
        WHERE ap.product_id = ?
        ORDER BY a.appointment_date DESC
        """,
        (product_id,),
    ).fetchall()
    
    return {"data": rows, "product_id": product_id}


@router.post("/")
def create_appointment_product(req: CreateAppointmentProductRequest):
    """Record a product used in an appointment."""
    db = get_db()
    
    # Verify appointment exists
    appointment = db.execute("SELECT id FROM appointments WHERE id = ?", (req.appointment_id,)).fetchone()
    if not appointment:
        raise HTTPException(status_code=404, detail=f"Appointment {req.appointment_id} not found")
    
    # Verify product exists
    product = db.execute("SELECT id FROM products WHERE id = ?", (req.product_id,)).fetchone()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product {req.product_id} not found")
    
    # Check for duplicate product in same appointment
    existing = db.execute(
        """
        SELECT id FROM appointment_products 
        WHERE appointment_id = ? AND product_id = ?
        """,
        (req.appointment_id, req.product_id),
    ).fetchone()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Product already recorded for this appointment"
        )
    
    try:
        db.execute(
            """
            INSERT INTO appointment_products
            (appointment_id, product_id, quantity_used)
            VALUES (?, ?, ?)
            """,
            (
                req.appointment_id,
                req.product_id,
                req.quantity_used,
            ),
        )
        db.commit()
        
        # Fetch and return the created record
        result = db.execute("SELECT last_insert_rowid()").fetchone()
        record_id = result[0]
        
        record = db.execute(
            """
            SELECT ap.id, ap.appointment_id, ap.product_id, ap.quantity_used,
                   p.name, p.brand, p.category, p.shade
            FROM appointment_products ap
            JOIN products p ON p.id = ap.product_id
            WHERE ap.id = ?
            """,
            (record_id,),
        ).fetchone()
        
        return {"data": record, "id": record_id, "message": "Product recorded for appointment successfully"}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to record appointment product: {str(e)}")


@router.delete("/{appointment_product_id}")
def delete_appointment_product(appointment_product_id: int = Path(..., gt=0)):
    """Remove a product from an appointment record."""
    db = get_db()
    
    # Verify the appointment product record exists
    record = db.execute("SELECT id FROM appointment_products WHERE id = ?", (appointment_product_id,)).fetchone()
    if not record:
        raise HTTPException(status_code=404, detail=f"Appointment product record {appointment_product_id} not found")
    
    try:
        db.execute("DELETE FROM appointment_products WHERE id = ?", (appointment_product_id,))
        db.commit()
        
        return {"message": "Appointment product deleted successfully", "id": appointment_product_id}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to delete appointment product: {str(e)}")
