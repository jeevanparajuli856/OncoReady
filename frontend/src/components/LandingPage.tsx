import React, { useState } from 'react';
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Database,
  Layers3,
  HeartHandshake,
  Lock,
  MapPin,
  Network,
  Route,
  SlidersHorizontal,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  Users,
} from 'lucide-react';
import { Perspective, WorkflowState } from '../types';
import { Avatar } from './Avatar';
import { ContinuityField } from './ContinuityField';
import { LogoMark } from './Logo';
import { BENSON_CENTER, LOUISIANA_SITES, NEW_ORLEANS_PICKUP, RideMap } from './RideMap';
import { RevealVariant, ScrollReveal } from './ScrollReveal';
import { TreatmentReadinessGraph } from './TreatmentReadinessGraph';

interface LandingPageProps {
  state: WorkflowState;
  reducedMotion?: boolean;
  onOpenAuthModal: () => void;
  onSelectPerspective: (perspective: Perspective) => void;
}

const trustSignals = [
  { Icon: ShieldCheck, label: 'Human clinical authority' },
  { Icon: Lock, label: 'Permissioned caregiver view' },
  { Icon: Database, label: 'FHIR-shaped workflow mapping' },
  { Icon: Network, label: 'Deterministic audit trail' },
];

const workspaces = [
  {
    number: '01',
    title: 'Patient check-in',
    copy: 'A focused two-minute check finds the ride, cost, caregiving, or clinical concern that could disrupt the next treatment.',
    action: 'Open patient view',
    image: '/story-patient.jpg',
    tone: 'indigo',
    Icon: UserRound,
    perspective: 'PATIENT' as const,
    reveal: 'patient' as RevealVariant,
  },
  {
    number: '02',
    title: 'Staff exception hub',
    copy: 'Nursing owns the patient-reported clinical concern. Navigation owns transportation. Both remain visible on one record.',
    action: 'Open staff hub',
    image: '/story-staff.jpg',
    tone: 'coral',
    Icon: Stethoscope,
    perspective: 'STAFF' as const,
    reveal: 'staff' as RevealVariant,
  },
  {
    number: '03',
    title: 'Caregiver logistics',
    copy: 'Family can see the authorized pickup plan without receiving diagnosis details, symptom text, or nurse notes.',
    action: 'Open caregiver view',
    image: '/story-caregiver.jpg',
    tone: 'mint',
    Icon: HeartHandshake,
    perspective: 'CAREGIVER' as const,
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

const saasModel = [
  {
    label: '01 • Institutional buyer',
    title: 'Cancer centers and health systems',
    copy: 'Oncology service lines subscribe at the program level to make pre-treatment readiness an accountable operating capability.',
    features: ['Infusion operations', 'Clinical and navigation leaders'],
    tone: 'mint',
    Icon: Building2,
  },
  {
    label: '02 • Subscribed capability',
    title: 'One treatment-readiness workspace',
    copy: 'Patient check-in, accountable exception routing, a shared readiness graph, and permission-limited logistics work as one service.',
    features: ['Role-based workspaces', 'Visible ownership and closure'],
    tone: 'indigo',
    featured: true,
    Icon: Layers3,
  },
  {
    label: '03 • Configured implementation',
    title: 'Shaped around the operation',
    copy: 'Implementation aligns sites, roles, routing rules, escalation windows, and readiness checkpoints to the organization’s workflow.',
    features: ['Center-defined responsibility', 'Workflow and mapping alignment'],
    tone: 'coral',
    Icon: SlidersHorizontal,
  },
  {
    label: '04 • Expansion path',
    title: 'Grow across the care network',
    copy: 'Organizations can extend the same readiness model across additional sites, treatment programs, and operating roles.',
    features: ['Additional programs and sites', 'Shared operating model'],
    tone: 'lavender',
    Icon: Network,
  },
];

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
    answer: 'The illustrated caregiver view is deliberately narrow: pickup time, vehicle, driver, and transportation status. Clinical concern text and nurse details are excluded from that view.',
  },
  {
    question: 'How could it fit an existing health-system environment?',
    answer: 'OncoReady organizes schedules, patients, owned tasks, and communications around the treatment event. A FHIR-shaped mapping keeps those workflow objects clear for implementation planning.',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  state,
  reducedMotion = false,
  onOpenAuthModal,
  onSelectPerspective,
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
                Explore the workspace
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
            <p className="landing-section-label">One record, the right view</p>
            <h2 id="workspaces-title">Built around everyone responsible for tomorrow.</h2>
          </div>
          <p>
            Patient, staff, and caregiver experiences share one readiness state while showing only the information each person needs.
          </p>
        </div>

        <div className="landing-role-grid">
          {workspaces.map(({ Icon, ...workspace }, index) => (
            <ScrollReveal
              key={workspace.title}
              variant={workspace.reveal}
              delay={index * 80}
              reducedMotion={reducedMotion}
              className="landing-role-reveal"
            >
              <button
                type="button"
                onClick={() => onSelectPerspective(workspace.perspective)}
                className="landing-role-card"
                data-tone={workspace.tone}
              >
                <div className="landing-role-card__image">
                  <img src={workspace.image} alt="" loading="lazy" decoding="async" />
                  <span>{workspace.number}</span>
                </div>
                <div className="landing-role-card__body">
                  <span className="landing-icon-well"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <h3>{workspace.title}</h3>
                  <p>{workspace.copy}</p>
                  <span className="landing-text-link">
                    {workspace.action}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </button>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="landing-section landing-shell" aria-labelledby="readiness-proof-title">
        <div className="landing-section-heading landing-section-heading--split">
          <div>
            <p className="landing-section-label">Live product proof</p>
            <h2 id="readiness-proof-title">One report becomes accountable work.</h2>
          </div>
          <p>
            An illustrative treatment-readiness record shows who owns each blocker, what happens next, and what evidence closes the loop.
          </p>
        </div>

        <div className="landing-workspace-frame">
          <div className="landing-workspace-frame__topbar">
            <div className="landing-workspace-frame__identity">
              <LogoMark size={44} />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <strong>Treatment Readiness Workspace</strong>
                  <span className="landing-environment-pill">Illustrative record</span>
                </div>
                <p>Maria Hernandez • mFOLFOX6 Cycle 4 • Benson Cancer Center</p>
              </div>
            </div>
            <div className="landing-workspace-frame__actions">
              <button type="button" onClick={() => onSelectPerspective('PATIENT')} className="landing-button landing-button--small landing-button--secondary">
                Patient view
              </button>
              <button type="button" onClick={() => onSelectPerspective('STAFF')} className="landing-button landing-button--small landing-button--primary">
                Staff hub
              </button>
            </div>
          </div>

          <TreatmentReadinessGraph
            appointment={state.appointment}
            tasks={state.tasks}
            overallReadiness={state.overallReadiness}
            patientAcknowledged={state.patientAcknowledged}
            readinessCheckCompleted={state.readinessCheckCompleted}
            onNavigateToPatient={() => onSelectPerspective('PATIENT')}
            onNavigateToStaff={() => onSelectPerspective('STAFF')}
          />

          <button type="button" onClick={() => onSelectPerspective('STAFF')} className="landing-case-row">
            <Avatar src={state.patient.avatarUrl} alt={state.patient.name} size="lg" roleType="PATIENT" />
            <span className="landing-case-row__copy">
              <strong>{state.patient.name}</strong>
              <span>{state.appointment.treatmentName} • {state.appointment.scheduledTime}</span>
            </span>
            <span className="landing-case-row__state">Action required</span>
            <span className="landing-text-link">
              Review case <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </button>
        </div>
      </section>

      <section id="how-it-works" className="landing-section landing-section--soft" aria-labelledby="workflow-title">
        <div className="landing-shell">
          <div className="landing-section-heading landing-section-heading--center">
            <p className="landing-section-label">How the loop closes</p>
            <h2 id="workflow-title">Simple for the patient. Precise for the team.</h2>
            <p>Three moments keep a concern from disappearing into another inbox.</p>
          </div>

          <div className="landing-step-grid">
            {workflowSteps.map(({ Icon, ...step }, index) => (
              <ScrollReveal key={step.number} variant="workflow" delay={index * 60} reducedMotion={reducedMotion}>
                <article className="landing-step-card" data-tone={step.tone}>
                  <div className="landing-step-card__topline">
                    <span>{step.number}</span>
                    <span className="landing-icon-well"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  </div>
                  <p className="landing-step-card__eyebrow">{step.eyebrow}</p>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
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
                'Illustrative corridor from St. Charles Avenue to Benson Cancer Center',
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
              subtitle="Illustrative Louisiana routing • not a live dispatch feed"
              pickup={NEW_ORLEANS_PICKUP}
              destination={BENSON_CENTER}
              extras={LOUISIANA_SITES}
              height={460}
            />
          </div>
        </div>
      </section>

      <section id="pricing-section" className="landing-section landing-section--aurora" aria-labelledby="saas-title">
        <div className="landing-shell">
          <div className="landing-section-heading landing-section-heading--center">
            <p className="landing-section-label">SaaS business model</p>
            <h2 id="saas-title">One readiness capability, shaped around the oncology operation.</h2>
            <p>Subscribe at the program level, configure the operating model, and expand the same accountable loop as the organization grows.</p>
          </div>

          <div className="landing-saas-grid">
            {saasModel.map(({ Icon, ...model }, index) => (
              <ScrollReveal key={model.title} variant="saas" delay={index * 55} reducedMotion={reducedMotion}>
                <article className="landing-saas-card" data-tone={model.tone} data-featured={model.featured || undefined}>
                  <div className="landing-saas-card__topline">
                    <span className="landing-saas-card__label">{model.label}</span>
                    <span className="landing-icon-well"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  </div>
                  <h3>{model.title}</h3>
                  <p>{model.copy}</p>
                  <ul>
                    {model.features.map((feature) => (
                      <li key={feature}><Check className="h-4 w-4" aria-hidden="true" />{feature}</li>
                    ))}
                  </ul>
                </article>
              </ScrollReveal>
            ))}
          </div>

          <div className="landing-saas-action">
            <button type="button" onClick={onOpenAuthModal} className="landing-button landing-button--primary">
              Explore the product workspaces
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
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
        <div>
          <p className="landing-section-label">Keep tomorrow on the calendar</p>
          <h2 id="closing-cta-title">See one concern become a confirmed plan.</h2>
          <p>Explore the connected workspaces and follow one readiness journey from early signal to visible closure.</p>
        </div>
        <button type="button" onClick={onOpenAuthModal} className="landing-button landing-button--light">
          Explore the workspace
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </section>
    </div>
  );
};
