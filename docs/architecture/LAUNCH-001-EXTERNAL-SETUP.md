# LAUNCH-001 External Setup

Railway is the sole host for the `web`, `api`, and `Postgres` services. Use controlled illustrative data only; never enter real patient or hospital data.

## Tool access observed 2026-09-20

- Railway CLI `5.58.0` is installed at `/Users/jeevaparajuli/.railway/bin/railway` and authenticated to Jeevan Parajuli's workspace.
- The CLI can see the existing `OncoReady-Dev` project and its `production` environment. The project currently has no services and this repository is not linked to it.
- Railway agent tooling is installed and healthy. The separate hosted connector still reports **not connected**, so CLI access is the verified path in this session.

Verify after reconnecting/restarting the terminal:

```bash
command -v railway
railway --version
railway whoami --json
railway status --json
```

Add the installed CLI to future shells if desired, then connect the optional hosted connector:

```bash
export PATH="$PATH:$HOME/.railway/bin"
railway mcp install --agent codex --oauth
```

Restart Codex after changing MCP configuration. Never paste provider tokens into chat.

## Variables

Real values belong in an ignored local `.env` or Railway variables. Never put secrets in Git, screenshots, logs, health responses, or any `VITE_` variable.

### `web`

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://${{api.RAILWAY_PUBLIC_DOMAIN}}` or the exact custom API origin |

### `api`

| Variable | Secret | Initial value |
|---|---:|---|
| `APP_ENV` | No | `production` |
| `DATABASE_URL` | Yes | `${{Postgres.DATABASE_URL}}` reference |
| `ONCOREADY_SCENARIO_TOKEN` | Yes | At least 32 random bytes |
| `ONCOREADY_ALLOWED_ORIGINS` | No | Exact `web` HTTPS origin; never `*` |
| `ONCOREADY_PUBLIC_ORIGIN` | No | Exact public `api` HTTPS origin |
| `CRON_SECRET` | Yes | At least 32 random bytes; manual tick only |
| `SCHEDULER_ENABLED` | No | `true` after database readiness |
| `SCHEDULER_POLL_INTERVAL_MS` | No | `15000` |
| `SCHEDULER_BATCH_SIZE` | No | `25` |
| `EXTERNAL_ACTIONS_ENABLED` | No | `false` initially |
| `TWILIO_SMS_ENABLED` | No | `false` initially |
| `ELEVENLABS_VOICE_ENABLED` | No | `false` initially |
| `TWILIO_ACCOUNT_SID` | No | Account SID beginning `AC` |
| `TWILIO_AUTH_TOKEN` | Yes | Current Auth Token for callback validation |
| `TWILIO_API_KEY_SID` | No | Preferred REST API key SID beginning `SK` |
| `TWILIO_API_KEY_SECRET` | Yes | REST API key secret shown only when created |
| `TWILIO_MESSAGING_SERVICE_SID` | No | Messaging Service SID beginning `MG` |
| `TWILIO_FROM_NUMBER` | Sensitive | Optional E.164 sender if selected instead of a Messaging Service |
| `FINALS_ALLOWLISTED_PHONE` | Sensitive | One consented team-controlled E.164 recipient |
| `ELEVENLABS_API_KEY` | Yes | Dedicated restricted key |
| `ELEVENLABS_AGENT_ID` | No | Readiness agent ID |
| `ELEVENLABS_PHONE_NUMBER_ID` | No | Imported Twilio number ID |
| `ELEVENLABS_WEBHOOK_SECRET` | Yes | HMAC webhook secret |

Railway supplies `PORT`; the API listens on `0.0.0.0:$PORT`.

## 1. Railway

Inspect before creating anything:

```bash
railway status --json
railway environment list --json
railway service list --json
```

Link the existing project and explicitly select its environment. Create a dedicated `finals` environment only if you do not want to use the existing `production` environment. Add only missing services; re-list after ambiguous output to avoid duplicates.

```bash
railway link --project OncoReady-Dev --environment production --json
railway status --json
# Optional isolation instead of production:
# railway environment new finals --json
# railway environment link finals
railway add --service web --json
railway add --service api --json
railway add --database postgres --json
railway service list --json
```

Service names are case-sensitive in references. If the database is not named `Postgres`, update the `DATABASE_URL` reference.

### Source and runtime

- `web`: same Git repository, root `/frontend`, Vite build, `dist` static output, SPA fallback.
- `api`: same repository with root build context so `api/`, `packages/`, contracts, migrations, and ML artifacts are available.
- `Postgres`: private only; do not add a public TCP proxy for normal runtime.

Generate stable public domains for `web` and `api`:

```bash
railway domain --service web --json
railway domain --service api --json
```

Wire Postgres by reference:

```bash
railway variable set 'DATABASE_URL=${{Postgres.DATABASE_URL}}' --service api --environment production
```

Configure `api` with `/health`, one launch replica, sleeping disabled, restart enabled, the reviewed migration command, and code-owned build/start commands. Do not configure Railway Cron; the long-running API poller wakes durable database work.

Apply only reviewed vendor-neutral migrations. The retired platform-specific HTTP scheduler migration must not be in the target sequence.

Preflight must prove:

- `web` and `api` deployments are `SUCCESS`;
- landing and direct SPA routes load;
- `/health` reports process/database readiness without secrets;
- CORS permits only the exact web origin;
- Postgres is private and migrations/seed are current;
- reset creates no outbox/provider effect;
- scheduler heartbeat advances and stale leases recover;
- unauthenticated `GET /api/v1/operations/tick` returns `401`;
- overlapping poll/manual cycles do not duplicate intent.

References: [Railway monorepos](https://docs.railway.com/guides/deploying-a-monorepo), [frontend variables](https://docs.railway.com/guides/frontend-environment-variables), [PostgreSQL](https://docs.railway.com/databases/postgresql).

## 2. Twilio

Human steps:

1. Create/select a dedicated Twilio project and enable MFA/billing.
2. Purchase one number supporting SMS and voice.
3. Obtain explicit consent from one team-controlled recipient.
4. Complete applicable sender registration: US local senders generally require A2P 10DLC; toll-free senders require toll-free verification.
5. Create a Messaging Service, add the number to its Sender Pool, and keep standard STOP/HELP handling enabled.
6. Store the Twilio variables on `api`; never commit the number or credentials. Prefer the API key SID/secret for REST management while retaining the Account Auth Token for standard webhook signature validation.

Configure `POST` callbacks on the exact API origin:

```text
https://<API_DOMAIN>/api/v1/callbacks/twilio/inbound-message
https://<API_DOMAIN>/api/v1/callbacks/twilio/message-status
```

Use the Messaging Service incoming-message webhook (or an identical sender-level webhook) and its Delivery Status Callback. The backend validates `X-Twilio-Signature` using the exact external URL and raw form data before parsing.

Approved inputs are `1 ready`, `2 need a ride`, `3 call me`, `4 scheduling help`, `9 repeat`, `STOP`, and `HELP`. Copy must identify OncoReady, minimize lock-screen detail, and provide no diagnosis or advice.

References: [Messaging Services](https://www.twilio.com/docs/messaging/services), [webhook validation](https://www.twilio.com/docs/messaging/guides/webhook-request).

## 3. ElevenLabs through Twilio

Human steps:

1. Create/select the ElevenLabs workspace and enable MFA.
2. Create a dedicated restricted API key and store it only in local/Railway secret storage.
3. Import the purchased Twilio number under **Phone Numbers**; prefer a restricted Twilio API key SID/secret where supported.
4. Create/link one bounded readiness agent and record its agent/phone-number IDs.
5. Review the required AI/recording/data-use disclosure and obtain consent.
6. Under **Privacy**, disable audio saving and set retention to `0 days` where available. Do not enable audio webhook delivery.

Agent rules:

- disclose immediately that it is an AI assistant;
- confirm only the controlled recipient and repeat/slow the illustrative appointment time;
- return one outcome: `ready`, `ride_help`, `scheduling_help`, `human_callback`, or `unsupported_or_uncertain`;
- send symptoms, distress, ambiguity, or unsupported requests to a human without assessing urgency;
- never diagnose, triage, prescribe, clear treatment, cancel/reschedule, decide eligibility, or close clinical work;
- end after the outcome/handoff; expose no arbitrary tools.

Under the agent's analysis/data-collection settings, add a string field with ID `oncoready_outcome` and restrict it to:

```text
ready
ride_help
scheduling_help
human_callback
unsupported_or_uncertain
```

Create HMAC-authenticated webhooks for the transcription and initiation-failure events and store the secret. Governed routes are:

```text
https://<API_DOMAIN>/api/v1/callbacks/elevenlabs/post-call
https://<API_DOMAIN>/api/v1/callbacks/elevenlabs/failure
```

The OpenAPI contract now accepts ElevenLabs' official signed `post_call_transcription` and `call_initiation_failure` envelopes. The backend validates `ElevenLabs-Signature` and its timestamp on the exact raw body before parsing, identifies the stored provider attempt by `conversation_id`, discards transcript/audio, and persists only the approved minimal outcome/failure evidence. A successful handler returns HTTP `200` as required by ElevenLabs.

Once `ELEVENLABS_API_KEY` is supplied through an approved secret channel, agent/phone/webhook configuration may be automated. Billing, phone purchase/verification, consent, and account acceptance remain human actions.

References: [native Twilio integration](https://elevenlabs.io/docs/eleven-agents/phone-numbers/twilio-integration/native-integration), [post-call webhooks](https://elevenlabs.io/docs/eleven-agents/workflows/post-call-webhooks), [privacy](https://elevenlabs.io/docs/eleven-agents/customization/privacy), [disclosure](https://elevenlabs.io/docs/eleven-agents/legal/disclosure-requirement).

## 4. Other external preparation

- CareLink is an internal persisted illustrative workflow; provide provider/coordinator, pickup/destination, arrival/cutoff, mobility, funding, outbound/return, driver/vehicle, failure, and backup aliases. No third-party key is needed.
- Install Java for the pinned FHIR validator. A passing report must match the exact generated bundle hash.
- Install Python 3.12 and the committed `ml/requirements.txt`; runtime accepts only reviewed immutable JSON artifacts.

## 5. Enablement order

1. Deploy all services with external switches `false`.
2. Apply migrations; run reset/seed and prove zero external effects.
3. Pass Railway health, routing, database, scheduler, and manual-tick preflight.
4. Reject invalid Twilio/ElevenLabs signatures and prove callback duplicate/order safety.
5. Enable only SMS; verify authentic sent/delivered/inbound callbacks, then rehearse STOP/undelivered recovery.
6. Enable only voice after the signed-webhook and data-collection preflight; verify one bounded call and no transcript/audio persistence.
7. Enable the global switch only for a controlled rehearsal window and run the required success/failure rehearsals.

Unknown provider outcomes remain unresolved until reconciled; lease expiry never authorizes blind resend.

## Handback checklist

Send only non-secret values/status:

```text
Railway CLI and Codex connection working: yes/no
Railway project/environment IDs:
web service ID and HTTPS origin:
api service ID and HTTPS origin:
Postgres service ID; private/reference wired: yes/no
web/api latest deployment SUCCESS: yes/no
Migrations current; scheduler healthy/no stuck claims: yes/no
Twilio ready; Messaging Service SID; SMS+voice capability:
Allowlisted consented recipient stored: yes/no
Sender registration state:
ElevenLabs agent ID and phone-number ID:
ElevenLabs HMAC secret stored: yes/no
Python 3.12 and Java ready: yes/no
```

Never send database URLs/passwords, Railway tokens, Twilio tokens/API secrets, ElevenLabs API keys, webhook secrets, scenario/tick tokens, or phone numbers in chat.

Report blockers immediately if access is ambiguous, Postgres cannot stay private, the API cannot stay awake or bind `PORT`, a retired scheduler dependency remains, provider registration/consent is unavailable, the number lacks required capability, callback contracts cannot match official envelopes, or a provider requires broad credentials/retention/disabled signature validation. Keep the affected switch disabled.
