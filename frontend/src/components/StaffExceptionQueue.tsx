import React, { useState } from 'react';
import { 
  Clock, 
  Car, 
  Stethoscope, 
  Search, 
  Building2, 
  ChevronRight
} from 'lucide-react';
import { WorkflowState } from '../types';

interface StaffExceptionQueueProps {
  state: WorkflowState;
  onOpenCase: (patientId: string) => void;
}

export const StaffExceptionQueue: React.FC<StaffExceptionQueueProps> = ({
  state,
  onOpenCase,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'URGENT' | 'CLINICAL' | 'TRANSPORT'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const clinicalTask = state.tasks.find((t) => t.type === 'CLINICAL_REVIEW');
  const transportTask = state.tasks.find((t) => t.type === 'TRANSPORTATION_NAVIGATION');

  const isMariaResolved = state.overallReadiness === 'PLAN_CONFIRMED';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      
      {/* Staff Hub Header & SLA Metrics */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-indigo-50 text-indigo-700">
                <Building2 className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Pre-Treatment Exception Queue
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                Benson Cancer Center
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Multi-disciplinary triage workbench tracking time-sensitive infusion blockers for next-day treatments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-mono uppercase">ON-CALL STAFF TEAM</div>
              <div className="text-xs font-bold text-slate-900">
                Sarah Jenkins, RN • Marcus Vance, MSW
              </div>
            </div>
          </div>
        </div>

        {/* SLA Triage Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-slate-400 font-mono text-[11px]">TOMORROW'S INFUSIONS</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">24 Cases</div>
            <div className="text-[11px] text-slate-500">8:00 AM – 4:30 PM</div>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80">
            <div className="text-amber-800 font-mono text-[11px] font-semibold">ACTIVE EXCEPTIONS</div>
            <div className="text-lg font-extrabold text-amber-900 mt-0.5">
              {isMariaResolved ? '3 Pending' : '4 Pending'}
            </div>
            <div className="text-[11px] text-amber-700">1 Urgent Clinical</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-slate-400 font-mono text-[11px]">AVG RESOLUTION TIME</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5">42 mins</div>
            <div className="text-[11px] text-emerald-600 font-medium">SLA Target &lt; 2h</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-slate-400 font-mono text-[11px]">CANCEL RATE MITIGATION</div>
            <div className="text-lg font-extrabold text-indigo-700 mt-0.5">94.2%</div>
            <div className="text-[11px] text-slate-500">Zero day-of chair loss</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Exceptions (4)
          </button>
          <button
            onClick={() => setFilterType('URGENT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'URGENT' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Urgent T-24h (1)
          </button>
          <button
            onClick={() => setFilterType('CLINICAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'CLINICAL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Clinical Triage
          </button>
          <button
            onClick={() => setFilterType('TRANSPORT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterType === 'TRANSPORT' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Transportation
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search patient, MRN, protocol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Exception Cases Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          
          {/* CASE 1: Maria Hernandez (Primary Case) */}
          <div 
            onClick={() => onOpenCase(state.patient.id)}
            className={`p-6 transition hover:bg-slate-50/80 cursor-pointer ${
              !isMariaResolved && state.readinessCheckCompleted
                ? 'bg-amber-50/30 border-l-4 border-l-amber-500'
                : isMariaResolved
                ? 'bg-emerald-50/20 border-l-4 border-l-emerald-500'
                : 'border-l-4 border-l-indigo-500'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <img
                  src={state.patient.avatarUrl}
                  alt={state.patient.name}
                  className="w-13 h-13 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm shrink-0"
                />

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900">
                      {state.patient.name}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      MRN: {state.patient.mrn} • {state.patient.age}F
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      T-24h Scheduled Arrival
                    </span>
                  </div>

                  <div className="text-xs text-slate-600">
                    <span className="font-bold text-slate-800">{state.appointment.protocol}</span>
                    <span className="text-slate-400 mx-1.5">•</span>
                    <span>{state.appointment.treatmentName}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="inline-flex items-center gap-1 font-mono text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Tomorrow 8:30 AM (T-24h)
                    </span>

                    {state.readinessCheckCompleted ? (
                      <>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg font-semibold ${
                          clinicalTask?.clinicalDetails?.clearanceState === 'REVIEWED_AND_ACKNOWLEDGED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <Stethoscope className="w-3 h-3" />
                          {clinicalTask?.clinicalDetails?.clearanceState === 'REVIEWED_AND_ACKNOWLEDGED'
                            ? 'Clinical Review Acknowledged'
                            : 'Symptom Review Pending'}
                        </span>

                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg font-semibold ${
                          transportTask?.transportDetails?.dispatchStatus === 'CONFIRMED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <Car className="w-3 h-3" />
                          {transportTask?.transportDetails?.dispatchStatus === 'CONFIRMED'
                            ? 'Med-Van Dispatched'
                            : 'Transport Coordination Needed'}
                        </span>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Clock className="w-3 h-3" />
                        Screening Window Open
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <button
                  onClick={() => onOpenCase(state.patient.id)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <span>Open Case Workspace</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Contextual Cases (Background Cohort) */}
          {state.contextualCases.map((c) => (
            <div key={c.id} className="p-6 transition hover:bg-slate-50/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <img
                    src={c.avatarUrl}
                    alt={c.patientName}
                    className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
                  />

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-base text-slate-900">{c.patientName}</span>
                      <span className="text-xs text-slate-500 font-mono">MRN: {c.mrn}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {c.diagnosis}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">{c.protocol}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="inline-flex items-center gap-1 font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {c.appointmentTime}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        {c.blockerType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-500 text-left md:text-right">
                  <div className="font-bold text-slate-900">{c.ownerName}</div>
                  <div className="text-[11px] text-slate-400">{c.ownerRole}</div>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
};
