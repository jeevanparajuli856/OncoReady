import React, { useState } from 'react';
import {
  ArrowLeft,
  Stethoscope,
  Car,
  CheckCircle2,
  FlaskConical,
  Pill,
  HeartPulse,
  Network,
} from 'lucide-react';
import { WorkflowState } from '../types';
import { TreatmentReadinessGraph } from './TreatmentReadinessGraph';
import { BENSON_CENTER, NEW_ORLEANS_PICKUP, RideMap } from './RideMap';

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
  const [nurseNotes, setNurseNotes] = useState<string>(
    'Patient-reported symptoms reviewed by the assigned nurse. Follow-up instructions and a disposition were recorded for the treatment team.'
  );
  const [vehicleId, setVehicleId] = useState<string>('CareLink Vehicle #402');
  const [driverName, setDriverName] = useState<string>('Jerome Davis');
  const [pickupTime, setPickupTime] = useState<string>('Tomorrow, 7:45 AM');

  const clinicalTask = state.tasks.find((t) => t.type === 'CLINICAL_REVIEW');
  const transportTask = state.tasks.find((t) => t.type === 'TRANSPORTATION_NAVIGATION');
  const isClinicalDone = clinicalTask?.clinicalDetails?.clearanceState === 'REVIEWED_AND_ACKNOWLEDGED';
  const isTransportDone = transportTask?.transportDetails?.dispatchStatus === 'CONFIRMED';
  const allResolved = (clinicalTask ? isClinicalDone : true) && (transportTask ? isTransportDone : true);

  const tabs = [
    ['ACTIONS', 'Triage Actions', state.tasks.length, Stethoscope],
    ['REGIMEN', 'Chemo Protocol & Pre-Meds', null, Pill],
    ['LABS', 'Labs & Vitals', state.labs.length, FlaskConical],
    ['GRAPH', 'Readiness Graph', null, Network],
  ] as const;

  return (
    <div className="page-shell space-y-5 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBackToQueue}
          className="inline-flex items-center gap-1.5 text-sm font-heading font-bold hover:text-accent"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
          Back to Exception Queue
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-muted-fg">EHR Case Ref: ENC-2026-0824-914</span>
          <span className={`chip ${allResolved ? 'chip-mint' : 'chip-sun'}`}>
            {allResolved ? 'All Blockers Actioned' : 'Triage Action Required'}
          </span>
        </div>
      </div>

      <div className="card-sticker p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b-2 border-ink/10">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={state.patient.avatarUrl}
              alt={state.patient.name}
              className="w-14 h-14 rounded-xl object-cover border-2 border-ink shrink-0"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-xl font-extrabold">{state.patient.name}</h1>
                <span className="chip font-mono">MRN: {state.patient.mrn}</span>
                <span className="chip chip-accent">{state.patient.diagnosis}</span>
              </div>
              <p className="text-xs text-muted-fg mt-1">
                {state.patient.age}F • {state.patient.stage} • BSA: {state.patient.bodySurfaceArea} • ECOG: {state.patient.ecogStatus}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="metric-tile">
              <div className="label-caps text-muted-fg">Attending oncologist</div>
              <div className="font-heading font-bold text-sm mt-0.5">{state.patient.oncologist}</div>
            </div>
            <div className="metric-tile">
              <div className="label-caps text-muted-fg">Appointment</div>
              <div className="font-heading font-bold text-sm mt-0.5">{state.appointment.scheduledTime}</div>
            </div>
          </div>
        </div>

        <div className="filter-bar w-full">
          {tabs.map(([id, label, count, Icon]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`filter-pill ${activeTab === id ? 'filter-pill-active' : ''}`}
            >
              <Icon className="w-3.5 h-3.5 inline mr-1" strokeWidth={2.5} />
              {label}{count !== null ? ` (${count})` : ''}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'ACTIONS' && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className={`card-sticker p-5 space-y-4 ${isClinicalDone ? 'bg-mint/10' : ''}`}>
              <div className="flex items-start justify-between gap-3 pb-3 border-b-2 border-ink/10">
                <div className="flex items-center gap-3">
                  <span className="icon-bubble w-10 h-10 bg-accent text-white">
                    <Stethoscope className="w-4 h-4" strokeWidth={2.5} />
                  </span>
                  <div>
                    <h2 className="font-heading font-bold">Task 1: Clinical Symptom Review</h2>
                    <p className="text-xs text-muted-fg">Assigned: Sarah Jenkins, BSN, RN, OCN</p>
                  </div>
                </div>
                <span className={`chip ${isClinicalDone ? 'chip-mint' : 'chip-sun'}`}>
                  {isClinicalDone ? 'Reviewed' : 'Pending Review'}
                </span>
              </div>

              <div className="metric-tile space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="label-caps text-muted-fg">Patient-reported clinical text</span>
                  <span className="chip chip-accent">UNALTERED RECORD</span>
                </div>
                <p className="text-sm italic">
                  "{state.readinessSubmission.clinicalConcernText || 'Mild fever 100.4°F and tingling in fingers since yesterday evening'}"
                </p>
              </div>

              {!isClinicalDone ? (
                <div className="space-y-3 btn-stack">
                  <label className="label-caps">Triage Nurse Notes & Pre-Infusion Orders:</label>
                  <textarea
                    rows={3}
                    value={nurseNotes}
                    onChange={(e) => setNurseNotes(e.target.value)}
                    className="input-pop text-sm leading-relaxed"
                  />
                  <button
                    onClick={() => onAcknowledgeClinical(nurseNotes)}
                    className="btn-candy w-full"
                  >
                    <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                    <span>Acknowledge Review & Record Disposition</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-mint/20 border-2 border-ink/10 space-y-2">
                  <div className="font-heading font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                    Clinical Review & Disposition Recorded
                  </div>
                  <p className="text-sm leading-relaxed">{clinicalTask?.clinicalDetails?.nurseNotes}</p>
                </div>
              )}
            </div>

            <div className={`card-sticker p-5 space-y-4 ${isTransportDone ? 'bg-mint/10' : ''}`}>
              <div className="flex items-start justify-between gap-3 pb-3 border-b-2 border-ink/10">
                <div className="flex items-center gap-3">
                  <span className="icon-bubble w-10 h-10 bg-sun text-ink">
                    <Car className="w-4 h-4" strokeWidth={2.5} />
                  </span>
                  <div>
                    <h2 className="font-heading font-bold">Task 2: Transportation Navigation</h2>
                    <p className="text-xs text-muted-fg">Assigned: Marcus Vance, MSW, LCSW</p>
                  </div>
                </div>
                <span className={`chip ${isTransportDone ? 'chip-mint' : 'chip-sun'}`}>
                  {isTransportDone ? 'Confirmed' : 'Unassigned'}
                </span>
              </div>

              <div className="metric-tile space-y-1.5">
                <div className="label-caps text-muted-fg">Reported transit barrier</div>
                <p className="text-sm">
                  {state.readinessSubmission.transportNotes || 'Ride cancelled by family member; needs assisted pickup at 7:45 AM'}
                </p>
              </div>

              {!isTransportDone ? (
                <div className="space-y-3 btn-stack">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="label-caps mb-1">Assigned Vehicle:</label>
                      <input type="text" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className="input-pop text-sm font-heading font-bold" />
                    </div>
                    <div>
                      <label className="label-caps mb-1">Driver Name:</label>
                      <input type="text" value={driverName} onChange={(e) => setDriverName(e.target.value)} className="input-pop text-sm font-heading font-bold" />
                    </div>
                    <div>
                      <label className="label-caps mb-1">Pickup Time:</label>
                      <input type="text" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="input-pop text-sm font-heading font-bold" />
                    </div>
                  </div>
                  <button
                    onClick={() => onConfirmTransportation({ vehicleId, driverName, pickupTime })}
                    className="btn-candy w-full"
                  >
                    <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                    <span>Confirm & Dispatch Med-Van</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-mint/20 border-2 border-ink/10 space-y-3">
                  <div className="font-heading font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                    Transportation Coordination Confirmed
                  </div>
                  <p className="text-sm">
                    <span className="font-heading font-bold">{transportTask?.transportDetails?.vehicleId}</span>
                    {' • Driver: '}
                    {transportTask?.transportDetails?.driverName}
                    {' • Pickup: '}
                    {transportTask?.transportDetails?.confirmedPickupTime}
                  </p>
                  <RideMap
                    title="Confirmed pickup corridor"
                    subtitle="St. Charles Ave to Benson Suite B"
                    pickup={NEW_ORLEANS_PICKUP}
                    destination={BENSON_CENTER}
                    confirmed
                    height={200}
                  />
                </div>
              )}
            </div>
          </div>

          {allResolved && (
            <div className="card-sticker p-5 sm:p-6 bg-ink text-cream btn-stack flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-heading font-extrabold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-mint" strokeWidth={2.5} />
                  Clinical & Transport Triage Complete
                </div>
                <p className="text-sm text-cream/75">
                  Both blocker tasks resolved. The updated plan is ready for Camila to review and acknowledge in her Patient Portal.
                </p>
              </div>
              <button onClick={() => onSwitchPerspective('PATIENT')} className="btn-candy !bg-sun !text-ink shrink-0">
                Switch to Patient Portal
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'REGIMEN' && (
        <div className="card-sticker p-5 sm:p-6 space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-ink/10">
            <div>
              <h2 className="font-heading font-extrabold text-lg">mFOLFOX6 + Bevacizumab Protocol Order Set</h2>
              <p className="text-sm text-muted-fg">Cycle 4 of 12 • Standard Colorectal Adjuvant/Metastatic Regimen</p>
            </div>
            <span className="chip chip-accent font-mono">Protocol ID: ONC-GI-COL-04</span>
          </div>
          <div className="space-y-3">
            {state.appointment.drugs.map((drug, idx) => (
              <div key={idx} className="metric-tile space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-heading font-bold">{drug.name}</span>
                  <span className="chip chip-accent font-mono">{drug.dosage}</span>
                </div>
                <p className="text-sm text-muted-fg">
                  <span className="font-heading font-bold text-ink">Administration:</span> {drug.route} ({drug.schedule})
                </p>
                <p className="text-xs text-muted-fg">Pharmacology: {drug.indication}</p>
              </div>
            ))}
          </div>
          <div className="metric-tile space-y-2">
            <div className="font-heading font-bold">Pre-Medication Authorization Protocol</div>
            <ul className="list-disc list-inside text-sm text-muted-fg space-y-1">
              {state.appointment.premeds.map((pre, idx) => (
                <li key={idx}>{pre}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'LABS' && (
        <div className="space-y-5 animate-fade-in">
          <div className="card-sticker p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2 pb-3 border-b-2 border-ink/10">
              <div className="flex items-center gap-2 font-heading font-bold">
                <FlaskConical className="w-4 h-4 text-accent" strokeWidth={2.5} />
                Pre-Infusion Diagnostic Labs
              </div>
              <span className="text-xs text-muted-fg">Benson Pathology</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-ink/10">
                    {['Test Name', 'Result Value', 'Reference Range', 'Status', 'Collection'].map((h) => (
                      <th key={h} className="py-2.5 label-caps text-muted-fg">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/10">
                  {state.labs.map((lab, idx) => (
                    <tr key={idx}>
                      <td className="py-3 font-heading font-bold">{lab.name}</td>
                      <td className="py-3 font-mono">{lab.value} {lab.unit}</td>
                      <td className="py-3 text-muted-fg font-mono text-xs">{lab.referenceRange}</td>
                      <td className="py-3">
                        <span className={`chip ${lab.status === 'NORMAL' ? 'chip-mint' : 'chip-sun'}`}>{lab.status}</span>
                      </td>
                      <td className="py-3 text-xs text-muted-fg">{lab.collectedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card-sticker p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 font-heading font-bold">
              <HeartPulse className="w-4 h-4 text-pop" strokeWidth={2.5} />
              Vital Signs & Clinical Monitoring
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {state.vitals.map((vit, idx) => (
                <div key={idx} className="metric-tile">
                  <div className="label-caps text-muted-fg">{vit.name}</div>
                  <div className="font-display text-xl font-extrabold mt-1">{vit.value}</div>
                  <div className="text-[11px] text-muted-fg">{vit.collectedAt}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
