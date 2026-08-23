import React, { useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Network,
  Building2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { WorkflowState, Perspective } from '../types';
import { TreatmentReadinessGraph } from './TreatmentReadinessGraph';
import { Avatar } from './Avatar';
import { LogoMark } from './Logo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faCodeBranch,
  faTriangleExclamation,
  faBuilding,
  faCoins,
  faUsers,
  faLocationDot,
  faStethoscope,
  faHandshake,
  faDiagramProject,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { Button, FeatureMark, StickerCard } from './ui';
import { ConfettiField, Marquee } from './Decorations';
import { HeroStoryReel } from './HeroStoryReel';
import { BENSON_CENTER, LOUISIANA_SITES, NEW_ORLEANS_PICKUP, RideMap } from './RideMap';
import { PointerHighlight } from './ui/pointer-highlight';

const WorldMap = React.lazy(() => import('./ui/world-map'));

interface LandingPageProps {
  state: WorkflowState;
  onOpenAuthModal: () => void;
  onSelectPerspective: (p: Perspective) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  state,
  onOpenAuthModal,
  onSelectPerspective,
}) => {
  const [billingCycle, setBillingCycle] = useState<'ANNUAL' | 'MONTHLY'>('ANNUAL');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does OncoReady prevent same-day chemotherapy cancellations?',
      a: 'A two-minute check-in opens 24 hours before infusion. Cancelled rides go to navigation. Symptoms go to a nurse. Both have owners before compounding starts.'
    },
    {
      q: 'How does the Caregiver Privacy & Data-Minimization projection work?',
      a: 'Ana only sees the ride: pickup time, vehicle, and driver. She never sees diagnosis, symptom text, or nurse notes.'
    },
    {
      q: 'How does OncoReady fit an existing EHR environment?',
      a: 'We map schedule, patient, task, and communication data to FHIR R4. Connection details are set during implementation.'
    },
    {
      q: 'Does OncoReady use AI to make automated clinical triage decisions?',
      a: 'No. Patient words stay as written and go to a named nurse. OncoReady does not diagnose or downgrade urgency.'
    }
  ];

  const specialties = [
    {
      n: '01',
      title: 'Patient Screening',
      copy: 'A two-minute check-in finds cancelled rides and new symptoms before compounding starts.',
      go: () => onSelectPerspective('PATIENT'),
      icon: faUser,
      color: 'accent' as const,
      image: '/story-patient.jpg',
    },
    {
      n: '02',
      title: 'Staff Exception Hub',
      copy: 'Nursing owns the clinical text. Navigation owns the ride. Both stay on one record.',
      go: () => onSelectPerspective('STAFF'),
      icon: faStethoscope,
      color: 'pop' as const,
      image: '/story-staff.jpg',
    },
    {
      n: '03',
      title: 'Caregiver Logistics',
      copy: 'Family sees pickup time and vehicle only. Diagnosis and notes stay hidden.',
      go: () => onSelectPerspective('CAREGIVER'),
      icon: faHandshake,
      color: 'mint' as const,
      image: '/story-caregiver.jpg',
    },
  ];

  return (
    <div className="space-y-8 sm:space-y-10 pb-24 md:pb-10 text-ink overflow-x-clip max-w-full">

      <section className="relative pt-5 sm:pt-8 w-full px-5 sm:px-8 lg:px-12">
        <ConfettiField />
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF4E8] border-2 border-ink text-ink text-xs font-heading font-semibold tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Next-Generation Oncology Clinical Continuity Platform
            </div>

            <div className="space-y-3">
              <h1 className="font-display text-[2.15rem] sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.12] break-words">
                Zero Day-Of Chemotherapy{' '}
                <PointerHighlight
                  containerClassName="inline-block"
                  rectangleClassName="border-accent/40"
                  pointerClassName="text-pop"
                >
                  <span className="text-accent px-1">Infusion Cancellations.</span>
                </PointerHighlight>
              </h1>
              <p className="text-lg sm:text-xl text-muted-fg max-w-xl leading-relaxed">
                Find the cancelled ride or new symptom before compounding starts. Then give it an owner, a deadline, and proof it is closed.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Button onClick={onOpenAuthModal} showArrow>
                Explore Workspace
              </Button>
              <Button
                variant="secondary"
                onClick={() => document.getElementById('business-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See the business model
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 text-sm font-heading font-semibold">
              {[
                [ShieldCheck, 'Human clinical authority'],
                [Lock, 'Caregiver data minimization'],
                [Building2, 'HL7 FHIR R4 mapping'],
                [Network, 'Closed-loop ownership'],
              ].map(([Icon, label]) => (
                <span key={String(label)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF4E8] border-2 border-ink text-ink">
                  <Icon className="w-3.5 h-3.5 text-accent" strokeWidth={2} />
                  {label as string}
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6">
            <HeroStoryReel />
          </div>
        </div>
      </section>

      <Marquee items={[
        'Cancelled ride',
        'New fever',
        'Insurance delay',
        'Medication cost',
        'Caregiver unavailable',
        'Rural parish transit',
        'Pharmacy compounding clock',
        'Owned until confirmed',
      ]} />

      <section className="w-full px-5 sm:px-8 lg:px-12 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-xs font-heading font-semibold uppercase tracking-widest text-accent">Workspaces</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold mt-1">Built for every role around the chair</h2>
          </div>
          <p className="text-sm text-muted-fg max-w-md">
            One product. Three views. The same readiness record, with only the information each person is allowed to see.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {specialties.map((card) => (
            <button key={card.title} onClick={card.go} className="text-left min-w-0 w-full">
              <StickerCard className="overflow-hidden p-0 h-full">
                <img src={card.image} alt="" className="w-full h-36 sm:h-40 object-cover border-b-2 border-ink" />
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <FeatureMark tone={card.color}>
                      <FontAwesomeIcon icon={card.icon} />
                    </FeatureMark>
                    <span className="chip">{card.n}</span>
                  </div>
                  <h3 className="font-heading font-bold text-xl break-words">{card.title}</h3>
                  <p className="text-sm sm:text-base text-muted-fg leading-relaxed">{card.copy}</p>
                  <span className="inline-flex flex-col items-start text-accent font-heading font-bold text-sm">
                    Open workspace
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </StickerCard>
            </button>
          ))}
        </div>
      </section>

      <section className="w-full px-5 sm:px-8 lg:px-12">
        <StickerCard hover={false} className="p-4 sm:p-8 space-y-6 text-left relative overflow-hidden max-w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-line">
            <div className="flex items-center gap-3">
              <LogoMark size={44} />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-heading font-semibold text-ink text-base">
                    Treatment Readiness Workspace
                  </span>
                  <span className="chip chip-mint">
                    TRAINING ENVIRONMENT
                  </span>
                </div>
                <p className="text-xs text-muted-fg">
                  Patient: Maria Hernandez (54F) • mFOLFOX6 Cycle 4 • Benson Cancer Center
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onSelectPerspective('PATIENT')} className="btn-ghost btn-compact">
                Enter Patient View
              </button>
              <button onClick={() => onSelectPerspective('STAFF')} className="btn-candy btn-compact">
                Enter Staff Hub
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

          <div>
            <h3 className="font-heading font-bold text-lg mb-3">Urgent Cases</h3>
            <button
              onClick={() => onSelectPerspective('STAFF')}
              className="card-sticker w-full p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 text-left min-w-0"
            >
              <Avatar src={state.patient.avatarUrl} alt={state.patient.name} size="lg" roleType="PATIENT" />
              <div className="min-w-0 flex-1 space-y-2">
                <h4 className="font-display font-extrabold text-xl sm:text-2xl break-words">{state.patient.name}</h4>
                <p className="text-sm text-muted-fg break-words">
                  {state.appointment.treatmentName} • {state.appointment.scheduledTime}
                </p>
                <span className="chip chip-pop">ACTION_REQUIRED</span>
              </div>
              <span className="inline-flex flex-col items-start sm:items-end text-accent font-heading font-bold shrink-0">
                Review Case
                <ArrowRight className="w-5 h-5" />
              </span>
            </button>
          </div>
        </StickerCard>
      </section>

      <section id="how-it-works" className="w-full px-5 sm:px-8 lg:px-12 grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-heading font-semibold uppercase tracking-widest text-accent">How it works</span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight">
            Treatments slip between visits, not in the chair.
          </h2>
          <p className="text-base sm:text-lg text-muted-fg leading-relaxed">
            A cancelled ride or a new fever often lands in different inboxes. Patients do not know who is helping. OncoReady puts every blocker on one graph until someone owns it and the patient confirms.
          </p>
        </div>
        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
          {[
            { tone: 'accent' as const, icon: faClock, title: 'Detect at T-24h', copy: 'Text, voice, or web check-in. One report, two owned paths.' },
            { tone: 'pop' as const, icon: faCodeBranch, title: 'Split without guessing', copy: 'Clinical text stays verbatim for nursing. Logistics go to navigation.' },
            { tone: 'sun' as const, icon: faTriangleExclamation, title: 'Stay At Risk until closed', copy: 'A sent message is not success. The graph stays amber until both sides confirm.' },
            { tone: 'mint' as const, icon: faBuilding, title: 'Sell the operating system', copy: 'Health systems pay for protected chair time. Patients never get a bill from us.' },
          ].map((item) => (
            <StickerCard key={item.title} className="p-5 space-y-3">
              <FeatureMark tone={item.tone}>
                <FontAwesomeIcon icon={item.icon} />
              </FeatureMark>
              <h3 className="font-heading font-semibold text-lg">{item.title}</h3>
              <p className="text-base text-muted-fg">{item.copy}</p>
            </StickerCard>
          ))}
        </div>
      </section>

      <section id="business-section" className="w-full px-5 sm:px-8 lg:px-12 space-y-6">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-heading font-semibold uppercase tracking-widest text-pop">The business</span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold">
            Sold to the{' '}
            <PointerHighlight rectangleClassName="border-pop/40" pointerClassName="text-accent">
              <span className="px-1">cancer center</span>
            </PointerHighlight>
            . Built for the next treatment.
          </h2>
          <p className="text-base text-muted-fg">
            Centers buy it. Patients, nurses, navigators, and caregivers use it.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: faCoins, tone: 'pop' as const, title: 'Who pays', copy: 'Infusion centers, priced by site and chair volume. Implementation is a paid onboarding sprint.' },
            { icon: faUsers, tone: 'accent' as const, title: 'Why they buy', copy: 'Same-day cancellations waste drug, chair time, and nursing hours. This sells continuity.' },
            { icon: faLocationDot, tone: 'mint' as const, title: 'Where we land first', copy: 'Louisiana first. Rural parishes, medical transit, existing navigation teams.' },
          ].map((card) => (
            <StickerCard key={card.title} className="p-6 space-y-3">
              <FeatureMark tone={card.tone}>
                <FontAwesomeIcon icon={card.icon} />
              </FeatureMark>
              <h3 className="font-heading font-semibold text-xl">{card.title}</h3>
              <p className="text-base text-muted-fg leading-relaxed">{card.copy}</p>
            </StickerCard>
          ))}
        </div>

        <div className="rounded-2xl bg-ink text-cream p-6 sm:p-8 shadow-glass-lg">
          <div className="grid sm:grid-cols-4 gap-6 text-center">
            {[
              ['T-24h', 'Early barrier signal'],
              ['2 paths', 'Owned resolution'],
              ['1 record', 'Causal timeline'],
              ['$0 patient', 'Center-funded product'],
            ].map(([stat, label]) => (
              <div key={label}>
                <div className="font-display text-3xl sm:text-4xl font-semibold text-white">{stat}</div>
                <div className="text-xs font-heading font-semibold uppercase tracking-wider mt-1 text-white/60">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full px-5 sm:px-8 lg:px-12 grid lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-heading font-semibold uppercase tracking-widest text-mint">Tomorrow morning</span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold">Rural miles are a clinical risk.</h2>
          <p className="text-base text-muted-fg leading-relaxed">
            Patients travel from Terrebonne, Monroe, and Lake Charles into infusion hubs. If the ride fails, the chair sits empty. Transit gets an owner and a live route. The caregiver sees the ride, never the fever.
          </p>
          <ul className="space-y-2 text-sm">
            {['Illustrative Med-Van corridor from St. Charles Ave to Benson Suite B', 'Parish-level access nodes for a future Ochsner-shaped network', 'Caregiver sees the route. Caregiver never sees the fever.'].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5" strokeWidth={2} />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-8 min-h-[22rem]">
          <RideMap
            title="Treatment-day corridor"
            subtitle="Illustrative Louisiana routing • not a live dispatch feed"
            pickup={NEW_ORLEANS_PICKUP}
            destination={BENSON_CENTER}
            extras={LOUISIANA_SITES}
            height={480}
          />
        </div>
      </section>

      <section id="access-map" className="w-full px-5 sm:px-8 lg:px-12 grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        <div className="lg:col-span-7 space-y-2">
          <span className="text-xs font-heading font-semibold uppercase tracking-widest text-accent">Network story</span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold">
            Rural{' '}
            <PointerHighlight rectangleClassName="border-mint/40" pointerClassName="text-accent">
              <span className="px-1">connectivity</span>
            </PointerHighlight>
            {' '}is the product, not a feature.
          </h2>
          <p className="text-base text-muted-fg max-w-xl">
            Louisiana is the beachhead. The same loop can grow across countries. Training map, not a live feed.
          </p>
        </div>
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="card-sticker p-2 w-full max-w-sm overflow-hidden">
            <React.Suspense fallback={<div className="aspect-[2/1] w-full rounded-xl bg-cream" aria-hidden="true" />}>
              <WorldMap
                lineColor="#4F46E5"
                dots={[
                  { start: { lat: 64.2008, lng: -149.4937, label: 'Fairbanks' }, end: { lat: 34.0522, lng: -118.2437, label: 'Los Angeles' } },
                  { start: { lat: 64.2008, lng: -149.4937, label: 'Fairbanks' }, end: { lat: -15.7975, lng: -47.8919, label: 'Brasilia' } },
                  { start: { lat: -15.7975, lng: -47.8919, label: 'Brasilia' }, end: { lat: 38.7223, lng: -9.1393, label: 'Lisbon' } },
                  { start: { lat: 51.5074, lng: -0.1278, label: 'London' }, end: { lat: 28.6139, lng: 77.209, label: 'New Delhi' } },
                  { start: { lat: 28.6139, lng: 77.209, label: 'New Delhi' }, end: { lat: 43.1332, lng: 131.9113, label: 'Vladivostok' } },
                  { start: { lat: 28.6139, lng: 77.209, label: 'New Delhi' }, end: { lat: -1.2921, lng: 36.8219, label: 'Nairobi' } },
                ]}
              />
            </React.Suspense>
          </div>
        </div>
      </section>

      <section className="w-full px-5 sm:px-8 lg:px-12 space-y-4">
        <div>
          <span className="text-xs font-heading font-semibold uppercase tracking-widest text-accent">What you get</span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold mt-1">Four pieces. One closed loop.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { icon: faClock, tone: 'accent' as const, title: 'T-24h check-in', copy: 'Two minutes. Ride and symptoms, before compounding starts.' },
            { icon: faStethoscope, tone: 'pop' as const, title: 'Split routing', copy: 'Clinical text goes to nursing, unchanged. Transit goes to navigation.' },
            { icon: faHandshake, tone: 'mint' as const, title: 'Caregiver view', copy: 'Pickup time and vehicle only. No diagnosis. No symptom notes.' },
            { icon: faDiagramProject, tone: 'sun' as const, title: 'Readiness graph', copy: 'Every blocker, owner, and close stays on one record.' },
          ].map((pillar) => (
            <StickerCard key={pillar.title} className="p-5 space-y-3">
              <FeatureMark tone={pillar.tone}>
                <FontAwesomeIcon icon={pillar.icon} />
              </FeatureMark>
              <h3 className="font-heading font-semibold text-lg">{pillar.title}</h3>
              <p className="text-base text-muted-fg">{pillar.copy}</p>
            </StickerCard>
          ))}
        </div>
      </section>

      <section id="pricing-section" className="w-full px-5 sm:px-8 lg:px-12 space-y-5">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-heading font-semibold uppercase tracking-widest text-accent">ENTERPRISE DEPLOYMENT MODELS</span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold">Scale with your oncology operating model</h2>
          <p className="text-base text-muted-fg">Compare focused, health-system, and network configurations for treatment-readiness operations.</p>
          <div className="inline-flex items-center p-1 rounded-xl bg-white/70 border border-white/80 backdrop-blur-md text-xs font-heading font-semibold">
            <button onClick={() => setBillingCycle('ANNUAL')} className={`px-4 py-2 rounded-lg transition ${billingCycle === 'ANNUAL' ? 'bg-accent text-white' : 'text-ink'}`}>
              Annual Billing <span className="text-[10px] bg-mint/15 text-mint px-1.5 py-0.5 rounded-full ml-1">SAVE 20%</span>
            </button>
            <button onClick={() => setBillingCycle('MONTHLY')} className={`px-4 py-2 rounded-lg transition ${billingCycle === 'MONTHLY' ? 'bg-accent text-white' : 'text-ink'}`}>
              Monthly Billing
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <StickerCard className="p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="chip">Community Clinic</span>
              <h3 className="font-display text-2xl font-semibold">Community Cancer Center</h3>
              <p className="text-sm text-muted-fg">Ideal for regional outpatient clinics and community infusion centers up to 15 chairs.</p>
              <div className="font-display text-4xl font-semibold">{billingCycle === 'ANNUAL' ? 'Focused' : 'Flexible'} <span className="text-sm font-sans font-medium text-muted-fg">configuration</span></div>
              <div className="space-y-2.5 pt-2 text-sm">
                {['Up to 15 Infusion Chairs', 'Automated T-24h Patient SMS Screening', 'Oncology Nurse Triage Workbench', 'FHIR Mapping Workspace', 'Standard 8x5 Email Support'].map((f) => (
                  <div key={f} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-mint" strokeWidth={2} />{f}</div>
                ))}
              </div>
            </div>
            <button onClick={onOpenAuthModal} className="btn-ghost w-full">Get Started with Community</button>
          </StickerCard>

          <StickerCard featured className="p-6 sm:p-8 space-y-6 flex flex-col justify-between relative z-10">
            <div className="absolute top-4 right-4 chip chip-pop">
              MOST POPULAR
            </div>
            <div className="space-y-4">
              <span className="chip chip-accent">Health System</span>
              <h3 className="font-display text-2xl font-semibold">Enterprise Cancer Center</h3>
              <p className="text-sm text-muted-fg">Full-scale clinical continuity and transit automation for hospital oncology departments.</p>
              <div className="font-display text-4xl font-semibold">{billingCycle === 'ANNUAL' ? 'Enterprise' : 'Modular'} <span className="text-sm font-sans font-medium text-muted-fg">configuration</span></div>
              <div className="space-y-2.5 pt-2 text-sm">
                {['Unlimited Infusion Chairs & Suites', 'Interactive Treatment Readiness Graph Engine', 'Automated Medical Transit (Med-Van) API', 'Caregiver Data-Minimization Logistics Portal', 'Governance & Implementation Planning'].map((f) => (
                  <div key={f} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" strokeWidth={2} />{f}</div>
                ))}
              </div>
            </div>
            <button onClick={onOpenAuthModal} className="btn-candy w-full">Explore Enterprise Workspace</button>
          </StickerCard>

          <StickerCard className="p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="chip">Multi-Facility</span>
              <h3 className="font-display text-2xl font-semibold">National Network</h3>
              <p className="text-sm text-muted-fg">Custom federated architecture for multi-hospital oncology networks & NCI comprehensive centers.</p>
              <div className="font-display text-4xl font-semibold">Custom</div>
              <div className="space-y-2.5 pt-2 text-sm">
                {['Multi-Hospital Federated Architecture', 'Cross-Center Chair Load Balancing', 'Custom Bi-Directional Order Interfaces', 'Dedicated Medical & Technical Director'].map((f) => (
                  <div key={f} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-mint" strokeWidth={2} />{f}</div>
                ))}
              </div>
            </div>
            <button onClick={onOpenAuthModal} className="btn-ghost w-full">Contact Sales & Solution Architects</button>
          </StickerCard>
        </div>
      </section>

      <section className="w-full px-5 sm:px-8 lg:px-12 grid lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1">
            <h2 className="font-display text-3xl font-semibold">Frequently Asked Questions</h2>
            <p className="text-sm text-muted-fg">Everything you need to know about OncoReady's barrier detection and hospital integration.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="card-sticker overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 flex items-center justify-between text-left font-heading font-semibold text-sm hover:bg-white/50 transition"
                >
                  <span>{faq.q}</span>
                  <span className="text-muted-fg text-lg leading-none ml-3">{activeFaq === idx ? '−' : '+'}</span>
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 text-sm text-muted-fg leading-relaxed border-t border-line pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 via-accent to-brand-700 text-white p-7 sm:p-8 h-full min-h-[22rem] flex flex-col justify-center space-y-5 shadow-glass-lg">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_40%)]" aria-hidden="true" />
            <h2 className="font-display text-2xl sm:text-3xl font-semibold relative z-10">
              Ready to eliminate day-of infusion chair loss?
            </h2>
            <p className="text-sm text-white/80 relative z-10">
              Experience the full treatment readiness golden path in our live clinical simulation workspace.
            </p>
            <Button variant="sun" onClick={onOpenAuthModal} showArrow className="relative z-10 self-start">
              Explore Workspace
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
