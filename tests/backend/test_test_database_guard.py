from __future__ import annotations

import pytest

from app.testing import UnsafeTestDatabaseError, validate_test_database_url


@pytest.mark.parametrize(
    "test_url,database_url",
    [
        (None, None),
        (
            "postgresql+psycopg://user:pass@localhost/oncoready",
            None,
        ),
        (
            "postgresql+psycopg://user:pass@localhost/contest",
            None,
        ),
        (
            "sqlite:///oncoready_test.db",
            None,
        ),
        (
            "postgresql+psycopg://user:pass@localhost/oncoready_test",
            "postgresql+psycopg://user:pass@localhost/oncoready_test",
        ),
    ],
)
def test_guard_rejects_missing_shared_or_non_test_database(test_url, database_url) -> None:
    with pytest.raises(UnsafeTestDatabaseError):
        validate_test_database_url(test_url, database_url)


@pytest.mark.parametrize(
    "url",
    [
        "postgresql+psycopg://user:pass@localhost/oncoready_test",
        "postgresql://user:pass@localhost/test_oncoready",
        "postgresql+psycopg://user:pass@localhost/oncoready-testing-42",
    ],
)
def test_guard_accepts_explicitly_test_only_postgresql_database(url) -> None:
    assert validate_test_database_url(url, None) == url

