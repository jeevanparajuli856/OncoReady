import React from 'react';
import { cn } from '../lib/cn';

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  compact?: boolean;
  className?: string;
}

const LOGO_SRC = '/logo.svg';
const TITLE_LOGO_SRC = '/oncoready-title-logo.svg';

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
  if (!showWordmark) {
    return <LogoMark size={size} className={className} />;
  }

  const width = Math.round(size * (compact ? 4.35 : 4.84375));

  return (
    <img
      src={TITLE_LOGO_SRC}
      alt="OncoReady: Keep tomorrow on the calendar"
      width={width}
      height={size}
      className={cn('block shrink-0 select-none object-contain object-left', className)}
    />
  );
};
