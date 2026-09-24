import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { OutreachPanel } from '../src/components/OutreachPanel';
import { PREPARED_REPLY } from '../src/data/preparedOutreach';

const jsonResponse = (body: unknown, ok = true) => Promise.resolve({ ok, json: () => Promise.resolve(body) } as Response);
const idle = { enabled: true, call: 'completed', in_progress: false, calls_today: 1, daily_limit: 4 };

afterEach(() => vi.restoreAllMocks());

describe('OUTREACH-002 outreach history', () => {
  it('shows the engine history with ReadySignal checkpoints and care-team routing', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(<OutreachPanel role="CARE_TEAM" patientName="Camila Lopez" replyReceived />);

    expect(screen.getByRole('heading', { name: 'Outreach with Camila' })).toBeDefined();
    expect(screen.getByText('Automated voice check-in')).toBeDefined();
    expect(screen.getByText(/ReadySignal T−7 · 13.8/)).toBeDefined();
    expect(screen.getByText(/ReadySignal T−1 · 26.4/)).toBeDefined();
    expect(screen.getByText(`“${PREPARED_REPLY}”`)).toBeDefined();
    expect(screen.getByText(/Symptom mention → routed to Sarah Jenkins, RN/)).toBeDefined();
    // The care team reviews outreach; only the navigator places calls.
    expect(screen.queryByRole('button', { name: /Call Camila/ })).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(document.body.textContent).not.toMatch(/twilio|elevenlabs|synthetic/i);
  });

  it('keeps clinical words out of the navigator view', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => jsonResponse(idle));
    render(<OutreachPanel role="CARE_NAVIGATOR" patientName="Camila Lopez" replyReceived />);
    await screen.findByRole('button', { name: /Call Camila/ });

    expect(document.body.textContent).not.toContain('not feeling well');
    expect(screen.getByText(/Transportation barrier → ride recovery opened for you/)).toBeDefined();
    expect(screen.getByRole('button', { name: /Send text/ }).hasAttribute('disabled')).toBe(true);
  });
});

describe('OUTREACH-002 in-app call', () => {
  it('confirms, places the call and follows it to completion', async () => {
    let status = { ...idle, call: 'not_started' };
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation((_url, init) => {
      if (init?.method === 'POST') status = { ...status, call: 'ringing', in_progress: true, calls_today: 2 };
      return jsonResponse(status);
    });
    render(<OutreachPanel role="CARE_NAVIGATOR" patientName="Camila Lopez" replyReceived={false} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Call Camila' }));
    fireEvent.click(screen.getByRole('button', { name: 'Call now' }));
    expect(await screen.findByText('Ringing… · Camila Lopez')).toBeDefined();
    expect(fetchSpy).toHaveBeenCalledWith('/api/v1/outreach/demo-call', expect.objectContaining({ method: 'POST' }));

    status = { ...status, call: 'completed', in_progress: false };
    await waitFor(() => expect(screen.getByText('Call completed · Camila Lopez')).toBeDefined(), { timeout: 4000 });
    expect(screen.getByText(/Voice check-in · placed by Marcus Vance, MSW/)).toBeDefined();
  });

  it('re-enables the button after a reload once an earlier call ends', async () => {
    // The page reloads mid-call: it did not place this call, so nothing joins the history.
    let status = { ...idle, call: 'in_progress', in_progress: true };
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => jsonResponse(status));
    render(<OutreachPanel role="CARE_NAVIGATOR" patientName="Camila Lopez" replyReceived={false} />);

    const button = await screen.findByRole('button', { name: 'Call Camila' });
    await waitFor(() => expect(button.hasAttribute('disabled')).toBe(true));

    status = { ...status, call: 'completed', in_progress: false };
    await waitFor(() => expect(button.hasAttribute('disabled')).toBe(false), { timeout: 4000 });
    expect(screen.queryByText(/placed by Marcus Vance/)).toBeNull();
    expect(screen.queryByText('Calling is paused for this workspace.')).toBeNull();
  });

  it('shows a paused button when calling is off', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => jsonResponse({ ...idle, enabled: false }));
    render(<OutreachPanel role="CARE_NAVIGATOR" patientName="Camila Lopez" replyReceived={false} />);
    expect(await screen.findByText('Calling is paused for this workspace.')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Call Camila' }).hasAttribute('disabled')).toBe(true);
  });

  it('reports a refused call without a success state', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((_url, init) =>
      init?.method === 'POST' ? jsonResponse({ message: 'A call is already in progress.' }, false) : jsonResponse(idle));
    render(<OutreachPanel role="CARE_NAVIGATOR" patientName="Camila Lopez" replyReceived={false} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Call Camila' }));
    fireEvent.click(screen.getByRole('button', { name: 'Call now' }));
    expect((await screen.findByRole('alert')).textContent).toContain('A call is already in progress.');
    expect(screen.queryByText(/Call completed/)).toBeNull();
  });
});
