import type { ApiSchemas, StaffProjection } from '../api/client';

type WorkItem = StaffProjection['work_items'][number];

export type WorkItemCommandPlan = {
  action: ApiSchemas['WorkItemCommand']['action'];
  label: string;
  ownerId?: string;
  note?: string;
  closureEvidence?: string;
};

export const getWorkItemCommandPlan = (item: WorkItem): WorkItemCommandPlan | null => {
  if (item.status === 'open') {
    return {
      action: 'assign',
      label: `Assign to ${item.owner_display_name ?? item.owner_role.replace(/_/g, ' ')}`,
      ownerId: `finals-${item.owner_role}-owner`,
    };
  }
  if (item.status === 'assigned') {
    return { action: 'acknowledge', label: 'Acknowledge assignment' };
  }
  if (['acknowledged', 'accepted', 'needs_information'].includes(item.status)) {
    return {
      action: 'record_action',
      label: 'Record human action',
      note: 'Human review and follow-up were recorded in the continuity workspace.',
    };
  }
  if (item.status === 'actioned' || item.status === 'patient_acknowledged') {
    return {
      action: 'close',
      label: 'Close with evidence',
      closureEvidence: item.closure_evidence ?? 'Required human work completed and current closure evidence reviewed.',
    };
  }
  return null;
};

export type TransportCommandPlan = {
  label: string;
  description: string;
  button?: string;
  action?: ApiSchemas['TransportCommand']['action'];
  mode?: 'command' | 'refresh' | 'waiting';
  reason?: string;
  closureEvidence?: string;
};

type TransportStatus = ApiSchemas['TransportStatus'];
type PermittedRecovery = ApiSchemas['ProviderReconciliationSummary']['permitted_recovery'];

export const getTransportCommandPlan = (
  status: TransportStatus,
  recovery: PermittedRecovery,
): TransportCommandPlan | null => {
  if (status === 'patient_notified') {
    return {
      label: 'Waiting for Maria',
      description: 'Maria must acknowledge the complete ride plan in her patient workspace before dispatch can continue.',
      mode: 'waiting',
    };
  }
  if (status === 'picked_up') {
    return {
      label: 'Complete both-leg fulfillment',
      description: 'Record completion only after CareLink confirms the outbound and return legs are fulfilled.',
      button: 'Complete both-leg fulfillment',
      action: 'complete',
      mode: 'command',
      closureEvidence: 'CareLink confirmed the complete outbound and return ride plan was fulfilled.',
    };
  }
  if (status === 'return_pending') {
    return {
      label: 'Return leg unresolved',
      description: 'This exceptional state cannot be completed here. Escalate it for manual navigator recovery.',
      button: 'Escalate to navigator',
      action: 'escalate_to_navigator',
      mode: 'command',
      reason: 'Return leg remains unresolved after pickup; manual navigator recovery is required.',
    };
  }
  if (status === 'outcome_unknown') {
    if (recovery === 'activate_backup') return { label: 'Activate the approved backup', description: 'The uncertain original attempt will not be resent.', button: 'Activate backup', action: 'activate_backup', mode: 'command' };
    if (recovery === 'escalate_manually') return { label: 'Escalate to navigator', description: 'Manual recovery is the only permitted path.', button: 'Escalate manually', action: 'escalate_to_navigator', mode: 'command', reason: 'Provider outcome is unknown and requires manual navigator recovery.' };
    return { label: recovery.replace(/_/g, ' '), description: 'Refresh or reconcile the provider outcome. Blind resend is disabled.', button: 'Refresh current status', mode: 'refresh' };
  }
  const map: Partial<Record<TransportStatus, [string, ApiSchemas['TransportCommand']['action']]>> = {
    need_detected: ['Review eligibility and complete both trip legs', 'review_eligibility'],
    eligibility_reviewed: ['Mark request ready', 'mark_request_ready'],
    request_ready: ['Send controlled offer', 'offer'],
    offered: ['Record provider acceptance', 'accept'],
    accepted: ['Assign allowlisted driver', 'assign_driver'],
    driver_assigned: ['Notify patient', 'notify_patient'],
    patient_acknowledged: ['Mark en route', 'mark_en_route'],
    en_route: ['Record arrival', 'arrive'],
    arrived: ['Record pickup', 'pick_up'],
    provider_unavailable: ['Activate approved backup', 'activate_backup'],
    backup_required: ['Activate approved backup', 'activate_backup'],
    backup_activated: ['Notify patient of backup plan', 'notify_patient'],
    stale_assignment: ['Escalate stale assignment', 'escalate_to_navigator'],
    declined: ['Activate approved backup', 'activate_backup'],
    cancelled: ['Escalate cancellation', 'escalate_to_navigator'],
  };
  const match = map[status];
  if (!match) return null;
  return {
    label: match[0],
    description: 'This guarded command advances only the current allowed lifecycle transition.',
    button: match[0],
    action: match[1],
    mode: 'command',
    ...(match[1] === 'escalate_to_navigator' ? { reason: `${match[0]} requires manual navigator recovery.` } : {}),
  };
};
