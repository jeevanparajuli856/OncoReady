import { 
  WorkflowState, 
  Task, 
  AuditEvent, 
  Perspective, 
  CaregiverProjection 
} from '../types';

const STORAGE_KEY = 'oncoready_workflow_state_v1';

export const INITIAL_STATE: WorkflowState = {
  version: 1,
  isSimulated: true,
  currentPerspective: 'PATIENT',
  overallReadiness: 'ACTION_REQUIRED',
  readinessCheckCompleted: false,
  patientAcknowledged: false,
  
  patient: {
    id: 'PAT-882914',
    mrn: 'OCH-882914',
    name: 'Maria Hernandez',
    age: 54,
    gender: 'Female',
    diagnosis: 'Metastatic Colorectal Cancer (Stage IV)',
    oncologist: 'Dr. Aris Thorne, MD',
    phone: '(504) 555-0182',
    address: '1420 St. Charles Ave, New Orleans, LA 70130',
  },

  caregiver: {
    id: 'CG-40912',
    name: 'Ana Hernandez',
    relationship: 'Daughter & Designated Transport Contact',
    phone: '(504) 555-0199',
    permissionScope: 'TRANSPORTATION_ONLY',
    authorizedBy: 'Maria Hernandez',
  },

  appointment: {
    id: 'APT-2026-0824',
    protocol: 'FOLFOX6 + Bevacizumab',
    cycleNumber: 4,
    treatmentName: 'Cycle 4 Infusion (Oxaliplatin / Leucovorin / 5-FU)',
    scheduledTime: 'Tomorrow, Aug 24 • 8:30 AM',
    location: 'Ochsner Benson Cancer Center, Suite B',
    room: 'Infusion Chair 14',
    infusionDuration: '4 hours (plus 46-hr ambulatory 5-FU pump)',
    oncologist: 'Dr. Aris Thorne, MD',
  },

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
      id: 'EVT-001',
      timestamp: 'Today, 06:00 AM',
      actor: 'Epic Scheduling / Ochsner EHR',
      actorRole: 'SYSTEM',
      action: 'Treatment Scheduled',
      description: 'FOLFOX6 Cycle 4 confirmed for 08/24 08:30 AM at Benson Cancer Center.',
    },
    {
      id: 'EVT-002',
      timestamp: 'Today, 07:00 AM',
      actor: 'OncoReady Continuity Engine',
      actorRole: 'SYSTEM',
      action: 'Readiness Screening Triggered',
      description: 'T-24h automated pre-infusion readiness check dispatched to patient portal.',
      stateDiff: {
        field: 'overallReadiness',
        from: 'SCHEDULED',
        to: 'ACTION_REQUIRED',
      },
    },
  ],

  contextualCases: [
    {
      id: 'CASE-002',
      patientName: 'Robert Chen',
      mrn: 'OCH-710492',
      diagnosis: 'Non-Small Cell Lung Cancer',
      protocol: 'Pembrolizumab + Pemetrexed',
      appointmentTime: 'Tomorrow 10:15 AM',
      blockerType: 'Insurance Prior-Auth Re-verification',
      ownerName: 'Sarah Jenkins, RN',
      ownerRole: 'Triage Nurse',
      status: 'IN_REVIEW',
      priority: 'MEDIUM',
    },
    {
      id: 'CASE-003',
      patientName: 'Elena Rostova',
      mrn: 'OCH-923841',
      diagnosis: 'HER2+ Breast Cancer',
      protocol: 'AC-THP (Paclitaxel + Trastuzumab)',
      appointmentTime: 'Tomorrow 01:00 PM',
      blockerType: 'Pre-hydration Lab Clearance',
      ownerName: 'Marcus Vance, MSW',
      ownerRole: 'Oncology Navigator',
      status: 'PENDING',
      priority: 'HIGH',
    },
  ],
};

export type WorkflowAction =
  | { type: 'SUBMIT_READINESS'; payload: { transportNotes: string; clinicalConcernText: string } }
  | { type: 'ACKNOWLEDGE_CLINICAL_TASK'; payload: { nurseNotes?: string } }
  | { type: 'CONFIRM_TRANSPORTATION'; payload: { vehicleId?: string; driverName?: string; pickupTime?: string } }
  | { type: 'ACKNOWLEDGE_PATIENT_PLAN' }
  | { type: 'SET_PERSPECTIVE'; payload: Perspective }
  | { type: 'RESET_WORKFLOW' };

export function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case 'SUBMIT_READINESS': {
      if (state.readinessCheckCompleted) return state;

      const now = 'Today, 08:45 AM';

      const clinicalTask: Task = {
        id: 'TSK-CLN-401',
        type: 'CLINICAL_REVIEW',
        title: 'Pre-Infusion Clinical Symptom Review',
        patientId: state.patient.id,
        status: 'ASSIGNED',
        priority: 'HIGH',
        owner: {
          id: 'STF-NURSE-01',
          name: 'Sarah Jenkins, RN, OCN',
          role: 'Oncology Triage Nurse',
          department: 'Benson Cancer Center Triage',
          badge: 'RN',
        },
        createdAt: now,
        dueTime: 'Today, 12:00 PM (T-20h)',
        clinicalDetails: {
          verbatimReport: action.payload.clinicalConcernText.trim() || 'Mild fever 100.4°F and tingling in fingers since yesterday evening',
          clearanceState: 'PENDING_REVIEW',
        },
      };

      const transportTask: Task = {
        id: 'TSK-TRN-402',
        type: 'TRANSPORTATION_NAVIGATION',
        title: 'Non-Emergency Medical Transportation Dispatch',
        patientId: state.patient.id,
        status: 'ASSIGNED',
        priority: 'HIGH',
        owner: {
          id: 'STF-NAV-02',
          name: 'Marcus Vance, MSW, LCSW',
          role: 'Oncology Patient Navigator',
          department: 'Patient Supportive Services',
          badge: 'MSW',
        },
        createdAt: now,
        dueTime: 'Today, 02:00 PM (T-18h)',
        transportDetails: {
          pickupAddress: state.patient.address,
          destination: state.appointment.location,
          requestedTime: 'Tomorrow, 7:45 AM',
          dispatchStatus: 'UNASSIGNED',
          vehicleType: 'Wheelchair-Accessible Medical Van',
        },
      };

      const newEvents: AuditEvent[] = [
        {
          id: `EVT-${Date.now()}-1`,
          timestamp: now,
          actor: 'Maria Hernandez',
          actorRole: 'PATIENT',
          action: 'Readiness Check Completed',
          description: 'Patient reported cancelled transportation and clinical concern (mild fever & peripheral neuropathy).',
          stateDiff: {
            field: 'overallReadiness',
            from: state.overallReadiness,
            to: 'AT_RISK',
          },
        },
        {
          id: `EVT-${Date.now()}-2`,
          timestamp: now,
          actor: 'Deterministic Routing Engine',
          actorRole: 'SYSTEM',
          action: 'Clinical Review Task Generated',
          description: 'Verbatim symptom report routed to Sarah Jenkins, RN for human triage review.',
        },
        {
          id: `EVT-${Date.now()}-3`,
          timestamp: now,
          actor: 'Deterministic Routing Engine',
          actorRole: 'SYSTEM',
          action: 'Transportation Task Generated',
          description: 'Transit barrier routed to Marcus Vance, MSW for medical transport dispatch.',
        },
      ];

      return {
        ...state,
        readinessCheckCompleted: true,
        overallReadiness: 'AT_RISK',
        readinessSubmission: {
          hasTransportIssue: true,
          transportNotes: action.payload.transportNotes || 'Ride cancelled by family member; needs assisted pickup at 7:45 AM',
          hasClinicalConcern: true,
          clinicalConcernText: action.payload.clinicalConcernText || 'Mild fever 100.4°F and tingling in fingers since yesterday evening',
          submittedAt: now,
        },
        tasks: [clinicalTask, transportTask],
        auditEvents: [...state.auditEvents, ...newEvents],
      };
    }

    case 'ACKNOWLEDGE_CLINICAL_TASK': {
      const now = 'Today, 10:15 AM';
      const updatedTasks = state.tasks.map((t) => {
        if (t.type === 'CLINICAL_REVIEW') {
          return {
            ...t,
            status: 'ACTIONED' as const,
            clinicalDetails: {
              ...t.clinicalDetails!,
              clearanceState: 'REVIEWED_AND_ACKNOWLEDGED' as const,
              nurseNotes: action.payload.nurseNotes || 'Assessed temp 100.4°F (sub-febrile) & Grade 1 peripheral neuropathy. Contacted patient via secure line; advised aggressive oral hydration, cold-sensitivity precautions for oxaliplatin, and pre-infusion CBC/CMP labs at 8:00 AM. Clinical clearance granted for pre-medication.',
              adviceGiven: 'Hydration protocol + pre-medication lab draw at 8:00 AM',
              acknowledgedAt: now,
              reviewedBy: 'Sarah Jenkins, RN, OCN',
            },
          };
        }
        return t;
      });

      const newEvent: AuditEvent = {
        id: `EVT-${Date.now()}-4`,
        timestamp: now,
        actor: 'Sarah Jenkins, RN, OCN',
        actorRole: 'TRIAGE_NURSE',
        action: 'Clinical Concern Acknowledged & Triage Documented',
        description: 'Triage nurse reviewed verbatim symptoms, recorded cold-sensitivity guidance, and cleared patient for scheduled 8:00 AM pre-med labs.',
      };

      const allActioned = updatedTasks.every(
        (t) => (t.type === 'CLINICAL_REVIEW' && t.clinicalDetails?.clearanceState === 'REVIEWED_AND_ACKNOWLEDGED') ||
               (t.type === 'TRANSPORTATION_NAVIGATION' && t.transportDetails?.dispatchStatus === 'CONFIRMED')
      );

      return {
        ...state,
        tasks: updatedTasks,
        overallReadiness: allActioned ? 'IN_PROGRESS' : state.overallReadiness,
        auditEvents: [...state.auditEvents, newEvent],
      };
    }

    case 'CONFIRM_TRANSPORTATION': {
      const now = 'Today, 11:30 AM';
      const vehicleId = action.payload.vehicleId || 'Ochsner Med-Van #402';
      const driverName = action.payload.driverName || 'Jerome Davis';
      const pickupTime = action.payload.pickupTime || 'Tomorrow, 7:45 AM';

      const updatedTasks = state.tasks.map((t) => {
        if (t.type === 'TRANSPORTATION_NAVIGATION') {
          return {
            ...t,
            status: 'CONFIRMED' as const,
            transportDetails: {
              ...t.transportDetails!,
              dispatchStatus: 'CONFIRMED' as const,
              vehicleId,
              driverName,
              confirmedPickupTime: pickupTime,
              dispatchedBy: 'Marcus Vance, MSW',
            },
          };
        }
        return t;
      });

      const newEvents: AuditEvent[] = [
        {
          id: `EVT-${Date.now()}-5`,
          timestamp: now,
          actor: 'Marcus Vance, MSW',
          actorRole: 'NAVIGATOR',
          action: 'Simulated Medical Transport Confirmed',
          description: `Dispatched ${vehicleId} (Driver: ${driverName}) for pickup at 7:45 AM from 1420 St. Charles Ave.`,
        },
        {
          id: `EVT-${Date.now()}-6`,
          timestamp: now,
          actor: 'Permission Boundary Engine',
          actorRole: 'SYSTEM',
          action: 'Caregiver Notification Dispatched',
          description: 'Ana Hernandez notified of transportation confirmation. (Clinical details strictly excluded).',
        },
      ];

      const allActioned = updatedTasks.every(
        (t) => (t.type === 'CLINICAL_REVIEW' && t.clinicalDetails?.clearanceState === 'REVIEWED_AND_ACKNOWLEDGED') ||
               (t.type === 'TRANSPORTATION_NAVIGATION' && t.transportDetails?.dispatchStatus === 'CONFIRMED')
      );

      return {
        ...state,
        tasks: updatedTasks,
        overallReadiness: allActioned ? 'IN_PROGRESS' : state.overallReadiness,
        auditEvents: [...state.auditEvents, ...newEvents],
      };
    }

    case 'ACKNOWLEDGE_PATIENT_PLAN': {
      const clnTask = state.tasks.find((t) => t.type === 'CLINICAL_REVIEW');
      const trnTask = state.tasks.find((t) => t.type === 'TRANSPORTATION_NAVIGATION');

      const clnReady = clnTask?.clinicalDetails?.clearanceState === 'REVIEWED_AND_ACKNOWLEDGED';
      const trnReady = trnTask?.transportDetails?.dispatchStatus === 'CONFIRMED';

      if (!clnReady || !trnReady) {
        return state;
      }

      const now = 'Today, 12:45 PM';

      const resolvedTasks = state.tasks.map((t) => ({
        ...t,
        status: 'RESOLVED' as const,
      }));

      const newEvents: AuditEvent[] = [
        {
          id: `EVT-${Date.now()}-7`,
          timestamp: now,
          actor: 'Maria Hernandez',
          actorRole: 'PATIENT',
          action: 'Treatment Plan Acknowledged by Patient',
          description: 'Patient reviewed and accepted confirmed transportation pickup at 7:45 AM and clinical pre-medication instructions.',
          stateDiff: {
            field: 'overallReadiness',
            from: state.overallReadiness,
            to: 'PLAN_CONFIRMED',
          },
        },
        {
          id: `EVT-${Date.now()}-8`,
          timestamp: now,
          actor: 'OncoReady Closure Engine',
          actorRole: 'SYSTEM',
          action: 'All Pre-Treatment Blockers Resolved',
          description: 'Treatment readiness state finalized to PLAN_CONFIRMED. Maria is cleared and ready for FOLFOX6 Cycle 4.',
        },
      ];

      return {
        ...state,
        patientAcknowledged: true,
        overallReadiness: 'PLAN_CONFIRMED',
        tasks: resolvedTasks,
        auditEvents: [...state.auditEvents, ...newEvents],
      };
    }

    case 'SET_PERSPECTIVE': {
      return {
        ...state,
        currentPerspective: action.payload,
      };
    }

    case 'RESET_WORKFLOW': {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      return { ...INITIAL_STATE };
    }

    default:
      return state;
  }
}

export function deriveCaregiverProjection(state: WorkflowState): CaregiverProjection {
  const trnTask = state.tasks.find((t) => t.type === 'TRANSPORTATION_NAVIGATION');
  const isConfirmed = trnTask?.transportDetails?.dispatchStatus === 'CONFIRMED';

  return {
    patientName: state.patient.name,
    appointmentTime: state.appointment.scheduledTime,
    appointmentLocation: state.appointment.location,
    treatmentName: state.appointment.treatmentName,
    transportConfirmed: isConfirmed || false,
    transportInfo: isConfirmed && trnTask?.transportDetails ? {
      pickupTime: trnTask.transportDetails.confirmedPickupTime || 'Tomorrow, 7:45 AM',
      pickupAddress: trnTask.transportDetails.pickupAddress,
      destination: trnTask.transportDetails.destination,
      vehicleId: trnTask.transportDetails.vehicleId || 'Ochsner Med-Van #402',
      driverName: trnTask.transportDetails.driverName || 'Jerome Davis',
      status: 'Confirmed & Dispatched',
    } : undefined,
    overallReadiness: state.overallReadiness,
    privacyBoundaryNotice: 'Clinical symptoms and oncology triage details are confidential between Maria and her medical care team.',
  };
}

export function loadSavedWorkflowState(): WorkflowState {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return INITIAL_STATE;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === INITIAL_STATE.version && parsed.patient) {
        return parsed;
      }
    }
  } catch {
    // ignore malformed storage
  }
  return INITIAL_STATE;
}

export function saveWorkflowState(state: WorkflowState): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch {
    // ignore storage quota errors
  }
}
