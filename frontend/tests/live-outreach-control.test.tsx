import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LiveOutreachControl } from '../src/components/LiveOutreachControl';

const status = (call: string, sms = 'not_started', callArmed = false) => ({
  available: true, armed: false, expires_at: '2026-09-22T20:00:00Z',
  sms, call, call_completed: call === 'completed', call_purpose: call === 'not_started' ? null : 'test', call_armed: callArmed,
  call_can_arm: !callArmed && ['not_started', 'completed', 'no_answer', 'busy'].includes(call),
  call_expires_at: callArmed ? '2026-09-23T20:00:00Z' : null,
  call_attempts_today: call === 'not_started' ? 0 : 1, call_daily_limit: 4,
});

afterEach(() => vi.unstubAllGlobals());

describe('private live call cue', () => {
  it('treats a completed earlier test as history, not a cue to play Video Part 2', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => status('completed', 'undelivered') }));
    render(<LiveOutreachControl />);
    fireEvent.change(screen.getByLabelText('Operator token'), { target: { value: 'test-token' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check status' }));
    await waitFor(() => expect(screen.getByText(/A previous call completed/)).toBeDefined());
    expect(screen.queryByText(/After confirming the exchange was audible/)).toBeNull();
    expect(screen.getByText(/The SMS was not delivered/)).toBeDefined();
    expect((screen.getByRole('button', { name: 'Place live call' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Open call window' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('checkbox', { name: /configured recipient currently consents/ }));
    expect((screen.getByRole('button', { name: 'Open call window' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('shows the Part 2 cue after this browser session places and completes a call', async () => {
    let placed = false;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string) => {
      if (url.endsWith('/call/arm')) return { ok: true, json: async () => status('not_started', 'not_started', true) };
      if (url.endsWith('/call')) { placed = true; return { ok: true, json: async () => status('initiating') }; }
      return { ok: true, json: async () => status(placed ? 'completed' : 'not_started') };
    }));
    render(<LiveOutreachControl />);
    fireEvent.change(screen.getByLabelText('Operator token'), { target: { value: 'test-token' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check status' }));
    await waitFor(() => expect((screen.getByRole('button', { name: 'Open call window' }) as HTMLButtonElement).disabled).toBe(true));
    fireEvent.click(screen.getByRole('checkbox', { name: /configured recipient currently consents/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Open call window' }));
    await waitFor(() => expect((screen.getByRole('button', { name: 'Place live call' }) as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(screen.getByRole('button', { name: 'Place live call' }));
    await waitFor(() => expect(screen.getByText('initiating')).toBeDefined());
    fireEvent.click(screen.getByRole('button', { name: 'Check status' }));
    await waitFor(() => expect(screen.getByText(/After confirming the exchange was audible/)).toBeDefined());
  });

  it('allows a deliberate new window after no answer but blocks an unknown outcome', async () => {
    let current = status('no_answer');
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url: string) => {
      if (url.endsWith('/call/arm')) current = status('no_answer', 'not_started', true);
      return { ok: true, json: async () => current };
    }));
    render(<LiveOutreachControl />);
    fireEvent.change(screen.getByLabelText('Operator token'), { target: { value: 'test-token' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check status' }));
    await waitFor(() => expect((screen.getByRole('button', { name: 'Open call window' }) as HTMLButtonElement).disabled).toBe(true));
    fireEvent.click(screen.getByRole('checkbox', { name: /configured recipient currently consents/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Open call window' }));
    await waitFor(() => expect((screen.getByRole('button', { name: 'Place live call' }) as HTMLButtonElement).disabled).toBe(false));
    current = status('unknown');
    fireEvent.click(screen.getByRole('button', { name: 'Check status' }));
    await waitFor(() => expect(screen.getByText(/previous call outcome is unknown/)).toBeDefined());
    expect((screen.getByRole('button', { name: 'Open call window' }) as HTMLButtonElement).disabled).toBe(true);
  });
});
