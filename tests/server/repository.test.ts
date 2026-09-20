import {describe,expect,it,vi} from "vitest";
import {MemoryWorkflowRepository,createSeedProjections} from "../../packages/server/src/repository.js";
import {WorkflowApplication} from "../../packages/server/src/application.js";
import {loadConfig} from "../../packages/server/src/config.js";
import type {OutboxItem} from "../../packages/server/src/types.js";
import {PostgresWorkflowRepository} from "../../packages/server/src/postgres-repository.js";

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

  it("preserves work item resource policy state from assign through acknowledge",async()=>{
    const workItemId="55555555-5555-4555-8555-555555555555";const projections=createSeedProjections(scenario);
    projections.staff.work_items=[{work_item_id:workItemId,work_item_type:"clinical_review",owner_role:"triage_nurse",status:"open",due_at:"2026-10-12T18:00:00.000Z",aggregate_version:1}];
    const app=new WorkflowApplication(new MemoryWorkflowRepository(projections),config);
    await expect(app.workItem(workItemId,{scenario_id:scenario,actor_role:"staff",idempotency_key:"work-assign-001",expected_aggregate_version:1,action:"assign",owner_id:"triage-nurse-1"})).resolves.toMatchObject({aggregate_version:2});
    await expect(app.workItem(workItemId,{scenario_id:scenario,actor_role:"staff",idempotency_key:"work-ack-001",expected_aggregate_version:2,action:"acknowledge"})).resolves.toMatchObject({aggregate_version:3});
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

  it("projects a new CareLink command identity to the patient without widening caregiver data",async()=>{
    const workItemId="55555555-5555-4555-8555-555555555556";const projections=createSeedProjections(scenario);
    projections.staff.work_items=[{work_item_id:workItemId,work_item_type:"transport_navigation",owner_role:"transport_coordinator",status:"open",due_at:"2026-10-12T18:00:00.000Z",aggregate_version:1}];
    const repo=new MemoryWorkflowRepository(projections);const app=new WorkflowApplication(repo,config);
    const receipt=await app.createTransport({scenario_id:scenario,actor_role:"transport_coordinator",idempotency_key:"transport-identity-001",expected_aggregate_version:0,work_item_id:workItemId});
    expect(await repo.getProjection(scenario,"patient")).toMatchObject({transport:{transport_request_id:receipt.aggregate_id,aggregate_version:1,status:"eligibility_reviewed"}});
    expect(await repo.getProjection(scenario,"staff")).toMatchObject({transport:{transport_request_id:receipt.aggregate_id,aggregate_version:1,status:"eligibility_reviewed"}});
    expect(await repo.getProjection(scenario,"transport_coordinator")).toMatchObject({request:{transport_request_id:receipt.aggregate_id,aggregate_version:1,status:"eligibility_reviewed"}});
    const caregiver=await repo.getProjection(scenario,"caregiver");
    expect(caregiver).toMatchObject({transport:{status:"eligibility_reviewed"}});
    expect(caregiver.transport).not.toHaveProperty("transport_request_id");expect(caregiver.transport).not.toHaveProperty("aggregate_version");
  });

  it("lets the patient acknowledge only the current notified transport and updates every role projection",async()=>{
    const transportId="44444444-4444-4444-8444-444444444444";
    const notified=()=>{const projections=createSeedProjections(scenario);const version=7;
      projections.patient.transport={...(projections.patient.transport as Record<string,unknown>),transport_request_id:transportId,aggregate_version:version,status:"patient_notified",acknowledgment_required:true};
      projections.staff.transport={...(projections.staff.transport as Record<string,unknown>),transport_request_id:transportId,aggregate_version:version,status:"patient_notified"};
      projections.caregiver.transport={...(projections.caregiver.transport as Record<string,unknown>),status:"patient_notified",acknowledgment_status:"awaiting_patient"};
      projections.transport_coordinator.request={...(projections.transport_coordinator.request as Record<string,unknown>),transport_request_id:transportId,aggregate_version:version,status:"patient_notified",acknowledgment_status:"awaiting_patient"};return projections;};
    const base={scenario_id:scenario,actor_role:"patient" as const,idempotency_key:"patient-ack-001",expected_aggregate_version:7,action:"acknowledge_patient" as const};
    await expect(new WorkflowApplication(new MemoryWorkflowRepository(notified()),config).transport(transportId,{...base,expected_aggregate_version:6,idempotency_key:"patient-ack-stale"})).rejects.toMatchObject({status:409,code:"version_conflict"});
    const wrongState=notified();(wrongState.transport_coordinator.request as Record<string,unknown>).status="driver_assigned";
    await expect(new WorkflowApplication(new MemoryWorkflowRepository(wrongState),config).transport(transportId,{...base,idempotency_key:"patient-ack-state"})).rejects.toMatchObject({status:422,code:"invalid_transition"});
    await expect(new WorkflowApplication(new MemoryWorkflowRepository(notified()),config).transport(transportId,{...base,actor_role:"transport_coordinator",idempotency_key:"patient-ack-role"})).rejects.toMatchObject({status:403,code:"forbidden_action"});

    const repo=new MemoryWorkflowRepository(notified());const receipt=await new WorkflowApplication(repo,config).transport(transportId,base);
    expect(receipt).toMatchObject({aggregate_id:transportId,aggregate_version:8});
    expect(await repo.getProjection(scenario,"patient")).toMatchObject({transport:{transport_request_id:transportId,aggregate_version:8,status:"patient_acknowledged",acknowledgment_required:false}});
    expect(await repo.getProjection(scenario,"staff")).toMatchObject({transport:{transport_request_id:transportId,aggregate_version:8,status:"patient_acknowledged"}});
    expect(await repo.getProjection(scenario,"transport_coordinator")).toMatchObject({request:{transport_request_id:transportId,aggregate_version:8,status:"patient_acknowledged",acknowledgment_status:"acknowledged"}});
    const caregiver=await repo.getProjection(scenario,"caregiver");
    expect(caregiver).toMatchObject({transport:{status:"patient_acknowledged",acknowledgment_status:"acknowledged"}});
    expect(caregiver.transport).not.toHaveProperty("transport_request_id");expect(caregiver.transport).not.toHaveProperty("aggregate_version");
  });

  it("hydrates the PostgreSQL patient projection with the current relational transport identity",async()=>{
    const patient=createSeedProjections(scenario).patient;delete (patient.transport as Record<string,unknown>).transport_request_id;delete (patient.transport as Record<string,unknown>).aggregate_version;
    const pool={query:vi.fn(async(sql:string)=>sql.includes("role_projections")?{rows:[{projection:patient}],rowCount:1}:{rows:[{transport_request_id:"44444444-4444-4444-8444-444444444444",aggregate_version:9}],rowCount:1}),end:vi.fn()};
    const repo=new PostgresWorkflowRepository("postgres://localhost/oncoready");(repo as unknown as {pool:unknown}).pool=pool;
    await expect(repo.getProjection(scenario,"patient")).resolves.toMatchObject({transport:{transport_request_id:"44444444-4444-4444-8444-444444444444",aggregate_version:9}});
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("from public.transport_projections"),[scenario]);
  });
});
