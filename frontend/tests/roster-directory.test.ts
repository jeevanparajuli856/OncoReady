import { describe, expect, it } from 'vitest';
import { INITIAL_STATE } from '../src/state/workflowState';
import type { EpicRosterEntry } from '../src/data/epicRoster';
import {
  EPIC_RECORD_STATUS,
  buildDirectoryRecords,
  filterDirectoryRecords,
} from '../src/data/rosterDirectory';

const ROSTER_PATIENT_ID = 'eq081-VQEgP8drUUqCWzHfw3';

const rosterEntry = (overrides: Partial<EpicRosterEntry> = {}): EpicRosterEntry => ({
  status: 'available',
  patientId: ROSTER_PATIENT_ID,
  patient: {
    patientId: ROSTER_PATIENT_ID,
    captureId: 'epic-sandbox-20260922T070125Z-0dac7d6b',
    capturedAt: '2026-09-22T07:01:25Z',
    sourceIdentity: 'Derrick Lin',
    mrn: '203713',
    observationCategories: ['vital-signs'],
    patient: {
      id: ROSTER_PATIENT_ID,
      name: 'Derrick Lin',
      provenance: { resourceType: 'Patient', resourceId: ROSTER_PATIENT_ID, sourcePaths: [] },
    },
    vitals: [
      {
        id: 'obs-hr',
        name: 'Heart rate',
        loincCode: '8867-4',
        value: '72',
        unit: '/min',
        effectiveAt: '2019-05-28T14:21:00Z',
        provenance: { resourceType: 'Observation', resourceId: 'obs-hr', sourcePaths: [] },
      },
    ],
    appointments: [
      {
        id: 'appt-1',
        status: 'booked',
        service: 'Office Visit',
        start: '2026-09-25T15:00:00Z',
        location: 'Cardiology',
        provenance: { resourceType: 'Appointment', resourceId: 'appt-1', sourcePaths: [] },
      },
    ],
    resources: [],
    requests: [],
  },
  ...overrides,
} as EpicRosterEntry);

describe('buildDirectoryRecords', () => {
  it('keeps the prepared scenario case as the only interactive row', () => {
    const records = buildDirectoryRecords(INITIAL_STATE, 'CARE_TEAM', [rosterEntry()]);

    expect(records[0].name).toBe(INITIAL_STATE.patient.name);
    expect(records[0].interactive).toBe(true);
    expect(records.filter((record) => record.interactive)).toHaveLength(1);
    expect(records[1].interactive).toBe(false);
  });

  it('presents a captured patient under its real Sandbox identity and MRN', () => {
    const [, epicRecord] = buildDirectoryRecords(INITIAL_STATE, 'CARE_TEAM', [rosterEntry()]);

    expect(epicRecord.name).toBe('Derrick Lin');
    expect(epicRecord.identifierLabel).toBe('MRN');
    expect(epicRecord.identifier).toBe('203713');
    expect(epicRecord.status).toBe(EPIC_RECORD_STATUS);
    expect(epicRecord.statusLabel).toBe('Epic record');
    expect(epicRecord.detail).toContain('Office Visit');
  });

  it('never exposes captured vital signs to the Care Navigator directory', () => {
    const careTeam = buildDirectoryRecords(INITIAL_STATE, 'CARE_TEAM', [rosterEntry()]);
    const navigator = buildDirectoryRecords(INITIAL_STATE, 'CARE_NAVIGATOR', [rosterEntry()]);

    expect(careTeam[1].vitals).toHaveLength(1);
    expect(navigator[1].vitals).toBeUndefined();
    // Coordination data still reaches the navigator.
    expect(navigator[1].appointments).toHaveLength(1);
    expect(JSON.stringify(navigator)).not.toContain('Heart rate');
  });

  it('falls back to the Epic id when the capture records no MRN', () => {
    const entry = rosterEntry();
    if (entry.status === 'available') entry.patient.mrn = undefined;
    const [, epicRecord] = buildDirectoryRecords(INITIAL_STATE, 'CARE_TEAM', [entry]);

    expect(epicRecord.identifierLabel).toBe('Epic ID');
    expect(epicRecord.identifier).toBe(ROSTER_PATIENT_ID);
  });

  it('shows an unreadable capture as a non-interactive row instead of dropping it', () => {
    const records = buildDirectoryRecords(INITIAL_STATE, 'CARE_TEAM', [
      { status: 'unavailable', patientId: ROSTER_PATIENT_ID, reason: 'Resource reference mismatch.' },
    ]);

    expect(records).toHaveLength(2);
    expect(records[1].interactive).toBe(false);
    expect(records[1].statusLabel).toBe('Capture unavailable');
    expect(records[1].unavailableReason).toBe('Resource reference mismatch.');
  });

  it('renders a scenario-only directory when no roster capture exists', () => {
    const records = buildDirectoryRecords(INITIAL_STATE, 'CARE_TEAM', []);

    expect(records).toHaveLength(1);
    expect(records[0].name).toBe(INITIAL_STATE.patient.name);
  });

  it('states plainly when a captured patient has no appointment', () => {
    const entry = rosterEntry();
    if (entry.status === 'available') entry.patient.appointments = [];
    const [, epicRecord] = buildDirectoryRecords(INITIAL_STATE, 'CARE_TEAM', [entry]);

    expect(epicRecord.detail).toBe('No appointment present in captured record');
  });
});

describe('filterDirectoryRecords', () => {
  const records = () => buildDirectoryRecords(INITIAL_STATE, 'CARE_TEAM', [rosterEntry()]);

  it('searches across name, identifier and detail', () => {
    expect(filterDirectoryRecords(records(), 'Derrick', 'ALL')).toHaveLength(1);
    expect(filterDirectoryRecords(records(), '203713', 'ALL')).toHaveLength(1);
    expect(filterDirectoryRecords(records(), 'Office Visit', 'ALL')).toHaveLength(1);
    expect(filterDirectoryRecords(records(), 'nobody', 'ALL')).toHaveLength(0);
  });

  it('separates captured Epic records from prepared readiness states', () => {
    const epicOnly = filterDirectoryRecords(records(), '', EPIC_RECORD_STATUS);
    expect(epicOnly.map((record) => record.name)).toEqual(['Derrick Lin']);

    const readinessOnly = filterDirectoryRecords(records(), '', INITIAL_STATE.overallReadiness);
    expect(readinessOnly.map((record) => record.name)).toEqual([INITIAL_STATE.patient.name]);
  });
});
