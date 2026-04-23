from fastapi import APIRouter

from src.config.db import get_db


router = APIRouter()


@router.get("/dashboard")
def get_industry_dashboard():
    db = get_db()

    totals = db.execute(
        """
        SELECT
          (SELECT COUNT(*) FROM productions) AS productions,
          (SELECT COUNT(*) FROM shoot_days) AS shoot_days,
          (SELECT COUNT(*) FROM call_sheets) AS call_sheets,
          (SELECT COUNT(*) FROM script_sides) AS script_sides,
          (SELECT COUNT(*) FROM character_makeup) AS character_makeup,
          (SELECT COUNT(*) FROM continuity_photos) AS continuity_photos
        """
    ).fetchone()

    upcoming = db.execute(
        """
        SELECT
          sd.id,
          sd.shoot_date,
          sd.call_time,
          sd.wrap_time,
          sd.int_ext,
          sd.shoot_type,
          sd.location,
          p.production_name,
          p.production_type
        FROM shoot_days sd
        JOIN productions p ON p.id = sd.production_id
        ORDER BY sd.shoot_date ASC
        LIMIT 10
        """
    ).fetchall()

    return {"data": {"totals": totals, "upcomingShootDays": upcoming}}


@router.get("/productions/{production_id}/uploads")
def list_production_uploads(production_id: int):
    db = get_db()
    rows = db.execute(
        """
        SELECT
          upload_link_id,
          upload_id,
          entity_type,
          entity_id,
          field_name,
          is_primary,
          original_filename,
          mime_type,
          file_size_bytes,
          storage_url,
          uploaded_at,
          uploaded_by_name,
          production_id,
          production_name,
          shoot_day_id,
          shoot_date,
          context_label
        FROM v_uploads_by_production_day
        WHERE production_id = ?
        ORDER BY shoot_date, entity_type, field_name
        """,
        (production_id,),
    ).fetchall()

    return {"data": rows}
