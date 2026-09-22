import bundledArtifact from './ml-insights.json';

export const SUPPORTED_MODEL_VERSION = 'synthetic-logistic-1.0';
export const CHECKPOINT_ORDER = ['T-7', 'T-2', 'T-1'] as const;

export type MlCheckpointName = (typeof CHECKPOINT_ORDER)[number];
export type MlFactorDirection = 'higher' | 'lower';

export interface MlFactor {
  feature: string;
  featureValue: number;
  direction: MlFactorDirection;
}

export interface MlFeatureValues {
  [feature: string]: number;
}

export interface MlCheckpoint {
  checkpoint: MlCheckpointName;
  score: number;
  factors: MlFactor[];
  featureValues: MlFeatureValues;
  suggestedNextAction: {
    source: 'workflow_rule';
    modelDerived: false;
    text: string;
  };
}

export interface MlComparisonRow {
  score: number;
  factors: MlFactor[];
  featureValues: MlFeatureValues;
}

export interface MlWhatIf {
  baseline: MlComparisonRow;
  transportationAvailable: MlComparisonRow;
  scoreDelta: number;
  modelVersion: string;
}

export interface MlInsights {
  modelVersion: string;
  modelFeatures: string[];
  datasetSeed: number;
  datasetSha256: string;
  evaluation: {
    modelAccuracy: number;
    baselineAccuracy: number;
    testPatients: number;
    testRows: number;
  };
  checkpoints: MlCheckpoint[];
  whatIf?: MlWhatIf;
  limitations: string[];
  integrityHash: string;
}

export type MlInsightsResult =
  | { status: 'ready'; data: MlInsights }
  | { status: 'unavailable'; reason: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!isRecord(value)) throw new Error(`${label} is missing or invalid`);
  return value;
};

const readString = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} is missing or invalid`);
  return value;
};

const readFinite = (value: unknown, label: string): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${label} is missing or invalid`);
  return value;
};

const readInteger = (value: unknown, label: string): number => {
  const parsed = readFinite(value, label);
  if (!Number.isInteger(parsed) || parsed < 0) throw new Error(`${label} is missing or invalid`);
  return parsed;
};

const readScore = (value: unknown, label: string): number => {
  const parsed = readFinite(value, label);
  if (parsed < 0 || parsed > 100) throw new Error(`${label} must be between 0 and 100`);
  return parsed;
};

const canonicalize = (value: unknown, fieldName?: string): string => {
  if (value === null) return 'null';
  if (typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('non-finite number in artifact');
    // The Python exporter intentionally emits factor values after float
    // conversion (for example 1.0). JSON module imports preserve the value but
    // not that lexical distinction, so restore it at this one typed field.
    if (fieldName === 'feature_value' && Number.isInteger(value)) return `${value}.0`;
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map((item) => canonicalize(item, fieldName)).join(',')}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalize(value[key], key)}`)
      .join(',')}}`;
  }
  throw new Error('unsupported value in artifact');
};

const rotateRight = (value: number, amount: number): number =>
  (value >>> amount) | (value << (32 - amount));

const SHA256_ROUND_CONSTANTS = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

const SHA256_INITIAL_HASH = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
];

const sha256 = (text: string): string => {
  const source = new TextEncoder().encode(text);
  const paddedLength = Math.ceil((source.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(source);
  padded[source.length] = 0x80;
  const view = new DataView(padded.buffer);
  const bitLength = source.length * 8;
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000));
  view.setUint32(paddedLength - 4, bitLength >>> 0);

  const hash = [...SHA256_INITIAL_HASH];
  const words = new Uint32Array(64);
  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let index = 0; index < 16; index += 1) words[index] = view.getUint32(offset + index * 4);
    for (let index = 16; index < 64; index += 1) {
      const previous15 = words[index - 15];
      const previous2 = words[index - 2];
      const sigma0 = rotateRight(previous15, 7) ^ rotateRight(previous15, 18) ^ (previous15 >>> 3);
      const sigma1 = rotateRight(previous2, 17) ^ rotateRight(previous2, 19) ^ (previous2 >>> 10);
      words[index] = (words[index - 16] + sigma0 + words[index - 7] + sigma1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = hash;
    for (let index = 0; index < 64; index += 1) {
      const sum1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
      const choice = (e & f) ^ (~e & g);
      const temp1 = (h + sum1 + choice + SHA256_ROUND_CONSTANTS[index] + words[index]) >>> 0;
      const sum0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (sum0 + majority) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    hash[0] = (hash[0] + a) >>> 0;
    hash[1] = (hash[1] + b) >>> 0;
    hash[2] = (hash[2] + c) >>> 0;
    hash[3] = (hash[3] + d) >>> 0;
    hash[4] = (hash[4] + e) >>> 0;
    hash[5] = (hash[5] + f) >>> 0;
    hash[6] = (hash[6] + g) >>> 0;
    hash[7] = (hash[7] + h) >>> 0;
  }

  return hash.map((value) => value.toString(16).padStart(8, '0')).join('');
};

export const computeMlInsightsIntegrity = (value: unknown): string => {
  const artifact = readRecord(value, 'artifact');
  const payload = { ...artifact };
  delete payload.integrity_hash;
  return sha256(`${canonicalize(payload)}\n`);
};

const readFeatureValues = (
  value: unknown,
  label: string,
  modelFeatures: string[],
): MlFeatureValues => {
  const record = readRecord(value, label);
  const parsed: MlFeatureValues = {};
  for (const feature of modelFeatures) parsed[feature] = readFinite(record[feature], `${label}.${feature}`);
  return parsed;
};

const readFactors = (
  value: unknown,
  label: string,
  modelFeatures: string[],
): MlFactor[] => {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 3) throw new Error(`${label} is invalid`);
  return value.map((item, index) => {
    const record = readRecord(item, `${label}[${index}]`);
    const feature = readString(record.feature, `${label}[${index}].feature`);
    if (!modelFeatures.includes(feature)) throw new Error(`${label}[${index}].feature is unsupported`);
    if (record.direction !== 'higher' && record.direction !== 'lower') {
      throw new Error(`${label}[${index}].direction is invalid`);
    }
    return {
      feature,
      featureValue: readFinite(record.feature_value, `${label}[${index}].feature_value`),
      direction: record.direction,
    };
  });
};

const readComparisonRow = (
  value: unknown,
  label: string,
  modelFeatures: string[],
): MlComparisonRow => {
  const record = readRecord(value, label);
  const featureValues = readFeatureValues(record.feature_values, `${label}.feature_values`, modelFeatures);
  const factors = readFactors(record.factors, `${label}.factors`, modelFeatures);
  if (factors.some((factor) => factor.featureValue !== featureValues[factor.feature])) {
    throw new Error(`${label}.factors do not match saved feature values`);
  }
  return {
    score: readScore(record.score, `${label}.score`),
    factors,
    featureValues,
  };
};

const readWhatIf = (
  value: unknown,
  modelVersion: string,
  modelFeatures: string[],
): MlWhatIf | undefined => {
  if (value === undefined || value === null) return undefined;
  const record = readRecord(value, 'what_if');
  const baseline = readComparisonRow(record.baseline, 'what_if.baseline', modelFeatures);
  const transportationAvailable = readComparisonRow(
    record.transportation_available,
    'what_if.transportation_available',
    modelFeatures,
  );
  const comparisonVersion = readString(record.model_version, 'what_if.model_version');
  if (comparisonVersion !== modelVersion) throw new Error('what_if.model_version does not match model.version');
  const changed = modelFeatures.filter(
    (feature) => baseline.featureValues[feature] !== transportationAvailable.featureValues[feature],
  );
  if (changed.length !== 1 || changed[0] !== 'transport_available') {
    throw new Error('what_if must change only transportation availability');
  }
  if (
    baseline.featureValues.transport_available !== 0
    || transportationAvailable.featureValues.transport_available !== 1
  ) {
    throw new Error('what_if transportation states are invalid');
  }
  const scoreDelta = readFinite(record.score_delta, 'what_if.score_delta');
  const expectedDelta = Math.round((transportationAvailable.score - baseline.score) * 10) / 10;
  if (scoreDelta !== expectedDelta) throw new Error('what_if.score_delta does not match saved scores');
  return {
    baseline,
    transportationAvailable,
    scoreDelta,
    modelVersion: comparisonVersion,
  };
};

export const parseMlInsights = (value: unknown): MlInsightsResult => {
  try {
    const artifact = readRecord(value, 'artifact');
    const integrityHash = readString(artifact.integrity_hash, 'integrity_hash');
    if (!/^[a-f0-9]{64}$/.test(integrityHash)) throw new Error('integrity hash is invalid');
    if (computeMlInsightsIntegrity(artifact) !== integrityHash) throw new Error('integrity check failed');

    const model = readRecord(artifact.model, 'model');
    const modelVersion = readString(model.version, 'model.version');
    if (modelVersion !== SUPPORTED_MODEL_VERSION) throw new Error(`unsupported model version: ${modelVersion}`);
    if (!Array.isArray(model.features) || model.features.length === 0) throw new Error('model.features is invalid');
    const modelFeatures = model.features.map((feature, index) => readString(feature, `model.features[${index}]`));
    if (new Set(modelFeatures).size !== modelFeatures.length) throw new Error('model.features contains duplicates');
    if (!modelFeatures.includes('transport_available')) throw new Error('model.features is missing transport_available');
    if (!Array.isArray(model.weights) || model.weights.length !== modelFeatures.length) {
      throw new Error('model.weights is invalid');
    }
    model.weights.forEach((weight, index) => readFinite(weight, `model.weights[${index}]`));
    readFinite(model.intercept, 'model.intercept');

    const provenance = readRecord(artifact.provenance, 'provenance');
    const datasetSeed = readInteger(provenance.dataset_seed, 'provenance.dataset_seed');
    const datasetSha256 = readString(provenance.dataset_sha256, 'provenance.dataset_sha256');
    if (!/^[a-f0-9]{64}$/.test(datasetSha256)) throw new Error('provenance.dataset_sha256 is invalid');
    if (provenance.fictional_identifiers !== true) throw new Error('provenance must identify fictional data');

    const evaluation = readRecord(artifact.evaluation, 'evaluation');
    const modelEvaluation = readRecord(evaluation.model, 'evaluation.model');
    const baselineEvaluation = readRecord(evaluation.baseline, 'evaluation.baseline');
    const modelAccuracy = readFinite(modelEvaluation.accuracy, 'evaluation.model.accuracy');
    const baselineAccuracy = readFinite(baselineEvaluation.accuracy, 'evaluation.baseline.accuracy');
    if (modelAccuracy < 0 || modelAccuracy > 1 || baselineAccuracy < 0 || baselineAccuracy > 1) {
      throw new Error('evaluation accuracy is invalid');
    }
    const testRows = readInteger(evaluation.test_rows, 'evaluation.test_rows');
    if (
      readInteger(modelEvaluation.rows, 'evaluation.model.rows') !== testRows
      || readInteger(baselineEvaluation.rows, 'evaluation.baseline.rows') !== testRows
    ) {
      throw new Error('evaluation row counts do not match');
    }
    const classificationThreshold = readFinite(
      modelEvaluation.classification_threshold,
      'evaluation.model.classification_threshold',
    );
    if (classificationThreshold < 0 || classificationThreshold > 1) {
      throw new Error('evaluation.model.classification_threshold is invalid');
    }

    if (!Array.isArray(artifact.checkpoints)) throw new Error('checkpoints is invalid');
    const checkpoints = artifact.checkpoints.map((item, index): MlCheckpoint => {
      const checkpoint = readRecord(item, `checkpoints[${index}]`);
      const checkpointName = checkpoint.checkpoint;
      if (!CHECKPOINT_ORDER.includes(checkpointName as MlCheckpointName)) {
        throw new Error(`checkpoints[${index}].checkpoint is unsupported`);
      }
      const suggested = readRecord(checkpoint.suggested_next_action, `checkpoints[${index}].suggested_next_action`);
      if (suggested.source !== 'workflow_rule' || suggested.model_derived !== false) {
        throw new Error(`checkpoints[${index}].suggested_next_action is invalid`);
      }
      const featureValues = readFeatureValues(
        checkpoint.feature_values,
        `checkpoints[${index}].feature_values`,
        modelFeatures,
      );
      const factors = readFactors(checkpoint.factors, `checkpoints[${index}].factors`, modelFeatures);
      if (factors.some((factor) => factor.featureValue !== featureValues[factor.feature])) {
        throw new Error(`checkpoints[${index}].factors do not match saved feature values`);
      }
      return {
        checkpoint: checkpointName as MlCheckpointName,
        score: readScore(checkpoint.score, `checkpoints[${index}].score`),
        factors,
        featureValues,
        suggestedNextAction: {
          source: 'workflow_rule',
          modelDerived: false,
          text: readString(suggested.text, `checkpoints[${index}].suggested_next_action.text`),
        },
      };
    });
    if (
      checkpoints.length !== CHECKPOINT_ORDER.length
      || CHECKPOINT_ORDER.some((expected, index) => checkpoints[index]?.checkpoint !== expected)
    ) {
      throw new Error('checkpoint sequence is incomplete or out of order');
    }

    if (!Array.isArray(artifact.limitations) || artifact.limitations.length === 0) {
      throw new Error('limitations is missing or invalid');
    }
    const limitations = artifact.limitations.map((item, index) => readString(item, `limitations[${index}]`));

    return {
      status: 'ready',
      data: {
        modelVersion,
        modelFeatures,
        datasetSeed,
        datasetSha256,
        evaluation: {
          modelAccuracy,
          baselineAccuracy,
          testPatients: readInteger(evaluation.test_patients, 'evaluation.test_patients'),
          testRows,
        },
        checkpoints,
        whatIf: readWhatIf(artifact.what_if, modelVersion, modelFeatures),
        limitations,
        integrityHash,
      },
    };
  } catch (error) {
    return {
      status: 'unavailable',
      reason: error instanceof Error ? error.message : 'saved insight artifact could not be verified',
    };
  }
};

export const savedMlInsightsArtifact: unknown = bundledArtifact;
