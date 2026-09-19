import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/cn';

export type RevealVariant = 'patient' | 'staff' | 'caregiver' | 'workflow' | 'saas';

type RevealState = 'visible' | 'pending' | 'revealed';
type RevealCallback = () => void;

const revealCallbacks = new Map<Element, RevealCallback>();
let revealObserver: IntersectionObserver | null = null;

const releaseObserverIfIdle = () => {
  if (revealCallbacks.size === 0 && revealObserver) {
    revealObserver.disconnect();
    revealObserver = null;
  }
};

const getRevealObserver = () => {
  if (revealObserver) return revealObserver;

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const reveal = revealCallbacks.get(entry.target);
        if (!reveal) return;
        revealCallbacks.delete(entry.target);
        revealObserver?.unobserve(entry.target);
        reveal();
      });
      releaseObserverIfIdle();
    },
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
  );

  return revealObserver;
};

const observeReveal = (element: Element, callback: RevealCallback) => {
  revealCallbacks.set(element, callback);
  getRevealObserver().observe(element);
};

const stopObservingReveal = (element: Element) => {
  revealCallbacks.delete(element);
  revealObserver?.unobserve(element);
  releaseObserverIfIdle();
};

interface ScrollRevealProps {
  children: React.ReactNode;
  variant: RevealVariant;
  delay?: number;
  reducedMotion?: boolean;
  className?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant,
  delay = 0,
  reducedMotion = false,
  className,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<RevealState>('visible');

  useEffect(() => {
    const element = elementRef.current;
    if (!element || reducedMotion || typeof window.IntersectionObserver !== 'function') {
      setState('visible');
      return undefined;
    }

    setState('pending');
    observeReveal(element, () => setState('revealed'));

    return () => stopObservingReveal(element);
  }, [reducedMotion]);

  const revealForFocus = () => {
    const element = elementRef.current;
    if (state !== 'pending' || !element) return;
    stopObservingReveal(element);
    setState('revealed');
  };

  return (
    <div
      ref={elementRef}
      className={cn('scroll-reveal', className)}
      data-reveal-state={state}
      data-reveal-variant={variant}
      onFocusCapture={revealForFocus}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
};
