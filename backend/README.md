# OncoReady API

**Approved technology:** Python 3 + FastAPI.

The backend is enabled in the approved launch architecture but is not scaffolded by the planning reconciliation. `RAIL-001` owns the first implementation slice.

Planned responsibilities:

- server-managed OncoReady sessions and role/center authorization;
- durable workflow commands, events, projections, outbox, and idempotency;
- read-only Epic SMART/FHIR authorization, retrieval, normalization, provenance, and snapshot fallback;
- CareLink and provider-ready adapter boundaries;
- metrics, validated OncoReady FHIR evidence, and model inference;
- liveness/readiness checks and Alembic migration gating.

Implementation must follow [`docs/architecture/SYSTEM.md`](../docs/architecture/SYSTEM.md), declared task contracts, `backend/AGENTS.md`, and the repository security/testing standards. Do not place credentials, tokens, real patient data, or production configuration in this directory.
