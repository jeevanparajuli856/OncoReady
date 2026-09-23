import type { WorkflowState } from '../types';
import { PRIMARY_PROVIDER, BACKUP_PROVIDER } from '../state/workflowState';

export type ProviderConnectionStatus = 'ACTIVE' | 'AWAITING_CONNECTION';

/** Kinds of ride update a provider source can deliver to the Transportation Workspace. */
export type ProviderCapability = 'TRIP_OFFER' | 'TRIP_ACCEPTANCE' | 'DRIVER_ASSIGNMENT' | 'UNAVAILABLE_REPORT' | 'PICKUP_DROPOFF_EVENTS';

/**
 * A ride update source. Every adapter reports its status and capabilities the same way, so the
 * workspace can show CareLink and API partners side by side without knowing how each one connects.
 */
export interface TransportProvider {
  id: 'carelink' | 'uber-health';
  name: string;
  channel: string;
  status: ProviderConnectionStatus;
  statusLabel: string;
  capabilities: ProviderCapability[];
  /** What must be in place before the adapter can exchange trips. Empty when active. */
  requirements: string[];
  /** Vendors whose trips currently flow through this source. */
  vendors: (state: WorkflowState) => string[];
}

/** CareLink: OncoReady's vendor portal, backed by the shared workflow reducer. */
export const careLinkProvider: TransportProvider = {
  id: 'carelink',
  name: 'CareLink',
  channel: 'OncoReady vendor portal',
  status: 'ACTIVE',
  statusLabel: 'OncoReady vendor portal · Active',
  capabilities: ['TRIP_OFFER', 'TRIP_ACCEPTANCE', 'DRIVER_ASSIGNMENT', 'UNAVAILABLE_REPORT', 'PICKUP_DROPOFF_EVENTS'],
  requirements: [],
  vendors: (state) => {
    const assigned = state.ride.assignments.map((assignment) => assignment.providerName);
    return Array.from(new Set([PRIMARY_PROVIDER, BACKUP_PROVIDER, ...assigned]));
  },
};

/**
 * Uber Health: the adapter maps into the same update shape but has no connection yet. It makes no
 * network request and never enters the dispatch path.
 */
export const uberHealthProvider: TransportProvider = {
  id: 'uber-health',
  name: 'Uber Health',
  channel: 'Uber Health API',
  status: 'AWAITING_CONNECTION',
  statusLabel: 'Adapter built · Awaiting connection',
  capabilities: ['TRIP_ACCEPTANCE', 'DRIVER_ASSIGNMENT', 'PICKUP_DROPOFF_EVENTS'],
  requirements: ['Uber Health organization contract', 'API credentials'],
  vendors: () => [],
};

export const TRANSPORT_PROVIDERS: TransportProvider[] = [careLinkProvider, uberHealthProvider];
