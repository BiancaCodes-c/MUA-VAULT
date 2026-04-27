from typing import Optional
import json
from urllib.request import urlopen
from urllib.error import URLError, HTTPError

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


@router.get("/external/lipsticks")
def list_external_lipsticks(limit: int = Query(default=20, ge=1, le=100)):
    """Proxy lipstick catalog data from makeup-api for frontend use."""
    url = "https://makeup-api.herokuapp.com/api/v1/products.json?product_type=lipstick"
    try:
        with urlopen(url, timeout=15) as response:
            payload = json.loads(response.read().decode("utf-8"))
        if not isinstance(payload, list):
            raise HTTPException(status_code=502, detail="Unexpected response shape from external API")
        rows = []
        for index, item in enumerate(payload[:limit]):
            if not isinstance(item, dict):
                continue

            raw_image = str(item.get("image_link") or item.get("api_featured_image") or "").strip()
            if raw_image.startswith("//"):
                image_link = f"https:{raw_image}"
            elif raw_image:
                image_link = raw_image
            else:
                seed_id = item.get("id") or index
                image_link = f"https://picsum.photos/seed/lipstick-{seed_id}/960/720"

            brand = str(item.get("brand") or "Unknown brand").strip() or "Unknown brand"
            name = str(item.get("name") or f"Lipstick #{index + 1}").strip() or f"Lipstick #{index + 1}"
            price = str(item.get("price") or "n/a").strip() or "n/a"
            price_sign = str(item.get("price_sign") or "$").strip() or "$"
            product_type = str(item.get("product_type") or "lipstick").strip() or "lipstick"

            rows.append({
                **item,
                "brand": brand,
                "name": name,
                "price": price,
                "price_sign": price_sign,
                "product_type": product_type,
                "image_link": image_link,
            })

        return {"data": rows, "meta": {"source": "makeup-api", "count": len(rows)}}
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=502, detail=f"External API request failed: {exc}")
