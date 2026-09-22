from __future__ import annotations

import hashlib
import json
import os
import re
import ssl
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Protocol
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qsl, urlencode, urlsplit
from urllib.request import HTTPSHandler, HTTPRedirectHandler, Request, build_opener


EPIC_SANDBOX_FHIR_BASE_URL = (
    "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4"
)
TOKEN_ENVIRONMENT_VARIABLE = "EPIC_SANDBOX_ACCESS_TOKEN"
SEARCH_RESOURCE_TYPES = frozenset(
    {"Appointment", "MedicationRequest", "Observation"}
)
# Observation searches stay category-scoped so a capture can never sweep the
# whole chart. Each configured category is issued as its own bounded search.
OBSERVATION_CATEGORIES = frozenset({"laboratory", "vital-signs"})
# Epic Sandbox emits some opaque ids that are 66 characters long even though
# the nominal FHIR R4 id limit is 64. Keep the character allowlist and a tight
# upper bound while accepting the source system's observed representation.
FHIR_ID_PATTERN = re.compile(r"^[A-Za-z0-9.-]{1,128}$")
MAX_RESPONSE_BYTES = 5 * 1024 * 1024
SEARCH_PAGE_SIZE = 50


class CaptureError(RuntimeError):
    """A safe operator-facing error that contains no response or token data."""


class CaptureTransport(Protocol):
    def request(
        self,
        *,
        method: str,
        url: str,
        headers: dict[str, str],
    ) -> dict[str, Any]: ...


class _NoRedirectHandler(HTTPRedirectHandler):
    def redirect_request(
        self,
        request: Request,
        file_pointer: Any,
        code: int,
        message: str,
        headers: Any,
        new_url: str,
    ) -> None:
        return None


@dataclass(frozen=True)
class CaptureReview:
    status: str
    reviewed_at: datetime
    reviewed_by: str
    distribution: str

    def __post_init__(self) -> None:
        if self.status != "approved_for_frontend":
            raise ValueError("review status must explicitly approve frontend use")
        if self.distribution != "reviewed_epic_sandbox_test_data":
            raise ValueError("review distribution must match the capture contract")
        if self.reviewed_at.tzinfo is None:
            raise ValueError("reviewed_at must include a timezone")
        if not 1 <= len(self.reviewed_by.strip()) <= 120:
            raise ValueError("reviewed_by must contain an operator identity")


@dataclass(frozen=True)
class ScenarioBinding:
    """Binds a capture to a prepared OncoReady scenario alias.

    Roster captures leave this unset: they present the Sandbox identity as it
    was recorded, with no scenario alias attached.
    """

    scenario_id: str
    presentation_alias: str

    def __post_init__(self) -> None:
        if not 1 <= len(self.scenario_id.strip()) <= 64:
            raise ValueError("scenario_id must be a non-empty identifier")
        if not 1 <= len(self.presentation_alias.strip()) <= 120:
            raise ValueError("presentation_alias must be a non-empty name")


LEGACY_SCENARIO_BINDING = ScenarioBinding(
    scenario_id="camila-demo-v2",
    presentation_alias="Camila Lopez",
)


@dataclass(frozen=True)
class CaptureConfig:
    base_url: str
    patient_id: str
    output_directory: Path
    resource_types: tuple[str, ...] = (
        "Appointment",
        "MedicationRequest",
        "Observation",
    )
    max_pages: int = 4
    max_resources: int = 20
    observation_categories: tuple[str, ...] = ("laboratory",)
    page_size: int = SEARCH_PAGE_SIZE
    truncate: bool = False

    def __post_init__(self) -> None:
        if self.base_url != EPIC_SANDBOX_FHIR_BASE_URL:
            raise ValueError("capture is restricted to the Epic Non-Production Sandbox")
        if not FHIR_ID_PATTERN.fullmatch(self.patient_id):
            raise ValueError("patient_id must be a valid FHIR id")
        if not 1 <= self.max_pages <= 6:
            raise ValueError("max_pages must be between 1 and 6")
        if not 1 <= self.max_resources <= 100:
            raise ValueError("max_resources must be between 1 and 100")
        if not 1 <= self.page_size <= SEARCH_PAGE_SIZE:
            raise ValueError(f"page_size must be between 1 and {SEARCH_PAGE_SIZE}")
        if len(set(self.resource_types)) != len(self.resource_types):
            raise ValueError("resource_types must not contain duplicates")
        unsupported = set(self.resource_types) - SEARCH_RESOURCE_TYPES
        if unsupported:
            raise ValueError("resource_types contains a non-allowlisted search type")
        if len(set(self.observation_categories)) != len(self.observation_categories):
            raise ValueError("observation_categories must not contain duplicates")
        if not self.observation_categories:
            raise ValueError("observation_categories must select at least one category")
        if set(self.observation_categories) - OBSERVATION_CATEGORIES:
            raise ValueError(
                "observation_categories contains a non-allowlisted category"
            )
        if 1 + self.max_pages * self.search_plan_count > 20:
            raise ValueError("configured page ceiling exceeds the manifest request limit")
        object.__setattr__(self, "output_directory", Path(self.output_directory))
        object.__setattr__(self, "resource_types", tuple(sorted(self.resource_types)))
        object.__setattr__(
            self, "observation_categories", tuple(sorted(self.observation_categories))
        )

    @property
    def search_plan_count(self) -> int:
        """Number of bounded searches this capture will issue.

        Observation is searched once per configured category so each request
        stays category-scoped; every other type is a single search.
        """

        plans = 0
        for resource_type in self.resource_types:
            if resource_type == "Observation":
                plans += len(set(self.observation_categories))
            else:
                plans += 1
        return plans


class StdlibJsonTransport:
    """Minimal HTTPS JSON transport for the private one-time operator command."""

    def __init__(self, *, timeout_seconds: float = 20.0) -> None:
        self.timeout_seconds = timeout_seconds
        self._ssl_context = ssl.create_default_context()
        self._opener = build_opener(
            HTTPSHandler(context=self._ssl_context),
            _NoRedirectHandler(),
        )

    def request(
        self,
        *,
        method: str,
        url: str,
        headers: dict[str, str],
    ) -> dict[str, Any]:
        if method != "GET":
            raise CaptureError("the Epic capture transport permits GET only")
        request = Request(url, method="GET", headers=headers)
        try:
            with self._opener.open(
                request,
                timeout=self.timeout_seconds,
            ) as response:
                body = response.read(MAX_RESPONSE_BYTES + 1)
        except HTTPError as error:
            raise CaptureError(
                f"Epic Sandbox returned HTTP status {error.code}"
            ) from None
        except (URLError, TimeoutError, OSError):
            raise CaptureError("Epic Sandbox request failed") from None
        if len(body) > MAX_RESPONSE_BYTES:
            raise CaptureError("Epic Sandbox response exceeded the size ceiling")
        try:
            payload = json.loads(body)
        except (UnicodeDecodeError, json.JSONDecodeError):
            raise CaptureError("Epic Sandbox returned malformed JSON") from None
        if not isinstance(payload, dict):
            raise CaptureError("Epic Sandbox returned a non-object JSON payload")
        return payload


def capture_epic_sandbox(
    *,
    config: CaptureConfig,
    transport: CaptureTransport,
    captured_at: datetime,
    review: CaptureReview | None,
    access_token: str | None = None,
    scenario_binding: ScenarioBinding | None = LEGACY_SCENARIO_BINDING,
) -> dict[str, Any]:
    """Capture one allowlisted patient snapshot into a private JSON package."""

    _validate_output_directory(config.output_directory)
    if review is None:
        raise CaptureError("explicit review metadata is required")
    if captured_at.tzinfo is None:
        raise CaptureError("captured_at must include a timezone")
    token = access_token
    if token is None:
        token = os.environ.get(TOKEN_ENVIRONMENT_VARIABLE)
    if token is None or not token.strip():
        raise CaptureError(
            f"access token is required through {TOKEN_ENVIRONMENT_VARIABLE}"
        )
    token = token.strip()

    headers = {
        "Accept": "application/fhir+json",
        "Authorization": f"Bearer {token}",
    }
    requests: list[dict[str, str]] = []
    patient_url = f"{config.base_url}/Patient/{config.patient_id}"
    patient = _request_json(
        transport=transport,
        url=patient_url,
        headers=headers,
        resource_type="Patient",
        request_evidence=requests,
    )
    _validate_patient(patient, config.patient_id)

    resources: list[dict[str, Any]] = [patient]
    seen_resource_keys = {("Patient", config.patient_id)}
    bounded = False
    for resource_type, observation_category in _search_plans(config):
        search_resources = _capture_search(
            config=config,
            transport=transport,
            headers=headers,
            request_evidence=requests,
            resource_type=resource_type,
            observation_category=observation_category,
        )
        for resource in search_resources:
            key = (resource["resourceType"], resource["id"])
            if key in seen_resource_keys:
                raise CaptureError("Epic Sandbox returned a duplicate resource id")
            seen_resource_keys.add(key)
            if len(resources) >= config.max_resources:
                if not config.truncate:
                    resources.append(resource)
                    raise CaptureError("capture resource ceiling exceeded")
                bounded = True
                break
            resources.append(resource)

    resource_entries, resource_files = _resource_entries(resources, token)
    manifest = _build_manifest(
        captured_at=captured_at,
        patient=patient,
        patient_id=config.patient_id,
        requests=requests,
        resource_entries=resource_entries,
        review=review,
        scenario_binding=scenario_binding,
        bounded=bounded,
        observation_categories=(
            config.observation_categories
            if "Observation" in config.resource_types
            else ()
        ),
    )
    serialized_manifest = _canonical_json_bytes(manifest)
    if token.encode() in serialized_manifest:
        raise CaptureError("capture output contained authorization material")
    _write_package(
        output_directory=config.output_directory,
        manifest=serialized_manifest,
        resource_files=resource_files,
    )
    return manifest


def _search_plans(config: CaptureConfig) -> list[tuple[str, str | None]]:
    """Expand configured resource types into bounded per-category searches."""

    plans: list[tuple[str, str | None]] = []
    for resource_type in config.resource_types:
        if resource_type == "Observation":
            plans.extend(
                (resource_type, category)
                for category in config.observation_categories
            )
        else:
            plans.append((resource_type, None))
    return plans


def _capture_search(
    *,
    config: CaptureConfig,
    transport: CaptureTransport,
    headers: dict[str, str],
    request_evidence: list[dict[str, str]],
    resource_type: str,
    observation_category: str | None = None,
) -> list[dict[str, Any]]:
    if resource_type == "Observation" and observation_category is None:
        raise CaptureError("Observation searches must be category-scoped")
    query: list[tuple[str, str]] = [("patient", config.patient_id)]
    if observation_category is not None:
        query.append(("category", observation_category))
    query.append(("_count", str(config.page_size)))
    next_url: str | None = f"{config.base_url}/{resource_type}?{urlencode(query)}"
    visited_urls: set[str] = set()
    resources: list[dict[str, Any]] = []
    page_count = 0

    while next_url is not None:
        if next_url in visited_urls:
            raise CaptureError("pagination cycle detected")
        visited_urls.add(next_url)
        page_count += 1
        bundle = _request_json(
            transport=transport,
            url=next_url,
            headers=headers,
            resource_type=resource_type,
            request_evidence=request_evidence,
        )
        page_resources, following_url = _validate_search_bundle(
            bundle=bundle,
            resource_type=resource_type,
            patient_id=config.patient_id,
            observation_category=observation_category,
        )
        resources.extend(page_resources)
        if 1 + len(resources) > config.max_resources:
            if not config.truncate:
                raise CaptureError("capture resource ceiling exceeded")
            del resources[max(0, config.max_resources - 1):]
            return resources
        if following_url is not None:
            _validate_pagination_url(following_url, config.base_url, resource_type)
            if page_count >= config.max_pages:
                if not config.truncate:
                    raise CaptureError("capture page ceiling exceeded")
                return resources
        next_url = following_url

    return resources


def _request_json(
    *,
    transport: CaptureTransport,
    url: str,
    headers: dict[str, str],
    resource_type: str,
    request_evidence: list[dict[str, str]],
) -> dict[str, Any]:
    try:
        payload = transport.request(method="GET", url=url, headers=headers)
    except CaptureError:
        raise
    except Exception as error:
        raise CaptureError(
            f"Epic Sandbox {resource_type} request failed ({type(error).__name__})"
        ) from None
    if not isinstance(payload, dict):
        raise CaptureError("Epic Sandbox returned a non-object JSON payload")
    request_evidence.append(
        {
            "method": "GET",
            "resourceType": resource_type,
            "redactedPath": _redacted_path(url, resource_type),
        }
    )
    return payload


def _validate_patient(patient: Mapping[str, Any], patient_id: str) -> None:
    if patient.get("resourceType") != "Patient" or patient.get("id") != patient_id:
        raise CaptureError("Patient read did not match the selected patient")
    _validate_resource_id(patient.get("id"))


def _validate_search_bundle(
    *,
    bundle: Mapping[str, Any],
    resource_type: str,
    patient_id: str,
    observation_category: str | None = None,
) -> tuple[list[dict[str, Any]], str | None]:
    if bundle.get("resourceType") != "Bundle" or bundle.get("type") != "searchset":
        raise CaptureError("search response must be a FHIR searchset Bundle")
    entries = bundle.get("entry", [])
    if not isinstance(entries, list):
        raise CaptureError("malformed Bundle entry list")
    resources: list[dict[str, Any]] = []
    for entry in entries:
        if not isinstance(entry, dict) or not isinstance(entry.get("resource"), dict):
            raise CaptureError("malformed Bundle entry resource")
        resource = entry["resource"]
        search_mode = entry.get("search")
        mode = search_mode.get("mode") if isinstance(search_mode, dict) else None
        if mode in {"outcome", "include"} or resource.get("resourceType") == "OperationOutcome":
            # Search metadata, not a result. Never captured.
            continue
        if resource.get("resourceType") != resource_type:
            raise CaptureError("Bundle contained an unexpected resource type")
        _validate_resource_id(resource.get("id"))
        _validate_patient_scope(
            resource, resource_type, patient_id, observation_category
        )
        resources.append(resource)

    links = bundle.get("link", [])
    if not isinstance(links, list):
        raise CaptureError("malformed Bundle pagination links")
    next_urls: list[str] = []
    for link in links:
        if not isinstance(link, dict):
            raise CaptureError("malformed Bundle pagination link")
        relation = link.get("relation")
        url = link.get("url")
        if relation == "next":
            if not isinstance(url, str) or not url:
                raise CaptureError("malformed Bundle next pagination link")
            next_urls.append(url)
    if len(next_urls) > 1:
        raise CaptureError("Bundle contained multiple next pagination links")
    return resources, next_urls[0] if next_urls else None


def _validate_resource_id(resource_id: Any) -> None:
    if not isinstance(resource_id, str) or not FHIR_ID_PATTERN.fullmatch(resource_id):
        raise CaptureError("FHIR resource id is missing or invalid")


def _validate_patient_scope(
    resource: Mapping[str, Any],
    resource_type: str,
    patient_id: str,
    observation_category: str | None = None,
) -> None:
    if resource_type == "Appointment":
        participants = resource.get("participant")
        if not isinstance(participants, list):
            raise CaptureError("Appointment patient reference is missing")
        patient_references: list[str] = []
        for participant in participants:
            if not isinstance(participant, dict):
                raise CaptureError("Appointment participant is malformed")
            actor = participant.get("actor")
            if not isinstance(actor, dict):
                continue
            reference = actor.get("reference")
            if isinstance(reference, str) and _is_patient_reference(reference):
                patient_references.append(reference)
        if not patient_references or any(
            not _reference_matches_patient(reference, patient_id)
            for reference in patient_references
        ):
            raise CaptureError("Appointment does not match the selected patient")
        return

    subject = resource.get("subject")
    reference = subject.get("reference") if isinstance(subject, dict) else None
    if not isinstance(reference, str) or not _reference_matches_patient(
        reference, patient_id
    ):
        raise CaptureError(f"{resource_type} does not match the selected patient")
    if resource_type == "Observation":
        expected_category = observation_category or "laboratory"
        if not _observation_has_category(resource, expected_category):
            raise CaptureError(
                f"Observation is not in the {expected_category} category"
            )


def _is_patient_reference(reference: str) -> bool:
    parsed = urlsplit(reference)
    path = parsed.path.rstrip("/")
    return path.startswith("Patient/") or "/Patient/" in path


def _reference_matches_patient(reference: str, patient_id: str) -> bool:
    parsed = urlsplit(reference)
    if parsed.query or parsed.fragment:
        return False
    path = parsed.path.rstrip("/")
    if not parsed.scheme and not parsed.netloc:
        return path == f"Patient/{patient_id}"
    sandbox = urlsplit(EPIC_SANDBOX_FHIR_BASE_URL)
    return (
        parsed.scheme == "https"
        and parsed.netloc == sandbox.netloc
        and path == f"{sandbox.path}/Patient/{patient_id}"
    )


def _observation_has_category(
    resource: Mapping[str, Any], expected_category: str
) -> bool:
    categories = resource.get("category")
    if not isinstance(categories, list):
        return False
    for category in categories:
        if not isinstance(category, dict):
            continue
        codings = category.get("coding")
        if not isinstance(codings, list):
            continue
        for coding in codings:
            if isinstance(coding, dict) and coding.get("code") == expected_category:
                return True
    return False


def _is_laboratory_observation(resource: Mapping[str, Any]) -> bool:
    return _observation_has_category(resource, "laboratory")


def _validate_pagination_url(
    next_url: str,
    base_url: str,
    resource_type: str,
) -> None:
    parsed = urlsplit(next_url)
    base = urlsplit(base_url)
    expected_path = f"{base.path}/{resource_type}"
    if (
        parsed.scheme != "https"
        or parsed.netloc != base.netloc
        or parsed.username is not None
        or parsed.password is not None
        or parsed.fragment
        or parsed.path != expected_path
    ):
        raise CaptureError(
            "pagination URL must remain on the Epic Sandbox origin and resource path"
        )
    forbidden_query_keys = {
        "access_token",
        "authorization",
        "client_assertion",
        "client_secret",
    }
    if any(
        key.casefold() in forbidden_query_keys
        for key, _value in parse_qsl(parsed.query, keep_blank_values=True)
    ):
        raise CaptureError("pagination URL contained authorization material")


def _redacted_path(url: str, resource_type: str) -> str:
    parsed = urlsplit(url)
    if resource_type == "Patient":
        return "/Patient/[REDACTED]"
    query_pairs = sorted(
        (key, "[REDACTED]")
        for key, _value in parse_qsl(parsed.query, keep_blank_values=True)
    )
    redacted_query = urlencode(query_pairs)
    redacted_path = f"/{resource_type}?{redacted_query}"
    if len(redacted_path) > 500:
        raise CaptureError("redacted request path exceeded the manifest limit")
    return redacted_path


def _resource_entries(
    resources: Sequence[dict[str, Any]],
    token: str,
) -> tuple[list[dict[str, str]], dict[str, bytes]]:
    entries: list[dict[str, str]] = []
    files: dict[str, bytes] = {}
    for resource in sorted(
        resources,
        key=lambda item: (item["resourceType"], item["id"]),
    ):
        resource_type = resource["resourceType"]
        resource_id = resource["id"]
        slug = {
            "Patient": "patient",
            "Appointment": "appointment",
            "MedicationRequest": "medication-request",
            "Observation": "observation",
        }[resource_type]
        path = f"resources/{slug}-{resource_id}.json"
        body = _canonical_json_bytes(resource)
        if token.encode() in body:
            raise CaptureError("captured resource contained authorization material")
        checksum = hashlib.sha256(body).hexdigest()
        entries.append(
            {
                "resourceType": resource_type,
                "id": resource_id,
                "path": path,
                "sha256": checksum,
            }
        )
        files[path] = body
    return entries, files


def _build_manifest(
    *,
    captured_at: datetime,
    patient: Mapping[str, Any],
    patient_id: str,
    requests: Sequence[dict[str, str]],
    resource_entries: Sequence[dict[str, str]],
    review: CaptureReview,
    scenario_binding: ScenarioBinding | None = None,
    observation_categories: Sequence[str] = (),
    bounded: bool = False,
) -> dict[str, Any]:
    captured_timestamp = _utc_timestamp(captured_at)
    review_timestamp = _utc_timestamp(review.reviewed_at)
    source_identity = _patient_source_identity(patient, patient_id)
    capture_key = {
        "capturedAt": captured_timestamp,
        "patient": patient_id,
        "requests": list(requests),
        "resources": list(resource_entries),
        "reviewedAt": review_timestamp,
    }
    digest = hashlib.sha256(_canonical_json_bytes(capture_key)).hexdigest()[:8]
    capture_id_time = captured_at.astimezone(UTC).strftime("%Y%m%dT%H%M%SZ")
    manifest: dict[str, Any] = {
        "schemaVersion": 1 if scenario_binding is not None else 2,
        "captureId": f"epic-sandbox-{capture_id_time}-{digest}",
        "mode": "captured_epic_sandbox",
        "fhirVersion": "4.0.1",
        "source": {
            "label": "Epic FHIR Sandbox",
            "environment": "Non-Production Sandbox",
            "fhirBaseUrl": EPIC_SANDBOX_FHIR_BASE_URL,
        },
        "capturedAt": captured_timestamp,
        "patient": {"resourceType": "Patient", "id": patient_id},
        "requests": list(requests),
        "resources": list(resource_entries),
        "review": {
            "status": review.status,
            "reviewedAt": review_timestamp,
            "reviewedBy": review.reviewed_by.strip(),
            "distribution": review.distribution,
        },
    }
    if scenario_binding is not None:
        # Scenario-bound capture: present the patient under its prepared alias.
        alias = scenario_binding.presentation_alias.strip()
        manifest["scenarioBinding"] = {
            "scenarioId": scenario_binding.scenario_id.strip(),
            "presentationAlias": alias,
            "sourceIdentity": source_identity,
            "identityMatch": _source_identity_matches_alias(source_identity, alias),
        }
        return manifest
    # Roster capture: no scenario alias, the Sandbox identity stands on its own.
    manifest["sourceIdentity"] = source_identity
    manifest["bounded"] = bounded
    if observation_categories:
        manifest["observationCategories"] = sorted(set(observation_categories))
    return manifest


def _patient_source_identity(patient: Mapping[str, Any], patient_id: str) -> str:
    names = patient.get("name")
    if isinstance(names, list):
        for name in names:
            if not isinstance(name, dict):
                continue
            text = name.get("text")
            if isinstance(text, str) and text.strip():
                return text.strip()
            given = name.get("given", [])
            given_parts = (
                [part.strip() for part in given if isinstance(part, str) and part.strip()]
                if isinstance(given, list)
                else []
            )
            family = name.get("family")
            family_part = (
                family.strip() if isinstance(family, str) and family.strip() else ""
            )
            formatted = " ".join([*given_parts, family_part]).strip()
            if formatted:
                return formatted
    return f"Patient/{patient_id}"


def _source_identity_matches_alias(source_identity: str, alias: str) -> bool:
    source_parts = re.findall(r"[^\W_]+", source_identity.casefold())
    alias_parts = re.findall(r"[^\W_]+", alias.casefold())
    if source_parts == alias_parts:
        return True
    return (
        len(source_parts) >= 2
        and len(alias_parts) == 2
        and source_parts[0] == alias_parts[0]
        and source_parts[-1] == alias_parts[-1]
    )


def _utc_timestamp(value: datetime) -> str:
    return value.astimezone(UTC).replace(microsecond=0).isoformat().replace(
        "+00:00", "Z"
    )


def _canonical_json_bytes(value: Mapping[str, Any]) -> bytes:
    serialized = json.dumps(
        value,
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    )
    return f"{serialized}\n".encode()


def _validate_output_directory(output_directory: Path) -> None:
    if output_directory.is_symlink():
        raise CaptureError("capture output directory must not be a symbolic link")
    if output_directory.exists():
        if not output_directory.is_dir():
            raise CaptureError("capture output path must be a directory")
        if any(output_directory.iterdir()):
            raise CaptureError("capture output directory must be empty")


def _write_package(
    *,
    output_directory: Path,
    manifest: bytes,
    resource_files: Mapping[str, bytes],
) -> None:
    output_existed = output_directory.exists()
    created_files: list[Path] = []
    resources_directory = output_directory / "resources"
    try:
        output_directory.mkdir(parents=True, exist_ok=True, mode=0o700)
        output_directory.chmod(0o700)
        resources_directory.mkdir(mode=0o700)
        for relative_path, body in sorted(resource_files.items()):
            destination = output_directory / relative_path
            with destination.open("xb") as file_handle:
                file_handle.write(body)
            destination.chmod(0o600)
            created_files.append(destination)
        manifest_path = output_directory / "manifest.json"
        with manifest_path.open("xb") as file_handle:
            file_handle.write(manifest)
        manifest_path.chmod(0o600)
        created_files.append(manifest_path)
    except OSError:
        for path in reversed(created_files):
            path.unlink(missing_ok=True)
        try:
            resources_directory.rmdir()
        except OSError:
            pass
        if not output_existed:
            try:
                output_directory.rmdir()
            except OSError:
                pass
        raise CaptureError("capture package could not be written") from None
