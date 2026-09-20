import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { StaffCommunication } from '../src/api/client';
import { CommunicationsPanel } from '../src/launch/CommunicationsPanel';

const attempt = (overrides: Partial<StaffCommunication>): StaffCommunication => ({
  communication_id: crypto.randomUUID(),
  channel: 'sms',
  purpose: 'readiness',
  status: 'queued',
  provenance: 'deterministic_replay',
  occurred_at: '2026-09-20T18:00:00.000Z',
  reconciliation: {
    state: 'not_required',
    last_attempt_at: '2026-09-20T18:00:00.000Z',
    attempt_reference: null,
    provenance: 'deterministic_replay',
    permitted_recovery: 'none',
  },
  ...overrides,
});

describe('provider communication truth', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shows both channels as held when no durable attempt exists', () => {
    render(<CommunicationsPanel communications={[]} refresh={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'SMS readiness messages' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Voice readiness calls' })).toBeTruthy();
    expect(screen.getAllByText('Live provider action held')).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'No live send' }).every((button) => button.hasAttribute('disabled'))).toBe(true);
    expect(screen.queryByText(/Verified provider callback/i)).toBeNull();
    expect(screen.queryByText(/A completed structured call outcome is recorded/i)).toBeNull();
  });

  it('distinguishes verified delivery, uncertain voice outcome, and permitted recovery', () => {
    const refresh = vi.fn();
    render(<CommunicationsPanel communications={[
      attempt({
        status: 'delivered',
        provenance: 'provider_callback',
        reconciliation: {
          state: 'reconciled',
          last_attempt_at: '2026-09-20T18:01:00.000Z',
          attempt_reference: 'SM-redacted-reference',
          provenance: 'provider_callback',
          permitted_recovery: 'none',
        },
      }),
      attempt({
        communication_id: crypto.randomUUID(),
        channel: 'voice',
        status: 'outcome_unknown',
        reconciliation: {
          state: 'reconciliation_required',
          last_attempt_at: '2026-09-20T18:02:00.000Z',
          attempt_reference: 'conversation-redacted-reference',
          provenance: 'provider_lookup',
          permitted_recovery: 'reconcile_provider',
        },
      }),
    ]} refresh={refresh} />);

    expect(screen.getByText('Verified provider callback', { exact: false })).toBeTruthy();
    expect(screen.getByText('Outcome not confirmed. The original action will not be resent automatically.')).toBeTruthy();
    expect(screen.getByText('Reconciled')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Refresh current state/i }));
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
