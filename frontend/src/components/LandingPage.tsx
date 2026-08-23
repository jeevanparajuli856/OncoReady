import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Stethoscope,
  HeartHandshake,
  ShieldCheck,
  Network,
  Building2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lock,
  Banknote,
  MapPinned,
  Users,
} from 'lucide-react';
import { WorkflowState, Perspective } from '../types';
import { TreatmentReadinessGraph } from './TreatmentReadinessGraph';
import { Avatar } from './Avatar';
import { LogoMark } from './Logo';
import { Button, IconBubble, StickerCard } from './ui';
import { ConfettiField, Marquee, Squiggle } from './Decorations';
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

  return (
    <div className="space-y-12 pb-28 animate-pop text-ink overflow-x-clip max-w-full">

      <section className="relative pt-6 sm:pt-10 w-full px-5 sm:px-8 lg:px-12">
        <ConfettiField />
        <div className="absolute -top-6 left-8 w-64 h-64 rounded-full bg-sun/40 hidden md:block -z-10" />

        <div className="text-center space-y-7 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-ink shadow-pop text-ink text-xs font-heading font-bold">
            <Sparkles className="w-3.5 h-3.5 text-accent" strokeWidth={2.5} />
            <span>Next-Generation Oncology Clinical Continuity Platform</span>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="font-display text-3xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] break-words">
              Zero Day-Of Chemotherapy <br className="hidden sm:inline" />
              <PointerHighlight
                containerClassName="inline-block mx-auto mt-2"
                rectangleClassName="border-accent"
                pointerClassName="text-pop"
              >
                <span className="text-accent px-1">Infusion Cancellations.</span>
              </PointerHighlight>
            </h1>
            <Squiggle className="mx-auto" />
            <p className="text-base sm:text-lg text-muted-fg max-w-2xl mx-auto leading-relaxed">
              Find the cancelled ride or new symptom before compounding starts. Then give it an owner, a deadline, and proof it is closed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
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

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-heading font-bold">
            {[
              [ShieldCheck, 'Human clinical authority'],
              [Lock, 'Caregiver data minimization'],
              [Building2, 'HL7 FHIR R4 mapping'],
              [Network, 'Closed-loop ownership'],
            ].map(([Icon, label]) => (
              <span key={String(label)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border-2 border-ink">
                <Icon className="w-3.5 h-3.5 text-accent" strokeWidth={2.5} />
                {label as string}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-10">
          <StickerCard hover={false} featured className="p-4 sm:p-8 space-y-6 text-left relative overflow-hidden max-w-full">
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-mint/40 border-2 border-ink hidden sm:block" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-ink/10">
              <div className="flex items-center gap-3">
                <LogoMark size={44} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-ink text-base">
                      Treatment Readiness Workspace
                    </span>
                    <span className="text-[10px] font-heading font-bold px-2 py-0.5 rounded-full bg-mint/30 text-ink border-2 border-ink">
                      TRAINING ENVIRONMENT
                    </span>
                  </div>
                  <p className="text-xs text-muted-fg">
                    Patient: Maria Hernandez (54F) • mFOLFOX6 Cycle 4 • Benson Cancer Center
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onSelectPerspective('PATIENT')} className="px-3.5 py-2 bg-white border-2 border-ink rounded-full font-heading font-bold text-xs hover:bg-sun transition">
                  Enter Patient View
                </button>
                <button onClick={() => onSelectPerspective('STAFF')} className="px-3.5 py-2 bg-ink text-white border-2 border-ink rounded-full font-heading font-bold text-xs hover:bg-accent transition">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {[
                { title: '1. Patient Screening', copy: '2-minute pre-infusion screening detecting cancelled rides and symptoms.', go: () => onSelectPerspective('PATIENT'), color: 'accent' as const, avatar: <Avatar src={state.patient.avatarUrl} alt="Maria" size="xs" roleType="PATIENT" /> },
                { title: '2. Staff Exception Hub', copy: 'Dual-task nurse clinical triage and navigator Med-Van dispatch.', go: () => onSelectPerspective('STAFF'), color: 'sun' as const, avatar: <div className="flex -space-x-2"><Avatar alt="Sarah RN" size="xs" roleType="NURSE" /><Avatar alt="Marcus MSW" size="xs" roleType="NAVIGATOR" /></div> },
                { title: '3. Caregiver Logistics', copy: 'Real-time ride tracking with 100% patient clinical privacy protection.', go: () => onSelectPerspective('CAREGIVER'), color: 'mint' as const, avatar: <Avatar src={state.caregiver.avatarUrl} alt="Ana" size="xs" roleType="CAREGIVER" /> },
              ].map((card) => (
                <button key={card.title} onClick={card.go} className="text-left p-4 rounded-xl border-2 border-ink bg-cream hover:-rotate-1 hover:scale-[1.02] transition-transform duration-300 ease-bouncey space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-sm text-ink">{card.title}</span>
                    {card.avatar}
                  </div>
                  <p className="text-[12px] text-muted-fg">{card.copy}</p>
                </button>
              ))}
            </div>
          </StickerCard>
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

      <section id="how-it-works" className="w-full px-5 sm:px-8 lg:px-12 grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-heading font-bold uppercase tracking-widest text-accent">How it works</span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-tight">
            Treatments slip between visits, not in the chair.
          </h2>
          <p className="text-sm sm:text-base text-muted-fg leading-relaxed">
            A cancelled ride or a new fever often lands in different inboxes. Patients do not know who is helping. OncoReady puts every blocker on one graph until someone owns it and the patient confirms.
          </p>
        </div>
        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
          {[
            { color: 'accent' as const, title: 'Detect at T-24h', copy: 'Text, voice, or web check-in. One report, two owned paths.' },
            { color: 'pop' as const, title: 'Split without guessing', copy: 'Clinical text stays verbatim for nursing. Logistics go to navigation.' },
            { color: 'sun' as const, title: 'Stay At Risk until closed', copy: 'A sent message is not success. The graph stays amber until both sides confirm.' },
            { color: 'mint' as const, title: 'Sell the operating system', copy: 'Health systems pay for protected chair time. Patients never get a bill from us.' },
          ].map((item) => (
            <StickerCard key={item.title} className="p-5 space-y-3">
              <IconBubble color={item.color}>
                <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} />
              </IconBubble>
              <h3 className="font-heading font-bold text-lg">{item.title}</h3>
              <p className="text-sm text-muted-fg">{item.copy}</p>
            </StickerCard>
          ))}
        </div>
      </section>

      <section id="business-section" className="w-full px-5 sm:px-8 lg:px-12 space-y-6">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-heading font-bold uppercase tracking-widest text-pop">The business</span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold">
            Sold to the{' '}
            <PointerHighlight rectangleClassName="border-sun" pointerClassName="text-accent">
              <span className="px-1">cancer center</span>
            </PointerHighlight>
            . Built for the next treatment.
          </h2>
          <p className="text-sm text-muted-fg">
            Centers buy it. Patients, nurses, navigators, and caregivers use it.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Banknote, color: 'sun' as const, title: 'Who pays', copy: 'Infusion centers, priced by site and chair volume. Implementation is a paid onboarding sprint.' },
            { icon: Users, color: 'accent' as const, title: 'Why they buy', copy: 'Same-day cancellations waste drug, chair time, and nursing hours. This sells continuity.' },
            { icon: MapPinned, color: 'mint' as const, title: 'Where we land first', copy: 'Louisiana first. Rural parishes, medical transit, existing navigation teams.' },
          ].map((card) => (
            <StickerCard key={card.title} className="p-6 space-y-3">
              <IconBubble color={card.color}>
                <card.icon className="w-5 h-5" strokeWidth={2.5} />
              </IconBubble>
              <h3 className="font-heading font-bold text-xl">{card.title}</h3>
              <p className="text-sm text-muted-fg leading-relaxed">{card.copy}</p>
            </StickerCard>
          ))}
        </div>

        <StickerCard hover={false} className="p-6 sm:p-8 bg-ink text-cream !shadow-pop-sun">
          <div className="grid sm:grid-cols-4 gap-6 text-center">
            {[
              ['T-24h', 'Early barrier signal'],
              ['2 paths', 'Owned resolution'],
              ['1 record', 'Causal timeline'],
              ['$0 patient', 'Center-funded product'],
            ].map(([stat, label]) => (
              <div key={label}>
                <div className="font-display text-3xl sm:text-4xl font-extrabold text-sun">{stat}</div>
                <div className="text-xs font-heading font-bold uppercase tracking-wider mt-1">{label}</div>
              </div>
            ))}
          </div>
        </StickerCard>
      </section>

      <section className="w-full px-5 sm:px-8 lg:px-12 grid lg:grid-cols-2 gap-6 items-stretch">
        <div className="space-y-3">
          <span className="text-xs font-heading font-bold uppercase tracking-widest text-mint">Tomorrow morning</span>
          <h2 className="font-display text-3xl font-extrabold">Rural miles are a clinical risk.</h2>
          <p className="text-sm text-muted-fg leading-relaxed">
            Patients travel from Terrebonne, Monroe, and Lake Charles into infusion hubs. If the ride fails, the chair sits empty. Transit gets an owner and a live route. The caregiver sees the ride, never the fever.
          </p>
          <ul className="space-y-2 text-sm">
            {['Illustrative Med-Van corridor from St. Charles Ave to Benson Suite B', 'Parish-level access nodes for a future Ochsner-shaped network', 'Caregiver sees the route. Caregiver never sees the fever.'].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5" strokeWidth={2.5} />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <RideMap
          title="Treatment-day corridor"
          subtitle="Illustrative Louisiana routing • not a live dispatch feed"
          pickup={NEW_ORLEANS_PICKUP}
          destination={BENSON_CENTER}
          extras={LOUISIANA_SITES}
          height={320}
        />
      </section>

      <section id="access-map" className="w-full px-5 sm:px-8 lg:px-12 grid lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-heading font-bold uppercase tracking-widest text-accent">Network story</span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold">
            Rural{' '}
            <PointerHighlight rectangleClassName="border-mint" pointerClassName="text-accent">
              <span className="px-1">connectivity</span>
            </PointerHighlight>
            {' '}is the product, not a feature.
          </h2>
          <p className="text-sm text-muted-fg">
            Louisiana is the beachhead. The same loop can grow across countries. Training map, not a live feed.
          </p>
        </div>
        <div className="lg:col-span-7 flex justify-center lg:justify-end">
          <div className="card-sticker p-3 w-full max-w-md overflow-hidden">
            <React.Suspense fallback={<div className="aspect-[2/1] w-full rounded-xl bg-cream" aria-hidden="true" />}>
              <WorldMap
                lineColor="#8B5CF6"
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

      <section className="w-full px-5 sm:px-8 lg:px-12 space-y-6">
        <div>
          <span className="text-xs font-heading font-bold uppercase tracking-widest text-accent">What you get</span>
          <h2 className="font-display text-3xl font-extrabold mt-1">Four pieces. One closed loop.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { icon: Clock, color: 'accent' as const, title: 'T-24h check-in', copy: 'Two minutes. Ride and symptoms, before compounding starts.' },
            { icon: Stethoscope, color: 'pop' as const, title: 'Split routing', copy: 'Clinical text goes to nursing, unchanged. Transit goes to navigation.' },
            { icon: HeartHandshake, color: 'mint' as const, title: 'Caregiver view', copy: 'Pickup time and vehicle only. No diagnosis. No symptom notes.' },
            { icon: Network, color: 'sun' as const, title: 'Readiness graph', copy: 'Every blocker, owner, and close stays on one record.' },
          ].map((pillar) => (
            <StickerCard key={pillar.title} className="p-5 space-y-3">
              <IconBubble color={pillar.color}>
                <pillar.icon className="w-5 h-5" strokeWidth={2.5} />
              </IconBubble>
              <h3 className="font-heading font-bold text-lg">{pillar.title}</h3>
              <p className="text-sm text-muted-fg">{pillar.copy}</p>
            </StickerCard>
          ))}
        </div>
      </section>

      <section id="pricing-section" className="w-full px-5 sm:px-8 lg:px-12 space-y-8">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-heading font-bold uppercase tracking-widest text-accent">ENTERPRISE DEPLOYMENT MODELS</span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold">Scale with your oncology operating model</h2>
          <p className="text-sm text-muted-fg">Compare focused, health-system, and network configurations for treatment-readiness operations.</p>
          <div className="inline-flex items-center p-1 rounded-full bg-white border-2 border-ink text-xs font-heading font-bold">
            <button onClick={() => setBillingCycle('ANNUAL')} className={`px-4 py-2 rounded-full transition ${billingCycle === 'ANNUAL' ? 'bg-accent text-white' : 'text-ink'}`}>
              Annual Billing <span className="text-[10px] bg-mint text-ink px-1.5 py-0.5 rounded-full ml-1">SAVE 20%</span>
            </button>
            <button onClick={() => setBillingCycle('MONTHLY')} className={`px-4 py-2 rounded-full transition ${billingCycle === 'MONTHLY' ? 'bg-accent text-white' : 'text-ink'}`}>
              Monthly Billing
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          <StickerCard className="p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-heading font-bold px-2.5 py-1 rounded-full bg-muted border-2 border-ink uppercase">Community Clinic</span>
              <h3 className="font-display text-2xl font-extrabold">Community Cancer Center</h3>
              <p className="text-sm text-muted-fg">Ideal for regional outpatient clinics and community infusion centers up to 15 chairs.</p>
              <div className="font-display text-4xl font-extrabold">{billingCycle === 'ANNUAL' ? 'Focused' : 'Flexible'} <span className="text-sm font-sans font-medium text-muted-fg">configuration</span></div>
              <div className="space-y-2.5 pt-2 text-sm">
                {['Up to 15 Infusion Chairs', 'Automated T-24h Patient SMS Screening', 'Oncology Nurse Triage Workbench', 'FHIR Mapping Workspace', 'Standard 8x5 Email Support'].map((f) => (
                  <div key={f} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-mint" strokeWidth={2.5} />{f}</div>
                ))}
              </div>
            </div>
            <button onClick={onOpenAuthModal} className="btn-ghost w-full">Get Started with Community</button>
          </StickerCard>

          <StickerCard featured className="p-6 sm:p-8 space-y-6 flex flex-col justify-between relative z-10">
            <div className="absolute top-3 right-3 sm:-top-4 sm:-right-3 sm:rotate-[15deg] bg-sun border-2 border-ink shadow-pop px-3 py-1 font-display font-extrabold text-xs">
              MOST POPULAR
            </div>
            <div className="space-y-4">
              <span className="text-xs font-heading font-bold px-2.5 py-1 rounded-full bg-accent text-white border-2 border-ink uppercase">Health System</span>
              <h3 className="font-display text-2xl font-extrabold">Enterprise Cancer Center</h3>
              <p className="text-sm text-muted-fg">Full-scale clinical continuity and transit automation for hospital oncology departments.</p>
              <div className="font-display text-4xl font-extrabold">{billingCycle === 'ANNUAL' ? 'Enterprise' : 'Modular'} <span className="text-sm font-sans font-medium text-muted-fg">configuration</span></div>
              <div className="space-y-2.5 pt-2 text-sm">
                {['Unlimited Infusion Chairs & Suites', 'Interactive Treatment Readiness Graph Engine', 'Automated Medical Transit (Med-Van) API', 'Caregiver Data-Minimization Logistics Portal', 'Governance & Implementation Planning'].map((f) => (
                  <div key={f} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" strokeWidth={2.5} />{f}</div>
                ))}
              </div>
            </div>
            <button onClick={onOpenAuthModal} className="btn-candy w-full">Explore Enterprise Workspace</button>
          </StickerCard>

          <StickerCard className="p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-heading font-bold px-2.5 py-1 rounded-full bg-muted border-2 border-ink uppercase">Multi-Facility</span>
              <h3 className="font-display text-2xl font-extrabold">National Network</h3>
              <p className="text-sm text-muted-fg">Custom federated architecture for multi-hospital oncology networks & NCI comprehensive centers.</p>
              <div className="font-display text-4xl font-extrabold">Custom</div>
              <div className="space-y-2.5 pt-2 text-sm">
                {['Multi-Hospital Federated Architecture', 'Cross-Center Chair Load Balancing', 'Custom Bi-Directional Order Interfaces', 'Dedicated Medical & Technical Director'].map((f) => (
                  <div key={f} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-mint" strokeWidth={2.5} />{f}</div>
                ))}
              </div>
            </div>
            <button onClick={onOpenAuthModal} className="btn-ghost w-full">Contact Sales & Solution Architects</button>
          </StickerCard>
        </div>
      </section>

      <section className="w-full px-5 sm:px-8 lg:px-12 space-y-4">
        <div className="text-center space-y-2">
          <h2 className="font-display text-3xl font-extrabold">Frequently Asked Questions</h2>
          <p className="text-sm text-muted-fg">Everything you need to know about OncoReady's barrier detection and hospital integration.</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="card-sticker overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 flex items-center justify-between text-left font-heading font-bold text-sm hover:bg-sun/20 transition"
              >
                <span>{faq.q}</span>
                {activeFaq === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-sm text-muted-fg leading-relaxed border-t-2 border-ink/10 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="w-full px-5 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden rounded-lg border-2 border-ink bg-accent text-white p-8 sm:p-12 text-center space-y-6 shadow-pop-lg">
          <div className="absolute -left-8 -top-8 w-32 h-32 rounded-full bg-sun border-2 border-ink hidden sm:block" />
          <div className="absolute -right-6 bottom-4 w-16 h-16 bg-pop border-2 border-ink rotate-12 hidden sm:block" />
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold relative z-10">
            Ready to eliminate day-of infusion chair loss?
          </h2>
          <p className="text-sm text-white/90 relative z-10">
            Experience the full treatment readiness golden path in our live clinical simulation workspace.
          </p>
          <Button variant="sun" onClick={onOpenAuthModal} showArrow className="relative z-10">
            Explore Workspace
          </Button>
        </div>
      </section>
    </div>
  );
};
