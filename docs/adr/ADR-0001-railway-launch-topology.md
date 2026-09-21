# ADR-0001 — Railway Launch Topology

## Status

Accepted — September 21, 2026

## Context

The completed frontend-first journey now needs durable multi-role workflow state, server-enforced access, external adapter boundaries, FHIR processing, model inference, and one manageable deployment for the finals path. The product does not need a distributed system.

## Decision

Use one Railway project with three services:

- `web`: React + TypeScript + Vite;
- `api`: Python + FastAPI;
- `Postgres`: Railway PostgreSQL reached over private networking.

Use Alembic migrations under `backend/alembic/versions`. Keep the bounded scheduler, workflow engine, integration adapters, metrics, FHIR export, and ML inference in the API service. Do not add Redis, Kafka, a separate worker, Kubernetes, or a microservice split unless measured requirements justify them.

## Alternatives Considered

- Keep the application browser-only: rejected because durable shared state, secrets, OAuth, authorization, and external adapters require a server boundary.
- Deploy separate platforms for frontend, API, and database: rejected because it adds operational surface without improving the finals journey.
- Add queue/worker infrastructure immediately: rejected because the bounded workload does not yet justify it.

## Consequences

### Positive

- One controlled environment and clear service ownership.
- Real persistence, authorization, integration, and audit boundaries.
- Small enough to operate and rehearse reliably.

### Negative

- The API service temporarily owns both request handling and bounded scheduling.
- Railway becomes a launch-environment dependency.

### Security Implications

- Secrets remain in Railway server-side configuration.
- PostgreSQL is private; the API is the authorization boundary.
- Sensitive integration tasks require dedicated review when selected by architecture.

### Operational Implications

- Deployments require explicit roots/watch paths, migration gating, liveness/readiness checks, and post-deploy critical-path verification.
- Production promotion remains a separate human-approved operation.
