from pathlib import Path
from datetime import datetime
import pandas as pd
from typing import Optional


def append_log_file(path: Path, text: str) -> None:
    with open(path, "a", encoding="utf-8") as fh:
        fh.write(text)


def append_log(path: Path, text: str) -> None:
    append_log_file(path, text)


def latest_parquet_for_prefix(prefix: str) -> Optional[Path]:
    out_dir = Path.cwd() / "data" / "exports"
    files = sorted(out_dir.glob(f"{prefix}_*.parquet"))
    return files[-1] if files else None


def run_data_quality_checks(parquet_path: Path):
    df = pd.read_parquet(parquet_path)
    issues = []

    if 'id' not in df.columns or df['id'].isnull().any():
        issues.append("Missing appointment id(s)")

    if 'client_id' in df.columns:
        if df['client_id'].isnull().any():
            issues.append("Missing client_id(s)")
    else:
        issues.append("client_id column not present")

    if 'appointment_date' in df.columns:
        try:
            pd.to_datetime(df['appointment_date'])
        except Exception:
            issues.append("Unparseable appointment_date values")
    else:
        issues.append("appointment_date column not present")

    if len(df) == 0:
        issues.append("No appointments exported (zero rows)")

    return issues
