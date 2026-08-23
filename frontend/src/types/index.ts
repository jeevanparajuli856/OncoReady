export type ReadinessStatus = 
  | 'ACTION_REQUIRED' 
  | 'AT_RISK' 
  | 'IN_PROGRESS' 
  | 'PLAN_CONFIRMED';

export type TaskType = 'CLINICAL_REVIEW' | 'TRANSPORTATION_NAVIGATION';

export type TaskStatus = 
  | 'DETECTED' 
  | 'ASSIGNED' 
  | 'ACKNOWLEDGED' 
  | 'ACTIONED' 
  | 'CONFIRMED' 
  | 'RESOLVED';

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'ROUTINE';

export interface TaskOwner {
  id: string;
  name: string;
  role: string;
  department: string;
  badge: string;
}

export interface ClinicalReviewDetails {
  verbatimReport: string;
  nurseNotes?: string;
  clearanceState: 'PENDING_REVIEW' | 'REVIEWED_AND_ACKNOWLEDGED';
  adviceGiven?: string;
  acknowledgedAt?: string;
  reviewedBy?: string;
}

export interface TransportDetails {
  pickupAddress: string;
  destination: string;
  requestedTime: string;
  dispatchStatus: 'UNASSIGNED' | 'DISPATCH_IN_PROGRESS' | 'CONFIRMED';
  vehicleType: string;
  vehicleId?: string;
  driverName?: string;
  confirmedPickupTime?: string;
  dispatchedBy?: string;
}

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  patientId: string;
  status: TaskStatus;
  priority: TaskPriority;
  owner: TaskOwner;
  createdAt: string;
  dueTime: string;
  clinicalDetails?: ClinicalReviewDetails;
  transportDetails?: TransportDetails;
}

export type ActorRole = 'PATIENT' | 'SYSTEM' | 'TRIAGE_NURSE' | 'NAVIGATOR' | 'CAREGIVER';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: ActorRole;
  action: string;
  description: string;
  stateDiff?: {
    field: string;
    from: string;
    to: string;
  };
}

export interface PatientProfile {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: string;
  diagnosis: string;
  oncologist: string;
  phone: string;
  address: string;
}

export interface CaregiverProfile {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  permissionScope: 'TRANSPORTATION_ONLY';
  authorizedBy: string;
}

export interface AppointmentDetails {
  id: string;
  protocol: string;
  cycleNumber: number;
  treatmentName: string;
  scheduledTime: string;
  location: string;
  room: string;
  infusionDuration: string;
  oncologist: string;
}

export interface ReadinessSubmission {
  hasTransportIssue: boolean;
  transportNotes: string;
  hasClinicalConcern: boolean;
  clinicalConcernText: string;
  submittedAt: string | null;
}

export interface CaregiverProjection {
  patientName: string;
  appointmentTime: string;
  appointmentLocation: string;
  treatmentName: string;
  transportConfirmed: boolean;
  transportInfo?: {
    pickupTime: string;
    pickupAddress: string;
    destination: string;
    vehicleId: string;
    driverName: string;
    status: string;
  };
  overallReadiness: ReadinessStatus;
  privacyBoundaryNotice: string;
}

export type Perspective = 'PATIENT' | 'STAFF' | 'CAREGIVER' | 'SYSTEM';

export interface ContextualQueueCase {
  id: string;
  patientName: string;
  mrn: string;
  diagnosis: string;
  protocol: string;
  appointmentTime: string;
  blockerType: string;
  ownerName: string;
  ownerRole: string;
  status: 'PENDING' | 'IN_REVIEW';
  priority: TaskPriority;
}

export interface WorkflowState {
  patient: PatientProfile;
  caregiver: CaregiverProfile;
  appointment: AppointmentDetails;
  overallReadiness: ReadinessStatus;
  readinessCheckCompleted: boolean;
  readinessSubmission: ReadinessSubmission;
  tasks: Task[];
  auditEvents: AuditEvent[];
  currentPerspective: Perspective;
  patientAcknowledged: boolean;
  contextualCases: ContextualQueueCase[];
  isSimulated: boolean;
  version: number;
}
