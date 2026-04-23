from pathlib import Path

from src.config.db import close_db, get_db
from src.config.env import ENV


def run() -> None:
    seed_path = Path(ENV.seed_path_absolute)
    if not seed_path.exists():
        raise FileNotFoundError(f"Seed file not found at: {seed_path}")

    seed_sql = seed_path.read_text(encoding="utf-8")
    db = get_db()
    db.executescript(seed_sql)
    db.commit()
    print(f"Seed loaded into: {ENV.db_path_absolute}")


if __name__ == "__main__":
    try:
        run()
    except Exception as exc:
        print(str(exc))
        raise
    finally:
        close_db()
