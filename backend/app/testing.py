from __future__ import annotations

import re

from sqlalchemy.engine import URL, make_url


class UnsafeTestDatabaseError(RuntimeError):
    pass


def _database_identity(url: URL) -> tuple[object, ...]:
    return (
        url.username,
        url.password,
        url.host,
        url.port,
        url.database,
    )


def validate_test_database_url(
    test_database_url: str | None,
    database_url: str | None,
) -> str:
    """Fail closed before any migration or cleanup can reach a shared database."""

    if not test_database_url:
        raise UnsafeTestDatabaseError("TEST_DATABASE_URL is required")
    try:
        parsed = make_url(test_database_url)
    except Exception as error:
        raise UnsafeTestDatabaseError("TEST_DATABASE_URL is invalid") from error
    if parsed.get_backend_name() != "postgresql":
        raise UnsafeTestDatabaseError("TEST_DATABASE_URL must use PostgreSQL")
    database_name = parsed.database or ""
    tokens = {token for token in re.split(r"[^a-z0-9]+", database_name.lower()) if token}
    if not tokens.intersection({"test", "testing"}):
        raise UnsafeTestDatabaseError(
            "TEST_DATABASE_URL database name must be explicitly test-only"
        )
    if database_url:
        try:
            shared = make_url(database_url)
        except Exception:
            shared = None
        if shared is not None and _database_identity(parsed) == _database_identity(shared):
            raise UnsafeTestDatabaseError("TEST_DATABASE_URL must not equal DATABASE_URL")
    return test_database_url

