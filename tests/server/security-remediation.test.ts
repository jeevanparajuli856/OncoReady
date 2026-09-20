import {describe, expect, it, vi} from "vitest";
import {assertControlSecret, assertDatabaseUrl, assertRuntimeConfig, loadConfig} from "../../packages/server/src/config.js";
import {PostgresWorkflowRepository} from "../../packages/server/src/postgres-repository.js";
import type {OutboxItem} from "../../packages/server/src/types.js";

const scenario = "11111111-1111-4111-8111-111111111111";

describe("independent scheduler authorization remediation", () => {
  it("fails due cadence and forged legacy outbox work before any provider network boundary", async () => {
    const queries: Array<{sql: string; params: unknown[]}> = [];
    const scheduled = {
      scheduled_action_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      scenario_id: scenario,
      stable_action_id: "finals-t3-readiness",
      payload: {channel: "sms"},
    };
    const forged = {
      outbox_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      event_id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      scenario_id: scenario,
      provider: "twilio_sms",
      action_type: "sms",
      stable_action_id: "forged-operator-action",
      payload: {
        communication_id: "forged-operator-action",
        authorization_source: "operator_control",
        purpose: "readiness",
      },
      attempt_count: 1,
    };
    const claimClient = {
      query: vi.fn(async (sql: string, params: unknown[] = []) => {
        queries.push({sql, params});
        if (sql.includes("try_scheduler_lock")) return {rows: [{locked: true}], rowCount: 1};
        if (sql.includes("claim_scheduled_actions")) return {rows: [scheduled], rowCount: 1};
        if (sql.includes("claim_outbox")) return {rows: [forged], rowCount: 1};
        if (sql.includes("select exists(")) return {rows: [{authorized: false}], rowCount: 1};
        return {rows: [], rowCount: 1};
      }),
      release: vi.fn(),
    };
    const pool = {
      connect: vi.fn(async () => claimClient),
      query: vi.fn(async (sql: string) => sql.includes("count(*)::int count")
        ? {rows: [{count: 0}], rowCount: 1}
        : {rows: [], rowCount: 1}),
      end: vi.fn(async () => undefined),
    };
    const repository = new PostgresWorkflowRepository("postgres://localhost/oncoready");
    (repository as unknown as {pool: unknown}).pool = pool;
    const dispatch = vi.fn(async (_item: OutboxItem) => ({providerReference: "must-not-exist"}));

    await expect(repository.runTick(25, dispatch)).resolves.toMatchObject({
      claimed: 1,
      succeeded: 0,
      failed: 1,
      remaining_due: 0,
    });
    expect(dispatch).not.toHaveBeenCalled();
    expect(queries.some(({sql}) => sql.includes("insert into public.outbox"))).toBe(false);
    expect(queries.some(({sql, params}) =>
      sql.includes("update public.scheduled_actions")
      && sql.includes("operator_authorization_required")
      && params[0] === scheduled.scheduled_action_id,
    )).toBe(true);
    expect(queries.some(({sql, params}) =>
      sql.includes("update public.outbox set status='failed'")
      && sql.includes("operator_authorization_required")
      && params[0] === forged.outbox_id,
    )).toBe(true);
    expect(queries.some(({sql}) => sql.includes("we.event_type='communication.queued'"))).toBe(true);
  });
});

describe("independent runtime configuration remediation", () => {
  it("accepts Railway-private PostgreSQL while public endpoints require a TLS-enforcing mode", () => {
    expect(() => assertDatabaseUrl("postgresql://user:secret@postgres.railway.internal:5432/railway")).not.toThrow();
    for (const mode of ["disable", "allow", "prefer"]) {
      expect(() => assertDatabaseUrl(`postgresql://user:secret@public.example:5432/oncoready?sslmode=${mode}`)).toThrowError(
        expect.objectContaining({status: 503, code: "dependency_unavailable"}),
      );
    }
    for (const mode of ["require", "verify-ca", "verify-full"]) {
      expect(() => assertDatabaseUrl(`postgresql://user:secret@public.example:5432/oncoready?sslmode=${mode}`)).not.toThrow();
    }
  });

  it("requires at least 32 bytes and 128 bits of estimated entropy for CRON_SECRET", () => {
    const strongSecret = "H7qM2vX9pL4sR8kC3wN6dF1yT5jB0zA!";
    expect(() => assertControlSecret("short-secret", "CRON_SECRET")).toThrowError(
      expect.objectContaining({status: 503, code: "dependency_unavailable"}),
    );
    expect(() => assertControlSecret("0".repeat(64), "CRON_SECRET")).toThrowError(
      expect.objectContaining({status: 503, code: "dependency_unavailable"}),
    );
    expect(() => assertControlSecret(strongSecret, "CRON_SECRET")).not.toThrow();
    expect(() => assertRuntimeConfig(loadConfig({
      DATABASE_URL: "postgresql://user:secret@postgres.railway.internal:5432/railway",
      CRON_SECRET: strongSecret,
    }))).not.toThrow();
  });
});
