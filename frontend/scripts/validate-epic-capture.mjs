import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const captureRoot = join(frontendRoot, 'src', 'data', 'epic-capture');
const manifestPath = join(captureRoot, 'manifest.json');
const expectedCaptureId = 'epic-sandbox-20260922T070125Z-0dac7d6b';
const expectedLogoSha256 = 'd13f0cbac8390b6b27f2432f03bc242c05470d6cbf3f59ad77b3b958564155fb';
const allowedTypes = new Set(['Patient', 'Appointment', 'MedicationRequest', 'Observation']);
const secretMarkers = [
  /access[_-]?token/i,
  /refresh[_-]?token/i,
  /client[_-]?secret/i,
  /authorization\s*[:=]/i,
  /bearer\s+[a-z0-9._~-]+/i,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
];

const fail = (message) => {
  throw new Error(`Epic capture validation failed: ${message}`);
};

const sha256 = (content) => createHash('sha256').update(content).digest('hex');
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const hasPatientReference = (resource, patientId) => {
  const expected = `Patient/${patientId}`;
  if (resource.resourceType === 'Patient') return resource.id === patientId;
  if (resource.resourceType === 'Appointment') {
    return resource.participant?.some((participant) => participant.actor?.reference === expected) === true;
  }
  return resource.subject?.reference === expected;
};

const manifestText = await readFile(manifestPath, 'utf8');
for (const marker of secretMarkers) {
  if (marker.test(manifestText)) fail(`secret marker ${marker} found in manifest`);
}
const manifest = JSON.parse(manifestText);

if (manifest.captureId !== expectedCaptureId) fail('unexpected capture id');
if (manifest.schemaVersion !== 1 || manifest.mode !== 'captured_epic_sandbox' || manifest.fhirVersion !== '4.0.1') fail('unsupported manifest version or mode');
if (manifest.source?.label !== 'Epic FHIR Sandbox' || manifest.source?.environment !== 'Non-Production Sandbox') fail('unexpected source environment');
if (manifest.review?.status !== 'approved_for_frontend' || manifest.review?.distribution !== 'reviewed_epic_sandbox_test_data') fail('capture is not approved for frontend distribution');
if (manifest.scenarioBinding?.scenarioId !== 'camila-demo-v2' || manifest.scenarioBinding?.presentationAlias !== 'Camila Lopez' || manifest.scenarioBinding?.identityMatch !== true) fail('invalid scenario binding');
if (!Array.isArray(manifest.resources) || manifest.resources.length === 0) fail('resource inventory is empty');
if (!Array.isArray(manifest.requests) || manifest.requests.some((request) => request.method !== 'GET')) fail('request evidence must be GET-only');

const expectedFiles = new Set(manifest.resources.map((entry) => entry.path.replace('resources/', '')));
const actualFiles = new Set(await readdir(join(captureRoot, 'resources')));
if (expectedFiles.size !== actualFiles.size || [...expectedFiles].some((name) => !actualFiles.has(name))) fail('resource directory does not exactly match the manifest');

let patientCount = 0;
for (const entry of manifest.resources) {
  if (!allowedTypes.has(entry.resourceType)) fail(`unsupported type ${entry.resourceType}`);
  const path = join(captureRoot, entry.path);
  const content = await readFile(path);
  if (sha256(content) !== entry.sha256) fail(`checksum mismatch for ${entry.path}`);
  const text = content.toString('utf8');
  for (const marker of secretMarkers) {
    if (marker.test(text)) fail(`secret marker ${marker} found in ${entry.path}`);
  }
  const resource = JSON.parse(text);
  if (resource.resourceType !== entry.resourceType || resource.id !== entry.id) fail(`resource identity mismatch for ${entry.path}`);
  if (!hasPatientReference(resource, manifest.patient.id)) fail(`patient reference mismatch for ${entry.path}`);
  if (resource.resourceType === 'Observation' && !resource.category?.some((category) => category.coding?.some((coding) => coding.code === 'laboratory'))) fail(`non-laboratory Observation in ${entry.path}`);
  if (resource.resourceType === 'Patient') {
    patientCount += 1;
    const sourceName = resource.name?.find((name) => name.use === 'official')?.text ?? resource.name?.[0]?.text;
    if (sourceName !== manifest.scenarioBinding.sourceIdentity) fail('Patient source identity does not match manifest binding');
  }
}
if (patientCount !== 1) fail('capture must contain exactly one Patient');

const logoContent = await readFile(join(frontendRoot, 'public', 'epic-logo.svg'));
if (sha256(logoContent) !== expectedLogoSha256) fail('official Epic logo checksum mismatch');

// A successful run is intentionally terse so build/test logs remain useful.
process.stdout.write(`Epic capture ${manifest.captureId} validated (${manifest.resources.length} resources).\n`);
