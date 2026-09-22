# Offline synthetic readiness model

This directory contains a deterministic, CPU-sized demonstration model. It
uses fictional `SYN-####` identifiers only and has no clinical or patient data.
The target is an invented unresolved practical-readiness blocker/supportive
follow-up need. Scores are model outputs, not clinical risk, causal effects, or
calibrated probabilities; workflow rules and human review remain authoritative.

Run the pipeline and notebook from the repository root:

```bash
python -m unittest ml.tests.test_pipeline
python -c 'from pathlib import Path; from ml.run_notebook import execute_notebook; execute_notebook(Path("ml/notebooks/readiness-demo.ipynb"), Path("."))'
```

The run writes `ml/data/synthetic-readiness.csv` and
`ml/artifacts/demo-insights.json` when the notebook is run from the repository
root. `run_pipeline(root)` always writes `root/data/synthetic-readiness.csv`
and `root/artifacts/demo-insights.json`. The committed notebook retains its latest outputs.

Limitations: this is synthetic operational data, deliberately small, and not
validated for diagnosis, triage, treatment, transport eligibility, prognosis,
or patient-level decision making.
