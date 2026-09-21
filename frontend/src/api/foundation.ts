export interface FoundationProof {
  key: 'railway-foundation';
  value: string;
  seedVersion: number;
  createdAt: string;
  updatedAt: string;
}

const isIsoDate = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && !Number.isNaN(Date.parse(value));

const isFoundationProof = (value: unknown): value is FoundationProof => {
  if (!value || typeof value !== 'object') return false;

  const proof = value as Record<string, unknown>;
  return (
    proof.key === 'railway-foundation' &&
    typeof proof.value === 'string' &&
    proof.value.length >= 1 &&
    proof.value.length <= 256 &&
    Number.isInteger(proof.seedVersion) &&
    Number(proof.seedVersion) >= 1 &&
    isIsoDate(proof.createdAt) &&
    isIsoDate(proof.updatedAt)
  );
};

const normalizeApiOrigin = (apiOrigin: string): string => apiOrigin.trim().replace(/\/+$/, '');

export const getFoundationProof = async (
  apiOrigin: string,
  signal?: AbortSignal,
): Promise<FoundationProof> => {
  const normalizedOrigin = normalizeApiOrigin(apiOrigin);
  if (!normalizedOrigin) {
    throw new Error('API origin is not configured');
  }

  const response = await fetch(`${normalizedOrigin}/api/v1/foundation/proof`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'omit',
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    throw new Error('Foundation proof is unavailable');
  }

  const payload: unknown = await response.json();
  if (!isFoundationProof(payload)) {
    throw new Error('Foundation proof response is invalid');
  }

  return payload;
};
