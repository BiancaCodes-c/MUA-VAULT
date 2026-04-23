import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


load_dotenv()


def _parse_port(raw_value: str | None) -> int:
    if raw_value is None:
        return 4000
    try:
        parsed = int(raw_value)
    except ValueError as exc:
        raise ValueError("PORT must be an integer") from exc
    if parsed <= 0:
        raise ValueError("PORT must be positive")
    return parsed


@dataclass(frozen=True)
class Env:
    node_env: str
    port: int
    db_path: str
    schema_path: str
    seed_path: str
    db_path_absolute: str
    schema_path_absolute: str
    seed_path_absolute: str



def load_env() -> Env:
    node_env = os.getenv("NODE_ENV", "development")
    if node_env not in {"development", "test", "production"}:
        raise ValueError("NODE_ENV must be one of: development, test, production")

    port = _parse_port(os.getenv("PORT"))
    db_path = os.getenv("DB_PATH", "./data/mua-vault.db")
    schema_path = os.getenv("SCHEMA_PATH", "../SCHEMA")
    seed_path = os.getenv("SEED_PATH", "../SEED.sql")

    cwd = Path.cwd()
    return Env(
        node_env=node_env,
        port=port,
        db_path=db_path,
        schema_path=schema_path,
        seed_path=seed_path,
        db_path_absolute=str((cwd / db_path).resolve()),
        schema_path_absolute=str((cwd / schema_path).resolve()),
        seed_path_absolute=str((cwd / seed_path).resolve()),
    )


ENV = load_env()
