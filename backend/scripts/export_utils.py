from pathlib import Path
from datetime import datetime
from typing import Optional

import pandas as pd


def append_log_file(path: Path, text: str) -> None:
    with open(path, "a", encoding="utf-8") as fh:
        fh.write(text)


def append_log(path: Path, text: str) -> None:
    append_log_file(path, text)


def latest_parquet_for_prefix(prefix: str) -> Optional[Path]:
    out_dir = Path.cwd() / "data" / "exports"
    files = sorted(out_dir.glob(f"{prefix}_*.parquet"))
    return files[-1] if files else None


def _append_missing_or_null_issue(df: pd.DataFrame, column: str, issues: list[str], label: str | None = None) -> None:
    if column not in df.columns:
        issues.append(f"{label or column} column not present")
        return
    if df[column].isnull().any():
        issues.append(f"Missing {label or column} value(s)")


def _append_unparseable_datetime_issue(df: pd.DataFrame, column: str, issues: list[str]) -> None:
    if column not in df.columns:
        issues.append(f"{column} column not present")
        return
    try:
        pd.to_datetime(df[column])
    except Exception:
        issues.append(f"Unparseable {column} values")


def _append_allowed_values_issue(df: pd.DataFrame, column: str, allowed: set[str], issues: list[str]) -> None:
    if column not in df.columns:
        issues.append(f"{column} column not present")
        return
    invalid = sorted({str(value) for value in df[column].dropna().unique() if str(value) not in allowed})
    if invalid:
        issues.append(f"Invalid {column} values: {', '.join(invalid)}")


def _append_zero_row_issue(df: pd.DataFrame, label: str, issues: list[str]) -> None:
    if len(df) == 0:
        issues.append(f"No {label} exported (zero rows)")


def _check_appointments(df: pd.DataFrame, issues: list[str]) -> None:
    _append_missing_or_null_issue(df, "id", issues, "appointment id")
    _append_missing_or_null_issue(df, "client_id", issues, "client_id")
    _append_unparseable_datetime_issue(df, "appointment_date", issues)
    _append_allowed_values_issue(df, "status", {"Booked", "Completed", "Cancelled"}, issues)
    _append_zero_row_issue(df, "appointments", issues)


def _check_users(df: pd.DataFrame, issues: list[str]) -> None:
    _append_missing_or_null_issue(df, "id", issues, "user id")
    _append_missing_or_null_issue(df, "email", issues, "email")
    _append_missing_or_null_issue(df, "role", issues, "role")
    _append_unparseable_datetime_issue(df, "created_at", issues)
    _append_allowed_values_issue(df, "role", {"admin", "artist"}, issues)
    _append_zero_row_issue(df, "users", issues)


def _check_products(df: pd.DataFrame, issues: list[str]) -> None:
    _append_missing_or_null_issue(df, "id", issues, "product id")
    _append_missing_or_null_issue(df, "name", issues, "name")
    _append_missing_or_null_issue(df, "brand", issues, "brand")
    _append_missing_or_null_issue(df, "category", issues, "category")
    _append_unparseable_datetime_issue(df, "created_at", issues)
    _append_allowed_values_issue(
        df,
        "category",
        {
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
            "Powder",
            "Moisturizer",
        },
        issues,
    )
    _append_zero_row_issue(df, "products", issues)


def _check_productions(df: pd.DataFrame, issues: list[str]) -> None:
    _append_missing_or_null_issue(df, "id", issues, "production id")
    _append_missing_or_null_issue(df, "production_name", issues, "production_name")
    _append_missing_or_null_issue(df, "production_type", issues, "production_type")
    _append_unparseable_datetime_issue(df, "start_date", issues)
    _append_unparseable_datetime_issue(df, "end_date", issues)
    _append_allowed_values_issue(
        df,
        "production_type",
        {"Film", "TV Show", "Commercial", "Photoshoot", "Theater", "Music Video", "Editorial"},
        issues,
    )
    if {"start_date", "end_date"}.issubset(df.columns):
        start = pd.to_datetime(df["start_date"], errors="coerce")
        end = pd.to_datetime(df["end_date"], errors="coerce")
        invalid_range = start.notna() & end.notna() & (end < start)
        if invalid_range.any():
            issues.append("Some end_date values are earlier than start_date")
    _append_zero_row_issue(df, "productions", issues)


def _check_generic(df: pd.DataFrame, issues: list[str], label: str) -> None:
    _append_missing_or_null_issue(df, "id", issues, f"{label} id")
    _append_zero_row_issue(df, label, issues)


def run_data_quality_checks(parquet_path: Path):
    df = pd.read_parquet(parquet_path)
    issues = []

    prefix = parquet_path.stem.split("_")[0].lower()
    if prefix == "appointments":
        _check_appointments(df, issues)
    elif prefix == "users":
        _check_users(df, issues)
    elif prefix == "products":
        _check_products(df, issues)
    elif prefix == "productions":
        _check_productions(df, issues)
    else:
        _check_generic(df, issues, prefix)

    return issues
