import { describe, expect, it } from 'vitest';
import { createEpicCaptureState } from '../src/data/epicCapture';

const patientPath = 'resources/patient-p1.json';
const patient = {
  resourceType: 'Patient',
  id: 'p1',
  active: true,
  name: [{ use: 'official', text: 'Camila Maria Lopez' }],
};

const manifest = {
  schemaVersion: 1,
  captureId: 'epic-sandbox-20260922T070125Z-0dac7d6b',
  mode: 'captured_epic_sandbox',
  fhirVersion: '4.0.1',
  source: {
    label: 'Epic FHIR Sandbox',
    environment: 'Non-Production Sandbox',
    fhirBaseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
  },
  capturedAt: '2026-09-22T07:01:25Z',
  patient: { resourceType: 'Patient', id: 'p1' },
  scenarioBinding: {
    scenarioId: 'camila-demo-v2',
    presentationAlias: 'Camila Lopez',
    sourceIdentity: 'Camila Maria Lopez',
    identityMatch: true,
  },
  requests: [{ method: 'GET', resourceType: 'Patient', redactedPath: '/Patient/p1' }],
  resources: [{ resourceType: 'Patient', id: 'p1', path: patientPath, sha256: '0'.repeat(64) }],
  review: {
    status: 'approved_for_frontend',
    reviewedAt: '2026-09-22T07:08:22Z',
    reviewedBy: 'OncoReady operator',
    distribution: 'reviewed_epic_sandbox_test_data',
  },
};

describe('EPIC-001 capture adapter validation', () => {
  it('keeps omitted source fields absent instead of inventing scenario values', () => {
    const result = createEpicCaptureState(manifest, { [patientPath]: patient });

    expect(result.status).toBe('available');
    if (result.status !== 'available') return;
    expect(result.context.patient.name).toBe('Camila Maria Lopez');
    expect(result.context.patient.birthDate).toBeUndefined();
    expect(result.context.patient.gender).toBeUndefined();
    expect(JSON.stringify(result.context)).not.toContain('mFOLFOX6');
  });

  it('fails closed for an unsupported capture mode', () => {
    const result = createEpicCaptureState({ ...manifest, mode: 'live_epic' }, { [patientPath]: patient });
    expect(result.status).toBe('unavailable');
  });

  it('fails closed when a manifest resource file is missing', () => {
    const result = createEpicCaptureState(manifest, {});
    expect(result.status).toBe('unavailable');
  });

  it('fails closed when a referenced resource identity does not match the manifest', () => {
    const result = createEpicCaptureState(manifest, {
      [patientPath]: { ...patient, id: 'different-patient' },
    });
    expect(result.status).toBe('unavailable');
  });
});
