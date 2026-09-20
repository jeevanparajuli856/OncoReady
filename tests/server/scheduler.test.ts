import {afterEach,describe,expect,it,vi} from "vitest";
import {createScheduler} from "../../packages/server/src/scheduler.js";

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

  it("stays inert when disabled",async()=>{
    vi.useFakeTimers(); const tick=vi.fn(async()=>({claimed:0}));
    const scheduler=createScheduler({tick},{enabled:false,pollIntervalMs:1_000,batchSize:25});
    scheduler.start(); await vi.advanceTimersByTimeAsync(5_000); await scheduler.stop();
    expect(tick).not.toHaveBeenCalled();
  });
});
