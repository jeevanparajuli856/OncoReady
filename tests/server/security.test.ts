import {describe,expect,it} from "vitest";
import {createHttpHandler} from "../../packages/server/src/http.js";
import {loadConfig} from "../../packages/server/src/config.js";
import {MemoryWorkflowRepository,createSeedProjections} from "../../packages/server/src/repository.js";

const scenario="11111111-1111-4111-8111-111111111111";
const config=loadConfig({DATABASE_URL:"postgres://localhost/oncoready",ONCOREADY_SCENARIO_TOKEN:"scenario-secret",ONCOREADY_ALLOWED_ORIGINS:"https://finals.example",ONCOREADY_PUBLIC_ORIGIN:"https://finals.example",CRON_SECRET:"cron-secret",EXTERNAL_ACTIONS_ENABLED:"false"});

describe("HTTP trust boundary",()=>{
  it("requires the controlled scenario token",async()=>{
    const handler=createHttpHandler(new MemoryWorkflowRepository(createSeedProjections(scenario)),config);
    const response=await handler(new Request("https://finals.example/api/v1/scenarios/finals?role=patient"));
    expect(response.status).toBe(401); expect(await response.json()).toMatchObject({code:"unauthorized",retryable:false});
  });

  it("rejects an unallowlisted browser origin",async()=>{
    const handler=createHttpHandler(new MemoryWorkflowRepository(createSeedProjections(scenario)),config);
    const response=await handler(new Request("https://finals.example/api/v1/scenarios/finals?role=patient",{headers:{origin:"https://evil.example","x-oncoready-scenario-token":"scenario-secret"}}));
    expect(response.status).toBe(403);
  });

  it("requires CRON_SECRET and remains scheduler-provider agnostic",async()=>{
    const handler=createHttpHandler(new MemoryWorkflowRepository(createSeedProjections(scenario)),config);
    const unauthorized=await handler(new Request("https://finals.example/api/v1/operations/tick?max_items=25"));
    expect(unauthorized.status).toBe(401);
    const accepted=await handler(new Request("https://finals.example/api/v1/operations/tick?max_items=25",{headers:{authorization:"Bearer cron-secret"}}));
    expect(accepted.status).toBe(200); expect(await accepted.json()).toMatchObject({claimed:0,succeeded:0,failed:0});
  });

  it("never enables an external action from request input",async()=>{
    const handler=createHttpHandler(new MemoryWorkflowRepository(createSeedProjections(scenario)),config);
    const response=await handler(new Request("https://finals.example/api/v1/communications/sms",{method:"POST",headers:{"content-type":"application/json","x-oncoready-scenario-token":"scenario-secret"},body:JSON.stringify({scenario_id:scenario,actor_role:"staff",idempotency_key:"external-disabled",expected_aggregate_version:0,purpose:"readiness",destination_alias:"arbitrary_phone",external_actions_enabled:true})}));
    expect(response.status).toBe(400);
  });
});
