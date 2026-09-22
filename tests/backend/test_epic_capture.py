from __future__ import annotations

import copy
import hashlib
import importlib
import importlib.util
import json
import re
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlsplit

import pytest
from jsonschema import Draft202012Validator, FormatChecker


FHIR_BASE_URL = "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4"
PATIENT_ID = "erXuFYUfucBZaryVksYEcMg3"
ACCESS_TOKEN = "epic-secret-token-that-must-never-be-persisted"
CAPTURED_AT = datetime(2026, 9, 22, 15, 4, 5, tzinfo=UTC)
REVIEWED_AT = datetime(2026, 9, 22, 15, 10, tzinfo=UTC)


PATIENT = {
    "resourceType": "Patient",
    "id": PATIENT_ID,
    "active": True,
    "name": [{"family": "Argonaut", "given": ["Jason"]}],
    "birthDate": "1985-08-01",
}

APPOINTMENT = {
    "resourceType": "Appointment",
    "id": "appt-2",
    "status": "booked",
    "start": "2026-09-25T15:00:00Z",
    "participant": [
        {"actor": {"reference": f"Patient/{PATIENT_ID}"}, "status": "accepted"},
        {"actor": {"reference": "Location/oncology"}, "status": "accepted"},
    ],
}

MEDICATION_REQUEST = {
    "resourceType": "MedicationRequest",
    "id": "med-1",
    "status": "active",
    "intent": "order",
    "subject": {"reference": f"Patient/{PATIENT_ID}"},
    "medicationCodeableConcept": {"text": "Sandbox medication"},
}

LAB_OBSERVATION = {
    "resourceType": "Observation",
    "id": "obs-3",
    "status": "final",
    "category": [
        {
            "coding": [
                {
                    "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                    "code": "laboratory",
                }
            ]
        }
    ],
    "subject": {"reference": f"Patient/{PATIENT_ID}"},
    "code": {"text": "Hemoglobin"},
    "valueQuantity": {"value": 12.2, "unit": "g/dL"},
}


class SequencedTransport:
    """A request-shaped fake that cannot perform network I/O."""

    def __init__(self, *responses: dict[str, Any]) -> None:
        self._responses = [copy.deepcopy(response) for response in responses]
        self.calls: list[dict[str, Any]] = []

    def request(
        self,
        *,
        method: str,
        url: str,
        headers: dict[str, str],
    ) -> dict[str, Any]:
        self.calls.append(
            {"method": method, "url": url, "headers": copy.deepcopy(headers)}
        )
        if not self._responses:
            raise AssertionError(f"unexpected request: {method} {url}")
        return self._responses.pop(0)

    def assert_finished(self) -> None:
        assert self._responses == []


def search_bundle(
    _resource_type: str,
    *resources: dict[str, Any],
    next_url: str | None = None,
) -> dict[str, Any]:
    links = [] if next_url is None else [{"relation": "next", "url": next_url}]
    return {
        "resourceType": "Bundle",
        "type": "searchset",
        "link": links,
        "entry": [{"resource": copy.deepcopy(resource)} for resource in resources],
        "total": len(resources),
    }


def production_module():
    """Import inside tests so collection succeeds while the new module is RED."""

    return importlib.import_module("app.epic_capture")


def cli_module():
    script_path = (
        Path(__file__).resolve().parents[2]
        / "backend/scripts/capture_epic_sandbox.py"
    )
    spec = importlib.util.spec_from_file_location("epic_capture_cli", script_path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def approved_review(module):
    return module.CaptureReview(
        status="approved_for_frontend",
        reviewed_at=REVIEWED_AT,
        reviewed_by="OncoReady test operator",
        distribution="reviewed_epic_sandbox_test_data",
    )


def capture(
    tmp_path: Path,
    transport: SequencedTransport,
    *,
    access_token: str | None = ACCESS_TOKEN,
    resource_types: tuple[str, ...] = (
        "Appointment",
        "MedicationRequest",
        "Observation",
    ),
    max_pages: int = 4,
    max_resources: int = 20,
    review: Any = ...,
):
    module = production_module()
    config = module.CaptureConfig(
        base_url=FHIR_BASE_URL,
        patient_id=PATIENT_ID,
        output_directory=tmp_path,
        resource_types=resource_types,
        max_pages=max_pages,
        max_resources=max_resources,
    )
    if review is ...:
        review = approved_review(module)
    return module.capture_epic_sandbox(
        config=config,
        transport=transport,
        access_token=access_token,
        captured_at=CAPTURED_AT,
        review=review,
    )


def manifest_at(output_directory: Path) -> dict[str, Any]:
    return json.loads((output_directory / "manifest.json").read_text())


def package_json_files(output_directory: Path) -> list[Path]:
    return sorted(output_directory.rglob("*.json"))


def canonical_json_bytes(value: dict[str, Any]) -> bytes:
    serialized = json.dumps(
        value,
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    )
    return f"{serialized}\n".encode()


def assert_no_package_was_written(output_directory: Path) -> None:
    assert package_json_files(output_directory) == []


def test_capture_uses_get_only_patient_read_and_patient_scoped_searches(
    tmp_path: Path,
) -> None:
    appointment_bundle = search_bundle("Appointment", APPOINTMENT)
    medication_bundle = search_bundle("MedicationRequest", MEDICATION_REQUEST)
    observation_bundle = search_bundle("Observation", LAB_OBSERVATION)
    transport = SequencedTransport(
        PATIENT,
        appointment_bundle,
        medication_bundle,
        observation_bundle,
    )

    capture(tmp_path, transport)

    transport.assert_finished()
    assert [call["method"] for call in transport.calls] == ["GET"] * 4
    assert all(
        call["headers"]["Authorization"] == f"Bearer {ACCESS_TOKEN}"
        for call in transport.calls
    )

    patient_request = urlsplit(transport.calls[0]["url"])
    assert patient_request.path == urlsplit(FHIR_BASE_URL).path + f"/Patient/{PATIENT_ID}"
    assert patient_request.query == ""

    searches = {
        Path(urlsplit(call["url"]).path).name: parse_qs(urlsplit(call["url"]).query)
        for call in transport.calls[1:]
    }
    assert searches["Appointment"]["patient"] == [PATIENT_ID]
    assert searches["MedicationRequest"]["patient"] == [PATIENT_ID]
    assert searches["Observation"]["patient"] == [PATIENT_ID]
    assert searches["Observation"]["category"] == ["laboratory"]
    assert all("access_token" not in query for query in searches.values())


def test_capture_writes_untouched_resources_and_a_contract_valid_manifest(
    tmp_path: Path,
) -> None:
    transport = SequencedTransport(
        PATIENT,
        search_bundle("Appointment", APPOINTMENT),
        search_bundle("MedicationRequest", MEDICATION_REQUEST),
        search_bundle("Observation", LAB_OBSERVATION),
    )

    capture(tmp_path, transport)

    manifest = manifest_at(tmp_path)
    schema_path = (
        Path(__file__).resolve().parents[2]
        / "contracts/schemas/epic-capture-manifest.v1.schema.json"
    )
    schema = json.loads(schema_path.read_text())
    Draft202012Validator(schema, format_checker=FormatChecker()).validate(manifest)

    assert manifest["capturedAt"] == "2026-09-22T15:04:05Z"
    assert manifest["patient"] == {"resourceType": "Patient", "id": PATIENT_ID}
    assert manifest["scenarioBinding"] == {
        "scenarioId": "camila-demo-v2",
        "presentationAlias": "Camila Lopez",
        "sourceIdentity": "Jason Argonaut",
        "identityMatch": False,
    }
    assert manifest["review"] == {
        "status": "approved_for_frontend",
        "reviewedAt": "2026-09-22T15:10:00Z",
        "reviewedBy": "OncoReady test operator",
        "distribution": "reviewed_epic_sandbox_test_data",
    }
    assert re.fullmatch(
        r"epic-sandbox-20260922T150405Z-[a-f0-9]{8}", manifest["captureId"]
    )

    expected_by_key = {
        (resource["resourceType"], resource["id"]): resource
        for resource in (PATIENT, APPOINTMENT, MEDICATION_REQUEST, LAB_OBSERVATION)
    }
    assert [
        (item["resourceType"], item["id"]) for item in manifest["resources"]
    ] == sorted(expected_by_key)
    for item in manifest["resources"]:
        raw_bytes = (tmp_path / item["path"]).read_bytes()
        expected_resource = expected_by_key[(item["resourceType"], item["id"])]
        assert raw_bytes == canonical_json_bytes(expected_resource)
        assert item["sha256"] == hashlib.sha256(raw_bytes).hexdigest()


def test_capture_accepts_epic_sandbox_resource_ids_longer_than_fhir_nominal_limit(
    tmp_path: Path,
) -> None:
    """Epic Sandbox currently emits 66-character opaque Observation ids."""
    sandbox_observation = copy.deepcopy(LAB_OBSERVATION)
    sandbox_observation["id"] = (
        "eyPMWgv2u2RUfsV4p1lLKuUtqyPs2-QNi2zKvbTsFYtRByc6B.cSi1iVU5V2HOpX23"
    )
    transport = SequencedTransport(
        PATIENT,
        search_bundle("Observation", sandbox_observation),
    )

    capture(tmp_path, transport, resource_types=("Observation",))

    manifest = manifest_at(tmp_path)
    schema_path = (
        Path(__file__).resolve().parents[2]
        / "contracts/schemas/epic-capture-manifest.v1.schema.json"
    )
    schema = json.loads(schema_path.read_text())
    Draft202012Validator(schema, format_checker=FormatChecker()).validate(manifest)
    assert any(
        resource["id"] == sandbox_observation["id"]
        for resource in manifest["resources"]
    )


def test_capture_output_is_deterministic_when_bundle_entry_order_changes(
    tmp_path: Path,
) -> None:
    first_output = tmp_path / "first"
    second_output = tmp_path / "second"
    earlier_appointment = copy.deepcopy(APPOINTMENT)
    earlier_appointment["id"] = "appt-1"

    first_transport = SequencedTransport(
        PATIENT,
        search_bundle("Appointment", APPOINTMENT, earlier_appointment),
    )
    second_transport = SequencedTransport(
        dict(reversed(list(PATIENT.items()))),
        search_bundle("Appointment", earlier_appointment, APPOINTMENT),
    )

    capture(
        first_output,
        first_transport,
        resource_types=("Appointment",),
    )
    capture(
        second_output,
        second_transport,
        resource_types=("Appointment",),
    )

    first_tree = {
        path.relative_to(first_output): path.read_bytes()
        for path in package_json_files(first_output)
    }
    second_tree = {
        path.relative_to(second_output): path.read_bytes()
        for path in package_json_files(second_output)
    }
    assert first_tree == second_tree


def test_token_can_come_from_environment_but_never_enters_capture_files(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("EPIC_SANDBOX_ACCESS_TOKEN", ACCESS_TOKEN)
    transport = SequencedTransport(PATIENT, search_bundle("Appointment"))

    capture(
        tmp_path,
        transport,
        access_token=None,
        resource_types=("Appointment",),
    )

    package_text = "\n".join(path.read_text() for path in package_json_files(tmp_path))
    assert ACCESS_TOKEN not in package_text
    assert "Authorization" not in package_text
    assert all(
        ACCESS_TOKEN not in request["redactedPath"]
        for request in manifest_at(tmp_path)["requests"]
    )


def test_missing_token_or_review_fails_before_any_request_or_output(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    module = production_module()
    monkeypatch.delenv("EPIC_SANDBOX_ACCESS_TOKEN", raising=False)
    missing_token_transport = SequencedTransport(PATIENT)

    with pytest.raises(module.CaptureError, match="token"):
        capture(
            tmp_path / "missing-token",
            missing_token_transport,
            access_token=None,
            resource_types=(),
        )
    assert missing_token_transport.calls == []
    assert_no_package_was_written(tmp_path / "missing-token")

    missing_review_transport = SequencedTransport(PATIENT)
    with pytest.raises(module.CaptureError, match="review"):
        capture(
            tmp_path / "missing-review",
            missing_review_transport,
            resource_types=(),
            review=None,
        )
    assert missing_review_transport.calls == []
    assert_no_package_was_written(tmp_path / "missing-review")


def test_operator_cli_takes_token_only_from_environment_and_requires_review_fields(
    tmp_path: Path,
    capsys: pytest.CaptureFixture[str],
) -> None:
    module = cli_module()
    output_directory = tmp_path / "private-stage"
    transport = SequencedTransport(PATIENT)
    arguments = [
        "--patient-id",
        PATIENT_ID,
        "--output-dir",
        str(output_directory),
        "--resource-types",
        "--review-status",
        "approved_for_frontend",
        "--reviewed-at",
        "2026-09-22T15:10:00Z",
        "--reviewed-by",
        "OncoReady test operator",
        "--distribution",
        "reviewed_epic_sandbox_test_data",
    ]

    exit_code = module.main(
        arguments,
        environ={"EPIC_SANDBOX_ACCESS_TOKEN": ACCESS_TOKEN},
        transport=transport,
        captured_at=CAPTURED_AT,
    )

    assert exit_code == 0
    assert manifest_at(output_directory)["review"]["reviewedBy"] == (
        "OncoReady test operator"
    )
    assert ACCESS_TOKEN not in capsys.readouterr().out

    forbidden_exit = module.main(
        [*arguments, "--access-token", ACCESS_TOKEN],
        environ={},
        transport=SequencedTransport(PATIENT),
        captured_at=CAPTURED_AT,
    )
    output = capsys.readouterr()
    assert forbidden_exit != 0
    assert ACCESS_TOKEN not in output.out
    assert ACCESS_TOKEN not in output.err


def test_request_evidence_redacts_patient_and_pagination_selectors(
    tmp_path: Path,
) -> None:
    next_url = (
        FHIR_BASE_URL
        + f"/Appointment?patient={PATIENT_ID}&page=2&cursor=server-private-cursor"
    )
    transport = SequencedTransport(
        PATIENT,
        search_bundle("Appointment", APPOINTMENT, next_url=next_url),
        search_bundle("Appointment"),
    )

    capture(tmp_path, transport, resource_types=("Appointment",))

    transport.assert_finished()
    assert transport.calls[2]["url"] == next_url
    request_evidence = manifest_at(tmp_path)["requests"]
    assert len(request_evidence) == 3
    for request in request_evidence:
        assert request["method"] == "GET"
        assert PATIENT_ID not in request["redactedPath"]
        assert "server-private-cursor" not in request["redactedPath"]
        assert urlsplit(request["redactedPath"]).scheme == ""
        assert urlsplit(request["redactedPath"]).netloc == ""


@pytest.mark.parametrize(
    "base_url,resource_types",
    [
        ("https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/Patient", ()),
        ("https://example.invalid/FHIR/R4", ()),
        (FHIR_BASE_URL, ("Condition",)),
        (FHIR_BASE_URL, ("Patient",)),
    ],
)
def test_configuration_rejects_non_sandbox_endpoints_and_non_search_allowlist(
    tmp_path: Path,
    base_url: str,
    resource_types: tuple[str, ...],
) -> None:
    module = production_module()
    transport = SequencedTransport(PATIENT)

    with pytest.raises((module.CaptureError, ValueError)):
        config = module.CaptureConfig(
            base_url=base_url,
            patient_id=PATIENT_ID,
            output_directory=tmp_path,
            resource_types=resource_types,
            max_pages=4,
            max_resources=20,
        )
        module.capture_epic_sandbox(
            config=config,
            transport=transport,
            access_token=ACCESS_TOKEN,
            captured_at=CAPTURED_AT,
            review=approved_review(module),
        )

    assert transport.calls == []
    assert_no_package_was_written(tmp_path)


def test_cross_origin_pagination_fails_closed_without_a_partial_package(
    tmp_path: Path,
) -> None:
    module = production_module()
    transport = SequencedTransport(
        PATIENT,
        search_bundle(
            "Appointment",
            APPOINTMENT,
            next_url="https://attacker.invalid/FHIR/R4/Appointment?page=2",
        ),
    )

    with pytest.raises(module.CaptureError, match="origin|pagination"):
        capture(tmp_path, transport, resource_types=("Appointment",))

    assert len(transport.calls) == 2
    assert_no_package_was_written(tmp_path)


def test_page_and_resource_ceilings_fail_closed_without_partial_packages(
    tmp_path: Path,
) -> None:
    module = production_module()
    page_transport = SequencedTransport(
        PATIENT,
        search_bundle(
            "Appointment",
            APPOINTMENT,
            next_url=FHIR_BASE_URL + f"/Appointment?patient={PATIENT_ID}&page=2",
        ),
    )
    with pytest.raises(module.CaptureError, match="page"):
        capture(
            tmp_path / "pages",
            page_transport,
            resource_types=("Appointment",),
            max_pages=1,
        )
    assert len(page_transport.calls) == 2
    assert_no_package_was_written(tmp_path / "pages")

    second_appointment = copy.deepcopy(APPOINTMENT)
    second_appointment["id"] = "appt-3"
    resource_transport = SequencedTransport(
        PATIENT,
        search_bundle("Appointment", APPOINTMENT, second_appointment),
    )
    with pytest.raises(module.CaptureError, match="resource"):
        capture(
            tmp_path / "resources",
            resource_transport,
            resource_types=("Appointment",),
            max_resources=2,
        )
    assert len(resource_transport.calls) == 2
    assert_no_package_was_written(tmp_path / "resources")


@pytest.mark.parametrize(
    "malformed_bundle",
    [
        {"resourceType": "Patient", "id": "not-a-bundle"},
        {"resourceType": "Bundle", "type": "collection", "entry": []},
        {"resourceType": "Bundle", "type": "searchset", "entry": {}},
        {"resourceType": "Bundle", "type": "searchset", "link": "next"},
    ],
)
def test_malformed_search_bundles_fail_closed(
    tmp_path: Path,
    malformed_bundle: dict[str, Any],
) -> None:
    module = production_module()
    transport = SequencedTransport(PATIENT, malformed_bundle)

    with pytest.raises(module.CaptureError, match="Bundle|bundle|malformed"):
        capture(tmp_path, transport, resource_types=("Appointment",))

    assert_no_package_was_written(tmp_path)


@pytest.mark.parametrize(
    "invalid_patient",
    [
        {**PATIENT, "id": "different-patient"},
        {**PATIENT, "resourceType": "Practitioner"},
        {key: value for key, value in PATIENT.items() if key != "id"},
    ],
)
def test_patient_read_must_match_the_selected_patient(
    tmp_path: Path,
    invalid_patient: dict[str, Any],
) -> None:
    module = production_module()
    transport = SequencedTransport(invalid_patient)

    with pytest.raises(module.CaptureError, match="Patient|patient"):
        capture(tmp_path, transport, resource_types=())

    assert_no_package_was_written(tmp_path)


@pytest.mark.parametrize(
    "requested_type,unexpected_resource",
    [
        ("Appointment", LAB_OBSERVATION),
        ("MedicationRequest", APPOINTMENT),
        ("Observation", MEDICATION_REQUEST),
    ],
)
def test_search_rejects_unexpected_resource_types(
    tmp_path: Path,
    requested_type: str,
    unexpected_resource: dict[str, Any],
) -> None:
    module = production_module()
    transport = SequencedTransport(
        PATIENT,
        search_bundle(requested_type, unexpected_resource),
    )

    with pytest.raises(module.CaptureError, match="resource type|resourceType"):
        capture(tmp_path, transport, resource_types=(requested_type,))

    assert_no_package_was_written(tmp_path)


@pytest.mark.parametrize(
    "resource_type,cross_patient_resource",
    [
        (
            "Appointment",
            {
                **APPOINTMENT,
                "participant": [
                    {
                        "actor": {"reference": "Patient/different-patient"},
                        "status": "accepted",
                    }
                ],
            },
        ),
        (
            "MedicationRequest",
            {
                **MEDICATION_REQUEST,
                "subject": {"reference": "Patient/different-patient"},
            },
        ),
        (
            "Observation",
            {
                **LAB_OBSERVATION,
                "subject": {"reference": "Patient/different-patient"},
            },
        ),
    ],
)
def test_search_rejects_cross_patient_resources(
    tmp_path: Path,
    resource_type: str,
    cross_patient_resource: dict[str, Any],
) -> None:
    module = production_module()
    transport = SequencedTransport(
        PATIENT,
        search_bundle(resource_type, cross_patient_resource),
    )

    with pytest.raises(module.CaptureError, match="patient|Patient"):
        capture(tmp_path, transport, resource_types=(resource_type,))

    assert_no_package_was_written(tmp_path)


def test_non_laboratory_observation_is_rejected_from_laboratory_capture(
    tmp_path: Path,
) -> None:
    module = production_module()
    vital = copy.deepcopy(LAB_OBSERVATION)
    vital["id"] = "vital-1"
    vital["category"][0]["coding"][0]["code"] = "vital-signs"
    transport = SequencedTransport(
        PATIENT,
        search_bundle("Observation", vital),
    )

    with pytest.raises(module.CaptureError, match="laboratory|category"):
        capture(tmp_path, transport, resource_types=("Observation",))

    assert_no_package_was_written(tmp_path)
