import React, { useReducer } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { TransportationWorkspace } from '../src/components/TransportationWorkspace';
import { CareLinkRidePanel } from '../src/components/CareLinkRidePanel';
import { buildCheckpoint, workflowReducer } from '../src/state/workflowState';

const RideHarness = () => {
  const [state, dispatch] = useReducer(
    workflowReducer,
    buildCheckpoint('SPLIT_WORK', 'CARE_NAVIGATOR', 'CASE_WORKSPACE'),
  );
  return <CareLinkRidePanel state={state} reducedMotion onAction={dispatch} />;
};

describe('RIDE-001 provider extensibility labels', () => {
  it('shows CareLink and a truthful non-connected Uber Health preview', () => {
    render(<TransportationWorkspace />);

    expect(screen.getByText('CareLink')).toBeDefined();
    expect(screen.getByText('Synthetic scenario provider')).toBeDefined();
    expect(screen.getByText('Uber Health')).toBeDefined();
    expect(screen.getByText('Integration-ready preview · not connected')).toBeDefined();
    expect(screen.getByText(/No dispatch actions are enabled/i)).toBeDefined();
  });

  it('walks the staged recovery and keeps incomplete logistics disabled', () => {
    render(<RideHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Request synthetic ride' }));
    fireEvent.click(screen.getByRole('button', { name: 'Assign fictional CareLink Partner A' }));
    fireEvent.click(screen.getByRole('button', { name: 'Record primary unavailable' }));

    expect(screen.getByText('CareLink Partner A')).toBeDefined();
    expect(screen.getByText('Failed')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Select fictional CareLink Partner B' }));
    const contact = screen.getByLabelText('Logistics contact');
    fireEvent.change(contact, { target: { value: '' } });

    const save = screen.getByRole('button', { name: 'Save recovered logistics' }) as HTMLButtonElement;
    expect(save.disabled).toBe(true);
    expect(screen.getByText('Add every required logistics field to save the current plan.')).toBeDefined();

    fireEvent.change(contact, { target: { value: 'CareLink Dispatch • (504) 555-0124' } });
    fireEvent.click(save);

    expect(screen.getByText('Current plan complete')).toBeDefined();
    expect(screen.getByText(/CareLink Partner B/)).toBeDefined();
    expect(screen.getByText(/Sep 25, 8:15–8:30 AM CT/)).toBeDefined();
    expect(screen.getByText(/Return coordination 1:00–4:00 PM CT/)).toBeDefined();
  });

  it('exposes local previous-trip replay controls and truth labels', () => {
    render(<RideHarness />);

    expect(screen.getByText('carelink-prior-001')).toBeDefined();
    expect(screen.getByText('No live GPS or provider connection')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Play previous trip replay' }));
    expect(screen.getByText('Requested')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Pause previous trip replay' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Restart previous trip replay' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Exit previous trip replay' })).toBeDefined();
  });
});
