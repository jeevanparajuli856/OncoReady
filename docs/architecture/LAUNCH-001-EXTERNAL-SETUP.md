# LAUNCH-001 External Setup Runbook

**Audience:** project owner/operator  
**Environment:** controlled finals/development environment with illustrative data only  
**Task state:** `IMPLEMENTATION`  
**Last reviewed:** 2026-09-20

This is the one operator checklist for accounts, secrets, external services, callback URLs, and local verification tooling required by LAUNCH-001. Complete the account-side work while implementation continues. Do not add a real patient, real protected health information, a production identity provider, or production hospital credentials.

## Approved external stack

| Service | Required plan/account | Purpose |
|---|---|---|
| Vercel | Hobby (`$0`) | Hosts the React application and TypeScript Functions; Vercel Cron is not used. |
| Supabase | Free (`$0`) | PostgreSQL, transaction pooler, Vault, `pg_cron`, and `pg_net` scheduler trigger. |
| Google Cloud | Not required | Cloud Scheduler and Cloud SQL are not part of LAUNCH-001. Your Google Cloud credits remain unused. |
| Twilio | Development account; paid/verified sender may be required | Controlled live SMS and the Twilio number used by ElevenLabs voice. Carrier registration timing can be the longest external lead item. |
| ElevenLabs | Account with ElevenAgents and sufficient calling access | One bounded voice agent, linked Twilio number, and authenticated post-call/failure callbacks. |
| CareLink | No external account | CareLink Partner Dispatch is OncoReady's internal persisted coordinator workflow. |
| HL7 FHIR validator | No cloud account | Local pinned Java validator for hash-bound FHIR R4 evidence. |
| ML tooling | No cloud account | Local Python 3.12 LightGBM/SHAP training and reproducibility checks. |

## Fastest safe order

- [ ] Create a password-manager vault/collection for OncoReady finals credentials.
- [ ] Create or select a **Vercel Hobby** project. Do not configure Vercel Cron.
- [ ] Create a dedicated **Supabase Free** DEV/finals project containing illustrative data only.
- [ ] After the scheduler migration lands, provision the canonical tick URL and shared tick secret in Supabase Vault and verify the one-minute Supabase Cron job.
- [ ] Create or upgrade a Twilio account; secure one SMS/voice-capable number and one consented team-controlled recipient.
- [ ] Start US messaging registration/verification immediately if using a US long-code or toll-free sender.
- [ ] Create an ElevenLabs account and a bounded ElevenAgents voice agent.
- [ ] Install Docker Desktop, Node.js, Python 3.12, and Java for local database/ML/FHIR checks.
- [ ] Keep every external-action switch disabled until migrations, tests, callback validation, and allowlists pass.
- [ ] Send the non-secret setup values listed under “What to hand back” to the orchestrator. Send secrets only through the chosen secret manager/Vercel environment UI, never chat.

## 1. Credential handling

Create separate vault entries for Vercel, Supabase, Twilio, and ElevenLabs. Use unique credentials and enable MFA on every provider account.

Never place a credential in:

- Git, committed `.env` files, frontend variables, screenshots, issue text, or chat;
- a variable beginning with `VITE_` (Vite exposes those values to the browser bundle);
- logs, verification reports, screen recordings, or presentation slides.

Local secrets belong in an ignored `.env` file. Hosted application/provider secrets belong in Vercel **Project → Settings → Environment Variables**. The scheduler receives only the canonical tick URL and the shared tick secret through Supabase Vault. Set live-provider secrets only for the controlled deployment that will use them. Keep Preview deployments network-disabled unless a specific preview URL has been reviewed and allowlisted.

Generate at least 32 random bytes for both `ONCOREADY_SCENARIO_TOKEN` and `CRON_SECRET`. The identical `CRON_SECRET` value must exist in exactly two runtime locations: Vercel's server-only environment for verification and Supabase Vault as `oncoready_cron_secret` for invocation. It must never appear in Git, SQL migrations, a URL, logs, screenshots, or chat.

## 2. Vercel

### Account and project

1. Create/select the Vercel team that will own the controlled finals deployment.
2. Use the **Hobby** plan. LAUNCH-001 does not use Vercel Cron, so Vercel Pro is not required.
3. Import this Git repository as one Vercel project. Keep the repository root as the project root; root `vercel.json` owns the frontend build, function routing, and deep-link rewrites.
4. Make the first deployment with all external actions disabled.
5. Record the canonical HTTPS origin, for example `https://oncoready-finals.vercel.app`. Avoid switching between preview aliases when testing signed callbacks because Twilio signs the exact requested URL.

### Core server environment

Create these variables in Vercel. Values shown are descriptions, not literal values.

| Variable | Secret | Initial value/action |
|---|---:|---|
| `DATABASE_URL` | Yes | Supabase **transaction pooler** URI with SSL; obtain it in section 3. |
| `ONCOREADY_SCENARIO_TOKEN` | Yes | New random token; controlled-environment gate, not production authentication. |
| `ONCOREADY_ALLOWED_ORIGINS` | No | Exact allowed HTTPS origin(s); never `*`. Start with the canonical finals origin. |
| `ONCOREADY_PUBLIC_ORIGIN` | No | Exact canonical deployed HTTPS origin used to construct and validate callbacks. |
| `CRON_SECRET` | Yes | New random secret, at least 32 random bytes recommended. |
| `EXTERNAL_ACTIONS_ENABLED` | No | `false` until the final controlled enablement gate. |
| `TWILIO_SMS_ENABLED` | No | `false` initially. |
| `ELEVENLABS_VOICE_ENABLED` | No | `false` initially. |

After setting `ONCOREADY_PUBLIC_ORIGIN`, redeploy so every function sees the final value.

### Scheduler endpoint preparation

Vercel hosts this protected endpoint but does not schedule it:

```text
GET /api/v1/operations/tick
schedule: every minute
Authorization: Bearer <CRON_SECRET>
```

After deployment, record the full canonical URL including the bounded batch query:

```text
https://<ONCOREADY_PUBLIC_ORIGIN>/api/v1/operations/tick?max_items=25
```

Confirm an unauthenticated request returns `401`. Do not configure a Vercel Cron job. Supabase Cron configuration and verification are in section 3.

## 3. Supabase PostgreSQL

### Create the controlled database

1. Create a new Supabase project dedicated to DEV/finals use on the **Free** plan.
2. Choose a region close to the Vercel deployment region.
3. Use a strong database password and store it only in the vault.
4. Do not add real patient data. The repository's deterministic illustrative seed is the only intended scenario.
5. Record the project reference from the dashboard URL.

The approved Free-plan boundary is deliberately small: two active free projects per account, 500 MB database size per project, and 5 GB egress. A Free project may pause after low activity, and included automated database backups are unavailable. See [Supabase billing and Free quotas](https://supabase.com/docs/guides/platform/billing-on-supabase) and [Free-project pausing](https://supabase.com/docs/guides/platform/free-project-pausing).

For LAUNCH-001:

- keep only controlled illustrative data and bounded workflow evidence;
- check database size before every rehearsal and keep it below 500 MB;
- treat Git-tracked migrations plus deterministic seed/reset as recovery authority;
- if Supabase reports the project paused, resume it in the dashboard, wait for database health, then rerun migration, seed/projection, Vault, Cron, and authenticated-tick preflight before enabling external actions.

### Connection for Vercel

In Supabase, open **Connect** and copy the **Transaction pooler** connection string. It normally uses shared-pooler port `6543` and a username shaped like `postgres.<PROJECT_REF>`. Supabase recommends transaction mode for serverless functions; prepared statements must be disabled, the application pool should remain tightly bounded, and SSL should be required: [Supabase serverless connection guidance](https://supabase.com/docs/guides/database/connecting-to-postgres#shared-pooler-transaction-mode).

Put that full URI in Vercel as `DATABASE_URL`. Do not use a frontend Supabase key and do not expose the database URL to the browser. LAUNCH-001 connects from server functions directly to PostgreSQL.

### CLI preparation

Install/start Docker Desktop before using the local Supabase stack. The implementation is being validated with Supabase CLI `2.117.0`:

```bash
npx --yes supabase@2.117.0 start
npx --yes supabase@2.117.0 db reset
```

For the controlled remote DEV/finals project, prepare these locally (never commit them):

```text
SUPABASE_ACCESS_TOKEN
SUPABASE_PROJECT_REF
SUPABASE_DB_PASSWORD
```

Do not push until the LAUNCH-001 migration lands and passes review. Then use:

```bash
npx --yes supabase@2.117.0 link --project-ref "$SUPABASE_PROJECT_REF"
npx --yes supabase@2.117.0 migration list --linked
npx --yes supabase@2.117.0 db push --dry-run --linked
npx --yes supabase@2.117.0 db push --linked
```

The CLI workflow and migration guidance are documented by Supabase: [local development workflow](https://supabase.com/docs/guides/local-development/cli-workflows).

Do **not** run `supabase db reset --linked` yourself. It destroys the linked remote database. A remote reset is allowed only after the orchestrator confirms the exact DEV/finals project and explicitly schedules the deterministic reseed. Never run it against production.

### Supabase Vault and one-minute Cron

Do this only after the scheduler migration has landed and the canonical Vercel deployment exists.

1. In Vercel, confirm `CRON_SECRET` is stored only as a server-side environment variable and redeploy.
2. In Supabase Dashboard, open **Database → Vault** (or the current Vault management surface).
3. Create `oncoready_tick_url` with the full canonical URL:

```text
https://<ONCOREADY_PUBLIC_ORIGIN>/api/v1/operations/tick?max_items=25
```

4. Create `oncoready_cron_secret` with the exact same opaque value stored as Vercel `CRON_SECRET`.
5. Apply the reviewed database migration. The migration enables `pg_cron` and `pg_net`, defines the restricted Vault-backed invoker, and installs the named one-minute job without embedding either environment-specific value.
6. Open **Integrations → Cron** and confirm the migrated OncoReady job is active with schedule `* * * * *`.
7. Confirm the latest Cron run and `pg_net` response are successful, the Vercel function log shows the tick request, and neither system displays the authorization value.
8. Confirm an unauthenticated request returns `401`, then run the repository's authenticated preflight without printing the secret.
9. Trigger overlapping/manual checks only while all external-action switches are disabled; confirm the PostgreSQL advisory lock allows one scheduler authority and no duplicate provider action.

Supabase documents hosted `pg_cron` + `pg_net` scheduling and recommends Vault for the authentication value: [Scheduling functions](https://supabase.com/docs/guides/functions/schedule-functions). Cron job/run state is visible in the dashboard and the `cron.job_run_details` table: [Supabase Cron](https://supabase.com/docs/guides/cron).

Cron timing is not an exact real-time guarantee. Workflow safety comes from PostgreSQL advisory locking, durable claims, leases, and idempotency—not from assuming only one HTTP invocation. A missing Vault value, paused project, stale origin, disabled job, non-successful `pg_net` response, or unauthenticated tick is a failed preflight.

## 4. Twilio SMS and phone number

### Account choice and carrier registration

Create or select a Twilio project dedicated to this controlled use. The project requires:

- one SMS-capable Twilio number;
- one Messaging Service with that number in its sender pool (preferred), or the number configured directly;
- the same one consented, team-controlled E.164 recipient for SMS and voice;
- inbound-message and delivery-status webhooks;
- valid account credentials stored only server-side.

Do not assume a free trial is sufficient. Current Twilio trial accounts expire after 30 days, restrict traffic to verified recipients, and restrict custom SMS bodies; the finals flow uses approved custom minimal-detail copy. See [Twilio trial restrictions](https://www.twilio.com/docs/usage/trials).

For a US recipient, start sender registration now:

- a US local 10DLC sender requires A2P 10DLC registration, including for individuals/hobbyists;
- a toll-free sender requires toll-free verification;
- retain evidence that the single recipient explicitly consented and knows how to opt out;
- Twilio currently warns that A2P campaign review may take 10–15 days: [A2P 10DLC quickstart](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc/quickstart).

### Messaging Service

1. In Twilio Console, open **Messaging → Services** and create a Messaging Service.
2. Add the SMS-capable Twilio number to its Sender Pool.
3. Keep STOP/HELP handling enabled.
4. Configure the service/sender to POST inbound messages to:

```text
https://<ONCOREADY_PUBLIC_ORIGIN>/api/v1/callbacks/twilio/inbound-message
```

5. Configure delivery status callbacks to POST to:

```text
https://<ONCOREADY_PUBLIC_ORIGIN>/api/v1/callbacks/twilio/message-status
```

Twilio describes Messaging Service sender/integration configuration here: [Messaging Services](https://www.twilio.com/docs/messaging/services). Webhook handlers must validate `X-Twilio-Signature` with Twilio's official library using the exact external URL and unmodified request data: [Twilio webhook request validation](https://www.twilio.com/docs/messaging/guides/webhook-request).

### Twilio server environment

| Variable | Secret | Value |
|---|---:|---|
| `TWILIO_ACCOUNT_SID` | No | Account SID beginning with `AC`. |
| `TWILIO_AUTH_TOKEN` | Yes | Current primary auth token used for signed-webhook validation. |
| `TWILIO_MESSAGING_SERVICE_SID` | No | Preferred sender, beginning with `MG`. |
| `TWILIO_FROM_NUMBER` | No | Alternative E.164 sender if a Messaging Service is not used. Do not configure both without confirming implementation precedence. |
| `FINALS_ALLOWLISTED_PHONE` | Sensitive | The one consented team-controlled E.164 recipient. |
| `TWILIO_SMS_ENABLED` | No | Keep `false` until the enablement gate. |

Never place the recipient number in fixtures, screenshots, logs, or committed configuration. The UI uses the alias `finals_allowlisted_phone`.

### Approved SMS behavior

Prepare/review minimal-detail copy supporting only:

```text
1 ready
2 need a ride
3 call me
4 scheduling help
9 repeat
STOP / HELP
```

The message must identify OncoReady appropriately, include consent/opt-out handling, avoid diagnosis or clinical advice, and reveal no unnecessary treatment/clinical detail on a lock screen.

## 5. ElevenLabs voice through Twilio

### Account and phone linkage

1. Create/select an ElevenLabs account with ElevenAgents access.
2. In ElevenAgents, create a narrowly scoped agent for the approved readiness script.
3. Import the purchased Twilio phone number under **Phone Numbers**, then link it to the agent. ElevenLabs documents that purchased Twilio numbers support inbound/outbound use, while verified caller IDs are outbound-only: [Twilio native integration](https://elevenlabs.io/docs/eleven-agents/phone-numbers/twilio-integration/native-integration).
4. Record the ElevenLabs agent ID and the imported ElevenLabs phone-number ID.
5. Create a post-call webhook with HMAC authentication and store the generated secret immediately.
6. Configure HTTPS callbacks to the deployed origin:

```text
https://<ONCOREADY_PUBLIC_ORIGIN>/api/v1/callbacks/elevenlabs/post-call
https://<ONCOREADY_PUBLIC_ORIGIN>/api/v1/callbacks/elevenlabs/failure
```

7. Enable webhook retries if supported for the selected event, but rely on application idempotency because providers may redeliver the same event.

ElevenLabs requires validation of the `ElevenLabs-Signature` HMAC against the raw request body and recommends combining signature verification with its published egress-IP allowlist: [ElevenLabs post-call webhooks](https://elevenlabs.io/docs/eleven-agents/workflows/post-call-webhooks).

### Voice server environment

| Variable | Secret | Value |
|---|---:|---|
| `ELEVENLABS_API_KEY` | Yes | Dedicated API key for the controlled agent. |
| `ELEVENLABS_AGENT_ID` | No | Bounded agent ID. |
| `ELEVENLABS_PHONE_NUMBER_ID` | No | ElevenLabs ID for the imported/linked Twilio number. |
| `ELEVENLABS_WEBHOOK_SECRET` | Yes | HMAC secret generated for the webhook. |
| `ELEVENLABS_VOICE_ENABLED` | No | Keep `false` until the enablement gate. |

### Agent behavior to configure

The call must begin with the approved disclosure and may only:

- confirm the intended recipient using the approved script;
- repeat or slow the appointment time;
- collect one structured outcome: `ready`, `ride_help`, `scheduling_help`, `human_callback`, or `unsupported_or_uncertain`;
- route symptoms, uncertainty, or unsupported requests to a human.

The agent must never diagnose, triage, prescribe, clear treatment, cancel/reschedule treatment, or close a clinical barrier. Disable recording where possible. Configure deletion so audio and transcripts are not retained by default, and do not send transcripts to OncoReady.

## 6. CareLink Partner Dispatch

No third-party CareLink account, API key, vendor sandbox, or external CareLink webhook is required.

CareLink Partner Dispatch is the product's own persisted coordinator workflow for a configured local-vendor scenario. Prepare the non-secret operating facts the implementation will encode:

- coordinator display name/alias;
- fixed provider ID/alias;
- illustrative pickup and destination aliases (not a real patient's home address);
- treatment arrival window and notice cutoff;
- outbound and return plan;
- mobility/escort requirement;
- eligibility/funding path;
- illustrative driver and vehicle aliases for assignment/recovery;
- one primary provider failure and one backup assignment used in rehearsal.

Uber Health and Lyft Concierge require **no setup or credentials**. They remain disabled planned adapters and must make no network request.

## 7. FHIR validator

Install a current Java runtime now. The build will pin a specific HL7 validator CLI version and artifact hash before producing final evidence; do not substitute an unrecorded “latest” validator during freeze.

The official validator supports FHIR R4 and is available from [HL7's validator page](https://hl7.org/fhir/validator/). Once the pinned JAR/version lands in verification tooling, use the repository command rather than an ad hoc command. The resulting report must be bound to the exact generated FHIR bundle hash. A syntactically valid bundle is not evidence of Epic/Ochsner connectivity or writeback.

## 8. Offline ML toolchain

No cloud ML account or external model API is required. Install Python 3.12. The pinned toolchain is `lightgbm==4.6.0`, `numpy==2.2.6`, `scikit-learn==1.6.1`, `shap==0.47.2`, and `pytest==8.3.5`. On macOS, install OpenMP first with `brew install libomp`.

After `ml/requirements.txt` lands:

```bash
python3.12 -m venv .venv-ml
.venv-ml/bin/pip install -r ml/requirements.txt
.venv-ml/bin/python ml/train.py
.venv-ml/bin/python -m pytest -q tests/ml
```

Generated artifacts live under `artifacts/ml/supportive-outreach-v1/`.

Do not upload a model or pickle into the runtime. Only the reviewed immutable JSON/artifact set produced by the offline pipeline may be loaded by TypeScript. Missing, stale, malformed, or parity-failing artifacts must result in `Score unavailable` while deterministic outreach continues.

## 9. Local tools

Prepare:

```text
Git
Node.js and npm (use the repository's declared version when added)
Docker Desktop
Python 3.12
Java runtime for the pinned HL7 FHIR validator
```

The Supabase local stack requires Docker. Provider callbacks require a public HTTPS deployment; a temporary tunnel may be used only for local diagnostics, never as the final canonical callback origin.

## 10. Safe enablement sequence

Do not turn on all providers at once.

1. Deploy with `EXTERNAL_ACTIONS_ENABLED=false`, `TWILIO_SMS_ENABLED=false`, and `ELEVENLABS_VOICE_ENABLED=false`.
2. Apply reviewed migrations to the dedicated Supabase DEV/finals project.
3. Run reset/seed and prove reset created zero outbox sends or external actions.
4. Verify canonical origin, CORS allowlist, scenario token, active Supabase Free project, database size, Vault entries, Supabase Cron cadence/latest response, tick authentication, and database pool behavior.
5. Verify invalid Twilio and ElevenLabs signatures return `401`; verify duplicate/out-of-order callbacks are safe.
6. Enable only Twilio SMS and send to the one allowlisted, consented phone.
7. Confirm queued/sent/delivered and inbound reply events from authentic callbacks.
8. Disable SMS, rehearse STOP/undelivered recovery, then re-enable only when consent state is correct.
9. Enable only ElevenLabs voice and complete one bounded call to the same phone.
10. Confirm authentic post-call/failure evidence and that no transcript/audio entered the application database or logs.
11. Enable the global external-action switch only for the controlled rehearsal window.
12. Run five consecutive rehearsals, including one provider/network failure, before final review.

If any provider state is uncertain, leave the dependency unresolved and reconcile it. Never resend simply because a lease expired, and never convert a missing callback into success.

## 11. What to hand back to the orchestrator

Send these **non-secret** values in chat when ready:

```text
Vercel project/team name:
Canonical HTTPS origin:
Vercel plan is Hobby and Vercel Cron is absent: yes/no
Supabase project ref:
Supabase region:
Supabase plan is Free: yes/no
Supabase project active and below 500 MB: yes/no
Supabase Vault tick URL stored: yes/no
Supabase Vault shared tick secret stored: yes/no
Supabase one-minute Cron job active: yes/no
Latest Supabase Cron/pg_net invocation successful: yes/no
Twilio account ready: yes/no
Twilio sender type: Messaging Service / number
Twilio Messaging Service SID (non-secret, if used):
Twilio sender number capability confirmed: SMS + voice / other
Consented allowlisted recipient configured in secret manager: yes/no
US sender registration/verification state:
ElevenLabs account/agent ready: yes/no
ElevenLabs agent ID (non-secret):
ElevenLabs phone-number ID (non-secret):
ElevenLabs HMAC webhook secret stored in secret manager: yes/no
Docker Desktop ready: yes/no
Python 3.12 ready: yes/no
Java ready: yes/no
```

Do not send `DATABASE_URL`, database passwords, access tokens, auth tokens, API keys, webhook secrets, scenario tokens, cron secrets, or the allowlisted phone number in chat. Tell the orchestrator only that each secret has been stored and in which approved environment it is available.

## 12. External blockers to report immediately

Report any of these as soon as discovered:

- Vercel Hobby deployment or protected tick endpoint is unavailable;
- Supabase transaction-pooler URI is unavailable or the project is not isolated from real data;
- Supabase Free cannot enable `pg_cron`, `pg_net`, or Vault, the project is paused, the database approaches 500 MB, or the migrated one-minute job cannot reach the canonical tick endpoint;
- Twilio sender registration/verification will miss the rehearsal date;
- the recipient cannot provide explicit consent or cannot be dedicated to controlled testing;
- Twilio cannot support both the required SMS callbacks and ElevenLabs-linked calling on the selected number;
- ElevenLabs cannot provide an HMAC-authenticated post-call/failure event compatible with the governed contract;
- a provider requires broad credentials, arbitrary recipient/destination input, transcript retention, or disabled TLS/signature validation;
- the canonical callback origin changes after provider configuration.

In every case, keep the affected provider switch disabled. The deterministic/manual recovery journey remains available, but it must be labeled truthfully and cannot be presented as live provider success.
