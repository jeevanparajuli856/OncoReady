"""Build the reviewed, portable supportive-outreach artifact set.

The generated classifier orders optional staff outreach only. Explicit barriers,
universal cadence, human clinical review, and transport eligibility rules remain
authoritative. The data below is deterministic and wholly synthetic.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Any

import lightgbm as lgb
import numpy as np
import pandas as pd
import scipy
import sklearn
import shap
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import brier_score_loss, log_loss, roc_auc_score


SEED = 20260920
TRAINING_TIMESTAMP = "2026-09-20T00:00:00Z"
MODEL_VERSION = "supportive-outreach-2.0.0"
FEATURE_SCHEMA_VERSION = "supportive-outreach-features-1"
FORMAT_VERSION = "oncoready-lightgbm-portable-v1"
DEFAULT_OUTPUT = Path(__file__).resolve().parents[1] / "artifacts" / "ml" / "supportive-outreach-v1"
DEFAULT_CASE_COUNT = 12_000
ENCOUNTERS_PER_PATIENT = 2


@dataclass(frozen=True)
class Feature:
    name: str
    kind: str
    minimum: float
    maximum: float
    display_name: str

    def schema(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "type": self.kind,
            "minimum": self.minimum,
            "maximum": self.maximum,
            "missing_allowed": True,
            "missing_value": None,
        }


FEATURES = (
    Feature("hours_to_treatment", "number", 0, 168, "Hours to treatment"),
    Feature("transport_help", "binary", 0, 1, "Transportation help requested"),
    Feature("callback_requested", "binary", 0, 1, "Human callback requested"),
    Feature("prior_unresolved_barriers", "integer", 0, 6, "Prior unresolved barriers"),
    Feature("prior_contact_failures", "integer", 0, 5, "Prior contact failures"),
    Feature("hours_since_last_contact", "number", 0, 336, "Hours since last contact"),
    Feature("transport_cutoff_hours", "number", -24, 168, "Hours to transport cutoff"),
    Feature("caregiver_transport_permission", "binary", 0, 1, "Caregiver logistics permission"),
    Feature("nonurgent_clinical_concern", "binary", 0, 1, "Non-urgent concern awaiting review"),
)
FEATURE_NAMES = [feature.name for feature in FEATURES]
DISALLOWED_LEAKAGE_COLUMNS = {
    "label",
    "outcome",
    "final_disposition",
    "responded",
    "response_recorded_at",
    "closure_status",
    "provider_success",
}


def canonical_bytes(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), allow_nan=False) + "\n").encode()


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def write_json(path: Path, value: Any) -> str:
    encoded = canonical_bytes(value)
    path.write_bytes(encoded)
    return sha256_bytes(encoded)


def sigmoid(value: np.ndarray | float) -> np.ndarray | float:
    return 1.0 / (1.0 + np.exp(-np.clip(value, -40.0, 40.0)))


def expected_calibration_error(labels: np.ndarray, probabilities: np.ndarray, bins: int = 10) -> float:
    edges = np.linspace(0.0, 1.0, bins + 1)
    bucket = np.clip(np.digitize(probabilities, edges[1:-1], right=True), 0, bins - 1)
    error = 0.0
    for bin_index in range(bins):
        mask = bucket == bin_index
        if mask.any():
            error += float(mask.mean()) * abs(float(labels[mask].mean()) - float(probabilities[mask].mean()))
    return error


def generate_synthetic_rows(count: int = DEFAULT_CASE_COUNT) -> dict[str, Any]:
    if count < DEFAULT_CASE_COUNT or count % ENCOUNTERS_PER_PATIENT:
        raise ValueError(f"count must be at least {DEFAULT_CASE_COUNT} and divisible by {ENCOUNTERS_PER_PATIENT}")

    rng = np.random.default_rng(SEED)
    start = datetime(2024, 1, 1, tzinfo=UTC)
    values = np.empty((count, len(FEATURES)), dtype=float)
    latent_values = np.empty_like(values)
    patient_ids: list[str] = []
    observed_at: list[datetime] = []
    outcome_at: list[datetime] = []
    scenario_profiles: list[str] = []
    calendar_regimes: list[str] = []
    patient_count = count // ENCOUNTERS_PER_PATIENT

    profile_names = np.asarray(("routine", "access_friction", "low_contact", "caregiver_supported"))
    for patient_index in range(patient_count):
        patient_fraction = patient_index / max(patient_count - 1, 1)
        profile = str(rng.choice(profile_names, p=(0.46, 0.22, 0.19, 0.13)))
        if patient_fraction < 0.35:
            regime = "baseline"
        elif patient_fraction < 0.60:
            regime = "transport_disruption"
        elif patient_fraction < 0.80:
            regime = "recovery"
        else:
            regime = "future_channel_shift"

        patient_access_friction = rng.beta(2.0, 5.0) + (0.32 if profile == "access_friction" else 0.0)
        patient_contact_friction = rng.beta(2.2, 4.8) + (0.34 if profile == "low_contact" else 0.0)
        caregiver_support = rng.beta(4.0, 2.5) + (0.25 if profile == "caregiver_supported" else 0.0)
        continuity_complexity = rng.beta(2.1, 3.5)
        patient_id = f"synthetic-patient-{patient_index:05d}"
        patient_start = start + timedelta(hours=patient_index * 3)

        for encounter_index in range(ENCOUNTERS_PER_PATIENT):
            index = patient_index * ENCOUNTERS_PER_PATIENT + encounter_index
            cadence = (168, 72, 24)[(patient_index + encounter_index) % 3]
            hours_to_treatment = float(np.clip(cadence + rng.normal(0, 7), 0, 168))
            disruption = 0.12 if regime == "transport_disruption" else 0.0
            transport_probability = np.clip(0.08 + 0.48 * patient_access_friction + disruption, 0.03, 0.86)
            callback_probability = np.clip(
                0.10 + 0.42 * patient_contact_friction + 0.10 * continuity_complexity,
                0.03,
                0.82,
            )
            transport_help = int(rng.random() < transport_probability)
            callback_requested = int(rng.random() < callback_probability)
            prior_unresolved = int(np.clip(rng.poisson(0.4 + 2.1 * continuity_complexity), 0, 6))
            prior_failures = int(np.clip(rng.poisson(0.25 + 2.0 * patient_contact_friction), 0, 5))
            since_contact = float(np.clip(rng.gamma(2.1, 37.0 + 20.0 * patient_contact_friction), 0, 336))
            cutoff_hours = float(np.clip(hours_to_treatment - rng.uniform(10, 58), -24, 168))
            caregiver_permission = int(rng.random() < np.clip(0.20 + 0.64 * caregiver_support, 0.05, 0.92))
            nonurgent_concern = int(rng.random() < np.clip(0.10 + 0.36 * continuity_complexity, 0.04, 0.64))
            latent_values[index] = (
                hours_to_treatment,
                transport_help,
                callback_requested,
                prior_unresolved,
                prior_failures,
                since_contact,
                cutoff_hours,
                caregiver_permission,
                nonurgent_concern,
            )
            values[index] = latent_values[index]

            # Missingness is structured and feature-time safe. Explicit barrier
            # fields stay observed because deterministic workflow rules, not the
            # model, must always act on those declarations.
            missing_probabilities = {
                3: 0.025 + 0.035 * continuity_complexity,
                4: 0.035 + 0.050 * patient_contact_friction,
                5: 0.055 + 0.090 * patient_contact_friction + (0.035 if regime == "future_channel_shift" else 0.0),
                6: 0.050 + (0.085 if not transport_help else 0.015) + disruption,
                7: 0.055 + 0.100 * (1.0 - min(caregiver_support, 1.0)),
                8: 0.020,
            }
            for feature_index, probability in missing_probabilities.items():
                if rng.random() < probability:
                    values[index, feature_index] = np.nan

            feature_time = patient_start + timedelta(hours=encounter_index)
            patient_ids.append(patient_id)
            observed_at.append(feature_time)
            outcome_at.append(feature_time + timedelta(hours=float(rng.uniform(24, 72))))
            scenario_profiles.append(profile)
            calendar_regimes.append(regime)

    # Synthetic propensity for accepting optional supportive outreach. This is
    # not a clinical outcome, treatment recommendation, or eligibility label.
    # The regime and interaction terms create a deliberately imperfect future
    # shift so the chronological holdout tests more than IID interpolation.
    profile_offset = np.asarray(
        [
            {"routine": 0.0, "access_friction": 0.18, "low_contact": -0.22, "caregiver_supported": 0.12}[profile]
            for profile in scenario_profiles
        ]
    )
    regime_offset = np.asarray(
        [
            {"baseline": 0.0, "transport_disruption": 0.16, "recovery": -0.08, "future_channel_shift": -0.18}[regime]
            for regime in calendar_regimes
        ]
    )
    z = (
        -1.95
        + 0.92 * latent_values[:, 1]
        + 0.78 * latent_values[:, 2]
        + 0.23 * latent_values[:, 3]
        + 0.31 * latent_values[:, 4]
        + 0.0038 * latent_values[:, 5]
        - 0.0055 * latent_values[:, 0]
        - 0.0035 * latent_values[:, 6]
        + 0.34 * latent_values[:, 8]
        - 0.16 * latent_values[:, 7]
        + 0.26 * latent_values[:, 1] * latent_values[:, 2]
        + profile_offset
        + regime_offset
        + rng.normal(0, 0.42, count)
    )
    probability = sigmoid(z)
    labels = rng.binomial(1, probability).astype(int)
    return {
        "values": values,
        "labels": labels,
        "patient_ids": patient_ids,
        "feature_observed_at": observed_at,
        "outcome_observed_at": outcome_at,
        "scenario_profiles": np.asarray(scenario_profiles),
        "calendar_regimes": np.asarray(calendar_regimes),
    }


def partition_rows(data: dict[str, Any]) -> dict[str, np.ndarray]:
    patient_ids = np.asarray(data["patient_ids"])
    ordered_patients = list(dict.fromkeys(data["patient_ids"]))
    train_end = int(len(ordered_patients) * 0.60)
    calibration_end = int(len(ordered_patients) * 0.80)
    groups = {
        "train": set(ordered_patients[:train_end]),
        "calibration": set(ordered_patients[train_end:calibration_end]),
        "test": set(ordered_patients[calibration_end:]),
    }
    return {
        name: np.flatnonzero(np.isin(patient_ids, list(patient_group)))
        for name, patient_group in groups.items()
    }


def portable_tree_value(node: dict[str, Any], values: list[float | None]) -> float:
    if "leaf_value" in node:
        return float(node["leaf_value"])
    feature_value = values[int(node["split_feature"])]
    if feature_value is None or (isinstance(feature_value, float) and math.isnan(feature_value)):
        go_left = bool(node["default_left"])
    else:
        decision = node.get("decision_type", "<=")
        if decision != "<=":
            raise ValueError(f"unsupported LightGBM decision type: {decision}")
        go_left = float(feature_value) <= float(node["threshold"])
    return portable_tree_value(node["left_child"] if go_left else node["right_child"], values)


def portable_raw_margin(model_artifact: dict[str, Any], values: list[float | None]) -> float:
    if len(values) != len(model_artifact["features"]):
        raise ValueError("feature vector length does not match artifact")
    return sum(portable_tree_value(tree["tree_structure"], values) for tree in model_artifact["trees"])


def build_artifacts(output: Path) -> dict[str, str]:
    data = generate_synthetic_rows()
    split = partition_rows(data)
    x = data["values"]
    y = data["labels"]

    model = lgb.LGBMClassifier(
        objective="binary",
        n_estimators=32,
        learning_rate=0.06,
        num_leaves=7,
        max_depth=3,
        min_child_samples=24,
        subsample=1.0,
        colsample_bytree=1.0,
        reg_lambda=0.2,
        random_state=SEED,
        deterministic=True,
        force_col_wise=True,
        n_jobs=1,
        verbosity=-1,
    )
    model.fit(x[split["train"]], y[split["train"]], feature_name=FEATURE_NAMES)

    calibration_margin = model.booster_.predict(x[split["calibration"]], raw_score=True)
    calibrator = LogisticRegression(C=100, solver="liblinear", random_state=SEED)
    calibrator.fit(calibration_margin.reshape(-1, 1), y[split["calibration"]])
    coefficient = float(calibrator.coef_[0, 0])
    intercept = float(calibrator.intercept_[0])

    test_margin = model.booster_.predict(x[split["test"]], raw_score=True)
    test_probability = sigmoid(coefficient * test_margin + intercept)
    test_labels = y[split["test"]]

    patient_sets = {
        name: {data["patient_ids"][int(index)] for index in indexes}
        for name, indexes in split.items()
    }
    overlap = {
        "train_calibration": len(patient_sets["train"] & patient_sets["calibration"]),
        "train_test": len(patient_sets["train"] & patient_sets["test"]),
        "calibration_test": len(patient_sets["calibration"] & patient_sets["test"]),
    }
    timestamp_violations = sum(
        feature_time > outcome_time
        for feature_time, outcome_time in zip(data["feature_observed_at"], data["outcome_observed_at"], strict=True)
    )
    leakage_names = sorted(set(FEATURE_NAMES) & DISALLOWED_LEAKAGE_COLUMNS)
    time_ranges = {
        name: {
            "first_feature_at": min(data["feature_observed_at"][int(index)] for index in indexes).isoformat().replace("+00:00", "Z"),
            "last_feature_at": max(data["feature_observed_at"][int(index)] for index in indexes).isoformat().replace("+00:00", "Z"),
        }
        for name, indexes in split.items()
    }
    chronological_split = (
        max(data["feature_observed_at"][int(index)] for index in split["train"])
        < min(data["feature_observed_at"][int(index)] for index in split["calibration"])
        and max(data["feature_observed_at"][int(index)] for index in split["calibration"])
        < min(data["feature_observed_at"][int(index)] for index in split["test"])
    )

    cadence = x[split["test"], 0]
    test_missing = np.isnan(x[split["test"]]).any(axis=1)
    test_profiles = data["scenario_profiles"][split["test"]]
    temporal_midpoint = len(test_labels) // 2
    early_future = np.zeros(len(test_labels), dtype=bool)
    early_future[:temporal_midpoint] = True
    subgroup_masks = {
        "t_minus_1": cadence <= 48,
        "t_minus_3": (cadence > 48) & (cadence <= 120),
        "t_minus_7": cadence > 120,
        "explicit_barrier": (x[split["test"], 1] == 1) | (x[split["test"], 2] == 1),
        "no_explicit_barrier": (x[split["test"], 1] == 0) & (x[split["test"], 2] == 0),
        "any_missing_feature": test_missing,
        "complete_case": ~test_missing,
        "access_friction_profile": test_profiles == "access_friction",
        "low_contact_profile": test_profiles == "low_contact",
        "future_early": early_future,
        "future_late": ~early_future,
    }
    subgroup_metrics: dict[str, Any] = {}
    for name, mask in subgroup_masks.items():
        subgroup_y = test_labels[mask]
        subgroup_probability = test_probability[mask]
        subgroup_brier = float(brier_score_loss(subgroup_y, subgroup_probability))
        subgroup_ece = expected_calibration_error(subgroup_y, subgroup_probability)
        subgroup_metrics[name] = {
            "count": int(mask.sum()),
            "positive_rate": float(subgroup_y.mean()),
            "mean_probability": float(subgroup_probability.mean()),
            "brier_score": subgroup_brier,
            "expected_calibration_error": subgroup_ece,
            "roc_auc": float(roc_auc_score(subgroup_y, subgroup_probability)) if len(np.unique(subgroup_y)) == 2 else None,
            "passed": int(mask.sum()) >= 100 and subgroup_brier <= 0.25 and subgroup_ece <= 0.10,
        }

    feature_missingness = {
        feature.name: {
            "count": int(np.isnan(x[:, feature_index]).sum()),
            "rate": float(np.isnan(x[:, feature_index]).mean()),
        }
        for feature_index, feature in enumerate(FEATURES)
    }
    profile_counts = {
        name: int((data["scenario_profiles"] == name).sum())
        for name in sorted(set(data["scenario_profiles"].tolist()))
    }
    regime_counts = {
        name: int((data["calendar_regimes"] == name).sum())
        for name in sorted(set(data["calendar_regimes"].tolist()))
    }
    overall_ece = expected_calibration_error(test_labels, test_probability)

    evaluation = {
        "schema_version": "1.0",
        "model_version": MODEL_VERSION,
        "dataset": {
            "kind": "deterministic_synthetic_supportive_outreach",
            "generator_seed": SEED,
            "row_count": len(y),
            "patient_count": len(set(data["patient_ids"])),
            "encounters_per_patient": ENCOUNTERS_PER_PATIENT,
            "contains_real_patient_data": False,
            "partition_policy": "chronological_and_patient_disjoint",
            "partitions": {name: int(len(indexes)) for name, indexes in split.items()},
            "scenario_profile_counts": profile_counts,
            "calendar_regime_counts": regime_counts,
            "missingness": {
                "overall_cell_rate": float(np.isnan(x).mean()),
                "rows_with_any_missing": int(np.isnan(x).any(axis=1).sum()),
                "by_feature": feature_missingness,
            },
        },
        "purpose": "staff_only_optional_supportive_outreach_ordering",
        "prohibited_uses": [
            "diagnosis",
            "triage",
            "treatment_clearance",
            "treatment_cancellation_or_rescheduling",
            "transport_eligibility",
            "suppressing_universal_cadence_or_explicit_barriers",
        ],
        "metrics": {
            "roc_auc": float(roc_auc_score(test_labels, test_probability)),
            "brier_score": float(brier_score_loss(test_labels, test_probability)),
            "log_loss": float(log_loss(test_labels, test_probability)),
            "expected_calibration_error": overall_ece,
        },
        "acceptance_gates": {
            "minimum_roc_auc": 0.65,
            "maximum_brier_score": 0.25,
            "maximum_expected_calibration_error": 0.08,
            "minimum_subgroup_rows": 100,
            "maximum_subgroup_brier_score": 0.25,
            "maximum_subgroup_expected_calibration_error": 0.10,
            "patient_overlap_must_be_zero": True,
            "feature_timestamp_violations_must_be_zero": True,
            "splits_must_be_strictly_chronological": True,
        },
        "leakage_review": {
            "patient_overlap": overlap,
            "feature_timestamp_violations": int(timestamp_violations),
            "disallowed_feature_names_present": leakage_names,
            "passed": (
                all(value == 0 for value in overlap.values())
                and timestamp_violations == 0
                and not leakage_names
                and chronological_split
            ),
        },
        "temporal_validation": {
            "strictly_chronological": chronological_split,
            "time_ranges": time_ranges,
            "future_holdout_regime": sorted(set(data["calendar_regimes"][split["test"]].tolist())),
            "passed": chronological_split,
        },
        "subgroups": subgroup_metrics,
    }
    if evaluation["metrics"]["roc_auc"] < evaluation["acceptance_gates"]["minimum_roc_auc"]:
        raise RuntimeError("synthetic held-out AUC failed the reviewed gate")
    if evaluation["metrics"]["brier_score"] > evaluation["acceptance_gates"]["maximum_brier_score"]:
        raise RuntimeError("synthetic held-out Brier score failed the reviewed gate")
    if evaluation["metrics"]["expected_calibration_error"] > evaluation["acceptance_gates"]["maximum_expected_calibration_error"]:
        raise RuntimeError("synthetic held-out calibration error failed the reviewed gate")
    if not evaluation["leakage_review"]["passed"]:
        raise RuntimeError("leakage review failed")
    if not all(group["passed"] for group in subgroup_metrics.values()):
        raise RuntimeError("subgroup stability gate failed")

    output.mkdir(parents=True, exist_ok=True)
    evaluation_hash = write_json(output / "evaluation.json", evaluation)

    dump = model.booster_.dump_model()
    explainer = shap.TreeExplainer(model.booster_, model_output="raw")
    expected_value_raw = explainer.expected_value
    expected_value = float(np.asarray(expected_value_raw).reshape(-1)[-1])
    model_artifact = {
        "format_version": FORMAT_VERSION,
        "model_version": MODEL_VERSION,
        "feature_schema_version": FEATURE_SCHEMA_VERSION,
        "features": [feature.schema() for feature in FEATURES],
        "missing_value_semantics": {
            "representation": None,
            "tree_routing": "lightgbm_default_left",
            "runtime_policy": "null_is_missing_nonfinite_is_rejected",
        },
        "objective": "binary_supportive_outreach_acceptance",
        "trees": [
            {
                "tree_index": int(tree["tree_index"]),
                "shrinkage": float(tree["shrinkage"]),
                "tree_structure": tree["tree_structure"],
            }
            for tree in dump["tree_info"]
        ],
        "calibrator": {
            "type": "sigmoid",
            "input": "raw_margin",
            "coefficient": coefficient,
            "intercept": intercept,
            "formula": "1 / (1 + exp(-(coefficient * raw_margin + intercept)))",
        },
        "explanation": {
            "method": "tree_shap_raw_margin",
            "expected_value": expected_value,
            "feature_display_names": {feature.name: feature.display_name for feature in FEATURES},
            "sum_invariant": "expected_value + sum(contributions) == raw_margin",
        },
        "training": {
            "generator_seed": SEED,
            "training_timestamp": TRAINING_TIMESTAMP,
            "library": "lightgbm",
            "library_version": lgb.__version__,
            "toolchain": {
                "numpy": np.__version__,
                "pandas": pd.__version__,
                "scipy": scipy.__version__,
                "scikit_learn": sklearn.__version__,
                "shap": shap.__version__,
            },
            "data_kind": "synthetic",
            "row_count": len(y),
            "patient_count": len(set(data["patient_ids"])),
            "partition_policy": "chronological_and_patient_disjoint",
        },
        "evaluation_manifest_sha256": evaluation_hash,
    }

    # Verify the portable representation before it becomes a runtime input.
    for row_index in split["test"][:24]:
        portable = portable_raw_margin(model_artifact, x[int(row_index)].tolist())
        native = float(model.booster_.predict(x[int(row_index)].reshape(1, -1), raw_score=True)[0])
        if not math.isclose(portable, native, rel_tol=0.0, abs_tol=1e-10):
            raise RuntimeError(f"portable tree mismatch: {portable} != {native}")

    model_hash = write_json(output / "model.json", model_artifact)

    test_indexes = [int(index) for index in split["test"]]
    complete_indexes = [index for index in test_indexes if not np.isnan(x[index]).any()]
    missing_indexes = [index for index in test_indexes if np.isnan(x[index]).any()]
    if len(complete_indexes) < 3 or len(missing_indexes) < 3:
        raise RuntimeError("golden vectors require both complete and missing held-out cases")
    vector_indexes = [
        complete_indexes[0],
        missing_indexes[0],
        complete_indexes[len(complete_indexes) // 2],
        missing_indexes[len(missing_indexes) // 2],
        complete_indexes[-1],
        missing_indexes[-1],
    ]
    golden_rows = x[vector_indexes]
    shap_values = np.asarray(explainer(golden_rows).values, dtype=float)
    if shap_values.ndim == 3:
        shap_values = shap_values[:, :, -1]
    golden_vectors: list[dict[str, Any]] = []
    for vector_index, row, contributions in zip(vector_indexes, golden_rows, shap_values, strict=True):
        feature_values = [None if np.isnan(value) else float(value) for value in row]
        raw_margin = portable_raw_margin(model_artifact, feature_values)
        calibrated = float(sigmoid(coefficient * raw_margin + intercept))
        if not math.isclose(expected_value + float(np.sum(contributions)), raw_margin, rel_tol=0.0, abs_tol=1e-7):
            raise RuntimeError("SHAP contributions do not sum to the raw margin")
        snapshot = {name: value for name, value in zip(FEATURE_NAMES, feature_values, strict=True)}
        golden_vectors.append(
            {
                "vector_id": f"held-out-{vector_index}",
                "features": snapshot,
                "ordered_feature_values": feature_values,
                "feature_snapshot_sha256": sha256_bytes(canonical_bytes(snapshot)),
                "raw_margin": raw_margin,
                "calibrated_probability": calibrated,
                "explanation": {
                    "base_value": expected_value,
                    "contributions": {
                        name: float(value)
                        for name, value in zip(FEATURE_NAMES, contributions, strict=True)
                    },
                },
            }
        )
    golden = {
        "schema_version": "1.0",
        "model_version": MODEL_VERSION,
        "feature_schema_version": FEATURE_SCHEMA_VERSION,
        "tolerance": {"raw_margin": 1e-10, "probability": 1e-10, "explanation": 1e-7},
        "vectors": golden_vectors,
    }
    golden_hash = write_json(output / "golden-vectors.json", golden)

    file_hashes = {
        "evaluation.json": evaluation_hash,
        "golden-vectors.json": golden_hash,
        "model.json": model_hash,
    }
    artifact_set_hash = sha256_bytes(canonical_bytes(file_hashes))
    manifest = {
        "schema_version": "1.0",
        "format_version": FORMAT_VERSION,
        "model_version": MODEL_VERSION,
        "feature_schema_version": FEATURE_SCHEMA_VERSION,
        "generated_at": TRAINING_TIMESTAMP,
        "files": file_hashes,
        "artifact_set_sha256": artifact_set_hash,
        "runtime_policy": "fail_closed_to_score_unavailable_on_any_validation_or_parity_failure",
    }
    manifest_hash = write_json(output / "manifest.json", manifest)
    return {**file_hashes, "manifest.json": manifest_hash}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    hashes = build_artifacts(args.output)
    print(json.dumps({"output": str(args.output), "sha256": hashes}, sort_keys=True))


if __name__ == "__main__":
    main()
