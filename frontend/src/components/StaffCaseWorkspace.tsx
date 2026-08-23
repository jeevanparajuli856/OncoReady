import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Stethoscope, 
  Car, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  Calendar, 
  ChevronRight
} from 'lucide-react';
import { WorkflowState } from '../types';
import { TreatmentReadinessGraph } from './TreatmentReadinessGraph';

interface StaffCaseWorkspaceProps {
  state: WorkflowState;
  onBackToQueue: () => void;
  onAcknowledgeClinical: (nurseNotes?: string) => void;
  onConfirmTransportation: (details: { vehicleId?: string; driverName?: string; pickupTime?: string }) => void;
  onSwitchPerspective: (p: 'PATIENT' | 'CAREGIVER' | 'SYSTEM') => void;
}

export const StaffCaseWorkspace: React.FC<StaffCaseWorkspaceProps> = ({
  state,
  onBackToQueue,
  onAcknowledgeClinical,
  onConfirmTransportation,
  onSwitchPerspective,
}) => {
  const clinicalTask = state.tasks.find((t) => t.type === 'CLINICAL_REVIEW');
  const transportTask = state.tasks.find((t) => t.type === 'TRANSPORTATION_NAVIGATION');

  const clinicalResolved = clinicalTask?.clinicalDetails?.clearanceState === 'REVIEWED_AND_ACKNOWLEDGED';
  const transportResolved = transportTask?.transportDetails?.dispatchStatus === 'CONFIRMED';
  const allStaffResolved = clinicalResolved && transportResolved;

  const [nurseNotes, setNurseNotes] = useState<string>(
    'Assessed temp 100.4°F (sub-febrile) & Grade 1 peripheral neuropathy. Contacted patient via secure line; advised aggressive oral hydration, cold-sensitivity precautions for oxaliplatin, and pre-infusion CBC/CMP labs at 8:00 AM. Clinical clearance granted for pre-medication.'
  );

  const [selectedVehicle, setSelectedVehicle] = useState<string>('Ochsner Med-Van #402');
  const [driverName, setDriverName] = useState<string>('Jerome Davis');
  const [pickupTime, setPickupTime] = useState<string>('Tomorrow, 7:45 AM');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToQueue}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Exception Queue</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono">Case ID: {state.patient.id}</span>
          <span className="text-slate-300">•</span>
          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium font-mono">
            EHR Linked (Simulated)
          </span>
        </div>
      </div>

      {/* Patient & Treatment Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {state.patient.name}
              </h1>
              <span className="text-xs text-slate-500 font-mono">
                MRN: {state.patient.mrn} • {state.patient.age}F
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {state.patient.diagnosis}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold">{state.appointment.protocol}</span> (Cycle {state.appointment.cycleNumber})
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{state.appointment.scheduledTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{state.appointment.location}</span>
              </div>
            </div>
          </div>

          {/* Quick Staff Readiness Status */}
          <div className="flex items-center gap-3 self-start lg:self-center">
            {state.overallReadiness === 'PLAN_CONFIRMED' ? (
              <div className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>PLAN CONFIRMED & READY</span>
              </div>
            ) : allStaffResolved ? (
              <div className="px-4 py-2 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>STAFF ACTIONS COMPLETE (AWAITING MARIA)</span>
              </div>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-2 animate-pulse-subtle">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>2 BLOCKERS REQUIRE STAFF ACTION</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dual-Task Interactive Action Workbench */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* TASK 1: Clinical Symptom Review */}
        <div className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col justify-between transition ${
          clinicalResolved ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-amber-300 ring-1 ring-amber-200'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  clinicalResolved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Task 1: Clinical Symptom Review</h2>
                  <p className="text-[11px] text-slate-500 font-mono">ID: TSK-CLN-401 • Assigned: Sarah Jenkins, RN</p>
                </div>
              </div>

              {clinicalResolved ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Acknowledged
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Action Required
                </span>
              )}
            </div>

            {/* Verbatim Clinical Quote Well */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>VERBATIM PATIENT INPUT</span>
                <span className="text-indigo-600 font-medium">Reported 08:45 AM</span>
              </div>
              <p className="text-xs text-slate-900 font-medium italic">
                "{clinicalTask?.clinicalDetails?.verbatimReport || state.readinessSubmission.clinicalConcernText || 'Mild fever 100.4°F and tingling in fingers since yesterday evening'}"
              </p>
              
              {/* Human Authority Notice */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1 text-[11px] text-indigo-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Deterministic Route • Human Triage Required (No AI Diagnosis)</span>
              </div>
            </div>

            {/* Nurse Action Input / Completed Summary */}
            {clinicalResolved ? (
              <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs space-y-2">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Clinical Clearance & Advice Recorded</span>
                </div>
                <p className="text-emerald-800 leading-relaxed">
                  {clinicalTask?.clinicalDetails?.nurseNotes || nurseNotes}
                </p>
                <div className="text-[11px] text-emerald-700 font-mono pt-1">
                  Reviewed by Sarah Jenkins, RN, OCN • Today, 10:15 AM
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Triage Nurse Assessment & Action Note:
                </label>
                <textarea
                  rows={3}
                  value={nurseNotes}
                  onChange={(e) => setNurseNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Record clinical advice, hydration instructions, lab timing..."
                />
              </div>
            )}
          </div>

          {!clinicalResolved && (
            <button
              onClick={() => onAcknowledgeClinical(nurseNotes)}
              className="mt-4 w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Acknowledge Concern & Authorize Pre-Med Labs</span>
            </button>
          )}
        </div>

        {/* TASK 2: Transportation Navigation */}
        <div className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col justify-between transition ${
          transportResolved ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-amber-300 ring-1 ring-amber-200'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  transportResolved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Task 2: Transportation Navigation</h2>
                  <p className="text-[11px] text-slate-500 font-mono">ID: TSK-TRN-402 • Assigned: Marcus Vance, MSW</p>
                </div>
              </div>

              {transportResolved ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirmed
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Action Required
                </span>
              )}
            </div>

            {/* Transport Request Summary */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>RIDE DISPATCH REQUEST</span>
                <span className="text-amber-600 font-semibold">Ride Cancelled</span>
              </div>
              <div className="space-y-1 text-slate-800">
                <div><span className="font-semibold text-slate-600">Pickup: </span>1420 St. Charles Ave, New Orleans, LA</div>
                <div><span className="font-semibold text-slate-600">Destination: </span>Ochsner Benson Cancer Center</div>
                <div><span className="font-semibold text-slate-600">Requested Arrival: </span>Tomorrow, 8:15 AM (7:45 AM Pickup)</div>
              </div>
            </div>

            {/* Transport Action Input / Completed Summary */}
            {transportResolved ? (
              <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs space-y-2">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Simulated Medical Transport Dispatched</span>
                </div>
                <div className="text-emerald-800 space-y-0.5">
                  <div>Vehicle: <span className="font-semibold">{transportTask?.transportDetails?.vehicleId || selectedVehicle}</span></div>
                  <div>Driver: <span className="font-semibold">{transportTask?.transportDetails?.driverName || driverName}</span></div>
                  <div>Pickup Window: <span className="font-semibold">{transportTask?.transportDetails?.confirmedPickupTime || pickupTime}</span></div>
                </div>
                <div className="text-[11px] text-emerald-700 font-mono pt-1">
                  Dispatched by Marcus Vance, MSW • Today, 11:30 AM
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-1 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Assigned Vehicle:
                    </label>
                    <select
                      value={selectedVehicle}
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Ochsner Med-Van #402">Ochsner Med-Van #402</option>
                      <option value="Ochsner Transit Sedan #108">Ochsner Transit Sedan #108</option>
                      <option value="Community Rideshare Voucher">Community Rideshare Voucher</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Driver Name:
                    </label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Confirmed Pickup Time:
                  </label>
                  <input
                    type="text"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>

          {!transportResolved && (
            <button
              onClick={() => onConfirmTransportation({ vehicleId: selectedVehicle, driverName, pickupTime })}
              className="mt-4 w-full py-3 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <Car className="w-4 h-4" />
              <span>Confirm & Dispatch Med-Van (Notify Caregiver)</span>
            </button>
          )}
        </div>

      </div>

      {/* Embedded Live Treatment Readiness Graph */}
      <TreatmentReadinessGraph
        appointment={state.appointment}
        tasks={state.tasks}
        overallReadiness={state.overallReadiness}
        patientAcknowledged={state.patientAcknowledged}
        readinessCheckCompleted={state.readinessCheckCompleted}
        onNavigateToPatient={() => onSwitchPerspective('PATIENT')}
      />

      {/* Next Step Callout when both are completed */}
      {allStaffResolved && !state.patientAcknowledged && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-950">
                Staff Resolution Complete • Ready for Patient Acknowledgment
              </div>
              <div className="text-xs text-indigo-700">
                Switch to Maria's patient perspective to review the updated plan and trigger closure.
              </div>
            </div>
          </div>

          <button
            onClick={() => onSwitchPerspective('PATIENT')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <span>Switch to Patient View</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
