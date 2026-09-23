from __future__ import annotations

import json
from typing import Annotated, Any
from urllib.parse import urlsplit

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    """Environment-backed runtime configuration with secret-safe values."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="",
        case_sensitive=False,
        extra="ignore",
    )

    database_url: SecretStr | None = None
    operator_token: SecretStr | None = None
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: [
            "http://localhost:4173",
            "http://localhost:5173",
        ]
    )
    reset_enabled: bool = False
    max_request_body_bytes: int = Field(default=16_384, ge=1_024, le=1_048_576)
    database_check_timeout_seconds: float = Field(default=3.0, ge=1.0, le=10.0)
    application_version: str = Field(default="0.1.0", min_length=1, max_length=64)
    build_id: str = Field(default="development", min_length=1, max_length=128)
    log_level: str = "INFO"
    port: int = Field(default=8000, ge=1, le=65_535)
    outreach_enabled: bool = False
    outreach_consent_confirmed: bool = False
    outreach_recipient: str | None = None
    outreach_arm_minutes: int = Field(default=30, ge=1, le=60)
    twilio_account_sid: str | None = None
    twilio_auth_token: SecretStr | None = None
    twilio_from_number: str | None = None
    elevenlabs_api_key: SecretStr | None = None
    elevenlabs_agent_id: str | None = None
    elevenlabs_phone_number_id: str | None = None
    # Transport provider credentials. Absent means that adapter reports
    # `configured = False` and is skipped in the fallback chain.
    uber_health_access_token: SecretStr | None = None
    lyft_concierge_access_token: SecretStr | None = None
    carelink_nemt_client_cert_path: str | None = None

    @field_validator("database_url", "operator_token", mode="before")
    @classmethod
    def empty_secret_is_missing(cls, value: Any) -> Any:
        if isinstance(value, str) and not value.strip():
            return None
        return value

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_origins(cls, value: Any) -> Any:
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                return []
            if stripped.startswith("["):
                value = json.loads(stripped)
            else:
                value = [item.strip() for item in stripped.split(",") if item.strip()]
        return value

    @field_validator("cors_origins")
    @classmethod
    def require_exact_http_origins(cls, origins: list[str]) -> list[str]:
        unique_origins: list[str] = []
        for origin in origins:
            parsed = urlsplit(origin)
            if (
                origin == "*"
                or "*" in origin
                or parsed.scheme not in {"http", "https"}
                or not parsed.netloc
                or parsed.username is not None
                or parsed.password is not None
                or parsed.path
                or parsed.query
                or parsed.fragment
            ):
                raise ValueError("CORS origins must be exact HTTP(S) origins")
            if origin not in unique_origins:
                unique_origins.append(origin)
        return unique_origins

    @field_validator("log_level")
    @classmethod
    def normalize_log_level(cls, value: str) -> str:
        normalized = value.upper()
        if normalized not in {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}:
            raise ValueError("LOG_LEVEL must be a standard logging level")
        return normalized

    @property
    def missing_required_settings(self) -> tuple[str, ...]:
        missing: list[str] = []
        if not self.cors_origins:
            missing.append("CORS_ORIGINS")
        if self.database_url is None:
            missing.append("DATABASE_URL")
        if self.operator_token is None:
            missing.append("OPERATOR_TOKEN")
        return tuple(sorted(missing))

    @property
    def outreach_ready(self) -> bool:
        return bool(
            self.outreach_enabled
            and self.outreach_consent_confirmed
            and self.operator_token
            and self.database_url
            and self.outreach_recipient
            and self.outreach_recipient.startswith("+")
            and self.outreach_recipient[1:].isdigit()
            and self.twilio_account_sid
            and self.twilio_auth_token
            and self.twilio_from_number
            and self.elevenlabs_api_key
            and self.elevenlabs_agent_id
            and self.elevenlabs_phone_number_id
        )
