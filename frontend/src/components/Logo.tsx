import React from 'react';
import { cn } from '../lib/cn';

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  compact?: boolean;
  className?: string;
}

const LOGO_SRC = '/logo.svg';

export const LogoMark: React.FC<{ size?: number; className?: string; mono?: boolean }> = ({
  size = 40,
  className,
}) => (
  <img
    src={LOGO_SRC}
    alt=""
    width={size}
    height={size}
    className={cn('shrink-0', className)}
    aria-hidden="true"
  />
);

export const Logo: React.FC<LogoProps> = ({
  size = 40,
  showWordmark = true,
  compact = false,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2 select-none', className)}>
      <LogoMark size={size} />
      {showWordmark && (
        <div className="leading-none text-left">
          <div className="font-display font-extrabold tracking-tight text-ink text-[1.05rem] sm:text-[1.2rem]">
            OncoReady
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
