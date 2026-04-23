from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from src.config.env import ENV
from src.utils.http_error import HttpError


def _payload(message: str, details=None, stack: str | None = None):
    body = {"error": {"message": message}}
    if details is not None:
        body["error"]["details"] = details
    if stack and ENV.node_env != "production":
        body["error"]["stack"] = stack
    return body


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(HttpError)
    async def handle_http_error(_request: Request, exc: HttpError):
        return JSONResponse(status_code=exc.status, content=_payload(str(exc), exc.details))

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(_request: Request, exc: RequestValidationError):
        return JSONResponse(
            status_code=400,
            content=_payload("Invalid request", details={"errors": exc.errors()}),
        )

    @app.exception_handler(Exception)
    async def handle_generic_error(_request: Request, exc: Exception):
        return JSONResponse(status_code=500, content=_payload(str(exc) or "Internal server error", stack=str(exc)))
