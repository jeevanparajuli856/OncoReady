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

const getRevealObserver = (): IntersectionObserver | null => {
  if (revealObserver) return revealObserver;

  try {
    revealObserver = new window.IntersectionObserver(
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
  } catch {
    revealObserver = null;
  }

  return revealObserver;
};

const observeReveal = (element: Element, callback: RevealCallback) => {
  const observer = getRevealObserver();
  if (!observer) return false;

  revealCallbacks.set(element, callback);
  try {
    observer.observe(element);
    return true;
  } catch {
    revealCallbacks.delete(element);
    releaseObserverIfIdle();
    return false;
  }
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
  const completedRef = useRef(false);
  const [state, setState] = useState<RevealState>('visible');

  useEffect(() => {
    const element = elementRef.current;
    if (!element || completedRef.current) return undefined;

    if (reducedMotion || typeof window.IntersectionObserver !== 'function') {
      completedRef.current = true;
      setState('visible');
      return undefined;
    }

    setState('pending');
    const observing = observeReveal(element, () => {
      completedRef.current = true;
      setState('revealed');
    });
    if (!observing) {
      completedRef.current = true;
      setState('visible');
      return undefined;
    }

    return () => stopObservingReveal(element);
  }, [reducedMotion]);

  const revealForFocus = () => {
    const element = elementRef.current;
    if (state !== 'pending' || !element) return;
    completedRef.current = true;
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
