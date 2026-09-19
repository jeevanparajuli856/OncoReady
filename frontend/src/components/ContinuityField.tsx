import React, { useEffect, useRef, useState } from 'react';

interface ContinuityFieldProps {
  reducedMotion?: boolean;
  className?: string;
}

interface Point {
  x: number;
  y: number;
}

interface Particle extends Point {
  targetX: number;
  targetY: number;
  velocityX: number;
  velocityY: number;
  glyph: string;
  size: number;
  seed: number;
}

const GLYPHS = ['+', '·', 'o', '1', '0', 'care', '24'];

const cubicPoint = (start: Point, controlA: Point, controlB: Point, end: Point, t: number) => {
  const inverse = 1 - t;
  return {
    x:
      inverse ** 3 * start.x +
      3 * inverse ** 2 * t * controlA.x +
      3 * inverse * t ** 2 * controlB.x +
      t ** 3 * end.x,
    y:
      inverse ** 3 * start.y +
      3 * inverse ** 2 * t * controlA.y +
      3 * inverse * t ** 2 * controlB.y +
      t ** 3 * end.y,
  };
};

const cubicTangent = (start: Point, controlA: Point, controlB: Point, end: Point, t: number) => {
  const inverse = 1 - t;
  return {
    x:
      3 * inverse ** 2 * (controlA.x - start.x) +
      6 * inverse * t * (controlB.x - controlA.x) +
      3 * t ** 2 * (end.x - controlB.x),
    y:
      3 * inverse ** 2 * (controlA.y - start.y) +
      6 * inverse * t * (controlB.y - controlA.y) +
      3 * t ** 2 * (end.y - controlB.y),
  };
};

const RIBBON_SEGMENTS: [Point, Point, Point, Point][] = [
  [
    { x: 0.5, y: 0.1 },
    { x: 0.23, y: 0.11 },
    { x: 0.17, y: 0.36 },
    { x: 0.44, y: 0.52 },
  ],
  [
    { x: 0.44, y: 0.52 },
    { x: 0.55, y: 0.64 },
    { x: 0.67, y: 0.8 },
    { x: 0.74, y: 0.91 },
  ],
  [
    { x: 0.5, y: 0.1 },
    { x: 0.77, y: 0.11 },
    { x: 0.83, y: 0.36 },
    { x: 0.56, y: 0.52 },
  ],
  [
    { x: 0.56, y: 0.52 },
    { x: 0.45, y: 0.64 },
    { x: 0.33, y: 0.8 },
    { x: 0.26, y: 0.91 },
  ],
];

const buildParticles = (width: number, height: number): Particle[] => {
  const particles: Particle[] = [];
  const offsets = [-9, -3, 3, 9];

  RIBBON_SEGMENTS.forEach((segment, segmentIndex) => {
    for (let step = 0; step <= 44; step += 1) {
      const t = step / 44;
      const point = cubicPoint(...segment, t);
      const tangent = cubicTangent(...segment, t);
      const tangentLength = Math.hypot(tangent.x * width, tangent.y * height) || 1;
      const normalX = (-tangent.y * height) / tangentLength;
      const normalY = (tangent.x * width) / tangentLength;

      offsets.forEach((offset, offsetIndex) => {
        const index = particles.length;
        const targetX = point.x * width + normalX * offset;
        const targetY = point.y * height + normalY * offset;
        const deterministicX = Math.sin(index * 1.91 + segmentIndex) * 10;
        const deterministicY = Math.cos(index * 1.37 + offsetIndex) * 10;
        particles.push({
          x: targetX + deterministicX,
          y: targetY + deterministicY,
          targetX,
          targetY,
          velocityX: 0,
          velocityY: 0,
          glyph: GLYPHS[(index + segmentIndex + offsetIndex) % GLYPHS.length],
          size: 6 + ((index * 7) % 4),
          seed: index * 0.73,
        });
      });
    }
  });

  return particles;
};

export const ContinuityField: React.FC<ContinuityFieldProps> = ({
  reducedMotion = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(() =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const motionReduced = reducedMotion || systemReducedMotion;

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => setSystemReducedMotion(event.matches);

    setSystemReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!container || !canvas || !context) return undefined;

    setCanvasReady(true);
    let particles: Particle[] = [];
    let animationFrame = 0;
    let animationRunning = false;
    let visible = true;
    let documentVisible = document.visibilityState !== 'hidden';
    let lastPointerAt = 0;
    let width = 0;
    let height = 0;
    const pointer = { x: 0, y: 0, active: false };

    const draw = (time = 0, update = false) => {
      context.clearRect(0, 0, width, height);
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      particles.forEach((particle, index) => {
        const deltaX = particle.x - pointer.x;
        const deltaY = particle.y - pointer.y;
        const distance = Math.hypot(deltaX, deltaY) || 1;
        const withinPointer = pointer.active && distance < 92;

        if (update) {
          particle.velocityX += (particle.targetX - particle.x) * 0.036;
          particle.velocityY += (particle.targetY - particle.y) * 0.036;

          if (withinPointer) {
            const force = (1 - distance / 92) * 1.8;
            particle.velocityX += (deltaX / distance) * force;
            particle.velocityY += (deltaY / distance) * force;
          }

          particle.velocityX *= 0.84;
          particle.velocityY *= 0.84;
          particle.x += particle.velocityX;
          particle.y += particle.velocityY;
        } else {
          particle.x = particle.targetX;
          particle.y = particle.targetY;
        }

        const shimmer = Math.sin(time * 0.0008 + particle.seed) * 0.08;
        const isMint = index % 13 === 0;
        context.globalAlpha = withinPointer ? 0.96 : 0.62 + shimmer;
        context.fillStyle = withinPointer ? '#F26B63' : isMint ? '#059669' : '#4F46E5';
        context.font = `${particle.size}px "JetBrains Mono", monospace`;
        context.fillText(particle.glyph, particle.x, particle.y);
      });
      context.globalAlpha = 1;
    };

    const animate = (time: number) => {
      if (motionReduced || !visible || !documentVisible) {
        animationRunning = false;
        draw(0, false);
        return;
      }

      if (pointer.active && time - lastPointerAt > 520) pointer.active = false;
      draw(time, true);

      const stillMoving = particles.some(
        (particle) =>
          Math.abs(particle.targetX - particle.x) > 0.12 ||
          Math.abs(particle.targetY - particle.y) > 0.12 ||
          Math.abs(particle.velocityX) > 0.05 ||
          Math.abs(particle.velocityY) > 0.05,
      );

      if (pointer.active || stillMoving) {
        animationFrame = window.requestAnimationFrame(animate);
      } else {
        animationRunning = false;
        draw(0, false);
      }
    };

    const startAnimation = () => {
      if (motionReduced || !visible || !documentVisible) {
        window.cancelAnimationFrame(animationFrame);
        animationRunning = false;
        draw(0, false);
        return;
      }
      if (animationRunning) return;
      animationRunning = true;
      animationFrame = window.requestAnimationFrame(animate);
    };

    const resize = () => {
      const bounds = container.getBoundingClientRect();
      width = Math.max(280, bounds.width);
      height = Math.max(340, bounds.height);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      particles = buildParticles(width, height);
      draw(0, false);
      startAnimation();
    };

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.active = event.pointerType !== 'touch';
      lastPointerAt = performance.now();
      startAnimation();
    };

    const handlePointerLeave = () => {
      pointer.active = false;
      startAnimation();
    };

    const handleVisibility = () => {
      documentVisible = document.visibilityState !== 'hidden';
      startAnimation();
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        startAnimation();
      },
      { threshold: 0.08 },
    );

    resizeObserver.observe(container);
    intersectionObserver.observe(container);
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibility);
    resize();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [motionReduced]);

  return (
    <div
      ref={containerRef}
      className={`continuity-field ${className}`}
      role="img"
      aria-label="A continuity ribbon connects patient signals to clinical and navigation owners, then to one confirmed plan."
    >
      <div className="continuity-field__halo" aria-hidden="true" />
      <svg
        viewBox="0 0 340 380"
        className={`continuity-field__fallback ${canvasReady ? 'opacity-[0.08]' : 'opacity-60'}`}
        aria-hidden="true"
      >
        <path d="M170 38 C78 42 58 139 150 198 C188 231 220 280 252 345" />
        <path d="M170 38 C262 42 282 139 190 198 C152 231 120 280 88 345" />
      </svg>
      <canvas ref={canvasRef} className="continuity-field__canvas" aria-hidden="true" />

      <div className="continuity-field__label continuity-field__label--signal" aria-hidden="true">
        <span /> T−24h signal
      </div>
      <div className="continuity-field__label continuity-field__label--clinical" aria-hidden="true">
        Clinical → nurse
      </div>
      <div className="continuity-field__label continuity-field__label--navigation" aria-hidden="true">
        Logistics → navigation
      </div>
      <div className="continuity-field__label continuity-field__label--confirmed" aria-hidden="true">
        One confirmed plan
      </div>
    </div>
  );
};
