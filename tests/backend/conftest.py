from __future__ import annotations

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app
from app.repositories import get_proof_repository
from app.services import get_readiness_service


class FakeProofRepository:
    def __init__(self) -> None:
        self.proof = None
        self.failure: Exception | None = None
        self.reset_calls = 0

    def get(self):
        if self.failure:
            raise self.failure
        return self.proof

    def put(self, value: str):
        if self.failure:
            raise self.failure
        if self.proof is None:
            self.proof = proof_record(value=value)
        else:
            self.proof.value = value
        return self.proof

    def reset(self):
        if self.failure:
            raise self.failure
        self.reset_calls += 1
        self.proof = proof_record()
        return self.proof


class FakeReadinessService:
    def __init__(self, result=None) -> None:
        self.calls = 0
        self.result = result or {
            "status": "ready",
            "database": "ready",
            "migration": "current",
        }

    def check(self):
        self.calls += 1
        return self.result


def proof_record(value: str = "Railway PostgreSQL connected"):
    from datetime import UTC, datetime
    from types import SimpleNamespace

    now = datetime(2026, 9, 21, 12, 0, tzinfo=UTC)
    return SimpleNamespace(
        key="railway-foundation",
        value=value,
        seed_version=1,
        created_at=now,
        updated_at=now,
    )


@pytest.fixture
def settings() -> Settings:
    return Settings(
        _env_file=None,
        database_url="postgresql+psycopg://user:secret@db.internal/oncoready_test",
        operator_token="operator-test-token-with-enough-entropy",
        cors_origins=["https://web.example.test", "http://localhost:5173"],
        reset_enabled=True,
        max_request_body_bytes=1_024,
        application_version="0.1.0-test",
        build_id="test-build",
    )


@pytest.fixture
def fake_repository():
    return FakeProofRepository()


@pytest.fixture
def fake_readiness():
    return FakeReadinessService()


@pytest.fixture
def client(
    settings: Settings,
    fake_repository: FakeProofRepository,
    fake_readiness: FakeReadinessService,
) -> Iterator[TestClient]:
    app = create_app(settings)
    app.dependency_overrides[get_proof_repository] = lambda: fake_repository
    app.dependency_overrides[get_readiness_service] = lambda: fake_readiness
    with TestClient(app, raise_server_exceptions=False) as test_client:
        yield test_client
