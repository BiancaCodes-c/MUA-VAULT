from pathlib import Path
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def list_exports():
    base = Path(__file__).resolve().parents[3] / "data" / "exports"
    if not base.exists():
        return {"data": []}

    files = []
    for p in sorted(base.glob("*.parquet"), key=lambda x: x.stat().st_mtime, reverse=True):
        stat = p.stat()
        files.append({
            "name": p.name,
            "url": f"/data/exports/{p.name}",
            "size": stat.st_size,
            "modified": stat.st_mtime,
        })

    return {"data": files}
