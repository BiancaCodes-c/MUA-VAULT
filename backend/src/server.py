import uvicorn

from src.app import create_app
from src.config.env import ENV
from src.config.db import close_db


app = create_app()


@app.on_event("shutdown")
def shutdown_event():
    close_db()


if __name__ == "__main__":
    uvicorn.run("src.server:app", host="0.0.0.0", port=ENV.port, reload=True)
