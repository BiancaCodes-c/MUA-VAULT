from collections import Counter
from datetime import date

from fastapi import APIRouter

from src.config.db import get_db


router = APIRouter()


def _production_status(start_date: str | None, end_date: str | None, today: date) -> str:
  today_str = today.isoformat()

  if start_date and start_date > today_str:
    return "Planned"
  if end_date and end_date < today_str:
    return "Wrapped"
  return "Live"


def _build_dashboard_statuses(db):
  today = date.today()

  appointment_status_rows = db.execute(
    """
    SELECT
      COALESCE(status, 'Booked') AS status,
      COUNT(*) AS count
    FROM appointments
    GROUP BY COALESCE(status, 'Booked')
    ORDER BY count DESC, status ASC
    """
  ).fetchall()

  production_rows = db.execute(
    """
    SELECT
      id,
      production_name,
      production_type,
      start_date,
      end_date
    FROM productions
    ORDER BY start_date ASC, production_name ASC
    """
  ).fetchall()

  upload_rows = db.execute(
    """
    SELECT
      upload_id,
      original_filename,
      entity_type,
      entity_id,
      uploaded_at
    FROM v_uploads_by_production_day
    ORDER BY uploaded_at DESC
    LIMIT 6
    """
  ).fetchall()

  production_items = []
  production_counts = Counter()
  for row in production_rows:
    status = _production_status(row["start_date"], row["end_date"], today)
    production_counts[status] += 1
    production_items.append(
      {
        "id": row["id"],
        "name": row["production_name"],
        "type": row["production_type"],
        "meta": f"{status} · {row['start_date'] or 'Date TBD'}",
        "status": status,
        "live": status == "Live",
      }
    )

  appointment_items = db.execute(
    """
    SELECT
      a.id,
      a.appointment_date,
      a.start_time,
      a.status,
      a.event_type,
      a.price,
      c.full_name AS client_name
    FROM appointments a
    JOIN clients c ON c.id = a.client_id
    ORDER BY a.appointment_date ASC, a.start_time ASC
    LIMIT 6
    """
  ).fetchall()

  appointment_items_out = []
  for row in appointment_items:
    status = str(row["status"] or "Booked")
    normalized = status.lower()
    status_class = "s-completed" if "complete" in normalized else "s-cancelled" if "cancel" in normalized else "s-booked"
    time_parts = (row["start_time"] or "00:00").split(":")
    hour = int(time_parts[0]) if time_parts[0].isdigit() else 0
    minute = time_parts[1] if len(time_parts) > 1 else "00"
    period = "PM" if hour >= 12 else "AM"
    normalized_hour = hour % 12 or 12
    appointment_items_out.append(
      {
        "id": row["id"],
        "h": f"{normalized_hour}:{minute}",
        "p": period,
        "name": row["client_name"],
        "type": f"{row['event_type'] or 'Service'} - ${float(row['price'] or 0):.0f}",
        "s": status_class,
        "status": status,
      }
    )

  upload_items = [
    {
      "name": row["original_filename"],
      "meta": f"{row['entity_type'] or 'asset'} {row['entity_id'] if row['entity_id'] is not None else ''}".strip(),
      "status": "Ready",
    }
    for row in upload_rows
  ]

  return {
    "appointmentStatuses": [
      {"status": row["status"], "count": row["count"]}
      for row in appointment_status_rows
    ],
    "productionStatuses": [
      {"status": key, "count": production_counts.get(key, 0)}
      for key in ("Live", "Planned", "Wrapped")
    ],
    "appointmentRows": appointment_items_out,
    "productionRows": production_items,
    "uploadRows": upload_items,
    "uploadStatuses": [{"status": "Ready", "count": len(upload_items)}],
  }


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

    return {"data": {"totals": totals, "upcomingShootDays": upcoming, "statuses": _build_dashboard_statuses(db)}}


@router.get("/dashboard/statuses")
def get_industry_dashboard_statuses():
    db = get_db()
    return {"data": _build_dashboard_statuses(db)}


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
