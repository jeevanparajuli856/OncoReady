import { beforeEach, describe, expect, it } from 'vitest';
import { buildCheckpoint, getCurrentPlanVersion, INITIAL_STATE, isContinuityPlanConfirmed, loadSavedWorkflowState, PREPARED_REPLY, workflowReducer } from '../src/state/workflowState';
import type { WorkflowState } from '../src/types';

const fresh = (): WorkflowState => structuredClone(INITIAL_STATE);
const split = () => workflowReducer(fresh(), { type: 'SUBMIT_READINESS', payload: { transportNotes: 'Ride cancelled; transportation recovery needed.', clinicalConcernText: PREPARED_REPLY } });

describe('FLOW-001 shared Camila scenario', () => {
  beforeEach(() => localStorage.clear());

  it('opens the exact split work once with stable ownership and operational targets', () => {
    const first = split();
    const duplicate = workflowReducer(first, { type: 'SUBMIT_READINESS', payload: { transportNotes: 'Ride cancelled; transportation recovery needed.', clinicalConcernText: PREPARED_REPLY } });
    expect(first.readinessSubmission.clinicalConcernText).toBe(PREPARED_REPLY);
    expect(first.tasks.map((task) => [task.id, task.owner.name, task.dueTime])).toEqual([
      ['TSK-CLN-CAMILA-01', 'Sarah Jenkins, RN', 'Sep 24, 10:42 AM CT'],
      ['TSK-TRN-CAMILA-01', 'Marcus Vance, MSW', 'Sep 24, 11:12 AM CT'],
    ]);
    expect(duplicate).toBe(first);
  });

  it('keeps ownership acknowledgment distinct and enforces closure blockers', () => {
    let state = split();
    state = workflowReducer(state, { type: 'ACKNOWLEDGE_CLINICAL_TASK' });
    expect(state.tasks[0].status).toBe('ACKNOWLEDGED');
    state = workflowReducer(state, { type: 'CONFIRM_TRANSPORTATION' });
    expect(isContinuityPlanConfirmed(state)).toBe(false);
    state = workflowReducer(state, { type: 'RECORD_CLINICAL_DISPOSITION', payload: { disposition: 'Human contact completed.', followUpBlocking: true } });
    expect(isContinuityPlanConfirmed(state)).toBe(false);
    state = buildCheckpoint('RECOVERED_PLAN');
    expect(isContinuityPlanConfirmed(state)).toBe(false);
    state = workflowReducer(state, { type: 'ACKNOWLEDGE_PATIENT_PLAN' });
    expect(isContinuityPlanConfirmed(state)).toBe(true);
  });

  it('expires acknowledgment and reopens transport when the plan changes', () => {
    let state = buildCheckpoint('FINAL_CONFIRMATION');
    const version = getCurrentPlanVersion(state);
    state = workflowReducer(state, { type: 'FAIL_TRANSPORTATION' });
    expect(getCurrentPlanVersion(state)).toBe(version + 1);
    expect(state.patientAcknowledgedPlanVersion).toBeNull();
    expect(state.overallReadiness).not.toBe('PLAN_CONFIRMED');
    expect(workflowReducer(state, { type: 'FAIL_TRANSPORTATION' })).toBe(state);
  });

  it('reconstructs checkpoints and resets only the scenario key', () => {
    localStorage.setItem('oncoready_live_attempt_sentinel', 'reserved-byte-for-byte');
    const one = buildCheckpoint('FAILED_RIDE');
    expect(one).toEqual(buildCheckpoint('FAILED_RIDE'));
    expect(workflowReducer(one, { type: 'RESET_WORKFLOW' }).attendanceStatus).toBe('UNKNOWN');
    expect(localStorage.getItem('oncoready_live_attempt_sentinel')).toBe('reserved-byte-for-byte');
  });

  it('keeps prepared history checkpoint-aware and rejects corrupt v5 persistence', () => {
    const context = buildCheckpoint('CONTEXT_INSIGHTS');
    const splitState = buildCheckpoint('SPLIT_WORK');
    expect(context.auditEvents).toHaveLength(5);
    expect(context.auditEvents.some((event) => event.description.includes(PREPARED_REPLY))).toBe(false);
    expect(splitState.auditEvents).toHaveLength(7);
    expect(splitState.auditEvents.filter((event) => event.description.includes(PREPARED_REPLY))).toHaveLength(1);

    const corrupt = structuredClone(buildCheckpoint('FINAL_CONFIRMATION'));
    corrupt.patientAcknowledgedPlanVersion = 1;
    localStorage.setItem('oncoready_workflow_state_v4', JSON.stringify(corrupt));
    expect(loadSavedWorkflowState()).toEqual(INITIAL_STATE);
  });
});
