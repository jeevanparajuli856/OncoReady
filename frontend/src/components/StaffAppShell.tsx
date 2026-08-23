import React from 'react';
import {
  LayoutDashboard,
  ListTodo,
  Users,
  Car,
  LineChart,
  Link as LinkIcon,
  Settings,
  Home,
  Heart,
  Network,
  HeartHandshake,
} from 'lucide-react';
import { WorkflowState, Perspective } from '../types';

interface StaffAppShellProps {
  state: WorkflowState;
  onSetStaffRoute: (route: string) => void;
  onSetPerspective: (p: Perspective) => void;
  onReset: () => void;
  children: React.ReactNode;
}

export const StaffAppShell: React.FC<StaffAppShellProps> = ({
  state,
  onSetStaffRoute,
  onSetPerspective,
  children,
}) => {
  const navItems = [
    { id: 'COMMAND_CENTER', label: 'Command Center', short: 'Command', icon: LayoutDashboard },
    { id: 'EXCEPTIONS', label: 'Exceptions', short: 'Exceptions', icon: ListTodo },
    { id: 'PATIENTS', label: 'Patients', short: 'Patients', icon: Users },
    { id: 'RESOURCES', label: 'Resources', short: 'Rides', icon: Car },
    { id: 'INSIGHTS', label: 'Insights', short: 'Insights', icon: LineChart },
    { id: 'INTEGRATIONS', label: 'Integrations', short: 'Maps', icon: LinkIcon },
    { id: 'ADMIN', label: 'Admin', short: 'Admin', icon: Settings },
  ];

  const siteLinks: Array<{ id: Perspective; label: string; icon: typeof Home }> = [
    { id: 'LANDING', label: 'Home', icon: Home },
    { id: 'PATIENT', label: 'Patient', icon: Heart },
    { id: 'CAREGIVER', label: 'Caregiver', icon: HeartHandshake },
    { id: 'SYSTEM', label: 'Graph', icon: Network },
  ];

  const currentRoute = state.staffRoute;
  const pageTitle =
    navItems.find((i) => i.id === currentRoute)?.label ||
    (currentRoute === 'CASE_WORKSPACE' ? 'Case Workspace' : 'Staff');

  return (
    <div className="flex flex-col md:flex-row flex-1 min-h-0 w-full min-h-[calc(100dvh-10rem)]">
      <aside className="order-1 md:order-1 w-full md:w-56 bg-white border-b-2 md:border-b-0 md:border-r-2 border-ink flex flex-row md:flex-col shrink-0">
        <nav className="flex-1 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto px-2 py-2 md:py-4 gap-1">
          <div className="hidden md:block mb-2 px-3 text-[11px] font-heading font-bold text-muted-fg uppercase tracking-wider">
            Staff tools
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id || (item.id === 'PATIENTS' && currentRoute === 'CASE_WORKSPACE');
            return (
              <button
                key={item.id}
                aria-label={item.label}
                onClick={() => onSetStaffRoute(item.id)}
                className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 min-w-[4.25rem] md:min-w-0 px-2 md:px-3 py-2 md:py-2.5 text-[10px] md:text-sm rounded-xl md:rounded-full border-2 transition-colors ${
                  isActive
                    ? 'bg-accent text-white border-ink font-heading font-bold'
                    : 'text-ink border-transparent hover:bg-sun/40 hover:border-ink'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={2.5} />
                <span aria-hidden="true" className="md:hidden font-heading font-bold">{item.short}</span>
                <span aria-hidden="true" className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}

          <div className="hidden md:block mt-4 pt-4 border-t-2 border-ink/10 px-1 space-y-1">
            <div className="px-3 mb-2 text-[11px] font-heading font-bold text-muted-fg uppercase tracking-wider">
              Leave staff
            </div>
            {siteLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => onSetPerspective(link.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-full border-2 border-transparent hover:border-ink hover:bg-sun/40"
                >
                  <Icon className="w-4 h-4" strokeWidth={2.5} />
                  <span className="font-heading font-bold">{link.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      <div className="order-1 md:order-2 flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="px-3 sm:px-5 lg:px-6 py-3 border-b-2 border-ink/10 bg-cream/80 flex items-center justify-between gap-3 shrink-0">
          <div>
            <p className="text-[11px] font-heading font-bold uppercase tracking-wider text-muted-fg">Staff workspace</p>
            <h1 className="font-display text-lg font-extrabold">{pageTitle}</h1>
          </div>
          <p className="hidden sm:block text-xs text-muted-fg text-right max-w-xs">
            Use the bottom dock to move between Home, Patient, Caregiver, and Graph.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-5 lg:p-6 min-h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
