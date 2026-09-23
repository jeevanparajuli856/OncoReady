import React from 'react';
import { getProvider, type TransportProviderId } from '../data/transportProviders';

interface ProviderMarkProps {
  providerId: TransportProviderId;
  /** `chip` inverts onto the provider's brand colour; `inline` stays on the page ground. */
  variant?: 'chip' | 'inline';
  className?: string;
}

/**
 * The provider's name carried on its own colour, so a navigator scanning a list
 * of dispatch attempts can tell Uber from Lyft without reading a word.
 */
export const ProviderMark: React.FC<ProviderMarkProps> = ({
  providerId,
  variant = 'chip',
  className = '',
}) => {
  const provider = getProvider(providerId);

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-semibold ${className}`}>
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: provider.brand }}
          aria-hidden="true"
        />
        {provider.name}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-semibold tracking-[0.04em] ${className}`}
      style={{ backgroundColor: provider.brand, color: provider.brandFg }}
    >
      {provider.mark}
    </span>
  );
};
