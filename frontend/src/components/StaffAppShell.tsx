import React from 'react';
import { 
  LayoutDashboard, 
  ListTodo, 
  Users, 
  Car, 
  LineChart, 
  Link as LinkIcon, 
  Settings,
  Shield,
  
  LogOut
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
  onReset,
  children 
}) => {
  const navItems = [
    { id: 'COMMAND_CENTER', label: 'Command Center', icon: LayoutDashboard },
    { id: 'EXCEPTIONS', label: 'Exceptions', icon: ListTodo },
    { id: 'PATIENTS', label: 'Patients', icon: Users },
    { id: 'RESOURCES', label: 'Resources', icon: Car },
    { id: 'INSIGHTS', label: 'Insights', icon: LineChart },
    { id: 'INTEGRATIONS', label: 'Integrations', icon: LinkIcon },
    { id: 'ADMIN', label: 'Admin', icon: Settings },
  ];

  const currentRoute = state.staffRoute;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Sidebar */}
      <aside className="w-16 md:w-60 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            <span className="hidden md:inline font-bold text-sm text-slate-800">OncoReady</span>
          </div>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="hidden md:block mb-4 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id || (item.id === 'PATIENTS' && currentRoute === 'CASE_WORKSPACE');
            return (
              <button
                key={item.id}
                onClick={() => onSetStaffRoute(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => onSetPerspective('SIGN_IN')}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline">Switch Role</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="min-h-16 bg-white border-b border-slate-200 flex items-center justify-between gap-3 px-3 md:px-6 py-2 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-slate-800">
              {navItems.find(i => i.id === currentRoute)?.label || 
               (currentRoute === 'CASE_WORKSPACE' ? 'Case Workspace' : '')}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Training environment
            </div>
            
            <button
              onClick={onReset}
              className="text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-md border border-amber-200 transition-colors"
            >
              Reset Workspace
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-50 relative">
          <div className="absolute inset-0 p-3 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
