import {randomUUID} from "node:crypto";
import type {ServerConfig} from "./config.js";
import {createTransportDraft, eventFromDraft, readinessDrafts, transportDraft, workItemDraft} from "./domain.js";
import type {ActorRole, WorkflowEvent} from "./types.js";
import {AppError} from "./types.js";
import type {CommunicationCommand, CreateTransportCommand, ReadinessCommand, ResetCommand, TransportCommand, WorkItemCommand} from "./schemas.js";
import type {CommandSnapshot, WorkflowRepository} from "./repository.js";
import {dispatchOutbox} from "./providers.js";

const actor = (role: ActorRole) => ({role, actor_id: `finals_${role}`});
const plusHours = (hours: number) => new Date(Date.now() + hours * 3_600_000).toISOString();

function bumpProjection(projection: Record<string, unknown>, version: number, readinessStatus?: string): Record<string, unknown> {
  return {...projection, scenario_version: version, as_of: new Date().toISOString(), ...(readinessStatus ? {readiness_status: readinessStatus} : {})};
}

function projectReadiness(snapshot: CommandSnapshot, events: WorkflowEvent[], nextVersion: number): Partial<Record<ActorRole, Record<string, unknown>>> {
  const staff = bumpProjection(snapshot.projections.staff, nextVersion, "at_risk");
  const patient = bumpProjection(snapshot.projections.patient, nextVersion, "at_risk");
  const caregiver = bumpProjection(snapshot.projections.caregiver, nextVersion, "at_risk");
  const transport = bumpProjection(snapshot.projections.transport_coordinator, nextVersion, "at_risk");
  const barriers = [...(staff.barriers as unknown[] ?? [])];
  const workItems = [...(staff.work_items as unknown[] ?? [])];
  const patientBlockers = [...(patient.blockers as unknown[] ?? [])];
  for (const event of events) {
    if (event.event_type === "barrier.detected") {
      barriers.push({barrier_id: event.payload.barrier_id, barrier_type: event.payload.barrier_type, status: "open", source: event.payload.source, ...(event.payload.barrier_type === "clinical_concern" ? {patient_verbatim: events[0]?.payload.clinical_concern_verbatim ?? null} : {})});
    }
    if (event.event_type === "work_item.created") {
      workItems.push({work_item_id: event.payload.work_item_id, work_item_type: event.payload.work_item_type, owner_role: event.payload.owner_role, owner_display_name: null, status: "open", due_at: event.payload.due_at, aggregate_version: 1, next_action: "Review and take ownership.", closure_evidence: null});
      patientBlockers.push({barrier_id: event.payload.source_barrier_id, label: event.payload.work_item_type === "clinical_review" ? "Care team review" : event.payload.work_item_type === "transport_navigation" ? "Transportation plan" : "Requested callback", status: "open", owner_role: event.payload.owner_role, due_at: event.payload.due_at});
    }
  }
  staff.barriers = barriers; staff.work_items = workItems; staff.timeline = [...(staff.timeline as unknown[] ?? []), ...events];
  patient.blockers = patientBlockers; patient.next_action = "Your care team is working on the items you shared.";
  return {staff, patient, caregiver, transport_coordinator: transport};
}

export class WorkflowApplication {
  constructor(private readonly repository: WorkflowRepository, private readonly config: ServerConfig) {}

  projection(scenarioId: string, role: ActorRole) { return this.repository.getProjection(scenarioId, role); }

  readiness(command: ReadinessCommand) {
    const drafts = readinessDrafts(command, plusHours(4));
    drafts[0] = {...drafts[0]!, aggregate_type: "scenario", aggregate_id: command.scenario_id, aggregate_version: command.expected_aggregate_version + 1};
    const correlation = randomUUID();
    const events = drafts.map((draft) => eventFromDraft(command, draft, actor(command.actor_role), command.channel, correlation));
    return this.repository.executeCommand({scenarioId: command.scenario_id, idempotencyKey: command.idempotency_key, semanticInput: command, aggregateType: "scenario", aggregateId: command.scenario_id, expectedVersion: command.expected_aggregate_version}, (snapshot) => ({aggregateVersion: snapshot.aggregate.version + 1, events, projections: projectReadiness(snapshot, events, snapshot.aggregate.version + 1)}));
  }

  workItem(workItemId: string, command: WorkItemCommand) {
    return this.repository.executeCommand({scenarioId: command.scenario_id, idempotencyKey: command.idempotency_key, semanticInput: command, aggregateType: "work_item", aggregateId: workItemId, expectedVersion: command.expected_aggregate_version}, (snapshot) => {
      const currentStatus = String(snapshot.aggregate.state.status ?? "open");
      const draft = workItemDraft(command, workItemId, currentStatus, snapshot.aggregate.version + 1);
      const event = eventFromDraft(command, draft, actor(command.actor_role), "web", randomUUID());
      const staff = bumpProjection(snapshot.projections.staff, Number(snapshot.projections.staff.scenario_version ?? 0) + 1, "action_in_progress");
      staff.work_items = (staff.work_items as Array<Record<string, unknown>> ?? []).map((item) => item.work_item_id === workItemId ? {...item, status: draft.payload.to_status, aggregate_version: draft.aggregate_version, owner_display_name: command.owner_id ?? item.owner_display_name, closure_evidence: command.closure_evidence ?? item.closure_evidence} : item);
      staff.timeline = [...(staff.timeline as unknown[] ?? []), event];
      return {aggregateVersion: draft.aggregate_version, aggregateState: {status: draft.payload.to_status}, events: [event], projections: {staff}};
    });
  }

  createTransport(command: CreateTransportCommand) {
    const transportId = randomUUID();
    return this.repository.executeCommand({scenarioId: command.scenario_id, idempotencyKey: command.idempotency_key, semanticInput: command, aggregateType: "transport_request", aggregateId: transportId, expectedVersion: command.expected_aggregate_version}, (snapshot) => {
      const drafts = createTransportDraft(command, transportId);
      const events = drafts.map((draft) => eventFromDraft(command, draft, actor(command.actor_role), "partner_dispatch", randomUUID()));
      const coordinator = bumpProjection(snapshot.projections.transport_coordinator, Number(snapshot.projections.transport_coordinator.scenario_version ?? 0) + 1, "action_in_progress");
      coordinator.request = {transport_request_id: transportId, aggregate_version: 1, status: "eligibility_reviewed", arrival_window: command.treatment_arrival_window, notice_cutoff: command.notice_cutoff, funding_path: command.funding_path, service_area: command.service_area, mobility: command.mobility, outbound_plan: command.outbound_plan, return_plan: command.return_plan, notification_permission: command.notification_permission, contact_alias: "finals_allowlisted_phone", acknowledgment_status: "not_requested", driver_alias: null, vehicle_description: null};
      return {aggregateVersion: 1, aggregateState: {transport_request_id: transportId, status: "eligibility_reviewed", aggregate_version: 1, work_item_id: command.work_item_id, treatment_arrival_window: command.treatment_arrival_window, notice_cutoff: command.notice_cutoff, funding_path: command.funding_path, service_area: command.service_area, mobility: command.mobility, outbound_plan: command.outbound_plan, return_plan: command.return_plan, notification_permission: command.notification_permission}, events, projections: {transport_coordinator: coordinator}};
    });
  }

  transport(transportId: string, command: TransportCommand) {
    return this.repository.executeCommand({scenarioId: command.scenario_id, idempotencyKey: command.idempotency_key, semanticInput: command, aggregateType: "transport_request", aggregateId: transportId, expectedVersion: command.expected_aggregate_version}, (snapshot) => {
      const currentStatus = String(snapshot.aggregate.state.status ?? "need_detected");
      const planComplete = Boolean(snapshot.aggregate.state.outbound_plan_complete && snapshot.aggregate.state.return_plan_complete);
      const draft = transportDraft(command, transportId, currentStatus, snapshot.aggregate.version + 1, planComplete);
      const event = eventFromDraft(command, draft, actor(command.actor_role), "partner_dispatch", randomUUID());
      const nextStatus = draft.event_type === "transport.eligibility_reviewed" ? "eligibility_reviewed" : String(draft.payload.to_status);
      const aggregateState = {...snapshot.aggregate.state, status: nextStatus, ...(draft.event_type === "transport.eligibility_reviewed" ? draft.payload : {})};
      const coordinator = bumpProjection(snapshot.projections.transport_coordinator, Number(snapshot.projections.transport_coordinator.scenario_version ?? 0) + 1, nextStatus === "completed" ? "continuity_plan_confirmed" : "action_in_progress");
      coordinator.request = {...(coordinator.request as Record<string, unknown>), status: nextStatus, aggregate_version: draft.aggregate_version, ...(command.driver_alias ? {driver_alias: command.driver_alias} : {}), ...(command.vehicle_description ? {vehicle_description: command.vehicle_description} : {}), ...(command.action === "acknowledge_patient" ? {acknowledgment_status: "acknowledged"} : {})};
      return {aggregateVersion: draft.aggregate_version, aggregateState, events: [event], projections: {transport_coordinator: coordinator}};
    });
  }

  communication(channel: "sms" | "voice", command: CommunicationCommand) {
    if (command.actor_role !== "staff") throw new AppError(403, "forbidden_action", "Only staff may queue external communications.");
    const communicationId = randomUUID();
    return this.repository.executeCommand({scenarioId: command.scenario_id, idempotencyKey: command.idempotency_key, semanticInput: {...command, channel}, aggregateType: "communication", aggregateId: communicationId, expectedVersion: command.expected_aggregate_version}, (_snapshot) => {
      const version = 1;
      const event = eventFromDraft(command, {aggregate_type: "communication", aggregate_id: communicationId, aggregate_version: 1, event_type: "communication.queued", payload: {communication_id: communicationId, channel, purpose: command.purpose, destination_alias: command.destination_alias}}, actor(command.actor_role), "web", randomUUID());
      return {aggregateVersion: version, events: [event], projections: {}, outbox: [{scenario_id: command.scenario_id, action_type: channel, stable_action_id: communicationId, payload: {communication_id: communicationId, purpose: command.purpose}}]};
    });
  }

  reset(command: ResetCommand) {
    if (command.actor_role !== "staff") throw new AppError(403, "forbidden_action", "Only staff may reset the controlled scenario.");
    const event = eventFromDraft(command, {aggregate_type: "scenario", aggregate_id: command.scenario_id, aggregate_version: command.expected_aggregate_version + 1, event_type: "scenario.reset", payload: {seed_version: "finals-v1", external_actions_suppressed: true}}, actor(command.actor_role), "reset", randomUUID());
    return this.repository.resetScenario({scenarioId: command.scenario_id, idempotencyKey: command.idempotency_key, semanticInput: command, aggregateType: "scenario", aggregateId: command.scenario_id, expectedVersion: command.expected_aggregate_version}, event);
  }

  metrics(scenarioId: string) { return this.repository.getMetrics(scenarioId); }
  fhir(scenarioId: string) { return this.repository.getFhir(scenarioId); }
  priority(scenarioId: string) { return this.repository.getPriority(scenarioId); }
  tick(maxItems: number) { return this.repository.runTick(maxItems, async (item) => dispatchOutbox(this.config, item)); }
}
