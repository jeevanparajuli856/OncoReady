import {AppError} from "./types.js";

const enabled = (value: string | undefined): boolean => value === "true";

export interface ServerConfig {
  databaseUrl: string;
  scenarioToken: string;
  allowedOrigins: string[];
  publicOrigin: string;
  cronSecret: string;
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
  return {
    databaseUrl: env.DATABASE_URL ?? "",
    scenarioToken: env.ONCOREADY_SCENARIO_TOKEN ?? "",
    allowedOrigins: (env.ONCOREADY_ALLOWED_ORIGINS ?? "http://localhost:5173")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
    publicOrigin: (env.ONCOREADY_PUBLIC_ORIGIN ?? "http://localhost:3000").replace(/\/$/, ""),
    cronSecret: env.CRON_SECRET ?? "",
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

export function assertRuntimeConfig(config: ServerConfig): void {
  if (!config.databaseUrl || !config.scenarioToken) {
    throw new AppError(503, "dependency_unavailable", "Server persistence or scenario control is not configured.", true);
  }
  let databaseUrl:URL;
  try{databaseUrl=new URL(config.databaseUrl);}catch{throw new AppError(503,"dependency_unavailable","Database connection configuration is invalid.",true);}
  if(!["postgres:","postgresql:"].includes(databaseUrl.protocol))throw new AppError(503,"dependency_unavailable","Database connection must use PostgreSQL.",true);
  if(!["localhost","127.0.0.1","::1"].includes(databaseUrl.hostname)&&!databaseUrl.searchParams.get("sslmode"))throw new AppError(503,"dependency_unavailable","Remote database connection must explicitly require TLS.",true);
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
