import { describe, it, expect } from 'vitest';
import { 
  INITIAL_STATE, 
  workflowReducer, 
  deriveCaregiverProjection 
} from '../src/state/workflowState';

describe('CORE-001 Treatment Readiness Golden Path Smoke Test', () => {
  it('1. Initial opening state is deterministic with readiness check pending', () => {
    expect(INITIAL_STATE.patient.name).toBe('Camila Lopez');
    expect(INITIAL_STATE.overallReadiness).toBe('ACTION_REQUIRED');
    expect(INITIAL_STATE.readinessCheckCompleted).toBe(false);
    expect(INITIAL_STATE.tasks.length).toBe(0);
    expect(INITIAL_STATE.patientAcknowledged).toBe(false);
  });

  it('2. Submitting readiness check creates exactly one clinical task and one transport task', () => {
    const reportText = 'Mild fever 100.4°F and tingling in fingers since yesterday evening';
    const transportText = 'Ride cancelled by family member; needs assisted pickup at 7:45 AM';

    const stateAfterSubmit = workflowReducer(INITIAL_STATE, {
      type: 'SUBMIT_READINESS',
      payload: {
        clinicalConcernText: reportText,
        transportNotes: transportText,
      },
    });

    expect(stateAfterSubmit.readinessCheckCompleted).toBe(true);
    expect(stateAfterSubmit.overallReadiness).toBe('AT_RISK');
    expect(stateAfterSubmit.tasks.length).toBe(2);

    const clinicalTask = stateAfterSubmit.tasks.find((t) => t.type === 'CLINICAL_REVIEW');
    const transportTask = stateAfterSubmit.tasks.find((t) => t.type === 'TRANSPORTATION_NAVIGATION');

    expect(clinicalTask).toBeDefined();
    expect(clinicalTask?.owner.name).toContain('Sarah Jenkins');
    expect(clinicalTask?.clinicalDetails?.verbatimReport).toBe(reportText);
    expect(clinicalTask?.clinicalDetails?.clearanceState).toBe('PENDING_REVIEW');

    expect(transportTask).toBeDefined();
    expect(transportTask?.owner.name).toContain('Marcus Vance');
    expect(transportTask?.transportDetails?.dispatchStatus).toBe('UNASSIGNED');
  });

  it('3. Caregiver projection strictly enforces data minimization and excludes clinical data', () => {
    const reportText = 'Mild fever 100.4°F and tingling in fingers since yesterday evening';
    const stateWithTasks = workflowReducer(INITIAL_STATE, {
      type: 'SUBMIT_READINESS',
      payload: {
        clinicalConcernText: reportText,
        transportNotes: 'Needs ride',
      },
    });

    const projectionBeforeDispatch = deriveCaregiverProjection(stateWithTasks);
    expect(projectionBeforeDispatch.patientName).toBe('Camila Lopez');
    expect(projectionBeforeDispatch.transportConfirmed).toBe(false);
    
    // Critical privacy assertion: Ensure no clinical symptom or triage note exists in caregiver projection
    const projectionJson = JSON.stringify(projectionBeforeDispatch);
    expect(projectionJson).not.toContain('fever');
    expect(projectionJson).not.toContain('tingling');
    expect(projectionJson).not.toContain('neuropathy');
    expect(projectionJson).not.toContain('CLINICAL_REVIEW');

    // Confirm transport
    const stateAfterTransport = workflowReducer(stateWithTasks, {
      type: 'CONFIRM_TRANSPORTATION',
      payload: {
        vehicleId: 'CareLink Vehicle #402',
        driverName: 'Jerome Davis',
        pickupTime: 'Tomorrow, 7:45 AM',
      },
    });

    const projectionAfterDispatch = deriveCaregiverProjection(stateAfterTransport);
    expect(projectionAfterDispatch.transportConfirmed).toBe(true);
    expect(projectionAfterDispatch.transportInfo?.vehicleId).toBe('CareLink Vehicle #402');
    expect(projectionAfterDispatch.transportInfo?.driverName).toBe('Jerome Davis');
    expect(projectionAfterDispatch.transportInfo?.pickupTime).toBe('Tomorrow, 7:45 AM');

    // Re-verify privacy after transport confirmation
    const projectionJsonAfter = JSON.stringify(projectionAfterDispatch);
    expect(projectionJsonAfter).not.toContain('fever');
    expect(projectionJsonAfter).not.toContain('tingling');
    expect(projectionJsonAfter).not.toContain('neuropathy');
  });

  it('4. Full golden path progresses from submission to staff actions to patient confirmation and closure', () => {
    // Step 1: Submit readiness
    let state = workflowReducer(INITIAL_STATE, {
      type: 'SUBMIT_READINESS',
      payload: {
        clinicalConcernText: 'Mild fever 100.4°F and tingling in fingers',
        transportNotes: 'Ride cancelled',
      },
    });
    expect(state.overallReadiness).toBe('AT_RISK');

    // Step 2: Nurse acknowledges clinical task
    state = workflowReducer(state, {
      type: 'ACKNOWLEDGE_CLINICAL_TASK',
    });
    state = workflowReducer(state, {
      type: 'RECORD_CLINICAL_DISPOSITION',
      payload: {
        disposition: 'Human contact completed; no blocking follow-up recorded.',
        followUpBlocking: false,
      },
    });
    const clnTask = state.tasks.find((t) => t.type === 'CLINICAL_REVIEW');
    expect(clnTask?.clinicalDetails?.clearanceState).toBe('REVIEWED_AND_ACKNOWLEDGED');

    // Step 3: Navigator confirms transport
    state = workflowReducer(state, {
      type: 'CONFIRM_TRANSPORTATION',
      payload: {
        vehicleId: 'CareLink Vehicle #402',
        driverName: 'Jerome Davis',
        pickupTime: 'Tomorrow, 7:45 AM',
      },
    });
    const trnTask = state.tasks.find((t) => t.type === 'TRANSPORTATION_NAVIGATION');
    expect(trnTask?.transportDetails?.dispatchStatus).toBe('CONFIRMED');
    expect(state.overallReadiness).toBe('IN_PROGRESS');

    // Step 4: Patient acknowledges updated plan
    state = workflowReducer(state, {
      type: 'ACKNOWLEDGE_PATIENT_PLAN',
    });
    expect(state.patientAcknowledged).toBe(true);
    expect(state.overallReadiness).toBe('PLAN_CONFIRMED');
    expect(state.tasks.every((t) => t.status === 'RESOLVED')).toBe(true);

    // Verify causal audit events are recorded
    expect(state.auditEvents.length).toBeGreaterThanOrEqual(6);
    const hasClosureEvent = state.auditEvents.some((e) => e.action === 'Current transport plan v1 acknowledged');
    expect(hasClosureEvent).toBe(true);

    // Step 5: Reset restores initial state
    const resetState = workflowReducer(state, { type: 'RESET_WORKFLOW' });
    expect(resetState.overallReadiness).toBe('ACTION_REQUIRED');
    expect(resetState.readinessCheckCompleted).toBe(false);
    expect(resetState.tasks.length).toBe(0);
  });

  it('5. Invalid, duplicate, and out-of-order transitions are no-ops', () => {
    expect(workflowReducer(INITIAL_STATE, { type: 'ACKNOWLEDGE_CLINICAL_TASK' })).toBe(INITIAL_STATE);
    expect(workflowReducer(INITIAL_STATE, { type: 'CONFIRM_TRANSPORTATION' })).toBe(INITIAL_STATE);
    expect(workflowReducer(INITIAL_STATE, { type: 'ACKNOWLEDGE_PATIENT_PLAN' })).toBe(INITIAL_STATE);
    const submitted = workflowReducer(INITIAL_STATE, {
      type: 'SUBMIT_READINESS',
      payload: { clinicalConcernText: 'Patient report', transportNotes: 'Ride unavailable' },
    });
    expect(workflowReducer(submitted, { type: 'ACKNOWLEDGE_PATIENT_PLAN' })).toBe(submitted);
    const reviewed = workflowReducer(submitted, { type: 'ACKNOWLEDGE_CLINICAL_TASK' });
    expect(workflowReducer(reviewed, { type: 'ACKNOWLEDGE_CLINICAL_TASK' })).toBe(reviewed);
    const transported = workflowReducer(reviewed, { type: 'CONFIRM_TRANSPORTATION' });
    expect(workflowReducer(transported, { type: 'CONFIRM_TRANSPORTATION' })).toBe(transported);
    const confirmed = workflowReducer(transported, { type: 'ACKNOWLEDGE_PATIENT_PLAN' });
    expect(workflowReducer(confirmed, { type: 'ACKNOWLEDGE_PATIENT_PLAN' })).toBe(confirmed);
  });
});
