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
  call_purpose: 'test' | 'demo' | null;
  call_armed: boolean;
  call_can_arm: boolean;
  call_expires_at: string | null;
  call_attempts_today: number;
  call_daily_limit: number;
};

const apiOrigin = import.meta.env.VITE_API_ORIGIN ?? '';

export function LiveOutreachControl() {
  const [token, setToken] = useState('');
  const [state, setState] = useState<LiveStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [callPlacedThisSession, setCallPlacedThisSession] = useState(false);
  const [callPurpose, setCallPurpose] = useState<'test' | 'demo'>('test');
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  async function request(action: 'status' | 'arm' | 'sms' | 'call' | 'call/arm') {
    if (!token.trim()) return;
    if (action !== 'status') setBusy(true);
    try {
      const response = await fetch(`${apiOrigin}/api/v1/operator/outreach/${action}`, {
        method: action === 'status' ? 'GET' : 'POST',
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          ...(action === 'call/arm' ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(action === 'call/arm' ? { body: JSON.stringify({ purpose: callPurpose, consent_confirmed: consentConfirmed }) } : {}),
        cache: 'no-store',
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? 'The provider action was not available.');
      setState(payload as LiveStatus);
      if (action === 'call/arm') setConsentConfirmed(false);
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

  const smsStarted = state?.sms !== 'not_started';

  return (
    <main className="min-h-screen bg-cream px-4 py-8 text-ink sm:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3"><Logo size={40} /><div><p className="label-caps text-accent">Private operator control</p><h1 className="font-display text-2xl font-semibold">Live outreach</h1></div></div>
        <section className="rounded-2xl border border-line bg-white/80 p-5 shadow-sm backdrop-blur-md sm:p-7" aria-labelledby="live-heading">
          <h2 id="live-heading" className="font-display text-xl font-semibold">Protected outreach call</h2>
          <p className="mt-2 text-sm text-muted-fg">The recipient and script are fixed on the server. Each call needs its own short window. Another window opens only after the previous call has a confirmed final status.</p>
          <label htmlFor="operator-token" className="mt-6 block text-sm font-semibold">Operator token</label>
          <input id="operator-token" type="password" autoComplete="off" value={token} onChange={(event) => { setToken(event.target.value); setState(null); setCallPlacedThisSession(false); setConsentConfirmed(false); }} className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-describedby="token-help" />
          <p id="token-help" className="mt-1 text-xs text-muted-fg">Kept in this page only. It is cleared on refresh.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" disabled={!token.trim() || busy} onClick={() => void request('status')} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 py-2 font-semibold disabled:opacity-50"><RefreshCw size={16} /> Check status</button>
            <button type="button" disabled={!state?.available || state.armed || state.expires_at !== null || busy} onClick={() => void request('arm')} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 py-2 font-semibold text-white disabled:opacity-50"><ShieldCheck size={16} /> Arm SMS once</button>
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
              {state?.call_purpose && <p className="mt-1 text-xs text-muted-fg">Latest call purpose: {state.call_purpose}</p>}
              <p className="mt-2 text-xs text-muted-fg">Calls today: {state?.call_attempts_today ?? '-'} / {state?.call_daily_limit ?? '-'}</p>
              <label htmlFor="call-purpose" className="mt-4 block text-sm font-semibold">Call purpose</label>
              <select id="call-purpose" value={callPurpose} onChange={(event) => setCallPurpose(event.target.value as 'test' | 'demo')} className="mt-2 min-h-11 rounded-xl border border-line bg-white px-3 py-2">
                <option value="test">Test</option><option value="demo">Live presentation</option>
              </select>
              <label className="mt-3 flex items-start gap-2 text-sm"><input type="checkbox" checked={consentConfirmed} onChange={(event) => setConsentConfirmed(event.target.checked)} className="mt-1" />I confirm the configured recipient currently consents to one {callPurpose} call.</label>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" disabled={!state?.call_can_arm || !consentConfirmed || busy} onClick={() => void request('call/arm')} className="min-h-11 rounded-xl border border-line bg-white px-4 py-2 font-semibold disabled:opacity-50"><ShieldCheck size={16} className="mr-2 inline" />Open call window</button>
                <button type="button" disabled={!state?.call_armed || busy} onClick={() => void request('call')} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 py-2 font-semibold text-white disabled:opacity-50"><PhoneCall size={16} /> Place live call</button>
              </div>
              {state?.call_expires_at && <p className="mt-2 text-xs text-muted-fg">Call window expires: {new Date(state.call_expires_at).toLocaleString()}</p>}
            </div>
          </div>
          {state?.expires_at && <p className="mt-4 text-xs text-muted-fg">Arm expires: {new Date(state.expires_at).toLocaleString()}</p>}
          {state?.call_completed && (callPlacedThisSession
            ? <p className="mt-5 rounded-xl border border-mint bg-white p-4 font-semibold text-mint" role="status">Twilio reports the call completed. After confirming the exchange was audible, continue with Video Part 2.</p>
            : <p className="mt-5 rounded-xl border border-line bg-white p-4 text-sm text-muted-fg" role="status">A previous call completed. Open a new call window for another deliberate call when authorized.</p>)}
          {state?.call === 'unknown' && <p className="mt-4 rounded-xl border border-line bg-white p-4 text-sm text-muted-fg" role="status">The previous call outcome is unknown. Another call is blocked until it is resolved.</p>}
          {state?.sms === 'undelivered' && <p className="mt-4 rounded-xl border border-line bg-white p-4 text-sm text-muted-fg" role="status">The SMS was not delivered. Do not present it as a received message.</p>}
          {state && !state.available && <p className="mt-4 text-sm text-muted-fg">Live delivery is unavailable until operator, consent, provider, and persistence settings are complete.</p>}
        </section>
      </div>
    </main>
  );
}
