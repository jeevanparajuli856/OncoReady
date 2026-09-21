from __future__ import annotations

import json
import logging

import pytest
from pydantic import ValidationError

from app.config import Settings
from app.logging import JsonFormatter, redact


def test_settings_parse_comma_separated_exact_origins(monkeypatch) -> None:
    monkeypatch.setenv("CORS_ORIGINS", "https://app.example.test,http://localhost:5173")

    settings = Settings(_env_file=None)

    assert settings.cors_origins == [
        "https://app.example.test",
        "http://localhost:5173",
    ]


@pytest.mark.parametrize(
    "origins",
    [
        ["*"],
        ["https://*.example.test"],
        ["https://app.example.test/path"],
        ["https://app.example.test?query=true"],
    ],
)
def test_settings_reject_non_exact_origins(origins) -> None:
    with pytest.raises(ValidationError):
        Settings(_env_file=None, cors_origins=origins)


def test_missing_required_settings_are_named_without_values() -> None:
    settings = Settings(_env_file=None, cors_origins=[])

    assert settings.missing_required_settings == (
        "CORS_ORIGINS",
        "DATABASE_URL",
        "OPERATOR_TOKEN",
    )


def test_redaction_removes_nested_secrets_and_connection_strings() -> None:
    payload = {
        "authorization": "Bearer private-token",
        "nested": {"database_url": "postgresql://user:password@host/database"},
        "message": "connect postgresql://user:password@host/database failed",
        "safe": "kept",
    }

    redacted = redact(payload)

    assert redacted["authorization"] == "[REDACTED]"
    assert redacted["nested"]["database_url"] == "[REDACTED]"
    assert "password" not in redacted["message"]
    assert redacted["safe"] == "kept"


def test_json_formatter_emits_structured_redacted_record() -> None:
    formatter = JsonFormatter()
    record = logging.LogRecord(
        "oncoready.test",
        logging.INFO,
        __file__,
        1,
        "database failure postgresql://user:password@host/database",
        (),
        None,
    )
    record.correlation_id = "test-correlation"

    output = json.loads(formatter.format(record))

    assert output["level"] == "INFO"
    assert output["logger"] == "oncoready.test"
    assert output["correlation_id"] == "test-correlation"
    assert "password" not in output["message"]

