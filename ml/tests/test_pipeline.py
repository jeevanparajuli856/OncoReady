from __future__ import annotations

import csv
import hashlib
import json
import re
import tempfile
import unittest
from pathlib import Path

from ml.run_notebook import execute_notebook
from ml.train import (
    CHECKPOINTS,
    DATASET_SEED,
    FORBIDDEN_FEATURES,
    MODEL_FEATURES,
    PATIENT_COUNT,
    assert_no_leakage,
    load_dataset,
    patient_split,
    run_pipeline,
    validate_artifact,
)


class SyntheticReadinessPipelineTests(unittest.TestCase):
    def test_pipeline_is_reproducible_and_contains_only_fictional_identifiers(self) -> None:
        with tempfile.TemporaryDirectory() as first_dir, tempfile.TemporaryDirectory() as second_dir:
            first = run_pipeline(Path(first_dir))
            second = run_pipeline(Path(second_dir))

            first_csv = first.dataset_path.read_bytes()
            second_csv = second.dataset_path.read_bytes()
            self.assertEqual(first_csv, second_csv)
            self.assertEqual(hashlib.sha256(first_csv).hexdigest(), first.artifact["provenance"]["dataset_sha256"])

            rows = load_dataset(first.dataset_path)
            self.assertEqual(PATIENT_COUNT * len(CHECKPOINTS), len(rows))
            self.assertEqual(PATIENT_COUNT, len({row["patient_key"] for row in rows}))
            self.assertTrue(all(re.fullmatch(r"SYN-\d{4}", row["patient_key"]) for row in rows))

            with first.dataset_path.open(newline="", encoding="utf-8") as handle:
                fieldnames = csv.DictReader(handle).fieldnames or []
            prohibited_identity_columns = {"name", "email", "phone", "date_of_birth", "address", "mrn"}
            self.assertTrue(prohibited_identity_columns.isdisjoint(fieldnames))
            self.assertEqual(DATASET_SEED, first.artifact["provenance"]["dataset_seed"])

            for stable_key in ("evaluation", "model", "checkpoints", "what_if", "limitations"):
                self.assertEqual(first.artifact[stable_key], second.artifact[stable_key])

    def test_patient_split_is_disjoint_and_forbidden_features_are_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as output_dir:
            result = run_pipeline(Path(output_dir))
            rows = load_dataset(result.dataset_path)
            train_rows, test_rows = patient_split(rows)
            train_patients = {row["patient_key"] for row in train_rows}
            test_patients = {row["patient_key"] for row in test_rows}

            self.assertFalse(train_patients & test_patients)
            self.assertEqual(PATIENT_COUNT, len(train_patients | test_patients))
            self.assertTrue(FORBIDDEN_FEATURES.isdisjoint(MODEL_FEATURES))
            assert_no_leakage(MODEL_FEATURES, rows[0].keys())
            with self.assertRaisesRegex(ValueError, "forbidden"):
                assert_no_leakage((*MODEL_FEATURES, "patient_reply_text"), rows[0].keys())

            evaluation = result.artifact["evaluation"]
            confusion = evaluation["model"]["confusion_matrix"]
            self.assertEqual(evaluation["test_rows"], sum(sum(row) for row in confusion["matrix"]))
            self.assertEqual(evaluation["test_patients"], len(test_patients))
            self.assertEqual(evaluation["train_patients"], len(train_patients))

    def test_exported_scenario_and_transportation_what_if_are_model_outputs(self) -> None:
        with tempfile.TemporaryDirectory() as output_dir:
            result = run_pipeline(Path(output_dir))
            artifact = result.artifact
            validate_artifact(artifact)

            self.assertEqual(["T-7", "T-2", "T-1"], [item["checkpoint"] for item in artifact["checkpoints"]])
            for checkpoint in artifact["checkpoints"]:
                expected = result.model.predict_score(checkpoint["feature_values"])
                self.assertEqual(expected, checkpoint["score"])
                self.assertLessEqual(len(checkpoint["factors"]), 3)
                self.assertEqual("workflow_rule", checkpoint["suggested_next_action"]["source"])
                self.assertFalse(checkpoint["suggested_next_action"]["model_derived"])

            comparison = artifact["what_if"]
            baseline = comparison["baseline"]["feature_values"]
            variant = comparison["transportation_available"]["feature_values"]
            changed = [feature for feature in MODEL_FEATURES if baseline[feature] != variant[feature]]
            self.assertEqual(["transport_available"], changed)
            self.assertEqual(result.model.predict_score(baseline), comparison["baseline"]["score"])
            self.assertEqual(result.model.predict_score(variant), comparison["transportation_available"]["score"])
            self.assertEqual(
                round(comparison["transportation_available"]["score"] - comparison["baseline"]["score"], 1),
                comparison["score_delta"],
            )
            self.assertEqual(artifact["model"]["version"], comparison["model_version"])

            tampered = json.loads(json.dumps(artifact))
            tampered["checkpoints"][0]["score"] += 1
            with self.assertRaisesRegex(ValueError, "integrity"):
                validate_artifact(tampered)

    def test_notebook_executes_cleanly_and_saves_required_evidence(self) -> None:
        notebook_source = Path(__file__).parents[1] / "notebooks" / "readiness-model.ipynb"
        with tempfile.TemporaryDirectory() as output_dir:
            output_root = Path(output_dir)
            notebook_copy = output_root / "readiness-model.ipynb"
            notebook_copy.write_bytes(notebook_source.read_bytes())

            executed = execute_notebook(notebook_copy, pipeline_root=output_root)
            markdown = "\n".join(
                "".join(cell.get("source", []))
                for cell in executed["cells"]
                if cell.get("cell_type") == "markdown"
            ).lower()
            streams = "\n".join(
                "".join(output.get("text", []))
                for cell in executed["cells"]
                for output in cell.get("outputs", [])
                if output.get("output_type") == "stream"
            )

            for required_topic in (
                "synthetic",
                "target",
                "feature availability",
                "patient-separated",
                "baseline",
                "held-out",
                "limitations",
            ):
                self.assertIn(required_topic, markdown)
            self.assertIn("Confusion matrix", streams)
            self.assertIn("T-7", streams)
            self.assertIn("Transportation sensitivity", streams)
            self.assertFalse(
                any(
                    output.get("output_type") == "error"
                    for cell in executed["cells"]
                    for output in cell.get("outputs", [])
                )
            )
            self.assertTrue((output_root / "artifacts" / "readiness-insights.json").is_file())


if __name__ == "__main__":
    unittest.main()
