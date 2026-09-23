import { 
  WorkflowState, 
  Task, 
  AuditEvent, 
  Perspective, 
  CaregiverProjection,
  RideAssignment,
} from '../types';
import { PREPARED_OUTREACH_EVENTS, PREPARED_REPLY } from '../data/preparedOutreach';
export { PREPARED_REPLY } from '../data/preparedOutreach';

const STORAGE_KEY = 'oncoready_workflow_state_v4';
const avatarData = (initials: string, color: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" rx="24" fill="${color}"/><text x="64" y="74" text-anchor="middle" font-family="Arial,sans-serif" font-size="42" font-weight="700" fill="white">${initials}</text></svg>`)}`;

export const HISTORICAL_RIDE_EVENTS = [
  { id: 'RIDE-HIST-REQUESTED', status: 'Requested', timestamp: 'Sep 11, 2026 • 7:42 AM CT', detail: 'Previous ride requested.' },
  { id: 'RIDE-HIST-ACCEPTED', status: 'Accepted', timestamp: 'Sep 11, 2026 • 7:43 AM CT', detail: 'CareLink provider accepted the trip.' },
  { id: 'RIDE-HIST-DRIVER', status: 'Driver assigned', timestamp: 'Sep 11, 2026 • 7:47 AM CT', detail: 'Driver Ellis Morgan assigned to vehicle CL-218.' },
  { id: 'RIDE-HIST-ARRIVING', status: 'Arriving', timestamp: 'Sep 11, 2026 • 8:02 AM CT', detail: 'Driver arriving at pickup.' },
  { id: 'RIDE-HIST-PICKUP', status: 'Pickup confirmed', timestamp: 'Sep 11, 2026 • 8:18 AM CT', detail: 'Pickup confirmed.' },
  { id: 'RIDE-HIST-COMPLETE', status: 'Completed', timestamp: 'Sep 11, 2026 • 9:06 AM CT', detail: 'Trip completed.' },
] as const;

export const INITIAL_STATE: WorkflowState = {
  version: 6,
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
  ride: {
    currentTripId: 'carelink-current-2026-09-25',
    currentStatus: 'OPEN',
    assignments: [],
    caregiverSeen: null,
    replay: {
      tripId: 'carelink-prior-001',
      status: 'IDLE',
      visibleEventCount: 0,
      sessionToken: 0,
    },
  },
  
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

  auditEvents: [...PREPARED_OUTREACH_EVENTS],

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

const SOURCE_REPLY_ID = 'source-prepared-reply-2026-09-24T10:12:00-05:00';

export type WorkflowAction =
  | { type: 'SUBMIT_READINESS'; payload: { transportNotes: string; clinicalConcernText: string; sourceEventId?: string; commandId?: string } }
  | { type: 'ACKNOWLEDGE_CLINICAL_TASK'; payload?: { commandId?: string; nurseNotes?: string } }
  | { type: 'RECORD_CLINICAL_DISPOSITION'; payload: { disposition: string; followUpBlocking: boolean; commandId?: string } }
  | { type: 'CONFIRM_TRANSPORTATION'; payload?: { vehicleId?: string; driverName?: string; pickupTime?: string; returnArrangement?: string; logisticsContact?: string; backupPlan?: string; commandId?: string } }
  | { type: 'FAIL_TRANSPORTATION'; payload?: { commandId?: string } }
  | { type: 'REQUEST_CURRENT_RIDE' }
  | { type: 'ASSIGN_PRIMARY_RIDE' }
  | { type: 'FAIL_PRIMARY_RIDE' }
  | { type: 'ASSIGN_BACKUP_RIDE' }
  | { type: 'SAVE_RECOVERED_RIDE'; payload: { pickupTime: string; plannedArrival: string; returnArrangement: string; logisticsContact: string; backupOwner: string } }
  | { type: 'MARK_NO_RIDE_OPTION' }
  | { type: 'FAIL_CURRENT_RIDE' }
  | { type: 'MARK_CURRENT_LOGISTICS_SEEN' }
  | { type: 'PLAY_HISTORICAL_RIDE' }
  | { type: 'PAUSE_HISTORICAL_RIDE' }
  | { type: 'RESTART_HISTORICAL_RIDE' }
  | { type: 'EXIT_HISTORICAL_RIDE' }
  | { type: 'ADVANCE_HISTORICAL_RIDE'; payload: { tripId: 'carelink-prior-001'; sessionToken: number } }
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
    details.plannedArrival && details.returnArrangement && details.logisticsContact &&
    details.backupPlan && details.backupOwner,
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
  state.currentPerspective === role ||
  state.currentPerspective === 'LANDING' ||
  (role === 'CARE_NAVIGATOR' && state.currentPerspective === 'TRANSPORTATION');

const normalizePerspective = (perspective: Perspective): Perspective =>
  perspective === 'STAFF' || perspective === 'SYSTEM' ? 'CARE_TEAM' : perspective;

const canOpenRoute = (perspective: Perspective, route: WorkflowState['staffRoute']) => {
  if (perspective === 'CARE_NAVIGATOR') return ['COMMAND_CENTER', 'EXCEPTIONS', 'PATIENTS', 'CASE_WORKSPACE', 'RESOURCES', 'INTEGRATIONS'].includes(route);
  if (perspective === 'CARE_TEAM') return ['COMMAND_CENTER', 'EXCEPTIONS', 'PATIENTS', 'CASE_WORKSPACE', 'INSIGHTS', 'INTEGRATIONS', 'ADMIN'].includes(route);
  return false;
};

const failCurrentRidePlan = (
  state: WorkflowState,
  eventId: string,
  timestamp: string,
  action: string,
): WorkflowState => {
  const currentVersion = getCurrentPlanVersion(state);
  const nextVersion = currentVersion + 1;
  const assignments = state.ride.assignments.map((assignment): RideAssignment =>
    assignment.status === 'CURRENT'
      ? { ...assignment, status: 'FAILED', failedAt: timestamp }
      : assignment,
  );
  let next: WorkflowState = {
    ...state,
    patientAcknowledged: false,
    patientAcknowledgedPlanVersion: null,
    currentCheckpoint: 'FAILED_RIDE',
    ride: {
      ...state.ride,
      currentStatus: 'PRIMARY_FAILED',
      assignments,
      caregiverSeen: null,
    },
    tasks: state.tasks.map((item) => item.type === 'TRANSPORTATION_NAVIGATION'
      ? {
        ...item,
        status: 'ASSIGNED',
        nextAction: 'Recover outbound and return plan with a backup',
        waitingReason: `Current transport plan v${nextVersion}`,
        transportDetails: {
          ...item.transportDetails!,
          planVersion: nextVersion,
          planFailed: true,
          dispatchStatus: 'UNASSIGNED',
          vehicleId: undefined,
          driverName: undefined,
          confirmedPickupTime: undefined,
          plannedArrival: undefined,
          returnArrangement: undefined,
          logisticsContact: undefined,
          backupPlan: undefined,
          backupOwner: undefined,
          dispatchedBy: undefined,
        },
      }
      : item),
  };
  next = {
    ...next,
    auditEvents: addEvent(next, {
      id: eventId,
      timestamp,
      actor: 'Marcus Vance, MSW',
      actorRole: 'NAVIGATOR',
      action,
      description: `Current plan v${nextVersion} is open; earlier assignment and acknowledgment evidence remain in history.`,
      stateDiff: { field: 'transport.planVersion', from: String(currentVersion), to: String(nextVersion) },
    }),
  };
  return { ...next, overallReadiness: readinessFor(next) };
};

const hasCompleteLogistics = (payload: {
  pickupTime: string;
  plannedArrival: string;
  returnArrangement: string;
  logisticsContact: string;
  backupOwner: string;
}) => Object.values(payload).every((value) => value.trim().length > 0);

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
      next = { ...next, auditEvents: addEvent(next, { id: 'EVT-FLOW-REPLY', timestamp: now, actor: state.patient.name, actorRole: 'PATIENT', action: 'Patient reply received', description: `Verbatim reply preserved for staff: “${clinicalText}”`, stateDiff: { field: 'splitWork', from: 'closed', to: 'opened' } }) };
      next = { ...next, auditEvents: addEvent(next, { id: 'EVT-FLOW-SPLIT', timestamp: now, actor: 'OncoReady Continuity Engine', actorRole: 'SYSTEM', action: 'Clinical and transportation work opened', description: 'One nurse contact task and one transportation recovery task were assigned from the same patient reply.' }) };
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
      const payload = action.payload;
      if (!payload?.pickupTime || !payload.returnArrangement || !payload.logisticsContact || !payload.backupPlan) return state;
      return workflowReducer(state, {
        type: 'SAVE_RECOVERED_RIDE',
        payload: {
          pickupTime: payload.pickupTime,
          plannedArrival: payload.pickupTime,
          returnArrangement: payload.returnArrangement,
          logisticsContact: payload.logisticsContact,
          backupOwner: payload.backupPlan,
        },
      });
    }
    case 'REQUEST_CURRENT_RIDE': {
      if (!isRoleMutationAllowed(state, 'CARE_NAVIGATOR')) return state;
      const task = state.tasks.find((item) => item.type === 'TRANSPORTATION_NAVIGATION');
      if (!task || state.ride.currentStatus !== 'OPEN') return state;
      let next: WorkflowState = {
        ...state,
        ride: { ...state.ride, currentStatus: 'REQUESTED' },
        tasks: state.tasks.map((item) => item.type === 'TRANSPORTATION_NAVIGATION'
          ? { ...item, nextAction: 'Assign CareLink Partner A', waitingReason: 'Provider assignment', transportDetails: { ...item.transportDetails!, dispatchStatus: 'DISPATCH_IN_PROGRESS' } }
          : item),
      };
      next = { ...next, auditEvents: addEvent(next, { id: 'EVT-RIDE-REQUESTED', timestamp: 'Sep 24, 2026 • 10:32 AM CT', actor: 'Marcus Vance, MSW', actorRole: 'NAVIGATOR', action: 'Ride requested', description: 'Current trip carelink-current-2026-09-25 opened.' }) };
      return { ...next, overallReadiness: readinessFor(next) };
    }
    case 'ASSIGN_PRIMARY_RIDE': {
      if (!isRoleMutationAllowed(state, 'CARE_NAVIGATOR') || state.ride.currentStatus !== 'REQUESTED') return state;
      const assignment: RideAssignment = {
        id: 'RIDE-ASG-PRIMARY-001',
        providerName: 'CareLink Partner A',
        providerKind: 'FICTIONAL',
        status: 'CURRENT',
        assignedAt: 'Sep 24, 2026 • 10:34 AM CT',
        driverName: 'Jordan Lee',
        vehicleId: 'CL-A-114',
      };
      let next: WorkflowState = {
        ...state,
        ride: { ...state.ride, currentStatus: 'PRIMARY_ASSIGNED', assignments: [...state.ride.assignments, assignment] },
        tasks: state.tasks.map((item) => item.type === 'TRANSPORTATION_NAVIGATION'
          ? { ...item, nextAction: 'Monitor primary assignment', waitingReason: 'CareLink Partner A', transportDetails: { ...item.transportDetails!, dispatchStatus: 'DISPATCH_IN_PROGRESS', vehicleId: assignment.vehicleId, driverName: assignment.driverName } }
          : item),
      };
      next = { ...next, auditEvents: addEvent(next, { id: 'EVT-RIDE-PRIMARY-ASSIGNED', timestamp: assignment.assignedAt, actor: 'Marcus Vance, MSW', actorRole: 'NAVIGATOR', action: 'CareLink Partner A assigned', description: 'Primary assignment RIDE-ASG-PRIMARY-001 is current.' }) };
      return next;
    }
    case 'FAIL_PRIMARY_RIDE':
      if (!isRoleMutationAllowed(state, 'CARE_NAVIGATOR') || state.ride.currentStatus !== 'PRIMARY_ASSIGNED') return state;
      return failCurrentRidePlan(state, 'EVT-RIDE-PRIMARY-FAILED', 'Sep 24, 2026 • 10:46 AM CT', 'CareLink Partner A unavailable');
    case 'ASSIGN_BACKUP_RIDE': {
      if (!isRoleMutationAllowed(state, 'CARE_NAVIGATOR') || state.ride.currentStatus !== 'PRIMARY_FAILED') return state;
      const assignment: RideAssignment = {
        id: 'RIDE-ASG-BACKUP-002',
        providerName: 'CareLink Partner B',
        providerKind: 'FICTIONAL',
        status: 'CURRENT',
        assignedAt: 'Sep 24, 2026 • 10:49 AM CT',
        driverName: 'Jerome Davis',
        vehicleId: 'CareLink Vehicle #402',
      };
      let next: WorkflowState = {
        ...state,
        ride: { ...state.ride, currentStatus: 'BACKUP_ASSIGNED', assignments: [...state.ride.assignments, assignment] },
        tasks: state.tasks.map((item) => item.type === 'TRANSPORTATION_NAVIGATION'
          ? { ...item, nextAction: 'Save required recovered logistics', waitingReason: 'Outbound, return, contact, and backup details', transportDetails: { ...item.transportDetails!, dispatchStatus: 'DISPATCH_IN_PROGRESS', vehicleId: assignment.vehicleId, driverName: assignment.driverName } }
          : item),
      };
      next = { ...next, auditEvents: addEvent(next, { id: 'EVT-RIDE-BACKUP-ASSIGNED', timestamp: assignment.assignedAt, actor: 'Marcus Vance, MSW', actorRole: 'NAVIGATOR', action: 'CareLink Partner B selected', description: 'Backup assignment RIDE-ASG-BACKUP-002 is current; the failed primary remains in history.' }) };
      return next;
    }
    case 'SAVE_RECOVERED_RIDE': {
      if (!isRoleMutationAllowed(state, 'CARE_NAVIGATOR') || state.ride.currentStatus !== 'BACKUP_ASSIGNED' || !hasCompleteLogistics(action.payload)) return state;
      const version = getCurrentPlanVersion(state);
      const now = 'Sep 24, 2026 • 10:52 AM CT';
      let next: WorkflowState = {
        ...state,
        ride: { ...state.ride, currentStatus: 'RECOVERED' },
        currentCheckpoint: 'RECOVERED_PLAN',
        tasks: state.tasks.map((item) => item.type === 'TRANSPORTATION_NAVIGATION'
          ? {
            ...item,
            status: 'RESOLVED',
            nextAction: 'Monitor the current plan',
            waitingReason: 'Nothing outstanding',
            transportDetails: {
              ...item.transportDetails!,
              dispatchStatus: 'CONFIRMED',
              planFailed: false,
              confirmedPickupTime: action.payload.pickupTime.trim(),
              plannedArrival: action.payload.plannedArrival.trim(),
              returnArrangement: action.payload.returnArrangement.trim(),
              logisticsContact: action.payload.logisticsContact.trim(),
              backupOwner: action.payload.backupOwner.trim(),
              backupPlan: `${action.payload.backupOwner.trim()} is the named backup owner`,
              dispatchedBy: 'Marcus Vance, MSW',
            },
          }
          : item),
      };
      next = { ...next, auditEvents: addEvent(next, { id: `EVT-RIDE-RECOVERED-V${version}`, timestamp: now, actor: 'Marcus Vance, MSW', actorRole: 'NAVIGATOR', action: `Current transport plan v${version} recovered`, description: 'Planned outbound, arrival, return, logistics contact, and backup owner are recorded.', stateDiff: { field: 'transport.status', from: 'ASSIGNED', to: 'RESOLVED' } }) };
      return { ...next, overallReadiness: readinessFor(next) };
    }
    case 'MARK_NO_RIDE_OPTION': {
      if (!isRoleMutationAllowed(state, 'CARE_NAVIGATOR') || state.ride.currentStatus !== 'PRIMARY_FAILED') return state;
      let next: WorkflowState = {
        ...state,
        ride: { ...state.ride, currentStatus: 'NO_OPTION' },
        tasks: state.tasks.map((item) => item.type === 'TRANSPORTATION_NAVIGATION'
          ? { ...item, status: 'ASSIGNED', nextAction: 'Escalate transportation recovery', waitingReason: 'No provider option available' }
          : item),
      };
      next = { ...next, auditEvents: addEvent(next, { id: `EVT-RIDE-NO-OPTION-V${getCurrentPlanVersion(state)}`, timestamp: 'Sep 24, 2026 • 10:49 AM CT', actor: 'Marcus Vance, MSW', actorRole: 'NAVIGATOR', action: 'No ride option available', description: 'The transportation blocker remains open and treatment stays at risk.' }) };
      return { ...next, overallReadiness: readinessFor(next) };
    }
    case 'MARK_CURRENT_LOGISTICS_SEEN': {
      if (state.currentPerspective !== 'CAREGIVER' || !isCurrentTransportPlanComplete(state)) return state;
      const version = getCurrentPlanVersion(state);
      if (state.ride.caregiverSeen?.planVersion === version) return state;
      const seen = { eventId: `EVT-RIDE-CAREGIVER-SEEN-V${version}`, actor: 'Ana Hernandez' as const, actorRole: 'CAREGIVER' as const, planVersion: version, timestamp: 'Sep 24, 2026 • 10:57 AM CT' };
      let next: WorkflowState = { ...state, ride: { ...state.ride, caregiverSeen: seen } };
      next = { ...next, auditEvents: addEvent(next, { id: seen.eventId, timestamp: seen.timestamp, actor: seen.actor, actorRole: seen.actorRole, action: `Current logistics plan v${version} seen`, description: 'Caregiver logistics visibility recorded. This does not replace patient acknowledgment or clinical clearance.' }) };
      return next;
    }
    case 'FAIL_CURRENT_RIDE':
      if (!isRoleMutationAllowed(state, 'CARE_NAVIGATOR') || state.ride.currentStatus !== 'RECOVERED') return state;
      return failCurrentRidePlan(state, `EVT-RIDE-CURRENT-FAILED-V${getCurrentPlanVersion(state)}`, 'Sep 24, 2026 • 11:08 AM CT', `Current transport plan v${getCurrentPlanVersion(state)} failed`);
    case 'FAIL_TRANSPORTATION':
      return workflowReducer(state, { type: 'FAIL_CURRENT_RIDE' });
    case 'PLAY_HISTORICAL_RIDE': {
      if (state.ride.replay.status === 'COMPLETE') return workflowReducer(state, { type: 'RESTART_HISTORICAL_RIDE' });
      const sessionToken = state.ride.replay.sessionToken + 1;
      return { ...state, ride: { ...state.ride, replay: { ...state.ride.replay, status: 'PLAYING', visibleEventCount: Math.max(1, state.ride.replay.visibleEventCount), sessionToken } } };
    }
    case 'PAUSE_HISTORICAL_RIDE':
      if (state.ride.replay.status !== 'PLAYING') return state;
      return { ...state, ride: { ...state.ride, replay: { ...state.ride.replay, status: 'PAUSED', sessionToken: state.ride.replay.sessionToken + 1 } } };
    case 'RESTART_HISTORICAL_RIDE':
      return { ...state, ride: { ...state.ride, replay: { ...state.ride.replay, status: 'PLAYING', visibleEventCount: 1, sessionToken: state.ride.replay.sessionToken + 1 } } };
    case 'EXIT_HISTORICAL_RIDE':
      return { ...state, ride: { ...state.ride, replay: { ...state.ride.replay, status: 'IDLE', visibleEventCount: 0, sessionToken: state.ride.replay.sessionToken + 1 } } };
    case 'ADVANCE_HISTORICAL_RIDE': {
      const replay = state.ride.replay;
      if (replay.status !== 'PLAYING' || action.payload.tripId !== replay.tripId || action.payload.sessionToken !== replay.sessionToken) return state;
      const visibleEventCount = Math.min(HISTORICAL_RIDE_EVENTS.length, replay.visibleEventCount + 1);
      const status = visibleEventCount === HISTORICAL_RIDE_EVENTS.length ? 'COMPLETE' as const : 'PLAYING' as const;
      return { ...state, ride: { ...state.ride, replay: { ...replay, visibleEventCount, status } } };
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
      if (state.currentPerspective !== 'CARE_TEAM' && state.currentPerspective !== 'TRANSPORTATION' && state.currentPerspective !== 'LANDING') return state;
      return buildCheckpoint(action.payload, state.currentPerspective, state.staffRoute);
    case 'SET_PERSPECTIVE':
      return { ...state, currentPerspective: normalizePerspective(action.payload) };
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
  const requestedPerspective = normalizePerspective(perspective);
  const finish = (state: WorkflowState) => ({ ...state, currentPerspective: requestedPerspective });
  let state: WorkflowState = { ...INITIAL_STATE, currentPerspective: 'LANDING', staffRoute, currentCheckpoint: checkpoint === 'CONTEXT_INSIGHTS' ? checkpoint : 'START' };
  if (checkpoint === 'START' || checkpoint === 'CONTEXT_INSIGHTS') return finish(state);
  state = workflowReducer(state, { type: 'SUBMIT_READINESS', payload: { transportNotes: 'Ride cancelled; transportation recovery needed.', clinicalConcernText: PREPARED_REPLY } });
  if (checkpoint === 'SPLIT_WORK') return finish({ ...state, currentCheckpoint: checkpoint });
  state = workflowReducer(state, { type: 'ACKNOWLEDGE_CLINICAL_TASK' });
  state = workflowReducer(state, { type: 'RECORD_CLINICAL_DISPOSITION', payload: { disposition: 'Human contact completed; no blocking follow-up recorded.', followUpBlocking: false } });
  state = workflowReducer(state, { type: 'REQUEST_CURRENT_RIDE' });
  state = workflowReducer(state, { type: 'ASSIGN_PRIMARY_RIDE' });
  state = workflowReducer(state, { type: 'FAIL_PRIMARY_RIDE' });
  if (checkpoint === 'FAILED_RIDE') return finish({ ...state, currentCheckpoint: checkpoint });
  state = workflowReducer(state, { type: 'ASSIGN_BACKUP_RIDE' });
  state = workflowReducer(state, { type: 'SAVE_RECOVERED_RIDE', payload: { pickupTime: 'Sep 25, 8:15–8:30 AM CT', plannedArrival: 'Sep 25, 9:15 AM CT', returnArrangement: 'Return coordination 1:00–4:00 PM CT', logisticsContact: 'CareLink Dispatch • (504) 555-0124', backupOwner: 'Ana Hernandez' } });
  if (checkpoint === 'RECOVERED_PLAN') return finish({ ...state, currentCheckpoint: checkpoint });
  state = workflowReducer(state, { type: 'SET_PERSPECTIVE', payload: 'CAREGIVER' });
  state = workflowReducer(state, { type: 'MARK_CURRENT_LOGISTICS_SEEN' });
  state = workflowReducer(state, { type: 'SET_PERSPECTIVE', payload: 'PATIENT' });
  state = workflowReducer(state, { type: 'ACKNOWLEDGE_PATIENT_PLAN' });
  return finish({ ...state, currentCheckpoint: 'FINAL_CONFIRMATION' });
}

export function deriveCaregiverProjection(state: WorkflowState): CaregiverProjection {
  const task = state.tasks.find((item) => item.type === 'TRANSPORTATION_NAVIGATION');
  const details = task?.transportDetails;
  const complete = isCurrentTransportPlanComplete(state);
  return {
    caregiverName: state.caregiver.name,
    caregiverRelationship: state.caregiver.relationship,
    patientName: state.patient.name,
    appointmentTime: state.appointment.scheduledTime,
    appointmentLocation: state.appointment.location,
    transportConfirmed: complete,
    currentPlan: complete && details ? {
      planVersion: details.planVersion,
      pickupTime: details.confirmedPickupTime!,
      plannedArrival: details.plannedArrival!,
      pickupAddress: details.pickupAddress,
      destination: details.destination,
      returnArrangement: details.returnArrangement!,
      logisticsContact: details.logisticsContact!,
      backupOwner: details.backupOwner!,
    } : undefined,
    seen: state.ride.caregiverSeen?.planVersion === details?.planVersion ? state.ride.caregiverSeen : null,
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
        const currentPerspective = normalizePerspective(parsed.currentPerspective);
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
const isTransportDetails = (value: unknown) => isRecord(value) && hasStrings(value, ['pickupAddress','destination','requestedTime','vehicleType']) && ['UNASSIGNED','DISPATCH_IN_PROGRESS','CONFIRMED'].includes(String(value.dispatchStatus)) && typeof value.planVersion === 'number' && value.planVersion >= 1 && typeof value.planFailed === 'boolean' && ['vehicleId','driverName','confirmedPickupTime','plannedArrival','dispatchedBy','returnArrangement','logisticsContact','backupPlan','backupOwner'].every((key) => optionalString(value[key]));
const isTask = (value: unknown) => {
  if (!isRecord(value) || !hasStrings(value, ['id','title','patientId','createdAt','dueTime','nextAction','waitingReason']) || !['CLINICAL_REVIEW','TRANSPORTATION_NAVIGATION'].includes(String(value.type)) || !['DETECTED','ASSIGNED','ACKNOWLEDGED','ACTIONED','CONFIRMED','RESOLVED'].includes(String(value.status)) || !['CRITICAL','HIGH','MEDIUM','ROUTINE'].includes(String(value.priority)) || !isOwner(value.owner)) return false;
  return value.type === 'CLINICAL_REVIEW' ? isClinicalDetails(value.clinicalDetails) && value.transportDetails === undefined : isTransportDetails(value.transportDetails) && value.clinicalDetails === undefined;
};
const isAuditEvent = (value: unknown) => isRecord(value) && hasStrings(value, ['id','timestamp','actor','action','description']) && ['PATIENT','SYSTEM','TRIAGE_NURSE','NAVIGATOR','CAREGIVER'].includes(String(value.actorRole)) && (value.stateDiff === undefined || (isRecord(value.stateDiff) && hasStrings(value.stateDiff, ['field','from','to'])));
const isContextualCase = (value: unknown) => isRecord(value) && hasStrings(value, ['id','patientName','mrn','diagnosis','protocol','appointmentTime','blockerType','ownerName','ownerRole','avatarUrl']) && ['PENDING','IN_REVIEW'].includes(String(value.status)) && ['CRITICAL','HIGH','MEDIUM','ROUTINE'].includes(String(value.priority));
const isRideAssignment = (value: unknown) => isRecord(value) && hasStrings(value, ['id','providerName','assignedAt']) && value.providerKind === 'FICTIONAL' && ['CURRENT','FAILED'].includes(String(value.status)) && ['failedAt','driverName','vehicleId'].every((key) => optionalString(value[key]));
const isCaregiverSeen = (value: unknown) => value === null || (isRecord(value) && hasStrings(value, ['eventId','actor','actorRole','timestamp']) && value.actor === 'Ana Hernandez' && value.actorRole === 'CAREGIVER' && typeof value.planVersion === 'number' && value.planVersion >= 1);
const isRideState = (value: unknown) => {
  if (!isRecord(value) || value.currentTripId !== 'carelink-current-2026-09-25' || !['OPEN','REQUESTED','PRIMARY_ASSIGNED','PRIMARY_FAILED','BACKUP_ASSIGNED','RECOVERED','NO_OPTION'].includes(String(value.currentStatus))) return false;
  if (!Array.isArray(value.assignments) || !value.assignments.every(isRideAssignment) || !uniqueIds(value.assignments) || !isCaregiverSeen(value.caregiverSeen)) return false;
  const replay = value.replay;
  if (!isRecord(replay) || replay.tripId !== 'carelink-prior-001' || !['IDLE','PLAYING','PAUSED','COMPLETE'].includes(String(replay.status)) || !Number.isInteger(replay.visibleEventCount) || Number(replay.visibleEventCount) < 0 || Number(replay.visibleEventCount) > HISTORICAL_RIDE_EVENTS.length || !Number.isInteger(replay.sessionToken) || Number(replay.sessionToken) < 0) return false;
  const currentAssignments = value.assignments.filter((assignment) => isRecord(assignment) && assignment.status === 'CURRENT').length;
  if (['OPEN','REQUESTED','PRIMARY_FAILED','NO_OPTION'].includes(String(value.currentStatus)) && currentAssignments !== 0) return false;
  if (['PRIMARY_ASSIGNED','BACKUP_ASSIGNED','RECOVERED'].includes(String(value.currentStatus)) && currentAssignments !== 1) return false;
  return true;
};

function isSavedWorkflowState(value: unknown): value is WorkflowState {
  if (!isRecord(value) || value.version !== 6 || value.scenarioId !== 'camila-demo-v2' || value.isSimulated !== true || value.attendanceStatus !== 'UNKNOWN') return false;
  if (!['LANDING','TRUST','SIGN_IN','PATIENT','CAREGIVER','CARE_NAVIGATOR','CARE_TEAM','TRANSPORTATION','STAFF','SYSTEM'].includes(String(value.currentPerspective)) || !['COMMAND_CENTER','EXCEPTIONS','PATIENTS','CASE_WORKSPACE','RESOURCES','INSIGHTS','INTEGRATIONS','ADMIN'].includes(String(value.staffRoute)) || !['ACTION_REQUIRED','AT_RISK','IN_PROGRESS','PLAN_CONFIRMED'].includes(String(value.overallReadiness)) || !['START','CONTEXT_INSIGHTS','SPLIT_WORK','FAILED_RIDE','RECOVERED_PLAN','FINAL_CONFIRMATION'].includes(String(value.currentCheckpoint))) return false;
  if (typeof value.readinessCheckCompleted !== 'boolean' || typeof value.patientAcknowledged !== 'boolean' || (value.patientAcknowledgedPlanVersion !== null && typeof value.patientAcknowledgedPlanVersion !== 'number')) return false;
  if (!isPatient(value.patient) || !isCaregiver(value.caregiver) || !isAppointment(value.appointment) || !isSubmission(value.readinessSubmission) || !isRideState(value.ride)) return false;
  if (!Array.isArray(value.labs) || !value.labs.every(isLab) || !Array.isArray(value.vitals) || !value.vitals.every(isVital) || !Array.isArray(value.contextualCases) || !value.contextualCases.every(isContextualCase)) return false;
  if (!Array.isArray(value.tasks) || !value.tasks.every(isTask) || !uniqueIds(value.tasks) || !Array.isArray(value.auditEvents) || !value.auditEvents.every(isAuditEvent) || !uniqueIds(value.auditEvents) || !uniqueStrings(value.appliedCommandIds) || !uniqueStrings(value.processedSourceEventIds)) return false;
  const state = value as unknown as WorkflowState;
  const version = getCurrentPlanVersion(state);
  if (state.patientAcknowledged !== (state.patientAcknowledgedPlanVersion !== null) || (state.patientAcknowledgedPlanVersion !== null && state.patientAcknowledgedPlanVersion !== version)) return false;
  if (state.ride.caregiverSeen !== null && (state.ride.caregiverSeen.planVersion !== version || !isCurrentTransportPlanComplete(state))) return false;
  if ((state.ride.currentStatus === 'RECOVERED') !== isCurrentTransportPlanComplete(state)) return false;
  const derived = isContinuityPlanConfirmed(state);
  if ((state.overallReadiness === 'PLAN_CONFIRMED') !== derived || state.overallReadiness !== readinessFor(state)) return false;
  return true;
}

export function saveWorkflowState(state: WorkflowState) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* local persistence is best effort */ }
}
