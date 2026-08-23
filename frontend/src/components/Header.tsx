import React from 'react';
import { 
  RotateCcw, 
  User, 
  Users, 
  HeartHandshake, 
  Network, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  EyeOff
} from 'lucide-react';
import { Perspective, ReadinessStatus } from '../types';

interface HeaderProps {
  currentPerspective: Perspective;
  onSetPerspective: (p: Perspective) => void;
  overallReadiness: ReadinessStatus;
  onReset: () => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  taskCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPerspective,
  onSetPerspective,
  overallReadiness,
  onReset,
  reducedMotion,
  onToggleReducedMotion,
  taskCount,
}) => {
  const getReadinessBadge = () => {
    switch (overallReadiness) {
      case 'PLAN_CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Treatment Plan Confirmed
          </span>
        );
      case 'AT_RISK':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse-subtle">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            2 Active Blockers Detected
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            Staff Action Recorded • Awaiting Patient Confirmation
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Readiness Screening Pending
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Synthetic Demonstration Disclosure Banner */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-semibold text-white">Demonstration Environment</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300">Synthetic patient fixtures & simulated clinical/transport workflows. No real PHI or live EHR connection.</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleReducedMotion}
            className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded px-1.5 py-0.5"
            title="Toggle reduced motion simulation"
          >
            {reducedMotion ? '⚡ Motion: Reduced (Accessible)' : '✨ Motion: Smooth Spring'}
          </button>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 text-xs font-mono">CORE-001 Golden Path</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Signature Status */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-sky-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">OncoReady</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Continuity Loop
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Ochsner Benson Cancer Center • Treatment Readiness System
              </p>
            </div>
          </div>
          <div className="md:hidden">
            {getReadinessBadge()}
          </div>
        </div>

        {/* Perspective Switcher */}
        <nav aria-label="Perspective Switcher" className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
          <button
            onClick={() => onSetPerspective('PATIENT')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              currentPerspective === 'PATIENT'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <User className="w-3.5 h-3.5 text-indigo-600" />
            <span>Patient (Maria)</span>
          </button>

          <button
            onClick={() => onSetPerspective('STAFF')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              currentPerspective === 'STAFF'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-sky-600" />
            <span>Staff Exception Queue</span>
            {taskCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                {taskCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSetPerspective('CAREGIVER')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              currentPerspective === 'CAREGIVER'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-teal-600" />
            <span>Caregiver (Ana)</span>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-slate-200 text-slate-700">
              <EyeOff className="w-2.5 h-2.5 mr-0.5" />
              Private
            </span>
          </button>

          <button
            onClick={() => onSetPerspective('SYSTEM')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              currentPerspective === 'SYSTEM'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-indigo-500" />
            <span>Readiness Graph & Audit</span>
          </button>
        </nav>

        {/* Right Tools & Reset */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="hidden md:block">
            {getReadinessBadge()}
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 transition focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-2xs"
            title="Reset journey back to opening deterministic state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Journey</span>
          </button>
        </div>
      </div>
    </header>
  );
};
