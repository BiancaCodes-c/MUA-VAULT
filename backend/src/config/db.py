import sqlite3
from pathlib import Path

from src.config.env import ENV


_db_instance: sqlite3.Connection | None = None


def _dict_factory(cursor: sqlite3.Cursor, row: tuple):
    return {col[0]: row[idx] for idx, col in enumerate(cursor.description)}


def get_db() -> sqlite3.Connection:
    global _db_instance

    if _db_instance is not None:
        return _db_instance

    db_path = Path(ENV.db_path_absolute)
    db_path.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = _dict_factory
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA foreign_keys = ON")

    _db_instance = conn
    return _db_instance


def close_db() -> None:
    global _db_instance
    if _db_instance is not None:
        _db_instance.close()
        _db_instance = None
