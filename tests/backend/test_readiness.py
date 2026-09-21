from __future__ import annotations

from app.services import ReadinessService


class FakeDatabase:
    def __init__(self, revisions=None, failure: Exception | None = None) -> None:
        self.revisions = revisions or ["202609210001"]
        self.failure = failure

    def applied_revisions(self):
        if self.failure:
            raise self.failure
        return self.revisions


def test_readiness_requires_complete_runtime_configuration(settings) -> None:
    service = ReadinessService(
        database=FakeDatabase(),
        settings=settings.model_copy(update={"operator_token": None}),
        code_heads=lambda: ["202609210001"],
    )

    assert service.check() == {
        "status": "unavailable",
        "database": "unavailable",
        "migration": "unavailable",
    }


def test_readiness_is_unavailable_when_database_fails(settings) -> None:
    service = ReadinessService(
        database=FakeDatabase(failure=RuntimeError("connection details must stay private")),
        settings=settings,
        code_heads=lambda: ["202609210001"],
    )

    assert service.check() == {
        "status": "unavailable",
        "database": "unavailable",
        "migration": "unavailable",
    }


def test_readiness_requires_exact_single_code_and_database_head(settings) -> None:
    mismatched = ReadinessService(
        database=FakeDatabase(["old-revision"]),
        settings=settings,
        code_heads=lambda: ["202609210001"],
    )
    multiple_code_heads = ReadinessService(
        database=FakeDatabase(),
        settings=settings,
        code_heads=lambda: ["202609210001", "202609210002"],
    )

    assert mismatched.check() == {
        "status": "unavailable",
        "database": "ready",
        "migration": "mismatch",
    }
    assert multiple_code_heads.check() == {
        "status": "unavailable",
        "database": "ready",
        "migration": "unavailable",
    }


def test_readiness_passes_only_for_one_matching_revision(settings) -> None:
    service = ReadinessService(
        database=FakeDatabase(["202609210001"]),
        settings=settings,
        code_heads=lambda: ["202609210001"],
    )

    assert service.check() == {
        "status": "ready",
        "database": "ready",
        "migration": "current",
    }

