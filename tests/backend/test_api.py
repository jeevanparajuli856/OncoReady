from __future__ import annotations

from uuid import UUID

from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app
from app.repositories import get_proof_repository
from app.services import get_readiness_service

from conftest import FakeProofRepository, FakeReadinessService, proof_record


def test_health_is_database_independent(client, fake_readiness) -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "alive"}
    assert fake_readiness.calls == 0


def test_version_exposes_only_build_evidence(client) -> None:
    response = client.get("/version")

    assert response.status_code == 200
    assert response.json() == {
        "application": "oncoready-api",
        "version": "0.1.0-test",
        "build": "test-build",
    }
    assert "secret" not in response.text


def test_valid_correlation_id_is_echoed(client) -> None:
    response = client.get("/health", headers={"X-Correlation-ID": "rail-test_123"})

    assert response.headers["x-correlation-id"] == "rail-test_123"


def test_invalid_correlation_id_is_replaced(client) -> None:
    response = client.get("/health", headers={"X-Correlation-ID": "bad id\nvalue"})

    assert UUID(response.headers["x-correlation-id"])


def test_cors_allows_only_an_exact_configured_origin(client) -> None:
    allowed = client.options(
        "/api/v1/foundation/proof",
        headers={
            "Origin": "https://web.example.test",
            "Access-Control-Request-Method": "PUT",
            "Access-Control-Request-Headers": "authorization,content-type",
        },
    )
    denied = client.options(
        "/api/v1/foundation/proof",
        headers={
            "Origin": "https://web.example.test.attacker.invalid",
            "Access-Control-Request-Method": "PUT",
        },
    )

    assert allowed.status_code == 200
    assert allowed.headers["access-control-allow-origin"] == "https://web.example.test"
    assert allowed.headers.get("access-control-allow-credentials") != "true"
    assert "access-control-allow-origin" not in denied.headers


def test_readiness_returns_service_state_and_status(client, fake_readiness) -> None:
    ready = client.get("/ready")
    fake_readiness.result = {
        "status": "unavailable",
        "database": "unavailable",
        "migration": "unavailable",
    }
    unavailable = client.get("/ready")

    assert ready.status_code == 200
    assert ready.json()["migration"] == "current"
    assert unavailable.status_code == 503
    assert unavailable.json() == fake_readiness.result


def test_get_foundation_proof_returns_404_until_seed_exists(client) -> None:
    response = client.get("/api/v1/foundation/proof")

    assert response.status_code == 404
    assert response.json() == {
        "code": "proof_not_found",
        "message": "Foundation proof not found.",
    }


def test_get_foundation_proof_uses_contract_field_names(client, fake_repository) -> None:
    fake_repository.proof = proof_record()

    response = client.get("/api/v1/foundation/proof")

    assert response.status_code == 200
    assert response.json() == {
        "key": "railway-foundation",
        "value": "Railway PostgreSQL connected",
        "seedVersion": 1,
        "createdAt": "2026-09-21T12:00:00Z",
        "updatedAt": "2026-09-21T12:00:00Z",
    }


def test_proof_write_requires_exact_bearer_token(client) -> None:
    missing = client.put("/api/v1/foundation/proof", json={"value": "updated"})
    wrong = client.put(
        "/api/v1/foundation/proof",
        json={"value": "updated"},
        headers={"Authorization": "Bearer wrong-token"},
    )

    for response in (missing, wrong):
        assert response.status_code == 401
        assert response.json()["code"] == "unauthorized"
        assert response.headers["www-authenticate"] == "Bearer"


def test_authorized_proof_write_persists_validated_value(client, fake_repository) -> None:
    response = client.put(
        "/api/v1/foundation/proof",
        json={"value": "persistent value"},
        headers={"Authorization": "Bearer operator-test-token-with-enough-entropy"},
    )

    assert response.status_code == 200
    assert response.json()["value"] == "persistent value"
    assert fake_repository.proof.value == "persistent value"


def test_proof_write_rejects_unknown_or_empty_fields(client) -> None:
    headers = {"Authorization": "Bearer operator-test-token-with-enough-entropy"}

    empty = client.put("/api/v1/foundation/proof", json={"value": "   "}, headers=headers)
    extra = client.put(
        "/api/v1/foundation/proof",
        json={"value": "valid", "unexpected": "secret-content"},
        headers=headers,
    )

    for response in (empty, extra):
        assert response.status_code == 422
        body = response.json()
        assert body["code"] == "validation_error"
        assert body["message"] == "Request validation failed."
        assert body["errors"]
        assert "secret-content" not in response.text


def test_request_body_limit_returns_contract_error(client) -> None:
    response = client.put(
        "/api/v1/foundation/proof",
        content=b'{"value":"' + (b"x" * 1_100) + b'"}',
        headers={
            "Authorization": "Bearer operator-test-token-with-enough-entropy",
            "Content-Type": "application/json",
        },
    )

    assert response.status_code == 413
    assert response.json() == {
        "code": "request_too_large",
        "message": "Request body exceeds the configured limit.",
    }
    assert response.headers["x-correlation-id"]


def test_reset_requires_bearer_and_explicit_enablement(settings, fake_repository) -> None:
    disabled = settings.model_copy(update={"reset_enabled": False})
    app = create_app(disabled)
    app.dependency_overrides[get_proof_repository] = lambda: fake_repository
    app.dependency_overrides[get_readiness_service] = lambda: FakeReadinessService()

    with TestClient(app, raise_server_exceptions=False) as client:
        unauthorized = client.post("/api/v1/operator/reset")
        forbidden = client.post(
            "/api/v1/operator/reset",
            headers={"Authorization": "Bearer operator-test-token-with-enough-entropy"},
        )

    assert unauthorized.status_code == 401
    assert forbidden.status_code == 403
    assert forbidden.json()["code"] == "reset_disabled"
    assert fake_repository.reset_calls == 0


def test_enabled_reset_returns_only_the_stable_seed(client, fake_repository) -> None:
    response = client.post(
        "/api/v1/operator/reset",
        headers={"Authorization": "Bearer operator-test-token-with-enough-entropy"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "reset"
    assert response.json()["proof"]["key"] == "railway-foundation"
    assert fake_repository.reset_calls == 1


def test_internal_errors_are_generic_and_do_not_leak_details(client, fake_repository) -> None:
    fake_repository.failure = RuntimeError(
        "postgresql://user:password@db.internal/prod operator-test-token-with-enough-entropy"
    )

    response = client.get("/api/v1/foundation/proof")

    assert response.status_code == 500
    assert response.json() == {
        "code": "internal_error",
        "message": "An internal error occurred.",
    }
    assert "password" not in response.text
    assert "operator-test" not in response.text
