import { describe, expect, it } from 'vitest';
import { INITIAL_STATE } from '../src/state/workflowState';
import type { EpicVitalFact } from '../src/data/epicRoster';
import { EPIC_SOURCE_LABEL, SCENARIO_SOURCE_LABEL, mergeVitals } from '../src/data/vitalsMerge';

const epicVital = (overrides: Partial<EpicVitalFact> & { id: string }): EpicVitalFact => ({
  name: 'Heart rate',
  loincCode: '8867-4',
  value: '88',
  unit: '/min',
  effectiveAt: '2019-05-28T14:21:00Z',
  provenance: { resourceType: 'Observation', resourceId: overrides.id, sourcePaths: [] },
  ...overrides,
});

describe('mergeVitals', () => {
  it('keeps every prepared scenario vital in its prepared order', () => {
    const merged = mergeVitals(INITIAL_STATE.vitals, []);

    expect(merged.map((vital) => vital.name)).toEqual(INITIAL_STATE.vitals.map((vital) => vital.name));
    expect(merged.every((vital) => vital.source === 'SCENARIO')).toBe(true);
    expect(merged[0].sourceLabel).toBe(SCENARIO_SOURCE_LABEL);
  });

  it('drops an Epic vital that duplicates a scenario measurement and keeps the scenario value', () => {
    const merged = mergeVitals(INITIAL_STATE.vitals, [epicVital({ id: 'obs-hr' })]);

    const heartRates = merged.filter((vital) => /pulse|heart/i.test(vital.name));
    expect(heartRates).toHaveLength(1);
    expect(heartRates[0].source).toBe('SCENARIO');
    expect(heartRates[0].value).toBe('72');
    expect(merged).toHaveLength(INITIAL_STATE.vitals.length);
  });

  it('matches duplicates across differing display names via LOINC', () => {
    // Epic calls it "Pulse Oximetry"; the scenario calls it "SpO2 Oxygen
    // Saturation". Only the shared LOINC identity links the two.
    const merged = mergeVitals(INITIAL_STATE.vitals, [
      epicVital({ id: 'obs-spo2', name: 'Pulse Oximetry', loincCode: '59408-5', value: '96' }),
    ]);

    expect(merged).toHaveLength(INITIAL_STATE.vitals.length);
    expect(merged.some((vital) => vital.value === '96')).toBe(false);
  });

  it('appends Epic vitals that have no scenario counterpart, labelled as captured', () => {
    const merged = mergeVitals(INITIAL_STATE.vitals, [
      epicVital({ id: 'obs-rr', name: 'Respiratory rate', loincCode: '9279-1', value: '16', unit: '/min' }),
      epicVital({ id: 'obs-ht', name: 'Height', loincCode: '8302-2', value: '160', unit: 'cm' }),
    ]);

    const added = merged.filter((vital) => vital.source === 'EPIC_SANDBOX');
    expect(added.map((vital) => vital.name)).toEqual(['Respiratory rate', 'Height']);
    expect(added[0].sourceLabel).toBe(EPIC_SOURCE_LABEL);
    expect(added[0].epicResourceId).toBe('obs-rr');
  });

  it('collapses repeated Epic readings of one measurement to the most recent', () => {
    const merged = mergeVitals([], [
      epicVital({ id: 'obs-old', value: '70', effectiveAt: '2019-05-01T10:00:00Z' }),
      epicVital({ id: 'obs-new', value: '81', effectiveAt: '2020-01-01T10:00:00Z' }),
    ]);

    expect(merged).toHaveLength(1);
    expect(merged[0].value).toBe('81');
  });

  it('renders a component-only blood pressure panel without a scenario counterpart', () => {
    const merged = mergeVitals([], [
      epicVital({ id: 'obs-bp', name: 'Blood pressure', loincCode: '85354-9', value: '118 / 74', unit: 'mm[Hg]' }),
    ]);

    expect(merged[0].value).toBe('118 / 74');
    expect(merged[0].source).toBe('EPIC_SANDBOX');
  });

  it('skips Epic observations that carry no value rather than rendering a blank row', () => {
    const merged = mergeVitals([], [
      epicVital({ id: 'obs-empty', name: 'Respiratory rate', loincCode: '9279-1', value: undefined }),
    ]);

    expect(merged).toEqual([]);
  });

  it('is a no-op when no Epic capture is available at all', () => {
    expect(mergeVitals(INITIAL_STATE.vitals)).toHaveLength(INITIAL_STATE.vitals.length);
    expect(mergeVitals([], [])).toEqual([]);
  });
});
