from __future__ import annotations

from hmac import compare_digest

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer


bearer_scheme = HTTPBearer(auto_error=False)


def require_operator(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> None:
    configured = request.app.state.settings.operator_token
    supplied = credentials.credentials if credentials is not None else ""
    expected = configured.get_secret_value() if configured is not None else ""
    scheme_is_bearer = bool(
        credentials and credentials.scheme.lower() == "bearer"
    )
    if not scheme_is_bearer or not expected or not compare_digest(supplied, expected):
        from app.web import ApiError

        raise ApiError(
            401,
            "unauthorized",
            "A valid operator bearer token is required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

