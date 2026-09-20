import { describe, expect, it } from 'vitest';
import type { StaffProjection } from '../src/api/client';
import { getTransportCommandPlan, getWorkItemCommandPlan } from '../src/launch/workflowCommands';

const workItem = (status: StaffProjection['work_items'][number]['status']): StaffProjection['work_items'][number] => ({
  work_item_id: '77777777-7777-4777-8777-777777777777',
  work_item_type: 'clinical_review',
  owner_role: 'triage_nurse',
  owner_display_name: 'Triage nurse',
  status,
  due_at: '2026-09-22T17:00:00.000Z',
  aggregate_version: 2,
});

describe('guarded workflow command plans', () => {
  it('maps staff lifecycle states to their contract-permitted command and label', () => {
    expect(getWorkItemCommandPlan(workItem('open'))).toMatchObject({ action: 'assign', label: 'Assign to Triage nurse', ownerId: 'finals-triage_nurse-owner' });
    expect(getWorkItemCommandPlan(workItem('assigned'))).toMatchObject({ action: 'acknowledge', label: 'Acknowledge assignment' });
    for (const status of ['acknowledged', 'accepted', 'needs_information'] as const) {
      expect(getWorkItemCommandPlan(workItem(status))).toMatchObject({ action: 'record_action', label: 'Record human action' });
    }
    for (const status of ['actioned', 'patient_acknowledged'] as const) {
      expect(getWorkItemCommandPlan(workItem(status))).toMatchObject({ action: 'close', label: 'Close with evidence' });
    }
    expect(getWorkItemCommandPlan(workItem('patient_informed'))).toBeNull();
  });

  it('keeps patient acknowledgment out of coordinator commands and protects exceptional return state', () => {
    expect(getTransportCommandPlan('patient_notified', 'none')).toMatchObject({ mode: 'waiting', label: 'Waiting for Maria' });
    expect(getTransportCommandPlan('patient_notified', 'none')?.action).toBeUndefined();
    expect(getTransportCommandPlan('picked_up', 'none')).toMatchObject({ action: 'complete', closureEvidence: expect.any(String) });
    expect(getTransportCommandPlan('return_pending', 'none')).toMatchObject({ action: 'escalate_to_navigator', reason: expect.any(String) });
  });
});
