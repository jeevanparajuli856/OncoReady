import {describe, expect, it} from "vitest";
import {loadConfig} from "../../packages/server/src/config.js";
import {createHttpHandler} from "../../packages/server/src/http.js";
import {MemoryWorkflowRepository, createSeedProjections} from "../../packages/server/src/repository.js";

const scenario = "11111111-1111-4111-8111-111111111111" as const;
const operatorToken = "independent-operator-token-000000000000";
const config = loadConfig({
  DATABASE_URL: "postgres://localhost/oncoready",
  ONCOREADY_PUBLIC_DEMO_ENABLED: "true",
  ONCOREADY_OPERATOR_TOKEN: operatorToken,
  CRON_SECRET: "independent-cron-secret",
  EXTERNAL_ACTIONS_ENABLED: "false",
  TWILIO_SMS_ENABLED: "false",
  ELEVENLABS_VOICE_ENABLED: "false",
});

const post = (path: string, body: unknown, token?: string) => new Request(`https://finals.example${path}`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    ...(token ? {"x-oncoready-operator-token": token} : {}),
  },
  body: JSON.stringify(body),
});

describe("independent integrated launch journey", () => {
  it("turns one public readiness signal into role-minimized durable work without external effects", async () => {
    const repository = new MemoryWorkflowRepository(createSeedProjections(scenario));
    const handler = createHttpHandler(repository, config);

    const readiness = await handler(post("/api/v1/readiness-submissions", {
      scenario_id: scenario,
      actor_role: "patient",
      idempotency_key: "independent-readiness-001",
      expected_aggregate_version: 0,
      channel: "web",
      transport_status: "needs_help",
      clinical_concern_verbatim: "Mild tingling to discuss with my nurse.",
      callback_requested: true,
    }));

    expect(readiness.status).toBe(202);
    expect(repository.outbox).toHaveLength(0);

    const projections = await Promise.all(["patient", "staff", "caregiver", "transport_coordinator"].map(async (role) => {
      const response = await handler(new Request(`https://finals.example/api/v1/scenarios/finals?role=${role}`));
      expect(response.status).toBe(200);
      return response.json() as Promise<Record<string, unknown>>;
    }));
    const [patient, staff, caregiver, transport] = projections;

    expect(patient).toMatchObject({role: "patient", readiness_status: "at_risk"});
    expect((patient?.blockers as unknown[])).toHaveLength(3);
    expect(staff).toMatchObject({role: "staff", readiness_status: "at_risk"});
    expect((staff?.work_items as unknown[])).toHaveLength(3);
    expect(JSON.stringify(staff)).toContain("Mild tingling to discuss with my nurse.");
    expect(caregiver).toMatchObject({role: "caregiver", permission: {transport_logistics_allowed: true}});
    expect(transport).toMatchObject({role: "transport_coordinator"});

    const minimized = `${JSON.stringify(patient)}${JSON.stringify(caregiver)}${JSON.stringify(transport)}`;
    expect(minimized).not.toContain("Mild tingling to discuss with my nurse.");
    expect(minimized).not.toContain("priority");
    expect(minimized).not.toContain("model_version");
    expect(repository.outbox).toHaveLength(0);
  });

  it("keeps reset, SMS, and voice behind operator control and reset removes all queued effects", async () => {
    const repository = new MemoryWorkflowRepository(createSeedProjections(scenario));
    const handler = createHttpHandler(repository, config);
    const base = {
      scenario_id: scenario,
      actor_role: "staff",
      expected_aggregate_version: 0,
      purpose: "readiness",
      destination_alias: "finals_allowlisted_phone",
    };

    for (const channel of ["sms", "voice"] as const) {
      const unauthorized = await handler(post(`/api/v1/communications/${channel}`, {...base, idempotency_key: `unauthorized-${channel}`}));
      expect(unauthorized.status).toBe(401);

      const accepted = await handler(post(`/api/v1/communications/${channel}`, {...base, idempotency_key: `authorized-${channel}`}, operatorToken));
      expect(accepted.status).toBe(202);
    }
    expect(repository.outbox).toHaveLength(2);
    expect(repository.outbox.every((item) => item.payload.authorization_source === "operator_control")).toBe(true);

    const deniedReset = await handler(post("/api/v1/scenarios/finals/reset", {
      scenario_id: scenario,
      actor_role: "staff",
      idempotency_key: "denied-reset",
      expected_aggregate_version: 0,
      confirmation: "RESET_FINALS_SCENARIO",
    }));
    expect(deniedReset.status).toBe(401);
    expect(repository.outbox).toHaveLength(2);

    const reset = await handler(post("/api/v1/scenarios/finals/reset", {
      scenario_id: scenario,
      actor_role: "staff",
      idempotency_key: "authorized-reset",
      expected_aggregate_version: 0,
      confirmation: "RESET_FINALS_SCENARIO",
    }, operatorToken));
    expect(reset.status).toBe(200);
    expect(repository.outbox).toHaveLength(0);
    expect(repository.events.at(-1)).toMatchObject({
      event_type: "scenario.reset",
      payload: {external_actions_suppressed: true},
    });
  });
});
