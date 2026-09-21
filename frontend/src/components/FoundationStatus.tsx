import React, { useCallback, useEffect, useState } from 'react';
import { CircleAlert, Database, LoaderCircle, RefreshCw } from 'lucide-react';
import { FoundationProof, getFoundationProof } from '../api/foundation';

type FoundationStatusState =
  | { status: 'loading'; proof: null }
  | { status: 'persisted'; proof: FoundationProof }
  | { status: 'unavailable'; proof: null };

const iconStroke = { strokeWidth: 2 } as const;

export const FoundationStatus: React.FC<{ apiOrigin?: string }> = ({
  apiOrigin = import.meta.env.VITE_API_ORIGIN,
}) => {
  const [state, setState] = useState<FoundationStatusState>({ status: 'loading', proof: null });
  const [requestKey, setRequestKey] = useState(0);

  const refresh = useCallback(() => {
    setState({ status: 'loading', proof: null });
    setRequestKey((key) => key + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    getFoundationProof(apiOrigin ?? '', controller.signal)
      .then((proof) => setState({ status: 'persisted', proof }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setState({ status: 'unavailable', proof: null });
      });

    return () => controller.abort();
  }, [apiOrigin, requestKey]);

  const isLoading = state.status === 'loading';
  const isPersisted = state.status === 'persisted';
  const label = isLoading
    ? 'Checking persisted state'
    : isPersisted
      ? 'Persistent foundation connected'
      : 'Persistent foundation unavailable';
  const detail = isPersisted
    ? `${state.proof.value} · seed v${state.proof.seedVersion}`
    : isLoading
      ? 'Reading public API proof'
      : 'The local workflow remains available';

  return (
    <div
      className="foundation-status"
      data-state={state.status}
    >
      <span className="foundation-status__icon" aria-hidden="true">
        {isLoading ? (
          <LoaderCircle className="h-4 w-4 animate-spin" {...iconStroke} />
        ) : isPersisted ? (
          <Database className="h-4 w-4" {...iconStroke} />
        ) : (
          <CircleAlert className="h-4 w-4" {...iconStroke} />
        )}
      </span>
      <span
        className="foundation-status__copy"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <strong>{label}</strong>
        <span title={detail}>{detail}</span>
      </span>
      <button
        type="button"
        className="foundation-status__refresh"
        onClick={refresh}
        disabled={isLoading}
        aria-label={isLoading ? 'Checking persistent foundation' : 'Check persistent foundation again'}
      >
        <RefreshCw className="h-3.5 w-3.5" {...iconStroke} aria-hidden="true" />
      </button>
    </div>
  );
};
