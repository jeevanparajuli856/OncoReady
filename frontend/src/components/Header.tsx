import React, { useState } from 'react';
import {
  RotateCcw,
  ChevronDown,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Home,
  Menu,
  X,
  ArrowRight,
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

const scrollTo = (id: string, reducedMotion = false) => {
  document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
};

export const Header: React.FC<HeaderProps> = ({
  currentPerspective,
  onSetPerspective,
  overallReadiness,
  onReset,
  reducedMotion,
  state,
  onOpenAuthModal,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLandingMenuOpen, setIsLandingMenuOpen] = useState(false);

  const getActiveUser = () => {
    switch (currentPerspective) {
      case 'PATIENT':
        return { name: state.patient.name, role: 'Patient Workspace', avatar: state.patient.avatarUrl, roleType: 'PATIENT' as const };
      case 'CARE_NAVIGATOR':
        return { name: 'Marcus Vance, MSW', role: 'Care Navigator', avatar: '', roleType: 'NAVIGATOR' as const };
      case 'CARE_TEAM':
      case 'STAFF':
        return { name: 'Sarah Jenkins, RN', role: 'Oncology Triage Team', avatar: '', roleType: 'NURSE' as const };
      case 'CAREGIVER':
        return { name: state.caregiver.name, role: 'Caregiver Proxy', avatar: state.caregiver.avatarUrl, roleType: 'CAREGIVER' as const };
      default:
        return null;
    }
  };

  const activeUser = getActiveUser();

  const getStatusPill = () => {
    switch (overallReadiness) {
      case 'PLAN_CONFIRMED':
        return (
          <div className="chip chip-mint">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Continuity plan confirmed</span>
          </div>
        );
      case 'AT_RISK':
        return (
          <div className="chip chip-sun">
            <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
            <span>2 Blockers Active</span>
          </div>
        );
      case 'IN_PROGRESS':
        return (
          <div className="chip chip-accent">
            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Review Acknowledged</span>
          </div>
        );
      default:
        return (
          <div className="chip">
            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Screening Pending</span>
          </div>
        );
    }
  };

  if (currentPerspective === 'LANDING') {
    const landingLinks = [
      ['workspaces', 'Workspaces'],
      ['how-it-works', 'How it works'],
      ['access-map', 'Louisiana access'],
      ['pricing-section', 'Business model'],
      ['faq-section', 'FAQ'],
    ] as const;

    return (
      <header className="landing-header sticky top-0 z-40 w-full">
        <div className="landing-header__inner">
          <button onClick={() => onSetPerspective('LANDING')} className="cursor-pointer shrink-0" aria-label="Go to OncoReady home" title="Home">
            <span className="hidden sm:block"><Logo size={38} /></span>
            <span className="sm:hidden"><Logo size={42} showWordmark={false} /></span>
          </button>

          <nav className="landing-header__nav" aria-label="Landing page navigation">
            {landingLinks.map(([id, label]) => (
              <button key={id} type="button" onClick={() => scrollTo(id, reducedMotion)}>{label}</button>
            ))}
          </nav>

          <div className="landing-header__actions">
            <button type="button" onClick={onOpenAuthModal} className="landing-header__cta">
              Access workspace
            </button>
            <button
              type="button"
              className="landing-header__menu"
              aria-label={isLandingMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isLandingMenuOpen}
              onClick={() => setIsLandingMenuOpen((open) => !open)}
            >
              {isLandingMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isLandingMenuOpen && (
          <nav className="landing-header__mobile-nav" aria-label="Mobile landing page navigation">
            {landingLinks.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  scrollTo(id, reducedMotion);
                  setIsLandingMenuOpen(false);
                }}
              >
                {label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ))}
          </nav>
        )}
      </header>
    );
  }

  return (
    <header className="workspace-header sticky top-0 z-40 w-full bg-white/95 border-b border-line">
      <div className="w-full px-3 sm:px-8 lg:px-12 h-[4.25rem] flex items-center justify-between gap-2">
        <button onClick={() => onSetPerspective('LANDING')} aria-label="Go to OncoReady home" title="Home" className="shrink-0">
          <Logo size={30} compact />
        </button>

        <nav className="hidden md:flex items-center gap-1 text-sm font-heading font-medium">
          {([
            ['CARE_NAVIGATOR', 'Care Navigator'],
            ['CARE_TEAM', 'Care Team'],
            ['CAREGIVER', 'Caregiver'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => onSetPerspective(id)}
              className={`px-2 sm:px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                currentPerspective === id ? 'bg-accent text-white' : 'hover:bg-white/80'
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
          <button onClick={onReset} title="Reset Workspace" className="p-2 rounded-xl border border-line bg-white/70 hover:bg-white">
            <RotateCcw className="w-4 h-4" />
          </button>

          {activeUser ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 pl-1 pr-1.5 sm:pr-3 py-1 rounded-xl border border-line bg-white/80 hover:bg-white"
              >
                <Avatar src={activeUser.avatar} alt={activeUser.name} size="sm" roleType={activeUser.roleType} />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-heading font-semibold leading-tight">{activeUser.name}</div>
                  <div className="text-[10px] text-muted-fg">{activeUser.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-line shadow-glass-lg py-2 z-50 animate-fade-in" onMouseLeave={() => setIsDropdownOpen(false)}>
                  <div className="px-3.5 py-2 border-b border-line">
                    <div className="text-[11px] font-heading font-semibold uppercase tracking-wider text-muted-fg">
                      SWITCH CLINICAL WORKSPACE
                    </div>
                  </div>
                  <div className="py-1">
                    <button onClick={() => { onSetPerspective('PATIENT'); setIsDropdownOpen(false); }} className={`w-full px-3.5 py-2 flex items-center gap-3 text-left text-xs hover:bg-muted ${currentPerspective === 'PATIENT' ? 'bg-accent/8 font-semibold' : ''}`}>
                      <Avatar src={state.patient.avatarUrl} alt="Camila" size="xs" roleType="PATIENT" />
                      <div>
                        <div>Patient Portal (Camila Lopez)</div>
                        <div className="text-[10px] text-muted-fg font-normal">Patient Readiness View</div>
                      </div>
                    </button>
                    <button onClick={() => { onSetPerspective('CARE_NAVIGATOR'); setIsDropdownOpen(false); }} className={`w-full px-3.5 py-2 flex items-center gap-3 text-left text-xs hover:bg-mint/8 ${currentPerspective === 'CARE_NAVIGATOR' ? 'bg-mint/10 font-semibold' : ''}`}>
                      <Avatar alt="Marcus Vance" size="xs" roleType="NAVIGATOR" />
                      <div>
                        <div>Care Navigator (Marcus Vance, MSW)</div>
                        <div className="text-[10px] text-muted-fg font-normal">CareLink & Patient Coordination</div>
                      </div>
                    </button>
                    <button onClick={() => { onSetPerspective('CARE_TEAM'); setIsDropdownOpen(false); }} className={`w-full px-3.5 py-2 flex items-center gap-3 text-left text-xs hover:bg-muted ${currentPerspective === 'CARE_TEAM' ? 'bg-accent/8 font-semibold' : ''}`}>
                      <Avatar alt="Nurse Sarah" size="xs" roleType="NURSE" />
                      <div>
                        <div>Care Team (Readiness Team)</div>
                        <div className="text-[10px] text-muted-fg font-normal">Clinical & Treatment Readiness</div>
                      </div>
                    </button>
                    <button onClick={() => { onSetPerspective('CAREGIVER'); setIsDropdownOpen(false); }} className={`w-full px-3.5 py-2 flex items-center gap-3 text-left text-xs hover:bg-mint/8 ${currentPerspective === 'CAREGIVER' ? 'bg-mint/10 font-semibold' : ''}`}>
                      <Avatar src={state.caregiver.avatarUrl} alt="Ana" size="xs" roleType="CAREGIVER" />
                      <div>
                        <div>Caregiver Portal (Ana Hernandez)</div>
                        <div className="text-[10px] text-muted-fg font-normal">Transit Status Only</div>
                      </div>
                    </button>
                  </div>
                  <div className="pt-1 mt-1 border-t border-line">
                    <button onClick={() => { onSetPerspective('LANDING'); setIsDropdownOpen(false); }} className="w-full px-3.5 py-2 flex items-center gap-2 text-left text-xs font-heading font-semibold text-accent hover:bg-accent/8">
                      <Home className="w-3.5 h-3.5" />
                      <span>Return to Product Website</span>
                    </button>
                    <button onClick={() => { onOpenAuthModal(); setIsDropdownOpen(false); }} className="w-full px-3.5 py-2 flex items-center gap-2 text-left text-xs font-heading font-semibold text-pop hover:bg-pop/8">
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Open Prepared Workspace Gateway</span>
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
