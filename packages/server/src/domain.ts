import {randomUUID} from "node:crypto";
import type {Actor, AggregateType, CommandContext, WorkflowEvent} from "./types.js";
import {AppError} from "./types.js";
import type {CreateTransportCommand, ReadinessCommand, TransportCommand, WorkItemCommand} from "./schemas.js";

export interface EventDraft {
  aggregate_type: AggregateType;
  aggregate_id: string;
  aggregate_version: number;
  event_type: string;
  payload: Record<string, unknown>;
}

export function eventFromDraft(
  command: CommandContext,
  draft: EventDraft,
  actor: Actor,
  provenance: WorkflowEvent["provenance"],
  correlationId: string,
  now = new Date(),
): WorkflowEvent {
  const timestamp = now.toISOString();
  return {
    event_id: randomUUID(),
    schema_version: "1.0",
    scenario_id: command.scenario_id,
    ...draft,
    occurred_at: timestamp,
    recorded_at: timestamp,
    actor,
    provenance,
    correlation_id: correlationId,
    causation_id: null,
    idempotency_key: command.idempotency_key,
  };
}

function requireRole(actual: CommandContext["actor_role"], allowed: CommandContext["actor_role"][]): void {
  if (!allowed.includes(actual)) throw new AppError(403, "forbidden_action", `Role ${actual} cannot perform this action.`);
}

export function readinessDrafts(command: ReadinessCommand, dueAt: string): EventDraft[] {
  requireRole(command.actor_role, ["patient"]);
  const submissionId = randomUUID();
  const drafts: EventDraft[] = [{
    aggregate_type: "readiness_submission", aggregate_id: submissionId, aggregate_version: 1,
    event_type: "readiness.submission_recorded",
    payload: {submission_id: submissionId, channel: command.channel, transport_status: command.transport_status, clinical_concern_verbatim: command.clinical_concern_verbatim ?? null, callback_requested: command.callback_requested},
  }];
  const addWork = (barrierType: "clinical_concern" | "transportation" | "communication", workType: "clinical_review" | "transport_navigation" | "human_callback", ownerRole: "triage_nurse" | "transport_coordinator" | "navigator") => {
    const barrierId = randomUUID();
    const workItemId = randomUUID();
    drafts.push({aggregate_type: "barrier", aggregate_id: barrierId, aggregate_version: 1, event_type: "barrier.detected", payload: {barrier_id: barrierId, barrier_type: barrierType, source: "readiness_submission", status: "open"}});
    drafts.push({aggregate_type: "work_item", aggregate_id: workItemId, aggregate_version: 1, event_type: "work_item.created", payload: {work_item_id: workItemId, work_item_type: workType, owner_role: ownerRole, due_at: dueAt, source_barrier_id: barrierId}});
  };
  if (command.clinical_concern_verbatim?.trim()) addWork("clinical_concern", "clinical_review", "triage_nurse");
  if (command.transport_status !== "confirmed") addWork("transportation", "transport_navigation", "transport_coordinator");
  if (command.callback_requested) addWork("communication", "human_callback", "navigator");
  return drafts;
}

const workTransitions: Record<WorkItemCommand["action"], string> = {
  assign: "assigned", acknowledge: "acknowledged", accept: "accepted", request_information: "needs_information",
  record_action: "actioned", escalate: "escalated", inform_patient: "patient_informed",
  acknowledge_patient: "patient_acknowledged", close: "closed",
};

export function workItemDraft(command: WorkItemCommand, workItemId: string, currentStatus: string, nextVersion: number): EventDraft {
  requireRole(command.actor_role, ["staff", "transport_coordinator"]);
  const toStatus = workTransitions[command.action];
  if (!toStatus) throw new AppError(422, "invalid_transition", "Unsupported work item transition.");
  if (command.action === "close" && !command.closure_evidence?.trim()) throw new AppError(422, "validation_failed", "Closure evidence is required.");
  return {aggregate_type: "work_item", aggregate_id: workItemId, aggregate_version: nextVersion, event_type: "work_item.transitioned", payload: {work_item_id: workItemId, from_status: currentStatus, to_status: toStatus, owner_id: command.owner_id ?? null, note: command.note ?? null, closure_evidence: command.closure_evidence ?? null}};
}

export function createTransportDraft(command: CreateTransportCommand, transportId = randomUUID()): EventDraft[] {
  requireRole(command.actor_role, ["staff", "transport_coordinator"]);
  return [{aggregate_type: "transport_request", aggregate_id: transportId, aggregate_version: 1, event_type: "transport.status_changed", payload: {transport_request_id: transportId, provider: "partner_dispatch", from_status: "need_detected", to_status: "eligibility_reviewed", driver_alias: null, vehicle_description: null, failure_reason: null, closure_evidence: null}}];
}

const transportTransitions: Record<Exclude<TransportCommand["action"], "review_eligibility">, string> = {
  mark_request_ready: "request_ready", offer: "offered", accept: "accepted", assign_driver: "driver_assigned",
  mark_provider_unavailable: "provider_unavailable", decline: "declined", cancel: "cancelled", activate_backup: "backup_activated",
  notify_patient: "patient_notified", acknowledge_patient: "patient_acknowledged", mark_en_route: "en_route", arrive: "arrived",
  pick_up: "picked_up", complete: "completed", mark_return_pending: "return_pending", escalate_to_navigator: "escalated_to_navigator",
};

export function transportDraft(command: TransportCommand, transportId: string, currentStatus: string, nextVersion: number, planComplete: boolean): EventDraft {
  const patientAck = command.action === "acknowledge_patient";
  requireRole(command.actor_role, patientAck ? ["patient", "staff"] : ["staff", "transport_coordinator"]);
  if (command.action === "review_eligibility") {
    if ([command.eligible, command.service_area_confirmed, command.operating_window_confirmed, command.outbound_plan_complete, command.return_plan_complete].some((v) => v == null)) {
      throw new AppError(422, "validation_failed", "Eligibility review requires all eligibility and plan checks.");
    }
    return {aggregate_type: "transport_request", aggregate_id: transportId, aggregate_version: nextVersion, event_type: "transport.eligibility_reviewed", payload: {transport_request_id: transportId, eligible: command.eligible, service_area_confirmed: command.service_area_confirmed, operating_window_confirmed: command.operating_window_confirmed, outbound_plan_complete: command.outbound_plan_complete, return_plan_complete: command.return_plan_complete, reason: command.reason ?? null}};
  }
  const toStatus = transportTransitions[command.action];
  if (command.action === "assign_driver" && (!command.driver_alias || !command.vehicle_description)) throw new AppError(422, "validation_failed", "Driver alias and vehicle description are required.");
  if (command.action === "complete" && (!planComplete || currentStatus !== "picked_up" || !command.closure_evidence?.trim())) throw new AppError(422, "invalid_transition", "Completion requires both plan legs, pickup, and closure evidence.");
  return {aggregate_type: "transport_request", aggregate_id: transportId, aggregate_version: nextVersion, event_type: "transport.status_changed", payload: {transport_request_id: transportId, provider: "partner_dispatch", from_status: currentStatus, to_status: toStatus, driver_alias: command.driver_alias ?? null, vehicle_description: command.vehicle_description ?? null, failure_reason: command.reason ?? null, closure_evidence: command.closure_evidence ?? null}};
}

export function classifySms(body: string): "ready" | "ride_help" | "call_me" | "scheduling_help" | "repeat" | "unstructured" | "opt_out" {
  const normalized = body.trim().toLowerCase();
  if (["stop", "stopall", "unsubscribe", "cancel", "end", "quit"].includes(normalized)) return "opt_out";
  if (/\b(ride|transport|car)\b/.test(normalized)) return "ride_help";
  if (/\b(call|phone)\b/.test(normalized)) return "call_me";
  if (/\b(schedule|reschedule|time)\b/.test(normalized)) return "scheduling_help";
  if (/\b(repeat|again)\b/.test(normalized)) return "repeat";
  if (/\b(ready|yes|confirmed)\b/.test(normalized)) return "ready";
  return "unstructured";
}
