import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  ArrowRight, 
  Network, 
  Clock, 
  Stethoscope,
  Sparkles,
  Calendar,
  Building2
} from 'lucide-react';
import { WorkflowState, Perspective } from '../types';

interface PortalAuthScreenProps {
  state: WorkflowState;
  onSelectPerspective: (p: Perspective) => void;
  onReset: () => void;
}

export const PortalAuthScreen: React.FC<PortalAuthScreenProps> = ({
  state,
  onSelectPerspective,
  onReset,
}) => {
  const pendingBlockers = state.tasks.filter((t) => t.status !== 'RESOLVED').length;

  return (
    <div className="min-h-[85vh] flex flex-col justify-between max-w-6xl mx-auto px-4 py-6 sm:py-10 space-y-10 animate-fade-in">
      
      {/* Top Hero / Gateway Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold shadow-2xs">
          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Benson Cancer Center • Clinical Continuity System</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            OncoReady Gateway
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Select a workspace to coordinate pre-infusion barriers, owned clinical review, navigation tasks, and patient plan confirmation.
          </p>
        </div>

        {/* Current Cycle Proximity Capsule */}
        <div className="inline-flex flex-wrap items-center justify-center gap-3 p-2 px-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 shadow-2xs font-medium">
          <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>Target Patient: Maria Hernandez (54F)</span>
          </div>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-600" />
            <span>mFOLFOX6 Cycle 4 • Tomorrow 8:30 AM</span>
          </div>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className={`w-2 h-2 rounded-full ${
              state.overallReadiness === 'PLAN_CONFIRMED' 
                ? 'bg-emerald-500 ring-2 ring-emerald-200' 
                : state.overallReadiness === 'AT_RISK' 
                ? 'bg-amber-500 ring-2 ring-amber-200 animate-pulse' 
                : 'bg-indigo-500'
            }`} />
            <span className="font-bold uppercase tracking-wider">{state.overallReadiness.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* 4 Rich Portal Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Patient Portal (Maria Hernandez) */}
        <div 
          onClick={() => onSelectPerspective('PATIENT')}
          onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && onSelectPerspective('PATIENT')}
          role="button"
          tabIndex={0}
          className="group relative bg-white rounded-2xl border-2 border-slate-200 hover:border-indigo-500 p-6 sm:p-7 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/60 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <img
                  src={state.patient.avatarUrl}
                  alt={state.patient.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm group-hover:ring-2 group-hover:ring-indigo-500 transition"
                />
                <div>
                  <span className="text-[11px] font-bold text-indigo-700 tracking-wider uppercase bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    Patient Portal
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    {state.patient.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    MRN: {state.patient.mrn} • Age {state.patient.age}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  state.overallReadiness === 'PLAN_CONFIRMED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : state.readinessCheckCompleted
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}>
                  <Clock className="w-3 h-3" />
                  {state.overallReadiness === 'PLAN_CONFIRMED' 
                    ? 'Plan Confirmed' 
                    : state.readinessCheckCompleted 
                    ? 'Triage Active' 
                    : 'Screening Pending'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Complete the 2-minute pre-infusion barrier screening, report symptoms to Nurse Sarah, and review your confirmed transit & lab schedule.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              Patient Treatment Readiness
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:text-indigo-700 group-hover:translate-x-1 transition-transform">
              <span>Enter Patient View</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Card 2: Staff Exception Workspace */}
        <div 
          onClick={() => onSelectPerspective('STAFF')}
          onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && onSelectPerspective('STAFF')}
          role="button"
          tabIndex={0}
          className="group relative bg-white rounded-2xl border-2 border-slate-200 hover:border-sky-500 p-6 sm:p-7 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50/60 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex -space-x-3">
                  <img
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Crect width='128' height='128' rx='24' fill='%230284c7'/%3E%3C/svg%3E"
                    alt="Sarah Jenkins RN"
                    className="w-13 h-13 rounded-2xl object-cover border-2 border-white shadow-sm ring-1 ring-sky-200"
                    title="Sarah Jenkins, BSN, RN, OCN"
                  />
                  <img
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Crect width='128' height='128' rx='24' fill='%230d9488'/%3E%3C/svg%3E"
                    alt="Marcus Vance MSW"
                    className="w-13 h-13 rounded-2xl object-cover border-2 border-white shadow-sm ring-1 ring-teal-200"
                    title="Marcus Vance, MSW, LCSW"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-sky-700 tracking-wider uppercase bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                    Clinical Care Team
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    Oncology Triage & Hub
                  </h2>
                  <p className="text-xs text-slate-500">
                    Sarah Jenkins, RN & Marcus Vance, MSW
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                  <Stethoscope className="w-3 h-3 text-sky-600" />
                  {pendingBlockers > 0 ? `${pendingBlockers} Blockers Active` : 'Queue Cleared'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Exception operations with two owned actions: human clinical review and transportation coordination.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              EHR Clinical Workspace
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 group-hover:text-sky-700 group-hover:translate-x-1 transition-transform">
              <span>Open Staff Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Card 3: Caregiver Portal (Ana Hernandez) */}
        <div 
          onClick={() => onSelectPerspective('CAREGIVER')}
          onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && onSelectPerspective('CAREGIVER')}
          role="button"
          tabIndex={0}
          className="group relative bg-white rounded-2xl border-2 border-slate-200 hover:border-teal-500 p-6 sm:p-7 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50/60 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <img
                  src={state.caregiver.avatarUrl}
                  alt={state.caregiver.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-100 shadow-sm group-hover:ring-2 group-hover:ring-teal-500 transition"
                />
                <div>
                  <span className="text-[11px] font-bold text-teal-700 tracking-wider uppercase bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                    Authorized Caregiver
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    {state.caregiver.name}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {state.caregiver.relationship}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  <ShieldCheck className="w-3 h-3" />
                  Privacy Guard Active
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Caregiver view with strict data-minimization: Ana can track vehicle arrival and appointment times, while Maria's clinical symptom text is completely excluded.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              Family & Transit Logistics
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 group-hover:text-teal-700 group-hover:translate-x-1 transition-transform">
              <span>Enter Caregiver View</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Card 4: System Continuity & Dependency Graph */}
        <div 
          onClick={() => onSelectPerspective('SYSTEM')}
          onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && onSelectPerspective('SYSTEM')}
          role="button"
          tabIndex={0}
          className="group relative bg-white rounded-2xl border-2 border-slate-200 hover:border-slate-800 p-6 sm:p-7 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-6 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100/60 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center border-2 border-slate-700 shadow-md group-hover:ring-2 group-hover:ring-slate-900 transition">
                  <Network className="w-7 h-7 text-indigo-400" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-700 tracking-wider uppercase bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    Continuity Engine
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    Readiness Graph & Audit
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    Deterministic Directed Graph
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Activity className="w-3 h-3" />
                  Current Graph
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Explore the dependency graph connecting patient reports and transportation to plan confirmation alongside the causal audit log.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              System Telemetry & Architecture
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:translate-x-1 transition-transform">
              <span>Inspect Readiness Graph</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>

      </div>

      {/* Bottom Bar: Reset & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Benson Cancer Center • Training environment</span>
        </div>

        <button
          onClick={onReset}
          className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-semibold transition text-xs shadow-2xs"
        >
          Reset Application to Initial State
        </button>
      </div>

    </div>
  );
};
