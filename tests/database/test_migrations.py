from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
CORE = ROOT / "supabase" / "migrations" / "20260920172033_launch_workflow_core.sql"
CRON = ROOT / "supabase" / "migrations" / "20260920174405_install_supabase_cron_tick.sql"


def test_core_migration_has_scheduler_safety_primitives() -> None:
    sql = CORE.read_text()
    assert "pg_try_advisory_xact_lock" in sql
    assert "for update skip locked" in sql.lower()
    assert "outcome_unknown" in sql
    assert "reconciliation_required" in sql
    assert "reset_finals_scenario" in sql


def test_cron_job_has_exact_name_cadence_and_safe_command() -> None:
    sql = CRON.read_text()
    assert "create extension if not exists pg_cron" in sql.lower()
    assert "create extension if not exists pg_net" in sql.lower()
    assert "revoke execute on function net.http_get(text, jsonb, jsonb, integer)" in sql.lower()
    assert "'oncoready-minute-tick'" in sql
    assert "'* * * * *'" in sql
    assert "'select oncoready_private.invoke_minute_tick();'" in sql
    assert "max_items=25" in sql
    assert "'Authorization', 'Bearer ' || tick_secret" in sql


def test_cron_invoker_requires_only_the_two_approved_vault_names() -> None:
    sql = CRON.read_text()
    selected_names = re.findall(r"where name = '([^']+)'", sql)
    assert selected_names == ["oncoready_tick_url", "oncoready_cron_secret"]
    assert "required Vault entry oncoready_tick_url is missing" in sql
    assert "required Vault entry oncoready_cron_secret is missing" in sql
    assert "security definer" in sql.lower()
    assert "revoke all on function oncoready_private.invoke_minute_tick()" in sql.lower()


def test_migration_contains_no_environment_origin_or_secret_literal() -> None:
    sql = CRON.read_text()
    assert not re.search(r"https://[A-Za-z0-9-]+\.(?:vercel\.app|onrender\.com|netlify\.app)", sql)
    assert not re.search(r"Bearer [A-Za-z0-9_./+~-]{16,}", sql)
    durable_command = re.search(
        r"cron\.schedule\(\s*'oncoready-minute-tick',\s*'\* \* \* \* \*',\s*'([^']+)'",
        sql,
        flags=re.DOTALL,
    )
    assert durable_command is not None
    assert "vault" not in durable_command.group(1).lower()
    assert "authorization" not in durable_command.group(1).lower()
