import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { App } from '../src/App';
import { EpicClinicalContextPanel } from '../src/components/EpicClinicalContext';
import manifestDocument from '../src/data/epic-capture/manifest.json';
import {
  createEpicCaptureState,
  type EpicClinicalContext,
} from '../src/data/epicCapture';

type FhirResource = Record<string, unknown> & {
  id: string;
  resourceType: 'Patient' | 'Appointment' | 'MedicationRequest' | 'Observation';
};

const resourceDocuments = import.meta.glob('../src/data/epic-capture/resources/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

const normalizedDocuments = Object.fromEntries(
  Object.entries(resourceDocuments).map(([modulePath, document]) => {
    const path = modulePath.match(/resources\/(.+\.json)$/)?.[0];
    if (!path) throw new Error(`Unexpected capture module path: ${modulePath}`);
    return [path, document];
  }),
) as Record<string, FhirResource>;

const capturedResources = Object.values(normalizedDocuments);

const getAvailableContext = (): EpicClinicalContext => {
  const state = createEpicCaptureState(manifestDocument, normalizedDocuments);
  expect(state.status).toBe('available');
  if (state.status !== 'available') throw new Error(state.reason);
  return state.context;
};

const openPreparedWorkspace = (testId: string) => {
  fireEvent.click(screen.getAllByRole('button', { name: /Access workspace/i })[0]);
  const credentials = testId.includes('patient') ? ['abcp@oncoready.me', '1234'] : testId.includes('caregiver') ? ['abcc@oncoready.me', '1234'] : ['abcs@oncoready.me', '1234'];
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: credentials[0] } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: credentials[1] } });
  fireEvent.click(screen.getAllByRole('button', { name: /^Sign in$/i }).at(-1)!);
};

describe('EPIC-001 independent acceptance evidence', () => {
  beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it('maps exact captured source facts and dates without importing scenario facts', () => {
    const context = getAvailableContext();
    const patient = capturedResources.find((resource) => resource.resourceType === 'Patient') as FhirResource & {
      active?: boolean;
      birthDate?: string;
      gender?: string;
      name?: Array<{ use?: string; text?: string }>;
      communication?: Array<{ preferred?: boolean; language?: { text?: string } }>;
    };

    expect(context.captureId).toBe(manifestDocument.captureId);
    expect(context.capturedAt).toBe(manifestDocument.capturedAt);
    expect(context.resources).toHaveLength(20);
    expect(context.requests.every((request) => request.method === 'GET')).toBe(true);
    expect(context.patient).toMatchObject({
      id: patient.id,
      name: patient.name?.find((name) => name.use === 'official')?.text,
      birthDate: patient.birthDate,
      gender: patient.gender,
      active: patient.active,
      preferredLanguage: patient.communication?.find((item) => item.preferred)?.language?.text,
    });

    for (const rawMedication of capturedResources.filter((resource) => resource.resourceType === 'MedicationRequest') as Array<FhirResource & {
      authoredOn?: string;
      intent?: string;
      status?: string;
      medicationReference?: { display?: string };
      dosageInstruction?: Array<{ patientInstruction?: string }>;
    }>) {
      expect(context.medications.find((item) => item.id === rawMedication.id)).toMatchObject({
        display: rawMedication.medicationReference?.display,
        status: rawMedication.status,
        intent: rawMedication.intent,
        authoredOn: rawMedication.authoredOn,
        instruction: rawMedication.dosageInstruction?.[0]?.patientInstruction,
      });
    }

    for (const rawLab of capturedResources.filter((resource) => resource.resourceType === 'Observation') as Array<FhirResource & {
      code?: { text?: string };
      effectiveDateTime?: string;
      issued?: string;
      valueQuantity?: { value?: number | string; unit?: string };
      valueString?: string;
    }>) {
      expect(context.labs.find((item) => item.id === rawLab.id)).toMatchObject({
        name: rawLab.code?.text,
        value: rawLab.valueQuantity?.value === undefined
          ? rawLab.valueString
          : String(rawLab.valueQuantity.value),
        unit: rawLab.valueQuantity?.unit,
        effectiveAt: rawLab.effectiveDateTime,
        issuedAt: rawLab.issued,
      });
    }

    for (const rawAppointment of capturedResources.filter((resource) => resource.resourceType === 'Appointment') as Array<FhirResource & {
      description?: string;
      end?: string;
      serviceType?: Array<{ text?: string; coding?: Array<{ display?: string }> }>;
      start?: string;
      status?: string;
    }>) {
      expect(context.appointments.find((item) => item.id === rawAppointment.id)).toMatchObject({
        status: rawAppointment.status,
        service: rawAppointment.description
          ?? rawAppointment.serviceType?.[0]?.text
          ?? rawAppointment.serviceType?.[0]?.coding?.[0]?.display,
        start: rawAppointment.start,
        end: rawAppointment.end,
      });
    }

    expect(JSON.stringify(context)).not.toContain('mFOLFOX6');
    expect(JSON.stringify(context)).not.toContain('Cycle 4 of 12');
    expect(JSON.stringify(context)).not.toContain('Sep 25, 10:00 AM');
  });

  it('renders explicit absent-family and absent-field states without an Epic-labeled fallback', async () => {
    const context = getAvailableContext();
    render(<EpicClinicalContextPanel captureState={{
      status: 'available',
      context: {
        ...context,
        patient: {
          id: context.patient.id,
          provenance: context.patient.provenance,
        },
        medications: [],
        labs: [],
        appointments: [],
      },
    }} />);

    await screen.findByRole('heading', { name: 'Epic Sandbox · Read-only captured data' });
    expect(screen.getAllByText('Not present in captured record').length).toBeGreaterThanOrEqual(8);
    expect(document.body.textContent).not.toContain('mFOLFOX6');
  });

  it('keeps Epic clinical identity, medication, and provenance out of non-staff views', () => {
    const forbidden = [
      manifestDocument.captureId,
      manifestDocument.patient.id,
      manifestDocument.scenarioBinding.sourceIdentity,
      'drospirenone-ethinyl estradiol',
    ];

    const assertAbsent = () => {
      const text = document.body.textContent ?? '';
      for (const value of forbidden) expect(text).not.toContain(value);
    };

    const landing = render(<App />);
    assertAbsent();
    landing.unmount();

    const patient = render(<App />);
    openPreparedWorkspace('auth-patient-card');
    assertAbsent();
    patient.unmount();
    localStorage.clear();

    const caregiver = render(<App />);
    openPreparedWorkspace('auth-caregiver-card');
    assertAbsent();
    caregiver.unmount();
    localStorage.clear();

    const team = render(<App />);
    openPreparedWorkspace('auth-care-team-card');
    fireEvent.click(screen.getByRole('tab', { name: /Graph/i }));
    assertAbsent();
    team.unmount();
  });
});
