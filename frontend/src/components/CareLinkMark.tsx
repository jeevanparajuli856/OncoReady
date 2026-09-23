import React from 'react';

interface CareLinkMarkProps {
  size?: number;
  /** Light text for dark CareLink surfaces. */
  inverted?: boolean;
  /** Adds the "by OncoReady" endorsement that marks CareLink as an OncoReady sub-brand. */
  endorsed?: boolean;
  className?: string;
}

/**
 * CareLink sub-brand lockup. The mark reuses OncoReady's continuity loop; the check becomes a
 * dotted route from pickup to OncoReady's node, now indigo as the tie back to the parent brand.
 */
export const CareLinkMark: React.FC<CareLinkMarkProps> = ({ size = 28, inverted = false, endorsed = false, className = '' }) => (
  <span className={`inline-flex items-center gap-2 ${className}`} role="img" aria-label={endorsed ? 'CareLink by OncoReady' : 'CareLink'}>
    <img src="/carelink-mark.svg" alt="" width={size} height={size} className="shrink-0" aria-hidden="true" />
    <span className="inline-flex flex-col leading-none" aria-hidden="true">
      <span className={`font-heading font-extrabold tracking-tight ${inverted ? 'text-white' : 'text-ink'}`} style={{ fontSize: size * 0.62 }}>
        Care<span className={inverted ? 'text-emerald-300' : 'text-[#0E7C66]'}>Link</span>
      </span>
      {endorsed && (
        <span className={`inline-flex items-center gap-1 font-semibold mt-1 ${inverted ? 'text-emerald-100/85' : 'text-muted-fg'}`} style={{ fontSize: Math.max(9, size * 0.3) }}>
          by <img src="/logo.svg" alt="" width={Math.max(10, size * 0.36)} height={Math.max(10, size * 0.36)} className="inline-block rounded-[3px]" /> OncoReady
        </span>
      )}
    </span>
  </span>
);
