import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScrollReveal } from '../src/components/ScrollReveal';

type ObserverHandler = IntersectionObserverCallback;

class IntersectionObserverStub {
  static instances: IntersectionObserverStub[] = [];

  callback: ObserverHandler;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(callback: ObserverHandler) {
    this.callback = callback;
    IntersectionObserverStub.instances.push(this);
  }

  intersect(target: Element) {
    this.callback(
      [{ target, isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

describe('ScrollReveal progressive enhancement', () => {
  afterEach(() => {
    IntersectionObserverStub.instances = [];
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('reveals once and unregisters the completed target', () => {
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);
    const { container, rerender, unmount } = render(
      <ScrollReveal variant="patient">
        <button type="button">Patient workspace</button>
      </ScrollReveal>,
    );

    const reveal = container.querySelector('[data-reveal-variant="patient"]') as HTMLElement;
    const observer = IntersectionObserverStub.instances[0];
    expect(reveal.dataset.revealState).toBe('pending');
    expect(observer.observe).toHaveBeenCalledWith(reveal);

    act(() => observer.intersect(reveal));

    expect(reveal.dataset.revealState).toBe('revealed');
    expect(observer.unobserve).toHaveBeenCalledTimes(1);

    rerender(
      <ScrollReveal variant="patient" reducedMotion>
        <button type="button">Patient workspace</button>
      </ScrollReveal>,
    );
    expect(reveal.dataset.revealState).toBe('revealed');

    rerender(
      <ScrollReveal variant="patient" reducedMotion={false}>
        <button type="button">Patient workspace</button>
      </ScrollReveal>,
    );
    expect(reveal.dataset.revealState).toBe('revealed');
    expect(IntersectionObserverStub.instances).toHaveLength(1);
    expect(observer.observe).toHaveBeenCalledTimes(1);
    expect(observer.unobserve).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('completes immediately when keyboard focus reaches pending content', () => {
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);
    const { container, getByRole, rerender, unmount } = render(
      <ScrollReveal variant="caregiver">
        <button type="button">Caregiver workspace</button>
      </ScrollReveal>,
    );

    const reveal = container.querySelector('[data-reveal-variant="caregiver"]') as HTMLElement;
    fireEvent.focus(getByRole('button'));

    expect(reveal.dataset.revealState).toBe('revealed');
    expect(IntersectionObserverStub.instances[0].unobserve).toHaveBeenCalledWith(reveal);

    rerender(
      <ScrollReveal variant="caregiver" reducedMotion>
        <button type="button">Caregiver workspace</button>
      </ScrollReveal>,
    );
    rerender(
      <ScrollReveal variant="caregiver" reducedMotion={false}>
        <button type="button">Caregiver workspace</button>
      </ScrollReveal>,
    );

    expect(reveal.dataset.revealState).toBe('revealed');
    expect(IntersectionObserverStub.instances).toHaveLength(1);
    expect(IntersectionObserverStub.instances[0].observe).toHaveBeenCalledTimes(1);
    unmount();
  });

  it('keeps content visible when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { container } = render(
      <ScrollReveal variant="staff">
        <button type="button">Staff workspace</button>
      </ScrollReveal>,
    );

    expect(
      container.querySelector('[data-reveal-variant="staff"]')?.getAttribute('data-reveal-state'),
    ).toBe('visible');
  });

  it('skips pending motion when effective reduced motion is active', () => {
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);
    const { container, rerender } = render(
      <ScrollReveal variant="workflow" reducedMotion>
        <article>Detect and route</article>
      </ScrollReveal>,
    );

    expect(
      container.querySelector('[data-reveal-variant="workflow"]')?.getAttribute('data-reveal-state'),
    ).toBe('visible');
    expect(IntersectionObserverStub.instances).toHaveLength(0);

    rerender(
      <ScrollReveal variant="workflow" reducedMotion={false}>
        <article>Detect and route</article>
      </ScrollReveal>,
    );

    expect(
      container.querySelector('[data-reveal-variant="workflow"]')?.getAttribute('data-reveal-state'),
    ).toBe('visible');
    expect(IntersectionObserverStub.instances).toHaveLength(0);
  });

  it('keeps the role-card variants distinct within one motion family', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { container } = render(
      <>
        <ScrollReveal variant="patient"><span>Patient</span></ScrollReveal>
        <ScrollReveal variant="staff"><span>Staff</span></ScrollReveal>
        <ScrollReveal variant="caregiver"><span>Caregiver</span></ScrollReveal>
      </>,
    );

    expect(
      Array.from(container.querySelectorAll('[data-reveal-variant]')).map((node) =>
        node.getAttribute('data-reveal-variant'),
      ),
    ).toEqual(['patient', 'staff', 'caregiver']);
  });
});
