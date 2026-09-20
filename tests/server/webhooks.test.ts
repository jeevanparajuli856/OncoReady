import {createHmac} from "node:crypto";
import twilio from "twilio";
import {describe,expect,it} from "vitest";
import {createHttpHandler} from "../../packages/server/src/http.js";
import {loadConfig} from "../../packages/server/src/config.js";
import {MemoryWorkflowRepository,createSeedProjections} from "../../packages/server/src/repository.js";

const scenario="11111111-1111-4111-8111-111111111111";
const config=loadConfig({DATABASE_URL:"postgres://localhost/oncoready",ONCOREADY_SCENARIO_TOKEN:"scenario-secret",ONCOREADY_PUBLIC_ORIGIN:"https://finals.example",CRON_SECRET:"cron",TWILIO_AUTH_TOKEN:"twilio-secret",ELEVENLABS_WEBHOOK_SECRET:"eleven-secret",FINALS_ALLOWLISTED_PHONE:"+15550000000"});

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
});
