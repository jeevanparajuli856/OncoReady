import { describe, expect, it } from 'vitest';
import { INITIAL_STATE } from '../src/state/workflowState';
import { scenarioRosterVitals } from '../src/data/epicRoster';
import { mergeVitals } from '../src/data/vitalsMerge';

/**
 * Pinned against the committed Epic capture rather than a fixture: the
 * prepared scenario value must survive every collision with real captured
 * data, and a captured reading must never replace one.
 */
describe('captured Epic vitals never displace prepared scenario vitals', () => {
  const epicVitals = scenarioRosterVitals();
  const merged = mergeVitals(INITIAL_STATE.vitals, epicVitals);

  it('keeps every prepared value byte for byte', () => {
    for (const vital of INITIAL_STATE.vitals) {
      const row = merged.find((candidate) => candidate.name === vital.name);
      expect(row?.value).toBe(vital.value);
      expect(row?.source).toBe('SCENARIO');
    }
  });

  it('drops the captured blood pressure readings that collide with the prepared one', () => {
    // The Sandbox chart holds only blood pressure for this patient, and the
    // scenario already carries a blood pressure, so nothing is added.
    expect(epicVitals.length).toBeGreaterThan(0);
    const bloodPressure = merged.filter((row) => /blood pressure|^bp$/i.test(row.name));
    expect(bloodPressure).toHaveLength(1);
    expect(bloodPressure[0].value).toBe('124 / 78');
    expect(bloodPressure[0].source).toBe('SCENARIO');
  });

  it('adds no captured row that duplicates a prepared measurement', () => {
    const preparedNames = new Set(INITIAL_STATE.vitals.map((vital) => vital.name));
    for (const row of merged.filter((candidate) => candidate.source === 'EPIC_SANDBOX')) {
      expect(preparedNames.has(row.name)).toBe(false);
    }
  });
});
