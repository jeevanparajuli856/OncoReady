import {describe,expect,it} from "vitest";
import {createHttpHandler} from "../../packages/server/src/http.js";
import {assertDatabaseUrl,assertRuntimeConfig,loadConfig} from "../../packages/server/src/config.js";
import {MemoryWorkflowRepository,createSeedProjections} from "../../packages/server/src/repository.js";

const scenario="11111111-1111-4111-8111-111111111111" as const;
const operatorToken="operator-control-token-000000000000";
const cronSecret="R8vK3xQ7mP2sT9wL4cN6hF1yD5jB0zG!";
const enabledConfig=loadConfig({DATABASE_URL:"postgres://localhost/oncoready",ONCOREADY_PUBLIC_DEMO_ENABLED:"true",ONCOREADY_OPERATOR_TOKEN:operatorToken,ONCOREADY_ALLOWED_ORIGINS:"https://finals.example",ONCOREADY_PUBLIC_ORIGIN:"https://finals.example",CRON_SECRET:cronSecret,EXTERNAL_ACTIONS_ENABLED:"false",TWILIO_SMS_ENABLED:"false",ELEVENLABS_VOICE_ENABLED:"false"});
const disabledConfig=loadConfig({DATABASE_URL:"postgres://localhost/oncoready",ONCOREADY_PUBLIC_DEMO_ENABLED:"false",ONCOREADY_OPERATOR_TOKEN:operatorToken,CRON_SECRET:cronSecret});

const readinessBody=(overrides:Record<string,unknown>={})=>({scenario_id:scenario,actor_role:"patient",idempotency_key:"public-readiness-001",expected_aggregate_version:0,channel:"web",transport_status:"needs_help",clinical_concern_verbatim:"Mild tingling",callback_requested:true,...overrides});

describe("HTTP trust boundary",()=>{
  it("accepts Railway private-network PostgreSQL without a public TLS query flag",()=>{
    const privateConfig=loadConfig({DATABASE_URL:"postgresql://user:secret@postgres.railway.internal:5432/railway",CRON_SECRET:cronSecret});
    expect(()=>assertRuntimeConfig(privateConfig)).not.toThrow();
  });

  it("requires a TLS-enforcing sslmode for public PostgreSQL hosts",()=>{
    for(const mode of ["disable","allow","prefer"]){
      expect(()=>assertDatabaseUrl(`postgresql://user:secret@public.example:5432/oncoready?sslmode=${mode}`)).toThrowError(expect.objectContaining({status:503,code:"dependency_unavailable"}));
    }
    expect(()=>assertDatabaseUrl("postgresql://user:secret@public.example:5432/oncoready?sslmode=require")).not.toThrow();
    expect(()=>assertDatabaseUrl("postgresql://user:secret@public.example:5432/oncoready?sslmode=verify-full")).not.toThrow();
    expect(()=>assertDatabaseUrl("postgresql://user:secret@localhost:5432/oncoready?sslmode=disable")).not.toThrow();
  });

  it("exposes database-backed health independently of demo enablement",async()=>{
    const handler=createHttpHandler(new MemoryWorkflowRepository(createSeedProjections(scenario)),disabledConfig);
    const response=await handler(new Request("https://finals.example/health"));
    expect(response.status).toBe(200);expect(await response.json()).toEqual({status:"ok"});
  });

  it("fails closed when the public demo is disabled",async()=>{
    const handler=createHttpHandler(new MemoryWorkflowRepository(createSeedProjections(scenario)),disabledConfig);
    const response=await handler(new Request("https://finals.example/api/v1/scenarios/finals?role=patient"));
    expect(response.status).toBe(403);expect(await response.json()).toMatchObject({code:"forbidden_action"});
  });

  it("serves the fixed synthetic projection to a direct non-browser request without credentials",async()=>{
    const handler=createHttpHandler(new MemoryWorkflowRepository(createSeedProjections(scenario)),enabledConfig);
    const response=await handler(new Request("https://finals.example/api/v1/scenarios/finals?role=patient"));
    expect(response.status).toBe(200);expect(await response.json()).toMatchObject({scenario_id:scenario,role:"patient"});
  });

  it("accepts web readiness without credentials and cannot create provider outbox authorization",async()=>{
    const repo=new MemoryWorkflowRepository(createSeedProjections(scenario));const handler=createHttpHandler(repo,enabledConfig);
    const response=await handler(new Request("https://finals.example/api/v1/readiness-submissions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(readinessBody({destination_alias:"arbitrary",external_actions_enabled:true}))}));
    expect(response.status).toBe(202);expect(repo.events.length).toBeGreaterThan(0);expect(repo.outbox).toHaveLength(0);
  });

  it("rejects arbitrary scenarios and non-web readiness before domain execution",async()=>{
    const repo=new MemoryWorkflowRepository(createSeedProjections(scenario));const handler=createHttpHandler(repo,enabledConfig);
    const otherScenario=await handler(new Request("https://finals.example/api/v1/readiness-submissions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(readinessBody({scenario_id:"99999999-9999-4999-8999-999999999999"}))}));
    expect(otherScenario.status).toBe(403);
    const smsChannel=await handler(new Request("https://finals.example/api/v1/readiness-submissions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(readinessBody({channel:"sms"}))}));
    expect(smsChannel.status).toBe(400);expect(repo.events).toHaveLength(0);expect(repo.outbox).toHaveLength(0);
  });

  it("rejects arbitrary work resources/actions and claimed roles outside resource policy",async()=>{
    const workItemId="55555555-5555-4555-8555-555555555555";const projections=createSeedProjections(scenario);
    projections.staff.work_items=[{work_item_id:workItemId,work_item_type:"clinical_review",owner_role:"triage_nurse",status:"open",due_at:"2026-10-12T18:00:00.000Z",aggregate_version:1}];
    const handler=createHttpHandler(new MemoryWorkflowRepository(projections),enabledConfig);
    const body={scenario_id:scenario,actor_role:"transport_coordinator",idempotency_key:"work-policy-001",expected_aggregate_version:1,action:"assign",owner_id:"coordinator"};
    expect((await handler(new Request(`https://finals.example/api/v1/work-items/${workItemId}/commands`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}))).status).toBe(403);
    expect((await handler(new Request(`https://finals.example/api/v1/work-items/${workItemId}/commands`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...body,actor_role:"staff",action:"send_money",idempotency_key:"work-policy-002"})}))).status).toBe(400);
    expect((await handler(new Request("https://finals.example/api/v1/work-items/66666666-6666-4666-8666-666666666666/commands",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...body,actor_role:"staff",idempotency_key:"work-policy-003"})}))).status).toBe(404);
  });

  it("derives the CareLink plan server-side and rejects client-selected plan fields",async()=>{
    const workItemId="55555555-5555-4555-8555-555555555556";const projections=createSeedProjections(scenario);
    projections.staff.work_items=[{work_item_id:workItemId,work_item_type:"transport_navigation",owner_role:"transport_coordinator",status:"open",due_at:"2026-10-12T18:00:00.000Z",aggregate_version:1}];
    const repo=new MemoryWorkflowRepository(projections);const handler=createHttpHandler(repo,enabledConfig);
    const base={scenario_id:scenario,actor_role:"transport_coordinator",idempotency_key:"carelink-create-001",expected_aggregate_version:0,work_item_id:workItemId};
    const rejected=await handler(new Request("https://finals.example/api/v1/transport/requests",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...base,idempotency_key:"carelink-create-bad",service_area:"arbitrary"})}));
    expect(rejected.status).toBe(400);
    const accepted=await handler(new Request("https://finals.example/api/v1/transport/requests",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(base)}));
    expect(accepted.status).toBe(202);expect(repo.outbox).toHaveLength(0);
    const projection=await repo.getProjection(scenario,"transport_coordinator");
    expect(projection.request).toMatchObject({service_area:"New Orleans pilot service area",contact_alias:"finals_allowlisted_phone"});
  });

  it("authenticates reset and communication routes before parsing their bodies",async()=>{
    const repo=new MemoryWorkflowRepository(createSeedProjections(scenario));const handler=createHttpHandler(repo,enabledConfig);
    for(const path of ["/api/v1/scenarios/finals/reset","/api/v1/communications/sms","/api/v1/communications/voice"]){
      const response=await handler(new Request(`https://finals.example${path}`,{method:"POST",headers:{"content-type":"application/json"},body:"not-json"}));
      expect(response.status).toBe(401);
    }
    expect(repo.outbox).toHaveLength(0);
  });

  it("records operator authorization while provider switches remain off",async()=>{
    const repo=new MemoryWorkflowRepository(createSeedProjections(scenario));const handler=createHttpHandler(repo,enabledConfig);
    const response=await handler(new Request("https://finals.example/api/v1/communications/sms",{method:"POST",headers:{"content-type":"application/json","x-oncoready-operator-token":operatorToken},body:JSON.stringify({scenario_id:scenario,actor_role:"staff",idempotency_key:"operator-sms-001",expected_aggregate_version:0,purpose:"readiness",destination_alias:"finals_allowlisted_phone"})}));
    expect(response.status).toBe(202);expect(repo.outbox).toHaveLength(1);expect(repo.outbox[0]?.payload.authorization_source).toBe("operator_control");
    expect(enabledConfig.externalActionsEnabled).toBe(false);expect(enabledConfig.twilio.enabled).toBe(false);expect(enabledConfig.elevenLabs.enabled).toBe(false);
  });

  it("uses exact CORS as defense in depth without treating it as authentication",async()=>{
    const handler=createHttpHandler(new MemoryWorkflowRepository(createSeedProjections(scenario)),enabledConfig);
    expect((await handler(new Request("https://finals.example/api/v1/scenarios/finals?role=patient",{headers:{origin:"https://evil.example"}}))).status).toBe(403);
  });

  it("requires a strong CRON_SECRET and remains scheduler-provider agnostic",async()=>{
    const weakHandler=createHttpHandler(new MemoryWorkflowRepository(createSeedProjections(scenario)),loadConfig({DATABASE_URL:"postgres://localhost/oncoready",CRON_SECRET:"short-secret"}));
    const weak=await weakHandler(new Request("https://finals.example/api/v1/operations/tick?max_items=25",{headers:{authorization:"Bearer short-secret"}}));
    expect(weak.status).toBe(503);expect(await weak.json()).toMatchObject({code:"dependency_unavailable"});
    expect(()=>assertRuntimeConfig(loadConfig({DATABASE_URL:"postgres://localhost/oncoready",CRON_SECRET:"short-secret"}))).toThrowError(expect.objectContaining({status:503,code:"dependency_unavailable"}));
    expect(()=>assertRuntimeConfig(loadConfig({DATABASE_URL:"postgres://localhost/oncoready",CRON_SECRET:"0".repeat(64)}))).toThrowError(expect.objectContaining({status:503,code:"dependency_unavailable"}));
    const handler=createHttpHandler(new MemoryWorkflowRepository(createSeedProjections(scenario)),enabledConfig);
    expect((await handler(new Request("https://finals.example/api/v1/operations/tick?max_items=25"))).status).toBe(401);
    const accepted=await handler(new Request("https://finals.example/api/v1/operations/tick?max_items=25",{headers:{authorization:`Bearer ${cronSecret}`}}));
    expect(accepted.status).toBe(200);expect(await accepted.json()).toMatchObject({claimed:0,succeeded:0,failed:0});
  });
});
