from __future__ import annotations

import logging
import re
import time
from collections.abc import Awaitable, Callable
from typing import Any
from uuid import uuid4

from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.logging import correlation_id_context


_VALID_CORRELATION_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$")


def normalized_correlation_id(candidate: str | None) -> str:
    if candidate and _VALID_CORRELATION_ID.fullmatch(candidate):
        return candidate
    return str(uuid4())


class RequestContextMiddleware:
    """Bound request bodies and attach a safe correlation ID to every response."""

    def __init__(
        self,
        app: ASGIApp,
        *,
        max_body_bytes: int,
        logger: logging.Logger,
    ) -> None:
        self.app = app
        self.max_body_bytes = max_body_bytes
        self.logger = logger

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        headers = {
            key.lower(): value
            for key, value in scope.get("headers", [])
        }
        raw_candidate = headers.get(b"x-correlation-id", b"").decode(
            "ascii", errors="ignore"
        )
        correlation_id = normalized_correlation_id(raw_candidate)
        token = correlation_id_context.set(correlation_id)
        started = time.monotonic()

        async def send_with_correlation(message: Message) -> None:
            if message["type"] == "http.response.start":
                response_headers = [
                    (key, value)
                    for key, value in message.get("headers", [])
                    if key.lower() != b"x-correlation-id"
                ]
                response_headers.append(
                    (b"x-correlation-id", correlation_id.encode("ascii"))
                )
                message["headers"] = response_headers
            await send(message)

        try:
            content_length = self._content_length(headers)
            if content_length is not None and content_length > self.max_body_bytes:
                await self._too_large(scope, receive, send_with_correlation)
                return

            body = bytearray()
            more_body = True
            while more_body:
                message = await receive()
                if message["type"] == "http.disconnect":
                    return
                chunk = message.get("body", b"")
                body.extend(chunk)
                if len(body) > self.max_body_bytes:
                    await self._too_large(scope, receive, send_with_correlation)
                    return
                more_body = message.get("more_body", False)

            delivered = False

            async def replay_receive() -> Message:
                nonlocal delivered
                if delivered:
                    return {"type": "http.request", "body": b"", "more_body": False}
                delivered = True
                return {
                    "type": "http.request",
                    "body": bytes(body),
                    "more_body": False,
                }

            await self.app(scope, replay_receive, send_with_correlation)
        finally:
            duration_ms = round((time.monotonic() - started) * 1000, 2)
            self.logger.info(
                "request completed",
                extra={
                    "event": "request_completed",
                    "method": scope.get("method"),
                    "path": scope.get("path"),
                    "duration_ms": duration_ms,
                },
            )
            correlation_id_context.reset(token)

    @staticmethod
    def _content_length(headers: dict[bytes, bytes]) -> int | None:
        raw = headers.get(b"content-length")
        if raw is None:
            return None
        try:
            length = int(raw)
        except ValueError:
            return None
        return max(length, 0)

    @staticmethod
    async def _too_large(scope: Scope, receive: Receive, send: Send) -> None:
        response = JSONResponse(
            status_code=413,
            content={
                "code": "request_too_large",
                "message": "Request body exceeds the configured limit.",
            },
        )
        await response(scope, receive, send)

