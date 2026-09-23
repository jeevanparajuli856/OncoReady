/**
 * Merge the prepared OncoReady scenario vitals with vital signs captured from
 * the Epic Sandbox.
 *
 * The scenario vitals are authoritative: where both sources describe the same
 * measurement, the scenario value is kept and the Epic reading is dropped.
 * Epic readings with no scenario counterpart are appended so the record shows
 * real captured data alongside the prepared story, each row labelled with
 * where it came from.
 *
 * Scenario vitals carry no code system at all, only a display name, so the
 * two sides are reconciled through a small canonical-measurement key derived
 * from LOINC where Epic supplies it, and from normalised display text where it
 * does not.
 */
import type { VitalSign } from '../types';
import type { EpicVitalFact } from './epicRoster';

export type VitalSource = 'SCENARIO' | 'EPIC_SANDBOX';

export interface MergedVital {
  key: string;
  name: string;
  value: string;
  unit?: string;
  collectedAt?: string;
  status?: VitalSign['status'];
  source: VitalSource;
  sourceLabel: string;
  epicResourceId?: string;
}

/** Canonical measurement identities shared across both sources. */
type MeasurementKey =
  | 'BODY_TEMPERATURE'
  | 'BLOOD_PRESSURE'
  | 'HEART_RATE'
  | 'OXYGEN_SATURATION'
  | 'BODY_WEIGHT'
  | 'BODY_HEIGHT'
  | 'RESPIRATORY_RATE'
  | 'BODY_MASS_INDEX'
  | 'HEAD_CIRCUMFERENCE';

const LOINC_TO_MEASUREMENT: Record<string, MeasurementKey> = {
  // Body temperature
  '8310-5': 'BODY_TEMPERATURE',
  '8331-1': 'BODY_TEMPERATURE',
  '8332-0': 'BODY_TEMPERATURE',
  // Blood pressure (panel and its components)
  '85354-9': 'BLOOD_PRESSURE',
  '55284-4': 'BLOOD_PRESSURE',
  '8480-6': 'BLOOD_PRESSURE',
  '8462-4': 'BLOOD_PRESSURE',
  // Heart rate / pulse
  '8867-4': 'HEART_RATE',
  '8716-3': 'HEART_RATE',
  // Oxygen saturation
  '2708-6': 'OXYGEN_SATURATION',
  '59408-5': 'OXYGEN_SATURATION',
  '20564-1': 'OXYGEN_SATURATION',
  // Body weight
  '29463-7': 'BODY_WEIGHT',
  '3141-9': 'BODY_WEIGHT',
  // Measurements with no prepared scenario counterpart
  '8302-2': 'BODY_HEIGHT',
  '3137-7': 'BODY_HEIGHT',
  '9279-1': 'RESPIRATORY_RATE',
  '39156-5': 'BODY_MASS_INDEX',
  '9843-4': 'HEAD_CIRCUMFERENCE',
};

const TEXT_TO_MEASUREMENT: Array<[RegExp, MeasurementKey]> = [
  [/(body)?temp/, 'BODY_TEMPERATURE'],
  [/bloodpressure|^bp$|systolic|diastolic/, 'BLOOD_PRESSURE'],
  [/heartrate|pulse/, 'HEART_RATE'],
  [/oxygensat|spo2|o2sat|pulseox/, 'OXYGEN_SATURATION'],
  [/weight/, 'BODY_WEIGHT'],
  [/height|stature/, 'BODY_HEIGHT'],
  [/respiratoryrate|resprate/, 'RESPIRATORY_RATE'],
  [/bodymassindex|^bmi$/, 'BODY_MASS_INDEX'],
  [/headcircumference/, 'HEAD_CIRCUMFERENCE'],
];

const normalizeText = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const measurementFromText = (name?: string): MeasurementKey | undefined => {
  if (!name) return undefined;
  const normalized = normalizeText(name);
  return TEXT_TO_MEASUREMENT.find(([pattern]) => pattern.test(normalized))?.[1];
};

/** Scenario vitals have only a name, so text is the single available signal. */
export const scenarioMeasurementKey = (vital: VitalSign): MeasurementKey | undefined =>
  measurementFromText(vital.name);

/** Epic vitals prefer LOINC and fall back to the display text Epic supplied. */
export const epicMeasurementKey = (vital: EpicVitalFact): MeasurementKey | undefined => {
  const fromCode = vital.loincCode ? LOINC_TO_MEASUREMENT[vital.loincCode] : undefined;
  return fromCode ?? measurementFromText(vital.name);
};

export const SCENARIO_SOURCE_LABEL = 'OncoReady';
export const EPIC_SOURCE_LABEL = 'Hospital Epic Sandbox';

const epicTime = (vital: EpicVitalFact): number =>
  vital.effectiveAt ? Date.parse(vital.effectiveAt) : Number.NEGATIVE_INFINITY;

/**
 * Scenario vitals first, in their prepared order, then the Epic vitals that
 * add something new, most recent first.
 */
export const mergeVitals = (
  scenarioVitals: VitalSign[],
  epicVitals: EpicVitalFact[] = [],
): MergedVital[] => {
  const merged: MergedVital[] = scenarioVitals.map((vital) => ({
    key: `scenario:${vital.name}`,
    name: vital.name,
    value: vital.value,
    unit: vital.unit,
    collectedAt: vital.collectedAt,
    status: vital.status,
    source: 'SCENARIO',
    sourceLabel: SCENARIO_SOURCE_LABEL,
  }));

  const claimed = new Set<MeasurementKey>();
  const unmatchedScenarioNames = new Set<string>();
  for (const vital of scenarioVitals) {
    const key = scenarioMeasurementKey(vital);
    if (key) claimed.add(key);
    else unmatchedScenarioNames.add(normalizeText(vital.name));
  }

  // Most recent reading wins within a single measurement on the Epic side too,
  // so one patient's repeated observations do not stack up in the UI.
  const bestByMeasurement = new Map<MeasurementKey, EpicVitalFact>();
  const uncodedEpicVitals: EpicVitalFact[] = [];
  for (const vital of [...epicVitals].sort((left, right) => epicTime(right) - epicTime(left))) {
    const key = epicMeasurementKey(vital);
    if (!key) {
      // No canonical identity: keep it unless its display name already appears.
      if (!unmatchedScenarioNames.has(normalizeText(vital.name ?? ''))) {
        uncodedEpicVitals.push(vital);
      }
      continue;
    }
    if (claimed.has(key)) continue; // scenario value wins
    if (!bestByMeasurement.has(key)) bestByMeasurement.set(key, vital);
  }

  const additions = [...bestByMeasurement.values(), ...uncodedEpicVitals]
    .filter((vital) => vital.value !== undefined)
    .sort((left, right) => epicTime(right) - epicTime(left));

  for (const vital of additions) {
    merged.push({
      key: `epic:${vital.id}`,
      name: vital.name ?? 'Unnamed observation',
      value: vital.value as string,
      unit: vital.unit,
      collectedAt: vital.effectiveAt,
      source: 'EPIC_SANDBOX',
      sourceLabel: EPIC_SOURCE_LABEL,
      epicResourceId: vital.id,
    });
  }

  return merged;
};
