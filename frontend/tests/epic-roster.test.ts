import { describe, expect, it } from 'vitest';
import { availableRosterPatients, createEpicRoster, findRosterPatient } from '../src/data/epicRoster';

const PATIENT_ID = 'eq081-VQEgP8drUUqCWzHfw3';
const OTHER_ID = 'eAB3mDIBBcyUKviyzrxsnAw3';

const manifest = (patientId: string, overrides: Record<string, unknown> = {}) => ({
  schemaVersion: 2,
  captureId: 'epic-sandbox-20260922T070125Z-0dac7d6b',
  mode: 'captured_epic_sandbox',
  fhirVersion: '4.0.1',
  source: {
    label: 'Epic FHIR Sandbox',
    environment: 'Non-Production Sandbox',
    fhirBaseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
  },
  capturedAt: '2026-09-22T07:01:25Z',
  patient: { resourceType: 'Patient', id: patientId },
  sourceIdentity: 'Derrick Lin',
  observationCategories: ['vital-signs'],
  requests: [{ method: 'GET', resourceType: 'Patient', redactedPath: '/Patient/[REDACTED]' }],
  resources: [
    { resourceType: 'Patient', id: patientId, path: `resources/patient-${patientId}.json`, sha256: '0'.repeat(64) },
    { resourceType: 'Observation', id: 'obs-1', path: 'resources/observation-obs-1.json', sha256: '0'.repeat(64) },
  ],
  review: {
    status: 'approved_for_frontend',
    reviewedAt: '2026-09-22T07:08:22Z',
    reviewedBy: 'OncoReady Codex operator',
    distribution: 'reviewed_epic_sandbox_test_data',
  },
  ...overrides,
});

const documents = (patientId: string, observation: Record<string, unknown> | null = null) => ({
  [`./epic-roster/${patientId}/resources/patient-${patientId}.json`]: {
    resourceType: 'Patient',
    id: patientId,
    name: [{ use: 'official', family: 'Lin', given: ['Derrick'] }],
    birthDate: '1973-06-03',
    gender: 'male',
  },
  [`./epic-roster/${patientId}/resources/observation-obs-1.json`]: observation ?? {
    resourceType: 'Observation',
    id: 'obs-1',
    status: 'final',
    category: [{ coding: [{ code: 'vital-signs' }] }],
    subject: { reference: `Patient/${patientId}` },
    code: { text: 'Heart rate', coding: [{ system: 'http://loinc.org', code: '8867-4' }] },
    effectiveDateTime: '2019-05-28T14:21:00Z',
    valueQuantity: { value: 72, unit: '/min' },
  },
});

describe('createEpicRoster', () => {
  it('maps a reviewed roster package into patient facts and vital signs', () => {
    const roster = createEpicRoster(
      { [`./epic-roster/${PATIENT_ID}/manifest.json`]: manifest(PATIENT_ID) },
      documents(PATIENT_ID),
    );

    expect(roster).toHaveLength(1);
    const patient = findRosterPatient(PATIENT_ID, roster);
    expect(patient?.sourceIdentity).toBe('Derrick Lin');
    expect(patient?.patient.name).toBe('Derrick Lin');
    expect(patient?.patient.birthDate).toBe('1973-06-03');
    expect(patient?.vitals).toHaveLength(1);
    expect(patient?.vitals[0]).toMatchObject({ loincCode: '8867-4', value: '72', unit: '/min' });
  });

  it('reads a component-only blood pressure panel as systolic / diastolic', () => {
    const roster = createEpicRoster(
      { [`./epic-roster/${PATIENT_ID}/manifest.json`]: manifest(PATIENT_ID) },
      documents(PATIENT_ID, {
        resourceType: 'Observation',
        id: 'obs-1',
        category: [{ coding: [{ code: 'vital-signs' }] }],
        subject: { reference: `Patient/${PATIENT_ID}` },
        code: { text: 'Blood pressure', coding: [{ system: 'http://loinc.org', code: '85354-9' }] },
        component: [
          { code: { text: 'Systolic' }, valueQuantity: { value: 118, unit: 'mm[Hg]' } },
          { code: { text: 'Diastolic' }, valueQuantity: { value: 74, unit: 'mm[Hg]' } },
        ],
      }),
    );

    expect(availableRosterPatients(roster)[0].vitals[0].value).toBe('118 / 74');
  });

  it('degrades one unreadable package without losing the rest of the roster', () => {
    const roster = createEpicRoster(
      {
        [`./epic-roster/${PATIENT_ID}/manifest.json`]: manifest(PATIENT_ID),
        [`./epic-roster/${OTHER_ID}/manifest.json`]: manifest(OTHER_ID),
      },
      documents(PATIENT_ID), // the second package's resource files are missing
    );

    expect(roster).toHaveLength(2);
    expect(availableRosterPatients(roster).map((patient) => patient.patientId)).toEqual([PATIENT_ID]);
    const broken = roster.find((entry) => entry.patientId === OTHER_ID);
    expect(broken?.status).toBe('unavailable');
    expect(broken && 'reason' in broken && broken.reason).toMatch(/Resource reference mismatch/);
  });

  it('rejects a package whose resource belongs to another patient', () => {
    const roster = createEpicRoster(
      { [`./epic-roster/${PATIENT_ID}/manifest.json`]: manifest(PATIENT_ID) },
      {
        ...documents(PATIENT_ID),
        [`./epic-roster/${PATIENT_ID}/resources/observation-obs-1.json`]: {
          resourceType: 'Observation',
          id: 'obs-1',
          category: [{ coding: [{ code: 'vital-signs' }] }],
          subject: { reference: `Patient/${OTHER_ID}` },
          code: { text: 'Heart rate' },
          valueQuantity: { value: 72, unit: '/min' },
        },
      },
    );

    expect(roster[0].status).toBe('unavailable');
  });

  it('rejects a non-vital-sign observation from a roster package', () => {
    const roster = createEpicRoster(
      { [`./epic-roster/${PATIENT_ID}/manifest.json`]: manifest(PATIENT_ID) },
      {
        ...documents(PATIENT_ID),
        [`./epic-roster/${PATIENT_ID}/resources/observation-obs-1.json`]: {
          resourceType: 'Observation',
          id: 'obs-1',
          category: [{ coding: [{ code: 'laboratory' }] }],
          subject: { reference: `Patient/${PATIENT_ID}` },
          code: { text: 'Hemoglobin' },
          valueQuantity: { value: 12.2, unit: 'g/dL' },
        },
      },
    );

    expect(roster[0].status).toBe('unavailable');
    expect(roster[0] && 'reason' in roster[0] && roster[0].reason).toMatch(/not a vital sign/);
  });

  it('rejects a scenario-bound v1 manifest, which belongs to the frozen capture', () => {
    const roster = createEpicRoster(
      { [`./epic-roster/${PATIENT_ID}/manifest.json`]: manifest(PATIENT_ID, { schemaVersion: 1 }) },
      documents(PATIENT_ID),
    );

    expect(roster[0].status).toBe('unavailable');
  });

  it('returns an empty roster when no packages are present', () => {
    expect(createEpicRoster({}, {})).toEqual([]);
    expect(availableRosterPatients([])).toEqual([]);
    expect(findRosterPatient(PATIENT_ID, [])).toBeUndefined();
  });

  it('never leaks absent source fields as invented values', () => {
    const roster = createEpicRoster(
      { [`./epic-roster/${PATIENT_ID}/manifest.json`]: manifest(PATIENT_ID) },
      {
        ...documents(PATIENT_ID),
        [`./epic-roster/${PATIENT_ID}/resources/patient-${PATIENT_ID}.json`]: {
          resourceType: 'Patient',
          id: PATIENT_ID,
          name: [{ use: 'official', family: 'Lin', given: ['Derrick'] }],
        },
      },
    );

    const patient = availableRosterPatients(roster)[0];
    expect(patient.patient.birthDate).toBeUndefined();
    expect(patient.patient.gender).toBeUndefined();
    expect(JSON.stringify(patient)).not.toContain('mFOLFOX6');
  });
});
