import React, { useState } from 'react';
import { WorkflowState } from '../../types';
import { formatEpicCaptureTime, formatEpicSourceDate } from '../../data/epicCapture';
import { EPIC_RECORD_STATUS, type DirectoryRecord } from '../../data/rosterDirectory';

export const StaffCommandCenter: React.FC<{
  state: WorkflowState;
  onOpenCase: () => void;
}> = ({ state, onOpenCase }) => (
  <div className="card-sticker p-5 sm:p-6 space-y-6">
    <div>
      <h2 className="font-display text-2xl font-extrabold">Command Center</h2>
      <p className="text-sm text-muted-fg mt-1">Morning view of treatments in the next 24-48 hours. Open Camila's case, or use Patient / Caregiver / Graph in the top bar.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { label: 'Upcoming Treatments', value: '42', color: 'bg-accent/15' },
        { label: 'Exceptions Requiring Attention', value: '3', color: 'bg-sun/40' },
        { label: 'Ready for Review', value: '18', color: 'bg-mint/30' },
      ].map((stat) => (
        <div key={stat.label} className={`p-4 rounded-xl border-2 border-ink ${stat.color}`}>
          <div className="text-xs font-heading font-bold mb-1">{stat.label}</div>
          <div className="font-display text-3xl font-extrabold">{stat.value}</div>
        </div>
      ))}
    </div>
    <h3 className="font-heading font-bold">Urgent Cases</h3>
    <button
      onClick={onOpenCase}
      className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-ink bg-white hover:bg-sun/30 hover:-rotate-1 transition-transform duration-300 ease-bouncey text-left"
    >
      <div className="flex items-center gap-4">
        <img src={state.patient.avatarUrl} alt={state.patient.name} className="w-12 h-12 rounded-full border-2 border-ink object-cover" />
        <div>
          <div className="font-heading font-bold">{state.patient.name}</div>
          <div className="text-sm text-muted-fg">{state.appointment.treatmentName} • {state.appointment.scheduledTime}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="px-3 py-1 rounded-full text-xs font-heading font-bold bg-sun/50 border-2 border-ink">{state.overallReadiness}</div>
        <span className="text-accent font-heading font-bold text-sm">Review Case →</span>
      </div>
    </button>
  </div>
);

export const StaffPatientDirectory: React.FC<{
  records: DirectoryRecord[];
  search: string;
  status: string;
  onSearch: (value: string) => void;
  onStatus: (value: string) => void;
  onClear: () => void;
  onOpenCase: () => void;
}> = ({ records, search, status, onSearch, onStatus, onClear, onOpenCase }) => {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  return (
    <div className="card-sticker p-5 sm:p-6">
      <h2 className="font-display text-2xl font-extrabold mb-4">Patient Directory</h2>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search name, MRN, or treatment" aria-label="Search patients" className="input-pop flex-1 text-sm" />
        <select value={status} onChange={(event) => onStatus(event.target.value)} aria-label="Filter patients by status" className="input-pop sm:w-48 text-sm">
          <option value="ALL">All states</option>
          <option value="ACTION_REQUIRED">Action required</option>
          <option value="IN_REVIEW">In review</option>
          <option value="READY">Ready</option>
          <option value={EPIC_RECORD_STATUS}>Epic record</option>
        </select>
        {(search || status !== 'ALL') && (
          <button onClick={onClear} className="px-3 py-2 text-sm font-heading font-bold border-2 border-ink rounded-full bg-white hover:bg-sun">Clear filters</button>
        )}
      </div>
      <div className="space-y-2">
        {records.map((record) => {
          const expanded = expandedKey === record.key;
          const isEpicRecord = record.source === 'EPIC_SANDBOX' && !record.unavailableReason;
          return (
            <div key={record.key} className="space-y-2">
              <button
                onClick={() => {
                  if (record.interactive) onOpenCase();
                  else if (isEpicRecord) setExpandedKey(expanded ? null : record.key);
                }}
                disabled={!record.interactive && !isEpicRecord}
                aria-expanded={isEpicRecord ? expanded : undefined}
                className="w-full flex items-center justify-between gap-4 p-3 rounded-xl border-2 border-ink text-left enabled:hover:bg-sun/20 disabled:opacity-70"
              >
                <div>
                  <div className="font-heading font-bold">{record.name}</div>
                  <div className="text-xs text-muted-fg">{record.identifierLabel}: {record.identifier}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">{record.detail}</div>
                  <div className="text-xs text-muted-fg">{record.statusLabel}</div>
                </div>
              </button>
              {isEpicRecord && (
                <p className="text-[11px] text-muted-fg px-3">
                  {expanded ? 'Showing' : 'Select to show'} the read-only Epic record for {record.name}.
                </p>
              )}
              {record.unavailableReason && (
                <p className="text-[11px] text-muted-fg px-3">{record.unavailableReason}</p>
              )}
              {expanded && isEpicRecord && <EpicRosterDetail record={record} />}
            </div>
          );
        })}
        {records.length === 0 && <div className="p-8 text-center text-sm text-muted-fg">No patients match these filters.</div>}
      </div>
    </div>
  );
};

/**
 * Read-only presentation of one captured Epic Sandbox patient. Vital signs are
 * present only when the directory was built for the Care Team; a Care Navigator
 * receives the coordination fields alone.
 */
const EpicRosterDetail: React.FC<{ record: DirectoryRecord }> = ({ record }) => (
  <div className="metric-tile space-y-4">
    <div className="flex flex-wrap items-center gap-2">
      <span className="label-caps text-muted-fg">Connected to Hospital Epic Sandbox</span>
      <span className="chip">Read-only</span>
      <span className="chip chip-mint">Read-only</span>
      {record.bounded && <span className="chip chip-sun">Bounded slice of chart</span>}
    </div>
    <div>
      <p className="label-caps text-muted-fg mb-2">Appointments</p>
      {record.appointments && record.appointments.length > 0 ? (
        <ul className="space-y-1.5">
          {record.appointments.map((appointment) => (
            <li key={appointment.id} className="text-sm">
              <span className="font-heading font-semibold">{appointment.label}</span>
              <span className="block text-xs text-muted-fg">{appointment.when}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-fg">No appointment recorded.</p>
      )}
    </div>
    {record.vitals && (
      <div>
        <p className="label-caps text-muted-fg mb-2">
          Vital signs
          {record.vitalsTotal && record.vitalsTotal > record.vitals.length
            ? ` \u00b7 ${record.vitals.length} most recent of ${record.vitalsTotal}`
            : ''}
        </p>
        {record.vitals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {record.vitals.map((vital) => (
              <div key={vital.id} className="metric-tile">
                <div className="label-caps text-muted-fg">{vital.name ?? 'Unnamed observation'}</div>
                <div className="font-display text-xl font-extrabold mt-1">{vital.value ?? 'Not recorded'}{vital.value && vital.unit ? ` ${vital.unit}` : ''}</div>
                <div className="text-[11px] text-muted-fg">{vital.effectiveAt ? formatEpicSourceDate(vital.effectiveAt) ?? vital.effectiveAt : 'Collection time not recorded'}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-fg">No vital signs recorded.</p>
        )}
      </div>
    )}
    {record.capturedAt && (
      <p className="text-[11px] text-muted-fg">Retrieved {formatEpicCaptureTime(record.capturedAt)} &middot; record {record.captureId}</p>
    )}
  </div>
);

export const StaffInsights: React.FC = () => {
  const bars = [
    { label: '0-30 min', width: '72%', color: '#0C3C34' },
    { label: '31-60 min', width: '19%', color: '#B4740A' },
    { label: 'Over 60 min', width: '9%', color: '#D6451B' },
  ];

  return (
    <div className="card-sticker p-5 sm:p-6 space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold">Operational Insights</h2>
        <p className="text-sm text-muted-fg">Ownership pressure and exception aging.</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {[['Open exceptions', '18'], ['Owned within 15 min', '14'], ['Awaiting patient confirmation', '4']].map(([label, value]) => (
          <div key={label} className="p-4 border-2 border-ink rounded-xl bg-cream">
            <div className="font-display text-3xl font-extrabold">{value}</div>
            <div className="text-xs text-muted-fg">{label}</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {bars.map((bar) => (
            <div key={bar.label}>
              <div className="flex justify-between text-xs font-heading font-bold mb-1">
                <span>{bar.label}</span>
                <span>{bar.width}</span>
              </div>
              <div className="h-3 bg-muted rounded-full border-2 border-ink overflow-hidden">
                <div className="h-full" style={{ width: bar.width, background: bar.color }} />
              </div>
            </div>
          ))}
        </div>
        <svg viewBox="0 0 240 160" className="w-full h-40" role="img" aria-label="Weekly chair-protection trend">
          <rect x="0" y="0" width="240" height="160" fill="#FFFDF5" />
          <polyline points="16,120 56,104 96,88 136,70 176,58 216,40" fill="none" stroke="#0C3C34" strokeWidth="5" strokeLinecap="round" />
          {[[16, 120], [56, 104], [96, 88], [136, 70], [176, 58], [216, 40]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="6" fill={['#D6451B', '#B4740A', '#0C3C34', '#2F7D6A', '#B4740A', '#0C3C34'][i]} stroke="#17211E" strokeWidth="2" />
          ))}
        </svg>
      </div>
    </div>
  );
};
