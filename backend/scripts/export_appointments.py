from pathlib import Path
from datetime import datetime

import pandas as pd
from sqlalchemy import create_engine

from src.config.env import ENV
from src.config.db import get_db, close_db


def run() -> Path:
    out_dir = Path.cwd() / "data" / "exports"
    out_dir.mkdir(parents=True, exist_ok=True)

    if ENV.db_url:
        engine = create_engine(ENV.db_url)
        try:
            df = pd.read_sql("SELECT * FROM appointments", con=engine)
        finally:
            engine.dispose()
    else:
        conn = get_db()
        try:
            df = pd.read_sql("SELECT * FROM appointments", con=conn)
        finally:
            close_db()

    out_path = out_dir / f"appointments_{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}.parquet"
    df.to_parquet(out_path, index=False)
    print(f"Wrote appointment snapshot: {out_path}")
    return out_path


if __name__ == "__main__":
    try:
        run()
    except Exception as exc:
        print(str(exc))
        raise
