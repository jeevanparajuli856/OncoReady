"""Deterministic synthetic readiness pipeline used by the offline demo.

This module intentionally uses only the Python standard library.  Its target is
an invented ``supportive_follow_up`` label, not a clinical outcome or a
calibrated probability.  The exported scores are model outputs for synthetic
data and must not be interpreted as medical advice.
"""

from __future__ import annotations

import csv
import hashlib
import json
import math
import random
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, Mapping, Sequence

DATASET_SEED = 20260921
PATIENT_COUNT = 2000
CHECKPOINTS = ("T-7", "T-2", "T-1")
MODEL_FEATURES = (
    "transport_available",
    "callback_requested",
    "unresolved_barriers",
    "hours_to_treatment",
)
FORBIDDEN_FEATURES = frozenset(
    {"patient_key", "checkpoint", "supportive_follow_up", "patient_reply_text", "future_outcome"}
)
MODEL_VERSION = "synthetic-logistic-1.0"


def _canonical(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), allow_nan=False) + "\n").encode()


def _sha(value: Any) -> str:
    return hashlib.sha256(_canonical(value)).hexdigest()


def _sigmoid(value: float) -> float:
    value = max(-35.0, min(35.0, value))
    return 1.0 / (1.0 + math.exp(-value))


def _numeric_row(row: Mapping[str, Any]) -> list[float]:
    return [float(row[name]) for name in MODEL_FEATURES]


def generate_dataset() -> list[dict[str, Any]]:
    """Generate 2,000 fictional patients with three feature-time rows each."""
    rng = random.Random(DATASET_SEED)
    rows: list[dict[str, Any]] = []
    for patient_index in range(PATIENT_COUNT):
        patient_key = f"SYN-{patient_index:04d}"
        access = rng.random()
        contact = rng.random()
        barrier_base = rng.randint(0, 2)
        for checkpoint_index, checkpoint in enumerate(CHECKPOINTS):
            # A time-safe feature trajectory: values are available at the named checkpoint.
            transport = int((access + 0.08 * checkpoint_index) > 0.58)
            callback = int((contact + 0.05 * checkpoint_index) > 0.67)
            barriers = min(4, barrier_base + (1 if rng.random() < 0.18 else 0))
            hours = (168, 48, 24)[checkpoint_index] + rng.randint(-4, 4)
            margin = (
                # Balanced synthetic prevalence keeps the majority baseline
                # informative while preserving a fully pre-target rule.
                -0.35
                # Availability is protective for this synthetic readiness-blocker
                # target: a ride removes one practical access friction signal.
                - 0.95 * transport
                + 0.72 * callback
                + 0.34 * barriers
                - 0.006 * hours
                + rng.uniform(-0.38, 0.38)
            )
            target = int(rng.random() < _sigmoid(margin))
            rows.append(
                {
                    "patient_key": patient_key,
                    "checkpoint": checkpoint,
                    "transport_available": transport,
                    "callback_requested": callback,
                    "unresolved_barriers": barriers,
                    "hours_to_treatment": hours,
                    "supportive_follow_up": target,
                    # Deliberately present in the source rows to make leakage checks meaningful.
                    "patient_reply_text": "synthetic reply",
                }
            )
    return rows


def load_dataset(path: Path) -> list[dict[str, Any]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def patient_split(rows: Sequence[Mapping[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Split by patient identity (never by individual feature-time row)."""
    train: list[dict[str, Any]] = []
    test: list[dict[str, Any]] = []
    for row in rows:
        index = int(str(row["patient_key"])[4:])
        (train if index < int(PATIENT_COUNT * 0.8) else test).append(dict(row))
    return train, test


def assert_no_leakage(features: Iterable[str], columns: Iterable[str]) -> None:
    selected = set(features)
    unknown = selected - set(columns)
    if unknown:
        raise ValueError(f"forbidden or unavailable features: {', '.join(sorted(unknown))}")
    forbidden = selected & FORBIDDEN_FEATURES
    if forbidden:
        raise ValueError(f"forbidden features: {', '.join(sorted(forbidden))}")


@dataclass(frozen=True)
class LogisticModel:
    weights: tuple[float, ...]
    intercept: float
    version: str = MODEL_VERSION

    def raw_score(self, feature_values: Mapping[str, Any]) -> float:
        values = _numeric_row(feature_values)
        return _sigmoid(self.intercept + sum(weight * value for weight, value in zip(self.weights, values)))

    def predict_score(self, feature_values: Mapping[str, Any]) -> float:
        return round(self.raw_score(feature_values) * 100.0, 1)

    def factors(self, feature_values: Mapping[str, Any]) -> list[dict[str, Any]]:
        values = _numeric_row(feature_values)
        contributions = sorted(
            ((abs(weight * value), name, weight * value, value) for name, weight, value in zip(MODEL_FEATURES, self.weights, values)),
            reverse=True,
        )
        return [
            {"feature": name, "feature_value": value, "direction": "higher" if contribution >= 0 else "lower"}
            for _, name, contribution, value in contributions[:3]
        ]


def _fit(train_rows: Sequence[Mapping[str, Any]]) -> LogisticModel:
    weights = [0.0] * len(MODEL_FEATURES)
    intercept = 0.0
    scale = (1.0, 1.0, 2.0, 168.0)
    for _ in range(180):
        gradients = [0.0] * len(weights)
        intercept_gradient = 0.0
        for row in train_rows:
            values = [value / divisor for value, divisor in zip(_numeric_row(row), scale)]
            prediction = _sigmoid(intercept + sum(weight * value for weight, value in zip(weights, values)))
            error = prediction - float(row["supportive_follow_up"])
            intercept_gradient += error
            for index, value in enumerate(values):
                gradients[index] += error * value
        rate = 0.18 / len(train_rows)
        intercept -= rate * intercept_gradient
        weights = [weight - rate * gradient for weight, gradient in zip(weights, gradients)]
    # Store weights in the original units so callers can pass feature dictionaries directly.
    return LogisticModel(tuple(weight / divisor for weight, divisor in zip(weights, scale)), intercept)


def _confusion(model: LogisticModel, rows: Sequence[Mapping[str, Any]]) -> dict[str, Any]:
    matrix = [[0, 0], [0, 0]]
    for row in rows:
        actual = int(row["supportive_follow_up"])
        # A fixed, pre-declared operating point is used only for the held-out
        # confusion matrix; exported scores remain continuous model outputs.
        predicted = int(model.raw_score(row) >= 0.4)
        matrix[actual][predicted] += 1
    return {"labels": [0, 1], "matrix": matrix}


def _metrics(model: LogisticModel, rows: Sequence[Mapping[str, Any]]) -> dict[str, float]:
    correct = sum(int((model.raw_score(row) >= 0.4) == bool(int(row["supportive_follow_up"]))) for row in rows)
    return {"accuracy": round(correct / len(rows), 6), "rows": len(rows)}


@dataclass(frozen=True)
class PipelineResult:
    dataset_path: Path
    artifact_path: Path
    artifact: dict[str, Any]
    model: LogisticModel


def _write_csv(path: Path, rows: Sequence[Mapping[str, Any]]) -> None:
    fieldnames = ["patient_key", "checkpoint", *MODEL_FEATURES, "supportive_follow_up", "patient_reply_text"]
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def run_pipeline(output_dir: Path) -> PipelineResult:
    output_dir = Path(output_dir)
    data_dir = output_dir / "data"
    artifacts_dir = output_dir / "artifacts"
    data_dir.mkdir(parents=True, exist_ok=True)
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    rows = generate_dataset()
    dataset_path = data_dir / "readiness-training-set.csv"
    _write_csv(dataset_path, rows)
    train_rows, test_rows = patient_split(rows)
    model = _fit(train_rows)
    baseline_rate = sum(int(row["supportive_follow_up"]) for row in train_rows) / len(train_rows)
    baseline_prediction = int(baseline_rate >= 0.5)
    baseline_correct = sum(int(int(row["supportive_follow_up"]) == baseline_prediction) for row in test_rows)

    scenario_rows = {checkpoint: next(row for row in rows if row["patient_key"] == "SYN-0000" and row["checkpoint"] == checkpoint) for checkpoint in CHECKPOINTS}
    checkpoints = []
    for checkpoint in CHECKPOINTS:
        row = scenario_rows[checkpoint]
        features = {name: row[name] for name in MODEL_FEATURES}
        checkpoints.append(
            {
                "checkpoint": checkpoint,
                "score": model.predict_score(features),
                "factors": model.factors(features),
                "feature_values": features,
                "suggested_next_action": {"source": "workflow_rule", "model_derived": False, "text": "Offer supportive follow-up."},
            }
        )
    # Keep the what-if pair explicit and comparable: transport is the only
    # changed feature, and the baseline is always the unavailable state.
    baseline = {name: scenario_rows["T-1"][name] for name in MODEL_FEATURES}
    baseline["transport_available"] = 0
    variant = dict(baseline)
    variant["transport_available"] = 1
    what_if = {
        "baseline": {"feature_values": baseline, "score": model.predict_score(baseline), "factors": model.factors(baseline)},
        "transportation_available": {"feature_values": variant, "score": model.predict_score(variant), "factors": model.factors(variant)},
        "score_delta": round(model.predict_score(variant) - model.predict_score(baseline), 1),
        "model_version": model.version,
    }
    train_patients = {row["patient_key"] for row in train_rows}
    test_patients = {row["patient_key"] for row in test_rows}
    artifact: dict[str, Any] = {
        "model": {"version": model.version, "features": list(MODEL_FEATURES), "weights": list(model.weights), "intercept": model.intercept},
        "provenance": {"dataset_seed": DATASET_SEED, "dataset_sha256": hashlib.sha256(dataset_path.read_bytes()).hexdigest(), "fictional_identifiers": True},
        "evaluation": {
            "train_patients": len(train_patients), "test_patients": len(test_patients), "train_rows": len(train_rows), "test_rows": len(test_rows),
            "model": {**_metrics(model, test_rows), "classification_threshold": 0.4, "confusion_matrix": _confusion(model, test_rows)},
            "baseline": {"accuracy": round(baseline_correct / len(test_rows), 6), "rows": len(test_rows)},
        },
        "checkpoints": checkpoints,
        "what_if": what_if,
        "limitations": ["Synthetic data only.", "Scores are model outputs, not clinical risk, causal effects, or calibrated probabilities.", "Workflow rules and human review remain authoritative."],
    }
    artifact["integrity_hash"] = _sha(artifact)
    artifact_path = artifacts_dir / "readiness-insights.json"
    artifact_path.write_bytes(_canonical(artifact))
    return PipelineResult(dataset_path, artifact_path, artifact, model)


def validate_artifact(artifact: Mapping[str, Any]) -> None:
    expected = artifact.get("integrity_hash")
    if not isinstance(expected, str):
        raise ValueError("integrity hash missing")
    payload = dict(artifact)
    payload.pop("integrity_hash", None)
    if _sha(payload) != expected:
        raise ValueError("integrity check failed")
