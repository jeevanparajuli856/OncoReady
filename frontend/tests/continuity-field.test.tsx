import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContinuityField } from '../src/components/ContinuityField';

class ResizeObserverStub {
  observe() {}
  disconnect() {}
}

class IntersectionObserverStub {
  observe() {}
  disconnect() {}
}

class ThrowingIntersectionObserverStub {
  constructor() {
    throw new Error('IntersectionObserver unavailable');
  }
}

const canvasContext = {
  clearRect: vi.fn(),
  fillText: vi.fn(),
  setTransform: vi.fn(),
  textAlign: 'center',
  textBaseline: 'middle',
  globalAlpha: 1,
  fillStyle: '',
  font: '',
} as unknown as CanvasRenderingContext2D;

describe('ContinuityField reduced motion', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('stays static when the operating-system preference changes to reduced motion', () => {
    let matches = false;
    let changeListener: ((event: MediaQueryListEvent) => void) | undefined;
    const mediaQuery = {
      get matches() {
        return matches;
      },
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => {
        changeListener = listener;
      }),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList;

    vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery));
    vi.stubGlobal('ResizeObserver', ResizeObserverStub);
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);
    const requestAnimationFrame = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(canvasContext);

    const { getByRole } = render(<ContinuityField />);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(changeListener).toBeDefined();

    matches = true;
    act(() => changeListener?.({ matches: true } as MediaQueryListEvent));
    const scheduledBeforePointerMove = requestAnimationFrame.mock.calls.length;

    fireEvent.pointerMove(getByRole('img'), { clientX: 120, clientY: 160, pointerType: 'mouse' });

    expect(requestAnimationFrame).toHaveBeenCalledTimes(scheduledBeforePointerMove);
  });

  it.each([
    ['the API is unavailable', undefined],
    ['construction fails', ThrowingIntersectionObserverStub],
  ])('renders a static field when IntersectionObserver %s', (_label, observerImpl) => {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub);
    vi.stubGlobal('IntersectionObserver', observerImpl);
    const requestAnimationFrame = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(canvasContext);

    const { getByRole } = render(<ContinuityField />);

    expect(getByRole('img', { name: /continuity ribbon connects patient signals/i })).toBeDefined();
    expect(canvasContext.fillText).toHaveBeenCalled();
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });
});
