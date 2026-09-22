import { 
  WorkflowState, 
  Task, 
  AuditEvent, 
  Perspective, 
  CaregiverProjection 
} from '../types';

const STORAGE_KEY = 'oncoready_workflow_state_v4';
const avatarData = (initials: string, color: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" rx="24" fill="${color}"/><text x="64" y="74" text-anchor="middle" font-family="Arial,sans-serif" font-size="42" font-weight="700" fill="white">${initials}</text></svg>`)}`;

export const INITIAL_STATE: WorkflowState = {
  version: 5,
  scenarioId: 'camila-demo-v2',
  isSimulated: true,
  currentPerspective: 'LANDING',
  staffRoute: 'COMMAND_CENTER',
  overallReadiness: 'ACTION_REQUIRED',
  readinessCheckCompleted: false,
  patientAcknowledged: false,
  patientAcknowledgedPlanVersion: null,
  appliedCommandIds: [],
  processedSourceEventIds: [],
  currentCheckpoint: 'START',
  attendanceStatus: 'UNKNOWN',
  
  patient: {
    id: 'PAT-882914',
    mrn: 'OR-882914',
    name: 'Camila Lopez',
    age: 54,
    gender: 'Female',
    diagnosis: 'Colorectal Adenocarcinoma',
    stage: 'Stage IV (Hepatic Metastasis)',
    oncologist: 'Dr. Aris Thorne, MD',
    phone: '(504) 555-0182',
    address: '1420 St. Charles Ave, New Orleans, LA 70130',
    avatarUrl: avatarData('CL', '#4f46e5'),
    ecogStatus: 1,
    bodySurfaceArea: '1.72 m²',
  },

  caregiver: {
    id: 'CG-40912',
    name: 'Ana Hernandez',
    relationship: 'Daughter & Health Proxy',
    phone: '(504) 555-0199',
    permissionScope: 'TRANSPORTATION_ONLY',
    authorizedBy: 'Camila Lopez',
    avatarUrl: avatarData('AH', '#0d9488'),
  },

  appointment: {
    id: 'APT-2026-0925',
    protocol: 'mFOLFOX6 + Bevacizumab',
    cycleNumber: 4,
    totalCycles: 12,
    treatmentName: 'Cycle 4 Infusion (Oxaliplatin / Leucovorin / 5-FU / Avastin)',
    scheduledTime: 'Sep 25, 2026 • 10:00 AM CT',
    location: 'Benson Cancer Center, Infusion Suite B',
    room: 'Bay 4',
    infusionChair: 'Infusion Chair 14 (Window)',
    infusionDuration: '4 hours (plus 46-hr CADD ambulatory pump)',
    oncologist: 'Dr. Aris Thorne, MD, PhD',
    oncologistAvatar: avatarData('AT', '#0369a1'),
    nurseTeam: 'Sarah Jenkins, RN, OCN (Primary Triage)',
    drugs: [
      {
        name: 'Oxaliplatin',
        dosage: '85 mg/m² (146.2 mg in D5W 500 mL)',
        route: 'IV Infusion over 2 hrs',
        schedule: 'Day 1',
        indication: 'DNA cross-linking alkylating-like agent',
      },
      {
        name: 'Leucovorin (Folinic Acid)',
        dosage: '400 mg/m² (688 mg in D5W 250 mL)',
        route: 'IV Infusion concurrent with Oxaliplatin',
        schedule: 'Day 1',
        indication: '5-FU biochemical modulation & synergy',
      },
      {
        name: 'Fluorouracil (5-FU) Bolus',
        dosage: '400 mg/m² (688 mg IV Push)',
        route: 'IV Push over 5 mins',
        schedule: 'Day 1',
        indication: 'Thymidylate synthase inhibitor',
      },
      {
        name: 'Fluorouracil (5-FU) Continuous Infusion',
        dosage: '2,400 mg/m² (4,128 mg via CADD Ambulatory Pump)',
        route: 'Continuous IV over 46 hours',
        schedule: 'Days 1-3',
        indication: 'S-phase active antimetabolite',
      },
      {
        name: 'Bevacizumab (Avastin)',
        dosage: '5 mg/kg (340 mg in 0.9% NaCl 100 mL)',
        route: 'IV Infusion over 30 mins',
        schedule: 'Day 1',
        indication: 'VEGF-A targeted angiogenesis inhibitor',
      }
    ],
    premeds: [
      'Dexamethasone 12 mg IV (Anti-emetic & steroid premedication)',
      'Ondansetron (Zofran) 16 mg IV over 15 mins',
      'Diphenhydramine 25 mg IV (Hypersensitivity prophylaxis)',
      'Famotidine 20 mg IV (H2 antagonist prophylaxis)'
    ]
  },

  labs: [
    {
      name: 'Absolute Neutrophil Count (ANC)',
      value: '1.82',
      unit: '× 10³/µL',
      referenceRange: '1.50 - 8.00',
      status: 'NORMAL',
      collectedAt: 'Sep 23, 09:15 AM CT',
    },
    {
      name: 'Platelet Count',
      value: '168',
      unit: '× 10³/µL',
      referenceRange: '150 - 450',
      status: 'NORMAL',
      collectedAt: 'Sep 23, 09:15 AM CT',
    },
    {
      name: 'Hemoglobin (Hgb)',
      value: '11.4',
      unit: 'g/dL',
      referenceRange: '12.0 - 16.0',
      status: 'EVALUATED',
      collectedAt: 'Sep 23, 09:15 AM CT',
    },
    {
      name: 'Serum Creatinine',
      value: '0.88',
      unit: 'mg/dL',
      referenceRange: '0.50 - 1.10',
      status: 'NORMAL',
      collectedAt: 'Sep 23, 09:15 AM CT',
    },
    {
      name: 'Total Bilirubin',
      value: '0.6',
      unit: 'mg/dL',
      referenceRange: '0.2 - 1.2',
      status: 'NORMAL',
      collectedAt: 'Sep 23, 09:15 AM CT',
    }
  ],

  vitals: [
    {
      name: 'Body Temperature',
      value: '98.6°F (Basal) / 100.4°F (Reported)',
      unit: '°F',
      status: 'ATTENTION',
      collectedAt: 'Self-Reported Today 07:15 AM',
    },
    {
      name: 'Blood Pressure',
      value: '124 / 78',
      unit: 'mmHg',
      status: 'NORMAL',
      collectedAt: 'Clinic visit Sep 22',
    },
    {
      name: 'Pulse / Heart Rate',
      value: '72',
      unit: 'bpm',
      status: 'NORMAL',
      collectedAt: 'Clinic visit Sep 22',
    },
    {
      name: 'SpO2 Oxygen Saturation',
      value: '99',
      unit: '%',
      status: 'NORMAL',
      collectedAt: 'Clinic visit Sep 22',
    },
    {
      name: 'Patient Weight',
      value: '68.0',
      unit: 'kg (150 lbs)',
      status: 'NORMAL',
      collectedAt: 'Clinic visit Sep 22',
    }
  ],

  readinessSubmission: {
    hasTransportIssue: false,
    transportNotes: '',
    hasClinicalConcern: false,
    clinicalConcernText: '',
    submittedAt: null,
  },

  tasks: [],

  auditEvents: [
    {
      id: 'EVT-HISTORY-SCHEDULED-01',
      timestamp: 'Sep 23, 2026 • 10:05 AM CT',
      actor: 'Prepared outreach history',
      actorRole: 'SYSTEM',
      action: 'Automatic check-in scheduled',
      description: 'Prepared SMS due Sep 23 at 10:06 AM CT. This is scenario history, not provider delivery evidence.',
    },
    {
      id: 'EVT-HISTORY-SMS-01', timestamp: 'Sep 23, 2026 • 10:06 AM CT', actor: 'Prepared outreach history', actorRole: 'SYSTEM', action: 'Prepared SMS sent',
      description: '“Is your transportation plan ready for your upcoming appointment?”',
    },
    {
      id: 'EVT-HISTORY-REPLY-01', timestamp: 'Sep 23, 2026 • 10:18 AM CT', actor: 'Camila Lopez', actorRole: 'PATIENT', action: 'Prepared reply received',
      description: '“I think my ride is set. I’ll confirm tomorrow.”',
    },
    {
      id: 'EVT-HISTORY-FOLLOWUP-01', timestamp: 'Sep 23, 2026 • 10:19 AM CT', actor: 'Prepared outreach history', actorRole: 'SYSTEM', action: 'Follow-up scheduled',
      description: 'Next prepared check-in scheduled for Sep 24 at 10:06 AM CT.',
    },
    {
      id: 'EVT-HISTORY-SMS-02', timestamp: 'Sep 24, 2026 • 10:06 AM CT', actor: 'Prepared outreach history', actorRole: 'SYSTEM', action: 'Prepared follow-up SMS sent',
      description: '“Please confirm your ride plan or let us know if you need help.”',
    }
  ],

  contextualCases: [
    {
      id: 'CASE-1092',
      patientName: 'David Chen',
      mrn: 'OCH-992104',
      diagnosis: 'NSCLC Adenocarcinoma',
      protocol: 'Pembrolizumab + Carboplatin',
      appointmentTime: 'Tomorrow • 09:00 AM',
      blockerType: 'Lab Exception: ANC 0.89 K/uL (Grade 3 Neutropenia)',
      ownerName: 'Sarah Jenkins, RN',
      ownerRole: 'Triage Nurse',
      status: 'IN_REVIEW',
      priority: 'CRITICAL',
      avatarUrl: avatarData('DC', '#64748b'),
    },
    {
      id: 'CASE-1093',
      patientName: 'Elena Rostova',
      mrn: 'OCH-771289',
      diagnosis: 'HER2+ Invasive Ductal Breast Ca',
      protocol: 'Trastuzumab + Pertuzumab',
      appointmentTime: 'Tomorrow • 10:30 AM',
      blockerType: 'Prior Auth: Commercial Payer Recertification',
      ownerName: 'Marcus Vance, MSW',
      ownerRole: 'Patient Navigator',
      status: 'PENDING',
      priority: 'HIGH',
      avatarUrl: avatarData('RS', '#64748b'),
    },
    {
      id: 'CASE-1094',
      patientName: 'Robert Washington',
      mrn: 'OCH-663812',
      diagnosis: 'Multiple Myeloma',
      protocol: 'Daratumumab + VRd',
      appointmentTime: 'Tomorrow • 11:15 AM',
      blockerType: 'Specialty Pharmacy Delay: Revlimid Delivery',
      ownerName: 'Sarah Jenkins, RN',
      ownerRole: 'Triage Nurse',
      status: 'PENDING',
      priority: 'HIGH',
      avatarUrl: avatarData('JW', '#64748b'),
    }
  ]
};

export const PREPARED_REPLY = "My ride was cancelled—and I’m not feeling well today.";
const SOURCE_REPLY_ID = 'source-prepared-reply-2026-09-24T10:12:00-05:00';

export type WorkflowAction =
  | { type: 'SUBMIT_READINESS'; payload: { transportNotes: string; clinicalConcernText: string; sourceEventId?: string; commandId?: string } }
  | { type: 'ACKNOWLEDGE_CLINICAL_TASK'; payload?: { commandId?: string; nurseNotes?: string } }
  | { type: 'RECORD_CLINICAL_DISPOSITION'; payload: { disposition: string; followUpBlocking: boolean; commandId?: string } }
  | { type: 'CONFIRM_TRANSPORTATION'; payload?: { vehicleId?: string; driverName?: string; pickupTime?: string; returnArrangement?: string; logisticsContact?: string; backupPlan?: string; commandId?: string } }
  | { type: 'FAIL_TRANSPORTATION'; payload?: { commandId?: string } }
  | { type: 'ACKNOWLEDGE_PATIENT_PLAN'; payload?: { commandId?: string } }
  | { type: 'LOAD_CHECKPOINT'; payload: WorkflowState['currentCheckpoint'] }
  | { type: 'SET_PERSPECTIVE'; payload: Perspective }
  | { type: 'RESET_WORKFLOW' }
  | { type: 'SET_STAFF_ROUTE'; payload: WorkflowState['staffRoute'] };

const commandApplied = (state: WorkflowState, commandId: string) => state.appliedCommandIds.includes(commandId);
const withCommand = (state: WorkflowState, commandId: string) => [...state.appliedCommandIds, commandId];

export const isClinicalDispositionComplete = (state: WorkflowState) => {
  const clinical = state.tasks.find((task) => task.type === 'CLINICAL_REVIEW');
  return Boolean(
    clinical?.clinicalDetails?.dispositionRecordedAt &&
    clinical.clinicalDetails.followUpBlocking === false,
  );
};

export const isCurrentTransportPlanComplete = (state: WorkflowState) => {
  const transport = state.tasks.find((task) => task.type === 'TRANSPORTATION_NAVIGATION');
  const details = transport?.transportDetails;
  return Boolean(
    transport?.status === 'RESOLVED' && details && !details.planFailed &&
    details.dispatchStatus === 'CONFIRMED' && details.confirmedPickupTime &&
    details.returnArrangement && details.logisticsContact && details.backupPlan,
  );
};

export const getCurrentPlanVersion = (state: WorkflowState) =>
  state.tasks.find((task) => task.type === 'TRANSPORTATION_NAVIGATION')?.transportDetails?.planVersion ?? 1;

export const isContinuityPlanConfirmed = (state: WorkflowState) =>
  isClinicalDispositionComplete(state) &&
  isCurrentTransportPlanComplete(state) &&
  state.patientAcknowledgedPlanVersion === getCurrentPlanVersion(state);

const readinessFor = (state: WorkflowState): WorkflowState['overallReadiness'] => {
  if (isContinuityPlanConfirmed(state)) return 'PLAN_CONFIRMED';
  if (state.readinessCheckCompleted) return state.tasks.some((task) => task.status === 'ASSIGNED') ? 'AT_RISK' : 'IN_PROGRESS';
  return 'ACTION_REQUIRED';
};

const addEvent = (state: WorkflowState, event: AuditEvent) =>
  state.auditEvents.some((existing) => existing.id === event.id) ? state.auditEvents : [...state.auditEvents, event];

const isRoleMutationAllowed = (state: WorkflowState, role: 'CARE_NAVIGATOR' | 'CARE_TEAM') =>
  state.currentPerspective === role || state.currentPerspective === 'LANDING';

const normalizePerspective = (perspective: Perspective): Perspective =>
  perspective === 'STAFF' || perspective === 'SYSTEM' ? 'CARE_TEAM' : perspective;

const canOpenRoute = (perspective: Perspective, route: WorkflowState['staffRoute']) => {
  if (perspective === 'CARE_NAVIGATOR') return ['COMMAND_CENTER', 'EXCEPTIONS', 'PATIENTS', 'CASE_WORKSPACE', 'RESOURCES', 'INTEGRATIONS'].includes(route);
  if (perspective === 'CARE_TEAM') return ['COMMAND_CENTER', 'EXCEPTIONS', 'PATIENTS', 'CASE_WORKSPACE', 'INSIGHTS', 'INTEGRATIONS', 'ADMIN'].includes(route);
  return false;
};

export function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case 'SUBMIT_READINESS': {
      const sourceEventId = action.payload.sourceEventId ?? SOURCE_REPLY_ID;
      const commandId = action.payload.commandId ?? 'cmd-open-split-work-v1';
      if (state.processedSourceEventIds.includes(sourceEventId) || commandApplied(state, commandId)) return state;
      const clinicalText = action.payload.clinicalConcernText.trim();
      const transportText = action.payload.transportNotes.trim();
      if (!clinicalText || !transportText) return state;
      const now = 'Sep 24, 2026 • 10:12 AM CT';
      const tasks: Task[] = [
        {
          id: 'TSK-CLN-CAMILA-01', type: 'CLINICAL_REVIEW', title: 'Clinical contact and human disposition', patientId: state.patient.id,
          status: 'ASSIGNED', priority: 'HIGH', owner: { id: 'STAFF-RN-01', name: 'Sarah Jenkins, RN', role: 'Oncology Triage Nurse', department: 'Benson Cancer Center Triage', badge: 'RN-8841', avatarUrl: avatarData('SJ', '#0284c7') },
          createdAt: now, dueTime: 'Sep 24, 10:42 AM CT', nextAction: 'Contact Camila and record a human disposition', waitingReason: 'Patient contact',
          clinicalDetails: { verbatimReport: clinicalText, clearanceState: 'PENDING_REVIEW' },
        },
        {
          id: 'TSK-TRN-CAMILA-01', type: 'TRANSPORTATION_NAVIGATION', title: 'Transportation recovery', patientId: state.patient.id,
          status: 'ASSIGNED', priority: 'HIGH', owner: { id: 'STAFF-NAV-02', name: 'Marcus Vance, MSW', role: 'Oncology Patient Navigator', department: 'Supportive Care Services', badge: 'NAV-3312', avatarUrl: avatarData('MV', '#0d9488') },
          createdAt: now, dueTime: 'Sep 24, 11:12 AM CT', nextAction: 'Recover outbound and return plan with a backup', waitingReason: 'Current transport plan',
          transportDetails: { pickupAddress: state.patient.address, destination: state.appointment.location, requestedTime: 'Sep 25, 8:15–8:30 AM CT pickup • 9:15 AM planned arrival', dispatchStatus: 'UNASSIGNED', vehicleType: 'Assisted medical transport', planVersion: 1, planFailed: false },
        },
      ];
      let next: WorkflowState = {
        ...state, readinessCheckCompleted: true, tasks, currentCheckpoint: 'SPLIT_WORK',
        processedSourceEventIds: [...state.processedSourceEventIds, sourceEventId], appliedCommandIds: withCommand(state, commandId),
        readinessSubmission: { hasTransportIssue: true, transportNotes: transportText, hasClinicalConcern: true, clinicalConcernText: clinicalText, submittedAt: now },
      };
      next = { ...next, auditEvents: addEvent(next, { id: 'EVT-FLOW-REPLY', timestamp: now, actor: state.patient.name, actorRole: 'PATIENT', action: 'Prepared reply received', description: `Verbatim reply preserved for staff: “${clinicalText}”`, stateDiff: { field: 'splitWork', from: 'closed', to: 'opened' } }) };
      next = { ...next, auditEvents: addEvent(next, { id: 'EVT-FLOW-SPLIT', timestamp: now, actor: 'OncoReady Continuity Engine', actorRole: 'SYSTEM', action: 'Clinical and transportation work opened', description: 'One nurse contact task and one transportation recovery task were assigned from the same prepared reply.' }) };
      return { ...next, overallReadiness: readinessFor(next) };
    }
    case 'ACKNOWLEDGE_CLINICAL_TASK': {
      if (!isRoleMutationAllowed(state, 'CARE_TEAM')) return state;
      const commandId = action.payload?.commandId ?? 'cmd-ack-clinical-v1';
      const task = state.tasks.find((item) => item.type === 'CLINICAL_REVIEW');
      if (!task || task.status !== 'ASSIGNED' || commandApplied(state, commandId)) return state;
      const now = 'Sep 24, 2026 • 10:18 AM CT';
      let next: WorkflowState = { ...state, appliedCommandIds: withCommand(state, commandId), tasks: state.tasks.map((item) => item.type === 'CLINICAL_REVIEW' ? { ...item, status: 'ACKNOWLEDGED', nextAction: 'Contact Camila and record a human disposition', waitingReason: 'Patient contact', clinicalDetails: { ...item.clinicalDetails!, ownershipAcknowledgedAt: now, acknowledgedAt: now, reviewedBy: 'Sarah Jenkins, RN' } } : item) };
      next = { ...next, auditEvents: addEvent(next, { id: 'EVT-FLOW-CLINICAL-OWNED', timestamp: now, actor: 'Sarah Jenkins, RN', actorRole: 'TRIAGE_NURSE', action: 'Clinical ownership accepted', description: 'Ownership was accepted. Human contact and disposition remain open.', stateDiff: { field: 'clinical.status', from: 'ASSIGNED', to: 'ACKNOWLEDGED' } }) };
      return { ...next, overallReadiness: readinessFor(next) };
    }
    case 'RECORD_CLINICAL_DISPOSITION': {
      if (!isRoleMutationAllowed(state, 'CARE_TEAM')) return state;
      const commandId = action.payload.commandId ?? `cmd-disposition-${action.payload.followUpBlocking ? 'blocking' : 'nonblocking'}-v1`;
      const task = state.tasks.find((item) => item.type === 'CLINICAL_REVIEW');
      if (!task || task.status !== 'ACKNOWLEDGED' || !action.payload.disposition.trim() || commandApplied(state, commandId)) return state;
      const now = 'Sep 24, 2026 • 10:28 AM CT';
      const status: Task['status'] = action.payload.followUpBlocking ? 'ACKNOWLEDGED' : 'RESOLVED';
      let next: WorkflowState = { ...state, appliedCommandIds: withCommand(state, commandId), tasks: state.tasks.map((item) => item.type === 'CLINICAL_REVIEW' ? { ...item, status, nextAction: action.payload.followUpBlocking ? 'Complete the recorded human follow-up' : 'No further clinical workflow action', waitingReason: action.payload.followUpBlocking ? 'Human clinical follow-up' : 'Nothing outstanding', clinicalDetails: { ...item.clinicalDetails!, clearanceState: 'REVIEWED_AND_ACKNOWLEDGED', disposition: action.payload.disposition.trim(), dispositionRecordedAt: now, followUpBlocking: action.payload.followUpBlocking, nurseNotes: action.payload.disposition.trim(), reviewedBy: 'Sarah Jenkins, RN' } } : item) };
      next = { ...next, auditEvents: addEvent(next, { id: `EVT-FLOW-DISPOSITION-${action.payload.followUpBlocking ? 'BLOCKING' : 'NONBLOCKING'}`, timestamp: now, actor: 'Sarah Jenkins, RN', actorRole: 'TRIAGE_NURSE', action: 'Human disposition recorded', description: action.payload.followUpBlocking ? 'Patient contact was recorded; human follow-up remains blocking.' : 'Patient contact was recorded with no blocking follow-up.', stateDiff: { field: 'clinical.followUpBlocking', from: 'unknown', to: String(action.payload.followUpBlocking) } }) };
      return { ...next, overallReadiness: readinessFor(next) };
    }
    case 'CONFIRM_TRANSPORTATION': {
      if (!isRoleMutationAllowed(state, 'CARE_NAVIGATOR')) return state;
      const planVersion = getCurrentPlanVersion(state);
      const commandId = action.payload?.commandId ?? `cmd-complete-transport-v${planVersion}`;
      const task = state.tasks.find((item) => item.type === 'TRANSPORTATION_NAVIGATION');
      if (!task || commandApplied(state, commandId)) return state;
      const now = planVersion === 1 ? 'Sep 24, 2026 • 10:36 AM CT' : 'Sep 24, 2026 • 10:52 AM CT';
      let next: WorkflowState = { ...state, appliedCommandIds: withCommand(state, commandId), tasks: state.tasks.map((item) => item.type === 'TRANSPORTATION_NAVIGATION' ? { ...item, status: 'RESOLVED', nextAction: 'Monitor the current plan', waitingReason: 'Nothing outstanding', transportDetails: { ...item.transportDetails!, dispatchStatus: 'CONFIRMED', planFailed: false, vehicleId: action.payload?.vehicleId ?? 'CareLink Vehicle #402', driverName: action.payload?.driverName ?? 'Jerome Davis', confirmedPickupTime: action.payload?.pickupTime ?? 'Sep 25, 8:15–8:30 AM CT pickup • 9:15 AM planned arrival', returnArrangement: action.payload?.returnArrangement ?? 'Return coordination 1:00–4:00 PM CT', logisticsContact: action.payload?.logisticsContact ?? 'CareLink Dispatch • (504) 555-0124', backupPlan: action.payload?.backupPlan ?? 'Ana Hernandez is the named backup owner', dispatchedBy: 'Marcus Vance, MSW' } } : item) };
      next = { ...next, auditEvents: addEvent(next, { id: `EVT-FLOW-TRANSPORT-V${planVersion}`, timestamp: now, actor: 'Marcus Vance, MSW', actorRole: 'NAVIGATOR', action: `Current transport plan v${planVersion} completed`, description: 'Outbound, return, logistics contact, and backup arrangements are recorded.', stateDiff: { field: 'transport.status', from: 'ASSIGNED', to: 'RESOLVED' } }) };
      return { ...next, overallReadiness: readinessFor(next), currentCheckpoint: planVersion > 1 ? 'RECOVERED_PLAN' : next.currentCheckpoint };
    }
    case 'FAIL_TRANSPORTATION': {
      if (!isRoleMutationAllowed(state, 'CARE_NAVIGATOR')) return state;
      const currentVersion = getCurrentPlanVersion(state);
      const commandId = action.payload?.commandId ?? `cmd-fail-transport-v${currentVersion}`;
      const task = state.tasks.find((item) => item.type === 'TRANSPORTATION_NAVIGATION');
      if (!task || task.transportDetails?.planFailed || commandApplied(state, commandId)) return state;
      const nextVersion = currentVersion + 1;
      const now = 'Sep 24, 2026 • 10:46 AM CT';
      let next: WorkflowState = { ...state, patientAcknowledged: false, patientAcknowledgedPlanVersion: null, currentCheckpoint: 'FAILED_RIDE', appliedCommandIds: withCommand(state, commandId), tasks: state.tasks.map((item) => item.type === 'TRANSPORTATION_NAVIGATION' ? { ...item, status: 'ASSIGNED', nextAction: 'Recover outbound and return plan with a backup', waitingReason: `Current transport plan v${nextVersion}`, transportDetails: { ...item.transportDetails!, planVersion: nextVersion, planFailed: true, dispatchStatus: 'UNASSIGNED', vehicleId: undefined, driverName: undefined, confirmedPickupTime: undefined, returnArrangement: undefined, logisticsContact: undefined, backupPlan: undefined } } : item) };
      next = { ...next, auditEvents: addEvent(next, { id: `EVT-FLOW-TRANSPORT-FAILED-V${currentVersion}`, timestamp: now, actor: 'Marcus Vance, MSW', actorRole: 'NAVIGATOR', action: `Transport plan v${currentVersion} failed`, description: `Plan v${nextVersion} is now current; the prior patient acknowledgment is expired.`, stateDiff: { field: 'transport.planVersion', from: String(currentVersion), to: String(nextVersion) } }) };
      return { ...next, overallReadiness: readinessFor(next) };
    }
    case 'ACKNOWLEDGE_PATIENT_PLAN': {
      const version = getCurrentPlanVersion(state);
      const commandId = action.payload?.commandId ?? `cmd-patient-ack-v${version}`;
      if (!isClinicalDispositionComplete(state) || !isCurrentTransportPlanComplete(state) || state.patientAcknowledgedPlanVersion === version || commandApplied(state, commandId)) return state;
      const now = 'Sep 24, 2026 • 11:02 AM CT';
      let next: WorkflowState = { ...state, patientAcknowledged: true, patientAcknowledgedPlanVersion: version, currentCheckpoint: 'FINAL_CONFIRMATION', appliedCommandIds: withCommand(state, commandId) };
      next = { ...next, auditEvents: addEvent(next, { id: `EVT-FLOW-PATIENT-ACK-V${version}`, timestamp: now, actor: state.patient.name, actorRole: 'PATIENT', action: `Current transport plan v${version} acknowledged`, description: 'Camila acknowledged the current coordination plan. Treatment attendance remains unknown.', stateDiff: { field: 'continuityPlan', from: 'open', to: 'confirmed' } }) };
      return { ...next, overallReadiness: readinessFor(next) };
    }
    case 'LOAD_CHECKPOINT':
      if (state.currentPerspective !== 'CARE_TEAM' && state.currentPerspective !== 'LANDING') return state;
      return buildCheckpoint(action.payload, state.currentPerspective, state.staffRoute);
    case 'SET_PERSPECTIVE':
      return { ...state, currentPerspective: action.payload === 'SIGN_IN' ? 'LANDING' : normalizePerspective(action.payload) };
    case 'SET_STAFF_ROUTE':
      if (!canOpenRoute(state.currentPerspective, action.payload)) return state;
      return { ...state, staffRoute: action.payload };
    case 'RESET_WORKFLOW':
      if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
      return { ...INITIAL_STATE };
    default:
      return state;
  }
}

export function buildCheckpoint(checkpoint: WorkflowState['currentCheckpoint'], perspective: Perspective = 'LANDING', staffRoute: WorkflowState['staffRoute'] = 'COMMAND_CENTER'): WorkflowState {
  let state: WorkflowState = { ...INITIAL_STATE, currentPerspective: normalizePerspective(perspective), staffRoute, currentCheckpoint: checkpoint === 'CONTEXT_INSIGHTS' ? checkpoint : 'START' };
  if (checkpoint === 'START' || checkpoint === 'CONTEXT_INSIGHTS') return state;
  state = workflowReducer(state, { type: 'SUBMIT_READINESS', payload: { transportNotes: 'Ride cancelled; transportation recovery needed.', clinicalConcernText: PREPARED_REPLY } });
  if (checkpoint === 'SPLIT_WORK') return { ...state, currentCheckpoint: checkpoint };
  state = workflowReducer(state, { type: 'ACKNOWLEDGE_CLINICAL_TASK' });
  state = workflowReducer(state, { type: 'RECORD_CLINICAL_DISPOSITION', payload: { disposition: 'Human contact completed; no blocking follow-up recorded.', followUpBlocking: false } });
  state = workflowReducer(state, { type: 'CONFIRM_TRANSPORTATION' });
  state = workflowReducer(state, { type: 'ACKNOWLEDGE_PATIENT_PLAN' });
  state = workflowReducer(state, { type: 'FAIL_TRANSPORTATION' });
  if (checkpoint === 'FAILED_RIDE') return { ...state, currentCheckpoint: checkpoint };
  state = workflowReducer(state, { type: 'CONFIRM_TRANSPORTATION' });
  if (checkpoint === 'RECOVERED_PLAN') return { ...state, currentCheckpoint: checkpoint };
  state = workflowReducer(state, { type: 'ACKNOWLEDGE_PATIENT_PLAN' });
  return { ...state, currentCheckpoint: 'FINAL_CONFIRMATION' };
}

export function deriveCaregiverProjection(state: WorkflowState): CaregiverProjection {
  const task = state.tasks.find((item) => item.type === 'TRANSPORTATION_NAVIGATION');
  const details = task?.transportDetails;
  const complete = isCurrentTransportPlanComplete(state);
  return {
    patientName: state.patient.name, appointmentTime: state.appointment.scheduledTime, appointmentLocation: state.appointment.location,
    treatmentName: state.appointment.treatmentName, transportConfirmed: complete,
    transportInfo: complete && details ? { pickupTime: details.confirmedPickupTime!, pickupAddress: details.pickupAddress, destination: details.destination, vehicleId: details.vehicleId!, driverName: details.driverName!, status: `Current plan v${details.planVersion}` } : undefined,
    overallReadiness: readinessFor(state),
    privacyBoundaryNotice: 'This transportation-only view excludes Camila’s clinical concern, nurse notes, and human disposition.',
  };
}

export function loadSavedWorkflowState(): WorkflowState {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return INITIAL_STATE;
      const parsed: unknown = JSON.parse(raw);
      if (isSavedWorkflowState(parsed)) {
        const currentPerspective = parsed.currentPerspective === 'SIGN_IN' ? 'LANDING' : normalizePerspective(parsed.currentPerspective);
        return { ...parsed, overallReadiness: readinessFor(parsed), currentPerspective };
      }
    }
  } catch { /* fall through to canonical fixture */ }
  return INITIAL_STATE;
}

type UnknownRecord = Record<string, unknown>;
const isRecord = (value: unknown): value is UnknownRecord => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const hasStrings = (value: UnknownRecord, keys: string[]) => keys.every((key) => typeof value[key] === 'string');
const optionalString = (value: unknown) => value === undefined || typeof value === 'string';
const uniqueStrings = (value: unknown) => Array.isArray(value) && value.every((item) => typeof item === 'string') && new Set(value).size === value.length;
const uniqueIds = (value: unknown[]) => value.every(isRecord) && new Set(value.map((item) => item.id)).size === value.length;

const isPatient = (value: unknown) => isRecord(value) && value.id === INITIAL_STATE.patient.id && value.name === INITIAL_STATE.patient.name && value.mrn === INITIAL_STATE.patient.mrn &&
  hasStrings(value, ['gender','diagnosis','stage','oncologist','phone','address','avatarUrl','bodySurfaceArea']) && typeof value.age === 'number' && typeof value.ecogStatus === 'number';
const isCaregiver = (value: unknown) => isRecord(value) && value.id === INITIAL_STATE.caregiver.id && value.name === INITIAL_STATE.caregiver.name && value.permissionScope === 'TRANSPORTATION_ONLY' && hasStrings(value, ['relationship','phone','authorizedBy','avatarUrl']);
const isDrug = (value: unknown) => isRecord(value) && hasStrings(value, ['name','dosage','route','schedule','indication']);
const isAppointment = (value: unknown) => isRecord(value) && value.id === INITIAL_STATE.appointment.id && hasStrings(value, ['protocol','treatmentName','scheduledTime','location','room','infusionChair','infusionDuration','oncologist','oncologistAvatar','nurseTeam']) && typeof value.cycleNumber === 'number' && typeof value.totalCycles === 'number' && Array.isArray(value.drugs) && value.drugs.every(isDrug) && Array.isArray(value.premeds) && value.premeds.every((item) => typeof item === 'string');
const isLab = (value: unknown) => isRecord(value) && hasStrings(value, ['name','value','unit','referenceRange','collectedAt']) && ['NORMAL','EVALUATED','CRITICAL'].includes(String(value.status));
const isVital = (value: unknown) => isRecord(value) && hasStrings(value, ['name','value','unit','collectedAt']) && ['NORMAL','ATTENTION'].includes(String(value.status));
const isSubmission = (value: unknown) => isRecord(value) && typeof value.hasTransportIssue === 'boolean' && typeof value.transportNotes === 'string' && typeof value.hasClinicalConcern === 'boolean' && typeof value.clinicalConcernText === 'string' && (value.submittedAt === null || typeof value.submittedAt === 'string');
const isOwner = (value: unknown) => isRecord(value) && hasStrings(value, ['id','name','role','department','badge','avatarUrl']);
const isClinicalDetails = (value: unknown) => isRecord(value) && typeof value.verbatimReport === 'string' && ['PENDING_REVIEW','REVIEWED_AND_ACKNOWLEDGED'].includes(String(value.clearanceState)) && ['nurseNotes','ownershipAcknowledgedAt','disposition','dispositionRecordedAt','acknowledgedAt','reviewedBy'].every((key) => optionalString(value[key])) && (value.followUpBlocking === undefined || typeof value.followUpBlocking === 'boolean');
const isTransportDetails = (value: unknown) => isRecord(value) && hasStrings(value, ['pickupAddress','destination','requestedTime','vehicleType']) && ['UNASSIGNED','DISPATCH_IN_PROGRESS','CONFIRMED'].includes(String(value.dispatchStatus)) && typeof value.planVersion === 'number' && value.planVersion >= 1 && typeof value.planFailed === 'boolean' && ['vehicleId','driverName','confirmedPickupTime','dispatchedBy','returnArrangement','logisticsContact','backupPlan'].every((key) => optionalString(value[key]));
const isTask = (value: unknown) => {
  if (!isRecord(value) || !hasStrings(value, ['id','title','patientId','createdAt','dueTime','nextAction','waitingReason']) || !['CLINICAL_REVIEW','TRANSPORTATION_NAVIGATION'].includes(String(value.type)) || !['DETECTED','ASSIGNED','ACKNOWLEDGED','ACTIONED','CONFIRMED','RESOLVED'].includes(String(value.status)) || !['CRITICAL','HIGH','MEDIUM','ROUTINE'].includes(String(value.priority)) || !isOwner(value.owner)) return false;
  return value.type === 'CLINICAL_REVIEW' ? isClinicalDetails(value.clinicalDetails) && value.transportDetails === undefined : isTransportDetails(value.transportDetails) && value.clinicalDetails === undefined;
};
const isAuditEvent = (value: unknown) => isRecord(value) && hasStrings(value, ['id','timestamp','actor','action','description']) && ['PATIENT','SYSTEM','TRIAGE_NURSE','NAVIGATOR','CAREGIVER'].includes(String(value.actorRole)) && (value.stateDiff === undefined || (isRecord(value.stateDiff) && hasStrings(value.stateDiff, ['field','from','to'])));
const isContextualCase = (value: unknown) => isRecord(value) && hasStrings(value, ['id','patientName','mrn','diagnosis','protocol','appointmentTime','blockerType','ownerName','ownerRole','avatarUrl']) && ['PENDING','IN_REVIEW'].includes(String(value.status)) && ['CRITICAL','HIGH','MEDIUM','ROUTINE'].includes(String(value.priority));

function isSavedWorkflowState(value: unknown): value is WorkflowState {
  if (!isRecord(value) || value.version !== 5 || value.scenarioId !== 'camila-demo-v2' || value.isSimulated !== true || value.attendanceStatus !== 'UNKNOWN') return false;
  if (!['LANDING','TRUST','SIGN_IN','PATIENT','CAREGIVER','CARE_NAVIGATOR','CARE_TEAM','STAFF','SYSTEM'].includes(String(value.currentPerspective)) || !['COMMAND_CENTER','EXCEPTIONS','PATIENTS','CASE_WORKSPACE','RESOURCES','INSIGHTS','INTEGRATIONS','ADMIN'].includes(String(value.staffRoute)) || !['ACTION_REQUIRED','AT_RISK','IN_PROGRESS','PLAN_CONFIRMED'].includes(String(value.overallReadiness)) || !['START','CONTEXT_INSIGHTS','SPLIT_WORK','FAILED_RIDE','RECOVERED_PLAN','FINAL_CONFIRMATION'].includes(String(value.currentCheckpoint))) return false;
  if (typeof value.readinessCheckCompleted !== 'boolean' || typeof value.patientAcknowledged !== 'boolean' || (value.patientAcknowledgedPlanVersion !== null && typeof value.patientAcknowledgedPlanVersion !== 'number')) return false;
  if (!isPatient(value.patient) || !isCaregiver(value.caregiver) || !isAppointment(value.appointment) || !isSubmission(value.readinessSubmission)) return false;
  if (!Array.isArray(value.labs) || !value.labs.every(isLab) || !Array.isArray(value.vitals) || !value.vitals.every(isVital) || !Array.isArray(value.contextualCases) || !value.contextualCases.every(isContextualCase)) return false;
  if (!Array.isArray(value.tasks) || !value.tasks.every(isTask) || !uniqueIds(value.tasks) || !Array.isArray(value.auditEvents) || !value.auditEvents.every(isAuditEvent) || !uniqueIds(value.auditEvents) || !uniqueStrings(value.appliedCommandIds) || !uniqueStrings(value.processedSourceEventIds)) return false;
  const state = value as unknown as WorkflowState;
  const version = getCurrentPlanVersion(state);
  if (state.patientAcknowledged !== (state.patientAcknowledgedPlanVersion !== null) || (state.patientAcknowledgedPlanVersion !== null && state.patientAcknowledgedPlanVersion !== version)) return false;
  const derived = isContinuityPlanConfirmed(state);
  if ((state.overallReadiness === 'PLAN_CONFIRMED') !== derived || state.overallReadiness !== readinessFor(state)) return false;
  return true;
}

export function saveWorkflowState(state: WorkflowState) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* local persistence is best effort */ }
}
