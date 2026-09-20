\set ON_ERROR_STOP on

begin;

do $$
declare
  finals_scenario constant uuid := '11111111-1111-4111-8111-111111111111';
begin
  if not public.try_scheduler_lock(finals_scenario) then
    raise exception 'in-process scheduler could not acquire its transaction advisory lock';
  end if;
  if (select count(*) from public.scenarios where scenario_id = finals_scenario) <> 1 then
    raise exception 'deterministic finals scenario is missing';
  end if;
  if (select count(*) from public.workflow_events where scenario_id = finals_scenario) <> 1 then
    raise exception 'seed must contain exactly one reset event';
  end if;
  if (select count(*) from public.role_projections where scenario_id = finals_scenario) <> 4 then
    raise exception 'seed must contain all four role projections';
  end if;
  if exists (select 1 from public.outbox where scenario_id = finals_scenario)
     or exists (select 1 from public.provider_attempts where scenario_id = finals_scenario) then
    raise exception 'seed/reset created an external action';
  end if;
  if (select count(*) from public.scheduled_actions where scenario_id = finals_scenario and status = 'pending') <> 2 then
    raise exception 'seed/reset did not restore the exact T-3/T-1 cadence';
  end if;
end;
$$;

insert into public.workflow_events (
  event_id, schema_version, scenario_id, aggregate_type, aggregate_id,
  aggregate_version, event_type, payload, occurred_at, actor_role, actor_id,
  provenance, correlation_id
) values (
  '10000000-0000-4000-8000-000000000001', '1.0',
  '11111111-1111-4111-8111-111111111111', 'barrier',
  '10000000-0000-4000-8000-000000000002', 1, 'barrier.detected',
  '{"barrier_id":"10000000-0000-4000-8000-000000000002","barrier_type":"transportation","source":"staff_action","status":"open"}',
  clock_timestamp(), 'staff', 'database-test', 'web',
  '10000000-0000-4000-8000-000000000003'
);

do $$
begin
  begin
    insert into public.workflow_events (
      event_id, schema_version, scenario_id, aggregate_type, aggregate_id,
      aggregate_version, event_type, payload, occurred_at, actor_role, actor_id,
      provenance, correlation_id
    ) values (
      '10000000-0000-4000-8000-000000000004', '1.0',
      '11111111-1111-4111-8111-111111111111', 'barrier',
      '10000000-0000-4000-8000-000000000002', 3, 'barrier.detected',
      '{"barrier_id":"10000000-0000-4000-8000-000000000002","barrier_type":"transportation","source":"staff_action","status":"open"}',
      clock_timestamp(), 'staff', 'database-test', 'web',
      '10000000-0000-4000-8000-000000000003'
    );
    raise exception 'nonconsecutive aggregate version was accepted';
  exception when serialization_failure then
    null;
  end;

  begin
    update public.workflow_events
       set payload = '{}'::jsonb
     where event_id = '10000000-0000-4000-8000-000000000001';
    raise exception 'workflow event mutation was accepted';
  exception when object_not_in_prerequisite_state then
    null;
  end;
end;
$$;

do $$
begin
  insert into public.idempotency_records (
    scenario_id, idempotency_key, command_name, request_hash, command_id,
    aggregate_type, aggregate_id, expected_aggregate_version
  ) values (
    '11111111-1111-4111-8111-111111111111', 'duplicate-key', 'test.command',
    repeat('a', 64), '10000000-0000-4000-8000-000000000010', 'barrier',
    '10000000-0000-4000-8000-000000000002', 1
  );
  begin
    insert into public.idempotency_records (
      scenario_id, idempotency_key, command_name, request_hash, command_id,
      aggregate_type, aggregate_id, expected_aggregate_version
    ) values (
      '11111111-1111-4111-8111-111111111111', 'duplicate-key', 'other.command',
      repeat('b', 64), '10000000-0000-4000-8000-000000000011', 'barrier',
      '10000000-0000-4000-8000-000000000002', 1
    );
    raise exception 'duplicate idempotency key was accepted';
  exception when unique_violation then
    null;
  end;
end;
$$;

do $$
begin
  begin
    insert into public.outbox (
      outbox_id, scenario_id, event_id, provider, action_type,
      destination_alias, stable_action_id, payload
    ) values (
      '10000000-0000-4000-8000-000000000020',
      '11111111-1111-4111-8111-111111111111',
      '10000000-0000-4000-8000-000000000001', 'uber_health', 'dispatch',
      'maria_home', 'forbidden-provider-action', '{}'::jsonb
    );
    raise exception 'unapproved provider was accepted';
  exception when check_violation then
    null;
  end;
end;
$$;

insert into public.scheduled_actions (
  scheduled_action_id, scenario_id, aggregate_type, aggregate_id, action_type,
  due_at, stable_action_id
) values (
  '10000000-0000-4000-8000-000000000015',
  '11111111-1111-4111-8111-111111111111', 'scenario',
  '11111111-1111-4111-8111-111111111111', 't_minus_3_outreach',
  clock_timestamp() - interval '1 minute', 'scheduled-lease-recovery'
);
select * from public.claim_scheduled_actions('database-test', 1, 5);

do $$
begin
  if (select status from public.scheduled_actions where scheduled_action_id = '10000000-0000-4000-8000-000000000015') <> 'claimed' then
    raise exception 'due scheduled action was not claimed';
  end if;
  if (select count(*) from public.claim_leases where resource_type = 'scheduled_action' and resource_id = '10000000-0000-4000-8000-000000000015' and status = 'active') <> 1 then
    raise exception 'scheduled action claim has no single active durable lease';
  end if;
end;
$$;

update public.scheduled_actions
   set lease_expires_at = clock_timestamp() - interval '1 second'
 where scheduled_action_id = '10000000-0000-4000-8000-000000000015';
select * from public.recover_stale_claims(clock_timestamp());

do $$
begin
  if (select status from public.scheduled_actions where scheduled_action_id = '10000000-0000-4000-8000-000000000015') <> 'pending' then
    raise exception 'expired internal schedule claim was not made safely retryable';
  end if;
end;
$$;

insert into public.outbox (
  outbox_id, scenario_id, event_id, provider, action_type,
  destination_alias, stable_action_id, payload, available_at
) values (
  '10000000-0000-4000-8000-000000000021',
  '11111111-1111-4111-8111-111111111111',
  '10000000-0000-4000-8000-000000000001', 'twilio_sms', 'send_readiness',
  'finals_allowlisted_phone', 'lease-recovery-action', '{}'::jsonb,
  clock_timestamp() - interval '1 minute'
);

select * from public.claim_outbox('database-test', 1, 5);

do $$
begin
  if (select status from public.outbox where outbox_id = '10000000-0000-4000-8000-000000000021') <> 'claimed' then
    raise exception 'due outbox action was not claimed';
  end if;
  if (select count(*) from public.claim_leases where resource_type = 'outbox' and resource_id = '10000000-0000-4000-8000-000000000021' and status = 'active') <> 1 then
    raise exception 'outbox claim has no single active durable lease';
  end if;
end;
$$;

insert into public.provider_attempts (
  provider_attempt_id, scenario_id, outbox_id, provider, stable_action_id,
  attempt_number, status, request_hash
) values (
  '10000000-0000-4000-8000-000000000022',
  '11111111-1111-4111-8111-111111111111',
  '10000000-0000-4000-8000-000000000021', 'twilio_sms',
  'lease-recovery-action', 1, 'intent_recorded', repeat('c', 64)
);

update public.outbox
   set lease_expires_at = clock_timestamp() - interval '1 second'
 where outbox_id = '10000000-0000-4000-8000-000000000021';
select * from public.recover_stale_claims(clock_timestamp());

do $$
begin
  if (select status from public.outbox where outbox_id = '10000000-0000-4000-8000-000000000021') <> 'outcome_unknown' then
    raise exception 'possibly accepted provider action was made retryable';
  end if;
  if not (select reconciliation_required from public.provider_attempts where provider_attempt_id = '10000000-0000-4000-8000-000000000022') then
    raise exception 'uncertain provider attempt does not require reconciliation';
  end if;
  if (select count(*) from public.claim_outbox('database-test-retry', 1, 5)) <> 0 then
    raise exception 'outcome-unknown provider action became blindly retryable';
  end if;
end;
$$;

select public.reset_finals_scenario();

do $$
begin
  if (select count(*) from public.workflow_events) <> 1
     or (select count(*) from public.role_projections) <> 4
     or (select count(*) from public.scheduled_actions) <> 2
     or exists (select 1 from public.outbox)
     or exists (select 1 from public.provider_attempts)
     or exists (select 1 from public.idempotency_records) then
    raise exception 'reset did not restore the exact inert seed';
  end if;
end;
$$;

rollback;
