from __future__ import annotations

from typing import Any

from fastapi import Request


class ApiError(Exception):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        *,
        headers: dict[str, str] | None = None,
    ) -> None:
        super().__init__(code)
        self.status_code = status_code
        self.code = code
        self.message = message
        self.headers = headers


def runtime_settings(request: Request) -> Any:
    return request.app.state.settings

