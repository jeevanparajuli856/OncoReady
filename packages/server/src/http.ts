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
  return async function handle(request:Request):Promise<Response>{
    const traceId=randomUUID();
    try{
      const url=new URL(request.url); const path=url.pathname;
      const origin=request.headers.get("origin");
      if(origin&&!config.allowedOrigins.includes(origin)) throw new AppError(403,"forbidden_action","Origin is not allowed.");
      const cors=origin?{"access-control-allow-origin":origin,"vary":"Origin"}:{};
      if(request.method==="OPTIONS") return new Response(null,{status:204,headers:{...cors,"access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"Content-Type,X-OncoReady-Scenario-Token,Authorization,X-Twilio-Signature,ElevenLabs-Signature"}});

      if(path.startsWith("/api/v1/callbacks/twilio/")){
        const raw=await rawBody(request,32*1024); const params=validateTwilioSignature(config,`${path}${url.search}`,raw,request.headers.get("x-twilio-signature"));
        const value=Object.fromEntries(params.entries());
        if(path.endsWith("/inbound-message")){
          const input=parse(twilioInbound,value); const aggregateId=deterministicUuid(`twilio:${input.MessageSid}`); const responseKind=classifySms(input.Body);
          const event=callbackEvent({scenarioId:FINALS_SCENARIO_ID,aggregateId,version:1,eventType:"communication.response_recorded",payload:{communication_id:aggregateId,channel:"sms",response_kind:responseKind,verbatim_text:responseKind==="unstructured"?input.Body:null},provenance:"twilio_callback"});
          await repository.recordWebhook({provider:"twilio_sms",providerEventId:input.MessageSid,scenarioId:FINALS_SCENARIO_ID,event}); return new Response(null,{status:204,headers:cors});
        }
        const input=parse(twilioStatus,value); const action=await repository.findProviderAction(input.MessageSid);
        if(!action) throw new AppError(404,"not_found","Provider action was not found.");
        const event=callbackEvent({scenarioId:action.scenarioId,aggregateId:action.aggregateId,version:action.aggregateVersion+1,eventType:"communication.status_changed",payload:{communication_id:action.aggregateId,channel:"sms",provider:"twilio",status:input.MessageStatus,provider_reference:input.MessageSid,failure_code:input.ErrorCode??null},provenance:"twilio_callback",correlationId:action.correlationId});
        await repository.recordWebhook({provider:"twilio_sms",providerEventId:`${input.MessageSid}:${input.MessageStatus}`,scenarioId:action.scenarioId,event}); return new Response(null,{status:204,headers:cors});
      }

      if(path.startsWith("/api/v1/callbacks/elevenlabs/")){
        const raw=await rawBody(request,256*1024); validateElevenLabsSignature(config.elevenLabs.webhookSecret,raw,request.headers.get("elevenlabs-signature"));
        const parsed=JSON.parse(raw) as unknown;
        if(path.endsWith("/post-call")){
          const input=parse(elevenLabsPostCall,parsed); const action=await repository.findProviderAction(input.call_id); if(!action) throw new AppError(404,"not_found","Provider action was not found.");
          const map={ready:"ready",ride_help:"ride_help",scheduling_help:"scheduling_help",human_callback:"call_me",unsupported_or_uncertain:"unstructured"} as const;
          const event=callbackEvent({scenarioId:input.scenario_id,aggregateId:action.aggregateId,version:action.aggregateVersion+1,eventType:"communication.response_recorded",payload:{communication_id:action.aggregateId,channel:"voice",response_kind:map[input.outcome],verbatim_text:null},provenance:"elevenlabs_callback",correlationId:input.correlation_id,occurredAt:input.occurred_at});
          await repository.recordWebhook({provider:"elevenlabs_twilio",providerEventId:input.event_id,scenarioId:input.scenario_id,event}); return new Response(null,{status:204,headers:cors});
        }
        const input=parse(elevenLabsFailure,parsed); const action=await repository.findProviderAction(input.call_id); if(!action) throw new AppError(404,"not_found","Provider action was not found.");
        const event=callbackEvent({scenarioId:input.scenario_id,aggregateId:action.aggregateId,version:action.aggregateVersion+1,eventType:"communication.status_changed",payload:{communication_id:action.aggregateId,channel:"voice",provider:"elevenlabs_twilio",status:"failed",provider_reference:input.call_id,failure_code:input.failure_code},provenance:"elevenlabs_callback",correlationId:input.correlation_id,occurredAt:input.occurred_at});
        await repository.recordWebhook({provider:"elevenlabs_twilio",providerEventId:input.event_id,scenarioId:input.scenario_id,event}); return new Response(null,{status:204,headers:cors});
      }

      if(path==="/api/v1/operations/tick"){
        if(request.method!=="GET") throw new AppError(404,"not_found","Route not found.");
        if(!secureEqual(request.headers.get("authorization"),`Bearer ${config.cronSecret}`)) throw new AppError(401,"unauthorized","Cron credential is invalid.");
        const max=Math.min(100,Math.max(1,Number(url.searchParams.get("max_items")??25))); return json(await app.tick(max),200,cors);
      }

      assertRuntimeConfig(config);
      if(!secureEqual(request.headers.get("x-oncoready-scenario-token"),config.scenarioToken)) throw new AppError(401,"unauthorized","Scenario credential is invalid.");
      const body=async()=>{try{return await request.json();}catch{throw new AppError(400,"invalid_request","Request body must be valid JSON.");}};
      if(request.method==="GET"&&path==="/api/v1/scenarios/finals") return json(await app.projection(FINALS_SCENARIO_ID,parse(role,url.searchParams.get("role"))),200,cors);
      if(request.method==="POST"&&path==="/api/v1/scenarios/finals/reset") return json(await app.reset(parse(resetCommand,await body())),200,cors);
      if(request.method==="POST"&&path==="/api/v1/readiness-submissions") return json(await app.readiness(parse(readinessCommand,await body())),202,cors);
      let match=path.match(/^\/api\/v1\/work-items\/([0-9a-f-]+)\/commands$/i);
      if(request.method==="POST"&&match) return json(await app.workItem(match[1]!,parse(workItemCommand,await body())),202,cors);
      if(request.method==="POST"&&path==="/api/v1/transport/requests") return json(await app.createTransport(parse(createTransportCommand,await body())),202,cors);
      match=path.match(/^\/api\/v1\/transport\/requests\/([0-9a-f-]+)\/commands$/i);
      if(request.method==="POST"&&match) return json(await app.transport(match[1]!,parse(transportCommand,await body())),202,cors);
      if(request.method==="POST"&&path==="/api/v1/communications/sms") return json(await app.communication("sms",parse(communicationCommand,await body())),202,cors);
      if(request.method==="POST"&&path==="/api/v1/communications/voice") return json(await app.communication("voice",parse(communicationCommand,await body())),202,cors);
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
