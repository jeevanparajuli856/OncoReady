import React, { useState } from 'react';
import { 
  RotateCcw, 
  ChevronDown, 
  Activity, 
  LogOut, 
  EyeOff, 
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Network,
  Home
} from 'lucide-react';
import { Perspective, ReadinessStatus, WorkflowState } from '../types';
import { Avatar } from './Avatar';

interface HeaderProps {
  currentPerspective: Perspective;
  onSetPerspective: (p: Perspective) => void;
  overallReadiness: ReadinessStatus;
  onReset: () => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  state: WorkflowState;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPerspective,
  onSetPerspective,
  overallReadiness,
  onReset,
  reducedMotion,
  onToggleReducedMotion,
  state,
  onOpenAuthModal,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getActiveUser = () => {
    switch (currentPerspective) {
      case 'PATIENT':
        return {
          name: state.patient.name,
          role: 'Patient Workspace',
          avatar: state.patient.avatarUrl,
          roleType: 'PATIENT' as const,
        };
      case 'STAFF':
        return {
          name: 'Sarah Jenkins, RN',
          role: 'Oncology Triage Team',
          avatar: '',
          roleType: 'NURSE' as const,
        };
      case 'CAREGIVER':
        return {
          name: state.caregiver.name,
          role: 'Caregiver Proxy',
          avatar: state.caregiver.avatarUrl,
          roleType: 'CAREGIVER' as const,
        };
      case 'SYSTEM':
        return {
          name: 'Continuity Telemetry',
          role: 'Graph & Audit Engine',
          avatar: '',
          roleType: 'SYSTEM' as const,
        };
      default:
        return null;
    }
  };

  const activeUser = getActiveUser();

  const getStatusPill = () => {
    switch (overallReadiness) {
      case 'PLAN_CONFIRMED':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ready for Tomorrow</span>
          </div>
        );
      case 'AT_RISK':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>2 Blockers Active</span>
          </div>
        );
      case 'IN_PROGRESS':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>Review Acknowledged • Disposition Ready</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Screening Pending</span>
          </div>
        );
    }
  };

  // LANDING PAGE HEADER VIEW
  if (currentPerspective === 'LANDING') {
    return (
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div 
            onClick={() => onSetPerspective('LANDING')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 font-sans">
                  OncoReady
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wide">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Clinical Continuity &amp; Barrier Detection
              </p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <button 
              onClick={() => {
                const el = document.getElementById('pricing-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-slate-900 transition"
            >
              Deployment Models
            </button>
            <button 
              onClick={onOpenAuthModal}
              className="hover:text-slate-900 transition"
            >
              Clinical Workspaces
            </button>
            <button 
              onClick={() => onSetPerspective('SYSTEM')}
              className="hover:text-slate-900 transition"
            >
              Graph Architecture
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleReducedMotion}
              aria-label="Toggle reduced motion"
              title={reducedMotion ? 'Reduced motion active' : 'Smooth animations active'}
              className={`p-2 rounded-xl border text-xs transition ${
                reducedMotion
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {reducedMotion ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenAuthModal}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition shadow-2xs cursor-pointer"
            >
              Log In
            </button>

            <button
              onClick={onOpenAuthModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              Explore Workspace
            </button>
          </div>

        </div>
      </header>
    );
  }

  // PORTAL WORKSPACE HEADER VIEW
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onSetPerspective('LANDING')}
          className="flex items-center gap-3 cursor-pointer group select-none"
          title="Return to Product Home"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 font-sans">
                OncoReady
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wide">
                Benson
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Clinical Continuity Platform
            </p>
          </div>
        </div>

        {/* Center: Live Treatment Status Capsule */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
            <span className="font-bold text-slate-900">{state.patient.name}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">mFOLFOX6 Cycle 4</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">Tomorrow 8:30 AM</span>
          </div>

          {getStatusPill()}
        </div>

        {/* Right: Active Profile & Switcher Menu */}
        <div className="flex items-center gap-2.5">
          
          {/* Reduced Motion Toggle */}
          <button
            onClick={onToggleReducedMotion}
            aria-label="Toggle reduced motion"
            title={reducedMotion ? 'Reduced motion active' : 'Smooth animations active'}
            className={`p-2 rounded-xl border text-xs transition ${
              reducedMotion
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {reducedMotion ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Reset State Button */}
          <button
            onClick={onReset}
            title="Reset Workspace"
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition text-xs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* User Profile Pill / Switcher */}
          {activeUser ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition"
              >
                <Avatar
                  src={activeUser.avatar}
                  alt={activeUser.name}
                  size="sm"
                  roleType={activeUser.roleType}
                />

                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {activeUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {activeUser.role}
                  </div>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-slide-up"
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      SWITCH CLINICAL WORKSPACE
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onSetPerspective('PATIENT');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 flex items-center gap-3 text-left text-xs hover:bg-slate-50 transition ${
                        currentPerspective === 'PATIENT' ? 'bg-indigo-50/70 font-bold text-indigo-900' : 'text-slate-700'
                      }`}
                    >
                      <Avatar src={state.patient.avatarUrl} alt="Maria" size="xs" roleType="PATIENT" />
                      <div>
                        <div>Patient Portal (Maria Hernandez)</div>
                        <div className="text-[10px] text-slate-400 font-normal">Patient Readiness View</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onSetPerspective('STAFF');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 flex items-center gap-3 text-left text-xs hover:bg-slate-50 transition ${
                        currentPerspective === 'STAFF' ? 'bg-sky-50/70 font-bold text-sky-900' : 'text-slate-700'
                      }`}
                    >
                      <Avatar alt="Nurse Sarah" size="xs" roleType="NURSE" />
                      <div>
                        <div>Staff Hub (Sarah Jenkins, RN)</div>
                        <div className="text-[10px] text-slate-400 font-normal">Triage &amp; Exception Workbench</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onSetPerspective('CAREGIVER');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 flex items-center gap-3 text-left text-xs hover:bg-slate-50 transition ${
                        currentPerspective === 'CAREGIVER' ? 'bg-teal-50/70 font-bold text-teal-900' : 'text-slate-700'
                      }`}
                    >
                      <Avatar src={state.caregiver.avatarUrl} alt="Ana" size="xs" roleType="CAREGIVER" />
                      <div>
                        <div>Caregiver Portal (Ana Hernandez)</div>
                        <div className="text-[10px] text-slate-400 font-normal">Transit Status Only</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onSetPerspective('SYSTEM');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 flex items-center gap-3 text-left text-xs hover:bg-slate-50 transition ${
                        currentPerspective === 'SYSTEM' ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center">
                        <Network className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                      <div>
                        <div>Readiness Graph &amp; Audit Log</div>
                        <div className="text-[10px] text-slate-400 font-normal">Engine Architecture</div>
                      </div>
                    </button>
                  </div>

                  <div className="pt-1 mt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        onSetPerspective('LANDING');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2 flex items-center gap-2 text-left text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition"
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>Return to Product Website</span>
                    </button>

                    <button
                      onClick={() => {
                        onSetPerspective('SIGN_IN');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2 flex items-center gap-2 text-left text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out to Gateway</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-xs"
            >
              Sign In
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
