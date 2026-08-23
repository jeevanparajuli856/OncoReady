import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faCodeBranch,
  faUserCheck,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '../lib/cn';

const STEPS = [
  { icon: faClock, label: 'Detect', copy: 'T-24h check-in' },
  { icon: faCodeBranch, label: 'Split', copy: 'Nurse + navigator' },
  { icon: faUserCheck, label: 'Own', copy: 'Named until closed' },
  { icon: faCircleCheck, label: 'Confirm', copy: 'Patient signs off' },
] as const;

export const HowItWorksLoop: React.FC<{ className?: string }> = ({ className }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;
    const timer = window.setInterval(() => {
      setStep((current) => (current + 1) % STEPS.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className={cn(
        'h-full min-h-0 flex flex-col border-2 border-ink rounded-2xl bg-[#E0E7FF] p-5 sm:p-6',
        className
      )}
    >
      <span className="text-xs font-heading font-semibold uppercase tracking-widest text-accent">
        How it works
      </span>
      <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight mt-2">
        Treatments slip between visits, not in the chair.
      </h2>
      <ol className="mt-6 flex-1 flex flex-col justify-between gap-3 min-h-0">
        {STEPS.map((item, index) => {
          const active = index === step;
          return (
            <li key={item.label}>
              <button
                type="button"
                onClick={() => setStep(index)}
                aria-pressed={active}
                className={cn(
                  'w-full text-left flex items-center gap-3 rounded-xl border-2 px-3 py-3 transition-colors duration-300',
                  active
                    ? 'border-ink bg-white'
                    : 'border-transparent bg-white/40 text-ink/70'
                )}
              >
                <span
                  className={cn(
                    'w-10 h-10 rounded-full border-2 border-ink flex items-center justify-center shrink-0',
                    active ? 'bg-accent text-white' : 'bg-white text-ink'
                  )}
                >
                  <FontAwesomeIcon icon={item.icon} className="text-sm" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-heading font-bold">{item.label}</span>
                  <span className="block text-sm text-muted-fg">{item.copy}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
