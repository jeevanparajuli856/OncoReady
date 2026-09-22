from fastapi.testclient import TestClient

from app import outreach
from app.config import Settings
from app.database import get_session
from app.main import create_app


def test_outreach_requires_operator_before_database_or_provider() -> None:
    app = create_app(Settings(operator_token="test-operator", outreach_enabled=True))
    with TestClient(app) as client:
        for path in ("status", "arm", "sms", "call"):
            response = client.request(
                "GET" if path == "status" else "POST",
                f"/api/v1/operator/outreach/{path}",
            )
            assert response.status_code == 401
            assert response.json()["code"] == "unauthorized"


def test_outreach_fails_closed_when_consent_or_provider_setup_is_missing() -> None:
    app = create_app(Settings(operator_token="test-operator", outreach_enabled=True))
    app.dependency_overrides[get_session] = lambda: None
    with TestClient(app) as client:
        for path in ("arm", "sms", "call"):
            response = client.post(
                f"/api/v1/operator/outreach/{path}",
                headers={"Authorization": "Bearer test-operator"},
                json={"to": "+15555550123", "body": "arbitrary"},
            )
            assert response.status_code == 503
            assert response.json()["code"] == "outreach_unavailable"


def test_browser_payload_cannot_change_sms_recipient_or_content(monkeypatch) -> None:
    settings = Settings(
        operator_token="test-operator",
        database_url="postgresql://test:test@localhost/oncoready_test",
        outreach_enabled=True,
        outreach_consent_confirmed=True,
        outreach_recipient="+15555550123",
        twilio_account_sid="AC" + "1" * 32,
        twilio_auth_token="test-secret",
        twilio_from_number="+15555550124",
        elevenlabs_api_key="test-key",
        elevenlabs_agent_id="test-agent",
        elevenlabs_phone_number_id="test-phone",
    )
    app = create_app(settings)

    class FakeSession:
        def commit(self) -> None:
            pass

    class FakeAttempt:
        status = "initiating"
        provider_sid = None

    attempt = FakeAttempt()
    sent: dict = {}

    class FakeResponse:
        def raise_for_status(self) -> None:
            pass

        def json(self) -> dict:
            return {"sid": "SM" + "2" * 32}

    def fake_post(url: str, **kwargs):
        sent.update(kwargs["data"])
        return FakeResponse()

    app.dependency_overrides[get_session] = FakeSession
    monkeypatch.setattr(outreach, "_reserve", lambda session, kind: attempt)
    monkeypatch.setattr(outreach, "_summary", lambda session, current_settings: {"sms": attempt.status})
    monkeypatch.setattr(outreach.httpx, "post", fake_post)
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/operator/outreach/sms",
            headers={"Authorization": "Bearer test-operator"},
            json={"to": "+15555550999", "body": "Unreviewed clinical content"},
        )

    assert response.status_code == 200
    assert sent["To"] == "+15555550123"
    assert sent["Body"] == outreach.SMS_TEXT
    assert "Unreviewed clinical content" not in sent.values()
