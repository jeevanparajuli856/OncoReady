import { describe, expect, it } from 'vitest';
import { accessEntries, pricing, routeRoles } from '../src/launch/config';

describe('LAUNCH-001 public and route configuration', () => {
  it('keeps launch pricing centralized and truthful', () => {
    expect(pricing.pilot.annual).toBe('$18,000/year');
    expect(pricing.pilot.monthlyEquivalent).toBe('$1,500/month billed annually');
    expect(pricing.enterprise.price).toBe('Custom pricing');
  });

  it('maps each local access entry to its minimized role projection', () => {
    expect(accessEntries.map(({ path }) => routeRoles[path])).toEqual([
      'patient',
      'caregiver',
      'staff',
      'transport_coordinator',
    ]);
  });
});
