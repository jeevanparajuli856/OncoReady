import React from 'react';
import { WorkflowState } from '../../types';
import { BENSON_CENTER, LOUISIANA_SITES, NEW_ORLEANS_PICKUP, RideMap } from '../RideMap';
import { StickerCard } from '../ui';

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
  records: Array<{ name: string; mrn: string; treatment: string; status: string; interactive: boolean }>;
  search: string;
  status: string;
  onSearch: (value: string) => void;
  onStatus: (value: string) => void;
  onClear: () => void;
  onOpenCase: () => void;
}> = ({ records, search, status, onSearch, onStatus, onClear, onOpenCase }) => (
  <div className="card-sticker p-5 sm:p-6">
    <h2 className="font-display text-2xl font-extrabold mb-4">Patient Directory</h2>
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search name, MRN, or treatment" aria-label="Search patients" className="input-pop flex-1 text-sm" />
      <select value={status} onChange={(event) => onStatus(event.target.value)} aria-label="Filter patients by status" className="input-pop sm:w-48 text-sm">
        <option value="ALL">All states</option>
        <option value="ACTION_REQUIRED">Action required</option>
        <option value="IN_REVIEW">In review</option>
        <option value="READY">Ready</option>
      </select>
      {(search || status !== 'ALL') && (
        <button onClick={onClear} className="px-3 py-2 text-sm font-heading font-bold border-2 border-ink rounded-full bg-white hover:bg-sun">Clear filters</button>
      )}
    </div>
    <div className="space-y-2">
      {records.map((record) => (
        <button
          key={record.mrn}
          onClick={() => record.interactive && onOpenCase()}
          disabled={!record.interactive}
          className="w-full flex items-center justify-between gap-4 p-3 rounded-xl border-2 border-ink text-left enabled:hover:bg-sun/20 disabled:opacity-70"
        >
          <div>
            <div className="font-heading font-bold">{record.name}</div>
            <div className="text-xs text-muted-fg">MRN: {record.mrn}</div>
          </div>
          <div className="text-right">
            <div className="text-sm">{record.treatment}</div>
            <div className="text-xs text-muted-fg">{record.status.replace('_', ' ')}</div>
          </div>
        </button>
      ))}
      {records.length === 0 && <div className="p-8 text-center text-sm text-muted-fg">No patients match these filters.</div>}
    </div>
  </div>
);

export const StaffResources: React.FC = () => (
  <div className="space-y-5">
    <div className="card-sticker p-5 sm:p-6">
      <h2 className="font-display text-2xl font-extrabold mb-1">Resource Directory</h2>
      <p className="text-sm text-muted-fg mb-5">Illustrative transportation and community access nodes for tomorrow's infusion corridor.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <StickerCard hover={false} className="p-4">
          <h3 className="font-heading font-bold">CareLink Transportation</h3>
          <p className="text-sm text-muted-fg mt-1">Illustrative non-emergency transportation coordination.</p>
          <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-heading font-bold bg-mint/30 border-2 border-ink">3 coordination windows</div>
        </StickerCard>
        <StickerCard hover={false} className="p-4">
          <h3 className="font-heading font-bold">Community Mobility Network</h3>
          <p className="text-sm text-muted-fg mt-1">Illustrative community transportation directory.</p>
          <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-heading font-bold bg-sun/40 border-2 border-ink">Directory mapping</div>
        </StickerCard>
      </div>
    </div>
    <RideMap
      title="Louisiana access network"
      subtitle="Illustrative parish-to-hub routing data"
      pickup={NEW_ORLEANS_PICKUP}
      destination={BENSON_CENTER}
      extras={LOUISIANA_SITES}
      height={420}
    />
  </div>
);

export const StaffInsights: React.FC = () => {
  const bars = [
    { label: '0-30 min', width: '72%', color: '#8B5CF6' },
    { label: '31-60 min', width: '19%', color: '#FBBF24' },
    { label: 'Over 60 min', width: '9%', color: '#F472B6' },
  ];

  return (
    <div className="card-sticker p-5 sm:p-6 space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold">Operational Insights</h2>
        <p className="text-sm text-muted-fg">Illustrative records showing ownership pressure and exception aging.</p>
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
        <svg viewBox="0 0 240 160" className="w-full h-40" role="img" aria-label="Illustrative weekly chair-protection trend">
          <rect x="0" y="0" width="240" height="160" fill="#FFFDF5" />
          <polyline points="16,120 56,104 96,88 136,70 176,58 216,40" fill="none" stroke="#8B5CF6" strokeWidth="5" strokeLinecap="round" />
          {[[16, 120], [56, 104], [96, 88], [136, 70], [176, 58], [216, 40]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="6" fill={['#F472B6', '#FBBF24', '#8B5CF6', '#34D399', '#FBBF24', '#8B5CF6'][i]} stroke="#1E293B" strokeWidth="2" />
          ))}
        </svg>
      </div>
    </div>
  );
};

export const StaffIntegrations: React.FC = () => (
  <div className="card-sticker p-5 sm:p-6 space-y-4">
    <h2 className="font-display text-2xl font-extrabold">Proposed Data Flow Mapping</h2>
    <div className="p-4 rounded-xl bg-cream border-2 border-ink">
      <h3 className="font-heading font-bold text-sm">FHIR Schedule Mapping</h3>
      <pre className="mt-2 text-xs bg-white p-3 rounded-lg border-2 border-ink text-muted-fg overflow-x-auto">{`{
  "resourceType": "Appointment",
  "status": "booked",
  "serviceType": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/service-type",
          "code": "108",
          "display": "Oncology"
        }
      ]
    }
  ]
}`}</pre>
    </div>
    <div className="grid sm:grid-cols-3 gap-3">
      {['Patient + Appointment', 'Task + Owner', 'Communication + Audit'].map((mapping) => (
        <div key={mapping} className="p-3 border-2 border-ink rounded-xl bg-white">
          <div className="text-sm font-heading font-bold">{mapping}</div>
          <div className="text-xs text-muted-fg mt-1">FHIR mapping • Not connected</div>
        </div>
      ))}
    </div>
  </div>
);

export const StaffAdmin: React.FC<{
  onOpenCase: () => void;
  onSetPerspective: (p: 'LANDING' | 'PATIENT' | 'CAREGIVER' | 'SYSTEM') => void;
}> = ({ onOpenCase, onSetPerspective }) => (
  <div className="page-shell space-y-5">
    <div className="card-sticker p-5 sm:p-6 space-y-4">
      <div>
        <h2 className="font-display text-2xl font-extrabold">Local Configuration</h2>
        <p className="text-sm text-muted-fg mt-1">
          These workspace rules split Camila's report to Sarah and Marcus and keep clinical text out of Ana's transportation-only view.
        </p>
      </div>
      <div className="space-y-3">
        {[
          ['Clinical Triage Routing', 'Route GI symptoms to: Sarah Jenkins, RN', 'Shown on Task 1 in the case workspace.'],
          ['Caregiver permissions', 'Transportation-only projection', 'This is why Ana never sees fever or nurse notes.'],
          ['Escalation window', '30 minutes before ownership review', 'Keeps an exception from sitting unowned.'],
          ['Communication channels', 'Patient portal and staff workspace', 'Same state updates Patient, Staff, Caregiver, and Graph.'],
          ['Navigator Assignment', 'Route SDOH/Transport to: Marcus Vance, MSW', 'Shown on Task 2 and the caregiver ride card.'],
        ].map(([title, detail, why]) => (
          <div key={title} className="p-3.5 border-2 border-ink rounded-xl bg-cream">
            <div className="font-heading font-bold">{title}</div>
            <div className="text-sm text-muted-fg mt-0.5">{detail}</div>
            <div className="text-xs text-ink mt-1.5">{why}</div>
          </div>
        ))}
      </div>
    </div>

    <div className="card-sticker p-5 sm:p-6 space-y-3">
      <h3 className="font-heading font-bold">See these rules in the product</h3>
      <p className="text-sm text-muted-fg">
        Admin is not a separate site. It describes the loop you can walk right now.
      </p>
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
        <button onClick={onOpenCase} className="btn-candy btn-compact">Open Camila's case</button>
        <button onClick={() => onSetPerspective('PATIENT')} className="btn-ghost btn-compact">Patient portal</button>
        <button onClick={() => onSetPerspective('CAREGIVER')} className="btn-ghost btn-compact">Caregiver view</button>
        <button onClick={() => onSetPerspective('SYSTEM')} className="btn-ghost btn-compact">Readiness graph</button>
        <button onClick={() => onSetPerspective('LANDING')} className="btn-ghost btn-compact">Home</button>
      </div>
    </div>
  </div>
);
