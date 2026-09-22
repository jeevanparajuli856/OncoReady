"""Roster captures: vital-sign Observations and unbound (v2) manifests.

EPIC-001's frozen scenario capture is covered by ``test_epic_capture.py``.
These tests cover the additions that let the staff roster show several Epic
Sandbox patients without disturbing that capture.
"""

from __future__ import annotations

import copy
import json
from datetime import UTC, datetime
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

import pytest
from jsonschema import Draft202012Validator, FormatChecker

from test_epic_capture import (
    ACCESS_TOKEN,
    APPOINTMENT,
    CAPTURED_AT,
    FHIR_BASE_URL,
    LAB_OBSERVATION,
    PATIENT,
    PATIENT_ID,
    REVIEWED_AT,
    SequencedTransport,
    production_module,
    search_bundle,
)


VITAL_OBSERVATION = {
    "resourceType": "Observation",
    "id": "obs-vital-1",
    "status": "final",
    "category": [
        {
            "coding": [
                {
                    "system": (
                        "http://terminology.hl7.org/CodeSystem/observation-category"
                    ),
                    "code": "vital-signs",
                }
            ]
        }
    ],
    "subject": {"reference": f"Patient/{PATIENT_ID}"},
    "code": {
        "text": "Heart rate",
        "coding": [{"system": "http://loinc.org", "code": "8867-4"}],
    },
    "effectiveDateTime": "2019-05-28T14:21:00Z",
    "valueQuantity": {"value": 72, "unit": "/min"},
}


def roster_schema() -> Draft202012Validator:
    schema_path = (
        Path(__file__).resolve().parents[2]
        / "contracts/schemas/epic-capture-manifest.v2.schema.json"
    )
    return Draft202012Validator(
        json.loads(schema_path.read_text()), format_checker=FormatChecker()
    )


def roster_config(module, tmp_path: Path, **overrides):
    defaults = dict(
        base_url=FHIR_BASE_URL,
        patient_id=PATIENT_ID,
        output_directory=tmp_path / "package",
        resource_types=("Appointment", "Observation"),
        observation_categories=("vital-signs",),
    )
    defaults.update(overrides)
    return module.CaptureConfig(**defaults)


def review(module):
    return module.CaptureReview(
        status="approved_for_frontend",
        reviewed_at=REVIEWED_AT,
        reviewed_by="OncoReady Codex operator",
        distribution="reviewed_epic_sandbox_test_data",
    )


def test_vital_signs_search_is_category_scoped_to_the_selected_patient(tmp_path):
    module = production_module()
    transport = SequencedTransport(
        copy.deepcopy(PATIENT),
        search_bundle("Appointment", APPOINTMENT),
        search_bundle("Observation", VITAL_OBSERVATION),
    )

    module.capture_epic_sandbox(
        config=roster_config(module, tmp_path),
        transport=transport,
        access_token=ACCESS_TOKEN,
        captured_at=CAPTURED_AT,
        review=review(module),
        scenario_binding=None,
    )

    observation_calls = [
        call for call in transport.calls if "/Observation?" in call["url"]
    ]
    assert len(observation_calls) == 1
    query = parse_qs(urlsplit(observation_calls[0]["url"]).query)
    assert query["category"] == ["vital-signs"]
    assert query["patient"] == [PATIENT_ID]
    assert all(call["method"] == "GET" for call in transport.calls)
    transport.assert_finished()


def test_each_configured_category_is_issued_as_its_own_bounded_search(tmp_path):
    module = production_module()
    transport = SequencedTransport(
        copy.deepcopy(PATIENT),
        search_bundle("Observation", LAB_OBSERVATION),
        search_bundle("Observation", VITAL_OBSERVATION),
    )

    module.capture_epic_sandbox(
        config=roster_config(
            module,
            tmp_path,
            resource_types=("Observation",),
            observation_categories=("laboratory", "vital-signs"),
        ),
        transport=transport,
        access_token=ACCESS_TOKEN,
        captured_at=CAPTURED_AT,
        review=review(module),
        scenario_binding=None,
    )

    categories = [
        parse_qs(urlsplit(call["url"]).query)["category"][0]
        for call in transport.calls
        if "/Observation?" in call["url"]
    ]
    assert categories == ["laboratory", "vital-signs"]
    transport.assert_finished()


def test_roster_manifest_is_v2_contract_valid_and_carries_no_scenario_alias(tmp_path):
    module = production_module()
    transport = SequencedTransport(
        copy.deepcopy(PATIENT),
        search_bundle("Appointment", APPOINTMENT),
        search_bundle("Observation", VITAL_OBSERVATION),
    )

    manifest = module.capture_epic_sandbox(
        config=roster_config(module, tmp_path),
        transport=transport,
        access_token=ACCESS_TOKEN,
        captured_at=CAPTURED_AT,
        review=review(module),
        scenario_binding=None,
    )

    roster_schema().validate(manifest)
    assert manifest["schemaVersion"] == 2
    assert "scenarioBinding" not in manifest
    assert manifest["sourceIdentity"] == "Jason Argonaut"
    assert manifest["observationCategories"] == ["vital-signs"]

    written = json.loads((tmp_path / "package/manifest.json").read_text())
    assert written == manifest


def test_scenario_bound_capture_still_emits_the_v1_manifest(tmp_path):
    module = production_module()
    transport = SequencedTransport(
        copy.deepcopy(PATIENT),
        search_bundle("Observation", LAB_OBSERVATION),
    )

    manifest = module.capture_epic_sandbox(
        config=roster_config(
            module,
            tmp_path,
            resource_types=("Observation",),
            observation_categories=("laboratory",),
        ),
        transport=transport,
        access_token=ACCESS_TOKEN,
        captured_at=CAPTURED_AT,
        review=review(module),
        scenario_binding=module.LEGACY_SCENARIO_BINDING,
    )

    assert manifest["schemaVersion"] == 1
    assert manifest["scenarioBinding"]["scenarioId"] == "camila-demo-v2"
    assert manifest["scenarioBinding"]["presentationAlias"] == "Camila Lopez"
    assert "sourceIdentity" not in manifest
    assert "observationCategories" not in manifest


def test_a_laboratory_observation_is_rejected_from_a_vital_signs_capture(tmp_path):
    module = production_module()
    transport = SequencedTransport(
        copy.deepcopy(PATIENT),
        search_bundle("Observation", LAB_OBSERVATION),
    )

    with pytest.raises(module.CaptureError):
        module.capture_epic_sandbox(
            config=roster_config(
                module, tmp_path, resource_types=("Observation",)
            ),
            transport=transport,
            access_token=ACCESS_TOKEN,
            captured_at=CAPTURED_AT,
            review=review(module),
            scenario_binding=None,
        )

    assert not (tmp_path / "package").exists()


def test_unsupported_observation_category_is_rejected_before_any_request(tmp_path):
    module = production_module()

    with pytest.raises(ValueError):
        roster_config(module, tmp_path, observation_categories=("social-history",))
    with pytest.raises(ValueError):
        roster_config(module, tmp_path, observation_categories=())
    with pytest.raises(ValueError):
        roster_config(
            module, tmp_path, observation_categories=("laboratory", "laboratory")
        )


def test_per_category_searches_count_against_the_manifest_request_ceiling(tmp_path):
    module = production_module()

    # 1 Patient read + 6 pages x 4 searches (2 non-Observation + 2 categories)
    # exceeds the manifest's 20-request ceiling and must fail configuration.
    with pytest.raises(ValueError):
        roster_config(
            module,
            tmp_path,
            resource_types=("Appointment", "MedicationRequest", "Observation"),
            observation_categories=("laboratory", "vital-signs"),
            max_pages=6,
        )

    config = roster_config(
        module,
        tmp_path,
        resource_types=("Appointment", "MedicationRequest", "Observation"),
        observation_categories=("laboratory", "vital-signs"),
        max_pages=4,
    )
    assert config.search_plan_count == 4
