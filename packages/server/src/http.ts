import {createHash, randomUUID, timingSafeEqual} from "node:crypto";
import type {ZodType} from "zod";
import type {ServerConfig} from "./config.js";
import {assertRuntimeConfig} from "./config.js";
import {WorkflowApplication} from "./application.js";
import {classifySms} from "./domain.js";
import {elevenLabsFailure, elevenLabsPostCall, communicationCommand, createTransportCommand, readinessCommand, resetCommand, role, transportCommand, twilioInbound, twilioStatus, workItemCommand} from "./schemas.js";
import {validateElevenLabsSignature, validateTwilioSignature} from "./providers.js";
import type {WorkflowRepository} from "./repository.js";
import {AppError, type WorkflowEvent} from "./types.js";

const FINALS_SCENARIO_ID = "11111111-1111-4111-8111-111111111111";

function secureEqual(actual: string | null, expected: string): boolean {
  if (!actual || !expected) return false;
  const a = Buffer.from(actual); const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function json(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {status, headers:{"content-type":"application/json; charset=utf-8",...headers}});
}

function parse<T>(schema: ZodType<T>, value: unknown): T {
  const result=schema.safeParse(value);
  if(!result.success) throw new AppError(400,"invalid_request",result.error.issues.map((issue)=>`${issue.path.join(".")}: ${issue.message}`).join("; "));
  return result.data;
}

async function rawBody(request: Request, limit: number): Promise<string> {
  const length=Number(request.headers.get("content-length")??0);
  if(length>limit) throw new AppError(413,"payload_too_large","Callback payload exceeds the configured limit.");
  const body=await request.text();
  if(Buffer.byteLength(body)>limit) throw new AppError(413,"payload_too_large","Callback payload exceeds the configured limit.");
  return body;
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new AppError(400, "invalid_request", "Request body must be valid JSON.");
  }
}

function callbackEvent(args:{scenarioId:string;aggregateId:string;version:number;eventType:string;payload:Record<string,unknown>;provenance:"twilio_callback"|"elevenlabs_callback";correlationId?:string;occurredAt?:string}):WorkflowEvent{
  const now=args.occurredAt??new Date().toISOString();
  return {event_id:randomUUID(),schema_version:"1.0",scenario_id:args.scenarioId,aggregate_type:"communication",aggregate_id:args.aggregateId,aggregate_version:args.version,event_type:args.eventType,payload:args.payload,occurred_at:now,recorded_at:new Date().toISOString(),actor:{role:"provider_callback",actor_id:args.provenance==="twilio_callback"?"twilio":"elevenlabs"},provenance:args.provenance,correlation_id:args.correlationId??randomUUID(),causation_id:null,idempotency_key:null};
}

function deterministicUuid(value:string):string{
  const hex=createHash("sha256").update(value).digest("hex");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-8${hex.slice(17,20)}-${hex.slice(20,32)}`;
}

export function createHttpHandler(repository:WorkflowRepository,config:ServerConfig){
  const app=new WorkflowApplication(repository,config);
  const requestBuckets=new Map<string,{window:number;count:number}>();
  return async function handle(request:Request):Promise<Response>{
    const traceId=randomUUID();
    try{
      const url=new URL(request.url); const path=url.pathname;
      const clientKey=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()??"local";
      const window=Math.floor(Date.now()/60_000); const bucket=requestBuckets.get(clientKey);
      if(bucket?.window===window){bucket.count+=1;if(bucket.count>240)throw new AppError(429,"rate_limited","Request rate exceeds the controlled-environment limit.",true);}else requestBuckets.set(clientKey,{window,count:1});
      const origin=request.headers.get("origin");
      if(origin&&!config.allowedOrigins.includes(origin)) throw new AppError(403,"forbidden_action","Origin is not allowed.");
      const cors=origin?{"access-control-allow-origin":origin,"vary":"Origin"}:{};
      if(request.method==="OPTIONS") return new Response(null,{status:204,headers:{...cors,"access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"Content-Type,X-OncoReady-Scenario-Token,Authorization,X-Twilio-Signature,ElevenLabs-Signature"}});

      if(path==="/health"){
        if(request.method!=="GET") throw new AppError(404,"not_found","Route not found.");
        assertRuntimeConfig(config);
        await repository.healthCheck();
        return json({status:"ok"},200,cors);
      }

      if(path.startsWith("/api/v1/callbacks/twilio/")){
        if(request.method!=="POST") throw new AppError(404,"not_found","Route not found.");
        const raw=await rawBody(request,32*1024); const params=validateTwilioSignature(config,`${path}${url.search}`,raw,request.headers.get("x-twilio-signature"));
        const value=Object.fromEntries(params.entries());
        if(path.endsWith("/inbound-message")){
          const input=parse(twilioInbound,value); const aggregateId=deterministicUuid(`twilio:${input.MessageSid}`); const responseKind=classifySms(input.Body);
          if(!config.allowlistedPhone||input.From!==config.allowlistedPhone)throw new AppError(403,"forbidden_action","Inbound sender is not the configured finals recipient.");
          const event=callbackEvent({scenarioId:FINALS_SCENARIO_ID,aggregateId,version:1,eventType:"communication.response_recorded",payload:{communication_id:aggregateId,channel:"sms",response_kind:responseKind,verbatim_text:responseKind==="unstructured"?input.Body:null},provenance:"twilio_callback"});
          await repository.recordWebhook({provider:"twilio_sms",providerEventId:input.MessageSid,providerReference:input.MessageSid,scenarioId:FINALS_SCENARIO_ID,event,rawBodySha256:createHash("sha256").update(raw).digest("hex")}); return new Response(null,{status:204,headers:cors});
        }
        const input=parse(twilioStatus,value); const action=await repository.findProviderAction(input.MessageSid);
        if(!action) throw new AppError(404,"not_found","Provider action was not found.");
        const event=callbackEvent({scenarioId:action.scenarioId,aggregateId:action.aggregateId,version:action.aggregateVersion+1,eventType:"communication.status_changed",payload:{communication_id:action.aggregateId,channel:"sms",provider:"twilio",status:input.MessageStatus,provider_reference:input.MessageSid,failure_code:input.ErrorCode??null},provenance:"twilio_callback",correlationId:action.correlationId});
        await repository.recordWebhook({provider:"twilio_sms",providerEventId:`${input.MessageSid}:${input.MessageStatus}`,providerReference:input.MessageSid,scenarioId:action.scenarioId,event,rawBodySha256:createHash("sha256").update(raw).digest("hex")}); return new Response(null,{status:204,headers:cors});
      }

      if(path.startsWith("/api/v1/callbacks/elevenlabs/")){
        if(request.method!=="POST") throw new AppError(404,"not_found","Route not found.");
        const raw=await rawBody(request,256*1024); validateElevenLabsSignature(config.elevenLabs.webhookSecret,raw,request.headers.get("elevenlabs-signature"));
        const parsed=parseJson(raw);
        if(path.endsWith("/post-call")){
          const input=parse(elevenLabsPostCall,parsed);
          if(!config.elevenLabs.agentId||input.data.agent_id!==config.elevenLabs.agentId)throw new AppError(403,"forbidden_action","Voice callback agent is not allowlisted.");
          const action=await repository.findProviderAction(input.data.conversation_id); if(!action||action.channel!=="voice") throw new AppError(404,"not_found","Provider action was not found.");
          const map={ready:"ready",ride_help:"ride_help",scheduling_help:"scheduling_help",human_callback:"call_me",unsupported_or_uncertain:"unstructured"} as const;
          const collected=input.data.analysis.data_collection_results.oncoready_outcome?.value??"unsupported_or_uncertain";
          const occurredAt=new Date(input.event_timestamp*1000).toISOString();
          const event=callbackEvent({scenarioId:action.scenarioId,aggregateId:action.aggregateId,version:action.aggregateVersion+1,eventType:"communication.response_recorded",payload:{communication_id:action.aggregateId,channel:"voice",response_kind:map[collected],verbatim_text:null},provenance:"elevenlabs_callback",correlationId:action.correlationId,occurredAt});
          const providerEventId=`${input.type}:${input.data.conversation_id}:${input.event_timestamp}`;
          await repository.recordWebhook({provider:"elevenlabs_twilio",providerEventId,providerReference:input.data.conversation_id,scenarioId:action.scenarioId,event,rawBodySha256:createHash("sha256").update(raw).digest("hex")}); return new Response(null,{status:200,headers:cors});
        }
        if(!path.endsWith("/failure")) throw new AppError(404,"not_found","Route not found.");
        const input=parse(elevenLabsFailure,parsed);
        if(!config.elevenLabs.agentId||input.data.agent_id!==config.elevenLabs.agentId)throw new AppError(403,"forbidden_action","Voice callback agent is not allowlisted.");
        const action=await repository.findProviderAction(input.data.conversation_id); if(!action||action.channel!=="voice") throw new AppError(404,"not_found","Provider action was not found.");
        const status=input.data.failure_reason==="no-answer"?"no_answer":"failed";
        const occurredAt=new Date(input.event_timestamp*1000).toISOString();
        const event=callbackEvent({scenarioId:action.scenarioId,aggregateId:action.aggregateId,version:action.aggregateVersion+1,eventType:"communication.status_changed",payload:{communication_id:action.aggregateId,channel:"voice",provider:"elevenlabs_twilio",status,provider_reference:input.data.conversation_id,failure_code:input.data.failure_reason},provenance:"elevenlabs_callback",correlationId:action.correlationId,occurredAt});
        const providerEventId=`${input.type}:${input.data.conversation_id}:${input.event_timestamp}`;
        await repository.recordWebhook({provider:"elevenlabs_twilio",providerEventId,providerReference:input.data.conversation_id,scenarioId:action.scenarioId,event,rawBodySha256:createHash("sha256").update(raw).digest("hex")}); return new Response(null,{status:200,headers:cors});
      }

      if(path==="/api/v1/operations/tick"){
        if(request.method!=="GET") throw new AppError(404,"not_found","Route not found.");
        assertRuntimeConfig(config);if(!config.cronSecret)throw new AppError(503,"dependency_unavailable","Scheduler authentication is not configured.",true);
        if(!secureEqual(request.headers.get("authorization"),`Bearer ${config.cronSecret}`)) throw new AppError(401,"unauthorized","Cron credential is invalid.");
        const requestedMax=Number(url.searchParams.get("max_items")??25);if(!Number.isInteger(requestedMax)||requestedMax<1||requestedMax>100)throw new AppError(400,"invalid_request","max_items must be an integer from 1 through 100.");
        return json(await app.tick(requestedMax),200,cors);
      }

      assertRuntimeConfig(config);
      if(!secureEqual(request.headers.get("x-oncoready-scenario-token"),config.scenarioToken)) throw new AppError(401,"unauthorized","Scenario credential is invalid.");
      const body=async()=>parseJson(await rawBody(request,32*1024));
      const governed=<T extends {scenario_id:string}>(command:T):T=>{if(command.scenario_id!==FINALS_SCENARIO_ID)throw new AppError(403,"forbidden_action","Only the controlled finals scenario is available.");return command;};
      if(request.method==="GET"&&path==="/api/v1/scenarios/finals") return json(await app.projection(FINALS_SCENARIO_ID,parse(role,url.searchParams.get("role"))),200,cors);
      if(request.method==="POST"&&path==="/api/v1/scenarios/finals/reset") return json(await app.reset(governed(parse(resetCommand,await body()))),200,cors);
      if(request.method==="POST"&&path==="/api/v1/readiness-submissions") return json(await app.readiness(governed(parse(readinessCommand,await body()))),202,cors);
      let match=path.match(/^\/api\/v1\/work-items\/([0-9a-f-]+)\/commands$/i);
      if(request.method==="POST"&&match) return json(await app.workItem(match[1]!,governed(parse(workItemCommand,await body()))),202,cors);
      if(request.method==="POST"&&path==="/api/v1/transport/requests") return json(await app.createTransport(governed(parse(createTransportCommand,await body()))),202,cors);
      match=path.match(/^\/api\/v1\/transport\/requests\/([0-9a-f-]+)\/commands$/i);
      if(request.method==="POST"&&match) return json(await app.transport(match[1]!,governed(parse(transportCommand,await body()))),202,cors);
      if(request.method==="POST"&&path==="/api/v1/communications/sms") return json(await app.communication("sms",governed(parse(communicationCommand,await body()))),202,cors);
      if(request.method==="POST"&&path==="/api/v1/communications/voice") return json(await app.communication("voice",governed(parse(communicationCommand,await body()))),202,cors);
      if(request.method==="GET"&&path==="/api/v1/evidence/metrics") return json(await app.metrics(FINALS_SCENARIO_ID),200,cors);
      if(request.method==="GET"&&path==="/api/v1/evidence/fhir") return json(await app.fhir(FINALS_SCENARIO_ID),200,cors);
      if(request.method==="GET"&&path==="/api/v1/evidence/priority") return json(await app.priority(FINALS_SCENARIO_ID),200,cors);
      throw new AppError(404,"not_found","Route not found.");
    }catch(error){
      const appError=error instanceof AppError?error:new AppError(500,"internal_error","The request could not be completed.",true);
      return json({type:`https://oncoready.local/problems/${appError.code}`,title:appError.status===500?"Internal error":"Request failed",status:appError.status,code:appError.code,detail:appError.message,trace_id:traceId,retryable:appError.retryable,...(appError.currentAggregateVersion===undefined?{}:{current_aggregate_version:appError.currentAggregateVersion})},appError.status);
    }
  };
}
