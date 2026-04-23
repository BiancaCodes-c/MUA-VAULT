from pathlib import Path

from src.config.db import close_db, get_db
from src.config.env import ENV


def run() -> None:
    schema_path = Path(ENV.schema_path_absolute)
    if not schema_path.exists():
        raise FileNotFoundError(f"Schema file not found at: {schema_path}")

    schema_sql = schema_path.read_text(encoding="utf-8")
    db = get_db()
    db.executescript(schema_sql)
    db.commit()
    print(f"Schema initialized at: {ENV.db_path_absolute}")


if __name__ == "__main__":
    try:
        run()
    except Exception as exc:
        print(str(exc))
        raise
    finally:
        close_db()
