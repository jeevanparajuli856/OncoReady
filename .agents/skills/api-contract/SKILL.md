---
name: api-contract
description: Create or modify a stable API/interface contract only when architecture declares execution.contract_required=true.
---

# API Contract Workflow

Use this skill only when `architecture-report.json.execution.contract_required=true` or the orchestrator explicitly reconciles the task to require a contract.

1. Read feature requirements and architecture.
2. Identify the exact independently consumed interface that needs stability.
3. Reuse existing contracts when possible.
4. Define only required request/response/event schemas and meaningful auth/error behavior.
5. Add pagination/filtering/idempotency only when the product behavior needs them.
6. Update the applicable contract artifact before implementation.
7. Validate the contract.
8. Frontend/backend/other consumers must implement the approved interface rather than invent behavior.

Do not create formal contracts for local function boundaries or speculative future APIs merely to satisfy process.
