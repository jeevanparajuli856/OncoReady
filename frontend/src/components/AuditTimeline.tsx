import React, { useState } from 'react';
import { 
  History, 
  User, 
  Stethoscope, 
  Car, 
  Cpu, 
  Clock, 
  ArrowRight
} from 'lucide-react';
import { AuditEvent, ActorRole } from '../types';

interface AuditTimelineProps {
  events: AuditEvent[];
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ events }) => {
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  const filteredEvents = selectedRole === 'ALL'
    ? events
    : events.filter((e) => e.actorRole === selectedRole);

  const getActorBadge = (role: ActorRole) => {
    switch (role) {
      case 'PATIENT':
        return (
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center border border-indigo-200">
            <User className="w-4 h-4" />
          </div>
        );
      case 'TRIAGE_NURSE':
        return (
          <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center border border-sky-200">
            <Stethoscope className="w-4 h-4" />
          </div>
        );
      case 'NAVIGATOR':
        return (
          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center border border-teal-200">
            <Car className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
            <Cpu className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Append-Only Causal Event Timeline
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
              Immutable Audit Log
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent event sequence demonstrating causal transitions from detection to closure.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
          <button
            onClick={() => setSelectedRole('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              selectedRole === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            onClick={() => setSelectedRole('PATIENT')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              selectedRole === 'PATIENT' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Patient
          </button>
          <button
            onClick={() => setSelectedRole('TRIAGE_NURSE')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              selectedRole === 'TRIAGE_NURSE' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nurse
          </button>
          <button
            onClick={() => setSelectedRole('NAVIGATOR')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              selectedRole === 'NAVIGATOR' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Navigator
          </button>
          <button
            onClick={() => setSelectedRole('SYSTEM')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              selectedRole === 'SYSTEM' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Engine
          </button>
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {filteredEvents.map((evt) => (
          <div key={evt.id} className="relative flex items-start gap-4 animate-fade-in">
            {/* Timeline icon */}
            <div className="absolute -left-6 bg-white p-0.5 rounded-full z-10">
              {getActorBadge(evt.actorRole)}
            </div>

            {/* Event Content Card */}
            <div className="flex-1 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-1.5 ml-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{evt.action}</span>
                  <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                    {evt.id}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{evt.timestamp}</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {evt.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                <div className="font-medium text-slate-800">
                  Actor: <span className="font-semibold text-indigo-700">{evt.actor}</span>
                </div>

                {evt.stateDiff && (
                  <div className="flex items-center gap-1 font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">
                    <span className="text-slate-500">{evt.stateDiff.from}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                    <span className="font-bold text-emerald-700">{evt.stateDiff.to}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
