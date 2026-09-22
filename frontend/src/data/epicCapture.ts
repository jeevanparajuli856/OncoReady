import manifestDocument from './epic-capture/manifest.json';

export type EpicResourceType = 'Patient' | 'Appointment' | 'MedicationRequest' | 'Observation';

export interface EpicManifestResource {
  resourceType: EpicResourceType;
  id: string;
  path: string;
  sha256: string;
}

export interface EpicRequestEvidence {
  method: 'GET';
  resourceType: EpicResourceType;
  redactedPath: string;
}

export interface EpicProvenance {
  resourceType: EpicResourceType;
  resourceId: string;
  sourcePaths: string[];
}

export interface EpicPatientFacts {
  id: string;
  name?: string;
  birthDate?: string;
  gender?: string;
  active?: boolean;
  preferredLanguage?: string;
  provenance: EpicProvenance;
}

export interface EpicMedicationFact {
  id: string;
  display?: string;
  status?: string;
  intent?: string;
  authoredOn?: string;
  instruction?: string;
  provenance: EpicProvenance;
}

export interface EpicLabFact {
  id: string;
  name?: string;
  value?: string;
  unit?: string;
  referenceRange?: string;
  interpretation?: string;
  effectiveAt?: string;
  issuedAt?: string;
  provenance: EpicProvenance;
}

export interface EpicAppointmentFact {
  id: string;
  status?: string;
  service?: string;
  start?: string;
  end?: string;
  location?: string;
  provenance: EpicProvenance;
}

export interface EpicClinicalContext {
  captureId: string;
  capturedAt: string;
  fhirVersion: '4.0.1';
  sourceLabel: 'Epic FHIR Sandbox';
  sourceEnvironment: 'Non-Production Sandbox';
  sourceIdentity: string;
  presentationAlias: 'Camila Lopez';
  identityMatch: boolean;
  patient: EpicPatientFacts;
  medications: EpicMedicationFact[];
  labs: EpicLabFact[];
  appointments: EpicAppointmentFact[];
  resources: EpicManifestResource[];
  requests: EpicRequestEvidence[];
}

export type EpicCaptureState =
  | { status: 'available'; context: EpicClinicalContext }
  | { status: 'unavailable'; reason: string };

export type JsonRecord = Record<string, unknown>;

export const ALLOWED_TYPES = new Set<EpicResourceType>(['Patient', 'Appointment', 'MedicationRequest', 'Observation']);
export const RESOURCE_ID = /^[A-Za-z0-9.-]{1,128}$/;
export const SHA256 = /^[a-f0-9]{64}$/;
export const CAPTURE_ID = /^epic-sandbox-[0-9]{8}T[0-9]{6}Z-[a-f0-9]{8}$/;

const resourceDocuments = import.meta.glob('./epic-capture/resources/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

export const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isString = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

export const asRecord = (value: unknown): JsonRecord | undefined => isRecord(value) ? value : undefined;

export const asArray = (value: unknown): unknown[] => Array.isArray(value) ? value : [];

export const firstString = (...values: unknown[]): string | undefined =>
  values.find((value): value is string => isString(value));

export const nestedText = (value: unknown): string | undefined => {
  const record = asRecord(value);
  if (!record) return undefined;
  const coding = asArray(record.coding).map(asRecord).find(Boolean);
  return firstString(record.text, coding?.display);
};

const normalizeResourceDocuments = (documents: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(documents).map(([modulePath, value]) => {
    const resourceSegment = modulePath.match(/resources\/(.+\.json)$/)?.[0];
    return [resourceSegment ?? modulePath.replace(/^\.\//, ''), value];
  }));

export const parseManifestResource = (value: unknown): EpicManifestResource | undefined => {
  const resource = asRecord(value);
  if (!resource || !isString(resource.resourceType) || !ALLOWED_TYPES.has(resource.resourceType as EpicResourceType)) return undefined;
  if (!isString(resource.id) || !RESOURCE_ID.test(resource.id)) return undefined;
  if (!isString(resource.path) || !/^resources\/(patient|appointment|medication-request|observation)-[A-Za-z0-9.-]+\.json$/.test(resource.path)) return undefined;
  if (!isString(resource.sha256) || !SHA256.test(resource.sha256)) return undefined;
  return {
    resourceType: resource.resourceType as EpicResourceType,
    id: resource.id,
    path: resource.path,
    sha256: resource.sha256,
  };
};

export const parseRequest = (value: unknown): EpicRequestEvidence | undefined => {
  const request = asRecord(value);
  if (!request || request.method !== 'GET' || !isString(request.resourceType) || !ALLOWED_TYPES.has(request.resourceType as EpicResourceType)) return undefined;
  if (!isString(request.redactedPath) || !/^\/(Patient|Appointment|MedicationRequest|Observation)(\/|\?)/.test(request.redactedPath)) return undefined;
  return {
    method: 'GET',
    resourceType: request.resourceType as EpicResourceType,
    redactedPath: request.redactedPath,
  };
};

export const patientReferenceMatches = (resource: JsonRecord, patientId: string, type: EpicResourceType): boolean => {
  const expected = `Patient/${patientId}`;
  if (type === 'Patient') return resource.id === patientId;
  if (type === 'Appointment') {
    return asArray(resource.participant).some((item) => {
      const actor = asRecord(asRecord(item)?.actor);
      return actor?.reference === expected;
    });
  }
  return asRecord(resource.subject)?.reference === expected;
};

const isLaboratoryObservation = (resource: JsonRecord): boolean =>
  asArray(resource.category).some((category) =>
    asArray(asRecord(category)?.coding).some((coding) => asRecord(coding)?.code === 'laboratory'));

export const patientName = (resource: JsonRecord): string | undefined => {
  const names = asArray(resource.name).map(asRecord).filter((item): item is JsonRecord => Boolean(item));
  const chosen = names.find((name) => name.use === 'official') ?? names.find((name) => name.use === 'usual') ?? names[0];
  if (!chosen) return undefined;
  if (isString(chosen.text)) return chosen.text;
  const given = asArray(chosen.given).filter(isString).join(' ');
  const family = isString(chosen.family) ? chosen.family : '';
  return `${given} ${family}`.trim() || undefined;
};

const preferredLanguage = (resource: JsonRecord): string | undefined => {
  const communication = asArray(resource.communication).map(asRecord).filter((item): item is JsonRecord => Boolean(item));
  const preferred = communication.find((item) => item.preferred === true) ?? communication[0];
  return nestedText(preferred?.language);
};

export const mapPatient = (resource: JsonRecord): EpicPatientFacts => ({
  id: String(resource.id),
  name: patientName(resource),
  birthDate: isString(resource.birthDate) ? resource.birthDate : undefined,
  gender: isString(resource.gender) ? resource.gender : undefined,
  active: typeof resource.active === 'boolean' ? resource.active : undefined,
  preferredLanguage: preferredLanguage(resource),
  provenance: {
    resourceType: 'Patient',
    resourceId: String(resource.id),
    sourcePaths: ['Patient.name', 'Patient.birthDate', 'Patient.gender', 'Patient.active', 'Patient.communication.language'],
  },
});

const mapMedication = (resource: JsonRecord): EpicMedicationFact => {
  const medicationReference = asRecord(resource.medicationReference);
  const instruction = asRecord(asArray(resource.dosageInstruction)[0]);
  return {
    id: String(resource.id),
    display: firstString(medicationReference?.display, nestedText(resource.medicationCodeableConcept)),
    status: isString(resource.status) ? resource.status : undefined,
    intent: isString(resource.intent) ? resource.intent : undefined,
    authoredOn: isString(resource.authoredOn) ? resource.authoredOn : undefined,
    instruction: firstString(instruction?.patientInstruction, instruction?.text),
    provenance: {
      resourceType: 'MedicationRequest',
      resourceId: String(resource.id),
      sourcePaths: ['MedicationRequest.medicationReference.display', 'MedicationRequest.status', 'MedicationRequest.intent', 'MedicationRequest.authoredOn', 'MedicationRequest.dosageInstruction'],
    },
  };
};

export const quantityValue = (quantity: JsonRecord | undefined): string | undefined => {
  const value = quantity?.value;
  return typeof value === 'number' || isString(value) ? String(value) : undefined;
};

const referenceRange = (resource: JsonRecord): string | undefined => {
  const range = asRecord(asArray(resource.referenceRange)[0]);
  if (!range) return undefined;
  if (isString(range.text)) return range.text;
  const low = asRecord(range.low);
  const high = asRecord(range.high);
  const lowValue = quantityValue(low);
  const highValue = quantityValue(high);
  const unit = firstString(low?.unit, high?.unit);
  return lowValue && highValue ? `${lowValue} - ${highValue}${unit ? ` ${unit}` : ''}` : undefined;
};

const mapLab = (resource: JsonRecord): EpicLabFact => {
  const quantity = asRecord(resource.valueQuantity);
  const interpretation = asRecord(asArray(resource.interpretation)[0]);
  return {
    id: String(resource.id),
    name: nestedText(resource.code),
    value: firstString(quantityValue(quantity), nestedText(resource.valueCodeableConcept), isString(resource.valueString) ? resource.valueString : undefined),
    unit: firstString(quantity?.unit, quantity?.code),
    referenceRange: referenceRange(resource),
    interpretation: nestedText(interpretation),
    effectiveAt: isString(resource.effectiveDateTime) ? resource.effectiveDateTime : undefined,
    issuedAt: isString(resource.issued) ? resource.issued : undefined,
    provenance: {
      resourceType: 'Observation',
      resourceId: String(resource.id),
      sourcePaths: ['Observation.code', 'Observation.value[x]', 'Observation.referenceRange', 'Observation.interpretation', 'Observation.effectiveDateTime', 'Observation.issued'],
    },
  };
};

const appointmentLocation = (resource: JsonRecord): string | undefined => {
  const actors = asArray(resource.participant)
    .map((participant) => asRecord(asRecord(participant)?.actor))
    .filter((actor): actor is JsonRecord => Boolean(actor));
  const location = actors.find((actor) => isString(actor.reference) && actor.reference.startsWith('Location/'));
  return firstString(location?.display, location?.reference);
};

export const mapAppointment = (resource: JsonRecord): EpicAppointmentFact => ({
  id: String(resource.id),
  status: isString(resource.status) ? resource.status : undefined,
  service: firstString(resource.description, nestedText(asArray(resource.serviceType)[0])),
  start: isString(resource.start) ? resource.start : undefined,
  end: isString(resource.end) ? resource.end : undefined,
  location: appointmentLocation(resource),
  provenance: {
    resourceType: 'Appointment',
    resourceId: String(resource.id),
    sourcePaths: ['Appointment.status', 'Appointment.serviceType', 'Appointment.description', 'Appointment.start', 'Appointment.end', 'Appointment.participant.actor'],
  },
});

export const sortAppointments = (appointments: EpicAppointmentFact[], capturedAt: string): EpicAppointmentFact[] => {
  const captureTime = Date.parse(capturedAt);
  return [...appointments].sort((left, right) => {
    const leftTime = left.start ? Date.parse(left.start) : Number.NEGATIVE_INFINITY;
    const rightTime = right.start ? Date.parse(right.start) : Number.NEGATIVE_INFINITY;
    const leftUpcoming = leftTime >= captureTime;
    const rightUpcoming = rightTime >= captureTime;
    if (leftUpcoming !== rightUpcoming) return leftUpcoming ? -1 : 1;
    return leftUpcoming ? leftTime - rightTime : rightTime - leftTime;
  });
};

export const createEpicCaptureState = (manifestValue: unknown, documentValues: Record<string, unknown>): EpicCaptureState => {
  try {
    const manifest = asRecord(manifestValue);
    if (!manifest) throw new Error('Manifest is not an object.');
    if (manifest.schemaVersion !== 1 || manifest.mode !== 'captured_epic_sandbox' || manifest.fhirVersion !== '4.0.1') throw new Error('Manifest version or mode is unsupported.');
    if (!isString(manifest.captureId) || !CAPTURE_ID.test(manifest.captureId) || !isString(manifest.capturedAt) || Number.isNaN(Date.parse(manifest.capturedAt))) throw new Error('Capture identity or timestamp is invalid.');

    const source = asRecord(manifest.source);
    const patientSelection = asRecord(manifest.patient);
    const scenario = asRecord(manifest.scenarioBinding);
    const review = asRecord(manifest.review);
    if (source?.label !== 'Epic FHIR Sandbox' || source.environment !== 'Non-Production Sandbox') throw new Error('Source is not the approved Epic Sandbox.');
    if (patientSelection?.resourceType !== 'Patient' || !isString(patientSelection.id)) throw new Error('Selected Patient is invalid.');
    if (scenario?.scenarioId !== 'camila-demo-v2' || scenario.presentationAlias !== 'Camila Lopez' || scenario.identityMatch !== true || !isString(scenario.sourceIdentity)) throw new Error('Scenario identity binding is invalid.');
    if (review?.status !== 'approved_for_frontend' || review.distribution !== 'reviewed_epic_sandbox_test_data') throw new Error('Capture is not approved for frontend distribution.');

    const resources = asArray(manifest.resources).map(parseManifestResource);
    if (resources.length === 0 || resources.some((resource) => !resource)) throw new Error('Resource manifest is invalid.');
    const typedResources = resources as EpicManifestResource[];
    if (new Set(typedResources.map((resource) => resource.path)).size !== typedResources.length) throw new Error('Resource paths are not unique.');
    const requests = asArray(manifest.requests).map(parseRequest);
    if (requests.length === 0 || requests.some((request) => !request)) throw new Error('Request evidence is invalid.');

    const normalizedDocuments = normalizeResourceDocuments(documentValues);
    const loaded = typedResources.map((entry) => {
      const document = asRecord(normalizedDocuments[entry.path]);
      if (!document || document.resourceType !== entry.resourceType || document.id !== entry.id) throw new Error(`Resource reference mismatch: ${entry.path}`);
      if (!patientReferenceMatches(document, patientSelection.id as string, entry.resourceType)) throw new Error(`Resource patient mismatch: ${entry.path}`);
      if (entry.resourceType === 'Observation' && !isLaboratoryObservation(document)) throw new Error(`Observation is not laboratory data: ${entry.path}`);
      return { entry, document };
    });

    const patientResources = loaded.filter(({ entry }) => entry.resourceType === 'Patient');
    if (patientResources.length !== 1) throw new Error('Capture must contain exactly one Patient.');
    const mappedPatient = mapPatient(patientResources[0].document);
    if (mappedPatient.name !== scenario.sourceIdentity) throw new Error('Source identity does not match the selected Patient.');

    const medications = loaded.filter(({ entry }) => entry.resourceType === 'MedicationRequest').map(({ document }) => mapMedication(document));
    const labs = loaded.filter(({ entry }) => entry.resourceType === 'Observation').map(({ document }) => mapLab(document));
    const appointments = loaded.filter(({ entry }) => entry.resourceType === 'Appointment').map(({ document }) => mapAppointment(document));

    return {
      status: 'available',
      context: {
        captureId: manifest.captureId,
        capturedAt: manifest.capturedAt,
        fhirVersion: '4.0.1',
        sourceLabel: 'Epic FHIR Sandbox',
        sourceEnvironment: 'Non-Production Sandbox',
        sourceIdentity: scenario.sourceIdentity,
        presentationAlias: 'Camila Lopez',
        identityMatch: true,
        patient: mappedPatient,
        medications,
        labs: labs.sort((left, right) => (right.effectiveAt ?? right.issuedAt ?? '').localeCompare(left.effectiveAt ?? left.issuedAt ?? '')),
        appointments: sortAppointments(appointments, manifest.capturedAt),
        resources: typedResources,
        requests: requests as EpicRequestEvidence[],
      },
    };
  } catch (error) {
    return { status: 'unavailable', reason: error instanceof Error ? error.message : 'Capture validation failed.' };
  }
};

export const EPIC_CAPTURE_STATE = createEpicCaptureState(manifestDocument, resourceDocuments);

export const formatEpicCaptureTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
  return `${formatted} CT`;
};

export const formatEpicSourceDate = (value?: string): string | undefined => {
  if (!value) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)));
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)} CT`;
};
