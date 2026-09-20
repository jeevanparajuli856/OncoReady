import {afterEach,describe,expect,it,vi} from "vitest";
import {createScheduler} from "../../packages/server/src/scheduler.js";
import {PostgresWorkflowRepository} from "../../packages/server/src/postgres-repository.js";
import type {OutboxItem} from "../../packages/server/src/types.js";

afterEach(()=>vi.useRealTimers());

describe("in-process scheduler",()=>{
  it("runs the shared bounded tick and does not overlap a slow cycle",async()=>{
    vi.useFakeTimers();
    let release: (()=>void)|undefined;
    const tick=vi.fn(()=>new Promise<Record<string,unknown>>((resolve)=>{release=()=>resolve({claimed:0});}));
    const scheduler=createScheduler({tick},{enabled:true,pollIntervalMs:1_000,batchSize:25});
    scheduler.start(); await vi.advanceTimersByTimeAsync(0);
    expect(tick).toHaveBeenCalledTimes(1); expect(tick).toHaveBeenCalledWith(25);
    await vi.advanceTimersByTimeAsync(5_000); expect(tick).toHaveBeenCalledTimes(1);
    release?.(); await scheduler.stop();
    await vi.advanceTimersByTimeAsync(5_000); expect(tick).toHaveBeenCalledTimes(1);
  });

  it("keeps scheduled cadence internal and rejects legacy unauthorized outbox rows",async()=>{
    const queries:Array<{sql:string;params:unknown[]}>=[];
    const scheduled={scheduled_action_id:"scheduled-001",scenario_id:"11111111-1111-4111-8111-111111111111",stable_action_id:"finals-t3-readiness",payload:{channel:"sms"}};
    const unauthorized={outbox_id:"outbox-unauthorized",scenario_id:scheduled.scenario_id,provider:"twilio_sms",action_type:"sms",stable_action_id:"legacy-scheduled-action",payload:{purpose:"readiness"},attempt_count:1};
    const authorized={outbox_id:"outbox-authorized",event_id:"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",scenario_id:scheduled.scenario_id,provider:"twilio_sms",action_type:"sms",stable_action_id:"operator-action",payload:{communication_id:"operator-action",purpose:"readiness",authorization_source:"operator_control"},attempt_count:1};
    const resultClient={
      query:async(sql:string,params:unknown[]=[])=>{queries.push({sql,params});return {rows:[],rowCount:1};},
      release:vi.fn(),
    };
    const claimClient={
      query:async(sql:string,params:unknown[]=[])=>{
        queries.push({sql,params});
        if(sql.includes("try_scheduler_lock"))return {rows:[{locked:true}],rowCount:1};
        if(sql.includes("claim_scheduled_actions"))return {rows:[scheduled],rowCount:1};
        if(sql.includes("claim_outbox"))return {rows:[unauthorized,authorized],rowCount:2};
        if(sql.includes("select exists("))return {rows:[{authorized:true}],rowCount:1};
        return {rows:[],rowCount:1};
      },
      release:vi.fn(),
    };
    let connections=0;
    const pool={
      connect:async()=>connections++===0?claimClient:resultClient,
      query:async(sql:string,params:unknown[]=[])=>{queries.push({sql,params});if(sql.includes("count(*)::int count"))return {rows:[{count:0}],rowCount:1};return {rows:[],rowCount:1};},
      end:async()=>undefined,
    };
    const repository=new PostgresWorkflowRepository("postgres://localhost/oncoready");
    (repository as unknown as {pool:unknown}).pool=pool;
    const dispatch=vi.fn(async(_item:OutboxItem)=>({providerReference:"provider-reference-001"}));

    await expect(repository.runTick(25,dispatch)).resolves.toMatchObject({claimed:2,succeeded:1,failed:1,remaining_due:0});
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0]?.[0].outbox_id).toBe("outbox-authorized");
    expect(queries.some(({sql})=>sql.includes("insert into public.outbox"))).toBe(false);
    expect(queries.some(({sql,params})=>sql.includes("update public.scheduled_actions")&&sql.includes("operator_authorization_required")&&params[0]==="scheduled-001")).toBe(true);
    expect(queries.some(({sql,params})=>sql.includes("update public.outbox set status='failed'")&&sql.includes("operator_authorization_required")&&params[0]==="outbox-unauthorized")).toBe(true);
  });

  it("stays inert when disabled",async()=>{
    vi.useFakeTimers(); const tick=vi.fn(async()=>({claimed:0}));
    const scheduler=createScheduler({tick},{enabled:false,pollIntervalMs:1_000,batchSize:25});
    scheduler.start(); await vi.advanceTimersByTimeAsync(5_000); await scheduler.stop();
    expect(tick).not.toHaveBeenCalled();
  });
});
