-- LAUNCH-001 Supabase Cron wake-up trigger.
-- Environment-specific values are operator-managed Vault secrets. The stored
-- cron command contains only a call to the restricted invoker and therefore
-- cannot expose the endpoint or Authorization value in cron.job/run history.

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- Supabase grants the client roles access to pg_net when the extension is
-- enabled. This workflow needs exactly one database-owned network caller.
revoke execute on function net.http_get(text, jsonb, jsonb, integer)
  from public, anon, authenticated, service_role;

create schema if not exists oncoready_private;
revoke all on schema oncoready_private from public, anon, authenticated, service_role;

create or replace function oncoready_private.invoke_minute_tick()
returns bigint
language plpgsql
security definer
set search_path = pg_catalog, net, vault, oncoready_private
as $$
declare
  tick_url text;
  tick_secret text;
  url_count integer;
  secret_count integer;
  request_id bigint;
begin
  select count(*), min(decrypted_secret)
    into url_count, tick_url
    from vault.decrypted_secrets
   where name = 'oncoready_tick_url';

  select count(*), min(decrypted_secret)
    into secret_count, tick_secret
    from vault.decrypted_secrets
   where name = 'oncoready_cron_secret';

  if url_count <> 1 or tick_url is null or btrim(tick_url) = '' then
    raise exception 'required Vault entry oncoready_tick_url is missing or ambiguous'
      using errcode = '22023';
  end if;
  if secret_count <> 1 or tick_secret is null or char_length(tick_secret) < 32 then
    raise exception 'required Vault entry oncoready_cron_secret is missing, ambiguous, or too short'
      using errcode = '22023';
  end if;
  if tick_url !~ '^https://[^/?#]+/api/v1/operations/tick\?max_items=25$' then
    raise exception 'Vault entry oncoready_tick_url must be the canonical HTTPS tick URL with max_items=25'
      using errcode = '22023';
  end if;

  select net.http_get(
    url := tick_url,
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || tick_secret,
      'Accept', 'application/json'
    ),
    timeout_milliseconds := 10000
  ) into request_id;

  -- Return only pg_net's opaque request identifier. URL and header values are
  -- never returned, raised, or embedded in the durable pg_cron command.
  return request_id;
end;
$$;

revoke all on function oncoready_private.invoke_minute_tick() from public, anon, authenticated, service_role;

do $$
declare
  existing_job_id bigint;
begin
  for existing_job_id in
    select jobid from cron.job where jobname = 'oncoready-minute-tick'
  loop
    perform cron.unschedule(existing_job_id);
  end loop;

  perform cron.schedule(
    'oncoready-minute-tick',
    '* * * * *',
    'select oncoready_private.invoke_minute_tick();'
  );
end;
$$;

comment on function oncoready_private.invoke_minute_tick() is
  'Reads only oncoready_tick_url and oncoready_cron_secret from Vault and enqueues one bounded authenticated GET through pg_net.';
