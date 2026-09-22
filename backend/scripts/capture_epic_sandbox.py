from __future__ import annotations

import argparse
import os
import sys
from collections.abc import Mapping, Sequence
from datetime import UTC, datetime
from pathlib import Path

from app.epic_capture import (
    EPIC_SANDBOX_FHIR_BASE_URL,
    TOKEN_ENVIRONMENT_VARIABLE,
    CaptureConfig,
    CaptureError,
    CaptureReview,
    CaptureTransport,
    StdlibJsonTransport,
    capture_epic_sandbox,
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Privately stage a reviewed, read-only Epic Sandbox FHIR capture. "
            f"The access token is read only from {TOKEN_ENVIRONMENT_VARIABLE}."
        )
    )
    parser.add_argument("--patient-id", required=True)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument(
        "--resource-types",
        nargs="*",
        choices=("Appointment", "MedicationRequest", "Observation"),
        default=("Appointment", "MedicationRequest", "Observation"),
    )
    parser.add_argument("--max-pages", type=int, default=4)
    parser.add_argument("--max-resources", type=int, default=20)
    parser.add_argument(
        "--review-status",
        required=True,
        choices=("approved_for_frontend",),
    )
    parser.add_argument("--reviewed-at", required=True, type=_parse_datetime)
    parser.add_argument("--reviewed-by", required=True)
    parser.add_argument(
        "--distribution",
        required=True,
        choices=("reviewed_epic_sandbox_test_data",),
    )
    return parser


def main(
    argv: Sequence[str] | None = None,
    *,
    environ: Mapping[str, str] | None = None,
    transport: CaptureTransport | None = None,
    captured_at: datetime | None = None,
) -> int:
    arguments = list(argv if argv is not None else sys.argv[1:])
    if _contains_token_argument(arguments):
        print(
            f"Access tokens are accepted only through {TOKEN_ENVIRONMENT_VARIABLE}.",
            file=sys.stderr,
        )
        return 2
    parser = build_parser()
    try:
        args = parser.parse_args(arguments)
        output_directory = _private_staging_directory(args.output_dir)
        review = CaptureReview(
            status=args.review_status,
            reviewed_at=args.reviewed_at,
            reviewed_by=args.reviewed_by,
            distribution=args.distribution,
        )
        config = CaptureConfig(
            base_url=EPIC_SANDBOX_FHIR_BASE_URL,
            patient_id=args.patient_id,
            output_directory=output_directory,
            resource_types=tuple(args.resource_types),
            max_pages=args.max_pages,
            max_resources=args.max_resources,
        )
    except (CaptureError, ValueError) as error:
        print(f"Capture configuration rejected: {error}", file=sys.stderr)
        return 2

    environment = os.environ if environ is None else environ
    token = environment.get(TOKEN_ENVIRONMENT_VARIABLE)
    try:
        manifest = capture_epic_sandbox(
            config=config,
            transport=transport or StdlibJsonTransport(),
            access_token=token,
            captured_at=captured_at or datetime.now(UTC),
            review=review,
        )
    except CaptureError as error:
        print(f"Capture failed: {error}", file=sys.stderr)
        return 1

    print(f"Capture staged privately at {output_directory}")
    print(f"Capture ID: {manifest['captureId']}")
    return 0


def _parse_datetime(value: str) -> datetime:
    normalized = value[:-1] + "+00:00" if value.endswith("Z") else value
    try:
        parsed = datetime.fromisoformat(normalized)
    except ValueError as error:
        raise argparse.ArgumentTypeError(
            "reviewed-at must be an ISO 8601 timestamp with timezone"
        ) from error
    if parsed.tzinfo is None:
        raise argparse.ArgumentTypeError(
            "reviewed-at must be an ISO 8601 timestamp with timezone"
        )
    return parsed


def _contains_token_argument(arguments: Sequence[str]) -> bool:
    forbidden_names = {
        "--access-token",
        "--authorization",
        "--client-secret",
        "--token",
    }
    return any(
        argument in forbidden_names
        or any(argument.startswith(f"{name}=") for name in forbidden_names)
        for argument in arguments
    )


def _private_staging_directory(output_directory: Path) -> Path:
    resolved = output_directory.expanduser().resolve()
    repository_root = Path(__file__).resolve().parents[2]
    if resolved == repository_root or resolved.is_relative_to(repository_root):
        raise CaptureError(
            "output-dir must be a private staging path outside the repository"
        )
    return resolved


if __name__ == "__main__":
    raise SystemExit(main())
