def append_log_file(path: Path, text: str) -> None:
from pathlib import Path
from datetime import datetime
import sys

from src.config.env import ENV
from src.scripts.export_appointments import run as export_appointments_run
from src.scripts.export_utils import latest_parquet_for_prefix, run_data_quality_checks
from src.scripts.notify import notify_on_failure, notify_on_success

LOG_DIR = Path.cwd() / "data" / "exports" / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)


def append_log_file(path: Path, text: str) -> None:
    with open(path, "a", encoding="utf-8") as fh:
        fh.write(text)


def append_log(msg: str) -> None:
    ts = datetime.utcnow().isoformat()
    entry = f"{ts} - {msg}\n"
    print(entry, end="")
    append_log_file(LOG_DIR / f"daily_export_{datetime.utcnow().date()}.log", entry)


def main():
    append_log("Starting daily export job")

    try:
        out_path = export_appointments_run()
        append_log(f"Export complete: {out_path}")
    except Exception as exc:
        msg = f"Export failed: {exc}"
        append_log(msg)
        notify_on_failure(msg)
        raise

    parquet = latest_parquet_for_prefix("appointments")
    if not parquet:
        msg = "No appointment parquet found after export"
        append_log(msg)
        notify_on_failure(msg)
        raise SystemExit(1)

    append_log(f"Found parquet: {parquet}")
    issues = run_data_quality_checks(parquet)
    if issues:
        msg = f"DATA QUALITY FAILED: {', '.join(issues)}"
        append_log(msg)
        notify_on_failure(msg)
    else:
        append_log("DATA QUALITY: PASSED")
        notify_on_success(f"Appointments export OK: {parquet}")


if __name__ == "__main__":
    main()
