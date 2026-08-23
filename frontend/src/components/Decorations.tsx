import React from 'react';
import { cn } from '../lib/cn';

export const ConfettiField: React.FC<{ className?: string; dense?: boolean }> = ({
  className,
  dense = false,
}) => (
  <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
    <span className="absolute top-8 left-[8%] w-10 h-10 rounded-full bg-sun/70 hidden md:block" />
    <span className="absolute top-24 right-[12%] w-8 h-8 bg-pop/60 rotate-12 hidden md:block" />
    <span className="absolute bottom-16 left-[18%] w-0 h-0 border-l-[14px] border-r-[14px] border-b-[24px] border-l-transparent border-r-transparent border-b-mint/70 hidden lg:block" />
    <span className="absolute top-[42%] right-[6%] w-14 h-14 rounded-full border-[6px] border-accent/30 hidden lg:block" />
    <span className="absolute bottom-10 right-[22%] w-16 h-5 rounded-full bg-accent/15 hidden md:block" />
    {dense && (
      <>
        <span className="absolute top-40 left-[28%] w-3 h-3 rounded-full bg-pop hidden md:block" />
        <span className="absolute top-16 left-[48%] w-3 h-3 rounded-full bg-mint hidden md:block" />
        <span className="absolute bottom-28 right-[40%] w-3 h-3 bg-sun rotate-45 hidden md:block" />
      </>
    )}
  </div>
);

export const Squiggle: React.FC<{ className?: string; color?: string }> = ({
  className,
  color = '#8B5CF6',
}) => (
  <svg viewBox="0 0 220 18" className={cn('w-40 h-4', className)} aria-hidden="true">
    <path
      d="M3 12 C 22 2, 40 22, 58 12 S 94 2, 112 12 148 22, 166 12 202 2, 217 12"
      fill="none"
      stroke={color}
      strokeWidth="3.5"
      strokeLinecap="round"
    />
  </svg>
);

export const Marquee: React.FC<{ items: string[] }> = ({ items }) => (
  <div className="overflow-hidden border-y border-ink/10 bg-white">
    <div className="flex w-max animate-marquee py-2.5 will-change-transform">
      {[...items, ...items].map((item, index) => (
        <span key={`${item}-${index}`} className="flex items-center gap-3 px-5 font-heading font-semibold text-sm text-ink">
          <span className="w-2.5 h-2.5 rounded-full bg-accent" />
          {item}
        </span>
      ))}
    </div>
  </div>
);
