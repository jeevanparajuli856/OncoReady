from __future__ import annotations

import json
from pathlib import Path


def test_railway_api_config_is_bounded_to_the_backend_service() -> None:
    repository_root = Path(__file__).resolve().parents[2]
    config = json.loads((repository_root / "backend" / "railway.json").read_text())

    assert config == {
        "$schema": "https://railway.com/railway.schema.json",
        "build": {
            "builder": "DOCKERFILE",
            "dockerfilePath": "Dockerfile",
            "watchPatterns": ["/backend/**"],
        },
        "deploy": {
            "preDeployCommand": "alembic -c alembic/alembic.ini upgrade head",
            "healthcheckPath": "/ready",
            "healthcheckTimeout": 30,
            "restartPolicyType": "ON_FAILURE",
            "restartPolicyMaxRetries": 3,
        },
    }
