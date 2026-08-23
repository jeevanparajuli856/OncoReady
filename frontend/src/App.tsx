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
import { Network, Building2 } from 'lucide-react';
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
    <div className={`min-h-screen flex flex-col bg-slate-50 text-slate-900 ${reducedMotion ? 'motion-reduce' : ''}`}>
      
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
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
          <div className="absolute inset-0 z-50">
            <StaffAppShell 
              state={state} 
              onSetStaffRoute={(route) => dispatch({ type: 'SET_STAFF_ROUTE', payload: route })}
              onSetPerspective={handleSetPerspective}
              onReset={handleReset}
            >
              {state.staffRoute === 'COMMAND_CENTER' && (
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold mb-4 text-slate-800">Command Center</h2>
                  <p className="text-slate-600 mb-6">Operational morning view prioritizing treatments approaching in 24-48 hours.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
                      <div className="text-indigo-600 text-sm font-medium mb-1">Upcoming Treatments</div>
                      <div className="text-3xl font-bold text-indigo-900">42</div>
                    </div>
                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
                      <div className="text-amber-700 text-sm font-medium mb-1">Exceptions Requiring Attention</div>
                      <div className="text-3xl font-bold text-amber-900">3</div>
                    </div>
                    <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                      <div className="text-emerald-700 text-sm font-medium mb-1">Ready for Review</div>
                      <div className="text-3xl font-bold text-emerald-900">18</div>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-slate-800 mb-4">Urgent Cases</h3>
                  
                  <div 
                    onClick={() => dispatch({ type: 'SET_STAFF_ROUTE', payload: 'CASE_WORKSPACE' })}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <img src={state.patient.avatarUrl} alt={state.patient.name} className="w-12 h-12 rounded-full" />
                      <div>
                        <div className="font-medium text-slate-900">{state.patient.name}</div>
                        <div className="text-sm text-slate-500">{state.appointment.treatmentName} • {state.appointment.scheduledTime}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                        {state.overallReadiness}
                      </div>
                      <button className="text-indigo-600 font-medium text-sm">Review Case &rarr;</button>
                    </div>
                  </div>
                </div>
              )}
              
              {state.staffRoute === 'EXCEPTIONS' && (
                <StaffExceptionQueue
                  state={state}
                  onOpenCase={() => dispatch({ type: 'SET_STAFF_ROUTE', payload: 'CASE_WORKSPACE' })}
                />
              )}
              
              {state.staffRoute === 'PATIENTS' && (
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Patient Directory</h2>
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <input
                      value={patientSearch}
                      onChange={(event) => setPatientSearch(event.target.value)}
                      placeholder="Search name, MRN, or treatment"
                      aria-label="Search patients"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <select
                      value={patientStatus}
                      onChange={(event) => setPatientStatus(event.target.value)}
                      aria-label="Filter patients by status"
                      className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
                    >
                      <option value="ALL">All states</option>
                      <option value="ACTION_REQUIRED">Action required</option>
                      <option value="IN_REVIEW">In review</option>
                      <option value="READY">Ready</option>
                    </select>
                    {(patientSearch || patientStatus !== 'ALL') && (
                      <button onClick={() => { setPatientSearch(''); setPatientStatus('ALL'); }} className="px-3 py-2 text-sm text-indigo-700 border border-indigo-200 rounded-md">
                        Clear filters
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {patientDirectory.map((record) => (
                      <button
                        key={record.mrn}
                        onClick={() => record.interactive && dispatch({ type: 'SET_STAFF_ROUTE', payload: 'CASE_WORKSPACE' })}
                        disabled={!record.interactive}
                        className="w-full flex items-center justify-between gap-4 p-3 rounded-lg border border-slate-200 text-left enabled:hover:bg-slate-50 disabled:cursor-default"
                      >
                        <div><div className="font-medium text-slate-900">{record.name}</div><div className="text-xs text-slate-500">MRN: {record.mrn}</div></div>
                        <div className="text-right"><div className="text-sm text-slate-700">{record.treatment}</div><div className="text-xs text-slate-500">{record.status.replace('_', ' ')}</div></div>
                      </button>
                    ))}
                    {patientDirectory.length === 0 && <div className="p-8 text-center text-sm text-slate-500">No patients match these filters.</div>}
                  </div>
                </div>
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
              
              {state.staffRoute === 'RESOURCES' && (
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Resource Directory</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-slate-200">
                      <h3 className="font-bold text-slate-800">CareLink Transportation</h3>
                      <p className="text-sm text-slate-600 mt-1">Illustrative non-emergency transportation coordination.</p>
                      <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        3 coordination windows
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border border-slate-200">
                      <h3 className="font-bold text-slate-800">Community Mobility Network</h3>
                      <p className="text-sm text-slate-600 mt-1">Illustrative community transportation directory.</p>
                      <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Mapping preview
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {state.staffRoute === 'INSIGHTS' && (
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Operational Insights</h2>
                  <p className="text-sm text-slate-600 mb-5">Illustrative records showing ownership pressure and exception aging.</p>
                  <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    {[['Open exceptions', '18'], ['Owned within 15 min', '14'], ['Awaiting patient confirmation', '4']].map(([label, value]) => (
                      <div key={label} className="p-4 border border-slate-200 rounded-lg"><div className="text-2xl font-bold text-slate-900">{value}</div><div className="text-xs text-slate-600">{label}</div></div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {[['0–30 min', '72%'], ['31–60 min', '19%'], ['Over 60 min', '9%']].map(([label, width]) => (
                      <div key={label}><div className="flex justify-between text-xs text-slate-600 mb-1"><span>{label}</span><span>{width}</span></div><div className="h-2 bg-slate-100 rounded"><div className="h-2 bg-indigo-500 rounded" style={{ width }} /></div></div>
                    ))}
                  </div>
                </div>
              )}
              
              {state.staffRoute === 'INTEGRATIONS' && (
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Proposed Data Flow Mapping</h2>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <h3 className="font-semibold text-slate-800 text-sm">FHIR Schedule Mapping</h3>
                      <pre className="mt-2 text-xs bg-white p-3 rounded border border-slate-200 text-slate-600 overflow-x-auto">
{`{
  "resourceType": "Appointment",
  "status": "booked",
  "serviceType": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/service-type",
          "code": "108",
          "display": "Oncology"
        }
      ]
    }
  ]
}`}
                      </pre>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {['Patient + Appointment', 'Task + Owner', 'Communication + Audit'].map((mapping) => <div key={mapping} className="p-3 border border-slate-200 rounded-lg"><div className="text-sm font-medium">{mapping}</div><div className="text-xs text-slate-500 mt-1">Mapping preview • Not connected</div></div>)}
                    </div>
                  </div>
                </div>
              )}
              
              {state.staffRoute === 'ADMIN' && (
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Local Configuration</h2>
                  <p className="text-sm text-slate-600 mb-4">Configuration locked in training environment.</p>
                  <div className="space-y-3 opacity-70">
                    <div className="p-3 border border-slate-200 rounded-lg">
                      <div className="font-medium">Clinical Triage Routing</div>
                      <div className="text-sm text-slate-500">Route GI symptoms to: Sarah Jenkins, RN</div>
                    </div>
                    <div className="p-3 border border-slate-200 rounded-lg"><div className="font-medium">Caregiver permissions</div><div className="text-sm text-slate-500">Transportation-only projection</div></div>
                    <div className="p-3 border border-slate-200 rounded-lg"><div className="font-medium">Escalation window</div><div className="text-sm text-slate-500">30 minutes before ownership review</div></div>
                    <div className="p-3 border border-slate-200 rounded-lg"><div className="font-medium">Communication channels</div><div className="text-sm text-slate-500">Patient portal and staff workspace</div></div>
                    <div className="p-3 border border-slate-200 rounded-lg">
                      <div className="font-medium">Navigator Assignment</div>
                      <div className="text-sm text-slate-500">Route SDOH/Transport to: Marcus Vance, MSW</div>
                    </div>
                  </div>
                </div>
              )}
              
            </StaffAppShell>
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
      <footer className="bg-white border-t border-slate-200 py-6 px-4 shadow-2xs text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-bold text-slate-800">OncoReady Enterprise</span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span>Benson Cancer Center</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <span>Enterprise privacy controls</span>
            <span>•</span>
            <span>HL7 FHIR R4 &amp; USCDI v3 Aligned</span>
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
    </div>
  );
};
