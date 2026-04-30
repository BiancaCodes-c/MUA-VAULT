from typing import Optional
import json
from urllib.request import urlopen
from urllib.error import URLError, HTTPError

from fastapi import APIRouter, HTTPException, Path, Query
from pydantic import BaseModel

from src.config.db import get_db


router = APIRouter()


class CreateLookProductRequest(BaseModel):
    look_id: int
    product_id: int
    usage_notes: Optional[str] = None


@router.get("/external/foundations")
def list_external_foundations(limit: int = Query(default=20, ge=1, le=200)):
    """Proxy foundation catalog data from makeup-api for look product workflows."""
    return _list_external_products(limit=limit, product_type="foundation")


@router.get("/external/products")
def list_external_products(limit: int = Query(default=20, ge=1, le=200)):
    """Proxy full product catalog data from makeup-api for look product workflows."""
    return _list_external_products(limit=limit, product_type=None)


def _list_external_products(limit: int, product_type: Optional[str]):
    if product_type:
        url = f"https://makeup-api.herokuapp.com/api/v1/products.json?product_type={product_type}"
    else:
        url = "https://makeup-api.herokuapp.com/api/v1/products.json"

    try:
        with urlopen(url, timeout=15) as response:
            payload = json.loads(response.read().decode("utf-8"))
        if not isinstance(payload, list):
            raise HTTPException(status_code=502, detail="Unexpected response shape from external API")

        rows = []
        for item in payload[:limit]:
            if not isinstance(item, dict):
                continue

            raw_image = str(item.get("image_link") or item.get("api_featured_image") or "").strip()
            if raw_image.startswith("//"):
                image_link = f"https:{raw_image}"
            elif raw_image:
                image_link = raw_image
            else:
                image_link = ""

            normalized = {
                **item,
                "brand": str(item.get("brand") or "Unknown brand").strip() or "Unknown brand",
                "name": str(item.get("name") or "Unnamed product").strip() or "Unnamed product",
                "price": str(item.get("price") or "n/a").strip() or "n/a",
                "price_sign": str(item.get("price_sign") or "$").strip() or "$",
                "image_link": image_link,
            }
            rows.append(normalized)

        return {
            "data": rows,
            "meta": {
                "source": "makeup-api",
                "count": len(rows),
                "product_type": product_type,
            },
        }
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=502, detail=f"External API request failed: {exc}")


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
