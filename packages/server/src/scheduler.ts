import type {WorkflowApplication} from "./application.js";
import type {ServerConfig} from "./config.js";
import {AppError} from "./types.js";

export interface Scheduler {
  start(): void;
  stop(): Promise<void>;
}

export function createScheduler(
  application: Pick<WorkflowApplication, "tick">,
  config: ServerConfig["scheduler"],
  log: (level: "info" | "error", event: string, detail?: Record<string, unknown>) => void = () => {},
): Scheduler {
  let timer: NodeJS.Timeout | undefined;
  let active: Promise<void> | undefined;
  let stopped = false;

  const schedule = (delay: number) => {
    if (stopped || !config.enabled) return;
    timer = setTimeout(run, delay);
    timer.unref();
  };

  const run = () => {
    if (stopped || active) return;
    active = Promise.resolve(application.tick(config.batchSize))
      .then((receipt) => log("info", "scheduler_tick_completed", receipt))
      .catch((error: unknown) => {
        if (error instanceof AppError && error.status === 409) {
          log("info", "scheduler_tick_skipped", {reason: "authority_held"});
          return;
        }
        log("error", "scheduler_tick_failed", {code: error instanceof AppError ? error.code : "internal_error"});
      })
      .finally(() => {
        active = undefined;
        schedule(config.pollIntervalMs);
      });
  };

  return {
    start() {
      if (!stopped && config.enabled && !timer && !active) schedule(0);
    },
    async stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
      await active;
    },
  };
}
