from typing import Optional

from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel

from src.config.db import get_db


router = APIRouter()


class CreateLookProductRequest(BaseModel):
    look_id: int
    product_id: int
    usage_notes: Optional[str] = None


@router.get("/look/{look_id}")
def list_look_products(look_id: int = Path(..., gt=0)):
    db = get_db()

    look = db.execute("SELECT id FROM makeup_looks WHERE id = ?", (look_id,)).fetchone()
    if look is None:
        raise HTTPException(status_code=404, detail=f"Look {look_id} not found")

    rows = db.execute(
        """
        SELECT lp.id, lp.look_id, lp.product_id, lp.usage_notes,
               p.name, p.brand, p.category, p.shade
        FROM look_products lp
        JOIN products p ON p.id = lp.product_id
        WHERE lp.look_id = ?
        ORDER BY lp.id DESC
        """,
        (look_id,),
    ).fetchall()

    return {"data": rows, "look_id": look_id}


@router.get("/product/{product_id}")
def list_product_looks(product_id: int = Path(..., gt=0)):
    db = get_db()

    product = db.execute("SELECT id FROM products WHERE id = ?", (product_id,)).fetchone()
    if product is None:
        raise HTTPException(status_code=404, detail=f"Product {product_id} not found")

    rows = db.execute(
        """
        SELECT lp.id, lp.look_id, lp.product_id, lp.usage_notes,
               ml.look_name, ml.category, ml.difficulty_level
        FROM look_products lp
        JOIN makeup_looks ml ON ml.id = lp.look_id
        WHERE lp.product_id = ?
        ORDER BY lp.id DESC
        """,
        (product_id,),
    ).fetchall()

    return {"data": rows, "product_id": product_id}


@router.post("/", status_code=201)
def create_look_product(req: CreateLookProductRequest):
    db = get_db()

    look = db.execute("SELECT id FROM makeup_looks WHERE id = ?", (req.look_id,)).fetchone()
    if look is None:
        raise HTTPException(status_code=404, detail=f"Look {req.look_id} not found")

    product = db.execute("SELECT id FROM products WHERE id = ?", (req.product_id,)).fetchone()
    if product is None:
        raise HTTPException(status_code=404, detail=f"Product {req.product_id} not found")

    existing = db.execute(
        "SELECT id FROM look_products WHERE look_id = ? AND product_id = ?",
        (req.look_id, req.product_id),
    ).fetchone()
    if existing is not None:
        raise HTTPException(status_code=400, detail="Product already linked to this look")

    try:
        cur = db.execute(
            """
            INSERT INTO look_products (look_id, product_id, usage_notes)
            VALUES (?, ?, ?)
            """,
            (req.look_id, req.product_id, req.usage_notes),
        )
        db.commit()

        row = db.execute(
            """
            SELECT id, look_id, product_id, usage_notes
            FROM look_products
            WHERE id = ?
            """,
            (cur.lastrowid,),
        ).fetchone()

        return {"data": row}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create look product link: {exc}")


@router.delete("/{look_product_id}")
def delete_look_product(look_product_id: int = Path(..., gt=0)):
    db = get_db()

    row = db.execute("SELECT id FROM look_products WHERE id = ?", (look_product_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail=f"Look product link {look_product_id} not found")

    db.execute("DELETE FROM look_products WHERE id = ?", (look_product_id,))
    db.commit()

    return {"message": "Look product link deleted successfully", "id": look_product_id}
