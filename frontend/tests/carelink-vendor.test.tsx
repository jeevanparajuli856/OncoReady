import { useReducer } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  BACKUP_PROVIDER,
  PREPARED_REPLY,
  PRIMARY_PROVIDER,
  buildCheckpoint,
  deriveVendorTripView,
  parseSavedWorkflowState,
  workflowReducer,
} from '../src/state/workflowState';
import { CareLinkVendorPortal } from '../src/components/CareLinkVendorPortal';
import { TransportationWorkspace } from '../src/components/TransportationWorkspace';
import { uberHealthProvider, lyftHealthcareProvider } from '../src/lib/transportProviders';
import type { WorkflowState } from '../src/types';

const asNavigator = (state: WorkflowState) => workflowReducer(state, { type: 'SET_PERSPECTIVE', payload: 'CARE_NAVIGATOR' });
const asVendor = (state: WorkflowState) => workflowReducer(state, { type: 'SET_PERSPECTIVE', payload: 'CARELINK_VENDOR' });

/** Navigator has sent the trip to the primary CareLink vendor; the vendor is now signed in. */
const offeredToVendor = () => {
  let state = buildCheckpoint('SPLIT_WORK', 'CARE_NAVIGATOR', 'CASE_WORKSPACE');
  state = workflowReducer(state, { type: 'REQUEST_CURRENT_RIDE' });
  state = workflowReducer(state, { type: 'ASSIGN_PRIMARY_RIDE' });
  return asVendor(state);
};

afterEach(() => vi.restoreAllMocks());

describe('RIDE-002 CareLink vendor rules', () => {
  it('shows no offer until the navigator assigns the vendor', () => {
    let state = asVendor(buildCheckpoint('SPLIT_WORK', 'CARE_NAVIGATOR'));
    expect(deriveVendorTripView(state).status).toBe('NONE');
    state = asNavigator(state);
    state = workflowReducer(state, { type: 'REQUEST_CURRENT_RIDE' });
    state = workflowReducer(state, { type: 'ASSIGN_PRIMARY_RIDE' });
    expect(deriveVendorTripView(asVendor(state)).status).toBe('OFFERED');
  });

  it('records acceptance only from the vendor workspace', () => {
    const offered = offeredToVendor();
    expect(workflowReducer(asNavigator(offered), { type: 'VENDOR_ACCEPT_TRIP' }).ride).toEqual(offered.ride);

    const accepted = workflowReducer(offered, { type: 'VENDOR_ACCEPT_TRIP' });
    expect(deriveVendorTripView(accepted).status).toBe('ACCEPTED');
    expect(accepted.ride.assignments[0].vendorAcceptedAt).toBeTruthy();
    expect(accepted.auditEvents.at(-1)?.action).toBe(`${PRIMARY_PROVIDER} accepted the trip via CareLink`);
    expect(workflowReducer(accepted, { type: 'VENDOR_ACCEPT_TRIP' })).toBe(accepted);
  });

  it('reopens the navigator blocker when the vendor reports unavailable', () => {
    const accepted = workflowReducer(offeredToVendor(), { type: 'VENDOR_ACCEPT_TRIP' });
    const released = workflowReducer(accepted, { type: 'FAIL_PRIMARY_RIDE', payload: { reason: 'Vehicle out of service' } });

    expect(released.ride.currentStatus).toBe('PRIMARY_FAILED');
    expect(deriveVendorTripView(released).status).toBe('RELEASED');
    const event = released.auditEvents.at(-1);
    expect(event?.action).toBe(`${PRIMARY_PROVIDER} reported unavailable via CareLink`);
    expect(event?.description).toContain('Reason: Vehicle out of service.');
    expect(released.tasks.find((task) => task.type === 'TRANSPORTATION_NAVIGATION')?.status).toBe('ASSIGNED');
  });

  it('records a decline with its own wording', () => {
    const declined = workflowReducer(offeredToVendor(), { type: 'FAIL_PRIMARY_RIDE', payload: { reason: 'No vehicle available', declined: true } });
    expect(declined.auditEvents.at(-1)?.action).toBe(`${PRIMARY_PROVIDER} declined the trip via CareLink`);
  });

  it('blocks navigator actions and staff routes for the vendor', () => {
    const released = workflowReducer(offeredToVendor(), { type: 'FAIL_PRIMARY_RIDE' });
    expect(workflowReducer(released, { type: 'ASSIGN_BACKUP_RIDE' })).toBe(released);
    expect(workflowReducer(released, { type: 'MARK_NO_RIDE_OPTION' })).toBe(released);
    expect(workflowReducer(released, { type: 'SET_STAFF_ROUTE', payload: 'CASE_WORKSPACE' })).toBe(released);
    expect(workflowReducer(released, { type: 'LOAD_CHECKPOINT', payload: 'FINAL_CONFIRMATION' })).toBe(released);

    const navigatorRecovered = workflowReducer(asNavigator(released), { type: 'ASSIGN_BACKUP_RIDE' });
    expect(navigatorRecovered.ride.assignments.at(-1)?.providerName).toBe(BACKUP_PROVIDER);
    const backupAsVendor = asVendor(navigatorRecovered);
    expect(workflowReducer(backupAsVendor, { type: 'FAIL_PRIMARY_RIDE' })).toBe(backupAsVendor);
  });

  it('gives the vendor trip logistics only', () => {
    const state = offeredToVendor();
    const serialized = JSON.stringify(deriveVendorTripView(state));
    expect(deriveVendorTripView(state).riderName).toBe('Camila L.');
    for (const hidden of [state.patient.diagnosis, state.patient.stage, state.patient.mrn, state.appointment.treatmentName, state.caregiver.name, PREPARED_REPLY, 'Lopez', ...state.labs.map((lab) => lab.name)]) {
      expect(serialized).not.toContain(hidden);
    }
  });
});

describe('RIDE-002 shared state across tabs', () => {
  it('takes the other tab’s scenario but keeps this tab’s workspace, route and replay', () => {
    const navigatorTab = workflowReducer(buildCheckpoint('SPLIT_WORK', 'CARE_NAVIGATOR', 'RESOURCES'), { type: 'PLAY_HISTORICAL_RIDE' });
    const vendorTab = workflowReducer(offeredToVendor(), { type: 'VENDOR_ACCEPT_TRIP' });

    const synced = workflowReducer(navigatorTab, { type: 'SYNC_SHARED_STATE', payload: vendorTab });
    expect(synced.currentPerspective).toBe('CARE_NAVIGATOR');
    expect(synced.staffRoute).toBe('RESOURCES');
    expect(synced.ride.replay).toEqual(navigatorTab.ride.replay);
    expect(synced.ride.assignments[0].vendorAcceptedAt).toBeTruthy();
  });

  it('restores a saved vendor session with an accepted trip', () => {
    const accepted = workflowReducer(offeredToVendor(), { type: 'VENDOR_ACCEPT_TRIP' });
    const restored = parseSavedWorkflowState(JSON.stringify(accepted));
    expect(restored?.currentPerspective).toBe('CARELINK_VENDOR');
    expect(restored?.ride.assignments[0].vendorAcceptedAt).toBe(accepted.ride.assignments[0].vendorAcceptedAt);
  });
});

const PortalHarness = () => {
  const [state, dispatch] = useReducer(workflowReducer, undefined, offeredToVendor);
  return <CareLinkVendorPortal trip={deriveVendorTripView(state)} onAction={dispatch} />;
};

describe('RIDE-002 CareLink vendor portal', () => {
  it('accepts, then reports unavailable with a reason', () => {
    render(<PortalHarness />);
    expect(screen.getAllByRole('img', { name: 'CareLink by OncoReady' }).length).toBeGreaterThan(0);
    expect(document.title).toBe('CareLink by OncoReady · Trip board');
    expect(screen.getByText(PRIMARY_PROVIDER)).toBeDefined();
    expect(screen.getByRole('status').textContent).toBe('New trip offer');

    fireEvent.click(screen.getByRole('button', { name: 'Accept trip' }));
    expect(screen.getByRole('status').textContent).toBe('Accepted');
    expect(screen.getByRole('button', { name: 'Picked up' }).hasAttribute('disabled')).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Report unavailable' }));
    fireEvent.change(screen.getByLabelText('What changed?'), { target: { value: 'Driver unavailable' } });
    fireEvent.click(screen.getByRole('button', { name: 'Report unavailable' }));
    expect(screen.getByRole('status').textContent).toBe('Released');
    expect(screen.queryByText(/555-0182/)).toBeNull();
  });
});

describe('RIDE-002 Uber Health adapter', () => {
  it('reports an awaiting connection and makes no network request', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const Harness = () => {
      const [state, dispatch] = useReducer(workflowReducer, buildCheckpoint('SPLIT_WORK', 'TRANSPORTATION'));
      return <TransportationWorkspace state={state} reducedMotion onRideAction={dispatch} />;
    };
    render(<Harness />);

    expect(uberHealthProvider.status).toBe('AWAITING_CONNECTION');
    expect(screen.getByRole('img', { name: 'Uber' })).toBeDefined();
    expect(screen.getByText('Adapter built · Awaiting connection')).toBeDefined();
    expect(screen.queryByText(/Uber Health.*connected\b(?! yet)/i)).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('RIDE-002 Lyft Healthcare card', () => {
  it('shows Lyft Healthcare as coming soon with no adapter and no network request', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const Harness = () => {
      const [state, dispatch] = useReducer(workflowReducer, buildCheckpoint('SPLIT_WORK', 'TRANSPORTATION'));
      return <TransportationWorkspace state={state} reducedMotion onRideAction={dispatch} />;
    };
    render(<Harness />);

    expect(lyftHealthcareProvider.status).toBe('COMING_SOON');
    expect(lyftHealthcareProvider.capabilities).toEqual([]);
    expect(screen.getByRole('heading', { name: 'Lyft Healthcare' })).toBeDefined();
    expect(screen.getByRole('img', { name: 'Lyft' })).toBeDefined();
    expect(screen.getByText('Coming soon')).toBeDefined();
    expect(screen.queryByText(/Lyft.*(connected|integrated|active)/i)).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
