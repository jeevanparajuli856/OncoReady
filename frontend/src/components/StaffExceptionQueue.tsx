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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Staff Hub Header & SLA Metrics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
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
              <div className="text-xs text-slate-400 font-mono">ON-CALL STAFF</div>
              <div className="text-xs font-semibold text-slate-900">
                S. Jenkins, RN • M. Vance, MSW
              </div>
            </div>
          </div>
        </div>

        {/* 4 SLA Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-500 font-medium">Total Exceptions</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {state.readinessCheckCompleted ? 3 : 2}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">Active queue items</div>
          </div>

          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/70">
            <div className="text-xs text-amber-800 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Urgent (&lt;24h to Infusion)</span>
            </div>
            <div className="text-2xl font-bold text-amber-900 mt-1">
              {isMariaResolved ? 0 : state.readinessCheckCompleted ? 1 : 0}
            </div>
            <div className="text-[11px] text-amber-700 mt-0.5">
              {state.readinessCheckCompleted && !isMariaResolved ? 'Maria Hernandez (Tomorrow)' : 'All urgent clear'}
            </div>
          </div>

          <div className="bg-sky-50/70 p-4 rounded-xl border border-sky-200/70">
            <div className="text-xs text-sky-800 font-medium flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
              <span>Clinical Triage</span>
            </div>
            <div className="text-2xl font-bold text-sky-900 mt-1">
              {clinicalTask?.status === 'ASSIGNED' ? 1 : 0}
            </div>
            <div className="text-[11px] text-sky-700 mt-0.5 font-mono">Assigned to S. Jenkins, RN</div>
          </div>

          <div className="bg-teal-50/70 p-4 rounded-xl border border-teal-200/70">
            <div className="text-xs text-teal-800 font-medium flex items-center gap-1">
              <Car className="w-3.5 h-3.5 text-teal-600" />
              <span>Transit Coordination</span>
            </div>
            <div className="text-2xl font-bold text-teal-900 mt-1">
              {transportTask?.status === 'ASSIGNED' ? 1 : 0}
            </div>
            <div className="text-[11px] text-teal-700 mt-0.5 font-mono">Assigned to M. Vance, MSW</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Cases
          </button>
          <button
            onClick={() => setFilterType('URGENT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'URGENT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Urgent (&lt;24h)
          </button>
          <button
            onClick={() => setFilterType('CLINICAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'CLINICAL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Clinical Triage
          </button>
          <button
            onClick={() => setFilterType('TRANSPORT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'TRANSPORT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
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
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Exception Cases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          
          {/* CASE 1: Maria Hernandez (Active Interactive Golden Path Case) */}
          <div 
            onClick={() => onOpenCase(state.patient.id)}
            className={`p-5 transition hover:bg-slate-50/80 cursor-pointer ${
              !isMariaResolved && state.readinessCheckCompleted
                ? 'bg-amber-50/30 border-l-4 border-l-amber-500'
                : isMariaResolved
                ? 'bg-emerald-50/20 border-l-4 border-l-emerald-500'
                : 'border-l-4 border-l-slate-300'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">
                    {state.patient.name}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    MRN: {state.patient.mrn} • {state.patient.age}F
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    PRIMARY INTERACTIVE CASE
                  </span>
                </div>

                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">{state.appointment.protocol}</span>
                  <span className="text-slate-400 mx-1.5">•</span>
                  <span>{state.appointment.treatmentName}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="inline-flex items-center gap-1 font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Tomorrow 8:30 AM (T-24h)
                  </span>

                  {state.readinessCheckCompleted ? (
                    <>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium ${
                        clinicalTask?.status === 'RESOLVED' || clinicalTask?.status === 'ACTIONED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        <Stethoscope className="w-3 h-3" />
                        Clinical: {clinicalTask?.status === 'RESOLVED' || clinicalTask?.status === 'ACTIONED' ? 'Cleared' : 'Symptom Review Needed'}
                      </span>

                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium ${
                        transportTask?.status === 'RESOLVED' || transportTask?.status === 'CONFIRMED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        <Car className="w-3 h-3" />
                        Transport: {transportTask?.status === 'RESOLVED' || transportTask?.status === 'CONFIRMED' ? 'Dispatched' : 'Ride Cancelled'}
                      </span>
                    </>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs">
                      Readiness screening pending submission
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <div className="text-right hidden sm:block">
                  <div className="text-[11px] font-mono text-slate-400">ASSIGNED CREW</div>
                  <div className="text-xs font-medium text-slate-700">
                    Sarah Jenkins, RN & Marcus Vance, MSW
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCase(state.patient.id);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>Open Case Workspace</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* CASE 2: Robert Chen (Synthetic Background Context) */}
          <div className="p-5 transition hover:bg-slate-50/50 opacity-90">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">Robert Chen</span>
                  <span className="text-xs text-slate-500 font-mono">MRN: OCH-710492 • 61M</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                    Synthetic Contextual Record
                  </span>
                </div>

                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Pembrolizumab + Pemetrexed</span>
                  <span className="text-slate-400 mx-1.5">•</span>
                  <span>Non-Small Cell Lung Cancer</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="inline-flex items-center gap-1 font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Tomorrow 10:15 AM
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium bg-sky-50 text-sky-700 border border-sky-200">
                    Insurance Prior-Auth Re-verification (In Review)
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-500 text-right">
                <div>Owner: David Lee, RN</div>
                <div className="text-[11px] text-slate-400">Payer portal updated</div>
              </div>
            </div>
          </div>

          {/* CASE 3: Elena Rostova (Synthetic Background Context) */}
          <div className="p-5 transition hover:bg-slate-50/50 opacity-90">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">Elena Rostova</span>
                  <span className="text-xs text-slate-500 font-mono">MRN: OCH-923841 • 48F</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                    Synthetic Contextual Record
                  </span>
                </div>

                <div className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">AC-THP (Paclitaxel + Trastuzumab)</span>
                  <span className="text-slate-400 mx-1.5">•</span>
                  <span>HER2+ Breast Cancer</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="inline-flex items-center gap-1 font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Tomorrow 01:00 PM
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    Pre-hydration Lab Clearance (Pending Creatinine)
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-500 text-right">
                <div>Owner: Marcus Vance, MSW</div>
                <div className="text-[11px] text-slate-400">Lab draw scheduled 11:30 AM</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
