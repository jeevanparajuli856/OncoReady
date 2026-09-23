import { useReducer } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { TransportationWorkspace } from '../src/components/TransportationWorkspace';
import { RideDispatchPanel } from '../src/components/RideDispatchPanel';
import { buildCheckpoint, workflowReducer } from '../src/state/workflowState';

const RideHarness = () => {
  const [state, dispatch] = useReducer(
    workflowReducer,
    buildCheckpoint('SPLIT_WORK', 'CARE_NAVIGATOR', 'CASE_WORKSPACE'),
  );
  return <RideDispatchPanel state={state} reducedMotion onAction={dispatch} />;
};

const TransportationHarness = () => {
  const [state, dispatch] = useReducer(
    workflowReducer,
    buildCheckpoint('SPLIT_WORK', 'TRANSPORTATION'),
  );
  return <TransportationWorkspace state={state} reducedMotion onRideAction={dispatch} />;
};

describe('RIDE-001 provider extensibility labels', () => {
  it('lists every connected transport provider with its capabilities', () => {
    render(<TransportationHarness />);

    expect(screen.getByRole('heading', { name: 'Transport dispatch' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Uber Health' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Lyft Healthcare' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'CareLink NEMT' })).toBeDefined();
    expect(screen.getAllByText('Connected').length).toBe(3);
    // Capability rows are per provider: only NEMT can take a stretcher.
    expect(screen.getAllByText('Stretcher transport').length).toBe(3);
    expect(screen.getAllByText('No rider app needed').length).toBe(3);
    expect(screen.getByRole('button', { name: 'Request ride' })).toBeDefined();
  });

  it('walks the staged recovery and keeps incomplete logistics disabled', () => {
    render(<RideHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Request ride' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dispatch to Uber Health' }));
    fireEvent.click(screen.getByRole('button', { name: 'Record trip cancelled' }));

    expect(screen.getByText('Uber Health')).toBeDefined();
    expect(screen.getByText('Cancelled')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Fail over to Lyft Healthcare' }));
    const contact = screen.getByLabelText('Logistics contact');
    fireEvent.change(contact, { target: { value: '' } });

    const save = screen.getByRole('button', { name: 'Confirm logistics' }) as HTMLButtonElement;
    expect(save.disabled).toBe(true);
    expect(screen.getByText('Every field is required before the plan can be confirmed.')).toBeDefined();

    fireEvent.change(contact, { target: { value: 'Transport desk • (504) 555-0124' } });
    fireEvent.click(save);

    expect(screen.getByText('Plan confirmed')).toBeDefined();
    expect(screen.getAllByText(/Lyft/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Sep 25, 8:15–8:30 AM CT/)).toBeDefined();
    expect(screen.getByText(/Return coordination 1:00–4:00 PM CT/)).toBeDefined();
  });

  it('exposes local previous-trip replay controls and truth labels', () => {
    render(<RideHarness />);

    expect(screen.getByText('uh_2026_0911_ellis')).toBeDefined();
    expect(screen.getByText(/Route shown from pickup and drop-off points/)).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Play trip history' }));
    expect(screen.getByText('Requested')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Pause trip history' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Restart trip history' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Exit trip history' })).toBeDefined();
  });
});
