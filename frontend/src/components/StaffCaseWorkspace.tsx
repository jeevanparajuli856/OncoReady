import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Stethoscope, 
  Car, 
  CheckCircle2, 
  FlaskConical, 
  Pill, 
  HeartPulse, 
  Network
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
  const [activeTab, setActiveTab] = useState<'ACTIONS' | 'REGIMEN' | 'LABS' | 'GRAPH'>('ACTIONS');

  // Task 1: Clinical Review State
  const [nurseNotes, setNurseNotes] = useState<string>(
    'Assessed temp 100.4°F (sub-febrile) & Grade 1 peripheral neuropathy. Contacted patient via clinic line; advised aggressive oral hydration, cold-sensitivity precautions for oxaliplatin, and pre-infusion CBC/CMP labs at 8:00 AM. Clinical clearance granted for pre-medication.'
  );

  // Task 2: Transport Coordination State
  const [vehicleId, setVehicleId] = useState<string>('Ochsner Med-Van #402');
  const [driverName, setDriverName] = useState<string>('Jerome Davis');
  const [pickupTime, setPickupTime] = useState<string>('Tomorrow, 7:45 AM');

  const clinicalTask = state.tasks.find((t) => t.type === 'CLINICAL_REVIEW');
  const transportTask = state.tasks.find((t) => t.type === 'TRANSPORTATION_NAVIGATION');

  const isClinicalDone = clinicalTask?.clinicalDetails?.clearanceState === 'REVIEWED_AND_ACKNOWLEDGED';
  const isTransportDone = transportTask?.transportDetails?.dispatchStatus === 'CONFIRMED';
  const allResolved = (clinicalTask ? isClinicalDone : true) && (transportTask ? isTransportDone : true);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      
      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBackToQueue}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Exception Queue</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">
            EHR Case Ref: ENC-2026-0824-914
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            allResolved
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {allResolved ? 'All Blockers Actioned' : 'Triage Action Required'}
          </span>
        </div>
      </div>

      {/* Patient Clinical EHR Demographics Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <img
              src={state.patient.avatarUrl}
              alt={state.patient.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {state.patient.name}
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold">
                  MRN: {state.patient.mrn}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                  {state.patient.diagnosis}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {state.patient.age}F • {state.patient.stage} • BSA: {state.patient.bodySurfaceArea} • ECOG: {state.patient.ecogStatus}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="p-2.5 px-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="text-[10px] font-mono text-slate-400 uppercase">ATTENDING ONCOLOGIST</div>
              <div className="font-bold text-slate-900">{state.patient.oncologist}</div>
            </div>

            <div className="p-2.5 px-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="text-[10px] font-mono text-slate-400 uppercase">APPOINTMENT</div>
              <div className="font-bold text-slate-900">{state.appointment.scheduledTime}</div>
            </div>
          </div>
        </div>

        {/* Workspace Sub-Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1">
          <button
            onClick={() => setActiveTab('ACTIONS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'ACTIONS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Triage Actions ({state.tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('REGIMEN')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'REGIMEN'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Chemo Protocol & Pre-Meds</span>
          </button>

          <button
            onClick={() => setActiveTab('LABS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'LABS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Labs & Vitals ({state.labs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('GRAPH')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'GRAPH'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Readiness Graph</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TRIAGE ACTIONS WORKBENCH */}
      {activeTab === 'ACTIONS' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Dual Action Cards Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Action Card 1: Clinical Review (Sarah Jenkins RN) */}
            <div className={`bg-white rounded-3xl border-2 p-6 shadow-xs space-y-4 transition-all ${
              isClinicalDone ? 'border-emerald-300' : 'border-sky-300'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm">
                      Task 1: Clinical Symptom Review
                    </h2>
                    <p className="text-xs text-slate-500">
                      Assigned: Sarah Jenkins, BSN, RN, OCN
                    </p>
                  </div>
                </div>

                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  isClinicalDone
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-sky-50 text-sky-700 border border-sky-200'
                }`}>
                  {isClinicalDone ? 'Cleared' : 'Pending Review'}
                </span>
              </div>

              {/* Patient Verbatim Report */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-400 uppercase font-bold">
                    PATIENT-REPORTED CLINICAL TEXT
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-mono">
                    UNALTERED RECORD
                  </span>
                </div>
                <p className="font-medium text-slate-900 italic">
                  "{state.readinessSubmission.clinicalConcernText || 'Mild fever 100.4°F and tingling in fingers since yesterday evening'}"
                </p>
              </div>

              {/* Nurse Assessment Authoring */}
              {!isClinicalDone ? (
                <div className="space-y-3 pt-1 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Triage Nurse Notes & Pre-Infusion Orders:
                    </label>
                    <textarea
                      rows={3}
                      value={nurseNotes}
                      onChange={(e) => setNurseNotes(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed"
                    />
                  </div>

                  <button
                    onClick={() => onAcknowledgeClinical(nurseNotes)}
                    className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-sky-200"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Acknowledge Concern & Authorize Pre-Med Labs</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Clinical Clearance & Advice Recorded</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed">
                    {clinicalTask?.clinicalDetails?.nurseNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Action Card 2: Transportation Navigation (Marcus Vance MSW) */}
            <div className={`bg-white rounded-3xl border-2 p-6 shadow-xs space-y-4 transition-all ${
              isTransportDone ? 'border-emerald-300' : 'border-teal-300'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm">
                      Task 2: Transportation Navigation
                    </h2>
                    <p className="text-xs text-slate-500">
                      Assigned: Marcus Vance, MSW, LCSW
                    </p>
                  </div>
                </div>

                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  isTransportDone
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-teal-50 text-teal-700 border border-teal-200'
                }`}>
                  {isTransportDone ? 'Confirmed' : 'Unassigned'}
                </span>
              </div>

              {/* Patient Transport Note */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                <div className="font-mono text-[10px] text-slate-400 uppercase font-bold">
                  REPORTED TRANSIT BARRIER
                </div>
                <p className="font-medium text-slate-900">
                  {state.readinessSubmission.transportNotes || 'Ride cancelled by family member; needs assisted pickup at 7:45 AM'}
                </p>
              </div>

              {/* Dispatch Form */}
              {!isTransportDone ? (
                <div className="space-y-3 pt-1 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Assigned Vehicle:
                      </label>
                      <input
                        type="text"
                        value={vehicleId}
                        onChange={(e) => setVehicleId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Driver Name:
                      </label>
                      <input
                        type="text"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Pickup Time:
                      </label>
                      <input
                        type="text"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => onConfirmTransportation({ vehicleId, driverName, pickupTime })}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-teal-200"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Dispatch Med-Van</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-2">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Simulated Medical Transport Dispatched</span>
                  </div>
                  <div className="text-slate-800">
                    <span className="font-semibold">{transportTask?.transportDetails?.vehicleId}</span> • Driver: {transportTask?.transportDetails?.driverName} • Pickup: {transportTask?.transportDetails?.confirmedPickupTime}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Quick Handoff Banner */}
          {allResolved && (
            <div className="p-6 bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="space-y-1 text-center sm:text-left">
                <div className="font-extrabold text-base flex items-center justify-center sm:justify-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Clinical & Transport Triage Complete</span>
                </div>
                <p className="text-xs text-slate-300">
                  Both blocker tasks resolved. The updated plan is ready for Maria to review and acknowledge in her Patient Portal.
                </p>
              </div>

              <button
                onClick={() => onSwitchPerspective('PATIENT')}
                className="px-5 py-2.5 bg-white text-slate-900 font-bold rounded-xl text-xs hover:bg-slate-100 transition shadow-xs shrink-0"
              >
                Switch to Patient Portal
              </button>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: CHEMO REGIMEN PROTOCOL */}
      {activeTab === 'REGIMEN' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6 animate-fade-in text-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">
                mFOLFOX6 + Bevacizumab Protocol Order Set
              </h2>
              <p className="text-slate-500">
                Cycle 4 of 12 • Standard Colorectal Adjuvant/Metastatic Regimen
              </p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-mono font-bold rounded-lg">
              Protocol ID: ONC-GI-COL-04
            </span>
          </div>

          <div className="space-y-3">
            {state.appointment.drugs.map((drug, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-bold text-slate-900 text-sm">{drug.name}</span>
                  <span className="font-mono text-indigo-700 font-bold bg-white px-2.5 py-0.5 rounded border border-slate-200">
                    {drug.dosage}
                  </span>
                </div>
                <div className="text-slate-700">
                  <span className="font-semibold">Administration:</span> {drug.route} ({drug.schedule})
                </div>
                <div className="text-slate-500 text-[11px]">
                  Pharmacology: {drug.indication}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900">Pre-Medication Authorization Protocol</div>
            <ul className="list-disc list-inside text-slate-700 space-y-1">
              {state.appointment.premeds.map((pre, idx) => (
                <li key={idx}>{pre}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* TAB 3: LABS & VITALS */}
      {activeTab === 'LABS' && (
        <div className="space-y-6 animate-fade-in">
          {/* Lab Results Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-slate-900 text-base">
                  Pre-Infusion Diagnostic Labs
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">Benson Pathology</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-mono text-slate-400 uppercase">
                    <th className="py-2.5 font-semibold">Test Name</th>
                    <th className="py-2.5 font-semibold">Result Value</th>
                    <th className="py-2.5 font-semibold">Reference Range</th>
                    <th className="py-2.5 font-semibold">Status</th>
                    <th className="py-2.5 font-semibold">Collection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.labs.map((lab, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="py-3 font-bold text-slate-900">{lab.name}</td>
                      <td className="py-3 font-mono font-bold text-slate-800">{lab.value} {lab.unit}</td>
                      <td className="py-3 text-slate-500 font-mono">{lab.referenceRange}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          lab.status === 'NORMAL'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {lab.status}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 text-[11px]">{lab.collectedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vitals Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <HeartPulse className="w-5 h-5 text-rose-600" />
              <h2 className="font-bold text-slate-900 text-base">
                Vital Signs & Clinical Monitoring
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {state.vitals.map((vit, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">{vit.name}</div>
                  <div className={`text-base font-extrabold ${
                    vit.status === 'ATTENTION' ? 'text-amber-700' : 'text-slate-900'
                  }`}>
                    {vit.value}
                  </div>
                  <div className="text-[10px] text-slate-500">{vit.collectedAt}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE READINESS GRAPH */}
      {activeTab === 'GRAPH' && (
        <div className="animate-fade-in">
          <TreatmentReadinessGraph
            appointment={state.appointment}
            tasks={state.tasks}
            overallReadiness={state.overallReadiness}
            patientAcknowledged={state.patientAcknowledged}
            readinessCheckCompleted={state.readinessCheckCompleted}
            onNavigateToPatient={() => onSwitchPerspective('PATIENT')}
          />
        </div>
      )}

    </div>
  );
};
