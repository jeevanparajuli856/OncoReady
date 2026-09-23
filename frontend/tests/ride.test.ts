import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildCheckpoint,
  deriveCaregiverProjection,
  getCurrentPlanVersion,
  HISTORICAL_RIDE_EVENTS,
  isContinuityPlanConfirmed,
  isCurrentTransportPlanComplete,
  PREPARED_REPLY,
  workflowReducer,
} from '../src/state/workflowState';
import type { WorkflowState } from '../src/types';

const RECOVERED_LOGISTICS = {
  pickupTime: 'Sep 25, 8:15–8:30 AM CT',
  plannedArrival: 'Sep 25, 9:15 AM CT',
  returnArrangement: 'Return coordination 1:00–4:00 PM CT',
  logisticsContact: 'CareLink Dispatch • (504) 555-0124',
  backupOwner: 'Ana Hernandez',
};

const openWork = (): WorkflowState => {
  let state = buildCheckpoint('SPLIT_WORK');
  state = workflowReducer(state, { type: 'ACKNOWLEDGE_CLINICAL_TASK' });
  state = workflowReducer(state, {
    type: 'RECORD_CLINICAL_DISPOSITION',
    payload: { disposition: 'Human contact completed; no blocking follow-up recorded.', followUpBlocking: false },
  });
  return workflowReducer(state, { type: 'SET_PERSPECTIVE', payload: 'CARE_NAVIGATOR' });
};

const throughPrimaryFailure = (): WorkflowState => {
  let state = openWork();
  state = workflowReducer(state, { type: 'REQUEST_CURRENT_RIDE' });
  state = workflowReducer(state, { type: 'ASSIGN_PRIMARY_RIDE' });
  return workflowReducer(state, { type: 'FAIL_PRIMARY_RIDE' });
};

const recovered = (): WorkflowState => {
  let state = throughPrimaryFailure();
  state = workflowReducer(state, { type: 'ASSIGN_BACKUP_RIDE' });
  return workflowReducer(state, { type: 'SAVE_RECOVERED_RIDE', payload: RECOVERED_LOGISTICS });
};

describe('RIDE-001 current recovery and acknowledgment', () => {
  beforeEach(() => localStorage.clear());

  it('requests, fails the primary, and recovers with append-only provider history', () => {
    const state = recovered();

    expect(state.ride.currentTripId).toBe('carelink-current-2026-09-25');
    expect(state.ride.currentStatus).toBe('RECOVERED');
    expect(state.ride.assignments.map(({ providerName, status }) => [providerName, status])).toEqual([
      ['Crescent Lantern Medical Rides', 'FAILED'],
      ['Magnolia Wayfare Transport', 'CURRENT'],
    ]);
    expect(getCurrentPlanVersion(state)).toBe(2);
    expect(isCurrentTransportPlanComplete(state)).toBe(true);
    expect(state.auditEvents.some((event) => event.id === 'EVT-RIDE-PRIMARY-FAILED')).toBe(true);
    expect(state.auditEvents.some((event) => event.id === 'EVT-RIDE-RECOVERED-V2')).toBe(true);
  });

  it('rejects incomplete logistics and no-option never manufactures success', () => {
    let state = throughPrimaryFailure();
    state = workflowReducer(state, { type: 'ASSIGN_BACKUP_RIDE' });
    const incomplete = workflowReducer(state, {
      type: 'SAVE_RECOVERED_RIDE',
      payload: { ...RECOVERED_LOGISTICS, logisticsContact: '' },
    });
    expect(incomplete).toBe(state);
    expect(isCurrentTransportPlanComplete(incomplete)).toBe(false);

    const noOption = workflowReducer(throughPrimaryFailure(), { type: 'MARK_NO_RIDE_OPTION' });
    expect(noOption.ride.currentStatus).toBe('NO_OPTION');
    expect(noOption.overallReadiness).toBe('AT_RISK');
    expect(workflowReducer(noOption, { type: 'ACKNOWLEDGE_PATIENT_PLAN' })).toBe(noOption);
  });

  it('keeps caregiver seen separate and invalidates both exact-version records after a later failure', () => {
    let state = recovered();
    const version = getCurrentPlanVersion(state);
    state = workflowReducer(state, { type: 'SET_PERSPECTIVE', payload: 'CAREGIVER' });
    state = workflowReducer(state, { type: 'MARK_CURRENT_LOGISTICS_SEEN' });
    expect(state.ride.caregiverSeen?.planVersion).toBe(version);
    expect(isContinuityPlanConfirmed(state)).toBe(false);

    state = workflowReducer(state, { type: 'SET_PERSPECTIVE', payload: 'PATIENT' });
    state = workflowReducer(state, { type: 'ACKNOWLEDGE_PATIENT_PLAN' });
    expect(isContinuityPlanConfirmed(state)).toBe(true);

    state = workflowReducer(state, { type: 'SET_PERSPECTIVE', payload: 'CARE_NAVIGATOR' });
    state = workflowReducer(state, { type: 'FAIL_CURRENT_RIDE' });
    expect(state.patientAcknowledgedPlanVersion).toBeNull();
    expect(state.ride.caregiverSeen).toBeNull();
    expect(state.ride.assignments.at(-1)?.status).toBe('FAILED');
    expect(isContinuityPlanConfirmed(state)).toBe(false);
  });

  it('projects only permitted current logistics to Ana', () => {
    let state = recovered();
    state = workflowReducer(state, { type: 'SET_PERSPECTIVE', payload: 'CAREGIVER' });
    state = workflowReducer(state, { type: 'MARK_CURRENT_LOGISTICS_SEEN' });
    const projection = deriveCaregiverProjection(state);
    const serialized = JSON.stringify(projection);

    expect(projection.currentPlan?.pickupTime).toBe(RECOVERED_LOGISTICS.pickupTime);
    expect(projection.currentPlan?.returnArrangement).toBe(RECOVERED_LOGISTICS.returnArrangement);
    expect(projection.seen?.actor).toBe('Ana Hernandez');
    expect(serialized).not.toContain(PREPARED_REPLY);
    expect(serialized).not.toContain(state.appointment.treatmentName);
    expect(serialized).not.toContain('Crescent Lantern Medical Rides');
  });
});

describe('RIDE-001 isolated historical replay', () => {
  it('advances original events and rejects stale callbacks without changing current workflow evidence', () => {
    const state = recovered();
    const protectedCurrentState = {
      tasks: state.tasks,
      auditEvents: state.auditEvents,
      patientAcknowledgedPlanVersion: state.patientAcknowledgedPlanVersion,
      assignments: state.ride.assignments,
    };

    let replaying = workflowReducer(state, { type: 'PLAY_HISTORICAL_RIDE' });
    const session = replaying.ride.replay.sessionToken;
    expect(replaying.ride.replay.tripId).toBe('carelink-prior-001');
    expect(replaying.ride.replay.visibleEventCount).toBe(1);

    replaying = workflowReducer(replaying, {
      type: 'ADVANCE_HISTORICAL_RIDE',
      payload: { tripId: 'carelink-prior-001', sessionToken: session },
    });
    const paused = workflowReducer(replaying, { type: 'PAUSE_HISTORICAL_RIDE' });
    expect(paused.ride.replay.status).toBe('PAUSED');
    expect(workflowReducer(paused, {
      type: 'ADVANCE_HISTORICAL_RIDE',
      payload: { tripId: 'carelink-prior-001', sessionToken: session },
    })).toBe(paused);

    let completed = workflowReducer(paused, { type: 'PLAY_HISTORICAL_RIDE' });
    const resumedSession = completed.ride.replay.sessionToken;
    for (let index = completed.ride.replay.visibleEventCount; index < HISTORICAL_RIDE_EVENTS.length; index += 1) {
      completed = workflowReducer(completed, {
        type: 'ADVANCE_HISTORICAL_RIDE',
        payload: { tripId: 'carelink-prior-001', sessionToken: resumedSession },
      });
    }

    expect(completed.ride.replay.status).toBe('COMPLETE');
    expect(HISTORICAL_RIDE_EVENTS.map((event) => event.timestamp)).toEqual([
      'Sep 11, 2026 • 7:42 AM CT',
      'Sep 11, 2026 • 7:43 AM CT',
      'Sep 11, 2026 • 7:47 AM CT',
      'Sep 11, 2026 • 8:02 AM CT',
      'Sep 11, 2026 • 8:18 AM CT',
      'Sep 11, 2026 • 9:06 AM CT',
    ]);
    expect({
      tasks: completed.tasks,
      auditEvents: completed.auditEvents,
      patientAcknowledgedPlanVersion: completed.patientAcknowledgedPlanVersion,
      assignments: completed.ride.assignments,
    }).toEqual(protectedCurrentState);

    const exited = workflowReducer(completed, { type: 'EXIT_HISTORICAL_RIDE' });
    expect(exited.ride.replay.status).toBe('IDLE');
    expect(exited.ride.replay.visibleEventCount).toBe(0);
  });
});
