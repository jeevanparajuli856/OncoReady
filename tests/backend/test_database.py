from __future__ import annotations

import pytest

from app.database import normalize_postgresql_url


@pytest.mark.parametrize(
    ("source", "expected"),
    [
        (
            "postgres://user:secret@postgres.railway.internal:5432/oncoready",
            "postgresql+psycopg://user:secret@postgres.railway.internal:5432/oncoready",
        ),
        (
            "postgresql://user:secret@postgres.railway.internal:5432/oncoready",
            "postgresql+psycopg://user:secret@postgres.railway.internal:5432/oncoready",
        ),
        (
            "postgresql+psycopg://user:secret@localhost/oncoready_test",
            "postgresql+psycopg://user:secret@localhost/oncoready_test",
        ),
    ],
)
def test_normalize_postgresql_url_selects_installed_psycopg_driver(
    source: str,
    expected: str,
) -> None:
    assert normalize_postgresql_url(source) == expected
