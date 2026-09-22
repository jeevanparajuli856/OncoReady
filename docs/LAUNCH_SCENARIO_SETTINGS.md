# Two-day demonstration scenario settings

**Active revision:** `camila-demo-v2`, September 21, 2026. Supersedes the prior production-style workflow, large-model acceptance gates, learned scheduler and four-day build calendar. These are synthetic presentation settings, not medical policy or real provider contracts.

## Clock and source

- Center timezone: America/Chicago.
- Story treatment: September 25, 2026 at 10:00; arrival 09:30. This is a synthetic OncoReady appointment unless actual captured Epic evidence independently establishes it.
- Prepared checkpoints: T−7 September 18, T−2 September 23, T−1 September 24. Keep dated scenario features consistent; the patient reply follows the final score.
- Epic resource dates and capture timestamp remain unchanged. The UI must distinguish the synthetic appointment from source facts.
- Live SMS/call use actual wall-clock time. Advancing a checkpoint or resetting the story never triggers a real send.
- Private checkpoints: start, context/insights, split work, failed ride, recovered plan, final confirmation. A checkpoint describes prepared scene state, not proof that a real-world event happened.

## Cast and ownership

| Persona | Visible responsibility |
|---|---|
| Camila Lopez | Reports concern and ride barrier; acknowledges the current logistics plan |
| Ana Hernandez | Sees only permitted transportation information |
| Sarah Jenkins, RN | Acknowledges clinical-contact task, records contact and human disposition |
| Marcus Vance, MSW | Owns transport recovery and current plan |
| CareLink Dispatch | Assigns fictional provider and records prepared failure/recovery |

Camila is the presentation alias unless the actual retrieved Epic record establishes that identity. Preserve original source identity/provenance in the captured evidence. Benson Cancer Center is a scenario label, not a customer or integration claim.

Patient reply is exactly: “My ride was cancelled—and I’m not feeling well today.” Staff sees the original words. Transportation receives the ride barrier and logistics; caregiver does not receive the clinical concern.

No automated symptom interpretation, advice, severity score or medical clearance. Confirmation requires a human clinical disposition with no remaining blocking follow-up, complete current transport plan and Camila's acknowledgment of that plan version. Attendance stays unknown.

## Prepared automatic-outreach history

Use a message thread and timeline from the same versioned fixture, not disconnected decorative rows. Suggested original scenario timestamps:

| Scenario time | Historical event | Visible content |
|---|---|---|
| September 23, 10:05 | Automatic check-in scheduled | SMS due at 10:06; prepared outreach rule noted in evidence |
| September 23, 10:06 | SMS sent | “Is your transportation plan ready for your upcoming appointment?” |
| September 23, 10:18 | Reply received | “I think my ride is set. I’ll confirm tomorrow.” |
| September 23, 10:19 | Follow-up scheduled | Next check-in September 24 at 10:06 |
| September 24, 10:06 | Follow-up SMS sent | “Please confirm your ride plan or let us know if you need help.” |
| September 24, 10:12 | Reply received | “My ride was cancelled—and I’m not feeling well today.” |
| September 24, 10:12 | Automated follow-up cancelled; human work opened | Separate nurse and transportation ownership |

These are prepared scenario events, not proof of prior real sends. The actual one-off SMS/call has separate provider provenance. Opening a row reveals message/reply text and original time; jumping to a checkpoint reveals only history available by that time. Use the final reply as FLOW's existing trigger, not a second duplicate submission.

## Previous CareLink dispatch replay

Use a separate synthetic prior visit on September 11, 2026 with trip identity `carelink-prior-001`. It is distinct from the September 25 recovery trip. A short playback (roughly 15–25 seconds) can show:

request submitted → dispatcher accepted → driver assigned → driver arriving → pickup confirmed → trip completed.

Show original scenario event times, assignment and an updating event feed; any map movement is an illustrative fixture. Provide pause/restart without triggering external calls. The source/detail treatment says this is a previous scenario dispatch replay, not live GPS or a real ride. Historical completion cannot set the current plan's acknowledgment or confirmation.

## CareLink prepared sequence

1. Open the ride request and assign fictional CareLink Partner A.
2. Record primary-provider failure; preserve it in the timeline and reopen the blocker.
3. Marcus selects fictional CareLink Partner B and records the recovery.
4. Show pickup 08:15–08:30, planned arrival 09:15, arrival deadline 09:30.
5. Show return coordination 13:00–16:00, CareLink Dispatch as contact and named backup owner.
6. Ana marks the permitted current logistics plan as seen; Camila reviews pickup, return and contact together and acknowledges the current plan. Record these as separate actor/plan-version events.
7. Confirm continuity only after nurse disposition also exists.

These are logistics illustrations, not real driver assignments, funding checks, travel estimates or medically determined discharge times. No dispatch network request occurs. Missing backup/return details or a later failure prevents confirmation.

## Synthetic ML notebook

- Suggested small dataset: roughly 2,000 fictional patient/encounter records with longitudinal checkpoint features as needed; size is a compute budget suggestion, not an acceptance gate.
- Seed: `20260921`. Document the generator, feature meanings and target rules.
- Demonstration target: a synthetic unresolved practical-readiness blocker at the treatment horizon; not clinical deterioration, prognosis or observed attendance.
- Candidate features: known transport status, prior response delay, previous missed check-ins, days until the scenario appointment and known support availability. Patient identity and future replies/outcomes are excluded.
- Use patient-separated train/test partitions and a simple baseline. Train one small CPU-friendly classifier in the notebook; no mandated library/model family.
- Report real held-out metrics, counts, baseline comparison and a suitable confusion matrix/plot. Discuss limits, synthetic construction and possible leakage; no minimum accuracy or commercial/clinical claim.
- Score the three scenario checkpoints through that model and export actual values/factors. If the learned trajectory differs from the expected story, explain it or revise transparent input assumptions; never hand-edit scores or cherry-pick a reported holdout.
- Notebook outputs, exported JSON and UI values must match. Prediction labels describe synthetic operational readiness, not calibrated clinical risk.
- Explain model capability with an example of feature changes affecting the output. Label such sensitivity as a model demonstration, not a causal treatment effect.
- No required SHAP pipeline, calibration gate, subgroup fairness proof, huge cohort, model deployment or learned SMS/call policy.

## Approved impact scene details

- Graph: open at Treatment at risk, show each affected node update after the corresponding human action, and finish at Continuity plan confirmed only when existing closure rules pass. This is workflow state, not an invented fall in ML risk.
- Open tasks: display owner, next action, due time and waiting status from one fixture. For the synthetic 10:12 reply, a proposed nurse contact due time is 10:42 and transport recovery due time 11:12; these are presentation settings, not medical deadlines. Timeline and task cards use the same values.
- Why flagged?: show up to three exported factors/values for the selected checkpoint. Missing factors remain absent. Suggested supportive follow-up is identified as a workflow rule, not a learned sending decision.
- What-if: score the baseline and a transportation-available variant through the same fitted notebook model, holding other inputs fixed. Export both rows, actual scores/factors and model version. Do not promise that the score decreases; display the computed result. This comparison never completes a ride or triggers outreach.
- Patient finish: current pickup/arrival, return arrangement, logistics contact and caregiver seen/pending state are presented together with Camila's acknowledgment. Caregiver seen is a separate local event invalidated on plan change; it is not medical clearance or a replacement for Camila's acknowledgment.
- Closing receipt: derive “barriers addressed” from distinct currently resolved work items, “backup transportation arranged” from the current complete backup plan and “patient acknowledged” from the current plan version. Each opens its source event. Pending/reopened work changes the receipt immediately; no hard-coded two-barrier success.
- Verify all six in the two recording rehearsals with the approved visual system and no new page family. Actual/provider, prepared/historical and what-if sources retain their distinct meanings.

## One-shot communication

One real SMS and one short call are required. Manual triggering is accepted. Prepare the voice audio in advance; the live element is the actual telephone connection.

Reviewed draft SMS: “OncoReady: Is your transportation plan ready for your upcoming appointment? Open your workspace to confirm your plan or request help. Reply STOP to stop text outreach.”

Reviewed draft voice: “This is an OncoReady transportation check-in. You can confirm your plan in your workspace or ask your care team to contact you.”

Use English with a consenting test participant. Do not include diagnosis, clinical concern, medications, source records, credentials or actual patient details. Keep recipient, scripts, consent, sender and provider credentials server-configured.

Target 20–40 seconds of call content; hard cap 60 seconds. One arm permits at most one SMS and one call, each with its own persistent action key, within a finite actual-time window. Confirm an explicit bounded cost cap before arming. No automatic resend or re-arm. Checkpoints, reloads and reset cannot erase limits or provider evidence.

See [OUTREACH_TEST_DELIVERY](./operations/OUTREACH_TEST_DELIVERY.md) for setup/evidence and [DEMO_RUNBOOK](./operations/DEMO_RUNBOOK.md) for presentation order.

## Timing

Complete the scope in two working days using [the sprint plan](./LAUNCH_SPRINT_PLAN.md). September 25 is the prior event target; the exact slot remains unverified. Protect the final two hours for recording/rehearsal. Ordinary rehearsals disable external sends; real acceptance and the live presentation are separately armed.
