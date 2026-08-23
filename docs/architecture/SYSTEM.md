# System Architecture

> Replace this template with the real product architecture during project inception. Describe the **smallest credible system** that supports the hero journey; omit components that are not needed.

## System summary

Describe:
- product purpose and hero journey
- major actors
- only required runtime components
- required data stores
- required external integrations/models/services

## Architecture principles

- prefer the simplest architecture that supports real end-to-end behavior
- add infrastructure only when it earns its place through product/technical requirements
- keep boundaries understandable enough for rapid iteration
- do not fabricate production-scale topology for appearance

## Components

### Frontend

Framework: TBD / Not required

Responsibilities:
- product experience and browser state
- client-side validation/feedback
- API/service consumption when applicable

### Backend / service layer

Framework: TBD / Not required

Responsibilities when enabled:
- business logic
- server-side validation and authorization where protected boundaries exist
- external integration/model orchestration
- persistence access

### Database

Technology: TBD / Not required

Reason it exists: [persistence/query/relationship/history requirement]

### Infrastructure

Technology: TBD / Minimal

Only list infrastructure that is actually needed to run or demonstrate the product reliably.

## Primary data flow

```text
User
  ↓
Frontend
  ↓
[Backend/API if needed]
  ↓
[Database / model / external service if needed]
  ↓
Result presented through the product experience
```

## Interfaces

Document only meaningful cross-component/external boundaries. Use formal contracts when independently implemented components need stable schemas/interfaces.

## Trust boundaries

Document only boundaries that actually exist, such as browser→server, auth/authorization, DB policies, untrusted uploads/input, external providers, or privileged tool actions.

## Reliability-critical path

Identify the exact hero/demo journey that must remain dependable and the main failure states/fallbacks relevant to it.

## Security architecture

Record risk-appropriate controls only:
- secret handling always
- authentication/authorization if present
- sensitive data handling if present
- untrusted input/tool boundaries if present
- production-access restrictions always

## Observability

Add logs/metrics/traces/alerts only to the depth needed for development, debugging, product behavior, or a deliberate technical objective.
