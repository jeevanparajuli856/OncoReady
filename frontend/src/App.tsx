import React, { useState, useReducer, useEffect } from 'react';
import { 
  workflowReducer, 
  loadSavedWorkflowState, 
  saveWorkflowState 
} from './state/workflowState';
import { Header } from './components/Header';
import { PortalAuthScreen } from './components/PortalAuthScreen';
import { PatientTreatmentHome } from './components/PatientTreatmentHome';
import { ReadinessCheckModal } from './components/ReadinessCheckModal';
import { StaffExceptionQueue } from './components/StaffExceptionQueue';
import { StaffCaseWorkspace } from './components/StaffCaseWorkspace';
import { CaregiverView } from './components/CaregiverView';
import { PatientResolutionView } from './components/PatientResolutionView';
import { TreatmentReadinessGraph } from './components/TreatmentReadinessGraph';
import { AuditTimeline } from './components/AuditTimeline';
import { Network, Building2 } from 'lucide-react';
import { Perspective } from './types';

export const App: React.FC = () => {
  const [state, dispatch] = useReducer(workflowReducer, null, loadSavedWorkflowState);
  const [isReadinessModalOpen, setIsReadinessModalOpen] = useState<boolean>(false);
  const [isPatientResolutionOpen, setIsPatientResolutionOpen] = useState<boolean>(false);
  const [selectedStaffCase, setSelectedStaffCase] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Sync state to localStorage on every transition
  useEffect(() => {
    saveWorkflowState(state);
  }, [state]);

  const handleSetPerspective = (p: Perspective) => {
    dispatch({ type: 'SET_PERSPECTIVE', payload: p });
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_WORKFLOW' });
    setIsReadinessModalOpen(false);
    setIsPatientResolutionOpen(false);
    setSelectedStaffCase(null);
  };

  const handleReadinessSubmit = (data: { transportNotes: string; clinicalConcernText: string }) => {
    dispatch({
      type: 'SUBMIT_READINESS',
      payload: data,
    });
  };

  const handleAcknowledgeClinical = (nurseNotes?: string) => {
    dispatch({
      type: 'ACKNOWLEDGE_CLINICAL_TASK',
      payload: { nurseNotes },
    });
  };

  const handleConfirmTransportation = (details: { vehicleId?: string; driverName?: string; pickupTime?: string }) => {
    dispatch({
      type: 'CONFIRM_TRANSPORTATION',
      payload: details,
    });
  };

  const handleAcknowledgePlan = () => {
    dispatch({ type: 'ACKNOWLEDGE_PATIENT_PLAN' });
  };

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 text-slate-900 ${reducedMotion ? 'motion-reduce' : ''}`}>
      
      {/* Universal Clinical Header */}
      <Header
        currentPerspective={state.currentPerspective}
        onSetPerspective={handleSetPerspective}
        overallReadiness={state.overallReadiness}
        onReset={handleReset}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={() => setReducedMotion(!reducedMotion)}
        state={state}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Perspective: PORTAL_AUTH (Gateway Role Selector) */}
        {state.currentPerspective === 'PORTAL_AUTH' && (
          <PortalAuthScreen
            state={state}
            onSelectPerspective={handleSetPerspective}
            onReset={handleReset}
          />
        )}

        {/* Perspective: PATIENT (Maria Hernandez) */}
        {state.currentPerspective === 'PATIENT' && (
          <div>
            {isPatientResolutionOpen ? (
              <PatientResolutionView
                state={state}
                onAcknowledgePlan={handleAcknowledgePlan}
                onBackToHome={() => setIsPatientResolutionOpen(false)}
              />
            ) : (
              <PatientTreatmentHome
                patient={state.patient}
                appointment={state.appointment}
                caregiver={state.caregiver}
                readinessCheckCompleted={state.readinessCheckCompleted}
                patientAcknowledged={state.patientAcknowledged}
                tasks={state.tasks}
                labs={state.labs}
                vitals={state.vitals}
                onStartReadinessCheck={() => setIsReadinessModalOpen(true)}
                onOpenResolutionView={() => setIsPatientResolutionOpen(true)}
                onSwitchPerspective={(p) => handleSetPerspective(p)}
              />
            )}
          </div>
        )}

        {/* Perspective: STAFF (Clinical Triage & Navigator) */}
        {state.currentPerspective === 'STAFF' && (
          <div>
            {selectedStaffCase ? (
              <StaffCaseWorkspace
                state={state}
                onBackToQueue={() => setSelectedStaffCase(null)}
                onAcknowledgeClinical={handleAcknowledgeClinical}
                onConfirmTransportation={handleConfirmTransportation}
                onSwitchPerspective={(p) => handleSetPerspective(p)}
              />
            ) : (
              <StaffExceptionQueue
                state={state}
                onOpenCase={() => setSelectedStaffCase(state.patient.id)}
              />
            )}
          </div>
        )}

        {/* Perspective: CAREGIVER (Ana Hernandez - Data Minimized) */}
        {state.currentPerspective === 'CAREGIVER' && (
          <CaregiverView
            state={state}
          />
        )}

        {/* Perspective: SYSTEM (Architecture, Graph & Timeline) */}
        {state.currentPerspective === 'SYSTEM' && (
          <div className="space-y-8 max-w-6xl mx-auto">
            {/* Embedded Live Treatment Readiness Graph */}
            <TreatmentReadinessGraph
              appointment={state.appointment}
              tasks={state.tasks}
              overallReadiness={state.overallReadiness}
              patientAcknowledged={state.patientAcknowledged}
              readinessCheckCompleted={state.readinessCheckCompleted}
              onNavigateToPatient={() => handleSetPerspective('PATIENT')}
            />

            {/* Audit Event Timeline */}
            <AuditTimeline events={state.auditEvents} />

            {/* Architecture Explanatory Summary Box */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Network className="w-5 h-5 text-indigo-600" />
                <span>Deterministic Workflow Engine Architecture</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                OncoReady executes as a typed deterministic finite state machine. A single pre-treatment report containing a transportation failure and patient clinical symptoms triggers dual-path routing: preserving untrusted clinical text for human nurse review, and dispatching medical transit for navigation fulfillment. Caregiver views are derived through an explicit permission filter that guarantees clinical confidentiality.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="font-bold text-slate-900">1. Single Source of Truth</div>
                  <div className="text-slate-500 mt-0.5">Unified workflow state drives patient, queue, graph, caregiver, and audit log synchronously.</div>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="font-bold text-slate-900">2. Human Authority Guard</div>
                  <div className="text-slate-500 mt-0.5">Clinical concerns are preserved verbatim and routed to named staff; zero automated AI diagnosis.</div>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="font-bold text-slate-900">3. Deterministic Closure</div>
                  <div className="text-slate-500 mt-0.5">Treatment readiness reaches PLAN_CONFIRMED only after dual staff actions + patient acknowledgment.</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Clean Hospital Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 shadow-2xs text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-semibold text-slate-700">Ochsner Health • Benson Cancer Center</span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-slate-500">Clinical Oncology Continuity System</span>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Document Standard: HL7 FHIR R4 &amp; USCDI v3 Aligned
          </div>
        </div>
      </footer>

      {/* Readiness Check Guided Modal */}
      <ReadinessCheckModal
        isOpen={isReadinessModalOpen}
        onClose={() => setIsReadinessModalOpen(false)}
        onSubmit={handleReadinessSubmit}
        defaultAddress={state.patient.address}
      />
    </div>
  );
};
