import {createHmac, timingSafeEqual} from "node:crypto";
import twilio from "twilio";
import type {ServerConfig} from "./config.js";
import {assertProviderConfig} from "./config.js";
import {AppError, type OutboxItem} from "./types.js";

export interface ProviderAccepted {
  provider: "twilio_sms" | "elevenlabs_twilio";
  providerReference: string;
  state: "provider_accepted_pending_callback";
}

export function validateTwilioSignature(config: ServerConfig, pathWithQuery: string, rawBody: string, signature: string | null): URLSearchParams {
  if (!config.twilio.authToken || !signature) throw new AppError(401, "invalid_callback_signature", "Twilio callback signature is missing.");
  const params = new URLSearchParams(rawBody);
  const values: Record<string, string> = {};
  params.forEach((value, key) => { values[key] = value; });
  const url = `${config.publicOrigin}${pathWithQuery}`;
  if (!twilio.validateRequest(config.twilio.authToken, signature, url, values)) {
    throw new AppError(401, "invalid_callback_signature", "Twilio callback signature is invalid.");
  }
  return params;
}

export function validateElevenLabsSignature(secret: string | undefined, rawBody: string, header: string | null, nowSeconds = Math.floor(Date.now() / 1000)): void {
  if (!secret || !header) throw new AppError(401, "invalid_callback_signature", "ElevenLabs callback signature is missing.");
  const parts = Object.fromEntries(header.split(",").map((entry) => entry.split("=", 2))) as Record<string, string | undefined>;
  const timestamp = parts.t;
  const signature = parts.v0;
  if (!timestamp || !signature || !/^\d+$/.test(timestamp) || !/^[a-f0-9]{64}$/i.test(signature)) {
    throw new AppError(401, "invalid_callback_signature", "ElevenLabs callback signature is malformed.");
  }
  if (Math.abs(nowSeconds - Number(timestamp)) > 30 * 60) throw new AppError(401, "invalid_callback_signature", "ElevenLabs callback signature is stale.");
  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest();
  const actual = Buffer.from(signature, "hex");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new AppError(401, "invalid_callback_signature", "ElevenLabs callback signature is invalid.");
}

const smsCopy: Record<string, string> = {
  readiness: "OncoReady check-in: please reply READY, RIDE HELP, CALL ME, or STOP. This inbox is not for emergencies.",
  fallback: "OncoReady follow-up: your care team still needs your response. Reply CALL ME for a team callback or STOP.",
  plan_update: "OncoReady: your transportation plan was updated. Sign in to review and acknowledge the complete plan.",
  human_callback: "OncoReady: your request for a team callback is queued. This inbox is not for emergencies.",
};

export async function dispatchOutbox(config: ServerConfig, item: OutboxItem, fetchImpl: typeof fetch = fetch): Promise<ProviderAccepted> {
  if (item.action_type === "sms") {
    assertProviderConfig(config, "sms");
    const client = twilio(config.twilio.accountSid!, config.twilio.authToken!);
    const purpose = String(item.payload.purpose ?? "readiness");
    const message = await client.messages.create({
      body: smsCopy[purpose] ?? smsCopy.readiness!,
      to: config.allowlistedPhone!,
      statusCallback: `${config.publicOrigin}/api/v1/callbacks/twilio/message-status`,
      ...(config.twilio.messagingServiceSid ? {messagingServiceSid: config.twilio.messagingServiceSid} : {from: config.twilio.fromNumber!}),
    });
    return {provider: "twilio_sms", providerReference: message.sid, state: "provider_accepted_pending_callback"};
  }

  assertProviderConfig(config, "voice");
  const response = await fetchImpl("https://api.elevenlabs.io/v1/convai/twilio/outbound-call", {
    method: "POST",
    headers: {"content-type": "application/json", "xi-api-key": config.elevenLabs.apiKey!},
    body: JSON.stringify({
      agent_id: config.elevenLabs.agentId,
      agent_phone_number_id: config.elevenLabs.phoneNumberId,
      to_number: config.allowlistedPhone,
      call_recording_enabled: false,
      conversation_initiation_client_data: {dynamic_variables: {stable_action_id: item.stable_action_id}},
    }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new AppError(503, "dependency_unavailable", `Voice provider rejected initiation (${response.status}).`, true);
  const body = await response.json() as {success?: boolean; conversation_id?: string | null; callSid?: string | null};
  const reference = body.conversation_id ?? body.callSid;
  if (!body.success || !reference) throw new AppError(503, "dependency_unavailable", "Voice provider did not return a stable reference.", true);
  return {provider: "elevenlabs_twilio", providerReference: reference, state: "provider_accepted_pending_callback"};
}
