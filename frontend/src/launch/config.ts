export const pricing = {
  pilot: {
    name: 'Small Infusion Center Pilot',
    annual: '$18,000/year',
    monthlyEquivalent: '$1,500/month billed annually',
  },
  enterprise: {
    name: 'Larger oncology programs',
    price: 'Custom pricing',
  },
  usageNote: 'Carrier, voice, and transportation charges are usage-based and separate.',
} as const;

export const routeRoles = {
  '/patient': 'patient',
  '/caregiver': 'caregiver',
  '/staff': 'staff',
  '/transport': 'transport_coordinator',
} as const;

export type WorkspacePath = keyof typeof routeRoles;
export type AppPath = '/' | '/access' | WorkspacePath;

export const accessEntries = [
  { provider: 'Google', destination: 'Patient workspace', path: '/patient' },
  { provider: 'Microsoft', destination: 'Caregiver logistics', path: '/caregiver' },
  { provider: 'Apple', destination: 'Staff continuity hub', path: '/staff' },
  { provider: 'Email', destination: 'Transportation operations', path: '/transport' },
] as const;

