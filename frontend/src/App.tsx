import React, { useState, useReducer, useEffect } from 'react';
import { 
  workflowReducer, 
  loadSavedWorkflowState, 
  saveWorkflowState,
  deriveCaregiverProjection,
} from './state/workflowState';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { StaffAppShell } from './components/StaffAppShell';
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
} from './components/staff/StaffPages';
import { Logo } from './components/Logo';
import { Perspective, WorkspaceRole } from './types';
import { buildDirectoryRecords, filterDirectoryRecords } from './data/rosterDirectory';
import { LegalPage } from './components/LegalPage';
import { FoundationStatus } from './components/FoundationStatus';
import { TransportationWorkspace } from './components/TransportationWorkspace';
import { LiveOutreachControl } from './components/LiveOutreachControl';

export const App: React.FC = () => {
  const legalPath = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') : '';
  if (legalPath === '/terms' || legalPath === '/privacy') {
    return <LegalPage document={legalPath.slice(1) as 'terms' | 'privacy'} />;
  }
  if (legalPath === '/operator/live') return <LiveOutreachControl />;

  const [state, dispatch] = useReducer(workflowReducer, null, loadSavedWorkflowState);
  const [isReadinessModalOpen, setIsReadinessModalOpen] = useState<boolean>(false);
  const [isEpicLoginOpen, setIsEpicLoginOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.location.pathname === '/epic/login',
  );
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
  const isStandaloneEpicLogin = state.currentPerspective === 'SIGN_IN' && isEpicLoginOpen;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname === '/login' || window.location.pathname === '/epic/login') {
      if (state.currentPerspective !== 'SIGN_IN') dispatch({ type: 'SET_PERSPECTIVE', payload: 'SIGN_IN' });
    }
  }, []);

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
    if (normalizedPerspective === 'SIGN_IN') {
      window.history.pushState({}, '', '/login');
      setIsEpicLoginOpen(false);
    } else if (normalizedPerspective === 'LANDING') {
      window.history.pushState({}, '', '/');
      setIsEpicLoginOpen(false);
    }
    dispatch({ type: 'SET_PERSPECTIVE', payload: normalizedPerspective });
  };

  const handleEpicModeChange = (open: boolean) => {
    setIsEpicLoginOpen(open);
    if (open) {
      window.history.pushState({}, '', '/epic/login?redirect_uri=%2Fauth%2Fepic%2Fcallback&client_id=oncoready');
    } else {
      window.history.pushState({}, '', '/login');
    }
  };

  const handleLogin = (perspective: Perspective) => {
    const routeByPerspective: Partial<Record<Perspective, string>> = {
      PATIENT: '/patient',
      CAREGIVER: '/caregiver',
      CARE_TEAM: '/care-team',
      CARE_NAVIGATOR: '/care-navigator',
      TRANSPORTATION: '/transportation',
    };
    window.history.replaceState({}, '', routeByPerspective[perspective] ?? '/');
    setIsEpicLoginOpen(false);
    dispatch({ type: 'SET_PERSPECTIVE', payload: perspective });
    if (perspective === 'CARE_NAVIGATOR' || perspective === 'CARE_TEAM') {
      dispatch({ type: 'SET_STAFF_ROUTE', payload: 'CASE_WORKSPACE' });
    }
    if (perspective === 'TRANSPORTATION' && !state.tasks.some((task) => task.type === 'TRANSPORTATION_NAVIGATION')) {
      dispatch({ type: 'LOAD_CHECKPOINT', payload: 'SPLIT_WORK' });
    }
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_WORKFLOW' });
    setIsReadinessModalOpen(false);
    setIsPatientResolutionOpen(false);
    setPatientSearch('');
    setPatientStatus('ALL');
  };

  const handleLogout = () => {
    handleReset();
    handleSetPerspective('SIGN_IN');
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

  const handleAcknowledgePlan = () => {
    dispatch({ type: 'ACKNOWLEDGE_PATIENT_PLAN' });
  };

  // The prepared scenario case plus the reviewed Epic Sandbox roster captures,
  // scoped to whichever workspace is signed in. Clinical measurements reach the
  // Care Team only; the Care Navigator directory stays coordination-only.
  const directoryRole: WorkspaceRole =
    state.currentPerspective === 'CARE_NAVIGATOR' ? 'CARE_NAVIGATOR' : 'CARE_TEAM';
  const patientDirectory = filterDirectoryRecords(
    buildDirectoryRecords(state, directoryRole),
    patientSearch,
    patientStatus,
  );

  return (
    <div className={`oncoready-app min-h-screen min-w-0 w-full overflow-x-clip flex flex-col bg-cream text-ink ${reducedMotion ? 'motion-reduce' : ''}`}>
      
      {/* Universal Clinical & Commercial Header */}
      {!isStandaloneEpicLogin && <Header
        currentPerspective={state.currentPerspective}
        onSetPerspective={handleSetPerspective}
        overallReadiness={state.overallReadiness}
        onReset={handleReset}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={() => setUserReducedMotion(!userReducedMotion)}
        state={state}
        onOpenAuthModal={() => handleSetPerspective('SIGN_IN')}
      />}

      {/* Main Workspace Canvas */}
      <main className={`flex-1 w-full mx-auto min-h-0 ${
        state.currentPerspective === 'LANDING'
          ? 'max-w-none px-0 py-0'
          : state.currentPerspective === 'CARE_NAVIGATOR' || state.currentPerspective === 'CARE_TEAM'
          ? 'max-w-none px-0 py-0 flex flex-col pb-24 md:pb-0'
          : isStandaloneEpicLogin
          ? 'max-w-none px-0 py-0'
          : 'max-w-none px-3 sm:px-6 lg:px-10 py-3 sm:py-4 pb-28 md:pb-6'
      }`}>
        
        {/* Perspective: LANDING (Commercial SaaS Showcase) */}
        {state.currentPerspective === 'LANDING' && (
          <LandingPage
            reducedMotion={reducedMotion}
            onOpenAuthModal={() => handleSetPerspective('SIGN_IN')}
          />
        )}

        {/* Perspective: SIGN_IN (Gateway Role Selector) */}
        {state.currentPerspective === 'SIGN_IN' && (
          <PortalAuthScreen
            onLogin={handleLogin}
            onBack={() => handleSetPerspective('LANDING')}
            onEpicModeChange={handleEpicModeChange}
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
              onLogout={handleLogout}
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
                  onRideAction={dispatch}
                  reducedMotion={reducedMotion}
                  onLoadCheckpoint={(checkpoint) => dispatch({ type: 'LOAD_CHECKPOINT', payload: checkpoint })}
                  onSwitchPerspective={(p) => handleSetPerspective(p)}
                />
              )}
              
              {state.staffRoute === 'RESOURCES' && (
                <TransportationWorkspace embedded state={state} reducedMotion={reducedMotion} onRideAction={dispatch} />
              )}
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
            projection={deriveCaregiverProjection(state)}
            onMarkSeen={() => dispatch({ type: 'MARK_CURRENT_LOGISTICS_SEEN' })}
          />
        )}

        {state.currentPerspective === 'TRANSPORTATION' && (
          <TransportationWorkspace
            state={state}
            reducedMotion={reducedMotion}
            onRideAction={dispatch}
          />
        )}

      </main>

      {!isStandaloneEpicLogin && <footer className="app-footer py-6 px-5 sm:px-8 lg:px-12 text-xs text-muted-fg">
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
        </footer>}

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
