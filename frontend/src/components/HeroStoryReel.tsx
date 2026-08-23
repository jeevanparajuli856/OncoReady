import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faHeartPulse } from '@fortawesome/free-solid-svg-icons';

const SLIDES = [
  {
    src: '/hero-clinic.jpg',
    alt: 'Oncology nurse reviewing treatment readiness on a tablet before infusion',
    eyebrow: 'Nurse view',
    title: 'Barriers owned before compounding',
  },
  {
    src: '/story-patient.jpg',
    alt: 'Patient completing the two-minute pre-infusion check-in at home',
    eyebrow: 'Patient check-in',
    title: 'Two minutes the night before',
  },
  {
    src: '/story-staff.jpg',
    alt: 'Nurse and navigator working the same exception record at the staff hub',
    eyebrow: 'Staff hub',
    title: 'One record, two owners',
  },
  {
    src: '/story-caregiver.jpg',
    alt: 'Caregiver tracking a medical transit ride without seeing clinical notes',
    eyebrow: 'Caregiver',
    title: 'The ride, never the chart',
  },
  {
    src: '/story-confirmed.jpg',
    alt: 'Patient and family reviewing a confirmed treatment-day plan',
    eyebrow: 'Confirmed plan',
    title: 'Tomorrow stays on the calendar',
  },
] as const;

const INTERVAL_MS = 3000;

export const HeroStoryReel: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    SLIDES.forEach((slide) => {
      const preload = new Image();
      preload.src = slide.src;
    });
  }, []);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      ((typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) ||
        Boolean(document.querySelector('.motion-reduce')));
    if (reduce || paused) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused]);

  const slide = SLIDES[index];

  return (
    <div
      className="relative w-full max-w-xl mx-auto lg:max-w-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="relative overflow-hidden rounded-2xl border-2 border-ink bg-[#FFF4E8] p-1.5"
        role="region"
        aria-roledescription="carousel"
        aria-label="People using OncoReady"
      >
        <div className="relative h-[20rem] sm:h-[24rem] lg:h-[26rem] overflow-hidden rounded-xl bg-muted">
          {SLIDES.map((item, i) => (
            <img
              key={item.src}
              src={item.src}
              alt={i === index ? item.alt : ''}
              draggable={false}
              className={`absolute inset-0 w-full h-full object-cover ${
                i === index ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ transition: 'opacity 900ms ease-in-out' }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="absolute top-5 left-5 card-sticker px-3 py-2 flex items-center gap-2 text-sm font-heading font-semibold text-ink">
          <FontAwesomeIcon icon={faHeartPulse} className="text-ink" />
          Live readiness
        </div>

        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
          <div className="card-sticker px-3.5 py-2.5 text-left max-w-[16rem] sm:max-w-xs">
            <p className="text-[11px] uppercase tracking-wider text-muted-fg font-heading font-semibold">{slide.eyebrow}</p>
            <p className="text-base font-heading font-semibold text-ink">{slide.title}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous story"
              onClick={() => setIndex((current) => (current - 1 + SLIDES.length) % SLIDES.length)}
              className="w-9 h-9 rounded-xl bg-white border border-ink/10 flex items-center justify-center hover:bg-muted transition"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-ink" />
            </button>
            <button
              type="button"
              aria-label="Next story"
              onClick={() => setIndex((current) => (current + 1) % SLIDES.length)}
              className="w-9 h-9 rounded-xl bg-white border border-ink/10 flex items-center justify-center hover:bg-muted transition"
            >
              <FontAwesomeIcon icon={faChevronRight} className="text-ink" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-1.5 mt-3" role="tablist" aria-label="Story slides">
        {SLIDES.map((item, i) => (
          <button
            key={item.src}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={item.eyebrow}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${
              i === index ? 'w-8 bg-ink' : 'w-2.5 bg-ink/25 hover:bg-ink/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
