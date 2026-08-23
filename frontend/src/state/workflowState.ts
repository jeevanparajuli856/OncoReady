import { 
  WorkflowState, 
  Task, 
  AuditEvent, 
  Perspective, 
  CaregiverProjection 
} from '../types';

const STORAGE_KEY = 'oncoready_workflow_state_v2';

export const INITIAL_STATE: WorkflowState = {
  version: 3,
  isSimulated: true,
  currentPerspective: 'LANDING',
  overallReadiness: 'ACTION_REQUIRED',
  readinessCheckCompleted: false,
  patientAcknowledged: false,
  
  patient: {
    id: 'PAT-882914',
    mrn: 'OCH-882914',
    name: 'Maria Hernandez',
    age: 54,
    gender: 'Female',
    diagnosis: 'Colorectal Adenocarcinoma',
    stage: 'Stage IV (Hepatic Metastasis)',
    oncologist: 'Dr. Aris Thorne, MD',
    phone: '(504) 555-0182',
    address: '1420 St. Charles Ave, New Orleans, LA 70130',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
    ecogStatus: 1,
    bodySurfaceArea: '1.72 m²',
  },

  caregiver: {
    id: 'CG-40912',
    name: 'Ana Hernandez',
    relationship: 'Daughter & Health Proxy',
    phone: '(504) 555-0199',
    permissionScope: 'TRANSPORTATION_ONLY',
    authorizedBy: 'Maria Hernandez',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
  },

  appointment: {
    id: 'APT-2026-0824',
    protocol: 'mFOLFOX6 + Bevacizumab',
    cycleNumber: 4,
    totalCycles: 12,
    treatmentName: 'Cycle 4 Infusion (Oxaliplatin / Leucovorin / 5-FU / Avastin)',
    scheduledTime: 'Tomorrow, Aug 24 • 8:30 AM',
    location: 'Benson Cancer Center, Infusion Suite B',
    room: 'Bay 4',
    infusionChair: 'Infusion Chair 14 (Window)',
    infusionDuration: '4 hours (plus 46-hr CADD ambulatory pump)',
    oncologist: 'Dr. Aris Thorne, MD, PhD',
    oncologistAvatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=256',
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
        schedule: 'Days 1–3',
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
      referenceRange: '1.50 – 8.00',
      status: 'NORMAL',
      collectedAt: 'Aug 22, 09:15 AM',
    },
    {
      name: 'Platelet Count',
      value: '168',
      unit: '× 10³/µL',
      referenceRange: '150 – 450',
      status: 'NORMAL',
      collectedAt: 'Aug 22, 09:15 AM',
    },
    {
      name: 'Hemoglobin (Hgb)',
      value: '11.4',
      unit: 'g/dL',
      referenceRange: '12.0 – 16.0',
      status: 'EVALUATED',
      collectedAt: 'Aug 22, 09:15 AM',
    },
    {
      name: 'Serum Creatinine',
      value: '0.88',
      unit: 'mg/dL',
      referenceRange: '0.50 – 1.10',
      status: 'NORMAL',
      collectedAt: 'Aug 22, 09:15 AM',
    },
    {
      name: 'Total Bilirubin',
      value: '0.6',
      unit: 'mg/dL',
      referenceRange: '0.2 – 1.2',
      status: 'NORMAL',
      collectedAt: 'Aug 22, 09:15 AM',
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
      collectedAt: 'Clinic Visit Aug 20',
    },
    {
      name: 'Pulse / Heart Rate',
      value: '72',
      unit: 'bpm',
      status: 'NORMAL',
      collectedAt: 'Clinic Visit Aug 20',
    },
    {
      name: 'SpO2 Oxygen Saturation',
      value: '99',
      unit: '%',
      status: 'NORMAL',
      collectedAt: 'Clinic Visit Aug 20',
    },
    {
      name: 'Patient Weight',
      value: '68.0',
      unit: 'kg (150 lbs)',
      status: 'NORMAL',
      collectedAt: 'Clinic Visit Aug 20',
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
      id: 'EVT-001',
      timestamp: 'Aug 23, 06:00 AM',
      actor: 'Epic Scheduling / Ochsner Oncology',
      actorRole: 'SYSTEM',
      action: 'Cycle 4 Infusion Scheduled',
      description: 'mFOLFOX6 Cycle 4 confirmed for 08/24 08:30 AM at Benson Cancer Center.',
    },
    {
      id: 'EVT-002',
      timestamp: 'Aug 23, 06:05 AM',
      actor: 'OncoReady Continuity Engine',
      actorRole: 'SYSTEM',
      action: 'Readiness Screening Window Opened',
      description: 'T-24 hour pre-infusion barrier detection protocol active for Maria Hernandez.',
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
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
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
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
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
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    }
  ]
};

export type WorkflowAction =
  | { type: 'SUBMIT_READINESS'; payload: { transportNotes: string; clinicalConcernText: string } }
  | { type: 'ACKNOWLEDGE_CLINICAL_TASK'; payload?: { nurseNotes?: string } }
  | { type: 'CONFIRM_TRANSPORTATION'; payload?: { vehicleId?: string; driverName?: string; pickupTime?: string } }
  | { type: 'ACKNOWLEDGE_PATIENT_PLAN' }
  | { type: 'SET_PERSPECTIVE'; payload: Perspective }
  | { type: 'RESET_WORKFLOW' };

export function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case 'SUBMIT_READINESS': {
      const nowStr = 'Aug 23, 07:15 AM';
      const { transportNotes, clinicalConcernText } = action.payload;

      const hasTransport = Boolean(transportNotes && transportNotes.trim());
      const hasClinical = Boolean(clinicalConcernText && clinicalConcernText.trim());

      const newTasks: Task[] = [];
      const newAuditEvents: AuditEvent[] = [...state.auditEvents];

      // Event: Patient submitted screening
      newAuditEvents.push({
        id: `EVT-${state.auditEvents.length + 1}`.padStart(7, '0'),
        timestamp: nowStr,
        actor: state.patient.name,
        actorRole: 'PATIENT',
        action: 'Readiness Screening Submitted',
        description: `Patient completed 2-minute pre-infusion screening with 2 actionable barrier items.`,
        stateDiff: {
          field: 'readinessCheckCompleted',
          from: 'false',
          to: 'true',
        },
      });

      // 1. Clinical Review Task (Assigned to Sarah Jenkins, RN)
      if (hasClinical) {
        newTasks.push({
          id: 'TSK-CLN-01',
          type: 'CLINICAL_REVIEW',
          title: 'Oncology Triage Review: Patient-Reported Symptoms',
          patientId: state.patient.id,
          status: 'ASSIGNED',
          priority: 'HIGH',
          owner: {
            id: 'STAFF-RN-01',
            name: 'Sarah Jenkins, BSN, RN, OCN',
            role: 'Oncology Triage Nurse',
            department: 'Benson Cancer Center Triage',
            badge: 'RN-8841',
            avatarUrl: 'https://images.unsplash.com/photo-1594824813629-923c5e7b233a?auto=format&fit=crop&q=80&w=256',
          },
          createdAt: nowStr,
          dueTime: 'Today • 10:00 AM (SLA: 2h)',
          clinicalDetails: {
            verbatimReport: clinicalConcernText,
            clearanceState: 'PENDING_REVIEW',
          },
        });

        newAuditEvents.push({
          id: `EVT-${newAuditEvents.length + 1}`.padStart(7, '0'),
          timestamp: nowStr,
          actor: 'OncoReady Continuity Engine',
          actorRole: 'SYSTEM',
          action: 'Clinical Triage Task Created',
          description: `Dispatched high-priority clinical review to Sarah Jenkins, RN. Verbatim record preserved: "${clinicalConcernText}".`,
        });
      }

      // 2. Transportation Navigation Task (Assigned to Marcus Vance)
      if (hasTransport) {
        newTasks.push({
          id: 'TSK-TRN-02',
          type: 'TRANSPORTATION_NAVIGATION',
          title: 'Transportation Navigation: Ride Cancellation Resolution',
          patientId: state.patient.id,
          status: 'ASSIGNED',
          priority: 'HIGH',
          owner: {
            id: 'STAFF-NAV-02',
            name: 'Marcus Vance, MSW, LCSW',
            role: 'Oncology Patient Navigator',
            department: 'Supportive Care Services',
            badge: 'NAV-3312',
            avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256',
          },
          createdAt: nowStr,
          dueTime: 'Today • 11:00 AM (SLA: 3h)',
          transportDetails: {
            pickupAddress: state.patient.address,
            destination: state.appointment.location,
            requestedTime: 'Tomorrow • 7:45 AM (for 8:30 AM arrival)',
            dispatchStatus: 'UNASSIGNED',
            vehicleType: 'Assisted Medical Transport (Med-Van)',
          },
        });

        newAuditEvents.push({
          id: `EVT-${newAuditEvents.length + 1}`.padStart(7, '0'),
          timestamp: nowStr,
          actor: 'OncoReady Continuity Engine',
          actorRole: 'SYSTEM',
          action: 'Transportation Task Created',
          description: `Dispatched transit task to Marcus Vance, MSW for pickup at 1420 St. Charles Ave.`,
        });
      }

      const nextReadiness = newTasks.length > 0 ? 'AT_RISK' : 'PLAN_CONFIRMED';

      return {
        ...state,
        readinessCheckCompleted: true,
        readinessSubmission: {
          hasTransportIssue: hasTransport,
          transportNotes,
          hasClinicalConcern: hasClinical,
          clinicalConcernText,
          submittedAt: nowStr,
        },
        tasks: newTasks,
        auditEvents: newAuditEvents,
        overallReadiness: nextReadiness,
      };
    }

    case 'ACKNOWLEDGE_CLINICAL_TASK': {
      const nowStr = 'Aug 23, 08:20 AM';
      const defaultNotes = 
        'Assessed temp 100.4°F (sub-febrile) & Grade 1 peripheral neuropathy. Contacted patient via clinic line; advised aggressive oral hydration, cold-sensitivity precautions for oxaliplatin, and pre-infusion CBC/CMP labs at 8:00 AM. Clinical clearance granted for pre-medication.';
      
      const nurseNotes = action.payload?.nurseNotes || defaultNotes;

      const updatedTasks = state.tasks.map((task) => {
        if (task.type === 'CLINICAL_REVIEW') {
          return {
            ...task,
            status: 'RESOLVED' as const,
            clinicalDetails: {
              ...task.clinicalDetails!,
              nurseNotes,
              clearanceState: 'REVIEWED_AND_ACKNOWLEDGED' as const,
              adviceGiven: 'Oral hydration protocol + oxaliplatin cold avoidance + 8:00 AM pre-med labs authorized.',
              acknowledgedAt: nowStr,
              reviewedBy: 'Sarah Jenkins, BSN, RN, OCN',
            },
          };
        }
        return task;
      });

      const newAuditEvents: AuditEvent[] = [...state.auditEvents, {
        id: `EVT-${state.auditEvents.length + 1}`.padStart(7, '0'),
        timestamp: nowStr,
        actor: 'Sarah Jenkins, BSN, RN, OCN',
        actorRole: 'TRIAGE_NURSE',
        action: 'Clinical Symptoms Reviewed & Cleared',
        description: `Nurse Jenkins completed triage assessment. Patient cleared for pre-infusion hydration and morning lab draw.`,
        stateDiff: {
          field: 'tasks.CLINICAL_REVIEW.status',
          from: 'ASSIGNED',
          to: 'RESOLVED',
        },
      }];

      const allResolved = updatedTasks.every((t) => t.status === 'RESOLVED');
      const nextReadiness = allResolved ? 'IN_PROGRESS' : state.overallReadiness;

      return {
        ...state,
        tasks: updatedTasks,
        auditEvents: newAuditEvents,
        overallReadiness: nextReadiness,
      };
    }

    case 'CONFIRM_TRANSPORTATION': {
      const nowStr = 'Aug 23, 08:45 AM';
      const vehicleId = action.payload?.vehicleId || 'Ochsner Med-Van #402';
      const driverName = action.payload?.driverName || 'Jerome Davis';
      const pickupTime = action.payload?.pickupTime || 'Tomorrow, 7:45 AM';

      const updatedTasks = state.tasks.map((task) => {
        if (task.type === 'TRANSPORTATION_NAVIGATION') {
          return {
            ...task,
            status: 'RESOLVED' as const,
            transportDetails: {
              ...task.transportDetails!,
              dispatchStatus: 'CONFIRMED' as const,
              vehicleId,
              driverName,
              confirmedPickupTime: pickupTime,
              dispatchedBy: 'Marcus Vance, MSW, LCSW',
            },
          };
        }
        return task;
      });

      const newAuditEvents: AuditEvent[] = [...state.auditEvents, {
        id: `EVT-${state.auditEvents.length + 1}`.padStart(7, '0'),
        timestamp: nowStr,
        actor: 'Marcus Vance, MSW, LCSW',
        actorRole: 'NAVIGATOR',
        action: 'Transportation Dispatched & Confirmed',
        description: `Med-Van #402 (Driver: Jerome Davis) booked for 7:45 AM pickup at 1420 St. Charles Ave. Route ETA to Benson Cancer Center: 25 mins.`,
        stateDiff: {
          field: 'tasks.TRANSPORTATION_NAVIGATION.status',
          from: 'ASSIGNED',
          to: 'RESOLVED',
        },
      }];

      const allResolved = updatedTasks.every((t) => t.status === 'RESOLVED');
      const nextReadiness = allResolved ? 'IN_PROGRESS' : state.overallReadiness;

      return {
        ...state,
        tasks: updatedTasks,
        auditEvents: newAuditEvents,
        overallReadiness: nextReadiness,
      };
    }

    case 'ACKNOWLEDGE_PATIENT_PLAN': {
      const nowStr = 'Aug 23, 09:10 AM';

      const updatedTasks = state.tasks.map((t) => ({
        ...t,
        status: 'RESOLVED' as const,
      }));

      const newAuditEvents: AuditEvent[] = [...state.auditEvents, {
        id: `EVT-${state.auditEvents.length + 1}`.padStart(7, '0'),
        timestamp: nowStr,
        actor: state.patient.name,
        actorRole: 'PATIENT',
        action: 'Treatment Plan Acknowledged by Patient',
        description: `Maria Hernandez reviewed confirmed transportation and pre-medication lab instructions, transitioning cycle status to PLAN_CONFIRMED.`,
        stateDiff: {
          field: 'overallReadiness',
          from: state.overallReadiness,
          to: 'PLAN_CONFIRMED',
        },
      }];

      return {
        ...state,
        patientAcknowledged: true,
        overallReadiness: 'PLAN_CONFIRMED',
        tasks: updatedTasks,
        auditEvents: newAuditEvents,
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
    privacyBoundaryNotice: 'Clinical symptoms, medication dosing, and nurse triage notes are confidential between Maria and her oncology care team.',
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
