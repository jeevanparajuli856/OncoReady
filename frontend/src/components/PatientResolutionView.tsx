import React, { useState } from 'react';
import {
  CheckCircle2,
  Car,
  Stethoscope,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WorkflowState } from '../types';

interface PatientResolutionViewProps {
  state: WorkflowState;
  onAcknowledgePlan: () => void;
  onBackToHome: () => void;
}

export const PatientResolutionView: React.FC<PatientResolutionViewProps> = ({
  state,
  onAcknowledgePlan,
  onBackToHome,
}) => {
  const [hasAgreed, setHasAgreed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const clinicalTask = state.tasks.find((t) => t.type === 'CLINICAL_REVIEW');
  const transportTask = state.tasks.find((t) => t.type === 'TRANSPORTATION_NAVIGATION');

  const isConfirmed = state.overallReadiness === 'PLAN_CONFIRMED' || state.patientAcknowledged;

  const handleConfirmClick = () => {
    setIsSubmitting(true);
    try {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        if (canvas && typeof canvas.getContext === 'function' && canvas.getContext('2d')) {
          confetti({
            particleCount: 75,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#34D399', '#8B5CF6', '#F472B6', '#FBBF24'],
          });
        }
      }
    } catch {
      // safe fallback
    }
    onAcknowledgePlan();
    setIsSubmitting(false);
  };

  return (
    <div className="page-shell space-y-5 animate-pop">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-sm font-heading font-bold hover:text-accent"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Treatment Home</span>
        </button>
        <span className="text-xs text-muted-fg">OCH-PLAN-882914</span>
      </div>

      <div className={`card-sticker p-5 sm:p-7 ${isConfirmed ? 'bg-mint/20' : 'bg-ink text-cream'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-heading font-bold border-2 border-ink ${isConfirmed ? 'bg-mint/40 text-ink' : 'bg-sun text-ink'}`}>
              {isConfirmed ? 'Plan Confirmed' : 'Action Required • Final Acknowledgment'}
            </span>
            <h1 className={`font-display text-2xl sm:text-3xl font-extrabold ${isConfirmed ? 'text-ink' : 'text-cream'}`}>
              {isConfirmed ? 'Treatment Plan Confirmed' : 'Review Updated Treatment Plan'}
            </h1>
            <p className={`text-sm ${isConfirmed ? 'text-muted-fg' : 'text-cream/80'}`}>
              {state.appointment.protocol} • Cycle {state.appointment.cycleNumber}
            </p>
          </div>
          <div className={`text-center p-4 rounded-xl border-2 border-ink min-w-[150px] ${isConfirmed ? 'bg-white' : 'bg-white/10'}`}>
            <div className="label-caps">Arrival time</div>
            <div className="font-display text-2xl font-extrabold mt-0.5">8:30 AM</div>
            <div className="text-xs mt-0.5">Tomorrow, Aug 24</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card-sticker p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="icon-bubble w-9 h-9 bg-mint text-ink">
                <Stethoscope className="w-4 h-4" strokeWidth={2.5} />
              </span>
              <div>
                <h2 className="font-heading font-bold">Clinical Review & Disposition</h2>
                <p className="text-xs text-muted-fg">Reviewed by Sarah Jenkins, RN, OCN</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-heading font-bold bg-mint/30 border-2 border-ink">
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
              Review Acknowledged
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-cream text-sm space-y-2">
            <p>
              <span className="font-heading font-bold">Your Reported Symptoms: </span>
              <span className="italic">"{state.readinessSubmission.clinicalConcernText}"</span>
            </p>
            <div className="p-3 bg-white rounded-xl border-2 border-ink/10">
              <div className="font-heading font-bold flex items-center gap-1 text-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" strokeWidth={2.5} />
                Triage Nurse Instructions:
              </div>
              <p className="text-sm mt-1 leading-relaxed">
                {clinicalTask?.clinicalDetails?.nurseNotes ||
                  'Patient-reported symptoms reviewed by the assigned nurse. Follow-up instructions and a disposition were recorded for the treatment team.'}
              </p>
            </div>
          </div>
        </div>

        <div className="card-sticker p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="icon-bubble w-9 h-9 bg-sun text-ink">
                <Car className="w-4 h-4" strokeWidth={2.5} />
              </span>
              <div>
                <h2 className="font-heading font-bold">Confirmed Transportation Schedule</h2>
                <p className="text-xs text-muted-fg">Coordinated by Marcus Vance, MSW</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-heading font-bold bg-mint/30 border-2 border-ink">
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
              Vehicle Dispatched
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-cream grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="label-caps text-muted-fg">Pickup window</div>
              <div className="font-heading font-bold">Tomorrow, 7:45 AM</div>
              <div className="text-xs text-muted-fg mt-0.5">1420 St. Charles Ave, New Orleans</div>
            </div>
            <div>
              <div className="label-caps text-muted-fg">Vehicle & driver</div>
              <div className="font-heading font-bold">
                {transportTask?.transportDetails?.vehicleId || 'CareLink Vehicle #402'}
              </div>
              <div className="text-xs text-muted-fg mt-0.5">
                Driver: {transportTask?.transportDetails?.driverName || 'Jerome Davis'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isConfirmed ? (
        <div className="card-sticker p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="font-heading font-bold text-lg">Final Patient Acknowledgment</h2>
            <p className="text-sm text-muted-fg mt-1">
              Confirm the ride time and the nurse instructions before tomorrow.
            </p>
          </div>
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-sun/30 border-2 border-ink/10">
            <input
              type="checkbox"
              id="agree-checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 accent-accent"
            />
            <label htmlFor="agree-checkbox" className="text-sm font-medium cursor-pointer">
              I acknowledge the 7:45 AM Med-Van pickup time and will follow the oral hydration and pre-medication lab instructions given by Nurse Sarah.
            </label>
          </div>
          <button
            onClick={handleConfirmClick}
            disabled={!hasAgreed || isSubmitting}
            className={`btn-candy w-full text-center ${hasAgreed && !isSubmitting ? '' : '!bg-muted !text-muted-fg !shadow-none cursor-not-allowed'}`}
          >
            <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} />
            <span>{isSubmitting ? 'Confirming Plan...' : 'Acknowledge & Confirm Treatment Plan'}</span>
          </button>
        </div>
      ) : (
        <div className="card-sticker p-6 text-center space-y-3 bg-mint/20">
          <div className="icon-bubble w-12 h-12 bg-mint text-ink mx-auto">
            <Sparkles className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <h2 className="font-display text-xl font-extrabold">
            Everything is Set for Tomorrow Morning!
          </h2>
          <p className="text-sm text-muted-fg max-w-md mx-auto">
            Your team has the confirmation. Med-Van arrives at 7:45 AM. Labs are queued for 8:00 AM.
          </p>
          <button onClick={onBackToHome} className="btn-ghost">
            Return to Treatment Dashboard
          </button>
        </div>
      )}
    </div>
  );
};
