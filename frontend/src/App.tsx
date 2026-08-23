import React, { useState, useReducer, useEffect } from 'react';
import { 
  workflowReducer, 
  loadSavedWorkflowState, 
  saveWorkflowState 
} from './state/workflowState';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { StaffAppShell } from './components/StaffAppShell';
import { AuthModal } from './components/AuthModal';
import { PortalAuthScreen } from './components/PortalAuthScreen';
import { PatientTreatmentHome } from './components/PatientTreatmentHome';
import { ReadinessCheckModal } from './components/ReadinessCheckModal';
import { StaffExceptionQueue } from './components/StaffExceptionQueue';
import { StaffCaseWorkspace } from './components/StaffCaseWorkspace';
import { CaregiverView } from './components/CaregiverView';
import { PatientResolutionView } from './components/PatientResolutionView';
import { TreatmentReadinessGraph } from './components/TreatmentReadinessGraph';
import { AuditTimeline } from './components/AuditTimeline';
import {
  StaffAdmin,
  StaffCommandCenter,
  StaffInsights,
  StaffIntegrations,
  StaffPatientDirectory,
  StaffResources,
} from './components/staff/StaffPages';
import { Logo } from './components/Logo';
import { WorkspaceDock } from './components/WorkspaceDock';
import { Network } from 'lucide-react';
import { Perspective } from './types';

export const App: React.FC = () => {
  const [state, dispatch] = useReducer(workflowReducer, null, loadSavedWorkflowState);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isReadinessModalOpen, setIsReadinessModalOpen] = useState<boolean>(false);
  const [isPatientResolutionOpen, setIsPatientResolutionOpen] = useState<boolean>(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientStatus, setPatientStatus] = useState('ALL');
  
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
    setPatientSearch('');
    setPatientStatus('ALL');
    
    setIsAuthModalOpen(false);
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

  const patientDirectory = [
    { name: state.patient.name, mrn: state.patient.mrn, treatment: state.appointment.treatmentName, status: state.overallReadiness, interactive: true },
    { name: 'James Wilson', mrn: 'BHC-992102', treatment: 'Pembrolizumab Infusion', status: 'READY', interactive: false },
    { name: 'David Chen', mrn: 'BHC-992104', treatment: 'Carboplatin + Pembrolizumab', status: 'IN_REVIEW', interactive: false },
    { name: 'Renee Sutton', mrn: 'BHC-992110', treatment: 'Paclitaxel Infusion', status: 'ACTION_REQUIRED', interactive: false },
  ].filter((record) => {
    const matchesSearch = `${record.name} ${record.mrn} ${record.treatment}`.toLowerCase().includes(patientSearch.toLowerCase());
    const matchesStatus = patientStatus === 'ALL' || record.status === patientStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={`min-h-screen min-w-0 w-full overflow-x-clip flex flex-col bg-cream text-ink ${reducedMotion ? 'motion-reduce' : ''}`}>
      
      {/* Universal Clinical & Commercial Header */}
      <Header
        currentPerspective={state.currentPerspective}
        onSetPerspective={handleSetPerspective}
        overallReadiness={state.overallReadiness}
        onReset={handleReset}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={() => setReducedMotion(!reducedMotion)}
        state={state}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Workspace Canvas */}
      <main className={`flex-1 w-full mx-auto min-h-0 ${
        state.currentPerspective === 'LANDING'
          ? 'max-w-none px-0 py-0'
          : state.currentPerspective === 'STAFF'
          ? 'max-w-none px-0 py-0 flex flex-col pb-24 md:pb-28'
          : 'max-w-none px-3 sm:px-6 lg:px-10 py-4 sm:py-6 pb-28'
      }`}>
        
        {/* Perspective: LANDING (Commercial SaaS Showcase) */}
        {state.currentPerspective === 'LANDING' && (
          <LandingPage
            state={state}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onSelectPerspective={handleSetPerspective}
          />
        )}

        {/* Perspective: SIGN_IN (Gateway Role Selector) */}
        {state.currentPerspective === 'SIGN_IN' && (
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
            <StaffAppShell 
              state={state} 
              onSetStaffRoute={(route) => dispatch({ type: 'SET_STAFF_ROUTE', payload: route })}
              onSetPerspective={handleSetPerspective}
              onReset={handleReset}
            >
              {state.staffRoute === 'COMMAND_CENTER' && (
                <StaffCommandCenter
                  state={state}
                  onOpenCase={() => dispatch({ type: 'SET_STAFF_ROUTE', payload: 'CASE_WORKSPACE' })}
                />
              )}
              
              {state.staffRoute === 'EXCEPTIONS' && (
                <StaffExceptionQueue
                  state={state}
                  onOpenCase={() => dispatch({ type: 'SET_STAFF_ROUTE', payload: 'CASE_WORKSPACE' })}
                />
              )}
              
              {state.staffRoute === 'PATIENTS' && (
                <StaffPatientDirectory
                  records={patientDirectory}
                  search={patientSearch}
                  status={patientStatus}
                  onSearch={setPatientSearch}
                  onStatus={setPatientStatus}
                  onClear={() => { setPatientSearch(''); setPatientStatus('ALL'); }}
                  onOpenCase={() => dispatch({ type: 'SET_STAFF_ROUTE', payload: 'CASE_WORKSPACE' })}
                />
              )}
              
              {state.staffRoute === 'CASE_WORKSPACE' && (
                <StaffCaseWorkspace
                  state={state}
                  onBackToQueue={() => dispatch({ type: 'SET_STAFF_ROUTE', payload: 'COMMAND_CENTER' })}
                  onAcknowledgeClinical={handleAcknowledgeClinical}
                  onConfirmTransportation={handleConfirmTransportation}
                  onSwitchPerspective={(p) => handleSetPerspective(p)}
                />
              )}
              
              {state.staffRoute === 'RESOURCES' && <StaffResources />}
              {state.staffRoute === 'INSIGHTS' && <StaffInsights />}
              {state.staffRoute === 'INTEGRATIONS' && <StaffIntegrations />}
              {state.staffRoute === 'ADMIN' && (
                <StaffAdmin
                  onOpenCase={() => dispatch({ type: 'SET_STAFF_ROUTE', payload: 'CASE_WORKSPACE' })}
                  onSetPerspective={handleSetPerspective}
                />
              )}
              
            </StaffAppShell>
        )}

        {/* Perspective: CAREGIVER (Ana Hernandez - Data Minimized) */}
        {state.currentPerspective === 'CAREGIVER' && (
          <CaregiverView
            state={state}
          />
        )}

        {/* Perspective: SYSTEM (Architecture, Graph & Timeline) */}
        {state.currentPerspective === 'SYSTEM' && (
          <div className="page-shell space-y-5">
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
            <div className="card-sticker p-6 space-y-4">
              <div className="flex items-center gap-2 font-heading font-bold text-base">
                <Network className="w-5 h-5 text-accent" strokeWidth={2.5} />
                <span>Deterministic Workflow Engine Architecture</span>
              </div>
              <p className="text-sm text-muted-fg leading-relaxed">
                OncoReady executes as a typed deterministic finite state machine. A single pre-treatment report containing a transportation failure and patient clinical symptoms triggers dual-path routing: preserving untrusted clinical text for human nurse review, and dispatching medical transit for navigation fulfillment. Caregiver views are derived through an explicit permission filter that guarantees clinical confidentiality.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-sm">
                <div className="p-3.5 bg-cream rounded-xl border-2 border-ink">
                  <div className="font-heading font-bold">1. Single Source of Truth</div>
                  <div className="text-muted-fg mt-0.5">Unified workflow state drives patient, queue, graph, caregiver, and audit log synchronously.</div>
                </div>
                <div className="p-3.5 bg-cream rounded-xl border-2 border-ink">
                  <div className="font-heading font-bold">2. Human Authority Guard</div>
                  <div className="text-muted-fg mt-0.5">Clinical concerns are preserved verbatim and routed to named staff; zero automated AI diagnosis.</div>
                </div>
                <div className="p-3.5 bg-cream rounded-xl border-2 border-ink">
                  <div className="font-heading font-bold">3. Deterministic Closure</div>
                  <div className="text-muted-fg mt-0.5">Treatment readiness reaches PLAN_CONFIRMED only after dual staff actions + patient acknowledgment.</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Clean Hospital Footer */}
      <footer className="bg-white border-t-2 border-ink py-5 px-5 sm:px-8 lg:px-12 text-xs text-muted-fg">
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <button
              onClick={() => handleSetPerspective('LANDING')}
              className="flex items-center gap-2"
              aria-label="Go to OncoReady home"
            >
              <Logo size={32} compact />
              <span>Benson Cancer Center</span>
            </button>
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`px-3 py-1.5 rounded-full border-2 border-ink font-heading font-bold ${reducedMotion ? 'bg-sun text-ink' : 'bg-white hover:bg-muted'}`}
            >
              {reducedMotion ? 'Motion off' : 'Reduce motion'}
            </button>
            <div className="flex items-center gap-3 text-[11px]">
              <span>Privacy controls</span>
              <span>FHIR R4 mapping</span>
            </div>
          </div>
        </footer>

      {/* Auth / Workspace Selector Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        state={state}
        onSelectPerspective={handleSetPerspective}
      />

      {/* Readiness Check Guided Modal */}
      <ReadinessCheckModal
        isOpen={isReadinessModalOpen}
        onClose={() => setIsReadinessModalOpen(false)}
        onSubmit={handleReadinessSubmit}
        defaultAddress={state.patient.address}
      />

      {!isAuthModalOpen && !isReadinessModalOpen && (
        <WorkspaceDock
          currentPerspective={state.currentPerspective}
          onSelectPerspective={handleSetPerspective}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />
      )}
    </div>
  );
};
