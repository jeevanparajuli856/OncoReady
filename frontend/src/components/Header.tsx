import React, { useState } from 'react';
import {
  RotateCcw,
  ChevronDown,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Network,
  Home,
} from 'lucide-react';
import { Perspective, ReadinessStatus, WorkflowState } from '../types';
import { Avatar } from './Avatar';
import { Logo } from './Logo';

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

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
};

export const Header: React.FC<HeaderProps> = ({
  currentPerspective,
  onSetPerspective,
  overallReadiness,
  onReset,
  state,
  onOpenAuthModal,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getActiveUser = () => {
    switch (currentPerspective) {
      case 'PATIENT':
        return { name: state.patient.name, role: 'Patient Workspace', avatar: state.patient.avatarUrl, roleType: 'PATIENT' as const };
      case 'STAFF':
        return { name: 'Sarah Jenkins, RN', role: 'Oncology Triage Team', avatar: '', roleType: 'NURSE' as const };
      case 'CAREGIVER':
        return { name: state.caregiver.name, role: 'Caregiver Proxy', avatar: state.caregiver.avatarUrl, roleType: 'CAREGIVER' as const };
      case 'SYSTEM':
        return { name: 'Continuity Telemetry', role: 'Graph & Audit Engine', avatar: '', roleType: 'SYSTEM' as const };
      default:
        return null;
    }
  };

  const activeUser = getActiveUser();

  const getStatusPill = () => {
    switch (overallReadiness) {
      case 'PLAN_CONFIRMED':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-bold bg-mint/30 text-ink border-2 border-ink">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Ready for Tomorrow</span>
          </div>
        );
      case 'AT_RISK':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-bold bg-sun/50 text-ink border-2 border-ink">
            <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>2 Blockers Active</span>
          </div>
        );
      case 'IN_PROGRESS':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-bold bg-accent/15 text-ink border-2 border-ink">
            <Clock className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Review Acknowledged</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-bold bg-white text-ink border-2 border-ink">
            <Clock className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Screening Pending</span>
          </div>
        );
    }
  };

  if (currentPerspective === 'LANDING') {
    return (
      <header className="sticky top-0 z-40 w-full bg-cream/95 backdrop-blur-md border-b-2 border-ink">
        <div className="w-full px-3 sm:px-8 lg:px-12 h-[4.25rem] flex items-center justify-between gap-2">
          <button onClick={() => onSetPerspective('LANDING')} className="cursor-pointer shrink-0" aria-label="Go to OncoReady home" title="Home">
            <Logo size={32} compact className="[&>div:last-child]:hidden sm:[&>div:last-child]:block" />
          </button>

          <nav className="hidden lg:flex items-center gap-1 lg:gap-2 text-sm font-heading font-bold text-ink">
            <button onClick={() => scrollTo('how-it-works')} className="px-2.5 py-1.5 rounded-full hover:bg-sun/40">How it works</button>
            <button onClick={() => scrollTo('access-map')} className="px-2.5 py-1.5 rounded-full hover:bg-sun/40">Access map</button>
            <button onClick={() => scrollTo('pricing-section')} className="px-2.5 py-1.5 rounded-full hover:bg-sun/40">Pricing</button>
            <button onClick={() => onSetPerspective('PATIENT')} className="px-2.5 py-1.5 rounded-full hover:bg-sun/40">Patient</button>
            <button onClick={() => onSetPerspective('STAFF')} className="px-2.5 py-1.5 rounded-full hover:bg-sun/40">Staff</button>
            <button onClick={() => onSetPerspective('CAREGIVER')} className="px-2.5 py-1.5 rounded-full hover:bg-sun/40">Caregiver</button>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onOpenAuthModal} className="btn-ghost btn-compact hidden sm:inline-flex">
              Log In
            </button>
            <button onClick={onOpenAuthModal} className="btn-candy btn-compact">
              <span className="sm:hidden">Enter</span>
              <span className="hidden sm:inline">Explore Workspace</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-cream/95 backdrop-blur-md border-b-2 border-ink">
      <div className="w-full px-3 sm:px-8 lg:px-12 h-[4.25rem] flex items-center justify-between gap-2">
        <button onClick={() => onSetPerspective('LANDING')} aria-label="Go to OncoReady home" title="Home" className="shrink-0">
          <Logo size={32} compact className="[&>div:last-child]:hidden sm:[&>div:last-child]:block" />
        </button>

        <nav className="hidden md:flex items-center gap-1 text-sm font-heading font-bold">
          {([
            ['PATIENT', 'Patient'],
            ['STAFF', 'Staff'],
            ['CAREGIVER', 'Caregiver'],
            ['SYSTEM', 'Graph'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => onSetPerspective(id)}
              className={`px-2 sm:px-3 py-1.5 rounded-full border-2 whitespace-nowrap ${
                currentPerspective === id ? 'bg-accent text-white border-ink' : 'border-transparent hover:bg-sun/40'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          {getStatusPill()}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onReset} title="Reset Workspace" className="p-2 rounded-full border-2 border-ink bg-white hover:bg-sun">
            <RotateCcw className="w-4 h-4" />
          </button>

          {activeUser ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 pl-1 pr-1.5 sm:pr-3 py-1 rounded-full border-2 border-ink bg-white hover:bg-sun/40"
              >
                <Avatar src={activeUser.avatar} alt={activeUser.name} size="sm" roleType={activeUser.roleType} />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-heading font-bold leading-tight">{activeUser.name}</div>
                  <div className="text-[10px] text-muted-fg">{activeUser.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border-2 border-ink shadow-pop py-2 z-50 animate-pop" onMouseLeave={() => setIsDropdownOpen(false)}>
                  <div className="px-3.5 py-2 border-b-2 border-ink/10">
                    <div className="text-[11px] font-heading font-bold uppercase tracking-wider text-muted-fg">
                      SWITCH CLINICAL WORKSPACE
                    </div>
                  </div>
                  <div className="py-1">
                    <button onClick={() => { onSetPerspective('PATIENT'); setIsDropdownOpen(false); }} className={`w-full px-3.5 py-2 flex items-center gap-3 text-left text-xs hover:bg-sun/30 ${currentPerspective === 'PATIENT' ? 'bg-accent/10 font-bold' : ''}`}>
                      <Avatar src={state.patient.avatarUrl} alt="Maria" size="xs" roleType="PATIENT" />
                      <div>
                        <div>Patient Portal (Maria Hernandez)</div>
                        <div className="text-[10px] text-muted-fg font-normal">Patient Readiness View</div>
                      </div>
                    </button>
                    <button onClick={() => { onSetPerspective('STAFF'); setIsDropdownOpen(false); }} className={`w-full px-3.5 py-2 flex items-center gap-3 text-left text-xs hover:bg-sun/30 ${currentPerspective === 'STAFF' ? 'bg-accent/10 font-bold' : ''}`}>
                      <Avatar alt="Nurse Sarah" size="xs" roleType="NURSE" />
                      <div>
                        <div>Staff Hub (Sarah Jenkins, RN)</div>
                        <div className="text-[10px] text-muted-fg font-normal">Triage & Exception Workbench</div>
                      </div>
                    </button>
                    <button onClick={() => { onSetPerspective('CAREGIVER'); setIsDropdownOpen(false); }} className={`w-full px-3.5 py-2 flex items-center gap-3 text-left text-xs hover:bg-mint/20 ${currentPerspective === 'CAREGIVER' ? 'bg-mint/20 font-bold' : ''}`}>
                      <Avatar src={state.caregiver.avatarUrl} alt="Ana" size="xs" roleType="CAREGIVER" />
                      <div>
                        <div>Caregiver Portal (Ana Hernandez)</div>
                        <div className="text-[10px] text-muted-fg font-normal">Transit Status Only</div>
                      </div>
                    </button>
                    <button onClick={() => { onSetPerspective('SYSTEM'); setIsDropdownOpen(false); }} className={`w-full px-3.5 py-2 flex items-center gap-3 text-left text-xs hover:bg-muted ${currentPerspective === 'SYSTEM' ? 'bg-muted font-bold' : ''}`}>
                      <div className="w-6 h-6 rounded-md bg-ink text-white flex items-center justify-center">
                        <Network className="w-3.5 h-3.5 text-sun" />
                      </div>
                      <div>
                        <div>Readiness Graph & Audit Log</div>
                        <div className="text-[10px] text-muted-fg font-normal">Engine Architecture</div>
                      </div>
                    </button>
                  </div>
                  <div className="pt-1 mt-1 border-t-2 border-ink/10">
                    <button onClick={() => { onSetPerspective('LANDING'); setIsDropdownOpen(false); }} className="w-full px-3.5 py-2 flex items-center gap-2 text-left text-xs font-heading font-bold text-accent hover:bg-accent/10">
                      <Home className="w-3.5 h-3.5" />
                      <span>Return to Product Website</span>
                    </button>
                    <button onClick={() => { onSetPerspective('SIGN_IN'); setIsDropdownOpen(false); }} className="w-full px-3.5 py-2 flex items-center gap-2 text-left text-xs font-heading font-bold text-pop hover:bg-pop/10">
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out to Gateway</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onOpenAuthModal} className="btn-candy btn-compact">
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
