import React, { FormEvent, useState } from 'react';
import { ArrowLeft, ArrowRight, LockKeyhole, Mail } from 'lucide-react';
import { Perspective } from '../types';

interface PortalAuthScreenProps {
  onLogin: (perspective: Perspective) => void;
  onBack: () => void;
  onEpicModeChange: (open: boolean) => void;
}

type LoginMode = 'password' | 'epic';

const TEST_ACCOUNTS: Array<{ email: string; password: string; perspective: Perspective; label: string }> = [
  { email: 'abcp@oncoready.me', password: '1234', perspective: 'PATIENT', label: 'Patient' },
  { email: 'abcc@oncoready.me', password: '1234', perspective: 'CAREGIVER', label: 'Caregiver' },
  { email: 'abcs@oncoready.me', password: '1234', perspective: 'CARE_TEAM', label: 'Care Team (Readiness Team)' },
  { email: 'abcn@oncoready.me', password: '1234', perspective: 'CARE_NAVIGATOR', label: 'Care Navigator' },
  { email: 'abct@oncoready.me', password: '1234', perspective: 'TRANSPORTATION', label: 'Transportation' },
  { email: 'abcv@oncoready.me', password: '1234', perspective: 'CARELINK_VENDOR', label: 'Transport vendor (CareLink)' },
];

export const PortalAuthScreen: React.FC<PortalAuthScreenProps> = ({ onLogin, onBack, onEpicModeChange }) => {
  const [mode, setMode] = useState<LoginMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [epicEmail, setEpicEmail] = useState('');
  const [epicPassword, setEpicPassword] = useState('');
  const [epicError, setEpicError] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const [redirectingToEpic, setRedirectingToEpic] = useState(false);

  const handlePasswordLogin = (event: FormEvent) => {
    event.preventDefault();
    const account = TEST_ACCOUNTS.find((candidate) => candidate.email === email.trim().toLowerCase() && candidate.password === password);
    if (!account) {
      setError('Invalid email or password.');
      return;
    }
    setError('');
    onLogin(account.perspective);
  };

  const handleEpicLogin = (event: FormEvent) => {
    event.preventDefault();
    const account = TEST_ACCOUNTS.find((candidate) => candidate.email === epicEmail.trim().toLowerCase() && candidate.password === epicPassword && ['CARE_TEAM', 'CARE_NAVIGATOR', 'TRANSPORTATION'].includes(candidate.perspective));
    if (!account) {
      setEpicError('You entered an invalid user ID, password, or other type of authentication credential. Contact your administrator.');
      return;
    }
    setEpicError('');
    setRedirecting(true);
    window.setTimeout(() => onLogin(account.perspective), 1200);
  };

  if (mode === 'epic') {
    return (
      <div className="epic-login-page min-h-screen flex items-center justify-center p-4 sm:p-8">
        <div className="epic-login-card w-full max-w-[31rem]">
          <div className="epic-login-brand">
            <img src="/epic-logo.svg" alt="Epic" />
            <span>HYPERSPACE<sup>®</sup></span>
            <small>August 2026</small>
          </div>
          <div className="epic-login-form">
            <form onSubmit={handleEpicLogin} className="space-y-3">
              <label className="sr-only" htmlFor="epic-user-id">User ID</label>
              <div className="epic-input-wrap">
                <input id="epic-user-id" value={epicEmail} onChange={(event) => setEpicEmail(event.target.value)} className="epic-input" placeholder="User ID" autoComplete="username" />
                <LockKeyhole className="epic-input-icon" aria-hidden="true" />
              </div>
              <label className="sr-only" htmlFor="epic-password">Password</label>
              <input id="epic-password" type="password" value={epicPassword} onChange={(event) => setEpicPassword(event.target.value)} className="epic-input" placeholder="Password" autoComplete="current-password" />
              <button type="submit" className="epic-login-submit" disabled={redirecting}>{redirecting ? 'Redirecting...' : 'Log In'}</button>
            </form>
            {epicError && <p role="alert" className="epic-login-error">{epicError}</p>}
            {redirecting && <div className="epic-redirect-state" role="status"><span className="epic-redirect-spinner" />Redirecting securely...</div>}
          </div>
        </div>
        <p className="epic-legal">
          © 1979-2026 Epic Systems Corporation. All rights reserved.<br />
          Protected by U.S. patents. For details visit www.epic.com/patents<br />
          Additional copyrights apply. CPT®, copyright AMA. SNOMED CT®<br />
          copyright IHTSDO. More
        </p>
      </div>
    );
  }

  if (redirectingToEpic) {
    return (
      <div className="login-redirect-page min-h-[calc(100vh-4.25rem)] flex items-center justify-center px-4">
        <div className="login-redirect-card card-sticker text-center">
          <img src="/epic-logo.svg" alt="Epic" className="login-redirect-logo" />
          <span className="login-redirect-spinner" aria-hidden="true" />
          <h1>Redirecting to Epic</h1>
          <p>Opening the secure Epic sign-in page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page min-h-[calc(100vh-4.25rem)] flex items-center justify-center px-4 py-10 sm:px-8">
      <div className="login-layout w-full max-w-5xl">
        <section className="login-intro">
          <div className="landing-eyebrow"><span className="landing-eyebrow__dot" />OncoReady access</div>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold leading-[0.96]">Keep tomorrow<br /><span className="text-accent">on the calendar.</span></h1>
          <p className="text-muted-fg text-base leading-relaxed max-w-md mt-5">Sign in to the workspace that owns the next step in treatment readiness.</p>
        </section>
        <section className="login-card card-sticker p-6 sm:p-8" aria-labelledby="login-title">
          <button type="button" className="login-back-link" onClick={onBack}><ArrowLeft className="w-4 h-4" />Back to website</button>
          <div className="flex items-center gap-3 mt-6 mb-6">
            <span className="login-icon"><Mail className="w-5 h-5" /></span>
            <div><h2 id="login-title" className="font-display text-2xl font-extrabold">Sign in</h2></div>
          </div>
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div><label htmlFor="login-email" className="label-caps">Email</label><input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input-pop mt-1 w-full" placeholder="you@oncoready.me" autoComplete="email" /></div>
            <div><label htmlFor="login-password" className="label-caps">Password</label><input id="login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="input-pop mt-1 w-full" placeholder="••••" autoComplete="current-password" /></div>
            {error && <p role="alert" className="text-sm text-red-600 leading-relaxed">{error}</p>}
            <button type="submit" className="btn-candy w-full">Sign in <ArrowRight className="w-4 h-4" /></button>
          </form>
          <div className="login-divider"><span>or</span></div>
          <button
            type="button"
            onClick={() => {
              setError('');
              setRedirectingToEpic(true);
              window.setTimeout(() => {
                setMode('epic');
                setRedirectingToEpic(false);
                onEpicModeChange(true);
              }, 650);
            }}
            className="epic-entry-button"
            disabled={redirectingToEpic}
          >
            <img src="/epic-logo.svg" alt="" />
            {redirectingToEpic ? 'Redirecting to Epic...' : 'Sign in with Epic'}
          </button>
          <p className="text-[11px] text-muted-fg mt-4 text-center">Epic sign in is available for Care Team, Care Navigator, and Transportation.</p>
        </section>
      </div>
    </div>
  );
};
