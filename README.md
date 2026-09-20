# OncoReady

OncoReady turns an upcoming-treatment readiness response into separately owned
clinical, transportation, and callback work, then shows the patient when the
complete plan is confirmed.

The launch journey uses controlled synthetic data. It does not represent
production identity, real patient care, Ochsner/Epic connectivity, clinical
validation, or autonomous clinical authority.

## Launch stack

- React, TypeScript, and Vite frontend
- long-running Node.js/TypeScript API
- Railway PostgreSQL with Git-tracked migrations
- Twilio SMS and ElevenLabs voice through one allowlisted test recipient
- deterministic CareLink transportation workflow
- governed OpenAPI and workflow-event contracts
- offline LightGBM/calibration/SHAP artifact generation with TypeScript runtime checks

The frontend, API, and PostgreSQL run as separate services in one Railway
project. PostgreSQL is private; browser traffic reaches only the public web and
API domains.

## Authoritative documentation

- Product and journey: `docs/PROJECT.md`
- Launch requirements: `docs/features/LAUNCH-001.md`
- System boundary: `docs/architecture/SYSTEM.md`
- External account/setup checklist: `docs/architecture/LAUNCH-001-EXTERNAL-SETUP.md`
- Governed interfaces: `contracts/`
- Current task state: `.ai/tasks/LAUNCH-001/task.json`

## Local configuration

The ignored root `.env` is for backend/database/provider configuration. Use
`.env.example` as the variable reference. The ignored `frontend/.env.local`
contains only the public API base URL; never put provider or database secrets
in a `VITE_` variable.

Keep these switches disabled until the controlled-provider preflight passes:

```text
EXTERNAL_ACTIONS_ENABLED=false
TWILIO_SMS_ENABLED=false
ELEVENLABS_VOICE_ENABLED=false
```

Never commit or paste API keys, auth tokens, database URLs, webhook secrets,
scenario tokens, cron secrets, or the allowlisted phone number into chat.

## Agent control plane

```bash
python3 -m pip install -r requirements-agent.txt
python3 scripts/agentctl.py project validate
python3 scripts/agentctl.py task validate LAUNCH-001
python3 scripts/agentctl.py verify LAUNCH-001
```

Normal lifecycle progress uses `task advance`; deployment and production
promotion remain deliberate human actions after the required verification,
security review, and final review.
