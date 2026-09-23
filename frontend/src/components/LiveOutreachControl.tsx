import { useEffect, useState } from 'react';
import { CircleAlert, PhoneCall, RefreshCw, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';

type LiveStatus = {
  available: boolean;
  armed: boolean;
  expires_at: string | null;
  sms: string;
  call: string;
  call_completed: boolean;
};

const apiOrigin = import.meta.env.VITE_API_ORIGIN ?? '';

export function LiveOutreachControl() {
  const [token, setToken] = useState('');
  const [state, setState] = useState<LiveStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [callPlacedThisSession, setCallPlacedThisSession] = useState(false);

  async function request(action: 'status' | 'arm' | 'sms' | 'call') {
    if (!token.trim()) return;
    if (action !== 'status') setBusy(true);
    try {
      const response = await fetch(`${apiOrigin}/api/v1/operator/outreach/${action}`, {
        method: action === 'status' ? 'GET' : 'POST',
        headers: { Authorization: `Bearer ${token.trim()}` },
        cache: 'no-store',
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? 'The provider action was not available.');
      setState(payload as LiveStatus);
      if (action === 'call') setCallPlacedThisSession(true);
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to read live status.');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!token.trim()) return undefined;
    const timer = window.setInterval(() => { void request('status'); }, 3000);
    return () => window.clearInterval(timer);
  }, [token]);

  const callStarted = state?.call !== 'not_started';
  const smsStarted = state?.sms !== 'not_started';

  return (
    <main className="min-h-screen bg-cream px-4 py-8 text-ink sm:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3"><Logo size={40} /><div><p className="label-caps text-accent">Private operator control</p><h1 className="font-display text-2xl font-semibold">Live outreach</h1></div></div>
        <section className="rounded-2xl border border-line bg-white/80 p-5 shadow-sm backdrop-blur-md sm:p-7" aria-labelledby="live-heading">
          <h2 id="live-heading" className="font-display text-xl font-semibold">Protected outreach call</h2>
          <p className="mt-2 text-sm text-muted-fg">The recipient and script are fixed on the server. A one-time arm allows one SMS and one call during a short window.</p>
          <label htmlFor="operator-token" className="mt-6 block text-sm font-semibold">Operator token</label>
          <input id="operator-token" type="password" autoComplete="off" value={token} onChange={(event) => { setToken(event.target.value); setState(null); setCallPlacedThisSession(false); }} className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-describedby="token-help" />
          <p id="token-help" className="mt-1 text-xs text-muted-fg">Kept in this page only. It is cleared on refresh.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" disabled={!token.trim() || busy} onClick={() => void request('status')} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 py-2 font-semibold disabled:opacity-50"><RefreshCw size={16} /> Check status</button>
            <button type="button" disabled={!state?.available || state.armed || state.expires_at !== null || busy} onClick={() => void request('arm')} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 py-2 font-semibold text-white disabled:opacity-50"><ShieldCheck size={16} /> Arm once</button>
          </div>
          {error && <p role="alert" className="mt-4 flex items-center gap-2 text-sm text-red-700"><CircleAlert size={16} />{error}</p>}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-cream p-4">
              <p className="label-caps text-muted-fg">SMS</p>
              <p className="mt-2 font-semibold" role="status">{state?.sms.replace(/_/g, ' ') ?? 'Check status to begin'}</p>
              <button type="button" disabled={!state?.armed || smsStarted || busy} onClick={() => void request('sms')} className="mt-4 min-h-11 rounded-xl border border-line bg-white px-4 py-2 font-semibold disabled:opacity-50">Send one SMS</button>
            </div>
            <div className="rounded-xl border border-line bg-cream p-4">
              <p className="label-caps text-muted-fg">Live call</p>
              <p className="mt-2 font-semibold" role="status" aria-live="polite">{state?.call.replace(/_/g, ' ') ?? 'Check status to begin'}</p>
              <button type="button" disabled={!state?.armed || callStarted || busy} onClick={() => void request('call')} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 py-2 font-semibold text-white disabled:opacity-50"><PhoneCall size={16} /> Place live call</button>
            </div>
          </div>
          {state?.expires_at && <p className="mt-4 text-xs text-muted-fg">Arm expires: {new Date(state.expires_at).toLocaleString()}</p>}
          {state?.call_completed && (callPlacedThisSession
            ? <p className="mt-5 rounded-xl border border-mint bg-white p-4 font-semibold text-mint" role="status">Twilio reports the call completed. After confirming the exchange was audible, continue with Video Part 2.</p>
            : <p className="mt-5 rounded-xl border border-line bg-white p-4 text-sm text-muted-fg" role="status">A previous call completed. This one-shot call has been used; a new authorized window is needed before another call.</p>)}
          {state?.sms === 'undelivered' && <p className="mt-4 rounded-xl border border-line bg-white p-4 text-sm text-muted-fg" role="status">The SMS was not delivered. Do not present it as a received message.</p>}
          {state && !state.available && <p className="mt-4 text-sm text-muted-fg">Live delivery is unavailable until operator, consent, provider, and persistence settings are complete.</p>}
        </section>
      </div>
    </main>
  );
}
