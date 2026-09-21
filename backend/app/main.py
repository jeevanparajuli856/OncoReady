from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import Settings
from app.database import Database
from app.logging import configure_logging
from app.middleware import RequestContextMiddleware
from app.repositories import FoundationProofRepository, get_proof_repository
from app.schemas import (
    ErrorResponse,
    FoundationProof,
    FoundationProofUpdate,
    FoundationResetResponse,
    HealthResponse,
    ReadinessResponse,
    ValidationErrorResponse,
    VersionResponse,
)
from app.security import require_operator
from app.services import ReadinessService, get_readiness_service
from app.web import ApiError


logger = logging.getLogger("oncoready.api")


def create_app(settings: Settings | None = None) -> FastAPI:
    runtime_settings = settings or Settings()
    configure_logging(runtime_settings.log_level)

    @asynccontextmanager
    async def lifespan(application: FastAPI) -> AsyncIterator[None]:
        application.state.settings = runtime_settings
        application.state.database = Database(runtime_settings)
        if runtime_settings.missing_required_settings:
            logger.warning(
                "runtime started with missing required settings",
                extra={
                    "event": "startup_configuration_incomplete",
                    "setting_names": runtime_settings.missing_required_settings,
                },
            )
        try:
            yield
        finally:
            application.state.database.dispose()

    application = FastAPI(
        title="OncoReady API",
        version=runtime_settings.application_version,
        lifespan=lifespan,
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=runtime_settings.cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Correlation-ID"],
        expose_headers=["X-Correlation-ID"],
    )
    application.add_middleware(
        RequestContextMiddleware,
        max_body_bytes=runtime_settings.max_request_body_bytes,
        logger=logger,
    )

    @application.exception_handler(ApiError)
    async def api_error_handler(_: Request, error: ApiError) -> JSONResponse:
        return JSONResponse(
            status_code=error.status_code,
            content={"code": error.code, "message": error.message},
            headers=error.headers,
        )

    @application.exception_handler(RequestValidationError)
    async def validation_error_handler(
        _: Request, error: RequestValidationError
    ) -> JSONResponse:
        errors = [
            {
                "location": list(item["loc"]),
                "message": item["msg"],
                "type": item["type"],
            }
            for item in error.errors()
        ]
        payload = ValidationErrorResponse(
            code="validation_error",
            message="Request validation failed.",
            errors=errors,
        )
        return JSONResponse(status_code=422, content=payload.model_dump(mode="json"))

    @application.exception_handler(Exception)
    async def generic_error_handler(_: Request, error: Exception) -> JSONResponse:
        logger.error(
            "unhandled request failure",
            extra={"event": "unhandled_request_failure", "error_type": type(error).__name__},
        )
        return JSONResponse(
            status_code=500,
            content={
                "code": "internal_error",
                "message": "An internal error occurred.",
            },
        )

    @application.get(
        "/health",
        response_model=HealthResponse,
        operation_id="getHealth",
        tags=["Platform"],
    )
    def get_health() -> HealthResponse:
        return HealthResponse(status="alive")

    @application.get(
        "/ready",
        response_model=ReadinessResponse,
        responses={503: {"model": ReadinessResponse}},
        operation_id="getReadiness",
        tags=["Platform"],
    )
    def get_readiness(
        response: Response,
        service: ReadinessService = Depends(get_readiness_service),
    ) -> dict[str, str]:
        result = service.check()
        if result["status"] != "ready":
            response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return result

    @application.get(
        "/version",
        response_model=VersionResponse,
        operation_id="getVersion",
        tags=["Platform"],
    )
    def get_version(request: Request) -> VersionResponse:
        current: Settings = request.app.state.settings
        return VersionResponse(
            application="oncoready-api",
            version=current.application_version,
            build=current.build_id,
        )

    @application.get(
        "/api/v1/foundation/proof",
        response_model=FoundationProof,
        responses={404: {"model": ErrorResponse}},
        operation_id="getFoundationProof",
        tags=["Foundation"],
    )
    def get_foundation_proof(
        repository: FoundationProofRepository = Depends(get_proof_repository),
    ):
        proof = repository.get()
        if proof is None:
            raise ApiError(404, "proof_not_found", "Foundation proof not found.")
        return proof

    @application.put(
        "/api/v1/foundation/proof",
        response_model=FoundationProof,
        dependencies=[Depends(require_operator)],
        responses={
            401: {"model": ErrorResponse},
            413: {"model": ErrorResponse},
            422: {"model": ValidationErrorResponse},
        },
        operation_id="putFoundationProof",
        tags=["Foundation"],
    )
    def put_foundation_proof(
        update: FoundationProofUpdate,
        repository: FoundationProofRepository = Depends(get_proof_repository),
    ):
        return repository.put(update.value)

    @application.post(
        "/api/v1/operator/reset",
        response_model=FoundationResetResponse,
        dependencies=[Depends(require_operator)],
        responses={401: {"model": ErrorResponse}, 403: {"model": ErrorResponse}},
        operation_id="resetFoundationSeed",
        tags=["Operator"],
    )
    def reset_foundation_seed(
        request: Request,
        repository: FoundationProofRepository = Depends(get_proof_repository),
    ) -> FoundationResetResponse:
        if not request.app.state.settings.reset_enabled:
            raise ApiError(
                403,
                "reset_disabled",
                "Operator reset is disabled in this environment.",
            )
        return FoundationResetResponse(status="reset", proof=repository.reset())

    return application


app = create_app()
