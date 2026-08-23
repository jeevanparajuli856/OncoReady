import React, { useState } from 'react';
import { 
  X, 
  Car, 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles
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

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="readiness-check-title"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="readiness-check-title" className="text-lg font-bold">
                2-Minute Pre-Infusion Readiness Check
              </h2>
              <p className="text-xs text-indigo-200">
                FOLFOX6 Cycle 4 • Scheduled Tomorrow at 8:30 AM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Transportation */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Car className="w-4 h-4 text-indigo-600" />
                <span>1. Transportation to Benson Cancer Center</span>
              </label>
              <span className="text-xs text-slate-500">Tomorrow • 8:30 AM Arrival</span>
            </div>

            <p className="text-xs text-slate-600">
              Do you have confirmed, reliable transportation to the Benson Cancer Center tomorrow?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setHasTransportIssue(false)}
                className={`p-3 rounded-lg border text-left text-xs flex items-center gap-2.5 transition ${
                  !hasTransportIssue
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold ring-1 ring-indigo-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${!hasTransportIssue ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>Yes, I have a confirmed ride</span>
              </button>

              <button
                type="button"
                onClick={() => setHasTransportIssue(true)}
                className={`p-3 rounded-lg border text-left text-xs flex items-center gap-2.5 transition ${
                  hasTransportIssue
                    ? 'border-amber-500 bg-amber-50/60 text-amber-950 font-semibold ring-1 ring-amber-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className={`w-4 h-4 ${hasTransportIssue ? 'text-amber-600' : 'text-slate-400'}`} />
                <span>No, my ride was cancelled / I need assistance</span>
              </button>
            </div>

            {hasTransportIssue && (
              <div className="mt-3 pt-3 border-t border-slate-200 space-y-3 animate-fade-in text-xs">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Pickup Address:
                  </label>
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter pickup address"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Transportation Notes for Navigator:
                  </label>
                  <input
                    type="text"
                    value={transportNotes}
                    onChange={(e) => setTransportNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Details about vehicle needs, timing, or accessibility"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="wheelchair-check"
                    checked={needsWheelchair}
                    onChange={(e) => setNeedsWheelchair(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="wheelchair-check" className="text-slate-700 cursor-pointer">
                    Wheelchair-accessible lift required
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Clinical Symptoms */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-sky-600" />
                <span>2. Clinical Symptoms & Concerns</span>
              </label>
              <span className="text-xs text-slate-500">Human Nurse Review</span>
            </div>

            <p className="text-xs text-slate-600">
              Are you experiencing any new or worsening symptoms since your last cycle (fever, nausea, numbness/tingling, pain)?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setHasClinicalConcern(false)}
                className={`p-3 rounded-lg border text-left text-xs flex items-center gap-2.5 transition ${
                  !hasClinicalConcern
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold ring-1 ring-indigo-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${!hasClinicalConcern ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>No, feeling as expected</span>
              </button>

              <button
                type="button"
                onClick={() => setHasClinicalConcern(true)}
                className={`p-3 rounded-lg border text-left text-xs flex items-center gap-2.5 transition ${
                  hasClinicalConcern
                    ? 'border-amber-500 bg-amber-50/60 text-amber-950 font-semibold ring-1 ring-amber-500'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className={`w-4 h-4 ${hasClinicalConcern ? 'text-amber-600' : 'text-slate-400'}`} />
                <span>Yes, I have symptoms to report</span>
              </button>
            </div>

            {hasClinicalConcern && (
              <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 animate-fade-in text-xs">
                <label className="block text-slate-700 font-medium">
                  Describe what you are experiencing (Verbatim Clinical Text):
                </label>
                <textarea
                  rows={3}
                  value={clinicalConcernText}
                  onChange={(e) => setClinicalConcernText(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Temperature, cold sensitivity, nausea, fatigue..."
                />

                {/* Non-AI human clinical authority banner */}
                <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 flex items-start gap-2 text-[11px] text-indigo-900">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Preserved Verbatim Record: </span>
                    Your exact words route directly to Sarah Jenkins, RN on the triage nursing team. OncoReady does not perform automated AI clinical decisions or symptom downgrades.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-md shadow-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <span>{isSubmitting ? 'Routing Tasks...' : 'Submit Readiness Report'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
