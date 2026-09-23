import React from 'react';
import { Check, Minus, Radio, Webhook } from 'lucide-react';
import { TRANSPORT_PROVIDERS, FALLBACK_ORDER, getProvider } from '../data/transportProviders';
import { ProviderMark } from './ProviderMark';

const connectionLabel = {
  CONNECTED: 'Connected',
  AVAILABLE: 'Available',
  CONTRACT_REQUIRED: 'Contract required',
} as const;

interface TransportIntegrationsProps {
  /** Show the endpoint/auth detail. Off on the marketing page, on in the workspace. */
  showTechnicalDetail?: boolean;
}

/**
 * The integration surface: which transport providers this program can dispatch
 * to, what each one can actually carry, and the order OncoReady falls back
 * through when a trip collapses.
 */
export const TransportIntegrations: React.FC<TransportIntegrationsProps> = ({
  showTechnicalDetail = false,
}) => (
  <div className="space-y-5">
    <ol className="integration-chain" aria-label="Provider fallback order">
      {FALLBACK_ORDER.map((id, index) => {
        const provider = getProvider(id);
        return (
          <li key={id} className="integration-chain__step">
            <span className="integration-chain__index" aria-hidden="true">{index + 1}</span>
            <ProviderMark providerId={id} />
            <span className="integration-chain__window">{provider.dispatchWindow}</span>
          </li>
        );
      })}
    </ol>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {TRANSPORT_PROVIDERS.map((provider) => (
        <article key={provider.id} className="provider-card">
          <span className="provider-card__rule" style={{ backgroundColor: provider.brand }} aria-hidden="true" />

          <header className="provider-card__head">
            <div>
              <h3 className="provider-card__name">{provider.name}</h3>
              <p className="provider-card__tagline">{provider.tagline}</p>
            </div>
            <span className={`provider-card__state provider-card__state--${provider.connection.toLowerCase()}`}>
              <Radio className="h-3 w-3" aria-hidden="true" />
              {connectionLabel[provider.connection]}
            </span>
          </header>

          <p className="provider-card__summary">{provider.summary}</p>

          <ul className="provider-card__caps" aria-label={`${provider.name} capabilities`}>
            {provider.capabilities.map((capability) => (
              <li key={capability.label} data-supported={capability.supported || undefined}>
                {capability.supported
                  ? <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  : <Minus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                <span>{capability.label}</span>
                <span className="sr-only">{capability.supported ? ' supported' : ' not supported'}</span>
              </li>
            ))}
          </ul>

          {showTechnicalDetail && (
            <details className="provider-card__tech">
              <summary>Adapter detail</summary>
              <dl>
                <dt>Base</dt>
                <dd className="font-mono">{provider.apiBase}</dd>
                <dt>Auth</dt>
                <dd>{provider.auth}</dd>
                <dt>Calls</dt>
                <dd>
                  <ul className="provider-card__endpoints">
                    {provider.endpoints.map((endpoint) => <li key={endpoint} className="font-mono">{endpoint}</li>)}
                  </ul>
                </dd>
                <dt><Webhook className="inline h-3 w-3" aria-hidden="true" /> Events</dt>
                <dd className="font-mono">{provider.webhookEvents.join(', ')}</dd>
              </dl>
            </details>
          )}
        </article>
      ))}
    </div>
  </div>
);
