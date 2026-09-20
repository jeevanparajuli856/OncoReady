import type { components } from './generated';

export type ApiSchemas = components['schemas'];
export type ActorRole = ApiSchemas['ActorRole'];
export type RoleProjection = ApiSchemas['RoleProjection'];
export type PatientProjection = ApiSchemas['PatientProjection'];
export type CaregiverProjection = ApiSchemas['CaregiverProjection'];
export type StaffProjection = ApiSchemas['StaffProjection'];
export type StaffCommunication = StaffProjection['communications'][number];
export type TransportProjection = ApiSchemas['TransportProjection'];
export type Problem = ApiSchemas['Problem'];
export type CommandReceipt = ApiSchemas['CommandReceipt'];
export type MetricsEvidence = ApiSchemas['MetricsEvidence'];
export type FhirEvidence = ApiSchemas['FhirEvidence'];
export type PriorityEvidence = ApiSchemas['PriorityEvidence'];
export type ReadinessSubmissionCommand = ApiSchemas['ReadinessSubmissionCommand'];
export type WorkItemCommand = ApiSchemas['WorkItemCommand'];
export type TransportCommand = ApiSchemas['TransportCommand'];

export const FINALS_SCENARIO_ID = '11111111-1111-4111-8111-111111111111' as const;

export class ApiProblem extends Error {
  status: number;
  code: Problem['code'];
  retryable: boolean;
  currentAggregateVersion?: number | null;
  retryAfter?: number;

  constructor(problem: Problem, retryAfter?: number) {
    super(problem.detail || problem.title);
    this.name = 'ApiProblem';
    this.status = problem.status;
    this.code = problem.code;
    this.retryable = problem.retryable;
    this.currentAggregateVersion = problem.current_aggregate_version;
    this.retryAfter = retryAfter;
  }
}

const parseResponse = async <T>(response: Response): Promise<T> => {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const fallback: Problem = {
      type: 'about:blank',
      title: 'Request failed',
      status: response.status,
      code: response.status === 409 ? 'version_conflict' : 'internal_error',
      detail: 'The current workspace could not complete this request.',
      trace_id: 'unavailable',
      retryable: response.status >= 500,
    };
    throw new ApiProblem((body ?? fallback) as Problem, Number(response.headers.get('Retry-After')) || undefined);
  }
  return body as T;
};

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, '');

export const resolveApiUrl = (path: string) => `${apiBaseUrl}${path}`;

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(resolveApiUrl(path), {
    ...init,
    credentials: 'omit',
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  return parseResponse<T>(response);
};

export const finalsApi = {
  projection: (role: ActorRole, signal?: AbortSignal) =>
    request<RoleProjection>(`/api/v1/scenarios/finals?role=${encodeURIComponent(role)}`, { signal }),
  submitReadiness: (body: ReadinessSubmissionCommand) =>
    request<CommandReceipt>('/api/v1/readiness-submissions', { method: 'POST', body: JSON.stringify(body) }),
  commandWorkItem: (workItemId: string, body: WorkItemCommand) =>
    request<CommandReceipt>(`/api/v1/work-items/${encodeURIComponent(workItemId)}/commands`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  commandTransport: (transportRequestId: string, body: TransportCommand) =>
    request<CommandReceipt>(`/api/v1/transport/requests/${encodeURIComponent(transportRequestId)}/commands`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  metrics: (signal?: AbortSignal) => request<MetricsEvidence>('/api/v1/evidence/metrics', { signal }),
  fhir: (signal?: AbortSignal) => request<FhirEvidence>('/api/v1/evidence/fhir', { signal }),
  priority: (signal?: AbortSignal) => request<PriorityEvidence>('/api/v1/evidence/priority', { signal }),
};

export const newIdempotencyKey = (purpose: string) =>
  `${purpose}:${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
