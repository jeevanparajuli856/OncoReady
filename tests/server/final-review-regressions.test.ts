import {describe, expect, it} from "vitest";
import {WorkflowApplication} from "../../packages/server/src/application.js";
import {loadConfig} from "../../packages/server/src/config.js";
import {MemoryWorkflowRepository, createSeedProjections} from "../../packages/server/src/repository.js";
import {getTransportCommandPlan} from "../../frontend/src/launch/workflowCommands.js";

const scenario = "11111111-1111-4111-8111-111111111111" as const;
const workItemId = "55555555-5555-4555-8555-555555555555";
const transportId = "44444444-4444-4444-8444-444444444444";
const config = loadConfig({
  DATABASE_URL: "postgres://localhost/oncoready",
  CRON_SECRET: "Q6mT2xR9vK4pL8sN3wF7dH1yC5jB0zG!",
});

const transportAt = (status: string, version: number) => {
  const projections = createSeedProjections(scenario);
  projections.patient.transport = {
    ...(projections.patient.transport as Record<string, unknown>),
    transport_request_id: transportId,
    aggregate_version: version,
    status,
    acknowledgment_required: status === "patient_notified",
  };
  projections.staff.transport = {
    ...(projections.staff.transport as Record<string, unknown>),
    transport_request_id: transportId,
    aggregate_version: version,
    status,
  };
  projections.caregiver.transport = {
    ...(projections.caregiver.transport as Record<string, unknown>),
    status,
    acknowledgment_status: status === "patient_notified" ? "awaiting_patient" : "acknowledged",
  };
  projections.transport_coordinator.request = {
    ...(projections.transport_coordinator.request as Record<string, unknown>),
    transport_request_id: transportId,
    aggregate_version: version,
    status,
    plan_version: 1,
    outbound_plan_complete: true,
    return_plan_complete: true,
    acknowledgment_status: "acknowledged",
    acknowledged_plan_version: 1,
  };
  return projections;
};

describe("final-review workflow regressions", () => {
  it("moves staff work from open through assign and then assigned through acknowledge", async () => {
    const projections = createSeedProjections(scenario);
    projections.staff.work_items = [{
      work_item_id: workItemId,
      work_item_type: "clinical_review",
      owner_role: "triage_nurse",
      owner_display_name: null,
      status: "open",
      due_at: "2026-10-12T18:00:00.000Z",
      aggregate_version: 1,
    }];
    const repository = new MemoryWorkflowRepository(projections);
    const application = new WorkflowApplication(repository, config);

    await expect(application.workItem(workItemId, {
      scenario_id: scenario,
      actor_role: "staff",
      idempotency_key: "review-work-assign",
      expected_aggregate_version: 1,
      action: "assign",
      owner_id: "finals-triage_nurse-owner",
    })).resolves.toMatchObject({aggregate_version: 2});
    expect(await repository.getProjection(scenario, "staff")).toMatchObject({
      work_items: [expect.objectContaining({status: "assigned", aggregate_version: 2})],
    });

    await expect(application.workItem(workItemId, {
      scenario_id: scenario,
      actor_role: "staff",
      idempotency_key: "review-work-acknowledge",
      expected_aggregate_version: 2,
      action: "acknowledge",
    })).resolves.toMatchObject({aggregate_version: 3});
    expect(await repository.getProjection(scenario, "staff")).toMatchObject({
      work_items: [expect.objectContaining({status: "acknowledged", aggregate_version: 3})],
    });
  });

  it("lets only the patient acknowledge the current notified request while the coordinator waits", async () => {
    const coordinatorPlan = getTransportCommandPlan("patient_notified", "none");
    expect(coordinatorPlan).toMatchObject({mode: "waiting", label: "Waiting for Maria"});
    expect(coordinatorPlan?.action).toBeUndefined();

    const deniedRepository = new MemoryWorkflowRepository(transportAt("patient_notified", 8));
    await expect(new WorkflowApplication(deniedRepository, config).transport(transportId, {
      scenario_id: scenario,
      actor_role: "transport_coordinator",
      idempotency_key: "review-coordinator-ack-denied",
      expected_aggregate_version: 8,
      action: "acknowledge_patient",
    })).rejects.toMatchObject({status: 403, code: "forbidden_action"});

    const repository = new MemoryWorkflowRepository(transportAt("patient_notified", 8));
    await expect(new WorkflowApplication(repository, config).transport(transportId, {
      scenario_id: scenario,
      actor_role: "patient",
      idempotency_key: "review-patient-ack",
      expected_aggregate_version: 8,
      action: "acknowledge_patient",
    })).resolves.toMatchObject({aggregate_id: transportId, aggregate_version: 9});
    expect(await repository.getProjection(scenario, "patient")).toMatchObject({
      transport: {
        transport_request_id: transportId,
        aggregate_version: 9,
        status: "patient_acknowledged",
        acknowledgment_required: false,
      },
    });
  });

  it("completes directly from picked_up with evidence and escalates return_pending", async () => {
    const completionPlan = getTransportCommandPlan("picked_up", "none");
    expect(completionPlan).toMatchObject({action: "complete"});
    expect(completionPlan?.closureEvidence?.trim()).toBeTruthy();

    const incompleteRepository = new MemoryWorkflowRepository(transportAt("picked_up", 10));
    await expect(new WorkflowApplication(incompleteRepository, config).transport(transportId, {
      scenario_id: scenario,
      actor_role: "transport_coordinator",
      idempotency_key: "review-blank-completion",
      expected_aggregate_version: 10,
      action: "complete",
      closure_evidence: "   ",
    })).rejects.toMatchObject({status: 422, code: "invalid_transition"});

    const completionRepository = new MemoryWorkflowRepository(transportAt("picked_up", 10));
    await expect(new WorkflowApplication(completionRepository, config).transport(transportId, {
      scenario_id: scenario,
      actor_role: "transport_coordinator",
      idempotency_key: "review-complete",
      expected_aggregate_version: 10,
      action: "complete",
      closure_evidence: completionPlan!.closureEvidence,
    })).resolves.toMatchObject({aggregate_version: 11});
    expect(await completionRepository.getProjection(scenario, "transport_coordinator")).toMatchObject({
      request: {status: "completed", aggregate_version: 11},
    });

    const escalationPlan = getTransportCommandPlan("return_pending", "none");
    expect(escalationPlan).toMatchObject({action: "escalate_to_navigator"});
    const escalationRepository = new MemoryWorkflowRepository(transportAt("return_pending", 11));
    await expect(new WorkflowApplication(escalationRepository, config).transport(transportId, {
      scenario_id: scenario,
      actor_role: "transport_coordinator",
      idempotency_key: "review-return-escalation",
      expected_aggregate_version: 11,
      action: "escalate_to_navigator",
      reason: escalationPlan!.reason,
    })).resolves.toMatchObject({aggregate_version: 12});
    expect(await escalationRepository.getProjection(scenario, "transport_coordinator")).toMatchObject({
      request: {status: "escalated_to_navigator", aggregate_version: 12},
    });
  });
});
