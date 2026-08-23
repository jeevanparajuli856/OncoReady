import React from 'react';
import { cn } from '../lib/cn';

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  compact?: boolean;
  className?: string;
}

export const LogoMark: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    width={size}
    height={size}
    className={cn('shrink-0', className)}
    aria-hidden="true"
  >
    <circle cx="32" cy="32" r="29" fill="#8B5CF6" />
    <circle cx="32" cy="32" r="20" fill="#FFFDF5" />
    <circle cx="32" cy="32" r="20" fill="none" stroke="#1E293B" strokeWidth="3.5" />
    <path
      d="M23 32.5 L29 38.5 L42 24.5"
      fill="none"
      stroke="#1E293B"
      strokeWidth="3.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="50" cy="18" r="6" fill="#34D399" stroke="#1E293B" strokeWidth="2.5" />
  </svg>
);

export const Logo: React.FC<LogoProps> = ({
  size = 40,
  showWordmark = true,
  compact = false,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      <LogoMark size={size} />
      {showWordmark && (
        <div className="leading-none text-left">
          <div className="font-display font-extrabold tracking-tight text-ink text-[1.15rem]">
            Onco<span className="text-accent">Ready</span>
          </div>
          {!compact && (
            <p className="text-[11px] font-medium text-muted-fg mt-0.5">
              Keep tomorrow on the calendar
            </p>
          )}
        </div>
      )}
    </div>
  );
};
