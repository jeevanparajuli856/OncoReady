import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransportationWorkspace } from '../src/components/TransportationWorkspace';

describe('RIDE-001 provider extensibility labels', () => {
  it('shows CareLink and a truthful non-connected Uber Health preview', () => {
    render(<TransportationWorkspace />);

    expect(screen.getByText('CareLink')).toBeDefined();
    expect(screen.getByText('Synthetic scenario provider')).toBeDefined();
    expect(screen.getByText('Uber Health')).toBeDefined();
    expect(screen.getByText('Integration-ready preview · not connected')).toBeDefined();
    expect(screen.getByText(/No dispatch actions are enabled/i)).toBeDefined();
  });
});
