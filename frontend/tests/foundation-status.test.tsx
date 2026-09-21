import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FoundationStatus } from '../src/components/FoundationStatus';

const proof = {
  key: 'railway-foundation',
  value: 'oncoready-foundation-ready',
  seedVersion: 1,
  createdAt: '2026-09-21T12:00:00Z',
  updatedAt: '2026-09-21T12:00:00Z',
};

describe('FoundationStatus', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders a disabled loading state before showing the contracted persisted proof', async () => {
    let resolveFetch: ((response: Response) => void) | undefined;
    const fetchMock = vi.fn(() => new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    }));
    vi.stubGlobal('fetch', fetchMock);

    render(<FoundationStatus apiOrigin="https://api.oncoready.test/" />);

    expect(screen.getByText('Checking persisted state')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Checking persistent foundation' }).hasAttribute('disabled')).toBe(true);

    resolveFetch?.(new Response(JSON.stringify(proof), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));

    await waitFor(() => expect(screen.getByText('Persistent foundation connected')).toBeDefined());
    expect(screen.getByText('oncoready-foundation-ready · seed v1')).toBeDefined();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.oncoready.test/api/v1/foundation/proof',
      expect.objectContaining({ method: 'GET', credentials: 'omit', cache: 'no-store' }),
    );
  });

  it('shows a recoverable unavailable state without interrupting the local workflow', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('network unavailable'))
      .mockResolvedValueOnce(new Response(JSON.stringify(proof), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));
    vi.stubGlobal('fetch', fetchMock);

    render(<FoundationStatus apiOrigin="https://api.oncoready.test" />);

    await waitFor(() => expect(screen.getByText('Persistent foundation unavailable')).toBeDefined());
    expect(screen.getByText('The local workflow remains available')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Check persistent foundation again' }));

    await waitFor(() => expect(screen.getByText('Persistent foundation connected')).toBeDefined());
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('fails closed when the public API origin is absent or the response is invalid', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { rerender } = render(<FoundationStatus apiOrigin="" />);

    await waitFor(() => expect(screen.getByText('Persistent foundation unavailable')).toBeDefined());
    expect(fetchMock).not.toHaveBeenCalled();

    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ...proof, key: 'unexpected' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    rerender(<FoundationStatus apiOrigin="https://api.oncoready.test" />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(screen.getByText('Persistent foundation unavailable')).toBeDefined();
  });
});
