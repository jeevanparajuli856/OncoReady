/**
 * Reviewed Epic Sandbox roster captures.
 *
 * EPIC-001's scenario capture (`epicCapture.ts`) is deliberately fail-closed:
 * one bad field makes the whole Camila context unavailable. A roster cannot
 * work that way: one unreadable package must cost one row, not the list, so
 * every package here is validated independently and degrades on its own.
 *
 * Each package is a v2 manifest describing exactly one patient, with no
 * scenario alias attached: roster patients are presented under the identity
 * the Sandbox actually recorded.
 */
import {
  EPIC_CAPTURE_STATE,
  CAPTURE_ID,
  type EpicAppointmentFact,
  type EpicManifestResource,
  type EpicPatientFacts,
  type EpicProvenance,
  type EpicRequestEvidence,
  type EpicResourceType,
  type JsonRecord,
  asArray,
  asRecord,
  firstString,
  isString,
  mapAppointment,
  mapPatient,
  nestedText,
  parseManifestResource,
  parseRequest,
  patientReferenceMatches,
  quantityValue,
  sortAppointments,
} from './epicCapture';

export interface EpicVitalFact {
  id: string;
  name?: string;
  loincCode?: string;
  value?: string;
  unit?: string;
  effectiveAt?: string;
  provenance: EpicProvenance;
}

export interface EpicRosterPatient {
  patientId: string;
  captureId: string;
  capturedAt: string;
  sourceIdentity: string;
  mrn?: string;
  bounded: boolean;
  observationCategories: string[];
  patient: EpicPatientFacts;
  vitals: EpicVitalFact[];
  appointments: EpicAppointmentFact[];
  resources: EpicManifestResource[];
  requests: EpicRequestEvidence[];
}

export type EpicRosterEntry =
  | { status: 'available'; patientId: string; patient: EpicRosterPatient }
  | { status: 'unavailable'; patientId: string; reason: string };

const LOINC_SYSTEM = 'http://loinc.org';

const loincCode = (resource: JsonRecord): string | undefined => {
  const code = asRecord(resource.code);
  if (!code) return undefined;
  const coding = asArray(code.coding)
    .map(asRecord)
    .find((entry) => entry?.system === LOINC_SYSTEM && isString(entry.code));
  return isString(coding?.code) ? coding.code : undefined;
};

const observationHasCategory = (resource: JsonRecord, expected: string): boolean =>
  asArray(resource.category).some((category) =>
    asArray(asRecord(category)?.coding).some((coding) => asRecord(coding)?.code === expected));

/**
 * Blood pressure arrives as a panel: the reading lives on the components, not
 * on the parent. Render it the way a chart does, `systolic / diastolic`.
 */
const componentReading = (resource: JsonRecord): { value?: string; unit?: string } => {
  const components = asArray(resource.component)
    .map(asRecord)
    .filter((entry): entry is JsonRecord => Boolean(entry));
  if (components.length === 0) return {};
  const readings = components.map((component) => {
    const quantity = asRecord(component.valueQuantity);
    return { value: quantityValue(quantity), unit: firstString(quantity?.unit, quantity?.code) };
  }).filter((reading) => reading.value !== undefined);
  if (readings.length === 0) return {};
  return {
    value: readings.map((reading) => reading.value).join(' / '),
    unit: readings.find((reading) => reading.unit)?.unit,
  };
};

const mapVital = (resource: JsonRecord): EpicVitalFact => {
  const quantity = asRecord(resource.valueQuantity);
  const direct = quantityValue(quantity);
  const panel = direct === undefined ? componentReading(resource) : {};
  return {
    id: String(resource.id),
    name: nestedText(resource.code),
    loincCode: loincCode(resource),
    value: firstString(
      direct,
      panel.value,
      nestedText(resource.valueCodeableConcept),
      isString(resource.valueString) ? resource.valueString : undefined,
    ),
    unit: firstString(quantity?.unit, quantity?.code, panel.unit),
    effectiveAt: firstString(resource.effectiveDateTime, resource.issued),
    provenance: {
      resourceType: 'Observation',
      resourceId: String(resource.id),
      sourcePaths: [
        'Observation.code',
        'Observation.value[x]',
        'Observation.component.valueQuantity',
        'Observation.effectiveDateTime',
      ],
    },
  };
};

/** Epic records an MRN as a typed identifier; absent is left absent. */
const medicalRecordNumber = (resource: JsonRecord): string | undefined => {
  const identifiers = asArray(resource.identifier)
    .map(asRecord)
    .filter((entry): entry is JsonRecord => Boolean(entry));
  const mrn = identifiers.find((identifier) => {
    const type = asRecord(identifier.type);
    const codeMatch = asArray(type?.coding).some((coding) => asRecord(coding)?.code === 'MR');
    const textMatch = isString(type?.text) && /mrn|medical record/i.test(type.text);
    return codeMatch || textMatch;
  });
  return isString(mrn?.value) ? mrn.value : undefined;
};

const sortVitals = (vitals: EpicVitalFact[]): EpicVitalFact[] =>
  [...vitals].sort((left, right) => {
    const leftTime = left.effectiveAt ? Date.parse(left.effectiveAt) : Number.NEGATIVE_INFINITY;
    const rightTime = right.effectiveAt ? Date.parse(right.effectiveAt) : Number.NEGATIVE_INFINITY;
    return rightTime - leftTime;
  });

/**
 * Validate one roster package. Throws a safe operator-readable reason; the
 * caller turns that into a single unavailable row.
 */
const createRosterPatient = (
  manifestValue: unknown,
  documentsForPackage: Record<string, unknown>,
): EpicRosterPatient => {
  const manifest = asRecord(manifestValue);
  if (!manifest) throw new Error('Manifest is missing.');
  if (manifest.schemaVersion !== 2) throw new Error('Unsupported roster manifest version.');
  if (manifest.mode !== 'captured_epic_sandbox') throw new Error('Capture mode is not a reviewed Sandbox capture.');
  if (manifest.fhirVersion !== '4.0.1') throw new Error('Unsupported FHIR version.');
  if (!isString(manifest.captureId) || !CAPTURE_ID.test(manifest.captureId)) throw new Error('Capture id is malformed.');
  if (!isString(manifest.capturedAt) || Number.isNaN(Date.parse(manifest.capturedAt))) throw new Error('Capture time is malformed.');

  const source = asRecord(manifest.source);
  if (source?.label !== 'Epic FHIR Sandbox' || source?.environment !== 'Non-Production Sandbox') {
    throw new Error('Capture source is not the Epic Non-Production Sandbox.');
  }

  const review = asRecord(manifest.review);
  if (review?.status !== 'approved_for_frontend' || review?.distribution !== 'reviewed_epic_sandbox_test_data') {
    throw new Error('Capture is not reviewed for frontend distribution.');
  }

  const patientRef = asRecord(manifest.patient);
  if (patientRef?.resourceType !== 'Patient' || !isString(patientRef.id)) throw new Error('Manifest patient is missing.');
  const patientId = patientRef.id;
  if (!isString(manifest.sourceIdentity)) throw new Error('Manifest source identity is missing.');

  const resources = asArray(manifest.resources).map(parseManifestResource);
  if (resources.length === 0 || resources.some((entry) => entry === undefined)) throw new Error('Manifest resource list is malformed.');
  const entries = resources as EpicManifestResource[];
  if (new Set(entries.map((entry) => entry.path)).size !== entries.length) throw new Error('Manifest contains duplicate resource paths.');

  const requests = asArray(manifest.requests).map(parseRequest);
  if (requests.length === 0 || requests.some((entry) => entry === undefined)) throw new Error('Manifest request evidence is malformed.');

  const categories = asArray(manifest.observationCategories).filter(isString);

  const loaded = entries.map((entry) => {
    const document = asRecord(documentsForPackage[entry.path]);
    if (!document) throw new Error(`Resource reference mismatch: ${entry.path}`);
    if (document.resourceType !== entry.resourceType || document.id !== entry.id) {
      throw new Error(`Resource reference mismatch: ${entry.path}`);
    }
    if (!patientReferenceMatches(document, patientId, entry.resourceType as EpicResourceType)) {
      throw new Error(`Resource is outside the captured patient: ${entry.path}`);
    }
    if (entry.resourceType === 'Observation' && !observationHasCategory(document, 'vital-signs')) {
      throw new Error(`Observation is not a vital sign: ${entry.path}`);
    }
    return { entry, document };
  });

  const patientDocuments = loaded.filter(({ entry }) => entry.resourceType === 'Patient');
  if (patientDocuments.length !== 1) throw new Error('Capture must contain exactly one Patient.');

  const appointments = loaded
    .filter(({ entry }) => entry.resourceType === 'Appointment')
    .map(({ document }) => mapAppointment(document));
  const vitals = loaded
    .filter(({ entry }) => entry.resourceType === 'Observation')
    .map(({ document }) => mapVital(document));

  return {
    patientId,
    captureId: manifest.captureId,
    capturedAt: manifest.capturedAt,
    sourceIdentity: manifest.sourceIdentity,
    mrn: medicalRecordNumber(patientDocuments[0].document),
    bounded: manifest.bounded === true,
    observationCategories: categories,
    patient: mapPatient(patientDocuments[0].document),
    vitals: sortVitals(vitals),
    appointments: sortAppointments(appointments, manifest.capturedAt),
    resources: entries,
    requests: requests as EpicRequestEvidence[],
  };
};

/** Group flat module paths into `{ packageId: { 'resources/x.json': doc } }`. */
const groupDocumentsByPackage = (documents: Record<string, unknown>): Record<string, Record<string, unknown>> => {
  const grouped: Record<string, Record<string, unknown>> = {};
  for (const [modulePath, value] of Object.entries(documents)) {
    const match = modulePath.match(/epic-roster\/([^/]+)\/(resources\/.+\.json)$/);
    if (!match) continue;
    const [, packageId, resourcePath] = match;
    grouped[packageId] = { ...grouped[packageId], [resourcePath]: value };
  }
  return grouped;
};

export const createEpicRoster = (
  manifestValues: Record<string, unknown>,
  documentValues: Record<string, unknown>,
): EpicRosterEntry[] => {
  const documentsByPackage = groupDocumentsByPackage(documentValues);
  const entries: EpicRosterEntry[] = [];
  for (const [modulePath, manifestValue] of Object.entries(manifestValues)) {
    const packageId = modulePath.match(/epic-roster\/([^/]+)\/manifest\.json$/)?.[1];
    if (!packageId) continue;
    try {
      const patient = createRosterPatient(manifestValue, documentsByPackage[packageId] ?? {});
      entries.push({ status: 'available', patientId: patient.patientId, patient });
    } catch (error) {
      entries.push({
        status: 'unavailable',
        patientId: packageId,
        reason: error instanceof Error ? error.message : 'Roster capture could not be read.',
      });
    }
  }
  return entries.sort((left, right) => left.patientId.localeCompare(right.patientId));
};

const rosterManifests = import.meta.glob('./epic-roster/*/manifest.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

const rosterDocuments = import.meta.glob('./epic-roster/*/resources/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

export const EPIC_ROSTER: EpicRosterEntry[] = createEpicRoster(rosterManifests, rosterDocuments);

export const availableRosterPatients = (roster: EpicRosterEntry[] = EPIC_ROSTER): EpicRosterPatient[] =>
  roster.flatMap((entry) => (entry.status === 'available' ? [entry.patient] : []));

export const findRosterPatient = (
  patientId: string,
  roster: EpicRosterEntry[] = EPIC_ROSTER,
): EpicRosterPatient | undefined =>
  availableRosterPatients(roster).find((patient) => patient.patientId === patientId);

/**
 * Vital signs captured for the patient the prepared scenario is bound to.
 *
 * The id comes from the frozen scenario capture rather than a second literal,
 * so the two packages can never drift apart. Returns an empty list when either
 * package is missing, which merges to scenario-only vitals.
 */
export const scenarioRosterVitals = (roster: EpicRosterEntry[] = EPIC_ROSTER): EpicVitalFact[] => {
  if (EPIC_CAPTURE_STATE.status !== 'available') return [];
  return findRosterPatient(EPIC_CAPTURE_STATE.context.patient.id, roster)?.vitals ?? [];
};
