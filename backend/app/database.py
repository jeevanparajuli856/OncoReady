from __future__ import annotations

from collections.abc import Iterator
from contextlib import contextmanager
from typing import Any

from fastapi import Request
from sqlalchemy import Engine, create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.exc import ArgumentError
from sqlalchemy.orm import Session, sessionmaker

from app.config import Settings


def normalize_postgresql_url(url: str) -> str:
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url.removeprefix("postgres://")
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url.removeprefix("postgresql://")
    return url


class Database:
    """Own the SQLAlchemy engine without connecting or mutating schema at startup."""

    def __init__(self, settings: Settings) -> None:
        self.engine: Engine | None = None
        self.configuration_error: str | None = None
        self._session_factory: sessionmaker[Session] | None = None
        if settings.database_url is None:
            self.configuration_error = "DATABASE_URL"
            return

        raw_url = settings.database_url.get_secret_value()
        normalized_url = normalize_postgresql_url(raw_url)
        try:
            parsed = make_url(normalized_url)
            if parsed.get_backend_name() != "postgresql":
                raise ValueError("PostgreSQL is required")
            timeout_ms = int(settings.database_check_timeout_seconds * 1_000)
            self.engine = create_engine(
                normalized_url,
                pool_pre_ping=True,
                pool_timeout=settings.database_check_timeout_seconds,
                connect_args={
                    "connect_timeout": max(
                        1, int(settings.database_check_timeout_seconds)
                    ),
                    "options": f"-c statement_timeout={timeout_ms}",
                },
            )
            self._session_factory = sessionmaker(
                self.engine,
                expire_on_commit=False,
                autoflush=False,
            )
        except (ArgumentError, TypeError, ValueError):
            self.configuration_error = "DATABASE_URL"

    @contextmanager
    def session(self) -> Iterator[Session]:
        if self._session_factory is None:
            raise RuntimeError("Database is not configured")
        session = self._session_factory()
        try:
            yield session
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def applied_revisions(self) -> list[str]:
        if self.engine is None:
            raise RuntimeError("Database is not configured")
        with self.engine.connect() as connection:
            return list(
                connection.execute(
                    text("SELECT version_num FROM alembic_version ORDER BY version_num")
                ).scalars()
            )

    def dispose(self) -> None:
        if self.engine is not None:
            self.engine.dispose()


def get_session(request: Request) -> Iterator[Session]:
    database: Database = request.app.state.database
    with database.session() as session:
        yield session
