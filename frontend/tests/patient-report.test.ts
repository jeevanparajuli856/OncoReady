import { describe, expect, it } from 'vitest';
import {
  buildCheckpoint,
  getCurrentPlanVersion,
  isContinuityPlanConfirmed,
  parseSavedWorkflowState,
  workflowReducer,
} from '../src/state/workflowState';
import type { Perspective, WorkflowState } from '../src/types';

const as = (state: WorkflowState, perspective: Perspective) => workflowReducer(state, { type: 'SET_PERSPECTIVE', payload: perspective });
const report = (state: WorkflowState, transportNotes: string, clinicalConcernText: string) =>
  workflowReducer(state, { type: 'REPORT_NEW_PROBLEM', payload: { transportNotes, clinicalConcernText } });
const survivesReload = (state: WorkflowState) => parseSavedWorkflowState(JSON.stringify(state)) !== null;

const nurseCloses = (state: WorkflowState) => {
  let next = as(state, 'CARE_TEAM');
  next = workflowReducer(next, { type: 'ACKNOWLEDGE_CLINICAL_TASK' });
  return workflowReducer(next, { type: 'RECORD_CLINICAL_DISPOSITION', payload: { disposition: 'Called Camila; no blocking follow-up.', followUpBlocking: false } });
};
const navigatorRecovers = (state: WorkflowState) => {
  let next = as(state, 'CARE_NAVIGATOR');
  next = workflowReducer(next, { type: 'ASSIGN_BACKUP_RIDE' });
  return workflowReducer(next, { type: 'SAVE_RECOVERED_RIDE', payload: { pickupTime: 'Sep 25, 8:20 AM CT', plannedArrival: 'Sep 25, 9:15 AM CT', returnArrangement: 'Same provider after infusion', logisticsContact: 'Marcus Vance, MSW', backupOwner: 'Marcus Vance, MSW' } });
};
const patientConfirms = (state: WorkflowState) => workflowReducer(as(state, 'PATIENT'), { type: 'ACKNOWLEDGE_PATIENT_PLAN' });

describe('PATIENT-001 report a new problem', () => {
  it('only accepts a report from the patient after the readiness check, with some text', () => {
    const confirmed = buildCheckpoint('FINAL_CONFIRMATION');
    expect(report(as(confirmed, 'CARE_TEAM'), '', 'Fever tonight')).toEqual(as(confirmed, 'CARE_TEAM'));
    const beforeCheck = as(buildCheckpoint('START'), 'PATIENT');
    expect(report(beforeCheck, '', 'Fever tonight')).toBe(beforeCheck);
    const patient = as(confirmed, 'PATIENT');
    expect(report(patient, '  ', '  ')).toBe(patient);
  });

  it('reopens nursing on a new symptom and needs a new disposition and patient confirmation', () => {
    let state = as(buildCheckpoint('FINAL_CONFIRMATION'), 'PATIENT');
    expect(isContinuityPlanConfirmed(state)).toBe(true);
    const version = getCurrentPlanVersion(state);

    state = report(state, '', 'I have a fever of 101 tonight.');
    const clinical = state.tasks.find((task) => task.type === 'CLINICAL_REVIEW')!;
    expect(clinical.status).toBe('ASSIGNED');
    expect(clinical.clinicalDetails).toEqual({ verbatimReport: 'I have a fever of 101 tonight.', clearanceState: 'PENDING_REVIEW', reportedAt: 'Sep 24, 11:20 AM CT' });
    expect(state.overallReadiness).toBe('AT_RISK');
    expect(isContinuityPlanConfirmed(state)).toBe(false);
    expect(getCurrentPlanVersion(state)).toBe(version);
    expect(state.ride.caregiverSeen).not.toBeNull();

    state = nurseCloses(state);
    expect(isContinuityPlanConfirmed(state)).toBe(false);
    state = patientConfirms(state);
    expect(isContinuityPlanConfirmed(state)).toBe(true);
    expect(state.overallReadiness).toBe('PLAN_CONFIRMED');
    expect(state.auditEvents.map((event) => event.id)).toEqual(expect.arrayContaining([
      'EVT-PATIENT-REPORT-2', 'EVT-PATIENT-REPORT-2-CLINICAL', 'EVT-FLOW-CLINICAL-OWNED-R2', 'EVT-FLOW-DISPOSITION-NONBLOCKING-R2', `EVT-FLOW-PATIENT-ACK-V${version}-R2`,
    ]));
    expect(survivesReload(state)).toBe(true);
  });

  it('fails a recovered ride on a ride report and recovers it with a new backup record', () => {
    let state = as(buildCheckpoint('FINAL_CONFIRMATION'), 'PATIENT');
    const version = getCurrentPlanVersion(state);

    state = report(state, 'The backup van cancelled for tomorrow.', '');
    expect(getCurrentPlanVersion(state)).toBe(version + 1);
    expect(state.ride.currentStatus).toBe('PRIMARY_FAILED');
    expect(state.ride.caregiverSeen).toBeNull();
    expect(state.tasks.find((task) => task.type === 'CLINICAL_REVIEW')!.status).toBe('RESOLVED');
    expect(state.auditEvents.find((event) => event.id === 'EVT-PATIENT-REPORT-2-RIDE')?.description).toContain('The backup van cancelled for tomorrow.');

    state = navigatorRecovers(state);
    expect(state.ride.assignments.map((assignment) => assignment.id)).toContain(`RIDE-ASG-BACKUP-V${version + 1}`);
    state = patientConfirms(state);
    expect(isContinuityPlanConfirmed(state)).toBe(true);
    expect(survivesReload(state)).toBe(true);
  });

  it('adds a ride update to open ride work without failing a plan that is not recovered yet', () => {
    let state = as(buildCheckpoint('SPLIT_WORK'), 'PATIENT');
    const before = state.ride.currentStatus;
    state = report(state, 'I can only leave after 8 AM.', '');
    expect(state.ride.currentStatus).toBe(before);
    expect(state.tasks.find((task) => task.type === 'TRANSPORTATION_NAVIGATION')!.transportDetails).toMatchObject({ patientUpdate: 'I can only leave after 8 AM.', patientUpdateAt: 'Sep 24, 11:20 AM CT' });
    expect(state.auditEvents.find((event) => event.id === 'EVT-PATIENT-REPORT-2-RIDE')?.action).toBe('Ride update sent to navigation');
    expect(survivesReload(state)).toBe(true);
  });

  it('handles a second follow-up report with fresh ids', () => {
    let state = as(buildCheckpoint('FINAL_CONFIRMATION'), 'PATIENT');
    state = report(state, '', 'Nausea this morning.');
    state = patientConfirms(nurseCloses(state));
    state = report(as(state, 'PATIENT'), '', 'Numbness in my fingers.');
    expect(state.auditEvents.some((event) => event.id === 'EVT-PATIENT-REPORT-3-CLINICAL')).toBe(true);
    state = patientConfirms(nurseCloses(state));
    expect(isContinuityPlanConfirmed(state)).toBe(true);
    expect(survivesReload(state)).toBe(true);
  });
});
