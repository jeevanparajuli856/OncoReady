\set ON_ERROR_STOP on

-- Run against the linked controlled DEV/finals project after the operator has
-- provisioned Vault. This emits status/identifiers only, never decrypted values.
do $$
declare
  vault_count integer;
  job_count integer;
begin
  select count(*) into vault_count
    from vault.decrypted_secrets
   where name in ('oncoready_tick_url', 'oncoready_cron_secret');
  if vault_count <> 2 then
    raise exception 'Supabase Cron preflight failed: both named Vault entries are required';
  end if;

  select count(*) into job_count
    from cron.job
   where jobname = 'oncoready-minute-tick'
     and schedule = '* * * * *'
     and active
     and command = 'select oncoready_private.invoke_minute_tick();';
  if job_count <> 1 then
    raise exception 'Supabase Cron preflight failed: exact active one-minute job is required';
  end if;
end;
$$;

select
  count(*) filter (where name = 'oncoready_tick_url') = 1 as tick_url_configured,
  count(*) filter (where name = 'oncoready_cron_secret') = 1 as cron_secret_configured
from vault.decrypted_secrets
where name in ('oncoready_tick_url', 'oncoready_cron_secret');

select
  jobid,
  jobname,
  schedule,
  active,
  command = 'select oncoready_private.invoke_minute_tick();' as command_is_secret_free_invoker
from cron.job
where jobname = 'oncoready-minute-tick'
  and schedule = '* * * * *'
  and active
  and command = 'select oncoready_private.invoke_minute_tick();';

select
  request_id,
  status_code,
  timed_out,
  created
from net._http_response
order by created desc
limit 1;
