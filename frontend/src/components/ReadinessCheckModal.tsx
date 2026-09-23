import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Car,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { cn } from '../lib/cn';
import { useDialogFocus } from '../lib/useDialogFocus';

interface ReadinessCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { transportNotes: string; clinicalConcernText: string }) => void;
  defaultAddress: string;
  /** CHECK is the pre-infusion readiness check; REPORT is a later "something changed" report. */
  mode?: 'CHECK' | 'REPORT';
}

export const ReadinessCheckModal: React.FC<ReadinessCheckModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultAddress,
  mode = 'CHECK',
}) => {
  const isReport = mode === 'REPORT';
  const dialogRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  // A later report starts blank: Camila says what changed in her own words.
  const [hasTransportIssue, setHasTransportIssue] = useState<boolean>(!isReport);
  const [transportNotes, setTransportNotes] = useState<string>(
    isReport ? '' : 'Ride cancelled; transportation recovery needed.'
  );
  const [pickupAddress, setPickupAddress] = useState<string>(defaultAddress);
  const [needsWheelchair, setNeedsWheelchair] = useState<boolean>(false);
  const [hasClinicalConcern, setHasClinicalConcern] = useState<boolean>(!isReport);
  const [clinicalConcernText, setClinicalConcernText] = useState<string>(
    isReport ? '' : 'My ride was cancelled, and I’m not feeling well today.'
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<'clinical' | 'pickup' | 'transport' | 'choice' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useDialogFocus(isOpen, dialogRef, onClose);

  useEffect(() => {
    if (errorMsg) errorRef.current?.focus();
  }, [errorMsg]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setErrorField(null);

    if (isReport && !hasTransportIssue && !hasClinicalConcern) {
      setErrorMsg('Choose a ride problem, a symptom, or both, so we know who should help.');
      setErrorField('choice');
      return;
    }

    if (hasClinicalConcern && !clinicalConcernText.trim()) {
      setErrorMsg('Please enter your symptoms or concerns so the oncology triage nurse can assist you.');
      setErrorField('clinical');
      return;
    }

    if (hasTransportIssue && !pickupAddress.trim()) {
      setErrorMsg('Please confirm your pickup address for medical transport.');
      setErrorField('pickup');
      return;
    }

    if (isReport && hasTransportIssue && !transportNotes.trim()) {
      setErrorMsg('Please tell your navigator what changed with your ride.');
      setErrorField('transport');
      return;
    }

    setIsSubmitting(true);
    onSubmit({
      transportNotes: hasTransportIssue ? transportNotes : '',
      clinicalConcernText: hasClinicalConcern ? clinicalConcernText : '',
    });
    setIsSubmitting(false);
    onClose();
  };

  const choiceClass = (on: boolean, tone: 'ok' | 'warn') =>
    cn(
      'min-h-[3.25rem] px-4 py-3 rounded-xl border-2 text-left text-sm font-heading flex items-center gap-3 transition',
      on
        ? tone === 'ok'
          ? 'border-ink bg-mint/25 font-semibold shadow-pop-soft'
          : 'border-ink bg-sun/55 font-semibold shadow-pop-soft'
        : 'border-ink/15 bg-white text-muted-fg hover:border-ink/40 hover:text-ink'
    );

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="readiness-check-title"
    >
      <form
        ref={dialogRef}
        tabIndex={-1}
        onSubmit={handleSubmit}
        className="bg-cream w-full sm:max-w-3xl sm:rounded-2xl border-t sm:border border-line shadow-glass-lg overflow-hidden flex flex-col max-h-[96dvh] sm:max-h-[90dvh] animate-slide-up"
      >
        <div className="bg-ink text-white px-5 sm:px-7 py-5 flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-heading font-bold uppercase tracking-widest text-white/60">
              {isReport ? 'Something changed' : 'T-24h check-in'}
            </p>
            <h2 id="readiness-check-title" className="font-heading font-extrabold text-xl leading-snug">
              {isReport ? 'Report a Problem' : '2-Minute Pre-Infusion Readiness Check'}
            </h2>
            <p className="text-sm text-white/75">FOLFOX6 Cycle 4 • Scheduled Sep 25 at 10:00 AM CT</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl border-2 border-white/25 hover:bg-white/10 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-6 space-y-6">
          {errorMsg && (
            <div
              ref={errorRef}
              id="readiness-error-summary"
              role="alert"
              tabIndex={-1}
              className="p-3.5 bg-sun/20 border border-amber-300 rounded-xl text-sm flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={2.5} />
              <span>{errorMsg}</span>
            </div>
          )}

          <section className="space-y-4 p-5 rounded-2xl bg-white border-2 border-ink">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <span className="icon-bubble w-11 h-11 bg-sun text-ink">
                  <Car className="w-5 h-5" strokeWidth={2.5} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-heading font-bold text-muted-fg">Step 1 of 2</p>
                  <h3 className="font-heading font-bold text-lg leading-snug">
                    1. Transportation to Benson Cancer Center
                  </h3>
                  <p className="text-sm text-muted-fg mt-1 leading-relaxed">
                    {isReport
                      ? 'Has anything changed with your ride to the Benson Cancer Center?'
                      : 'Do you have confirmed, reliable transportation to the Benson Cancer Center tomorrow?'}
                  </p>
                </div>
              </div>
              <span className="chip shrink-0 hidden sm:inline-flex">Sep 25 • 9:30 AM arrival</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button type="button" onClick={() => setHasTransportIssue(false)} className={choiceClass(!hasTransportIssue, 'ok')}>
                <CheckCircle2 className={`w-5 h-5 shrink-0 ${!hasTransportIssue ? 'text-mint' : 'text-muted-fg'}`} strokeWidth={2.5} />
                {isReport ? 'My ride is still fine' : 'Yes, I have a confirmed ride'}
              </button>
              <button type="button" onClick={() => setHasTransportIssue(true)} className={choiceClass(hasTransportIssue, 'warn')}>
                <AlertTriangle className={`w-5 h-5 shrink-0 ${hasTransportIssue ? 'text-ink' : 'text-muted-fg'}`} strokeWidth={2.5} />
                {isReport ? 'Something changed with my ride' : 'No, my ride was cancelled / I need assistance'}
              </button>
            </div>

            {hasTransportIssue && (
              <div className="pt-4 border-t-2 border-ink/10 space-y-4 animate-fade-in">
                <div className="space-y-1.5">
                  <label htmlFor="pickup-address" className="block text-sm font-heading font-semibold">
                    Pickup address
                  </label>
                  <input
                    id="pickup-address"
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    aria-invalid={errorField === 'pickup'}
                    aria-describedby={errorField === 'pickup' ? 'readiness-error-summary' : undefined}
                    className="input-pop text-sm border-2 border-ink"
                    placeholder="Enter pickup address"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="transport-notes" className="block text-sm font-heading font-semibold">
                    Transportation notes for navigator
                  </label>
                  <input
                    id="transport-notes"
                    type="text"
                    value={transportNotes}
                    onChange={(e) => setTransportNotes(e.target.value)}
                    aria-invalid={errorField === 'transport'}
                    aria-describedby={errorField === 'transport' ? 'readiness-error-summary' : undefined}
                    className="input-pop text-sm border-2 border-ink"
                    placeholder="Details about vehicle needs, timing, or accessibility"
                  />
                </div>
                <label className="flex items-center gap-2.5 text-sm font-heading font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    id="wheelchair-check"
                    checked={needsWheelchair}
                    onChange={(e) => setNeedsWheelchair(e.target.checked)}
                    className="h-4 w-4 accent-accent"
                  />
                  Wheelchair-accessible lift required
                </label>
              </div>
            )}
          </section>

          <section className="space-y-4 p-5 rounded-2xl bg-white border-2 border-ink">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <span className="icon-bubble w-11 h-11 bg-accent text-white">
                  <Stethoscope className="w-5 h-5" strokeWidth={2.5} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-heading font-bold text-muted-fg">Step 2 of 2</p>
                  <h3 className="font-heading font-bold text-lg leading-snug">
                    2. Clinical Symptoms & Concerns
                  </h3>
                  <p className="text-sm text-muted-fg mt-1 leading-relaxed">
                    Are you experiencing any new or worsening symptoms since your last cycle (fever, nausea, numbness/tingling, pain)?
                  </p>
                </div>
              </div>
              <span className="chip chip-accent shrink-0 hidden sm:inline-flex">Human Nurse Review</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button type="button" onClick={() => setHasClinicalConcern(false)} className={choiceClass(!hasClinicalConcern, 'ok')}>
                <CheckCircle2 className={`w-5 h-5 shrink-0 ${!hasClinicalConcern ? 'text-mint' : 'text-muted-fg'}`} strokeWidth={2.5} />
                No, feeling as expected
              </button>
              <button type="button" onClick={() => setHasClinicalConcern(true)} className={choiceClass(hasClinicalConcern, 'warn')}>
                <AlertTriangle className={`w-5 h-5 shrink-0 ${hasClinicalConcern ? 'text-ink' : 'text-muted-fg'}`} strokeWidth={2.5} />
                Yes, I have symptoms to report
              </button>
            </div>

            {hasClinicalConcern && (
              <div className="pt-4 border-t-2 border-ink/10 space-y-3 animate-fade-in">
                <label htmlFor="clinical-concern" className="block text-sm font-heading font-semibold">
                  Describe what you are experiencing (Verbatim Clinical Text)
                </label>
                <textarea
                  id="clinical-concern"
                  rows={4}
                  value={clinicalConcernText}
                  onChange={(e) => setClinicalConcernText(e.target.value)}
                  aria-invalid={errorField === 'clinical'}
                  aria-describedby={errorField === 'clinical' ? 'readiness-error-summary' : undefined}
                  className="input-pop text-sm border-2 border-ink min-h-[6.5rem]"
                  placeholder="e.g. Temperature, cold sensitivity, nausea, fatigue..."
                />
                <div className="p-4 rounded-xl bg-brand-50 border-2 border-ink flex items-start gap-3 text-sm leading-relaxed">
                  <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" strokeWidth={2.5} />
                  <div>
                    <span className="font-heading font-bold">Preserved Verbatim Record: </span>
                    Your exact words route directly to Sarah Jenkins, RN on the triage nursing team. OncoReady does not perform automated AI clinical decisions or symptom downgrades.
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="shrink-0 border-t-2 border-ink bg-white px-5 sm:px-7 py-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-candy">
            <span>{isSubmitting ? 'Routing Tasks...' : isReport ? 'Send to Care Team' : 'Submit Readiness Report'}</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  );
};
