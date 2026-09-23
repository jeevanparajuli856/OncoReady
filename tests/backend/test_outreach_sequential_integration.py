"""No-network tests of durable, sequential calls against a disposable PostgreSQL DB."""

from __future__ import annotations

import os
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from threading import Barrier, Lock
from time import sleep

import httpx
import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text

from app import outreach
from app.config import Settings
from app.main import create_app
from app.testing import validate_test_database_url


pytestmark = pytest.mark.integration
HEADERS = {"Authorization": "Bearer integration-operator-token-with-enough-entropy"}


def _arm_call(client: TestClient, purpose: str = "test"):
    return client.post(
        "/api/v1/operator/outreach/call/arm",
        headers=HEADERS,
        json={"purpose": purpose, "consent_confirmed": True},
    )


@pytest.fixture(scope="module")
def test_database_url() -> str:
    return validate_test_database_url(os.getenv("TEST_DATABASE_URL"), os.getenv("DATABASE_URL"))


@pytest.fixture(scope="module", autouse=True)
def migrated_database(test_database_url: str):
    backend_dir = Path(__file__).resolve().parents[2] / "backend"
    config = Config(str(backend_dir / "alembic" / "alembic.ini"))
    config.set_main_option("script_location", str(backend_dir / "alembic"))
    engine = create_engine(test_database_url)
    with engine.begin() as connection:
        config.attributes["connection"] = connection
        command.upgrade(config, "head")
    yield
    engine.dispose()


@pytest.fixture(autouse=True)
def clean_call_ledger(test_database_url: str):
    engine = create_engine(test_database_url)
    with engine.begin() as connection:
        connection.execute(text("DELETE FROM outreach_call_attempts"))
        connection.execute(text("DELETE FROM outreach_call_windows"))
    yield
    with engine.begin() as connection:
        connection.execute(text("DELETE FROM outreach_call_attempts"))
        connection.execute(text("DELETE FROM outreach_call_windows"))
    engine.dispose()


def _settings(database_url: str, limit: int = 4) -> Settings:
    return Settings(
        _env_file=None,
        database_url=database_url,
        operator_token="integration-operator-token-with-enough-entropy",
        outreach_enabled=True,
        outreach_consent_confirmed=True,
        outreach_recipient="+15555550123",
        twilio_account_sid="AC" + "1" * 32,
        twilio_auth_token="test-secret",
        twilio_from_number="+15555550124",
        elevenlabs_api_key="test-key",
        elevenlabs_agent_id="test-agent",
        elevenlabs_phone_number_id="test-phone",
        outreach_daily_call_limit=limit,
    )


class FakeResponse:
    def __init__(self, payload: dict):
        self.payload = payload

    def raise_for_status(self) -> None:
        pass

    def json(self) -> dict:
        return self.payload


def test_completed_test_call_allows_new_demo_call_without_erasing_history(
    test_database_url: str, monkeypatch
) -> None:
    calls = []
    provider = {"status": "ringing"}

    def fake_post(url: str, **kwargs):
        calls.append(url)
        return FakeResponse({"success": True, "callSid": "CA" + str(len(calls)) * 32})

    monkeypatch.setattr(outreach.httpx, "post", fake_post)
    monkeypatch.setattr(outreach.httpx, "get", lambda *args, **kwargs: FakeResponse(provider))
    app = create_app(_settings(test_database_url))
    with TestClient(app) as first_device, TestClient(app) as second_device:
        assert _arm_call(first_device).status_code == 200
        first = first_device.post("/api/v1/operator/outreach/call", headers=HEADERS)
        assert first.status_code == 200
        assert first.json()["call"] == "initiating"

        # A second device sees the same active call and cannot dispatch another.
        assert _arm_call(second_device).status_code == 409
        assert second_device.post("/api/v1/operator/outreach/call", headers=HEADERS).status_code == 403
        assert len(calls) == 1

        provider["status"] = "completed"
        finished = second_device.get("/api/v1/operator/outreach/status", headers=HEADERS)
        assert finished.json()["call"] == "completed"
        assert finished.json()["call_can_arm"] is True
        assert _arm_call(second_device, purpose="demo").status_code == 200
        assert second_device.post("/api/v1/operator/outreach/call", headers=HEADERS).status_code == 200
        assert len(calls) == 2

    engine = create_engine(test_database_url)
    with engine.connect() as connection:
        assert connection.scalar(text("SELECT count(*) FROM outreach_call_attempts")) == 2
        assert connection.scalar(text("SELECT count(DISTINCT window_id) FROM outreach_call_attempts")) == 2
        purposes = connection.execute(text("SELECT purpose FROM outreach_call_windows ORDER BY id")).scalars().all()
        assert purposes == ["test", "demo"]
    engine.dispose()


def test_unknown_call_blocks_another_window_and_provider_request(
    test_database_url: str, monkeypatch
) -> None:
    requests = []

    def fake_post(url: str, **kwargs):
        requests.append(url)
        raise httpx.TimeoutException("provider timeout")

    monkeypatch.setattr(outreach.httpx, "post", fake_post)
    app = create_app(_settings(test_database_url))
    with TestClient(app) as client:
        assert _arm_call(client).status_code == 200
        first = client.post("/api/v1/operator/outreach/call", headers=HEADERS)
        assert first.status_code == 200
        assert first.json()["call"] == "unknown"
        assert first.json()["call_can_arm"] is False
        assert _arm_call(client).status_code == 409
        assert client.post("/api/v1/operator/outreach/call", headers=HEADERS).status_code == 403
    assert len(requests) == 1


def test_confirmed_call_obeys_daily_limit(test_database_url: str, monkeypatch) -> None:
    monkeypatch.setattr(outreach.httpx, "post", lambda *args, **kwargs: FakeResponse({
        "success": True, "callSid": "CA" + "1" * 32,
    }))
    monkeypatch.setattr(outreach.httpx, "get", lambda *args, **kwargs: FakeResponse({"status": "no-answer"}))
    app = create_app(_settings(test_database_url, limit=1))
    with TestClient(app) as client:
        assert _arm_call(client).status_code == 200
        assert client.post("/api/v1/operator/outreach/call", headers=HEADERS).status_code == 200
        status = client.get("/api/v1/operator/outreach/status", headers=HEADERS).json()
        assert status["call"] == "no_answer"
        assert status["call_can_arm"] is False
        assert _arm_call(client).status_code == 409


def test_call_arm_requires_explicit_current_consent(test_database_url: str) -> None:
    app = create_app(_settings(test_database_url))
    with TestClient(app) as client:
        for payload in (
            {"purpose": "test", "consent_confirmed": False},
            {"purpose": "test"},
            {"purpose": "unexpected", "consent_confirmed": True},
            {"purpose": "test", "consent_confirmed": True, "to_number": "+15555559999"},
        ):
            response = client.post("/api/v1/operator/outreach/call/arm", headers=HEADERS, json=payload)
            assert response.status_code == 422
        status = client.get("/api/v1/operator/outreach/status", headers=HEADERS).json()
        assert status["call_armed"] is False


def test_two_devices_cannot_dispatch_the_same_window_twice(
    test_database_url: str, monkeypatch
) -> None:
    provider_posts = []
    post_lock = Lock()

    def fake_post(url: str, **kwargs):
        with post_lock:
            provider_posts.append(url)
        sleep(0.05)
        return FakeResponse({"success": True, "callSid": "CA" + "3" * 32})

    monkeypatch.setattr(outreach.httpx, "post", fake_post)
    app = create_app(_settings(test_database_url))
    with TestClient(app) as first_device, TestClient(app) as second_device:
        assert _arm_call(first_device).status_code == 200
        barrier = Barrier(2)

        def place_from(device: TestClient) -> int:
            barrier.wait()
            return device.post("/api/v1/operator/outreach/call", headers=HEADERS).status_code

        with ThreadPoolExecutor(max_workers=2) as executor:
            first = executor.submit(place_from, first_device)
            second = executor.submit(place_from, second_device)
            assert sorted((first.result(), second.result())) == [200, 403]
    assert len(provider_posts) == 1


def test_demo_call_button_places_sequential_calls_within_the_daily_limit(
    test_database_url: str, monkeypatch
) -> None:
    calls = []
    provider = {"status": "ringing"}

    def fake_post(url: str, **kwargs):
        calls.append(kwargs["json"]["to_number"])
        return FakeResponse({"success": True, "callSid": "CA" + str(len(calls)) * 32})

    monkeypatch.setattr(outreach.httpx, "post", fake_post)
    monkeypatch.setattr(outreach.httpx, "get", lambda *args, **kwargs: FakeResponse(provider))
    settings = _settings(test_database_url, limit=2).model_copy(update={"demo_call_button": True})
    app = create_app(settings)
    with TestClient(app) as client:
        first = client.post("/api/v1/outreach/demo-call")
        assert first.status_code == 200
        assert first.json()["in_progress"] is True
        # One call at a time: a second click while ringing is refused without a provider request.
        assert client.post("/api/v1/outreach/demo-call").status_code == 409
        assert len(calls) == 1

        provider["status"] = "completed"
        assert client.get("/api/v1/outreach/demo-call").json()["call"] == "completed"
        # Testing earlier does not block the demo: a new call works once the last one finished.
        assert client.post("/api/v1/outreach/demo-call").status_code == 200
        assert len(calls) == 2
        provider["status"] = "completed"
        client.get("/api/v1/outreach/demo-call")
        limited = client.post("/api/v1/outreach/demo-call")
        assert limited.status_code == 409
        assert limited.json()["code"] == "call_limit_reached"

    assert calls == ["+15555550123", "+15555550123"]
