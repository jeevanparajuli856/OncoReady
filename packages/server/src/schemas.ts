import {z} from "zod";

export const uuid = z.string().uuid();
export const role = z.enum(["patient", "caregiver", "staff", "transport_coordinator"]);
export const idempotencyKey = z.string().min(8).max(128).regex(/^[A-Za-z0-9._:-]+$/);

export const commandContext = z.object({
  scenario_id: uuid,
  actor_role: role,
  idempotency_key: idempotencyKey,
  expected_aggregate_version: z.number().int().nonnegative(),
});

export const resetCommand = commandContext.extend({confirmation: z.literal("RESET_FINALS_SCENARIO")});
export const readinessCommand = commandContext.extend({
  channel: z.enum(["web", "sms", "voice"]),
  transport_status: z.enum(["confirmed", "needs_help", "unknown"]),
  clinical_concern_verbatim: z.string().max(2000).nullable().optional(),
  callback_requested: z.boolean(),
});
export const workItemCommand = commandContext.extend({
  action: z.enum(["assign", "acknowledge", "accept", "request_information", "record_action", "escalate", "inform_patient", "acknowledge_patient", "close"]),
  owner_id: z.string().max(120).nullable().optional(),
  note: z.string().max(2000).nullable().optional(),
  closure_evidence: z.string().max(2000).nullable().optional(),
});
export const timeWindow = z.object({starts_at: z.string().datetime(), ends_at: z.string().datetime()}).strict();
export const mobilityNeeds = z.object({
  wheelchair: z.boolean(),
  transfer_assistance: z.boolean(),
  escort_required: z.boolean(),
  notes: z.string().max(500).nullable().optional(),
}).strict();
export const tripLeg = z.object({
  location_alias: z.enum(["maria_home", "benson_cancer_center"]),
  window: timeWindow,
  duration_uncertain: z.boolean().optional(),
}).strict();
export const createTransportCommand = commandContext.extend({
  work_item_id: uuid,
  treatment_arrival_window: timeWindow,
  notice_cutoff: z.string().datetime(),
  funding_path: z.enum(["pilot_sponsored", "hospital_supported", "patient_self_pay", "eligibility_review_required"]),
  service_area: z.string().max(160),
  mobility: mobilityNeeds,
  outbound_plan: tripLeg,
  return_plan: tripLeg,
  notification_permission: z.boolean(),
});
export const transportCommand = commandContext.extend({
  action: z.enum(["review_eligibility", "mark_request_ready", "offer", "accept", "assign_driver", "mark_provider_unavailable", "decline", "cancel", "activate_backup", "notify_patient", "acknowledge_patient", "mark_en_route", "arrive", "pick_up", "complete", "mark_return_pending", "escalate_to_navigator"]),
  eligible: z.boolean().nullable().optional(),
  service_area_confirmed: z.boolean().nullable().optional(),
  operating_window_confirmed: z.boolean().nullable().optional(),
  outbound_plan_complete: z.boolean().nullable().optional(),
  return_plan_complete: z.boolean().nullable().optional(),
  driver_alias: z.string().max(120).nullable().optional(),
  vehicle_description: z.string().max(200).nullable().optional(),
  reason: z.string().max(500).nullable().optional(),
  closure_evidence: z.string().max(1000).nullable().optional(),
});
export const communicationCommand = commandContext.extend({
  purpose: z.enum(["readiness", "fallback", "plan_update", "human_callback"]),
  destination_alias: z.literal("finals_allowlisted_phone"),
});

export const twilioInbound = z.object({MessageSid: z.string().min(1).max(64), From: z.string().min(3).max(32), To: z.string().min(3).max(32), Body: z.string().max(2000)}).passthrough();
export const twilioStatus = z.object({MessageSid: z.string().min(1).max(64), MessageStatus: z.enum(["queued", "sent", "delivered", "undelivered", "failed"]), ErrorCode: z.string().max(32).nullable().optional()}).passthrough();
const elevenLabsOutcome = z.object({
  data_collection_id: z.literal("oncoready_outcome"),
  value: z.enum(["ready", "ride_help", "scheduling_help", "human_callback", "unsupported_or_uncertain"]),
  rationale: z.string().max(2000).nullable().optional(),
}).passthrough();
export const elevenLabsPostCall = z.object({
  type: z.literal("post_call_transcription"),
  event_timestamp: z.number().int().nonnegative(),
  data: z.object({
    agent_id: z.string().min(1).max(255),
    conversation_id: z.string().min(1).max(255),
    status: z.string().min(1).max(64),
    analysis: z.object({
      data_collection_results: z.object({oncoready_outcome: elevenLabsOutcome.optional()}).passthrough(),
    }).passthrough(),
  }).passthrough(),
}).passthrough();
export const elevenLabsFailure = z.object({
  type: z.literal("call_initiation_failure"),
  event_timestamp: z.number().int().nonnegative(),
  data: z.object({
    agent_id: z.string().min(1).max(255),
    conversation_id: z.string().min(1).max(255),
    failure_reason: z.enum(["busy", "no-answer", "unknown"]),
    metadata: z.object({
      type: z.enum(["twilio", "sip"]),
      body: z.record(z.unknown()),
    }).passthrough(),
  }).passthrough(),
}).passthrough();

export type ResetCommand = z.infer<typeof resetCommand>;
export type ReadinessCommand = z.infer<typeof readinessCommand>;
export type WorkItemCommand = z.infer<typeof workItemCommand>;
export type CreateTransportCommand = z.infer<typeof createTransportCommand>;
export type TransportCommand = z.infer<typeof transportCommand>;
export type CommunicationCommand = z.infer<typeof communicationCommand>;
