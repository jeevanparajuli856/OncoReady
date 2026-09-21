from __future__ import annotations

from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints


class BoundaryModel(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)


class HealthResponse(BoundaryModel):
    status: Literal["alive"]


class ReadinessResponse(BoundaryModel):
    status: Literal["ready", "unavailable"]
    database: Literal["ready", "unavailable"]
    migration: Literal["current", "unavailable", "mismatch"]


class VersionResponse(BoundaryModel):
    application: Literal["oncoready-api"]
    version: Annotated[str, StringConstraints(min_length=1, max_length=64)]
    build: Annotated[str, StringConstraints(min_length=1, max_length=128)]


class FoundationProof(BoundaryModel):
    model_config = ConfigDict(
        extra="forbid", populate_by_name=True, from_attributes=True
    )

    key: Literal["railway-foundation"]
    value: Annotated[str, StringConstraints(min_length=1, max_length=256)]
    seed_version: int = Field(alias="seedVersion", ge=1)
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class FoundationProofUpdate(BoundaryModel):
    value: Annotated[
        str,
        StringConstraints(strip_whitespace=True, min_length=1, max_length=256),
    ]


class FoundationResetResponse(BoundaryModel):
    status: Literal["reset"]
    proof: FoundationProof


class ErrorResponse(BoundaryModel):
    code: Annotated[str, StringConstraints(min_length=1, max_length=64)]
    message: Annotated[str, StringConstraints(min_length=1, max_length=256)]


class ValidationErrorItem(BoundaryModel):
    location: list[str | int]
    message: str
    type: str


class ValidationErrorResponse(ErrorResponse):
    code: Literal["validation_error"]
    errors: list[ValidationErrorItem]

