import {AppError} from "./types.js";

const enabled = (value: string | undefined): boolean => value === "true";

export interface ServerConfig {
  host: string;
  port: number;
  databaseUrl: string;
  scenarioToken: string;
  allowedOrigins: string[];
  publicOrigin: string;
  cronSecret: string;
  scheduler: {
    enabled: boolean;
    pollIntervalMs: number;
    batchSize: number;
  };
  externalActionsEnabled: boolean;
  allowlistedPhone?: string;
  twilio: {
    enabled: boolean;
    accountSid?: string;
    authToken?: string;
    messagingServiceSid?: string;
    fromNumber?: string;
  };
  elevenLabs: {
    enabled: boolean;
    apiKey?: string;
    agentId?: string;
    phoneNumberId?: string;
    webhookSecret?: string;
  };
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const port = integerInRange(env.PORT, 3000, 1, 65_535, "PORT");
  const pollIntervalMs = integerInRange(env.SCHEDULER_POLL_INTERVAL_MS, 15_000, 1_000, 300_000, "SCHEDULER_POLL_INTERVAL_MS");
  const batchSize = integerInRange(env.SCHEDULER_BATCH_SIZE, 25, 1, 100, "SCHEDULER_BATCH_SIZE");
  return {
    host: "0.0.0.0",
    port,
    databaseUrl: env.DATABASE_URL ?? "",
    scenarioToken: env.ONCOREADY_SCENARIO_TOKEN ?? "",
    allowedOrigins: (env.ONCOREADY_ALLOWED_ORIGINS ?? "http://localhost:5173")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    publicOrigin: (env.ONCOREADY_PUBLIC_ORIGIN ?? "http://localhost:3000").replace(/\/$/, ""),
    cronSecret: env.CRON_SECRET ?? "",
    scheduler: {
      enabled: env.SCHEDULER_ENABLED === undefined ? true : enabled(env.SCHEDULER_ENABLED),
      pollIntervalMs,
      batchSize,
    },
    externalActionsEnabled: enabled(env.EXTERNAL_ACTIONS_ENABLED),
    ...(env.FINALS_ALLOWLISTED_PHONE ? {allowlistedPhone: env.FINALS_ALLOWLISTED_PHONE} : {}),
    twilio: {
      enabled: enabled(env.TWILIO_SMS_ENABLED),
      ...(env.TWILIO_ACCOUNT_SID ? {accountSid: env.TWILIO_ACCOUNT_SID} : {}),
      ...(env.TWILIO_AUTH_TOKEN ? {authToken: env.TWILIO_AUTH_TOKEN} : {}),
      ...(env.TWILIO_MESSAGING_SERVICE_SID ? {messagingServiceSid: env.TWILIO_MESSAGING_SERVICE_SID} : {}),
      ...(env.TWILIO_FROM_NUMBER ? {fromNumber: env.TWILIO_FROM_NUMBER} : {}),
    },
    elevenLabs: {
      enabled: enabled(env.ELEVENLABS_VOICE_ENABLED),
      ...(env.ELEVENLABS_API_KEY ? {apiKey: env.ELEVENLABS_API_KEY} : {}),
      ...(env.ELEVENLABS_AGENT_ID ? {agentId: env.ELEVENLABS_AGENT_ID} : {}),
      ...(env.ELEVENLABS_PHONE_NUMBER_ID ? {phoneNumberId: env.ELEVENLABS_PHONE_NUMBER_ID} : {}),
      ...(env.ELEVENLABS_WEBHOOK_SECRET ? {webhookSecret: env.ELEVENLABS_WEBHOOK_SECRET} : {}),
    },
  };
}

function integerInRange(value: string | undefined, fallback: number, minimum: number, maximum: number, name: string): number {
  const parsed = value === undefined || value === "" ? fallback : Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new AppError(503, "dependency_unavailable", `${name} must be an integer from ${minimum} through ${maximum}.`, true);
  }
  return parsed;
}

export function assertRuntimeConfig(config: ServerConfig): void {
  if (!config.databaseUrl || !config.scenarioToken) {
    throw new AppError(503, "dependency_unavailable", "Server persistence or scenario control is not configured.", true);
  }
  assertDatabaseUrl(config.databaseUrl);
}

export function assertDatabaseUrl(value: string): void {
  if (!value) throw new AppError(503,"dependency_unavailable","Database connection is not configured.",true);
  let databaseUrl:URL;
  try{databaseUrl=new URL(value);}catch{throw new AppError(503,"dependency_unavailable","Database connection configuration is invalid.",true);}
  if(!["postgres:","postgresql:"].includes(databaseUrl.protocol))throw new AppError(503,"dependency_unavailable","Database connection must use PostgreSQL.",true);
  const privateRailwayHost = databaseUrl.hostname.endsWith(".railway.internal");
  if(!["localhost","127.0.0.1","::1","[::1]"].includes(databaseUrl.hostname)&&!privateRailwayHost&&!databaseUrl.searchParams.get("sslmode"))throw new AppError(503,"dependency_unavailable","Public database connections must explicitly require TLS.",true);
}

export function assertProviderConfig(config: ServerConfig, provider: "sms" | "voice"): void {
  if (!config.externalActionsEnabled || !config.allowlistedPhone) {
    throw new AppError(503, "dependency_unavailable", "External actions are disabled or the destination allowlist is absent.");
  }
  if (provider === "sms") {
    if (!config.twilio.enabled || !config.twilio.accountSid || !config.twilio.authToken || (!config.twilio.messagingServiceSid && !config.twilio.fromNumber)) {
      throw new AppError(503, "dependency_unavailable", "Twilio SMS is disabled or incomplete.");
    }
  } else if (!config.elevenLabs.enabled || !config.elevenLabs.apiKey || !config.elevenLabs.agentId || !config.elevenLabs.phoneNumberId) {
    throw new AppError(503, "dependency_unavailable", "ElevenLabs voice is disabled or incomplete.");
  }
}
