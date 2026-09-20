-- LAUNCH-001 durable treatment-continuity workflow for Railway PostgreSQL.
-- The browser stays outside the database trust boundary. The Railway API uses
-- a private DATABASE_URL and all browser-facing projections are allowlisted by
-- the server.

create extension if not exists pgcrypto;

create table public.scenarios (
  scenario_id uuid primary key,
  seed_version text not null,
  scenario_name text not null,
  patient_id uuid not null,
  patient_display_name text not null check (char_length(patient_display_name) between 1 and 120),
  caregiver_display_name text not null check (char_length(caregiver_display_name) between 1 and 120),
  treatment_id uuid not null unique,
  treatment_starts_at timestamptz not null,
  arrival_window_start timestamptz not null,
  arrival_window_end timestamptz not null,
  treatment_location_display_name text not null check (char_length(treatment_location_display_name) <= 160),
  transport_notice_cutoff timestamptz not null,
  aggregate_version integer not null default 0 check (aggregate_version >= 0),
  readiness_status text not null default 'not_started'
    check (readiness_status in ('not_started', 'at_risk', 'action_in_progress', 'continuity_plan_confirmed')),
  presentation_route text not null default '/patient'
    check (presentation_route in ('/access', '/patient', '/caregiver', '/staff', '/transport')),
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  check (arrival_window_start < arrival_window_end),
  check (transport_notice_cutoff < treatment_starts_at)
);

create table public.aggregate_heads (
  scenario_id uuid not null references public.scenarios(scenario_id) on delete cascade,
  aggregate_type text not null
    check (aggregate_type in ('scenario', 'readiness_submission', 'barrier', 'work_item', 'communication', 'transport_request', 'caregiver_permission', 'evidence', 'priority_score')),
  aggregate_id uuid not null,
  aggregate_version integer not null check (aggregate_version >= 0),
  updated_at timestamptz not null default clock_timestamp(),
  primary key (scenario_id, aggregate_type, aggregate_id)
);

create table public.workflow_events (
  sequence_number bigint generated always as identity primary key,
  event_id uuid not null unique,
  schema_version text not null check (schema_version = '1.0'),
  scenario_id uuid not null references public.scenarios(scenario_id) on delete cascade,
  aggregate_type text not null
    check (aggregate_type in ('scenario', 'readiness_submission', 'barrier', 'work_item', 'communication', 'transport_request', 'caregiver_permission', 'evidence', 'priority_score')),
  aggregate_id uuid not null,
  aggregate_version integer not null check (aggregate_version >= 1),
  event_type text not null
    check (event_type in (
      'scenario.reset', 'readiness.submission_recorded', 'barrier.detected',
      'work_item.created', 'work_item.transitioned', 'communication.queued',
      'communication.status_changed', 'communication.response_recorded',
      'caregiver.permission_changed', 'transport.eligibility_reviewed',
      'transport.status_changed', 'patient.plan_acknowledged',
      'appointment.changed', 'evidence.generated', 'priority.scored',
      'priority.score_unavailable'
    )),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default clock_timestamp(),
  actor_role text not null
    check (actor_role in ('patient', 'caregiver', 'staff', 'transport_coordinator', 'system', 'provider_callback')),
  actor_id text not null check (char_length(actor_id) between 1 and 120),
  provenance text not null
    check (provenance in ('web', 'sms', 'voice', 'twilio_callback', 'elevenlabs_callback', 'partner_dispatch', 'scheduler', 'deterministic_replay', 'reset', 'ml_pipeline')),
  correlation_id uuid not null,
  causation_id uuid,
  idempotency_key text check (idempotency_key is null or char_length(idempotency_key) between 8 and 128),
  unique (scenario_id, aggregate_type, aggregate_id, aggregate_version)
);

comment on table public.workflow_events is
  'Append-only governed workflow event envelope. Payload meaning is defined by contracts/events/*.schema.json.';

create table public.barrier_projections (
  barrier_id uuid primary key,
  scenario_id uuid not null references public.scenarios(scenario_id) on delete cascade,
  aggregate_version integer not null check (aggregate_version >= 1),
  barrier_type text not null check (barrier_type in ('clinical_concern', 'transportation', 'scheduling', 'communication')),
  source text not null check (source in ('readiness_submission', 'sms_reply', 'voice_outcome', 'staff_action', 'scheduler')),
  status text not null check (status in ('open', 'in_progress', 'resolved', 'escalated')),
  patient_verbatim text check (patient_verbatim is null or char_length(patient_verbatim) <= 2000),
  opened_at timestamptz not null,
  updated_at timestamptz not null default clock_timestamp()
);

create table public.work_item_projections (
  work_item_id uuid primary key,
  scenario_id uuid not null references public.scenarios(scenario_id) on delete cascade,
  source_barrier_id uuid references public.barrier_projections(barrier_id),
  aggregate_version integer not null check (aggregate_version >= 1),
  work_item_type text not null check (work_item_type in ('clinical_review', 'transport_navigation', 'human_callback', 'scheduling_support')),
  owner_role text not null check (owner_role in ('triage_nurse', 'navigator', 'transport_coordinator', 'scheduling_team')),
  owner_id text check (owner_id is null or char_length(owner_id) <= 120),
  owner_display_name text check (owner_display_name is null or char_length(owner_display_name) <= 120),
  status text not null check (status in ('open', 'assigned', 'acknowledged', 'needs_information', 'accepted', 'actioned', 'patient_informed', 'patient_acknowledged', 'escalated', 'closed')),
  due_at timestamptz not null,
  next_action text check (next_action is null or char_length(next_action) <= 300),
  closure_evidence text check (closure_evidence is null or char_length(closure_evidence) <= 2000),
  created_at timestamptz not null,
  updated_at timestamptz not null default clock_timestamp(),
  check (status <> 'closed' or closure_evidence is not null)
);

create table public.communication_projections (
  communication_id uuid primary key,
  scenario_id uuid not null references public.scenarios(scenario_id) on delete cascade,
  aggregate_version integer not null check (aggregate_version >= 1),
  channel text not null check (channel in ('sms', 'voice')),
  purpose text not null check (purpose in ('readiness', 'fallback', 'plan_update', 'human_callback')),
  destination_alias text not null check (destination_alias = 'finals_allowlisted_phone'),
  status text not null check (status in ('queued', 'sent', 'delivered', 'undelivered', 'answered', 'no_answer', 'failed', 'opted_out', 'completed')),
  provenance text not null check (provenance in ('provider_callback', 'deterministic_replay')),
  provider_reference text check (provider_reference is null or char_length(provider_reference) <= 255),
  failure_code text check (failure_code is null or char_length(failure_code) <= 120),
  occurred_at timestamptz not null,
  updated_at timestamptz not null default clock_timestamp()
);

create table public.transport_projections (
  transport_request_id uuid primary key,
  scenario_id uuid not null references public.scenarios(scenario_id) on delete cascade,
  work_item_id uuid references public.work_item_projections(work_item_id),
  aggregate_version integer not null check (aggregate_version >= 1),
  provider text not null default 'partner_dispatch' check (provider in ('partner_dispatch', 'deterministic_replay')),
  provider_display_name text not null default 'CareLink Partner Dispatch',
  status text not null check (status in (
    'need_detected', 'eligibility_reviewed', 'request_ready', 'offered', 'accepted',
    'driver_assigned', 'patient_notified', 'patient_acknowledged', 'en_route',
    'arrived', 'picked_up', 'completed', 'declined', 'cancelled',
    'provider_unavailable', 'stale_assignment', 'return_pending',
    'backup_required', 'backup_activated', 'escalated_to_navigator'
  )),
  treatment_arrival_window jsonb not null check (jsonb_typeof(treatment_arrival_window) = 'object'),
  notice_cutoff timestamptz not null,
  funding_path text not null check (funding_path in ('pilot_sponsored', 'hospital_supported', 'patient_self_pay', 'eligibility_review_required')),
  service_area text not null check (char_length(service_area) <= 160),
  mobility jsonb not null check (jsonb_typeof(mobility) = 'object'),
  outbound_plan jsonb not null check (jsonb_typeof(outbound_plan) = 'object'),
  return_plan jsonb not null check (jsonb_typeof(return_plan) = 'object'),
  notification_permission boolean not null,
  eligibility text not null default 'not_reviewed' check (eligibility in ('not_reviewed', 'eligible', 'ineligible', 'needs_review')),
  service_area_confirmed boolean not null default false,
  operating_window_confirmed boolean not null default false,
  outbound_plan_complete boolean not null default false,
  return_plan_complete boolean not null default false,
  plan_version integer not null default 1 check (plan_version >= 1),
  acknowledgment_status text not null default 'not_requested' check (acknowledgment_status in ('not_requested', 'awaiting_patient', 'acknowledged')),
  acknowledged_plan_version integer,
  driver_alias text check (driver_alias is null or char_length(driver_alias) <= 120),
  vehicle_description text check (vehicle_description is null or char_length(vehicle_description) <= 200),
  failure_reason text check (failure_reason is null or char_length(failure_reason) <= 500),
  closure_evidence text check (closure_evidence is null or char_length(closure_evidence) <= 1000),
  created_at timestamptz not null,
  updated_at timestamptz not null default clock_timestamp(),
  check (acknowledged_plan_version is null or acknowledged_plan_version <= plan_version),
  check (
    status <> 'completed'
    or (
      eligibility = 'eligible'
      and outbound_plan_complete
      and return_plan_complete
      and acknowledgment_status = 'acknowledged'
      and acknowledged_plan_version = plan_version
      and closure_evidence is not null
    )
  )
);

create table public.role_projections (
  scenario_id uuid not null references public.scenarios(scenario_id) on delete cascade,
  role text not null check (role in ('patient', 'caregiver', 'staff', 'transport_coordinator')),
  scenario_version integer not null check (scenario_version >= 0),
  as_of timestamptz not null,
  projection jsonb not null check (jsonb_typeof(projection) = 'object'),
  updated_at timestamptz not null default clock_timestamp(),
  primary key (scenario_id, role),
  check (projection ->> 'role' = role),
  check (projection ->> 'scenario_id' = scenario_id::text),
  check ((projection ->> 'scenario_version')::integer = scenario_version)
);

create table public.scheduled_actions (
  scheduled_action_id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.scenarios(scenario_id) on delete cascade,
  aggregate_type text not null,
  aggregate_id uuid not null,
  action_type text not null check (action_type in ('t_minus_7_outreach', 't_minus_3_outreach', 't_minus_1_outreach', 'sla_escalation', 'transport_cutoff', 'manual_recovery')),
  due_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'claimed', 'completed', 'cancelled', 'failed', 'outcome_unknown')),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  stable_action_id text not null unique check (char_length(stable_action_id) between 8 and 160),
  claim_token uuid,
  claim_owner text,
  claimed_at timestamptz,
  lease_expires_at timestamptz,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  max_attempts integer not null default 3 check (max_attempts between 1 and 10),
  last_error_code text,
  completed_at timestamptz,
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  check ((status = 'claimed') = (claim_token is not null and claim_owner is not null and claimed_at is not null and lease_expires_at is not null)),
  check (status <> 'completed' or completed_at is not null)
);

create table public.outbox (
  outbox_id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.scenarios(scenario_id) on delete cascade,
  scheduled_action_id uuid references public.scheduled_actions(scheduled_action_id) on delete set null,
  event_id uuid references public.workflow_events(event_id),
  provider text not null check (provider in ('twilio_sms', 'elevenlabs_twilio', 'carelink_partner_dispatch', 'deterministic_replay')),
  action_type text not null check (char_length(action_type) between 1 and 120),
  destination_alias text not null check (destination_alias in ('finals_allowlisted_phone', 'maria_home', 'benson_cancer_center', 'carelink_partner_dispatch')),
  stable_action_id text not null unique check (char_length(stable_action_id) between 8 and 160),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  status text not null default 'pending' check (status in ('pending', 'claimed', 'dispatched', 'acknowledged', 'failed', 'outcome_unknown', 'cancelled')),
  available_at timestamptz not null default clock_timestamp(),
  claim_token uuid,
  claim_owner text,
  claimed_at timestamptz,
  lease_expires_at timestamptz,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  max_attempts integer not null default 3 check (max_attempts between 1 and 10),
  last_error_code text,
  completed_at timestamptz,
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  check ((status = 'claimed') = (claim_token is not null and claim_owner is not null and claimed_at is not null and lease_expires_at is not null)),
  check (status not in ('acknowledged', 'failed', 'cancelled') or completed_at is not null)
);

create table public.idempotency_records (
  scenario_id uuid not null references public.scenarios(scenario_id) on delete cascade,
  idempotency_key text not null check (char_length(idempotency_key) between 8 and 128),
  command_name text not null check (char_length(command_name) between 1 and 120),
  request_hash text not null check (request_hash ~ '^[a-f0-9]{64}$'),
  command_id uuid not null,
  aggregate_type text not null,
  aggregate_id uuid not null,
  expected_aggregate_version integer not null check (expected_aggregate_version >= 0),
  resulting_aggregate_version integer check (resulting_aggregate_version is null or resulting_aggregate_version >= 0),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'failed')),
  response_status integer check (response_status is null or response_status between 100 and 599),
  response_body jsonb,
  created_at timestamptz not null default clock_timestamp(),
  completed_at timestamptz,
  primary key (scenario_id, idempotency_key),
  unique (scenario_id, command_id),
  check (
    (status = 'in_progress' and response_status is null and response_body is null and completed_at is null)
    or (status in ('completed', 'failed') and response_status is not null and response_body is not null and completed_at is not null)
  )
);

create table public.webhook_receipts (
  webhook_receipt_id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.scenarios(scenario_id) on delete cascade,
  provider text not null check (provider in ('twilio_sms', 'elevenlabs_twilio', 'carelink_partner_dispatch')),
  provider_event_id text not null check (char_length(provider_event_id) between 1 and 255),
  signature_verified boolean not null check (signature_verified),
  raw_body_sha256 text not null check (raw_body_sha256 ~ '^[a-f0-9]{64}$'),
  provider_occurred_at timestamptz,
  received_at timestamptz not null default clock_timestamp(),
  status text not null default 'received' check (status in ('received', 'processed', 'duplicate', 'out_of_order', 'rejected_transition')),
  correlation_id uuid not null,
  translated_event_id uuid references public.workflow_events(event_id),
  safe_payload jsonb not null default '{}'::jsonb check (jsonb_typeof(safe_payload) = 'object'),
  processed_at timestamptz,
  unique (provider, provider_event_id),
  check ((status = 'processed') = (processed_at is not null and translated_event_id is not null))
);

create table public.provider_attempts (
  provider_attempt_id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.scenarios(scenario_id) on delete cascade,
  outbox_id uuid not null references public.outbox(outbox_id) on delete cascade,
  provider text not null check (provider in ('twilio_sms', 'elevenlabs_twilio', 'carelink_partner_dispatch', 'deterministic_replay')),
  stable_action_id text not null,
  attempt_number integer not null check (attempt_number between 1 and 10),
  status text not null check (status in ('intent_recorded', 'in_flight', 'accepted', 'definitive_success', 'definitive_failure', 'outcome_unknown', 'reconciled')),
  request_hash text not null check (request_hash ~ '^[a-f0-9]{64}$'),
  provider_reference text,
  error_code text,
  started_at timestamptz not null default clock_timestamp(),
  completed_at timestamptz,
  reconciliation_required boolean not null default false,
  unique (outbox_id, attempt_number),
  unique (provider, provider_reference),
  check (stable_action_id <> ''),
  check ((status in ('definitive_success', 'definitive_failure', 'reconciled')) = (completed_at is not null)),
  check (status <> 'outcome_unknown' or reconciliation_required)
);

create table public.claim_leases (
  claim_lease_id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.scenarios(scenario_id) on delete cascade,
  resource_type text not null check (resource_type in ('scheduled_action', 'outbox')),
  resource_id uuid not null,
  claim_token uuid not null unique,
  claim_owner text not null check (char_length(claim_owner) between 1 and 160),
  status text not null default 'active' check (status in ('active', 'released', 'expired')),
  acquired_at timestamptz not null default clock_timestamp(),
  lease_expires_at timestamptz not null,
  released_at timestamptz,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  check (lease_expires_at > acquired_at),
  check ((status = 'active') = (released_at is null))
);

create unique index claim_leases_one_active_resource
  on public.claim_leases(resource_type, resource_id)
  where status = 'active';

create index workflow_events_aggregate_replay
  on public.workflow_events(scenario_id, aggregate_type, aggregate_id, aggregate_version);
create index workflow_events_scenario_timeline
  on public.workflow_events(scenario_id, sequence_number);
create index barriers_scenario_status on public.barrier_projections(scenario_id, status);
create index work_items_scenario_status_due on public.work_item_projections(scenario_id, status, due_at);
create index communication_scenario_occurred on public.communication_projections(scenario_id, occurred_at desc);
create index scheduled_actions_due_claim on public.scheduled_actions(due_at, scheduled_action_id)
  where status in ('pending', 'claimed');
create index outbox_due_claim on public.outbox(available_at, outbox_id)
  where status in ('pending', 'claimed');
create index provider_attempts_reconcile on public.provider_attempts(scenario_id, started_at)
  where reconciliation_required;
create index webhook_receipts_correlation on public.webhook_receipts(scenario_id, correlation_id);

create or replace function public.advance_aggregate_head()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  changed integer;
begin
  insert into public.aggregate_heads (scenario_id, aggregate_type, aggregate_id, aggregate_version)
  values (new.scenario_id, new.aggregate_type, new.aggregate_id, 0)
  on conflict (scenario_id, aggregate_type, aggregate_id) do nothing;

  update public.aggregate_heads
     set aggregate_version = new.aggregate_version,
         updated_at = clock_timestamp()
   where scenario_id = new.scenario_id
     and aggregate_type = new.aggregate_type
     and aggregate_id = new.aggregate_id
     and aggregate_version = new.aggregate_version - 1;
  get diagnostics changed = row_count;

  if changed <> 1 then
    raise exception 'aggregate version conflict for %.%: expected %, received %',
      new.aggregate_type, new.aggregate_id,
      (select aggregate_version from public.aggregate_heads
        where scenario_id = new.scenario_id and aggregate_type = new.aggregate_type and aggregate_id = new.aggregate_id),
      new.aggregate_version
      using errcode = '40001';
  end if;
  return new;
end;
$$;

create trigger workflow_events_advance_head
before insert on public.workflow_events
for each row execute function public.advance_aggregate_head();

create or replace function public.protect_workflow_event_immutability()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if current_setting('oncoready.reset_mode', true) is distinct from 'on' then
    raise exception 'workflow_events is append-only' using errcode = '55000';
  end if;
  return old;
end;
$$;

create trigger workflow_events_no_update_or_delete
before update or delete on public.workflow_events
for each row execute function public.protect_workflow_event_immutability();

create or replace function public.try_scheduler_lock(p_scenario_id uuid)
returns boolean
language sql
volatile
set search_path = public, pg_temp
as $$
  select pg_try_advisory_xact_lock(hashtextextended('oncoready.scheduler.' || p_scenario_id::text, 0));
$$;

create or replace function public.recover_stale_claims(p_now timestamptz default clock_timestamp())
returns table (scheduled_recovered integer, outbox_recovered integer, outbox_outcome_unknown integer)
language plpgsql
set search_path = public, pg_temp
as $$
declare
  recovered_scheduled integer := 0;
  recovered_outbox integer := 0;
  uncertain_outbox integer := 0;
begin
  update public.scheduled_actions
     set status = 'pending', claim_token = null, claim_owner = null, claimed_at = null,
         lease_expires_at = null, updated_at = p_now
   where status = 'claimed' and lease_expires_at <= p_now;
  get diagnostics recovered_scheduled = row_count;

  update public.outbox o
     set status = 'outcome_unknown', claim_token = null, claim_owner = null, claimed_at = null,
         lease_expires_at = null, updated_at = p_now
   where o.status = 'claimed' and o.lease_expires_at <= p_now
     and exists (
       select 1 from public.provider_attempts pa
        where pa.outbox_id = o.outbox_id
          and pa.status in ('intent_recorded', 'in_flight', 'accepted', 'outcome_unknown')
     );
  get diagnostics uncertain_outbox = row_count;

  update public.provider_attempts pa
     set status = 'outcome_unknown', reconciliation_required = true
   where pa.status in ('intent_recorded', 'in_flight', 'accepted')
     and exists (
       select 1 from public.outbox o
        where o.outbox_id = pa.outbox_id and o.status = 'outcome_unknown'
     );

  update public.outbox o
     set status = 'pending', claim_token = null, claim_owner = null, claimed_at = null,
         lease_expires_at = null, updated_at = p_now
   where o.status = 'claimed' and o.lease_expires_at <= p_now
     and not exists (select 1 from public.provider_attempts pa where pa.outbox_id = o.outbox_id);
  get diagnostics recovered_outbox = row_count;

  update public.claim_leases
     set status = 'expired', released_at = p_now
   where status = 'active' and lease_expires_at <= p_now;

  return query select recovered_scheduled, recovered_outbox, uncertain_outbox;
end;
$$;

create or replace function public.claim_scheduled_actions(
  p_claim_owner text,
  p_limit integer default 25,
  p_lease_seconds integer default 30
)
returns setof public.scheduled_actions
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if char_length(coalesce(p_claim_owner, '')) not between 1 and 160 then
    raise exception 'invalid claim owner' using errcode = '22023';
  end if;
  if p_limit not between 1 and 100 or p_lease_seconds not between 5 and 300 then
    raise exception 'invalid claim bounds' using errcode = '22023';
  end if;

  perform public.recover_stale_claims(clock_timestamp());

  return query
  with candidates as (
    select sa.scheduled_action_id
      from public.scheduled_actions sa
     where sa.status = 'pending' and sa.due_at <= clock_timestamp()
       and sa.attempt_count < sa.max_attempts
     order by sa.due_at, sa.scheduled_action_id
     for update skip locked
     limit p_limit
  ), claimed as (
    update public.scheduled_actions sa
       set status = 'claimed', claim_token = gen_random_uuid(), claim_owner = p_claim_owner,
           claimed_at = clock_timestamp(), lease_expires_at = clock_timestamp() + make_interval(secs => p_lease_seconds),
           attempt_count = sa.attempt_count + 1, updated_at = clock_timestamp()
      from candidates c
     where sa.scheduled_action_id = c.scheduled_action_id
     returning sa.*
  ), leases as (
    insert into public.claim_leases (scenario_id, resource_type, resource_id, claim_token, claim_owner, lease_expires_at)
    select c.scenario_id, 'scheduled_action', c.scheduled_action_id, c.claim_token, c.claim_owner, c.lease_expires_at
      from claimed c
    returning 1
  )
  select c.* from claimed c, (select count(*) from leases) lease_count;
end;
$$;

create or replace function public.claim_outbox(
  p_claim_owner text,
  p_limit integer default 25,
  p_lease_seconds integer default 30
)
returns setof public.outbox
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if char_length(coalesce(p_claim_owner, '')) not between 1 and 160 then
    raise exception 'invalid claim owner' using errcode = '22023';
  end if;
  if p_limit not between 1 and 100 or p_lease_seconds not between 5 and 300 then
    raise exception 'invalid claim bounds' using errcode = '22023';
  end if;

  perform public.recover_stale_claims(clock_timestamp());

  return query
  with candidates as (
    select o.outbox_id
      from public.outbox o
     where o.status = 'pending' and o.available_at <= clock_timestamp()
       and o.attempt_count < o.max_attempts
       and not exists (
         select 1 from public.provider_attempts pa
          where pa.outbox_id = o.outbox_id
            and pa.status in ('intent_recorded', 'in_flight', 'accepted', 'outcome_unknown')
       )
     order by o.available_at, o.outbox_id
     for update skip locked
     limit p_limit
  ), claimed as (
    update public.outbox o
       set status = 'claimed', claim_token = gen_random_uuid(), claim_owner = p_claim_owner,
           claimed_at = clock_timestamp(), lease_expires_at = clock_timestamp() + make_interval(secs => p_lease_seconds),
           attempt_count = o.attempt_count + 1, updated_at = clock_timestamp()
      from candidates c
     where o.outbox_id = c.outbox_id
     returning o.*
  ), leases as (
    insert into public.claim_leases (scenario_id, resource_type, resource_id, claim_token, claim_owner, lease_expires_at)
    select c.scenario_id, 'outbox', c.outbox_id, c.claim_token, c.claim_owner, c.lease_expires_at
      from claimed c
    returning 1
  )
  select c.* from claimed c, (select count(*) from leases) lease_count;
end;
$$;

create or replace function public.reset_finals_scenario()
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  finals_scenario constant uuid := '11111111-1111-4111-8111-111111111111';
  finals_patient constant uuid := '22222222-2222-4222-8222-222222222222';
  finals_treatment constant uuid := '33333333-3333-4333-8333-333333333333';
  finals_transport constant uuid := '44444444-4444-4444-8444-444444444444';
  seed_event constant uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  seed_correlation constant uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
  seed_time constant timestamptz := '2026-10-12T14:00:00Z';
  treatment_time constant timestamptz := '2026-10-15T15:00:00Z';
  common_treatment jsonb;
  reset_event jsonb;
begin
  perform set_config('oncoready.reset_mode', 'on', true);

  delete from public.scenarios where scenario_id = finals_scenario;

  insert into public.scenarios (
    scenario_id, seed_version, scenario_name, patient_id, patient_display_name,
    caregiver_display_name, treatment_id, treatment_starts_at,
    arrival_window_start, arrival_window_end, treatment_location_display_name,
    transport_notice_cutoff, aggregate_version, readiness_status,
    presentation_route, created_at, updated_at
  ) values (
    finals_scenario, 'finals-v1', 'Maria treatment continuity', finals_patient, 'Maria Santos',
    'Ana Santos', finals_treatment, treatment_time,
    '2026-10-15T14:15:00Z', '2026-10-15T14:45:00Z', 'Benson Cancer Center',
    '2026-10-13T17:00:00Z', 1, 'not_started', '/patient', seed_time, seed_time
  );

  insert into public.workflow_events (
    event_id, schema_version, scenario_id, aggregate_type, aggregate_id,
    aggregate_version, event_type, payload, occurred_at, recorded_at,
    actor_role, actor_id, provenance, correlation_id, causation_id, idempotency_key
  ) values (
    seed_event, '1.0', finals_scenario, 'scenario', finals_scenario,
    1, 'scenario.reset', jsonb_build_object('seed_version', 'finals-v1', 'external_actions_suppressed', true),
    seed_time, seed_time, 'system', 'finals-reset', 'reset', seed_correlation, null, null
  );

  insert into public.aggregate_heads (
    scenario_id, aggregate_type, aggregate_id, aggregate_version, updated_at
  ) values (
    finals_scenario, 'transport_request', finals_transport, 1, seed_time
  );

  insert into public.transport_projections (
    transport_request_id, scenario_id, aggregate_version, status,
    treatment_arrival_window, notice_cutoff, funding_path, service_area,
    mobility, outbound_plan, return_plan, notification_permission,
    created_at, updated_at
  ) values (
    finals_transport, finals_scenario, 1, 'need_detected',
    '{"starts_at":"2026-10-15T14:15:00Z","ends_at":"2026-10-15T14:45:00Z"}'::jsonb,
    '2026-10-13T17:00:00Z', 'eligibility_review_required', 'New Orleans pilot area',
    '{"wheelchair":false,"transfer_assistance":false,"escort_required":false,"notes":null}'::jsonb,
    '{"location_alias":"maria_home","window":{"starts_at":"2026-10-15T13:30:00Z","ends_at":"2026-10-15T13:45:00Z"},"duration_uncertain":false}'::jsonb,
    '{"location_alias":"benson_cancer_center","window":{"starts_at":"2026-10-15T18:00:00Z","ends_at":"2026-10-15T18:30:00Z"},"duration_uncertain":true}'::jsonb,
    false, seed_time, seed_time
  );

  common_treatment := jsonb_build_object(
    'treatment_id', finals_treatment,
    'starts_at', '2026-10-15T15:00:00Z',
    'arrival_window', jsonb_build_object('starts_at', '2026-10-15T14:15:00Z', 'ends_at', '2026-10-15T14:45:00Z'),
    'location_display_name', 'Benson Cancer Center',
    'transport_notice_cutoff', '2026-10-13T17:00:00Z'
  );
  reset_event := jsonb_build_object(
    'event_id', seed_event, 'schema_version', '1.0', 'scenario_id', finals_scenario,
    'aggregate_type', 'scenario', 'aggregate_id', finals_scenario, 'aggregate_version', 1,
    'event_type', 'scenario.reset',
    'payload', jsonb_build_object('seed_version', 'finals-v1', 'external_actions_suppressed', true),
    'occurred_at', '2026-10-12T14:00:00Z', 'recorded_at', '2026-10-12T14:00:00Z',
    'actor', jsonb_build_object('role', 'system', 'actor_id', 'finals-reset'),
    'provenance', 'reset', 'correlation_id', seed_correlation, 'causation_id', null
  );

  insert into public.role_projections (scenario_id, role, scenario_version, as_of, projection, updated_at)
  values
  (
    finals_scenario, 'patient', 1, seed_time,
    jsonb_build_object(
      'scenario_id', finals_scenario, 'scenario_version', 1, 'role', 'patient', 'as_of', '2026-10-12T14:00:00Z',
      'treatment', common_treatment, 'readiness_status', 'not_started',
      'patient', jsonb_build_object('patient_id', finals_patient, 'display_name', 'Maria Santos'),
      'blockers', jsonb_build_array(), 'next_action', 'Complete the T-3 readiness check.',
      'communications', jsonb_build_array(),
      'transport', jsonb_build_object('status', 'need_detected', 'provider_display_name', 'CareLink Partner Dispatch', 'plan_version', 1, 'acknowledgment_required', false)
    ), seed_time
  ),
  (
    finals_scenario, 'caregiver', 1, seed_time,
    jsonb_build_object(
      'scenario_id', finals_scenario, 'scenario_version', 1, 'role', 'caregiver', 'as_of', '2026-10-12T14:00:00Z',
      'treatment', common_treatment, 'readiness_status', 'not_started',
      'caregiver', jsonb_build_object('display_name', 'Ana Santos'),
      'permission', jsonb_build_object('transport_logistics_allowed', false),
      'transport', jsonb_build_object('status', 'need_detected', 'provider_display_name', 'CareLink Partner Dispatch', 'acknowledgment_status', 'not_requested')
    ), seed_time
  ),
  (
    finals_scenario, 'staff', 1, seed_time,
    jsonb_build_object(
      'scenario_id', finals_scenario, 'scenario_version', 1, 'role', 'staff', 'as_of', '2026-10-12T14:00:00Z',
      'treatment', common_treatment, 'readiness_status', 'not_started',
      'patient', jsonb_build_object('patient_id', finals_patient, 'display_name', 'Maria Santos'),
      'barriers', jsonb_build_array(), 'work_items', jsonb_build_array(), 'communications', jsonb_build_array(),
      'transport', jsonb_build_object(
        'status', 'need_detected', 'provider_display_name', 'CareLink Partner Dispatch', 'plan_version', 1,
        'acknowledgment_required', false, 'transport_request_id', finals_transport, 'aggregate_version', 1,
        'eligibility', 'not_reviewed', 'outbound_plan_complete', false, 'return_plan_complete', false,
        'failure_reason', null
      ),
      'timeline', jsonb_build_array(reset_event)
    ), seed_time
  ),
  (
    finals_scenario, 'transport_coordinator', 1, seed_time,
    jsonb_build_object(
      'scenario_id', finals_scenario, 'scenario_version', 1, 'role', 'transport_coordinator', 'as_of', '2026-10-12T14:00:00Z',
      'treatment', common_treatment, 'readiness_status', 'not_started',
      'request', jsonb_build_object(
        'transport_request_id', finals_transport, 'aggregate_version', 1, 'status', 'need_detected',
        'arrival_window', jsonb_build_object('starts_at', '2026-10-15T14:15:00Z', 'ends_at', '2026-10-15T14:45:00Z'),
        'notice_cutoff', '2026-10-13T17:00:00Z', 'funding_path', 'eligibility_review_required',
        'service_area', 'New Orleans pilot area',
        'mobility', jsonb_build_object('wheelchair', false, 'transfer_assistance', false, 'escort_required', false, 'notes', null),
        'outbound_plan', jsonb_build_object('location_alias', 'maria_home', 'window', jsonb_build_object('starts_at', '2026-10-15T13:30:00Z', 'ends_at', '2026-10-15T13:45:00Z'), 'duration_uncertain', false),
        'return_plan', jsonb_build_object('location_alias', 'benson_cancer_center', 'window', jsonb_build_object('starts_at', '2026-10-15T18:00:00Z', 'ends_at', '2026-10-15T18:30:00Z'), 'duration_uncertain', true),
        'notification_permission', false, 'contact_alias', 'finals_allowlisted_phone',
        'acknowledgment_status', 'not_requested', 'driver_alias', null, 'vehicle_description', null
      )
    ), seed_time
  );

  -- Restore the deterministic universal cadence without creating an outbox
  -- row or crossing a provider boundary. The already elapsed T-7 step is not
  -- fabricated; reset begins the finals journey immediately before T-3.
  insert into public.scheduled_actions (
    scheduled_action_id, scenario_id, aggregate_type, aggregate_id,
    action_type, due_at, status, payload, stable_action_id,
    attempt_count, max_attempts, created_at, updated_at
  ) values
  (
    '55555555-5555-4555-8555-555555555553', finals_scenario,
    'scenario', finals_scenario, 't_minus_3_outreach',
    '2026-10-12T15:00:00Z', 'pending',
    jsonb_build_object('channel', 'sms', 'purpose', 'readiness', 'destination_alias', 'finals_allowlisted_phone'),
    'finals-v1:t-minus-3:readiness-sms', 0, 3, seed_time, seed_time
  ),
  (
    '55555555-5555-4555-8555-555555555551', finals_scenario,
    'scenario', finals_scenario, 't_minus_1_outreach',
    '2026-10-14T15:00:00Z', 'pending',
    jsonb_build_object('channel', 'sms', 'purpose', 'readiness', 'destination_alias', 'finals_allowlisted_phone'),
    'finals-v1:t-minus-1:readiness-sms', 0, 3, seed_time, seed_time
  );

  if exists (select 1 from public.outbox where scenario_id = finals_scenario)
     or exists (select 1 from public.provider_attempts where scenario_id = finals_scenario)
     or exists (select 1 from public.webhook_receipts where scenario_id = finals_scenario) then
    raise exception 'reset must not leave external actions' using errcode = '55000';
  end if;

  perform set_config('oncoready.reset_mode', 'off', true);
  return finals_scenario;
end;
$$;

-- Railway supplies one private DATABASE_URL to the API. Runtime least
-- privilege is configured by the operator for that connection role rather
-- than by assuming provider-specific client roles exist.
revoke execute on function public.reset_finals_scenario() from public;
