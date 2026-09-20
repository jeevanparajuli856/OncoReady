# Supportive Outreach Ordering Model and Dataset Card

## Intended use

`supportive-outreach-2.0.0` is a deterministic LightGBM classifier with sigmoid calibration. It may only order optional staff outreach for the controlled OncoReady launch scenario. Explicit barriers, universal T-7/T-3/T-1 cadence, human clinical review, transportation eligibility, and workflow closure rules remain authoritative.

It must not diagnose, triage, clear treatment, cancel or reschedule treatment, determine transport eligibility, suppress an explicit barrier, or replace clinician judgment. It is not clinically validated and must not be used with real patient data.

## Dataset

The training data is generated in memory by `ml/train.py`; raw rows are neither downloaded nor committed.

- 12,000 synthetic encounters from 6,000 synthetic patients, with two encounters per patient.
- Strictly chronological and patient-disjoint split: 7,200 train, 2,400 calibration, and 2,400 future test encounters.
- Four scenario profiles and four calendar regimes create access, contact, caregiver, operational-disruption, recovery, and future-channel-shift variation.
- Structured feature-time missingness affects non-authoritative history/context fields. Explicit transport and callback declarations remain observed so deterministic workflow rules can always act on them.
- The future test period is a deliberately shifted regime. Evaluation separately covers early/late future windows, cadence, explicit-barrier, missing/complete, access-friction, and low-contact groups.
- Labels represent only a simulated propensity to accept optional supportive outreach. They are not observed clinical outcomes.

Synthetic data cannot establish real-world validity, fairness, causal benefit, calibration, workflow effectiveness, or safety. Its purpose is reproducible software and model-governance testing until an approved, consented, correctly labeled dataset exists.

## Public-source review and provenance

The following official public sources informed the decision about dataset fitness; none was downloaded or used to fit the model:

- [AHRQ MEPS 2023 Full Year Consolidated Public Use File](https://meps.ahrq.gov/mepsweb/data_stats/download_data_files_detail.jsp?cboPufNumber=HC-251&prfricon=yes) provides national access-to-care and utilization measures.
- [AHRQ MEPS public-transportation variable](https://meps.ahrq.gov/data_stats/download_data_files_codebook.jsp?PUFId=H233&varName=SDPUBTRANS) measures access to public transportation.
- [NCI HINTS public-use datasets](https://hints.cancer.gov/data/download-data.aspx) measure cancer and health communication knowledge, attitudes, and information use.
- [CDC/NCHS NHIS transportation-barrier report](https://www.cdc.gov/nchs/products/databriefs/db490.htm) provides population prevalence and subgroup estimates for unreliable transportation.
- ClinicalTrials.gov records such as [NCT04379570](https://clinicaltrials.gov/study/NCT04379570), [NCT05056077](https://clinicaltrials.gov/study/NCT05056077), and [NCT05526872](https://clinicaltrials.gov/study/NCT05526872) describe oncology text-message, supportive-care, adherence, or callback interventions.

These sources address adjacent prevalence, communication, screening, adherence, or intervention questions. They do not provide an open individual-level dataset containing OncoReady's exact pre-treatment feature-time snapshot and the subsequent target, acceptance of optional supportive outreach. Relabeling no-show, mortality, screening completion, medication adherence, or broad survey responses as that target would be scientifically misleading. Restricted or identifiable records are out of scope.

## Reproduction

Create an isolated Python environment, install the pinned packages in `ml/requirements.txt`, then run:

```bash
python ml/train.py
python -m pytest -q tests/ml
```

The generator seed is `20260920`; the training timestamp is fixed for reproducibility. The command regenerates `evaluation.json`, `model.json`, `golden-vectors.json`, and `manifest.json` under the stable runtime path `artifacts/ml/supportive-outreach-v1/`.

## Evaluation and release gates

The v2 held-out future test set records ROC AUC, Brier score, log loss, expected calibration error, per-subgroup metrics, missingness, patient overlap, feature/outcome timestamp checks, and split time ranges in `evaluation.json`. Release requires:

- ROC AUC at least 0.65;
- Brier score at most 0.25 and expected calibration error at most 0.08;
- at least 100 cases per reviewed subgroup, subgroup Brier score at most 0.25, and subgroup calibration error at most 0.10;
- zero patient overlap, zero feature-after-outcome violations, no prohibited leakage names, and strictly chronological splits;
- exact portable-tree parity, TreeSHAP sum parity, manifest hashes, and complete plus missing-value golden vectors.

Committed v2 evaluation (2,400-case future holdout): ROC AUC `0.7024`, Brier score `0.1657`, log loss `0.5055`, and expected calibration error `0.0163`. All reviewed subgroup gates pass. The full-12,000-case matrix has a `4.92%` missing-cell rate across permitted fields, and 4,460 encounters contain at least one missing value.

The TypeScript runtime verifies the fixed artifact path, schema/version relationships, hashes, and golden parity. Missing, stale, malformed, mismatched, or unreviewed inputs fail closed to `Score unavailable`.
