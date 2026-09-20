from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

import pytest

from ml.train import (
    DEFAULT_OUTPUT,
    DISALLOWED_LEAKAGE_COLUMNS,
    FEATURE_NAMES,
    FORMAT_VERSION,
    MODEL_VERSION,
    build_artifacts,
    canonical_bytes,
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
    assert evaluation["dataset"]["contains_real_patient_data"] is False
    assert evaluation["leakage_review"]["passed"] is True
    assert all(value == 0 for value in evaluation["leakage_review"]["patient_overlap"].values())
    assert evaluation["leakage_review"]["feature_timestamp_violations"] == 0
    assert not (set(FEATURE_NAMES) & DISALLOWED_LEAKAGE_COLUMNS)
    assert evaluation["metrics"]["roc_auc"] >= evaluation["acceptance_gates"]["minimum_roc_auc"]
    assert evaluation["metrics"]["brier_score"] <= evaluation["acceptance_gates"]["maximum_brier_score"]
    assert all(group["passed"] for group in evaluation["subgroups"].values())


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
