from __future__ import annotations

import os
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text

from app.config import Settings
from app.constants import FOUNDATION_KEY, FOUNDATION_SEED_VALUE
from app.main import create_app
from app.testing import validate_test_database_url


pytestmark = pytest.mark.integration


@pytest.fixture(scope="module")
def test_database_url() -> str:
    return validate_test_database_url(
        os.getenv("TEST_DATABASE_URL"),
        os.getenv("DATABASE_URL"),
    )


@pytest.fixture(scope="module", autouse=True)
def migrated_database(test_database_url: str):
    backend_dir = Path(__file__).resolve().parents[2] / "backend"
    config = Config(str(backend_dir / "alembic" / "alembic.ini"))
    config.set_main_option("script_location", str(backend_dir / "alembic"))
    engine = create_engine(test_database_url)
    with engine.begin() as connection:
        config.attributes["connection"] = connection
        command.upgrade(config, "head")
    with engine.begin() as connection:
        connection.execute(
            text("DELETE FROM foundation_proofs WHERE key IN (:seed, :unrelated)"),
            {"seed": FOUNDATION_KEY, "unrelated": "integration-unrelated"},
        )
    yield
    with engine.begin() as connection:
        connection.execute(
            text("DELETE FROM foundation_proofs WHERE key IN (:seed, :unrelated)"),
            {"seed": FOUNDATION_KEY, "unrelated": "integration-unrelated"},
        )
    engine.dispose()


@pytest.fixture
def integration_settings(test_database_url: str) -> Settings:
    return Settings(
        _env_file=None,
        database_url=test_database_url,
        operator_token="integration-operator-token-with-enough-entropy",
        cors_origins=["http://localhost:5173"],
        reset_enabled=True,
    )


def test_write_survives_application_restart(integration_settings) -> None:
    headers = {"Authorization": "Bearer integration-operator-token-with-enough-entropy"}

    with TestClient(create_app(integration_settings)) as first_client:
        written = first_client.put(
            "/api/v1/foundation/proof",
            json={"value": "survives restart"},
            headers=headers,
        )
        assert written.status_code == 200

    with TestClient(create_app(integration_settings)) as restarted_client:
        read = restarted_client.get("/api/v1/foundation/proof")

    assert read.status_code == 200
    assert read.json()["value"] == "survives restart"


def test_readiness_checks_postgresql_and_exact_alembic_head(integration_settings) -> None:
    with TestClient(create_app(integration_settings)) as client:
        response = client.get("/ready")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ready",
        "database": "ready",
        "migration": "current",
    }


def test_reset_is_idempotent_and_preserves_unrelated_rows(
    integration_settings,
    test_database_url,
) -> None:
    engine = create_engine(test_database_url)
    with engine.begin() as connection:
        connection.execute(
            text(
                """
                INSERT INTO foundation_proofs (key, value, seed_version)
                VALUES (:key, :value, 9)
                ON CONFLICT (key) DO UPDATE
                SET value = EXCLUDED.value, seed_version = EXCLUDED.seed_version
                """
            ),
            {"key": "integration-unrelated", "value": "preserve me"},
        )
        connection.execute(
            text(
                """
                INSERT INTO foundation_proofs (key, value, seed_version)
                VALUES (:key, :value, 1)
                ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
                """
            ),
            {"key": FOUNDATION_KEY, "value": "changed"},
        )

    headers = {"Authorization": "Bearer integration-operator-token-with-enough-entropy"}
    with TestClient(create_app(integration_settings)) as client:
        first = client.post("/api/v1/operator/reset", headers=headers)
        second = client.post("/api/v1/operator/reset", headers=headers)

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json()["proof"] == second.json()["proof"]
    assert second.json()["proof"]["value"] == FOUNDATION_SEED_VALUE

    with engine.connect() as connection:
        unrelated = connection.execute(
            text(
                "SELECT value, seed_version FROM foundation_proofs WHERE key = :key"
            ),
            {"key": "integration-unrelated"},
        ).one()
    engine.dispose()

    assert unrelated == ("preserve me", 9)
