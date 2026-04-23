from datetime import datetime, timezone

from fastapi import APIRouter


router = APIRouter()


@router.get("/")
def get_health():
    return {
        "status": "ok",
        "service": "mua-vault-backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
