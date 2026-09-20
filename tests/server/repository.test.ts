import {describe,expect,it,vi} from "vitest";
import {MemoryWorkflowRepository,createSeedProjections} from "../../packages/server/src/repository.js";
import {WorkflowApplication} from "../../packages/server/src/application.js";
import {loadConfig} from "../../packages/server/src/config.js";
import type {OutboxItem} from "../../packages/server/src/types.js";

const scenario="11111111-1111-4111-8111-111111111111" as const;
const config=loadConfig({DATABASE_URL:"postgres://localhost/oncoready",ONCOREADY_PUBLIC_DEMO_ENABLED:"true",ONCOREADY_OPERATOR_TOKEN:"operator-control-token-000000000000",CRON_SECRET:"Q6mT2xR9vK4pL8sN3wF7dH1yC5jB0zG!"});

describe("application transaction semantics",()=>{
  it("returns the prior semantic result for a repeated idempotency key",async()=>{
    const repo=new MemoryWorkflowRepository(createSeedProjections(scenario)); const app=new WorkflowApplication(repo,config);
    const command={scenario_id:scenario,actor_role:"patient" as const,idempotency_key:"same-key-001",expected_aggregate_version:0,channel:"web" as const,transport_status:"needs_help" as const,clinical_concern_verbatim:"Mild tingling",callback_requested:true};
    const first=await app.readiness(command); const replay=await app.readiness(command);
    expect(first.disposition).toBe("accepted"); expect(replay.disposition).toBe("replayed");
    expect(replay.command_id).toBe(first.command_id); expect(repo.events).toHaveLength(first.emitted_events.length);
  });

  it("rejects stale versions instead of overwriting",async()=>{
    const repo=new MemoryWorkflowRepository(createSeedProjections(scenario)); const app=new WorkflowApplication(repo,config);
    const base={scenario_id:scenario,actor_role:"patient" as const,expected_aggregate_version:0,channel:"web" as const,transport_status:"confirmed" as const,callback_requested:false};
    await app.readiness({...base,idempotency_key:"version-a"});
    await expect(app.readiness({...base,idempotency_key:"version-b"})).rejects.toMatchObject({code:"version_conflict"});
  });

  it("returns a caregiver allowlist projection with no clinical or model fields",async()=>{
    const projections=createSeedProjections(scenario);(projections.caregiver as Record<string,unknown>).clinical_text="must never leave server";(projections.caregiver.transport as Record<string,unknown>).nurse_note="hidden";(projections.caregiver as Record<string,unknown>).priority={score:0.9};
    const repo=new MemoryWorkflowRepository(projections);
    const serialized=JSON.stringify(await repo.getProjection(scenario,"caregiver"));
    expect(serialized).not.toMatch(/clinical|verbatim|nurse|priority|model|score/i);
  });

  it("omits transport entirely when caregiver permission is revoked",async()=>{
    const projections=createSeedProjections(scenario);projections.caregiver.permission={transport_logistics_allowed:false};
    const result=await new MemoryWorkflowRepository(projections).getProjection(scenario,"caregiver");
    expect(result.permission).toEqual({transport_logistics_allowed:false});expect(result).not.toHaveProperty("transport");
  });

  it("reset clears pending external work",async()=>{
    const repo=new MemoryWorkflowRepository(createSeedProjections(scenario)); const app=new WorkflowApplication(repo,config);
    await app.communication("sms",{scenario_id:scenario,actor_role:"staff",idempotency_key:"queue-sms-001",expected_aggregate_version:0,purpose:"readiness",destination_alias:"finals_allowlisted_phone"});
    expect(repo.outbox).toHaveLength(1);
    await app.reset({scenario_id:scenario,actor_role:"staff",idempotency_key:"reset-key-001",expected_aggregate_version:0,confirmation:"RESET_FINALS_SCENARIO"});
    expect(repo.outbox).toHaveLength(0);
  });

  it("rejects provider outbox work from the public database-only execution class",async()=>{
    const repo=new MemoryWorkflowRepository(createSeedProjections(scenario));
    await expect(repo.executeCommand({
      scenarioId:scenario,
      idempotencyKey:"public-outbox-invariant-001",
      semanticInput:{action:"attempt_provider_work"},
      aggregateType:"readiness_check",
      aggregateId:"public-outbox-invariant-001",
      expectedVersion:0,
      effectClass:"public_database_only",
    },()=>({
      aggregateVersion:1,
      events:[],
      projections:{},
      outbox:[{
        scenario_id:scenario,
        action_type:"sms",
        stable_action_id:"public-outbox-invariant-001",
        payload:{destination_alias:"finals_allowlisted_phone"},
      }],
    }))).rejects.toMatchObject({status:403,code:"forbidden_action"});
    expect(repo.events).toHaveLength(0);
    expect(repo.outbox).toHaveLength(0);
  });

  it("never dispatches a provider item without persisted operator authorization",async()=>{
    const repo=new MemoryWorkflowRepository(createSeedProjections(scenario));
    repo.outbox.push({outbox_id:"unauthorized-outbox",scenario_id:scenario,action_type:"sms",stable_action_id:"unauthorized-action",payload:{purpose:"readiness"},attempts:0});
    const dispatch=vi.fn(async(_item:OutboxItem)=>({providerReference:"must-not-exist"}));
    await expect(repo.runTick(25,dispatch)).resolves.toMatchObject({claimed:1,succeeded:0,failed:1});
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("dispatches only outbox work created with operator authorization provenance",async()=>{
    const repo=new MemoryWorkflowRepository(createSeedProjections(scenario));const app=new WorkflowApplication(repo,config);
    await app.communication("sms",{scenario_id:scenario,actor_role:"staff",idempotency_key:"operator-dispatch-001",expected_aggregate_version:0,purpose:"readiness",destination_alias:"finals_allowlisted_phone"});
    const dispatch=vi.fn(async(_item:OutboxItem)=>({providerReference:"provider-reference-001"}));
    await expect(repo.runTick(25,dispatch)).resolves.toMatchObject({claimed:1,succeeded:1,failed:0});
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0]?.[0].payload.authorization_source).toBe("operator_control");
  });
});
