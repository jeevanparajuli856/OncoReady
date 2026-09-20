import {createHash} from "node:crypto";

export interface FhirSource {
  scenarioId: string;
  sourceEventVersion: number;
  generatedAt: string;
  patientId: string;
  patientDisplayName: string;
  treatmentId: string;
  treatmentStartsAt: string;
  locationDisplayName: string;
  transportStatus: string;
}

export interface ValidatorEvidence {
  artifact_hash: string;
  name: string;
  version: string;
  passed: boolean;
  report: Array<{severity: "information" | "warning" | "error" | "fatal"; message: string}>;
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => `${JSON.stringify(key)}:${stableJson(child)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function sha256(value: unknown): string {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}

export function generateFhirEvidence(source: FhirSource, validator?: ValidatorEvidence): Record<string, unknown> {
  const [family = "", ...given] = source.patientDisplayName.trim().split(/\s+/).reverse();
  const bundle = {
    resourceType: "Bundle",
    type: "collection",
    id: `oncoready-${source.scenarioId}`,
    timestamp: source.generatedAt,
    entry: [
      {fullUrl: `urn:uuid:${source.patientId}`, resource: {resourceType: "Patient", id: source.patientId, name: [{use: "usual", family, given: given.reverse()}]}},
      {fullUrl: `urn:uuid:${source.treatmentId}`, resource: {resourceType: "Appointment", id: source.treatmentId, status: "booked", start: source.treatmentStartsAt, description: `Treatment at ${source.locationDisplayName}`}},
      {resource: {resourceType: "Task", status: source.transportStatus === "completed" ? "completed" : "in-progress", intent: "plan", description: "Treatment transportation continuity"}},
    ],
  };
  const artifactHash = sha256(bundle);
  const exactPassingReport = Boolean(validator?.passed && validator.artifact_hash === artifactHash);
  const report = validator
    ? validator.report
    : [{severity: "information" as const, message: `FHIR bundle generated; validation pending for artifact ${artifactHash}.`}];
  return {
    scenario_id: source.scenarioId,
    generated_at: source.generatedAt,
    source_event_version: source.sourceEventVersion,
    status: exactPassingReport ? "validated" : validator?.passed === false ? "invalid" : "generated",
    validator: {name: validator?.name ?? "HL7 FHIR Validator", version: validator?.version ?? "unavailable", passed: exactPassingReport},
    bundle,
    report,
  };
}
