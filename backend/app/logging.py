from __future__ import annotations

import json
import logging
import re
from contextvars import ContextVar
from datetime import UTC, datetime
from typing import Any


correlation_id_context: ContextVar[str | None] = ContextVar(
    "correlation_id", default=None
)

_SENSITIVE_KEYS = (
    "authorization",
    "cookie",
    "database_url",
    "password",
    "secret",
    "token",
)
_DATABASE_URL = re.compile(
    r"(?i)(?:postgres(?:ql)?(?:\+[a-z0-9_]+)?://)[^\s\"']+"
)
_BEARER_TOKEN = re.compile(r"(?i)\bbearer\s+[A-Za-z0-9._~+/=-]+")


def redact(value: Any, *, key: str | None = None) -> Any:
    if key and any(marker in key.lower() for marker in _SENSITIVE_KEYS):
        return "[REDACTED]"
    if isinstance(value, dict):
        return {item_key: redact(item, key=str(item_key)) for item_key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [redact(item) for item in value]
    if isinstance(value, str):
        value = _DATABASE_URL.sub("[REDACTED_DATABASE_URL]", value)
        return _BEARER_TOKEN.sub("Bearer [REDACTED]", value)
    return value


class JsonFormatter(logging.Formatter):
    """Small JSON formatter that redacts both messages and structured fields."""

    _standard_fields = set(logging.makeLogRecord({}).__dict__)

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.now(UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        correlation_id = getattr(record, "correlation_id", None) or correlation_id_context.get()
        if correlation_id:
            payload["correlation_id"] = correlation_id
        for key, value in record.__dict__.items():
            if key not in self._standard_fields and key not in {
                "message",
                "asctime",
                "correlation_id",
            }:
                payload[key] = value
        if record.exc_info:
            payload["error_type"] = record.exc_info[0].__name__
        return json.dumps(redact(payload), separators=(",", ":"), default=str)


def configure_logging(level: str) -> logging.Logger:
    logger = logging.getLogger("oncoready")
    logger.setLevel(level)
    logger.propagate = False
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(JsonFormatter())
        logger.addHandler(handler)
    else:
        for handler in logger.handlers:
            handler.setFormatter(JsonFormatter())
    return logger

