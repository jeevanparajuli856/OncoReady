from __future__ import annotations

import hashlib
import json
import math
from collections import Counter
from pathlib import Path

import numpy as np
import pytest

from ml.train import (
    DEFAULT_CASE_COUNT,
    DEFAULT_OUTPUT,
    DISALLOWED_LEAKAGE_COLUMNS,
    ENCOUNTERS_PER_PATIENT,
    FEATURE_NAMES,
    FORMAT_VERSION,
    MODEL_VERSION,
    build_artifacts,
    canonical_bytes,
    generate_synthetic_rows,
    partition_rows,
    portable_raw_margin,
    sigmoid,
)


def load(path: Path):
    return json.loads(path.read_text())


@pytest.fixture(scope="session")
def built(tmp_path_factory: pytest.TempPathFactory) -> Path:
    output = tmp_path_factory.mktemp("ml-artifact")
    build_artifacts(output)
    return output


def test_committed_artifact_reproduces_exactly(built: Path) -> None:
    for filename in ("model.json", "evaluation.json", "golden-vectors.json", "manifest.json"):
        assert (built / filename).read_bytes() == (DEFAULT_OUTPUT / filename).read_bytes()


def test_manifest_hashes_every_runtime_input(built: Path) -> None:
    manifest = load(built / "manifest.json")
    assert manifest["format_version"] == FORMAT_VERSION
    assert manifest["model_version"] == MODEL_VERSION
    for filename, expected_hash in manifest["files"].items():
        assert hashlib.sha256((built / filename).read_bytes()).hexdigest() == expected_hash
    assert hashlib.sha256(canonical_bytes(manifest["files"])).hexdigest() == manifest["artifact_set_sha256"]


def test_leakage_and_held_out_gates_pass(built: Path) -> None:
    evaluation = load(built / "evaluation.json")
    assert evaluation["model_version"] == "supportive-outreach-2.0.0"
    assert evaluation["dataset"]["row_count"] >= 12_000
    assert evaluation["dataset"]["patient_count"] == evaluation["dataset"]["row_count"] // ENCOUNTERS_PER_PATIENT
    assert evaluation["dataset"]["contains_real_patient_data"] is False
    assert evaluation["dataset"]["missingness"]["rows_with_any_missing"] > 0
    assert evaluation["dataset"]["missingness"]["overall_cell_rate"] > 0.03
    assert len(evaluation["dataset"]["scenario_profile_counts"]) >= 4
    assert len(evaluation["dataset"]["calendar_regime_counts"]) >= 4
    assert evaluation["leakage_review"]["passed"] is True
    assert all(value == 0 for value in evaluation["leakage_review"]["patient_overlap"].values())
    assert evaluation["leakage_review"]["feature_timestamp_violations"] == 0
    assert evaluation["temporal_validation"]["strictly_chronological"] is True
    assert evaluation["temporal_validation"]["passed"] is True
    assert not (set(FEATURE_NAMES) & DISALLOWED_LEAKAGE_COLUMNS)
    assert evaluation["metrics"]["roc_auc"] >= evaluation["acceptance_gates"]["minimum_roc_auc"]
    assert evaluation["metrics"]["brier_score"] <= evaluation["acceptance_gates"]["maximum_brier_score"]
    assert (
        evaluation["metrics"]["expected_calibration_error"]
        <= evaluation["acceptance_gates"]["maximum_expected_calibration_error"]
    )
    assert all(group["passed"] for group in evaluation["subgroups"].values())


def test_generator_is_longitudinal_diverse_missing_and_patient_disjoint() -> None:
    data = generate_synthetic_rows()
    split = partition_rows(data)
    assert len(data["labels"]) == DEFAULT_CASE_COUNT
    patient_counts = Counter(data["patient_ids"])
    assert len(patient_counts) == DEFAULT_CASE_COUNT // ENCOUNTERS_PER_PATIENT
    assert set(patient_counts.values()) == {ENCOUNTERS_PER_PATIENT}
    assert np.isnan(data["values"]).any()
    assert len(set(data["scenario_profiles"].tolist())) >= 4
    assert len(set(data["calendar_regimes"].tolist())) >= 4

    patient_sets = {
        name: {data["patient_ids"][int(index)] for index in indexes}
        for name, indexes in split.items()
    }
    assert patient_sets["train"].isdisjoint(patient_sets["calibration"])
    assert patient_sets["train"].isdisjoint(patient_sets["test"])
    assert patient_sets["calibration"].isdisjoint(patient_sets["test"])
    assert max(data["feature_observed_at"][int(index)] for index in split["train"]) < min(
        data["feature_observed_at"][int(index)] for index in split["calibration"]
    )
    assert max(data["feature_observed_at"][int(index)] for index in split["calibration"]) < min(
        data["feature_observed_at"][int(index)] for index in split["test"]
    )


def test_portable_inference_and_explanation_golden_vectors(built: Path) -> None:
    model = load(built / "model.json")
    golden = load(built / "golden-vectors.json")
    coefficient = model["calibrator"]["coefficient"]
    intercept = model["calibrator"]["intercept"]
    for vector in golden["vectors"]:
        values = vector["ordered_feature_values"]
        raw_margin = portable_raw_margin(model, values)
        probability = float(sigmoid(coefficient * raw_margin + intercept))
        assert raw_margin == pytest.approx(vector["raw_margin"], abs=golden["tolerance"]["raw_margin"])
        assert probability == pytest.approx(vector["calibrated_probability"], abs=golden["tolerance"]["probability"])
        contribution_sum = sum(vector["explanation"]["contributions"].values())
        assert vector["explanation"]["base_value"] + contribution_sum == pytest.approx(
            raw_margin, abs=golden["tolerance"]["explanation"]
        )


def test_missing_value_uses_exported_default_route(built: Path) -> None:
    model = load(built / "model.json")
    vector = load(built / "golden-vectors.json")["vectors"][0]["ordered_feature_values"]
    vector[0] = None
    result = portable_raw_margin(model, vector)
    assert math.isfinite(result)
    assert model["missing_value_semantics"]["runtime_policy"] == "null_is_missing_nonfinite_is_rejected"


def test_golden_vectors_cover_complete_and_missing_runtime_paths(built: Path) -> None:
    vectors = load(built / "golden-vectors.json")["vectors"]
    assert any(None in vector["ordered_feature_values"] for vector in vectors)
    assert any(None not in vector["ordered_feature_values"] for vector in vectors)
