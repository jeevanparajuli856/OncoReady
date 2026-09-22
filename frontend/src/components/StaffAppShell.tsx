import React from 'react';
import {
  LayoutDashboard,
  ListTodo,
  Users,
  Car,
  LineChart,
  Link as LinkIcon,
  Settings,
  LogOut,
} from 'lucide-react';
import { WorkflowState, WorkspaceRole } from '../types';

interface StaffAppShellProps {
  state: WorkflowState;
  onSetStaffRoute: (route: string) => void;
  onLogout: () => void;
  workspaceRole: WorkspaceRole;
  children: React.ReactNode;
}

export const StaffAppShell: React.FC<StaffAppShellProps> = ({
  state,
  onSetStaffRoute,
  onLogout,
  workspaceRole,
  children,
}) => {
  const sharedNavItems = [
    { id: 'COMMAND_CENTER', label: 'Command Center', short: 'Command', icon: LayoutDashboard },
    { id: 'EXCEPTIONS', label: 'Exceptions', short: 'Exceptions', icon: ListTodo },
    { id: 'PATIENTS', label: 'Patients', short: 'Patients', icon: Users },
  ];
  const navItems = workspaceRole === 'CARE_NAVIGATOR'
    ? [...sharedNavItems, { id: 'RESOURCES', label: 'CareLink', short: 'CareLink', icon: Car }, { id: 'INTEGRATIONS', label: 'Appointments', short: 'Appts', icon: LinkIcon }]
    : [...sharedNavItems, { id: 'INSIGHTS', label: 'Insights', short: 'Insights', icon: LineChart }, { id: 'INTEGRATIONS', label: 'Epic context', short: 'Epic', icon: LinkIcon }, { id: 'ADMIN', label: 'Admin', short: 'Admin', icon: Settings }];

  const currentRoute = state.staffRoute;
  const pageTitle =
    navItems.find((i) => i.id === currentRoute)?.label ||
    (currentRoute === 'CASE_WORKSPACE' ? 'Case Workspace' : 'Staff');

  return (
    <div className="staff-shell flex flex-col md:flex-row flex-1 w-full max-w-full overflow-x-clip">
      <aside className="staff-sidebar order-1 w-full md:w-56 bg-white/95 border-b md:border-b-0 md:border-r border-line flex flex-row md:flex-col shrink-0 max-w-full md:self-start md:sticky md:top-[4.25rem]">
        <nav className="flex-1 flex flex-wrap md:flex-col px-2 py-2 md:py-4 gap-1">
          <div className="hidden md:block mb-2 px-3 text-[11px] font-heading font-bold text-muted-fg uppercase tracking-wider">
            {workspaceRole === 'CARE_NAVIGATOR' ? 'Care Navigator tools' : 'Readiness Team tools'}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id || (item.id === 'PATIENTS' && currentRoute === 'CASE_WORKSPACE');
            return (
              <button
                key={item.id}
                aria-label={item.label}
                onClick={() => onSetStaffRoute(item.id)}
                className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 min-w-0 flex-1 md:flex-none basis-[4.5rem] md:basis-auto px-1.5 md:px-3 py-2 md:py-2.5 text-[10px] md:text-sm rounded-xl transition-colors ${
                  isActive
                    ? 'bg-accent text-white font-heading font-semibold'
                    : 'text-ink hover:bg-white'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={2.5} />
                <span aria-hidden="true" className="md:hidden font-heading font-bold">{item.short}</span>
                <span aria-hidden="true" className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}

          <div className="hidden md:block mt-4 pt-4 border-t border-line px-1 space-y-1">
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl hover:bg-white"
            >
              <LogOut className="w-4 h-4" strokeWidth={2.5} />
              <span className="font-heading font-bold">Log out</span>
            </button>
          </div>
        </nav>
      </aside>

      <div className="order-1 md:order-2 flex-1 flex flex-col min-w-0">
        <div className="px-3 sm:px-5 lg:px-6 py-3 border-b border-line bg-white/90 flex items-center justify-between gap-3 shrink-0">
          <div>
              <p className="text-[11px] font-heading font-bold uppercase tracking-wider text-muted-fg">{workspaceRole === 'CARE_NAVIGATOR' ? 'Care Navigator Workspace' : 'Care Team (Readiness Team) Workspace'}</p>
            <h1 className="font-display text-lg font-extrabold">{pageTitle}</h1>
          </div>
          <p className="hidden sm:block text-xs text-muted-fg text-right max-w-xs">
            Graph and audit context are embedded in the case workspace for this role.
          </p>
        </div>
        <div className="flex-1">
          <div className="p-3 sm:p-5 lg:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
