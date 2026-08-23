import React, { useState } from 'react';
import {
  X,
  Car,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ReadinessCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { transportNotes: string; clinicalConcernText: string }) => void;
  defaultAddress: string;
}

export const ReadinessCheckModal: React.FC<ReadinessCheckModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultAddress,
}) => {
  const [hasTransportIssue, setHasTransportIssue] = useState<boolean>(true);
  const [transportNotes, setTransportNotes] = useState<string>(
    'Ride cancelled by family member; needs assisted pickup at 7:45 AM'
  );
  const [pickupAddress, setPickupAddress] = useState<string>(defaultAddress);
  const [needsWheelchair, setNeedsWheelchair] = useState<boolean>(false);
  const [hasClinicalConcern, setHasClinicalConcern] = useState<boolean>(true);
  const [clinicalConcernText, setClinicalConcernText] = useState<string>(
    'Mild fever 100.4°F and tingling in fingers since yesterday evening'
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (hasClinicalConcern && !clinicalConcernText.trim()) {
      setErrorMsg('Please enter your symptoms or concerns so the oncology triage nurse can assist you.');
      return;
    }

    if (hasTransportIssue && !pickupAddress.trim()) {
      setErrorMsg('Please confirm your pickup address for medical transport.');
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
    `p-3 rounded-xl border-2 text-left text-sm flex items-center gap-2.5 transition ${
      on
        ? tone === 'ok'
          ? 'border-ink bg-mint/20 font-heading font-bold'
          : 'border-ink bg-sun/40 font-heading font-bold'
        : 'border-ink/15 bg-white hover:bg-cream'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-ink/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="readiness-check-title"
    >
      <div className="bg-cream rounded-xl max-w-2xl w-full border-2 border-ink shadow-pop-lg overflow-hidden animate-pop">
        <div className="bg-accent text-white p-5 sm:p-6 flex items-start justify-between gap-3 border-b-2 border-ink">
          <div className="flex items-center gap-3">
            <span className="icon-bubble w-10 h-10 bg-sun text-ink">
              <Sparkles className="w-5 h-5" strokeWidth={2.5} />
            </span>
            <div>
              <h2 id="readiness-check-title" className="font-heading font-extrabold text-lg leading-snug">
                2-Minute Pre-Infusion Readiness Check
              </h2>
              <p className="text-xs text-white/80 mt-0.5">FOLFOX6 Cycle 4 • Scheduled Tomorrow at 8:30 AM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-full border-2 border-white/30 hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-sun/40 border-2 border-ink rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={2.5} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-3 p-4 rounded-xl bg-white border-2 border-ink">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="font-heading font-bold flex items-center gap-2">
                <Car className="w-4 h-4 text-accent" strokeWidth={2.5} />
                1. Transportation to Benson Cancer Center
              </label>
              <span className="text-xs text-muted-fg">Tomorrow • 8:30 AM Arrival</span>
            </div>
            <p className="text-sm text-muted-fg">
              Do you have confirmed, reliable transportation to the Benson Cancer Center tomorrow?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button type="button" onClick={() => setHasTransportIssue(false)} className={choiceClass(!hasTransportIssue, 'ok')}>
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${!hasTransportIssue ? 'text-ink' : 'text-muted-fg'}`} strokeWidth={2.5} />
                Yes, I have a confirmed ride
              </button>
              <button type="button" onClick={() => setHasTransportIssue(true)} className={choiceClass(hasTransportIssue, 'warn')}>
                <AlertTriangle className={`w-4 h-4 shrink-0 ${hasTransportIssue ? 'text-ink' : 'text-muted-fg'}`} strokeWidth={2.5} />
                No, my ride was cancelled / I need assistance
              </button>
            </div>
            {hasTransportIssue && (
              <div className="pt-3 border-t-2 border-ink/10 space-y-3 animate-fade-in">
                <div>
                  <label className="label-caps mb-1">Pickup Address:</label>
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="input-pop text-sm"
                    placeholder="Enter pickup address"
                  />
                </div>
                <div>
                  <label className="label-caps mb-1">Transportation Notes for Navigator:</label>
                  <input
                    type="text"
                    value={transportNotes}
                    onChange={(e) => setTransportNotes(e.target.value)}
                    className="input-pop text-sm"
                    placeholder="Details about vehicle needs, timing, or accessibility"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
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
          </div>

          <div className="space-y-3 p-4 rounded-xl bg-white border-2 border-ink">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="font-heading font-bold flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-accent" strokeWidth={2.5} />
                2. Clinical Symptoms & Concerns
              </label>
              <span className="text-xs text-muted-fg">Human Nurse Review</span>
            </div>
            <p className="text-sm text-muted-fg">
              Are you experiencing any new or worsening symptoms since your last cycle (fever, nausea, numbness/tingling, pain)?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button type="button" onClick={() => setHasClinicalConcern(false)} className={choiceClass(!hasClinicalConcern, 'ok')}>
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${!hasClinicalConcern ? 'text-ink' : 'text-muted-fg'}`} strokeWidth={2.5} />
                No, feeling as expected
              </button>
              <button type="button" onClick={() => setHasClinicalConcern(true)} className={choiceClass(hasClinicalConcern, 'warn')}>
                <AlertTriangle className={`w-4 h-4 shrink-0 ${hasClinicalConcern ? 'text-ink' : 'text-muted-fg'}`} strokeWidth={2.5} />
                Yes, I have symptoms to report
              </button>
            </div>
            {hasClinicalConcern && (
              <div className="pt-3 border-t-2 border-ink/10 space-y-2 animate-fade-in">
                <label className="label-caps">Describe what you are experiencing (Verbatim Clinical Text):</label>
                <textarea
                  rows={3}
                  value={clinicalConcernText}
                  onChange={(e) => setClinicalConcernText(e.target.value)}
                  className="input-pop text-sm"
                  placeholder="e.g. Temperature, cold sensitivity, nausea, fatigue..."
                />
                <div className="p-3 rounded-xl bg-accent/10 border-2 border-ink/10 flex items-start gap-2 text-xs">
                  <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" strokeWidth={2.5} />
                  <div>
                    <span className="font-heading font-bold">Preserved Verbatim Record: </span>
                    Your exact words route directly to Sarah Jenkins, RN on the triage nursing team. OncoReady does not perform automated AI clinical decisions or symptom downgrades.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 btn-stack">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-candy">
              <span>{isSubmitting ? 'Routing Tasks...' : 'Submit Readiness Report'}</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
