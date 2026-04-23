from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from src.middleware.error_handler import register_error_handlers
from src.routes.index import api_router


def create_app() -> FastAPI:
    app = FastAPI()

    frontend_dir = Path(__file__).resolve().parents[2] / "frontend"
    data_dir = Path(__file__).resolve().parents[2] / "backend" / "data"

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix="/api")

    # Serve uploaded files
    if data_dir.exists():
        app.mount("/data", StaticFiles(directory=str(data_dir)), name="data")

    if frontend_dir.exists():
        app.mount("/studio", StaticFiles(directory=str(frontend_dir), html=True), name="studio")

    @app.exception_handler(404)
    async def not_found(request: Request, _exc):
        return JSONResponse(
            status_code=404,
            content={"error": {"message": f"Route not found: {request.method} {request.url.path}"}},
        )

    register_error_handlers(app)
    return app
