from pathlib import Path
from datetime import datetime
import sys

from src.config.env import ENV
from src.config.db import get_db, close_db


def _ensure_dependencies():
    try:
        import pandas as pd  # type: ignore
    except Exception as exc:  # ImportError or similar
        print(
            "Missing dependency: pandas (and likely pyarrow).\n",
            "Install with: pip install pandas pyarrow",
            file=sys.stderr,
        )
        raise


def run() -> Path:
    # Lazy-import pandas so failures are explicit and actionable
    import pandas as pd  # type: ignore
    try:
        from sqlalchemy import create_engine  # type: ignore
    except Exception:
        create_engine = None

    out_dir = Path.cwd() / "data" / "exports"
    out_dir.mkdir(parents=True, exist_ok=True)

    df = None
    if ENV.db_url and create_engine is not None:
        engine = create_engine(ENV.db_url)
        try:
            df = pd.read_sql("SELECT * FROM appointments", con=engine)
        finally:
            try:
                engine.dispose()
            except Exception:
                pass
    else:
        conn = get_db()
        try:
            df = pd.read_sql("SELECT * FROM appointments", con=conn)
        finally:
            close_db()

    if df is None:
        raise RuntimeError("Failed to load appointments into DataFrame")

    if len(df) == 0:
        print("Warning: appointments export produced zero rows")

    out_path = out_dir / f"appointments_{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}.parquet"
    # Write parquet (requires pyarrow or fastparquet)
    df.to_parquet(out_path, index=False)
    print(f"Wrote appointment snapshot: {out_path}")
    return out_path


if __name__ == "__main__":
    try:
        _ensure_dependencies()
        run()
    except Exception as exc:
        print(f"Export failed: {exc}", file=sys.stderr)
        raise
