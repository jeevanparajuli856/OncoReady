import React, { useState } from 'react';
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  HeartHandshake,
  Lock,
  MapPin,
  Network,
  Route,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  Users,
} from 'lucide-react';
import { CareLinkMark } from './CareLinkMark';
import { ContinuityField } from './ContinuityField';
import { BENSON_CENTER, LOUISIANA_SITES, NEW_ORLEANS_PICKUP, RideMap } from './RideMap';
import { RevealVariant, ScrollReveal } from './ScrollReveal';

interface LandingPageProps {
  reducedMotion?: boolean;
  onOpenAuthModal: () => void;
}

const trustSignals = [
  { Icon: ShieldCheck, label: 'Human clinical authority' },
  { Icon: Lock, label: 'Permissioned caregiver view' },
  { Icon: Database, label: 'FHIR-shaped workflow mapping' },
  { Icon: Network, label: 'Deterministic audit trail' },
];

const rescueStages = [
  {
    number: '01',
    title: 'Surface the signal',
    copy: 'A focused check-in brings transportation, caregiving, cost, and patient-reported concerns into view before treatment day.',
    image: '/story-patient.jpg',
    tone: 'indigo',
    Icon: UserRound,
    reveal: 'patient' as RevealVariant,
  },
  {
    number: '02',
    title: 'Give the work an owner',
    copy: 'Nursing owns clinical contact. Navigation owns transportation. Each item carries a next action and due time.',
    image: '/story-staff.jpg',
    tone: 'coral',
    Icon: Stethoscope,
    reveal: 'staff' as RevealVariant,
  },
  {
    number: '03',
    title: 'Confirm the current plan',
    copy: 'The patient and authorized caregiver receive the logistics they need while clinical details stay with the care team.',
    image: '/story-caregiver.jpg',
    tone: 'mint',
    Icon: HeartHandshake,
    reveal: 'caregiver' as RevealVariant,
  },
];

const workflowSteps = [
  {
    number: '01',
    eyebrow: 'Detect',
    title: 'Ask before the treatment day',
    copy: 'The readiness check opens at T−24h and captures practical barriers alongside the patient’s own clinical words.',
    Icon: Clock3,
    tone: 'indigo',
  },
  {
    number: '02',
    eyebrow: 'Route',
    title: 'Give every blocker an owner',
    copy: 'Clinical concerns stay verbatim for nursing. Transportation barriers move to navigation with a due time and next action.',
    Icon: Route,
    tone: 'coral',
  },
  {
    number: '03',
    eyebrow: 'Confirm',
    title: 'Keep the plan open until it closes',
    copy: 'A referral is not the finish line. Staff action and patient acknowledgment create visible closure around the appointment.',
    Icon: CheckCircle2,
    tone: 'mint',
  },
];

const pricingPlans = [
  {
    label: 'For one oncology program',
    title: 'Pilot',
    price: '$1,500/month',
    billing: 'Program subscription',
    copy: 'A focused readiness program for one care team and one site.',
    features: ['5 staff seats', '1 site', 'Workspace access'],
    tone: 'indigo',
    featured: true,
    Icon: Building2,
    action: 'Buy now',
    enabled: false,
    href: null,
  },
  {
    label: 'For multi-site programs',
    title: 'Network',
    price: null,
    billing: null,
    copy: 'A tailored readiness program for larger care networks.',
    features: ['Multiple sites', 'Expanded staff access', 'Implementation planning'],
    tone: 'lavender',
    Icon: Network,
    action: 'Contact us',
    enabled: false,
    href: 'mailto:support@oncoready.me',
  },
];

type PartnerStatus = 'ACTIVE' | 'COMING_SOON';

// Uber Health and Lyft Healthcare are not connected yet: their cards say so and nothing here calls either service.
const transportPartners: { name: string; status: PartnerStatus; copy: string; note?: string }[] = [
  {
    name: 'CareLink by OncoReady',
    status: 'ACTIVE',
    copy: 'Local transport vendors accept, update or release trips in the CareLink portal, and navigation sees each change in the workspace.',
    note: 'Live in the OncoReady workspace',
  },
  {
    name: 'Uber Health',
    status: 'COMING_SOON',
    copy: 'Scheduled and on-demand rides requested on the patient\u2019s behalf, with trip status flowing back into the ride plan.',
  },
  {
    name: 'Lyft Healthcare',
    status: 'COMING_SOON',
    copy: 'Rides booked for the patient through Lyft Healthcare, so no rider needs a smartphone or an account.',
  },
];

const PartnerLogo: React.FC<{ name: string }> = ({ name }) => {
  if (name === 'Uber Health') {
    return (
      <span className="inline-flex items-center gap-1.5">
        <img src="/brands/uber-logo.svg" alt="Uber" className="h-5 w-auto" />
        <span className="font-heading font-bold text-ink">Health</span>
      </span>
    );
  }
  if (name === 'Lyft Healthcare') {
    return (
      <span className="inline-flex items-center gap-1.5">
        <img src="/brands/lyft-logo.svg" alt="Lyft" className="h-7 w-auto" />
        <span className="font-heading font-bold text-ink">Healthcare</span>
      </span>
    );
  }
  return <CareLinkMark size={28} endorsed />;
};

const faqs = [
  {
    question: 'How can OncoReady help reduce day-of treatment disruption?',
    answer: 'A short check-in surfaces a cancelled ride or patient-reported clinical concern before the appointment. Deterministic rules create separate, named work for navigation and nursing, then keep the plan open until the required people confirm it.',
  },
  {
    question: 'Does OncoReady make automated clinical decisions?',
    answer: 'No. Patient words remain unchanged and route to a named clinical team for human review. OncoReady does not diagnose, prescribe, downgrade urgency, or clear a patient for treatment.',
  },
  {
    question: 'What can an authorized caregiver see?',
    answer: 'The caregiver view is deliberately narrow: pickup time, vehicle, driver, and transportation status. Clinical concern text and nurse details are excluded from that view.',
  },
  {
    question: 'How could it fit an existing health-system environment?',
    answer: 'OncoReady organizes schedules, patients, owned tasks, and communications around the treatment event. A FHIR-shaped mapping keeps those workflow objects clear for implementation planning.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  reducedMotion = false,
  onOpenAuthModal,
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  return (
    <div className="landing-page pb-24 md:pb-14">
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero__aurora" aria-hidden="true" />
        <div className="landing-shell landing-hero__grid">
          <div className="landing-hero__copy">
            <div className="landing-eyebrow">
              <span className="landing-eyebrow__dot" />
              Treatment readiness before the chair
            </div>

            <h1 id="landing-title" className="landing-title">
              Tomorrow’s treatment.
              <span>Every blocker owned.</span>
            </h1>

            <p className="landing-lede">
              OncoReady finds what could derail the next oncology treatment, routes each concern to the right human, and keeps one plan visible until everyone confirms it.
            </p>

            <div className="landing-actions">
              <button type="button" onClick={onOpenAuthModal} className="landing-button landing-button--primary">
                Access workspace
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })}
                className="landing-button landing-button--secondary"
              >
                See how the loop closes
              </button>
            </div>

            <div className="landing-trust-grid" aria-label="Product safeguards and technical foundations">
              {trustSignals.map(({ Icon, label }) => (
                <div key={label} className="landing-trust-item">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="landing-hero__visual">
            <div className="landing-visual-kicker">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Move across the continuity field
            </div>
            <ContinuityField reducedMotion={reducedMotion} />
          </div>
        </div>
      </section>

      <section className="landing-shell landing-proof" aria-label="How the readiness loop works">
        {[
          ['T−24h', 'Barrier signal'],
          ['2 paths', 'Named owners'],
          ['1 record', 'Shared plan'],
          ['Human', 'Clinical decisions'],
        ].map(([value, label]) => (
          <div key={label} className="landing-proof__item">
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section id="workspaces" className="landing-section landing-shell" aria-labelledby="workspaces-title">
        <div className="landing-section-heading landing-section-heading--split">
          <div>
            <p className="landing-section-label">Continuity Rescue Story</p>
            <h2 id="workspaces-title">One concern becomes owned work and a confirmed plan.</h2>
          </div>
          <p>
            The public story explains the workflow without displaying a patient record. Patient records appear only after sign-in.
          </p>
        </div>

        <div className="landing-role-grid">
          {rescueStages.map(({ Icon, ...stage }, index) => (
            <ScrollReveal
              key={stage.title}
              variant={stage.reveal}
              delay={index * 80}
              reducedMotion={reducedMotion}
              className="landing-role-reveal"
            >
              <article className="landing-role-card" data-tone={stage.tone}>
                <div className="landing-role-card__image">
                  <img src={stage.image} alt="" loading="lazy" decoding="async" />
                  <span>{stage.number}</span>
                </div>
                <div className="landing-role-card__body">
                  <span className="landing-icon-well"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <h3>{stage.title}</h3>
                  <p>{stage.copy}</p>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="landing-section landing-section--soft" aria-labelledby="workflow-title">
        <div className="landing-shell">
          <div className="landing-section-heading landing-section-heading--center">
            <p className="landing-section-label">How the loop closes</p>
            <h2 id="workflow-title">Simple for the patient. Precise for the team.</h2>
            <p>Three moments keep a concern from disappearing into another inbox.</p>
          </div>

          <div className="landing-loop-road" aria-label="The three-step readiness loop">
            <div className="landing-loop-road__track" aria-hidden="true">
              <span className="landing-loop-road__dash landing-loop-road__dash--one" />
              <span className="landing-loop-road__dash landing-loop-road__dash--two" />
              <span className="landing-loop-road__dash landing-loop-road__dash--three" />
              <span className="landing-loop-road__finish">Closed</span>
            </div>
            {workflowSteps.map(({ Icon, ...step }, index) => (
              <ScrollReveal key={step.number} variant="workflow" delay={index * 60} reducedMotion={reducedMotion}>
                <article className="landing-step-card" data-tone={step.tone}>
                  <div className="landing-step-card__topline">
                    <span className="landing-step-card__number">{step.number}</span>
                    <span className="landing-icon-well"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  </div>
                  <p className="landing-step-card__eyebrow">{step.eyebrow}</p>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                  <span className="landing-step-card__marker" aria-hidden="true" />
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="business-section" className="landing-section landing-shell" aria-labelledby="business-title">
        <div className="landing-section-heading landing-section-heading--center">
          <p className="landing-section-label">The operating model</p>
          <h2 id="business-title">Built for the cancer center. Focused on the next treatment.</h2>
          <p>Centers configure the workflow; patients, nurses, navigators, and authorized caregivers use it together.</p>
        </div>

        <div className="landing-business-grid">
          {[
            { Icon: Building2, title: 'Who it serves', copy: 'Infusion operations that need a visible, accountable path from early barrier signal to confirmed treatment plan.' },
            { Icon: Users, title: 'Why ownership matters', copy: 'Every issue carries a named role, due time, next action, and closure evidence instead of ending at referral.' },
            { Icon: MapPin, title: 'Where the story begins', copy: 'Louisiana first, with rural travel, medical transportation, and existing navigation teams shaping the experience.' },
          ].map(({ Icon, title, copy }) => (
            <article key={title} className="landing-business-card">
              <span className="landing-icon-well"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="access-map" className="landing-section landing-shell" aria-labelledby="access-title">
        <div className="landing-access-grid">
          <div className="landing-access-copy">
            <p className="landing-section-label">Louisiana access story</p>
            <h2 id="access-title">When the ride is at risk, the treatment is at risk.</h2>
            <p>
              Rural miles become visible work before treatment day. Navigation owns the route, the patient sees the plan, and the caregiver receives only the authorized logistics.
            </p>
            <ul>
              {[
                'Care corridor from St. Charles Avenue to Benson Cancer Center',
                'Named navigation ownership and a visible fallback path',
                'Transportation detail for the caregiver; clinical detail stays private',
              ].map((item) => (
                <li key={item}><CheckCircle2 className="h-5 w-5" aria-hidden="true" />{item}</li>
              ))}
            </ul>
          </div>
          <div className="landing-map-frame">
            <RideMap
              title="Treatment-day corridor"
              subtitle="Louisiana care corridor"
              pickup={NEW_ORLEANS_PICKUP}
              destination={BENSON_CENTER}
              extras={LOUISIANA_SITES}
              height={460}
            />
          </div>
        </div>
      </section>

      <section id="transport-partners" className="landing-section landing-shell" aria-labelledby="partners-title">
        <div className="landing-section-heading landing-section-heading--center">
          <p className="landing-section-label">Transport partners</p>
          <h2 id="partners-title">When a ride falls through, the backup is already lined up.</h2>
          <p>OncoReady coordinates the ride with your transport partners. Uber Health and Lyft Healthcare connections are coming soon.</p>
        </div>

        <div className="landing-business-grid" data-testid="transport-partners">
          {transportPartners.map((partner) => (
            <article key={partner.name} className="landing-business-card flex flex-col" data-partner-status={partner.status}>
              <div className="flex min-h-10 flex-wrap items-center justify-between gap-3">
                <PartnerLogo name={partner.name} />
                {partner.status === 'ACTIVE' ? (
                  <span className="chip chip-mint"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />Active</span>
                ) : (
                  <span className="chip chip-sun"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" />Coming soon</span>
                )}
              </div>
              <h3 className="sr-only">{partner.name}</h3>
              <p>{partner.copy}</p>
              {partner.note && <div className="mt-auto pt-4 text-xs font-semibold text-muted-fg">{partner.note}</div>}
            </article>
          ))}
        </div>
      </section>

      <section id="pricing-section" className="landing-section landing-section--aurora" aria-labelledby="saas-title">
        <div className="landing-shell">
          <div className="landing-section-heading landing-section-heading--center">
            <p className="landing-section-label">SaaS business model</p>
            <h2 id="saas-title">One readiness capability, shaped around the oncology operation.</h2>
            <p>Subscribe at the program level, configure the operating model, and expand the same accountable loop as the organization grows.</p>
          </div>

          <div className="landing-saas-grid" data-testid="pricing-plans">
            {pricingPlans.map(({ Icon, ...plan }, index) => (
              <ScrollReveal key={plan.title} variant="saas" delay={index * 55} reducedMotion={reducedMotion}>
                <article className="landing-saas-card" data-tone={plan.tone} data-featured={plan.featured || undefined}>
                  <div className="landing-saas-card__topline">
                    <span className="landing-saas-card__label">{plan.label}</span>
                    <span className="landing-icon-well"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  </div>
                  <h3>{plan.title}</h3>
                  {plan.price && <p className="landing-plan-price">{plan.price}</p>}
                  {plan.billing && <p>{plan.billing}</p>}
                  <p>{plan.copy}</p>
                  <ul>
                    {plan.features.map((feature) => (
                      <li key={feature}><Check className="h-4 w-4" aria-hidden="true" />{feature}</li>
                    ))}
                  </ul>
                  {plan.href ? (
                    <a href={plan.href} className="landing-button landing-button--secondary">
                      {plan.action}
                    </a>
                  ) : plan.enabled ? (
                    <button type="button" onClick={onOpenAuthModal} className="landing-button landing-button--primary">
                      {plan.action}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  ) : (
                    <button type="button" disabled className="landing-button landing-button--primary" title="Purchasing is not enabled yet">
                      {plan.action}
                    </button>
                  )}
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="faq-section" className="landing-section landing-shell" aria-labelledby="faq-title">
        <div className="landing-faq-grid">
          <div className="landing-faq-intro">
            <p className="landing-section-label">Clear by design</p>
            <h2 id="faq-title">Questions worth answering up front.</h2>
            <p>How OncoReady supports accountable readiness work while keeping clinical judgment with the care team.</p>
            <div className="landing-faq-note">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              <span>Patient-reported clinical concerns always route to human review.</span>
            </div>
          </div>

          <div className="landing-faq-list">
            {faqs.map((faq, index) => {
              const expanded = activeFaq === index;
              return (
                <div key={faq.question} className="landing-faq-item">
                  <h3>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`landing-faq-answer-${index}`}
                      onClick={() => setActiveFaq(expanded ? null : index)}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown className="h-5 w-5" data-open={expanded || undefined} aria-hidden="true" />
                    </button>
                  </h3>
                  <div id={`landing-faq-answer-${index}`} hidden={!expanded}>
                    <p>{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="landing-shell landing-closing-cta" aria-labelledby="closing-cta-title">
        <div className="landing-closing-cta__glow" aria-hidden="true" />
        <figure className="landing-closing-cta__visual">
          <img
            src="/oncology-consultation.jpg"
            alt="Clinician and patient speaking during a care planning consultation"
            loading="lazy"
          />
          <figcaption>
            Care planning image • National Cancer Institute / Unsplash
          </figcaption>
        </figure>
        <div className="landing-closing-cta__copy">
          <p className="landing-section-label">Keep tomorrow on the calendar</p>
          <h2 id="closing-cta-title">One concern. One owner. One confirmed continuity plan.</h2>
          <p>Follow one patient from an early signal to visible, role-specific closure inside the workspace.</p>
        </div>
      </section>
    </div>
  );
};
