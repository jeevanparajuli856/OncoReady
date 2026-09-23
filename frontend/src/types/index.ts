import type { ProviderKind, TransportProviderId } from '../data/transportProviders';

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
  avatarUrl: string;
}

export interface ClinicalReviewDetails {
  verbatimReport: string;
  nurseNotes?: string;
  clearanceState: 'PENDING_REVIEW' | 'REVIEWED_AND_ACKNOWLEDGED';
  ownershipAcknowledgedAt?: string;
  disposition?: string;
  dispositionRecordedAt?: string;
  followUpBlocking?: boolean;
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
  plannedArrival?: string;
  dispatchedBy?: string;
  planVersion: number;
  returnArrangement?: string;
  logisticsContact?: string;
  backupPlan?: string;
  backupOwner?: string;
  planFailed: boolean;
}

export type RideAssignmentStatus = 'CURRENT' | 'FAILED';

export interface RideAssignment {
  id: string;
  providerName: string;
  /** Which contracted adapter carried this attempt. */
  providerId: TransportProviderId;
  providerKind: ProviderKind;
  /** The trip id returned by the provider, quoted back in support calls. */
  providerTripId?: string;
  status: RideAssignmentStatus;
  assignedAt: string;
  failedAt?: string;
  /** Provider-reported reason the attempt failed, verbatim. */
  failureReason?: string;
  driverName?: string;
  vehicleId?: string;
  vehicleDescription?: string;
  etaMinutes?: number;
  fareEstimate?: string;
}

export interface CaregiverSeenRecord {
  eventId: string;
  actor: 'Ana Hernandez';
  actorRole: 'CAREGIVER';
  planVersion: number;
  timestamp: string;
}

export type CurrentRideStatus =
  | 'OPEN'
  | 'REQUESTED'
  | 'PRIMARY_ASSIGNED'
  | 'PRIMARY_FAILED'
  | 'BACKUP_ASSIGNED'
  | 'RECOVERED'
  | 'NO_OPTION';

export type HistoricalReplayStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'COMPLETE';

export interface HistoricalRideReplay {
  tripId: 'uh_2026_0911_ellis';
  status: HistoricalReplayStatus;
  visibleEventCount: number;
  sessionToken: number;
}

export interface RideState {
  currentTripId: 'ride-2026-09-25-cl';
  currentStatus: CurrentRideStatus;
  assignments: RideAssignment[];
  caregiverSeen: CaregiverSeenRecord | null;
  replay: HistoricalRideReplay;
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
  nextAction: string;
  waitingReason: string;
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
  stage: string;
  oncologist: string;
  phone: string;
  address: string;
  avatarUrl: string;
  ecogStatus: number;
  bodySurfaceArea: string;
}

export interface CaregiverProfile {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  permissionScope: 'TRANSPORTATION_ONLY';
  authorizedBy: string;
  avatarUrl: string;
}

export interface LabResult {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'NORMAL' | 'EVALUATED' | 'CRITICAL';
  collectedAt: string;
}

export interface VitalSign {
  name: string;
  value: string;
  unit: string;
  status: 'NORMAL' | 'ATTENTION';
  collectedAt: string;
}

export interface ChemoDrug {
  name: string;
  dosage: string;
  route: string;
  schedule: string;
  indication: string;
}

export interface AppointmentDetails {
  id: string;
  protocol: string;
  cycleNumber: number;
  totalCycles: number;
  treatmentName: string;
  scheduledTime: string;
  location: string;
  room: string;
  infusionChair: string;
  infusionDuration: string;
  oncologist: string;
  oncologistAvatar: string;
  nurseTeam: string;
  drugs: ChemoDrug[];
  premeds: string[];
}

export interface ReadinessSubmission {
  hasTransportIssue: boolean;
  transportNotes: string;
  hasClinicalConcern: boolean;
  clinicalConcernText: string;
  submittedAt: string | null;
}

export interface CaregiverProjection {
  caregiverName: string;
  caregiverRelationship: string;
  patientName: string;
  appointmentTime: string;
  appointmentLocation: string;
  transportConfirmed: boolean;
  currentPlan?: {
    planVersion: number;
    pickupTime: string;
    plannedArrival: string;
    pickupAddress: string;
    destination: string;
    returnArrangement: string;
    logisticsContact: string;
    backupOwner: string;
  };
  seen: CaregiverSeenRecord | null;
  privacyBoundaryNotice: string;
}

export type Perspective = 'LANDING' | 'TRUST' | 'SIGN_IN' | 'PATIENT' | 'CAREGIVER' | 'CARE_NAVIGATOR' | 'CARE_TEAM' | 'TRANSPORTATION' | 'STAFF' | 'SYSTEM';
export type PreparedWorkspace = 'CARE_NAVIGATOR' | 'CARE_TEAM' | 'TRANSPORTATION' | 'PATIENT' | 'CAREGIVER';
export type WorkspaceRole = 'CARE_NAVIGATOR' | 'CARE_TEAM';
export type StaffRoute = 'COMMAND_CENTER' | 'EXCEPTIONS' | 'PATIENTS' | 'CASE_WORKSPACE' | 'RESOURCES' | 'INSIGHTS' | 'INTEGRATIONS' | 'ADMIN';

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
  avatarUrl: string;
}

export interface WorkflowState {
  scenarioId: 'camila-demo-v2';
  patient: PatientProfile;
  caregiver: CaregiverProfile;
  appointment: AppointmentDetails;
  labs: LabResult[];
  vitals: VitalSign[];
  overallReadiness: ReadinessStatus;
  readinessCheckCompleted: boolean;
  readinessSubmission: ReadinessSubmission;
  tasks: Task[];
  auditEvents: AuditEvent[];
  currentPerspective: Perspective;
  staffRoute: StaffRoute;
  patientAcknowledged: boolean;
  patientAcknowledgedPlanVersion: number | null;
  appliedCommandIds: string[];
  processedSourceEventIds: string[];
  currentCheckpoint: ScenarioCheckpoint;
  attendanceStatus: 'UNKNOWN';
  ride: RideState;
  contextualCases: ContextualQueueCase[];
  isSimulated: boolean;
  version: number;
}

export type ScenarioCheckpoint =
  | 'START'
  | 'CONTEXT_INSIGHTS'
  | 'SPLIT_WORK'
  | 'FAILED_RIDE'
  | 'RECOVERED_PLAN'
  | 'FINAL_CONFIRMATION';
