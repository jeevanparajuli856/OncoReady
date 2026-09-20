import {createHash, randomUUID} from "node:crypto";
import type {ActorRole, CommandReceipt, OutboxItem, WorkflowEvent} from "./types.js";
import {AppError} from "./types.js";

export interface AggregateSnapshot {
  version: number;
  state: Record<string, unknown>;
}

export interface CommandSnapshot {
  aggregate: AggregateSnapshot;
  projections: Record<ActorRole, Record<string, unknown>>;
}

export interface CommandDecision {
  aggregateVersion: number;
  events: WorkflowEvent[];
  projections: Partial<Record<ActorRole, Record<string, unknown>>>;
  aggregateState?: Record<string, unknown>;
  outbox?: Array<Omit<OutboxItem, "outbox_id" | "attempts">>;
}

export interface ExecuteCommandInput {
  scenarioId: string;
  idempotencyKey: string;
  semanticInput: unknown;
  aggregateType: string;
  aggregateId: string;
  expectedVersion: number;
}

export interface WebhookWrite {
  provider: "twilio_sms" | "elevenlabs_twilio";
  providerEventId: string;
  scenarioId: string;
  event: WorkflowEvent;
  rawBodySha256: string;
  providerReference?: string;
}

export interface WorkflowRepository {
  healthCheck(): Promise<void>;
  close(): Promise<void>;
  getProjection(scenarioId: string, role: ActorRole): Promise<Record<string, unknown>>;
  executeCommand(input: ExecuteCommandInput, decide: (snapshot: CommandSnapshot) => CommandDecision): Promise<CommandReceipt>;
  findProviderAction(providerReference: string): Promise<{scenarioId: string; aggregateId: string; aggregateVersion: number; correlationId: string; channel: "sms" | "voice"} | null>;
  recordWebhook(input: WebhookWrite): Promise<"accepted" | "duplicate" | "out_of_order">;
  resetScenario(input: ExecuteCommandInput, event: WorkflowEvent): Promise<CommandReceipt>;
  getMetrics(scenarioId: string): Promise<Record<string, unknown>>;
  getFhir(scenarioId: string): Promise<Record<string, unknown>>;
  getPriority(scenarioId: string): Promise<Record<string, unknown>>;
  runTick(maxItems: number, dispatch: (item: OutboxItem) => Promise<{providerReference: string}>): Promise<Record<string, unknown>>;
}

function select(source:Record<string,unknown>|undefined,keys:string[]):Record<string,unknown>{
  return Object.fromEntries(keys.filter((key)=>source&&Object.hasOwn(source,key)).map((key)=>[key,source![key]]));
}

export function minimizeCaregiverProjection(source:Record<string,unknown>):Record<string,unknown>{
  const permission=source.permission as Record<string,unknown>|undefined;
  const allowed=permission?.transport_logistics_allowed===true;
  const result:Record<string,unknown>={
    ...select(source,["scenario_id","scenario_version","role","as_of","readiness_status"]),
    treatment:select(source.treatment as Record<string,unknown>|undefined,["treatment_id","starts_at","arrival_window","location_display_name","transport_notice_cutoff"]),
    caregiver:select(source.caregiver as Record<string,unknown>|undefined,["display_name"]),
    permission:{transport_logistics_allowed:allowed},
  };
  if(allowed)result.transport=select(source.transport as Record<string,unknown>|undefined,["status","provider_display_name","pickup_window","return_window","driver_alias","vehicle_description","acknowledgment_status"]);
  return result;
}

export function semanticHash(input: unknown): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

export class MemoryWorkflowRepository implements WorkflowRepository {
  readonly events: WorkflowEvent[] = [];
  readonly outbox: OutboxItem[] = [];
  readonly providerActions = new Map<string, {scenarioId: string; aggregateId: string; aggregateVersion: number; correlationId: string; channel: "sms" | "voice"}>();
  private readonly versions = new Map<string, AggregateSnapshot>();
  private readonly receipts = new Map<string, {hash: string; receipt: CommandReceipt}>();
  private readonly webhookIds = new Set<string>();

  constructor(private readonly projections: Record<ActorRole, Record<string, unknown>>) {}

  async healthCheck(): Promise<void> {}
  async close(): Promise<void> {}

  async getProjection(_scenarioId: string, role: ActorRole): Promise<Record<string, unknown>> {
    const projection=structuredClone(this.projections[role]);return role==="caregiver"?minimizeCaregiverProjection(projection):projection;
  }

  async executeCommand(input: ExecuteCommandInput, decide: (snapshot: CommandSnapshot) => CommandDecision): Promise<CommandReceipt> {
    const hash = semanticHash(input.semanticInput);
    const prior = this.receipts.get(input.idempotencyKey);
    if (prior) {
      if (prior.hash !== hash) throw new AppError(409, "version_conflict", "Idempotency key was already used for a different command.");
      return {...structuredClone(prior.receipt), disposition: "replayed"};
    }
    const key = `${input.aggregateType}:${input.aggregateId}`;
    const aggregate = this.versions.get(key) ?? {version: 0, state: {}};
    if (aggregate.version !== input.expectedVersion) throw new AppError(409, "version_conflict", "Aggregate version is stale.", false, aggregate.version);
    const decision = decide({aggregate: structuredClone(aggregate), projections: structuredClone(this.projections)});
    this.events.push(...structuredClone(decision.events));
    this.versions.set(key, {version: decision.aggregateVersion, state: structuredClone(decision.aggregateState ?? aggregate.state)});
    for (const [role, projection] of Object.entries(decision.projections) as Array<[ActorRole, Record<string, unknown>]>) this.projections[role] = structuredClone(projection);
    for (const queued of decision.outbox ?? []) this.outbox.push({...structuredClone(queued), outbox_id: randomUUID(), attempts: 0});
    const receipt: CommandReceipt = {command_id: randomUUID(), disposition: "accepted", scenario_id: input.scenarioId, aggregate_id: input.aggregateId, aggregate_version: decision.aggregateVersion, emitted_events: structuredClone(decision.events)};
    this.receipts.set(input.idempotencyKey, {hash, receipt: structuredClone(receipt)});
    return receipt;
  }

  async recordWebhook(input: WebhookWrite): Promise<"accepted" | "duplicate" | "out_of_order"> {
    const key = `${input.provider}:${input.providerEventId}`;
    if (this.webhookIds.has(key)) return "duplicate";
    this.webhookIds.add(key);
    this.events.push(structuredClone(input.event));
    return "accepted";
  }

  async findProviderAction(providerReference: string) { return this.providerActions.get(providerReference) ?? null; }

  async resetScenario(input: ExecuteCommandInput, event: WorkflowEvent): Promise<CommandReceipt> {
    this.outbox.splice(0);
    return this.executeCommand(input, () => ({aggregateVersion: input.expectedVersion + 1, events: [event], projections: {}}));
  }

  async getMetrics(_scenarioId: string): Promise<Record<string, unknown>> { return structuredClone((this.projections.staff.metrics as Record<string, unknown>) ?? {}); }
  async getFhir(_scenarioId: string): Promise<Record<string, unknown>> { return structuredClone((this.projections.staff.fhir as Record<string, unknown>) ?? {}); }
  async getPriority(_scenarioId: string): Promise<Record<string, unknown>> { return structuredClone((this.projections.staff.priority as Record<string, unknown>) ?? {status: "unavailable", use: "supportive_outreach_ordering_only", reason: "artifact_missing"}); }

  async runTick(maxItems: number, dispatch: (item: OutboxItem) => Promise<{providerReference: string}>): Promise<Record<string, unknown>> {
    const started = new Date(); let succeeded = 0; let failed = 0;
    const claimed = this.outbox.splice(0, maxItems);
    for (const item of claimed) {
      try { await dispatch(item); succeeded += 1; } catch { failed += 1; }
    }
    return {tick_id: randomUUID(), started_at: started.toISOString(), completed_at: new Date().toISOString(), claimed: claimed.length, succeeded, failed, remaining_due: this.outbox.length};
  }
}

export function createSeedProjections(scenarioId: string): Record<ActorRole, Record<string, unknown>> {
  const starts = "2026-10-15T14:00:00.000Z";
  const window = {starts_at: "2026-10-15T13:15:00.000Z", ends_at: "2026-10-15T13:45:00.000Z"};
  const treatment = {treatment_id: "22222222-2222-4222-8222-222222222222", starts_at: starts, arrival_window: window, location_display_name: "Benson Cancer Center", transport_notice_cutoff: "2026-10-12T22:00:00.000Z"};
  const reconciliation = {state: "not_required", last_attempt_at: null, attempt_reference: null, provenance: "none", permitted_recovery: "none"};
  const transport = {status: "need_detected", provider_display_name: "CareLink Partner Dispatch", plan_version: 1, acknowledgment_required: true};
  const base = {scenario_id: scenarioId, scenario_version: 0, as_of: "2026-10-12T14:00:00.000Z", treatment, readiness_status: "not_started"};
  return {
    patient: {...base, role: "patient", patient: {patient_id: "33333333-3333-4333-8333-333333333333", display_name: "Maria Santos"}, blockers: [], next_action: "Complete the T-3 readiness check-in.", communications: [], transport},
    caregiver: {...base, role: "caregiver", caregiver: {display_name: "Ana Santos"}, permission: {transport_logistics_allowed: true}, transport: {status: "need_detected", provider_display_name: "CareLink Partner Dispatch", acknowledgment_status: "not_requested"}},
    staff: {...base, role: "staff", patient: {patient_id: "33333333-3333-4333-8333-333333333333", display_name: "Maria Santos"}, barriers: [], work_items: [], communications: [], transport: {...transport, transport_request_id: "44444444-4444-4444-8444-444444444444", aggregate_version: 0, eligibility: "not_reviewed", outbound_plan_complete: false, return_plan_complete: false, reconciliation}, timeline: []},
    transport_coordinator: {...base, role: "transport_coordinator", request: {transport_request_id: "44444444-4444-4444-8444-444444444444", aggregate_version: 0, status: "need_detected", arrival_window: window, notice_cutoff: "2026-10-12T22:00:00.000Z", funding_path: "pilot_sponsored", service_area: "New Orleans pilot service area", mobility: {wheelchair: false, transfer_assistance: false, escort_required: false}, outbound_plan: {location_alias: "maria_home", window}, return_plan: {location_alias: "benson_cancer_center", window, duration_uncertain: true}, notification_permission: true, contact_alias: "finals_allowlisted_phone", acknowledgment_status: "not_requested", reconciliation}},
  };
}
