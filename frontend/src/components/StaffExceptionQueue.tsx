import React, { useState } from 'react';
import {
  Clock,
  Car,
  Stethoscope,
  Search,
  Building2,
  ChevronRight,
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

  const filters = [
    ['ALL', 'All Exceptions (4)'],
    ['URGENT', 'Urgent T-24h (1)'],
    ['CLINICAL', 'Clinical Triage'],
    ['TRANSPORT', 'Transportation'],
  ] as const;

  return (
    <div className="page-shell space-y-5 pb-8 animate-pop">
      <div className="card-sticker p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b-2 border-ink/10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="icon-bubble w-9 h-9 bg-accent text-white">
                <Building2 className="w-4 h-4" strokeWidth={2.5} />
              </span>
              <h1 className="font-display text-xl sm:text-2xl font-extrabold">
                Pre-Treatment Exception Queue
              </h1>
              <span className="chip">Benson Cancer Center</span>
            </div>
            <p className="text-sm text-muted-fg">
              Multi-disciplinary triage workbench tracking time-sensitive infusion blockers for next-day treatments.
            </p>
          </div>
          <div className="text-left md:text-right">
            <div className="label-caps text-muted-fg">On-call staff team</div>
            <div className="text-sm font-heading font-bold mt-0.5">
              Sarah Jenkins, RN • Marcus Vance, MSW
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-5">
          <div className="metric-tile">
            <div className="label-caps text-muted-fg">Tomorrow's infusions</div>
            <div className="font-display text-2xl font-extrabold mt-1">24 Cases</div>
            <div className="text-[11px] text-muted-fg">8:00 AM - 4:30 PM</div>
          </div>
          <div className="metric-tile bg-sun/30">
            <div className="label-caps">Active exceptions</div>
            <div className="font-display text-2xl font-extrabold mt-1">
              {isMariaResolved ? '3 Pending' : '4 Pending'}
            </div>
            <div className="text-[11px] text-muted-fg">1 Urgent Clinical</div>
          </div>
          <div className="metric-tile">
            <div className="label-caps text-muted-fg">Avg resolution time</div>
            <div className="font-display text-2xl font-extrabold mt-1">42 mins</div>
            <div className="text-[11px] text-muted-fg">SLA Target &lt; 2h</div>
          </div>
          <div className="metric-tile">
            <div className="label-caps text-muted-fg">Cancel rate mitigation</div>
            <div className="font-display text-2xl font-extrabold mt-1">94.2%</div>
            <div className="text-[11px] text-muted-fg">Zero day-of chair loss</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="filter-bar w-full lg:w-auto">
          {filters.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilterType(id)}
              className={`filter-pill ${filterType === id ? 'filter-pill-active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-muted-fg absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, MRN, protocol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-pop pl-9 text-sm"
          />
        </div>
      </div>

      <div className="card-sticker overflow-hidden divide-y-2 divide-ink/10">
        <div
          onClick={() => onOpenCase(state.patient.id)}
          className={`p-5 sm:p-6 cursor-pointer hover:bg-sun/10 transition ${
            !isMariaResolved && state.readinessCheckCompleted
              ? 'bg-sun/15'
              : isMariaResolved
              ? 'bg-mint/15'
              : ''
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <img
                src={state.patient.avatarUrl}
                alt={state.patient.name}
                className="w-12 h-12 rounded-xl object-cover border-2 border-ink shrink-0"
              />
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-heading font-extrabold text-base">{state.patient.name}</span>
                  <span className="text-xs text-muted-fg font-mono">
                    MRN: {state.patient.mrn} • {state.patient.age}F
                  </span>
                  <span className="chip chip-accent">T-24h Scheduled Arrival</span>
                </div>
                <p className="text-sm text-muted-fg">
                  <span className="font-heading font-bold text-ink">{state.appointment.protocol}</span>
                  {' • '}
                  {state.appointment.treatmentName}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="chip">
                    <Clock className="w-3 h-3" strokeWidth={2.5} />
                    Tomorrow 8:30 AM (T-24h)
                  </span>
                  {state.readinessCheckCompleted ? (
                    <>
                      <span className={`chip ${clinicalTask?.clinicalDetails?.clearanceState === 'REVIEWED_AND_ACKNOWLEDGED' ? 'chip-mint' : 'chip-sun'}`}>
                        <Stethoscope className="w-3 h-3" strokeWidth={2.5} />
                        {clinicalTask?.clinicalDetails?.clearanceState === 'REVIEWED_AND_ACKNOWLEDGED'
                          ? 'Clinical Review Acknowledged'
                          : 'Symptom Review Pending'}
                      </span>
                      <span className={`chip ${transportTask?.transportDetails?.dispatchStatus === 'CONFIRMED' ? 'chip-mint' : 'chip-sun'}`}>
                        <Car className="w-3 h-3" strokeWidth={2.5} />
                        {transportTask?.transportDetails?.dispatchStatus === 'CONFIRMED'
                          ? 'Med-Van Dispatched'
                          : 'Transport Coordination Needed'}
                      </span>
                    </>
                  ) : (
                    <span className="chip chip-accent">
                      <Clock className="w-3 h-3" strokeWidth={2.5} />
                      Screening Window Open
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenCase(state.patient.id);
              }}
              className="btn-candy btn-compact shrink-0 self-start lg:self-center"
            >
              <span>Open Case Workspace</span>
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {state.contextualCases.map((c) => (
          <div key={c.id} className="p-5 sm:p-6 hover:bg-cream/80">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <img
                  src={c.avatarUrl}
                  alt={c.patientName}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-ink shrink-0"
                />
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-heading font-bold">{c.patientName}</span>
                    <span className="text-xs text-muted-fg font-mono">MRN: {c.mrn}</span>
                    <span className="chip">{c.diagnosis}</span>
                  </div>
                  <p className="text-sm font-heading font-bold">{c.protocol}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="chip">
                      <Clock className="w-3 h-3" strokeWidth={2.5} />
                      {c.appointmentTime}
                    </span>
                    <span className="chip chip-sun">{c.blockerType}</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-left md:text-right">
                <div className="font-heading font-bold">{c.ownerName}</div>
                <div className="text-xs text-muted-fg">{c.ownerRole}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
