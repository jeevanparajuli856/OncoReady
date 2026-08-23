import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Car, 
  Stethoscope, 
  ArrowLeft, 
  ShieldCheck,
  Sparkles
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
    
    // Safely trigger lightweight celebratory confetti only if canvas 2d is supported
    try {
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        if (canvas && typeof canvas.getContext === 'function' && canvas.getContext('2d')) {
          confetti({
            particleCount: 75,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#10B981', '#6366F1', '#0EA5E9', '#F59E0B'],
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
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Treatment Home</span>
        </button>

        <span className="text-xs font-mono text-slate-400">
          Document Ref: OCH-PLAN-882914
        </span>
      </div>

      {/* Hero Card */}
      <div className={`rounded-2xl p-6 sm:p-8 border shadow-lg transition-all ${
        isConfirmed
          ? 'bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 text-white border-emerald-400/50 shadow-emerald-900/20'
          : 'bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white border-indigo-400/40 shadow-indigo-900/20'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isConfirmed 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' 
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
              }`}>
                {isConfirmed ? '✓ Plan Confirmed' : 'Action Required • Final Acknowledgment'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {isConfirmed ? 'Treatment Plan Confirmed' : 'Review Updated Treatment Plan'}
            </h1>
            <p className="text-sm text-slate-300">
              {state.appointment.protocol} • Cycle {state.appointment.cycleNumber}
            </p>
          </div>

          <div className="text-center bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 min-w-[160px]">
            <div className="text-[11px] font-mono text-slate-300 uppercase">ARRIVAL TIME</div>
            <div className="text-xl font-bold text-white mt-0.5">8:30 AM</div>
            <div className="text-[11px] text-emerald-300 mt-0.5 font-medium">Tomorrow, Aug 24</div>
          </div>
        </div>
      </div>

      {/* Two Resolution Pillars */}
      <div className="space-y-4">
        
        {/* Pillar 1: Clinical Guidance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Clinical Symptom Clearance & Advice</h2>
                <p className="text-[11px] text-slate-500">Reviewed by Sarah Jenkins, RN, OCN</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Triage Cleared
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
            <div className="text-slate-600">
              <span className="font-semibold text-slate-900">Your Reported Symptoms: </span>
              <span className="italic">"{state.readinessSubmission.clinicalConcernText}"</span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-emerald-200 space-y-1">
              <div className="font-bold text-emerald-900 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Triage Nurse Instructions:</span>
              </div>
              <p className="text-slate-800 leading-relaxed">
                {clinicalTask?.clinicalDetails?.nurseNotes || 
                  'Assessed temp 100.4°F (sub-febrile) & Grade 1 peripheral neuropathy. Contacted patient via secure line; advised aggressive oral hydration, cold-sensitivity precautions for oxaliplatin, and pre-infusion CBC/CMP labs at 8:00 AM. Clinical clearance granted for pre-medication.'}
              </p>
            </div>
          </div>
        </div>

        {/* Pillar 2: Confirmed Transportation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Confirmed Transportation Schedule</h2>
                <p className="text-[11px] text-slate-500">Coordinated by Marcus Vance, MSW</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Vehicle Dispatched
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[11px] text-slate-500 block font-mono">PICKUP WINDOW</span>
              <span className="font-bold text-slate-900 text-sm">Tomorrow, 7:45 AM</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">1420 St. Charles Ave, New Orleans</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block font-mono">VEHICLE & DRIVER</span>
              <span className="font-bold text-slate-900 text-sm">
                {transportTask?.transportDetails?.vehicleId || 'Ochsner Med-Van #402'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Driver: {transportTask?.transportDetails?.driverName || 'Jerome Davis'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Confirmation Closure Card */}
      {!isConfirmed ? (
        <div className="bg-white rounded-2xl border-2 border-indigo-400 p-6 shadow-lg space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              Final Patient Acknowledgment
            </h2>
            <p className="text-xs text-slate-600">
              Please confirm that you have reviewed your confirmed transportation and pre-medication instructions.
            </p>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100">
            <input
              type="checkbox"
              id="agree-checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="agree-checkbox" className="text-xs text-slate-800 font-medium cursor-pointer">
              I acknowledge the 7:45 AM Med-Van pickup time and will follow the oral hydration and pre-medication lab instructions given by Nurse Sarah.
            </label>
          </div>

          <button
            onClick={handleConfirmClick}
            disabled={!hasAgreed || isSubmitting}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-md ${
              hasAgreed && !isSubmitting
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 active:scale-98 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isSubmitting ? 'Confirming Plan...' : 'Acknowledge & Confirm Treatment Plan'}</span>
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-300 p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-emerald-950">
            Everything is Set for Tomorrow Morning!
          </h2>
          <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
            Your oncology team has been notified of your acknowledgment. Your Med-Van driver will arrive at 7:45 AM, and pre-medication labs are queued for 8:00 AM.
          </p>
          <button
            onClick={onBackToHome}
            className="mt-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition"
          >
            Return to Treatment Dashboard
          </button>
        </div>
      )}
    </div>
  );
};
