/**
 * The staff patient directory.
 *
 * The prepared scenario patient is the one playable case: it carries readiness
 * state, tasks, a graph and an audit trail. The remaining rows are reviewed
 * Epic Sandbox captures shown read-only, so the directory reflects a caseload
 * without implying workflow state that was never captured.
 *
 * Role scoping matches the workspace contract: a Care Navigator coordinates,
 * so it sees identity and appointment logistics but never vital signs or any
 * other clinical measurement.
 */
import type { WorkflowState, WorkspaceRole } from '../types';
import { EPIC_CAPTURE_STATE, formatEpicSourceDate } from './epicCapture';
import { EPIC_ROSTER, type EpicRosterEntry, type EpicVitalFact } from './epicRoster';

export type DirectorySource = 'SCENARIO' | 'EPIC_SANDBOX';

export interface DirectoryRecord {
  key: string;
  name: string;
  identifierLabel: string;
  identifier: string;
  detail: string;
  status: string;
  statusLabel: string;
  source: DirectorySource;
  /** Only the prepared scenario case opens the full case workspace. */
  interactive: boolean;
  patientId?: string;
  captureId?: string;
  capturedAt?: string;
  appointments?: Array<{ id: string; label: string; when: string }>;
  vitals?: EpicVitalFact[];
  vitalsTotal?: number;
  bounded?: boolean;
  unavailableReason?: string;
}

export const EPIC_RECORD_STATUS = 'EPIC_RECORD';
/** Most recent readings surfaced in the read-only detail panel. */
const RECENT_VITALS_SHOWN = 9;
const UNREADABLE_STATUS = 'CAPTURE_UNAVAILABLE';

const appointmentLabel = (service?: string, location?: string): string =>
  [service, location].filter(Boolean).join(' · ') || 'Appointment details not present in captured record';

export const buildDirectoryRecords = (
  state: WorkflowState,
  workspaceRole: WorkspaceRole,
  roster: EpicRosterEntry[] = EPIC_ROSTER,
): DirectoryRecord[] => {
  const scenarioRecord: DirectoryRecord = {
    key: `scenario:${state.patient.id}`,
    name: state.patient.name,
    identifierLabel: 'MRN',
    identifier: state.patient.mrn,
    detail: state.appointment.treatmentName,
    status: state.overallReadiness,
    statusLabel: state.overallReadiness.replace(/_/g, ' '),
    source: 'SCENARIO',
    interactive: true,
  };

  // The scenario patient also has a roster capture (their Epic vital signs).
  // That capture belongs to the playable case above, so it must not surface as
  // a second directory row for the same person.
  const scenarioEpicId =
    EPIC_CAPTURE_STATE.status === 'available' ? EPIC_CAPTURE_STATE.context.patient.id : undefined;

  const epicRecords = roster
    .filter((entry) => entry.patientId !== scenarioEpicId)
    .map((entry): DirectoryRecord => {
      if (entry.status === 'unavailable') {
        return {
          key: `epic:${entry.patientId}`,
          name: 'Epic record',
          identifierLabel: 'Epic ID',
          identifier: entry.patientId,
          detail: 'Captured record could not be read',
          status: UNREADABLE_STATUS,
          statusLabel: 'Capture unavailable',
          source: 'EPIC_SANDBOX',
          interactive: false,
          patientId: entry.patientId,
          unavailableReason: entry.reason,
        };
      }
      const patient = entry.patient;
      const next = patient.appointments[0];
      return {
        key: `epic:${patient.patientId}`,
        name: patient.patient.name ?? patient.sourceIdentity,
        identifierLabel: patient.mrn ? 'MRN' : 'Epic ID',
        identifier: patient.mrn ?? patient.patientId,
        detail: next
          ? appointmentLabel(next.service, next.location)
          : 'No appointment present in captured record',
        status: EPIC_RECORD_STATUS,
        statusLabel: 'Epic record',
        source: 'EPIC_SANDBOX',
        interactive: false,
        patientId: patient.patientId,
        captureId: patient.captureId,
        capturedAt: patient.capturedAt,
        appointments: patient.appointments.slice(0, 4).map((appointment) => ({
          id: appointment.id,
          label: appointmentLabel(appointment.service, appointment.location),
          when: appointment.start
            ? formatEpicSourceDate(appointment.start) ?? appointment.start
            : 'Time not present in captured record',
        })),
        bounded: patient.bounded,
        // Clinical measurements are Care Team only. Charts can hold dozens of
        // readings, so show the most recent and state the real total.
        vitals: workspaceRole === 'CARE_TEAM' ? patient.vitals.slice(0, RECENT_VITALS_SHOWN) : undefined,
        vitalsTotal: workspaceRole === 'CARE_TEAM' ? patient.vitals.length : undefined,
      };
    });

  return [scenarioRecord, ...epicRecords];
};

export const filterDirectoryRecords = (
  records: DirectoryRecord[],
  search: string,
  status: string,
): DirectoryRecord[] =>
  records.filter((record) => {
    const haystack = `${record.name} ${record.identifier} ${record.detail}`.toLowerCase();
    const matchesSearch = haystack.includes(search.trim().toLowerCase());
    const matchesStatus = status === 'ALL' || record.status === status;
    return matchesSearch && matchesStatus;
  });
