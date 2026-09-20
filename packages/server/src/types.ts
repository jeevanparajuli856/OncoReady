export const roles = ["patient", "caregiver", "staff", "transport_coordinator"] as const;
export type ActorRole = (typeof roles)[number];

export type AggregateType =
  | "scenario"
  | "readiness_submission"
  | "barrier"
  | "work_item"
  | "communication"
  | "transport_request"
  | "caregiver_permission"
  | "evidence"
  | "priority_score";

export interface Actor {
  role: ActorRole | "system" | "provider_callback";
  actor_id: string;
}

export interface WorkflowEvent {
  event_id: string;
  schema_version: "1.0";
  scenario_id: string;
  aggregate_type: AggregateType;
  aggregate_id: string;
  aggregate_version: number;
  event_type: string;
  payload: Record<string, unknown>;
  occurred_at: string;
  recorded_at: string;
  actor: Actor;
  provenance:
    | "web"
    | "sms"
    | "voice"
    | "twilio_callback"
    | "elevenlabs_callback"
    | "partner_dispatch"
    | "scheduler"
    | "deterministic_replay"
    | "reset"
    | "ml_pipeline";
  correlation_id: string;
  causation_id: string | null;
  idempotency_key?: string | null;
}

export interface CommandContext {
  scenario_id: string;
  actor_role: ActorRole;
  idempotency_key: string;
  expected_aggregate_version: number;
}

export interface CommandReceipt {
  command_id: string;
  disposition: "accepted" | "replayed";
  scenario_id: string;
  aggregate_id: string;
  aggregate_version: number;
  emitted_events: WorkflowEvent[];
}

export interface ProjectionRecord {
  scenario_id: string;
  scenario_version: number;
  patient: Record<string, unknown>;
  caregiver: Record<string, unknown>;
  staff: Record<string, unknown>;
  transport_coordinator: Record<string, unknown>;
  metrics: Record<string, unknown>;
  fhir: Record<string, unknown>;
  priority: Record<string, unknown>;
}

export interface OutboxItem {
  outbox_id: string;
  scenario_id: string;
  action_type: "sms" | "voice";
  stable_action_id: string;
  payload: Record<string, unknown>;
  attempts: number;
}

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code:
      | "invalid_request"
      | "unauthorized"
      | "invalid_callback_signature"
      | "forbidden_action"
      | "not_found"
      | "version_conflict"
      | "invalid_transition"
      | "validation_failed"
      | "payload_too_large"
      | "rate_limited"
      | "dependency_unavailable"
      | "artifact_unavailable"
      | "internal_error",
    message: string,
    public readonly retryable = false,
    public readonly currentAggregateVersion?: number,
  ) {
    super(message);
  }
}
