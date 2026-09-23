import React from 'react';

interface CareLinkMarkProps {
  size?: number;
  /** Light text for dark CareLink surfaces. */
  inverted?: boolean;
  className?: string;
}

/** CareLink wordmark: OncoReady's vendor portal brand. */
export const CareLinkMark: React.FC<CareLinkMarkProps> = ({ size = 28, inverted = false, className = '' }) => (
  <span className={`inline-flex items-center gap-2 ${className}`} role="img" aria-label="CareLink">
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#0E7C66" />
      <path d="M11.5 12.5a4.5 4.5 0 0 1 6.36 0l1.64 1.64a4.5 4.5 0 0 1 0 6.36" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M20.5 19.5a4.5 4.5 0 0 1-6.36 0l-1.64-1.64a4.5 4.5 0 0 1 0-6.36" fill="none" stroke="#A7F3D0" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
    <span className={`font-heading font-extrabold tracking-tight leading-none ${inverted ? 'text-white' : 'text-ink'}`} style={{ fontSize: size * 0.62 }}>
      Care<span className={inverted ? 'text-emerald-200' : 'text-[#0E7C66]'}>Link</span>
    </span>
  </span>
);
