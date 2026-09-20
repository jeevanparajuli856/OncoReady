from __future__ import annotations

import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MIGRATIONS = ROOT / "database" / "migrations"
CORE = MIGRATIONS / "20260920172033_launch_workflow_core.sql"
SEED = MIGRATIONS / "20260920174500_seed_finals_scenario.sql"


def test_railway_migrations_are_timestamped_and_ordered() -> None:
    migrations = sorted(MIGRATIONS.glob("*.sql"))
    assert migrations == [CORE, SEED]
    assert all(re.match(r"^\d{14}_[a-z0-9_]+\.sql$", path.name) for path in migrations)
    assert "create or replace function public.reset_finals_scenario" in CORE.read_text()
    assert "select public.reset_finals_scenario();" in SEED.read_text()


def test_core_migration_has_in_process_scheduler_safety_primitives() -> None:
    sql = CORE.read_text()
    lowered = sql.lower()
    assert "pg_try_advisory_xact_lock" in lowered
    assert "for update skip locked" in lowered
    assert "create unique index claim_leases_one_active_resource" in lowered
    assert "where status = 'active'" in lowered
    assert "claim_scheduled_actions" in lowered
    assert "claim_outbox" in lowered
    assert "recover_stale_claims" in lowered


def test_uncertain_provider_outcome_cannot_be_blindly_retried() -> None:
    sql = CORE.read_text()
    lowered = sql.lower()
    assert "outcome_unknown" in lowered
    assert "reconciliation_required" in lowered
    assert "pa.status in ('intent_recorded', 'in_flight', 'accepted', 'outcome_unknown')" in lowered
    assert "not exists (" in lowered
    assert "from public.provider_attempts pa" in lowered


def test_reset_and_seed_remain_deterministic_and_inert() -> None:
    core_sql = CORE.read_text()
    seed_sql = SEED.read_text()
    assert "reset_finals_scenario" in core_sql
    assert "revoke execute on function public.reset_finals_scenario() from public;" in core_sql
    assert "reset must not leave external actions" in core_sql
    assert "external_actions_suppressed" in core_sql
    assert seed_sql.count("reset_finals_scenario") == 1


def test_migrations_have_no_retired_scheduler_extensions_or_platform_roles() -> None:
    sql = "\n".join(path.read_text() for path in sorted(MIGRATIONS.glob("*.sql"))).lower()
    forbidden = (
        "_".join(("pg", "cron")),
        "_".join(("pg", "net")),
        "vault.decrypted_secrets",
        "service_role",
        "authenticated",
        "extensions.gen_random_uuid",
    )
    for marker in forbidden:
        assert marker not in sql
    assert "create extension if not exists pgcrypto;" in sql


def test_database_migrations_contain_no_environment_url_or_secret_literal() -> None:
    sql = "\n".join(path.read_text() for path in sorted(MIGRATIONS.glob("*.sql")))
    assert "DATABASE_URL=" not in sql
    assert not re.search(r"postgres(?:ql)?://[^\s'\"]+", sql, flags=re.IGNORECASE)
    assert not re.search(r"Bearer [A-Za-z0-9_./+~-]{16,}", sql)
