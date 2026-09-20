import {createHmac} from "node:crypto";
import twilio from "twilio";
import {describe,expect,it} from "vitest";
import {createHttpHandler} from "../../packages/server/src/http.js";
import {loadConfig} from "../../packages/server/src/config.js";
import {MemoryWorkflowRepository,createSeedProjections} from "../../packages/server/src/repository.js";

const scenario="11111111-1111-4111-8111-111111111111" as const;
const config=loadConfig({DATABASE_URL:"postgres://localhost/oncoready",ONCOREADY_PUBLIC_DEMO_ENABLED:"true",ONCOREADY_PUBLIC_ORIGIN:"https://finals.example",CRON_SECRET:"cron",TWILIO_AUTH_TOKEN:"twilio-secret",ELEVENLABS_WEBHOOK_SECRET:"eleven-secret",ELEVENLABS_AGENT_ID:"agent-1",FINALS_ALLOWLISTED_PHONE:"+15550000000"});

describe("provider callback authentication",()=>{
  it("rejects invalid Twilio signatures before recording state",async()=>{
    const repo=new MemoryWorkflowRepository(createSeedProjections(scenario)); const handler=createHttpHandler(repo,config);
    const body="MessageSid=SM123&From=%2B15550000000&To=%2B15551111111&Body=STOP";
    const response=await handler(new Request("https://finals.example/api/v1/callbacks/twilio/inbound-message",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded","x-twilio-signature":"invalid"},body}));
    expect(response.status).toBe(401); expect(repo.events).toHaveLength(0);
  });

  it("accepts a signed Twilio callback once and safely deduplicates replay",async()=>{
    const repo=new MemoryWorkflowRepository(createSeedProjections(scenario)); const handler=createHttpHandler(repo,config);
    const values={MessageSid:"SM123",From:"+15550000000",To:"+15551111111",Body:"STOP"};
    const signature=twilio.getExpectedTwilioSignature("twilio-secret","https://finals.example/api/v1/callbacks/twilio/inbound-message",values);
    const body=new URLSearchParams(values).toString();
    const request=()=>new Request("https://finals.example/api/v1/callbacks/twilio/inbound-message",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded","x-twilio-signature":signature},body});
    expect((await handler(request())).status).toBe(204); expect((await handler(request())).status).toBe(204);
    expect(repo.events).toHaveLength(1); expect(repo.events[0]?.payload.response_kind).toBe("opt_out");
  });

  it("rejects stale or invalid ElevenLabs raw-body HMAC",async()=>{
    const repo=new MemoryWorkflowRepository(createSeedProjections(scenario)); const handler=createHttpHandler(repo,config);
    const payload=JSON.stringify({event_id:"event-1",call_id:"call-1",occurred_at:new Date().toISOString(),status:"failed",failure_code:"provider_error",scenario_id:scenario,correlation_id:"22222222-2222-4222-8222-222222222222"});
    const timestamp=Math.floor(Date.now()/1000); const signature=createHmac("sha256","wrong-secret").update(`${timestamp}.${payload}`).digest("hex");
    const response=await handler(new Request("https://finals.example/api/v1/callbacks/elevenlabs/failure",{method:"POST",headers:{"content-type":"application/json","elevenlabs-signature":`t=${timestamp},v0=${signature}`},body:payload}));
    expect(response.status).toBe(401); expect(repo.events).toHaveLength(0);
  });

  it("accepts the official post-call envelope, deduplicates it, and persists no transcript",async()=>{
    const repo=new MemoryWorkflowRepository(createSeedProjections(scenario));
    repo.providerActions.set("conversation-1",{scenarioId:scenario,aggregateId:"44444444-4444-4444-8444-444444444445",aggregateVersion:0,correlationId:"22222222-2222-4222-8222-222222222222",channel:"voice"});
    const handler=createHttpHandler(repo,config); const timestamp=Math.floor(Date.now()/1000);
    const payload=JSON.stringify({type:"post_call_transcription",event_timestamp:timestamp,data:{agent_id:"agent-1",conversation_id:"conversation-1",status:"done",transcript:[{role:"agent",message:"sensitive and discarded"}],analysis:{data_collection_results:{oncoready_outcome:{data_collection_id:"oncoready_outcome",value:"ride_help",rationale:"Caller requested a ride."}}}}});
    const signature=createHmac("sha256","eleven-secret").update(`${timestamp}.${payload}`).digest("hex");
    const request=()=>new Request("https://finals.example/api/v1/callbacks/elevenlabs/post-call",{method:"POST",headers:{"content-type":"application/json","elevenlabs-signature":`t=${timestamp},v0=${signature}`},body:payload});
    expect((await handler(request())).status).toBe(200); expect((await handler(request())).status).toBe(200);
    expect(repo.events).toHaveLength(1); expect(repo.events[0]?.payload).toMatchObject({response_kind:"ride_help",verbatim_text:null});
    expect(JSON.stringify(repo.events)).not.toContain("sensitive and discarded");
  });

  it("maps the official call-initiation failure envelope without trusting callback scenario data",async()=>{
    const repo=new MemoryWorkflowRepository(createSeedProjections(scenario));
    repo.providerActions.set("conversation-2",{scenarioId:scenario,aggregateId:"44444444-4444-4444-8444-444444444446",aggregateVersion:0,correlationId:"22222222-2222-4222-8222-222222222223",channel:"voice"});
    const handler=createHttpHandler(repo,config); const timestamp=Math.floor(Date.now()/1000);
    const payload=JSON.stringify({type:"call_initiation_failure",event_timestamp:timestamp,data:{agent_id:"agent-1",conversation_id:"conversation-2",failure_reason:"no-answer",metadata:{type:"twilio",body:{CallSid:"CA123"}}}});
    const signature=createHmac("sha256","eleven-secret").update(`${timestamp}.${payload}`).digest("hex");
    const response=await handler(new Request("https://finals.example/api/v1/callbacks/elevenlabs/failure",{method:"POST",headers:{"content-type":"application/json","elevenlabs-signature":`t=${timestamp},v0=${signature}`},body:payload}));
    expect(response.status).toBe(200); expect(repo.events[0]?.payload).toMatchObject({status:"no_answer",failure_code:"no-answer"});
  });
});
