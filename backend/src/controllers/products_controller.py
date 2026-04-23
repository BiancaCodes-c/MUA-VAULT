from typing import Optional

from fastapi import APIRouter, HTTPException, Path, Query
from pydantic import BaseModel

from src.config.db import get_db


router = APIRouter()


class CreateProductRequest(BaseModel):
    name: str
    brand: str
    category: str
    shade: Optional[str] = None
    finish: Optional[str] = None
    suitable_skin_type: Optional[str] = None
    expiration_date: Optional[str] = None
    notes: Optional[str] = None


@router.get("/")
def list_products(limit: int = Query(default=25, ge=1, le=200), offset: int = Query(default=0, ge=0)):
    db = get_db()
    rows = db.execute(
        """
        SELECT id, name, brand, category, shade, finish, suitable_skin_type,
               expiration_date, notes, created_at
        FROM products
        ORDER BY created_at DESC, id DESC
        LIMIT ? OFFSET ?
        """,
        (limit, offset),
    ).fetchall()

    return {"data": rows, "meta": {"limit": limit, "offset": offset}}


@router.get("/{product_id}")
def get_product(product_id: int = Path(..., gt=0)):
    db = get_db()
    row = db.execute(
        """
        SELECT id, name, brand, category, shade, finish, suitable_skin_type,
               expiration_date, notes, created_at
        FROM products
        WHERE id = ?
        """,
        (product_id,),
    ).fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail=f"Product {product_id} not found")

    return {"data": row}


@router.post("/", status_code=201)
def create_product(req: CreateProductRequest):
    db = get_db()

    if not req.name or not req.name.strip():
        raise HTTPException(status_code=400, detail="name is required")
    if not req.brand or not req.brand.strip():
        raise HTTPException(status_code=400, detail="brand is required")
    if not req.category or not req.category.strip():
        raise HTTPException(status_code=400, detail="category is required")

    valid_categories = (
        "Foundation",
        "Concealer",
        "Eyeshadow",
        "Lipstick",
        "Lipgloss",
        "Blush",
        "Bronzer",
        "Highlighter",
        "Primer",
        "Setting Spray",
    )
    if req.category not in valid_categories:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category. Must be one of: {', '.join(valid_categories)}",
        )

    valid_finishes = ("Matte", "Dewy", "Satin", "Glossy", "Shimmer")
    if req.finish and req.finish not in valid_finishes:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid finish. Must be one of: {', '.join(valid_finishes)}",
        )

    try:
        cur = db.execute(
            """
            INSERT INTO products
            (name, brand, category, shade, finish, suitable_skin_type, expiration_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                req.name,
                req.brand,
                req.category,
                req.shade,
                req.finish,
                req.suitable_skin_type,
                req.expiration_date,
                req.notes,
            ),
        )
        db.commit()

        created = db.execute(
            """
            SELECT id, name, brand, category, shade, finish, suitable_skin_type,
                   expiration_date, notes, created_at
            FROM products
            WHERE id = ?
            """,
            (cur.lastrowid,),
        ).fetchone()

        return {"data": created}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to create product: {exc}")
