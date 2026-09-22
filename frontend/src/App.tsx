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
import { Perspective, PreparedWorkspace } from './types';
import { LegalPage } from './components/LegalPage';
import { FoundationStatus } from './components/FoundationStatus';

export const App: React.FC = () => {
  const legalPath = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') : '';
  if (legalPath === '/terms' || legalPath === '/privacy') {
    return <LegalPage document={legalPath.slice(1) as 'terms' | 'privacy'} />;
  }

  const [state, dispatch] = useReducer(workflowReducer, null, loadSavedWorkflowState);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isReadinessModalOpen, setIsReadinessModalOpen] = useState<boolean>(false);
  const [isPatientResolutionOpen, setIsPatientResolutionOpen] = useState<boolean>(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientStatus, setPatientStatus] = useState('ALL');
  
  const [userReducedMotion, setUserReducedMotion] = useState<boolean>(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const reducedMotion = userReducedMotion || systemReducedMotion;

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => setSystemReducedMotion(event.matches);

    setSystemReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Sync state to localStorage on every transition
  useEffect(() => {
    saveWorkflowState(state);
  }, [state]);

  const handleSetPerspective = (p: Perspective) => {
    const normalizedPerspective = p === 'STAFF' || p === 'SYSTEM' ? 'CARE_TEAM' : p;
    dispatch({ type: 'SET_PERSPECTIVE', payload: normalizedPerspective });
  };

  const handleSelectPreparedWorkspace = (workspace: PreparedWorkspace) => {
    if (workspace === 'CARE_NAVIGATOR') {
      dispatch({ type: 'SET_PERSPECTIVE', payload: 'CARE_NAVIGATOR' });
      dispatch({ type: 'SET_STAFF_ROUTE', payload: 'CASE_WORKSPACE' });
      return;
    }

    if (workspace === 'CARE_TEAM') {
      dispatch({ type: 'SET_PERSPECTIVE', payload: 'CARE_TEAM' });
      dispatch({ type: 'SET_STAFF_ROUTE', payload: 'CASE_WORKSPACE' });
      return;
    }

    dispatch({ type: 'SET_PERSPECTIVE', payload: workspace });
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

  const handleAcknowledgeClinical = () => {
    dispatch({
      type: 'ACKNOWLEDGE_CLINICAL_TASK',
    });
  };

  const handleRecordClinicalDisposition = (disposition: string, followUpBlocking: boolean) => {
    dispatch({ type: 'RECORD_CLINICAL_DISPOSITION', payload: { disposition, followUpBlocking } });
  };

  const handleConfirmTransportation = (details: { vehicleId?: string; driverName?: string; pickupTime?: string; returnArrangement?: string; logisticsContact?: string; backupPlan?: string }) => {
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
    <div className={`oncoready-app min-h-screen min-w-0 w-full overflow-x-clip flex flex-col bg-cream text-ink ${reducedMotion ? 'motion-reduce' : ''}`}>
      
      {/* Universal Clinical & Commercial Header */}
      <Header
        currentPerspective={state.currentPerspective}
        onSetPerspective={handleSetPerspective}
        overallReadiness={state.overallReadiness}
        onReset={handleReset}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={() => setUserReducedMotion(!userReducedMotion)}
        state={state}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Workspace Canvas */}
      <main className={`flex-1 w-full mx-auto min-h-0 ${
        state.currentPerspective === 'LANDING'
          ? 'max-w-none px-0 py-0'
          : state.currentPerspective === 'CARE_NAVIGATOR' || state.currentPerspective === 'CARE_TEAM'
          ? 'max-w-none px-0 py-0 flex flex-col pb-24 md:pb-0'
          : 'max-w-none px-3 sm:px-6 lg:px-10 py-3 sm:py-4 pb-28 md:pb-6'
      }`}>
        
        {/* Perspective: LANDING (Commercial SaaS Showcase) */}
        {state.currentPerspective === 'LANDING' && (
          <LandingPage
            reducedMotion={reducedMotion}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
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

        {/* Perspective: PATIENT (Camila Lopez) */}
        {state.currentPerspective === 'PATIENT' && (
          <div>
            {isPatientResolutionOpen ? (
              <PatientResolutionView
                state={state}
                reducedMotion={reducedMotion}
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

          {/* Perspective: CARE NAVIGATOR / CARE TEAM */}
          {(state.currentPerspective === 'CARE_NAVIGATOR' || state.currentPerspective === 'CARE_TEAM') && (
            <StaffAppShell 
              state={state} 
            workspaceRole={state.currentPerspective}
              onSetStaffRoute={(route) => dispatch({ type: 'SET_STAFF_ROUTE', payload: route as import('./types').StaffRoute })}
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
                  workspaceRole={state.currentPerspective}
                  onBackToQueue={() => dispatch({ type: 'SET_STAFF_ROUTE', payload: 'COMMAND_CENTER' })}
                  onAcknowledgeClinical={handleAcknowledgeClinical}
                  onRecordClinicalDisposition={handleRecordClinicalDisposition}
                  onConfirmTransportation={handleConfirmTransportation}
                  onFailTransportation={() => dispatch({ type: 'FAIL_TRANSPORTATION' })}
                  onLoadCheckpoint={(checkpoint) => dispatch({ type: 'LOAD_CHECKPOINT', payload: checkpoint })}
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

      </main>

      <footer className="app-footer py-6 px-5 sm:px-8 lg:px-12 text-xs text-muted-fg">
          <div className="w-full max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <button
              onClick={() => handleSetPerspective('LANDING')}
              className="flex items-center gap-3"
              aria-label="Go to OncoReady home"
            >
              <Logo size={36} />
              <span className="rounded-full border border-line bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">Treatment readiness platform</span>
            </button>
            <button
              onClick={() => setUserReducedMotion(!userReducedMotion)}
              className={`px-3 py-1.5 rounded-lg border border-line font-heading font-semibold ${reducedMotion ? 'bg-accent text-white' : 'bg-white/70 hover:bg-white'}`}
            >
              {reducedMotion ? 'Motion off' : 'Reduce motion'}
            </button>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 text-[11px]">
              <FoundationStatus />
              <a href="/privacy" className="hover:text-accent hover:underline">Privacy Policy</a>
              <a href="/terms" className="hover:text-accent hover:underline">Terms of Service</a>
              <span>FHIR R4 mapping</span>
            </div>
          </div>
        </footer>

      {/* Auth / Workspace Selector Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        state={state}
        onSelectWorkspace={handleSelectPreparedWorkspace}
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
