import {createHash, randomUUID} from "node:crypto";
import {Pool, type PoolClient} from "pg";
import {generateFhirEvidence} from "./evidence.js";
import {isProviderStatusRegression} from "./domain.js";
import {scorePriority} from "./ml.js";
import type {ActorRole, CommandReceipt, OutboxItem, WorkflowEvent} from "./types.js";
import {AppError} from "./types.js";
import type {CommandDecision, CommandSnapshot, ExecuteCommandInput, WebhookWrite, WorkflowRepository} from "./repository.js";
import {enforceEffectClass,minimizeCaregiverProjection,semanticHash} from "./repository.js";

const FINALS_SCENARIO_ID = "11111111-1111-4111-8111-111111111111";
const roles: ActorRole[] = ["patient", "caregiver", "staff", "transport_coordinator"];

function asReceipt(value: unknown): CommandReceipt { return value as CommandReceipt; }
function deterministicUuid(value: string): string {
  const hex = createHash("sha256").update(value).digest("hex");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-8${hex.slice(17,20)}-${hex.slice(20,32)}`;
}

export class PostgresWorkflowRepository implements WorkflowRepository {
  private readonly pool: Pool;
  constructor(databaseUrl: string) {
    this.pool = new Pool({connectionString: databaseUrl, max: 3, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 5_000});
  }

  async healthCheck(): Promise<void> {
    await this.pool.query("select 1");
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async getProjection(scenarioId: string, role: ActorRole): Promise<Record<string, unknown>> {
    const result = await this.pool.query<{projection: Record<string, unknown>}>("select projection from public.role_projections where scenario_id = $1 and role = $2", [scenarioId, role]);
    if (!result.rows[0]) throw new AppError(404, "not_found", "Scenario projection not found.");
    const projection = structuredClone(result.rows[0].projection);
    if (role === "caregiver") {
      return minimizeCaregiverProjection(projection);
    }
    const reconciliation = (status?: string | null, attemptAt?: string | null, reference?: string | null) => {
      if (status === "outcome_unknown") return {state:"reconciliation_required",last_attempt_at:attemptAt??null,attempt_reference:reference??null,provenance:"none",permitted_recovery:"reconcile_provider"};
      if (status === "reconciled") return {state:"reconciled",last_attempt_at:attemptAt??null,attempt_reference:reference??null,provenance:"provider_lookup",permitted_recovery:"none"};
      return {state:"not_required",last_attempt_at:attemptAt??null,attempt_reference:reference??null,provenance:reference?"provider_callback":"none",permitted_recovery:"none"};
    };
    if (role === "staff") {
      const attempts = await this.pool.query<{stable_action_id:string;status:string;started_at:string;provider_reference:string|null}>("select distinct on (stable_action_id) stable_action_id,status,started_at,provider_reference from public.provider_attempts where scenario_id=$1 order by stable_action_id,attempt_number desc",[scenarioId]);
      const byId = new Map(attempts.rows.map((row)=>[row.stable_action_id,row]));
      projection.communications = ((projection.communications as Array<Record<string,unknown>>|undefined)??[]).map((communication)=>{
        const attempt=byId.get(String(communication.communication_id));
        const outcomeUnknown=attempt?.status==="outcome_unknown";
        return {...communication,status:outcomeUnknown?"outcome_unknown":communication.status,reconciliation:reconciliation(attempt?.status,attempt?.started_at,attempt?.provider_reference)};
      });
      const transport=projection.transport as Record<string,unknown>|undefined;
      if(transport) transport.reconciliation=reconciliation(transport.status==="outcome_unknown"?"outcome_unknown":null,null,null);
    } else if (role === "transport_coordinator") {
      const request=projection.request as Record<string,unknown>|undefined;
      if(request) request.reconciliation=reconciliation(request.status==="outcome_unknown"?"outcome_unknown":null,null,null);
    }
    return projection;
  }

  private async loadSnapshot(client: PoolClient, input: ExecuteCommandInput): Promise<CommandSnapshot> {
    const head = await client.query<{aggregate_version: number}>("select aggregate_version from public.aggregate_heads where scenario_id=$1 and aggregate_type=$2 and aggregate_id=$3 for update", [input.scenarioId, input.aggregateType, input.aggregateId]);
    const version = head.rows[0]?.aggregate_version ?? 0;
    let state: Record<string, unknown> = {};
    if (input.aggregateType === "work_item") {
      const row = await client.query("select status,owner_id,closure_evidence,work_item_type,owner_role,aggregate_version from public.work_item_projections where scenario_id=$1 and work_item_id=$2", [input.scenarioId, input.aggregateId]);
      if(!row.rows[0])throw new AppError(404,"not_found","Work item was not found.");
      state = row.rows[0];
    } else if (input.aggregateType === "transport_request") {
      const row = await client.query("select * from public.transport_projections where scenario_id=$1 and transport_request_id=$2", [input.scenarioId, input.aggregateId]);
      if(!row.rows[0]&&!input.allowCreate)throw new AppError(404,"not_found","Transport request was not found.");
      state = row.rows[0] ?? {};
    }
    const projectionRows = await client.query<{role: ActorRole; projection: Record<string, unknown>}>("select role, projection from public.role_projections where scenario_id=$1 for update", [input.scenarioId]);
    const projections = Object.fromEntries(projectionRows.rows.map((row) => [row.role, row.projection])) as Record<ActorRole, Record<string, unknown>>;
    if (roles.some((role) => !projections[role])) throw new AppError(503, "dependency_unavailable", "Scenario role projections are incomplete.", true);
    return {aggregate: {version, state}, projections};
  }

  private async insertEvent(client: PoolClient, event: WorkflowEvent): Promise<void> {
    await client.query(`insert into public.workflow_events
      (event_id,schema_version,scenario_id,aggregate_type,aggregate_id,aggregate_version,event_type,payload,occurred_at,recorded_at,actor_role,actor_id,provenance,correlation_id,causation_id,idempotency_key)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`, [event.event_id,event.schema_version,event.scenario_id,event.aggregate_type,event.aggregate_id,event.aggregate_version,event.event_type,event.payload,event.occurred_at,event.recorded_at,event.actor.role,event.actor.actor_id,event.provenance,event.correlation_id,event.causation_id,event.idempotency_key ?? null]);
  }

  private async updateRelationalProjection(client: PoolClient, event: WorkflowEvent, decision: CommandDecision): Promise<void> {
    const p = event.payload;
    if (event.event_type === "barrier.detected") {
      const readiness = decision.events.find((candidate) => candidate.event_type === "readiness.submission_recorded");
      await client.query(`insert into public.barrier_projections (barrier_id,scenario_id,aggregate_version,barrier_type,source,status,patient_verbatim,opened_at)
        values ($1,$2,$3,$4,$5,'open',$6,$7)`, [p.barrier_id,event.scenario_id,event.aggregate_version,p.barrier_type,p.source,p.barrier_type === "clinical_concern" ? readiness?.payload.clinical_concern_verbatim ?? null : null,event.occurred_at]);
    } else if (event.event_type === "work_item.created") {
      await client.query(`insert into public.work_item_projections (work_item_id,scenario_id,source_barrier_id,aggregate_version,work_item_type,owner_role,status,due_at,next_action,created_at)
        values ($1,$2,$3,$4,$5,$6,'open',$7,'Review and take ownership.',$8)`, [p.work_item_id,event.scenario_id,p.source_barrier_id,event.aggregate_version,p.work_item_type,p.owner_role,p.due_at,event.occurred_at]);
    } else if (event.event_type === "work_item.transitioned") {
      const result = await client.query(`update public.work_item_projections set aggregate_version=$3,status=$4,owner_id=coalesce($5,owner_id),owner_display_name=coalesce($5,owner_display_name),closure_evidence=coalesce($6,closure_evidence),updated_at=clock_timestamp() where scenario_id=$1 and work_item_id=$2 and aggregate_version=$3-1`, [event.scenario_id,p.work_item_id,event.aggregate_version,p.to_status,p.owner_id,p.closure_evidence]);
      if (result.rowCount !== 1) throw new AppError(409, "version_conflict", "Work item projection is stale.");
    } else if (event.event_type === "transport.eligibility_reviewed") {
      await client.query(`update public.transport_projections set aggregate_version=$3,eligibility=case when $4 then 'eligible' else 'ineligible' end,service_area_confirmed=$5,operating_window_confirmed=$6,outbound_plan_complete=$7,return_plan_complete=$8,status='eligibility_reviewed',updated_at=clock_timestamp() where scenario_id=$1 and transport_request_id=$2`, [event.scenario_id,p.transport_request_id,event.aggregate_version,p.eligible,p.service_area_confirmed,p.operating_window_confirmed,p.outbound_plan_complete,p.return_plan_complete]);
    } else if (event.event_type === "transport.status_changed") {
      const exists = await client.query("select 1 from public.transport_projections where scenario_id=$1 and transport_request_id=$2", [event.scenario_id,p.transport_request_id]);
      if (!exists.rows[0] && decision.aggregateState?.transport_request_id) {
        const s = decision.aggregateState;
        await client.query(`insert into public.transport_projections (transport_request_id,scenario_id,work_item_id,aggregate_version,status,treatment_arrival_window,notice_cutoff,funding_path,service_area,mobility,outbound_plan,return_plan,notification_permission,created_at) values ($1,$2,$3,1,$4,$5,$6,$7,$8,$9,$10,$11,$12,clock_timestamp())`, [s.transport_request_id,event.scenario_id,s.work_item_id,s.status,s.treatment_arrival_window,s.notice_cutoff,s.funding_path,s.service_area,s.mobility,s.outbound_plan,s.return_plan,s.notification_permission]);
      } else {
        await client.query(`update public.transport_projections set aggregate_version=$3,status=$4,driver_alias=coalesce($5,driver_alias),vehicle_description=coalesce($6,vehicle_description),failure_reason=$7,closure_evidence=coalesce($8,closure_evidence),acknowledgment_status=case when $4='patient_notified' then 'awaiting_patient' when $4='patient_acknowledged' then 'acknowledged' else acknowledgment_status end,acknowledged_plan_version=case when $4='patient_acknowledged' then plan_version else acknowledged_plan_version end,updated_at=clock_timestamp() where scenario_id=$1 and transport_request_id=$2`, [event.scenario_id,p.transport_request_id,event.aggregate_version,p.to_status,p.driver_alias,p.vehicle_description,p.failure_reason,p.closure_evidence]);
      }
    }
  }

  async executeCommand(input: ExecuteCommandInput, decide: (snapshot: CommandSnapshot) => CommandDecision): Promise<CommandReceipt> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const requestHash = semanticHash(input.semanticInput);
      const commandId = randomUUID();
      await client.query(`insert into public.idempotency_records (scenario_id,idempotency_key,command_name,request_hash,command_id,aggregate_type,aggregate_id,expected_aggregate_version) values ($1,$2,$3,$4,$5,$6,$7,$8) on conflict do nothing`, [input.scenarioId,input.idempotencyKey,input.aggregateType,requestHash,commandId,input.aggregateType,input.aggregateId,input.expectedVersion]);
      const idempotency = await client.query<{request_hash: string; status: string; response_body: unknown}>("select request_hash,status,response_body from public.idempotency_records where scenario_id=$1 and idempotency_key=$2 for update", [input.scenarioId,input.idempotencyKey]);
      const record = idempotency.rows[0]!;
      if (record.request_hash !== requestHash) throw new AppError(409, "version_conflict", "Idempotency key was already used for a different command.");
      if (record.status === "completed") {
        await client.query("commit");
        return {...asReceipt(record.response_body), disposition: "replayed"};
      }
      const snapshot = await this.loadSnapshot(client, input);
      if (snapshot.aggregate.version !== input.expectedVersion) throw new AppError(409, "version_conflict", "Aggregate version is stale.", false, snapshot.aggregate.version);
      const decision = decide(snapshot);
      enforceEffectClass(input,decision);
      for (const event of decision.events) { await this.insertEvent(client, event); await this.updateRelationalProjection(client, event, decision); }
      for (const [role, projection] of Object.entries(decision.projections) as Array<[ActorRole, Record<string, unknown>]>) {
        await client.query("update public.role_projections set scenario_version=$3,as_of=$4,projection=$5,updated_at=clock_timestamp() where scenario_id=$1 and role=$2", [input.scenarioId,role,projection.scenario_version,projection.as_of,projection]);
      }
      const scenarioVersion = Math.max(...Object.values(decision.projections).map((projection) => Number(projection?.scenario_version ?? 0)), input.aggregateType === "scenario" ? decision.aggregateVersion : 0);
      if (scenarioVersion) await client.query("update public.scenarios set aggregate_version=case when $4 then $2 else aggregate_version end,readiness_status=coalesce($3,readiness_status),updated_at=clock_timestamp() where scenario_id=$1", [input.scenarioId,scenarioVersion,decision.projections.staff?.readiness_status ?? decision.projections.patient?.readiness_status ?? null,input.aggregateType==="scenario"]);
      for (const queued of decision.outbox ?? []) {
        const eventId = decision.events.find((event) => event.aggregate_id === queued.stable_action_id)?.event_id ?? null;
        await client.query(`insert into public.outbox (scenario_id,event_id,provider,action_type,destination_alias,stable_action_id,payload) values ($1,$2,$3,$4,'finals_allowlisted_phone',$5,$6)`, [queued.scenario_id,eventId,queued.action_type === "sms" ? "twilio_sms" : "elevenlabs_twilio",queued.action_type,queued.stable_action_id,queued.payload]);
      }
      const receipt: CommandReceipt = {command_id: commandId,disposition:"accepted",scenario_id:input.scenarioId,aggregate_id:input.aggregateId,aggregate_version:decision.aggregateVersion,emitted_events:decision.events};
      await client.query("update public.idempotency_records set resulting_aggregate_version=$3,status='completed',response_status=202,response_body=$4,completed_at=clock_timestamp() where scenario_id=$1 and idempotency_key=$2", [input.scenarioId,input.idempotencyKey,decision.aggregateVersion,receipt]);
      await client.query("commit");
      return receipt;
    } catch (error) {
      await client.query("rollback");
      if ((error as {code?: string}).code === "40001") throw new AppError(409, "version_conflict", "Aggregate version is stale.");
      throw error;
    } finally { client.release(); }
  }

  async findProviderAction(providerReference: string) {
    const result = await this.pool.query<{scenario_id:string;aggregate_id:string;correlation_id:string;provider:string;aggregate_version:number}>(`
      select pa.scenario_id,
             o.payload->>'communication_id' aggregate_id,
             coalesce(o.payload->>'correlation_id',we.correlation_id::text,pa.scenario_id::text) correlation_id,
             pa.provider,
             coalesce(ah.aggregate_version,0) aggregate_version
        from public.provider_attempts pa
        join public.outbox o on o.outbox_id=pa.outbox_id
        left join public.workflow_events we on we.event_id=o.event_id
        left join public.aggregate_heads ah
          on ah.scenario_id=pa.scenario_id
         and ah.aggregate_type='communication'
         and ah.aggregate_id=(o.payload->>'communication_id')::uuid
       where pa.provider_reference=$1
       order by pa.attempt_number desc
       limit 1`, [providerReference]);
    const row = result.rows[0];
    return row?.aggregate_id ? {scenarioId:row.scenario_id,aggregateId:row.aggregate_id,aggregateVersion:row.aggregate_version,correlationId:row.correlation_id,channel:row.provider === "twilio_sms" ? "sms" as const : "voice" as const} : null;
  }

  async recordWebhook(input: WebhookWrite): Promise<"accepted" | "duplicate" | "out_of_order"> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const receipt = await client.query(`insert into public.webhook_receipts (scenario_id,provider,provider_event_id,signature_verified,raw_body_sha256,provider_occurred_at,correlation_id,safe_payload) values ($1,$2,$3,true,$4,$5,$6,$7) on conflict (provider,provider_event_id) do nothing returning webhook_receipt_id`, [input.scenarioId,input.provider,input.providerEventId,input.rawBodySha256,input.event.occurred_at,input.event.correlation_id,input.event.payload]);
      if (!receipt.rows[0]) { await client.query("rollback"); return "duplicate"; }
      const head = await client.query<{aggregate_version:number}>("select aggregate_version from public.aggregate_heads where scenario_id=$1 and aggregate_type=$2 and aggregate_id=$3 for update", [input.scenarioId,input.event.aggregate_type,input.event.aggregate_id]);
      const current = head.rows[0]?.aggregate_version ?? 0;
      if(input.event.event_type==="communication.status_changed"){
        const currentProjection=await client.query<{status:string}>("select status from public.communication_projections where scenario_id=$1 and communication_id=$2",[input.scenarioId,input.event.aggregate_id]);
        const currentStatus=currentProjection.rows[0]?.status;const nextStatus=String(input.event.payload.status);
        if(currentStatus&&isProviderStatusRegression(currentStatus,nextStatus)){
          await client.query("update public.webhook_receipts set status='out_of_order' where provider=$1 and provider_event_id=$2",[input.provider,input.providerEventId]);
          await client.query("commit");return "out_of_order";
        }
      }
      if (input.event.aggregate_version !== current + 1) {
        await client.query("update public.webhook_receipts set status='out_of_order' where provider=$1 and provider_event_id=$2", [input.provider,input.providerEventId]);
        await client.query("commit"); return "out_of_order";
      }
      await this.insertEvent(client,input.event);
      if (input.event.event_type === "communication.status_changed") {
        await client.query(`insert into public.communication_projections (communication_id,scenario_id,aggregate_version,channel,purpose,destination_alias,status,provenance,provider_reference,failure_code,occurred_at) select $1,$2,$3,$4,coalesce(o.payload->>'purpose','readiness'),'finals_allowlisted_phone',$5,'provider_callback',$6,$7,$8 from public.outbox o where o.payload->>'communication_id'=$1::text on conflict (communication_id) do update set aggregate_version=excluded.aggregate_version,status=excluded.status,provider_reference=excluded.provider_reference,failure_code=excluded.failure_code,occurred_at=excluded.occurred_at`, [input.event.aggregate_id,input.scenarioId,input.event.aggregate_version,input.event.payload.channel,input.event.payload.status,input.event.payload.provider_reference,input.event.payload.failure_code,input.event.occurred_at]);
        await client.query("update public.provider_attempts set status=case when $2 in ('queued','sent') then 'accepted' when $2 in ('delivered','answered','completed') then 'definitive_success' else 'definitive_failure' end,completed_at=case when $2 in ('queued','sent') then null else clock_timestamp() end,reconciliation_required=false where provider_reference=$1", [input.event.payload.provider_reference,input.event.payload.status]);
        await client.query("update public.outbox o set status=case when $2 in ('queued','sent') then 'dispatched' when $2 in ('delivered','answered','completed') then 'acknowledged' else 'failed' end,completed_at=case when $2 in ('queued','sent') then null else clock_timestamp() end,claim_token=null,claim_owner=null,claimed_at=null,lease_expires_at=null from public.provider_attempts pa where pa.outbox_id=o.outbox_id and pa.provider_reference=$1", [input.event.payload.provider_reference,input.event.payload.status]);
      } else if (input.event.event_type === "communication.response_recorded") {
        const responseKind=String(input.event.payload.response_kind);
        const status=responseKind==="opt_out"?"opted_out":"completed";
        await client.query(`insert into public.communication_projections (communication_id,scenario_id,aggregate_version,channel,purpose,destination_alias,status,provenance,provider_reference,occurred_at) values ($1,$2,$3,$4,'readiness','finals_allowlisted_phone',$5,'provider_callback',$6,$7) on conflict (communication_id) do update set aggregate_version=excluded.aggregate_version,status=excluded.status,provenance='provider_callback',occurred_at=excluded.occurred_at`,[input.event.aggregate_id,input.scenarioId,input.event.aggregate_version,input.event.payload.channel,status,input.providerReference??input.providerEventId,input.event.occurred_at]);
        if(input.provider==="elevenlabs_twilio"){
          await client.query("update public.provider_attempts set status='definitive_success',completed_at=clock_timestamp(),reconciliation_required=false where provider_reference=$1",[input.providerReference]);
          await client.query("update public.outbox o set status='acknowledged',completed_at=clock_timestamp() from public.provider_attempts pa where pa.outbox_id=o.outbox_id and pa.provider_reference=$1",[input.providerReference]);
        }
      }
      await client.query("update public.webhook_receipts set status='processed',translated_event_id=$3,processed_at=clock_timestamp() where provider=$1 and provider_event_id=$2", [input.provider,input.providerEventId,input.event.event_id]);
      await client.query("commit"); return "accepted";
    } catch (error) { await client.query("rollback"); throw error; } finally { client.release(); }
  }

  async resetScenario(input: ExecuteCommandInput, _event: WorkflowEvent): Promise<CommandReceipt> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      const prior = await client.query<{request_hash:string;response_body:unknown}>("select request_hash,response_body from public.idempotency_records where scenario_id=$1 and idempotency_key=$2", [input.scenarioId,input.idempotencyKey]);
      const hash = semanticHash(input.semanticInput);
      if (prior.rows[0]) {
        if (prior.rows[0].request_hash !== hash) throw new AppError(409,"version_conflict","Idempotency key was already used for a different command.");
        await client.query("commit"); return {...asReceipt(prior.rows[0].response_body),disposition:"replayed"};
      }
      const head = await client.query<{aggregate_version:number}>("select aggregate_version from public.aggregate_heads where scenario_id=$1 and aggregate_type='scenario' and aggregate_id=$1 for update", [input.scenarioId]);
      if ((head.rows[0]?.aggregate_version ?? 0) !== input.expectedVersion) throw new AppError(409,"version_conflict","Aggregate version is stale.",false,head.rows[0]?.aggregate_version ?? 0);
      await client.query("select public.reset_finals_scenario()");
      const seeded = await client.query("select event_id,schema_version,scenario_id,aggregate_type,aggregate_id,aggregate_version,event_type,payload,occurred_at,recorded_at,jsonb_build_object('role',actor_role,'actor_id',actor_id) actor,provenance,correlation_id,causation_id,idempotency_key from public.workflow_events where scenario_id=$1 order by sequence_number limit 1", [input.scenarioId]);
      const receipt: CommandReceipt = {command_id:randomUUID(),disposition:"accepted",scenario_id:input.scenarioId,aggregate_id:input.scenarioId,aggregate_version:1,emitted_events:[seeded.rows[0] as WorkflowEvent]};
      await client.query(`insert into public.idempotency_records (scenario_id,idempotency_key,command_name,request_hash,command_id,aggregate_type,aggregate_id,expected_aggregate_version,resulting_aggregate_version,status,response_status,response_body,completed_at) values ($1,$2,'reset',$3,$4,'scenario',$1,$5,1,'completed',200,$6,clock_timestamp())`, [input.scenarioId,input.idempotencyKey,hash,receipt.command_id,input.expectedVersion,receipt]);
      await client.query("commit"); return receipt;
    } catch (error) { await client.query("rollback"); throw error; } finally { client.release(); }
  }

  async getMetrics(scenarioId: string): Promise<Record<string, unknown>> {
    const result = await this.pool.query(`select s.scenario_id,s.treatment_starts_at,s.aggregate_version,count(*) filter (where b.status <> 'resolved')::int unresolved,(select count(*)::int from public.communication_projections c where c.scenario_id=s.scenario_id) contacts from public.scenarios s left join public.barrier_projections b on b.scenario_id=s.scenario_id where s.scenario_id=$1 group by s.scenario_id,s.treatment_starts_at,s.aggregate_version`, [scenarioId]);
    const row = result.rows[0]; if (!row) throw new AppError(404,"not_found","Scenario not found.");
    return {scenario_id:scenarioId,as_of:new Date().toISOString(),source_event_version:row.aggregate_version,lead_time_hours:Math.max(0,(new Date(row.treatment_starts_at).getTime()-Date.now())/3_600_000),time_to_owner_minutes:null,time_to_acceptance_minutes:null,time_to_first_action_minutes:null,time_to_closure_minutes:null,unresolved_blockers:{at_t72:0,at_t24:0,at_t4:0,current:row.unresolved},sla_breaches:0,contact_attempts:row.contacts,final_disposition:"unknown"};
  }

  async getFhir(scenarioId: string): Promise<Record<string, unknown>> {
    const result = await this.pool.query(`select s.*,tp.status transport_status from public.scenarios s join public.transport_projections tp on tp.scenario_id=s.scenario_id where s.scenario_id=$1 order by tp.created_at limit 1`, [scenarioId]);
    const s = result.rows[0]; if (!s) throw new AppError(404,"not_found","Scenario not found.");
    return generateFhirEvidence({scenarioId,sourceEventVersion:s.aggregate_version,generatedAt:new Date().toISOString(),patientId:s.patient_id,patientDisplayName:s.patient_display_name,treatmentId:s.treatment_id,treatmentStartsAt:new Date(s.treatment_starts_at).toISOString(),locationDisplayName:s.treatment_location_display_name,transportStatus:s.transport_status});
  }

  async getPriority(scenarioId: string): Promise<Record<string, unknown>> {
    const result = await this.pool.query(`select extract(epoch from (s.treatment_starts_at-clock_timestamp()))/3600 hours_to_treatment,exists(select 1 from barrier_projections b where b.scenario_id=s.scenario_id and b.barrier_type='transportation' and b.status<>'resolved')::int transport_help,exists(select 1 from work_item_projections w where w.scenario_id=s.scenario_id and w.work_item_type='human_callback' and w.status<>'closed')::int callback_requested,(select count(*) from barrier_projections b where b.scenario_id=s.scenario_id and b.status<>'resolved') prior_unresolved_barriers,0 prior_contact_failures,24 hours_since_last_contact,extract(epoch from (s.transport_notice_cutoff-clock_timestamp()))/3600 transport_cutoff_hours,(select coalesce((projection#>>'{permission,transport_logistics_allowed}')::boolean,false)::int from role_projections where scenario_id=s.scenario_id and role='caregiver') caregiver_transport_permission,exists(select 1 from barrier_projections b where b.scenario_id=s.scenario_id and b.barrier_type='clinical_concern' and b.status<>'resolved')::int nonurgent_clinical_concern from scenarios s where s.scenario_id=$1`, [scenarioId]);
    if (!result.rows[0]) throw new AppError(404,"not_found","Scenario not found.");
    return scorePriority(result.rows[0], "artifacts/ml/supportive-outreach-v1/model.json");
  }

  async runTick(maxItems: number, dispatch: (item: OutboxItem) => Promise<{providerReference:string}>): Promise<Record<string, unknown>> {
    const claimClient = await this.pool.connect(); const tickId=randomUUID(); const started=new Date(); let succeeded=0,failed=0,claimed=0;
    let rows:{rows:Array<Record<string,any>>;rowCount:number|null};
    try {
      await claimClient.query("begin");
      const lock=await claimClient.query<{locked:boolean}>("select public.try_scheduler_lock($1) locked",[FINALS_SCENARIO_ID]);
      if (!lock.rows[0]?.locked) throw new AppError(409,"version_conflict","Another scheduler tick holds authority.",true);
      await claimClient.query("select * from public.recover_stale_claims(clock_timestamp())");
      const scheduled=await claimClient.query("select * from public.claim_scheduled_actions($1,$2,30)",[tickId,maxItems]);
      for(const action of scheduled.rows){
        const actionType=String(action.payload.channel??action.payload.action_type??"");
        const provider=actionType==="sms"?"twilio_sms":actionType==="voice"?"elevenlabs_twilio":"";
        if(!provider){
          await claimClient.query("update public.scheduled_actions set status='failed',last_error_code='invalid_scheduled_payload',claim_token=null,claim_owner=null,claimed_at=null,lease_expires_at=null,updated_at=clock_timestamp() where scheduled_action_id=$1",[action.scheduled_action_id]);
          await claimClient.query("update public.claim_leases set status='released',released_at=clock_timestamp() where resource_type='scheduled_action' and resource_id=$1 and status='active'",[action.scheduled_action_id]);
          continue;
        }
        const communicationId=deterministicUuid(`communication:${action.stable_action_id}`);
        const correlationId=deterministicUuid(`correlation:${action.stable_action_id}`);
        const payload={...action.payload,communication_id:communicationId,correlation_id:correlationId};
        await claimClient.query(`insert into public.outbox (scenario_id,scheduled_action_id,provider,action_type,destination_alias,stable_action_id,payload) values ($1,$2,$3,$4,'finals_allowlisted_phone',$5,$6) on conflict (stable_action_id) do nothing`,[action.scenario_id,action.scheduled_action_id,provider,actionType,action.stable_action_id,payload]);
        await claimClient.query("update public.scheduled_actions set status='completed',completed_at=clock_timestamp(),claim_token=null,claim_owner=null,claimed_at=null,lease_expires_at=null,updated_at=clock_timestamp() where scheduled_action_id=$1",[action.scheduled_action_id]);
        await claimClient.query("update public.claim_leases set status='released',released_at=clock_timestamp() where resource_type='scheduled_action' and resource_id=$1 and status='active'",[action.scheduled_action_id]);
      }
      rows=await claimClient.query("select * from public.claim_outbox($1,$2,30)",[tickId,maxItems]);
      await claimClient.query("commit");
    } catch(error) {
      await claimClient.query("rollback");
      throw error;
    } finally {
      claimClient.release();
    }

    claimed=rows.rowCount ?? 0;
    for (const row of rows.rows) {
      const attemptId=randomUUID(); const requestHash=createHash("sha256").update(JSON.stringify(row.payload)).digest("hex");
      // Provider intent is durable before the network boundary. Any
      // interruption after this point becomes outcome_unknown.
      await this.pool.query(`insert into public.provider_attempts (provider_attempt_id,scenario_id,outbox_id,provider,stable_action_id,attempt_number,status,request_hash) values ($1,$2,$3,$4,$5,$6,'in_flight',$7)`,[attemptId,row.scenario_id,row.outbox_id,row.provider,row.stable_action_id,row.attempt_count,requestHash]);
      try {
        const accepted=await dispatch({outbox_id:row.outbox_id,scenario_id:row.scenario_id,action_type:row.action_type,stable_action_id:row.stable_action_id,payload:row.payload,attempts:row.attempt_count});
        const resultClient=await this.pool.connect();
        try{await resultClient.query("begin");await resultClient.query("update public.provider_attempts set status='accepted',provider_reference=$2 where provider_attempt_id=$1",[attemptId,accepted.providerReference]);await resultClient.query("update public.outbox set status='dispatched',claim_token=null,claim_owner=null,claimed_at=null,lease_expires_at=null,updated_at=clock_timestamp() where outbox_id=$1",[row.outbox_id]);await resultClient.query("update public.claim_leases set status='released',released_at=clock_timestamp() where resource_type='outbox' and resource_id=$1 and status='active'",[row.outbox_id]);await resultClient.query("commit");}catch(error){await resultClient.query("rollback");throw error;}finally{resultClient.release();} succeeded++;
      } catch (error) {
        const definitive=error instanceof AppError && !error.retryable;
        const resultClient=await this.pool.connect();
        try{await resultClient.query("begin");await resultClient.query("update public.provider_attempts set status=$2,error_code=$3,completed_at=case when $2='definitive_failure' then clock_timestamp() else null end,reconciliation_required=($2='outcome_unknown') where provider_attempt_id=$1",[attemptId,definitive?"definitive_failure":"outcome_unknown",error instanceof AppError?error.code:"provider_network_unknown"]);await resultClient.query("update public.outbox set status=$2,last_error_code=$3,completed_at=case when $2='failed' then clock_timestamp() else null end,claim_token=null,claim_owner=null,claimed_at=null,lease_expires_at=null,updated_at=clock_timestamp() where outbox_id=$1",[row.outbox_id,definitive?"failed":"outcome_unknown",error instanceof AppError?error.code:"provider_network_unknown"]);await resultClient.query("update public.claim_leases set status='released',released_at=clock_timestamp() where resource_type='outbox' and resource_id=$1 and status='active'",[row.outbox_id]);await resultClient.query("commit");}catch(resultError){await resultClient.query("rollback");throw resultError;}finally{resultClient.release();} failed++;
      }
    }
    const remaining=await this.pool.query<{count:number}>("select count(*)::int count from public.outbox where status='pending' and available_at<=clock_timestamp()",[]);
    return {tick_id:tickId,started_at:started.toISOString(),completed_at:new Date().toISOString(),claimed,succeeded,failed,remaining_due:remaining.rows[0]?.count??0};
  }
}
