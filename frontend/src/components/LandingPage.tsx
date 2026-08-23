import React, { useState } from 'react';
import { 
  Activity, 
  ArrowRight, 
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
  Lock
} from 'lucide-react';
import { WorkflowState, Perspective } from '../types';
import { TreatmentReadinessGraph } from './TreatmentReadinessGraph';
import { Avatar } from './Avatar';

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
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does OncoReady prevent same-day chemotherapy cancellations?',
      a: 'OncoReady initiates an automated, 2-minute barrier screening window 24 hours prior to scheduled infusion. It detects non-clinical barriers (like sudden transit cancellations) and patient-reported clinical symptoms early, routing them simultaneously to patient navigators and oncology triage nurses before pharmacy compounding begins.'
    },
    {
      q: 'How does the Caregiver Privacy & Data-Minimization projection work?',
      a: 'Caregivers play a vital role in transportation and home support, but patients retain complete medical privacy. OncoReady derives an explicit permission-scoped projection that displays ride confirmations, vehicle IDs, and arrival times while strictly filtering out all clinical symptom text and triage notes.'
    },
    {
      q: 'Does OncoReady integrate with our existing EHR (Epic / Cerner)?',
      a: 'Yes. OncoReady is built on HL7 FHIR R4 standards and integrates bi-directionally with Epic MyChart and Cerner Millennium scheduling and clinical messaging workflows.'
    },
    {
      q: 'Does OncoReady use AI to make automated clinical triage decisions?',
      a: 'No. OncoReady strictly preserves verbatim patient symptom reports and routes them directly to licensed human oncology nurses. OncoReady enforces zero automated clinical downgrade or diagnosis, ensuring 100% clinician authority.'
    }
  ];

  return (
    <div className="space-y-20 pb-20 animate-fade-in text-slate-900">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-12 text-center max-w-5xl mx-auto px-4 space-y-8">
        
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Next-Generation Oncology Clinical Continuity Platform</span>
        </div>

        {/* Hero Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Zero Day-Of Chemotherapy <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-sky-600 to-teal-600">
              Infusion Cancellations.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Proactive T-24h barrier detection, dual-path clinical &amp; transportation triage, and privacy-guaranteed caregiver logistics for cancer centers.
          </p>
        </div>

        {/* Hero CTA Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onOpenAuthModal}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold rounded-2xl transition flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-500/25 text-sm sm:text-base cursor-pointer"
          >
            <span>Explore Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              const pricingEl = document.getElementById('pricing-section');
              pricingEl?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-2xl border border-slate-200 transition text-sm sm:text-base shadow-2xs hover:shadow-md cursor-pointer"
          >
            <span>View Subscription Pricing</span>
          </button>
        </div>

        {/* Trust Badges Bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SOC-2 Type II Certified</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-indigo-600" />
            <span>HIPAA Compliant &amp; BAA</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-sky-600" />
            <span>HL7 FHIR R4 Native</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Network className="w-4 h-4 text-teal-600" />
            <span>Epic &amp; Cerner Compatible</span>
          </div>
        </div>

        {/* 2. LIVE INTERACTIVE PRODUCT PREVIEW CARD */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-left relative overflow-hidden">
            
            {/* Top Preview Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-base">
                      Live Continuity Engine Preview
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      LIVE SYSTEM TELEMETRY
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Patient: Maria Hernandez (54F) • mFOLFOX6 Cycle 4 • Benson Cancer Center
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectPerspective('PATIENT')}
                  className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition"
                >
                  Enter Patient View
                </button>
                <button
                  onClick={() => onSelectPerspective('STAFF')}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
                >
                  Enter Staff Hub
                </button>
              </div>
            </div>

            {/* Embedded Live Treatment Readiness Graph */}
            <TreatmentReadinessGraph
              appointment={state.appointment}
              tasks={state.tasks}
              overallReadiness={state.overallReadiness}
              patientAcknowledged={state.patientAcknowledged}
              readinessCheckCompleted={state.readinessCheckCompleted}
              onNavigateToPatient={() => onSelectPerspective('PATIENT')}
              onNavigateToStaff={() => onSelectPerspective('STAFF')}
            />

            {/* 3 Interactive Quick Portal Triggers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div 
                onClick={() => onSelectPerspective('PATIENT')}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/40 hover:border-indigo-300 transition cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">1. Patient Screening</span>
                  <Avatar src={state.patient.avatarUrl} alt="Maria" size="xs" roleType="PATIENT" />
                </div>
                <p className="text-[11px] text-slate-500">
                  2-minute pre-infusion screening detecting cancelled rides and symptoms.
                </p>
              </div>

              <div 
                onClick={() => onSelectPerspective('STAFF')}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-sky-50/40 hover:border-sky-300 transition cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">2. Staff Exception Hub</span>
                  <div className="flex -space-x-2">
                    <Avatar alt="Sarah RN" size="xs" roleType="NURSE" />
                    <Avatar alt="Marcus MSW" size="xs" roleType="NAVIGATOR" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Dual-task nurse clinical triage and navigator Med-Van dispatch.
                </p>
              </div>

              <div 
                onClick={() => onSelectPerspective('CAREGIVER')}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-teal-50/40 hover:border-teal-300 transition cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">3. Caregiver Logistics</span>
                  <Avatar src={state.caregiver.avatarUrl} alt="Ana" size="xs" roleType="CAREGIVER" />
                </div>
                <p className="text-[11px] text-slate-500">
                  Real-time ride tracking with 100% patient clinical privacy protection.
                </p>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* 3. ENTERPRISE ROI & CLINICAL IMPACT METRICS */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold font-mono uppercase tracking-widest text-indigo-300">
              PROVEN CLINICAL &amp; FINANCIAL ROI
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Quantifiable Impact for Modern Cancer Centers
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-6 bg-white/5 backdrop-blur-xs rounded-2xl border border-white/10 space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-indigo-400">94.2%</div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">Same-Day Chair Preservation</div>
              <p className="text-xs text-slate-400 pt-1">Eliminates last-minute cancelled infusion chair vacancies.</p>
            </div>

            <div className="p-6 bg-white/5 backdrop-blur-xs rounded-2xl border border-white/10 space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">$1.85M</div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">Annual Revenue Saved</div>
              <p className="text-xs text-slate-400 pt-1">Per 20 infusion chairs from avoided drug compounding waste.</p>
            </div>

            <div className="p-6 bg-white/5 backdrop-blur-xs rounded-2xl border border-white/10 space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-sky-400">&lt; 42 min</div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">Average Resolution SLA</div>
              <p className="text-xs text-slate-400 pt-1">Fast barrier clearance by multidisciplinary on-call triage.</p>
            </div>

            <div className="p-6 bg-white/5 backdrop-blur-xs rounded-2xl border border-white/10 space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-teal-400">100%</div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">Clinical Privacy Guard</div>
              <p className="text-xs text-slate-400 pt-1">Zero clinical text leakage to family logistics contacts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE PRODUCT PILLARS (DEEP DIVES) */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold font-mono uppercase tracking-widest text-indigo-600">
            COMPREHENSIVE ARCHITECTURE
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineered for Clinical Precision
          </h2>
          <p className="text-sm text-slate-600">
            Four foundational pillars transforming fragmented pre-infusion tasks into a reliable, closed-loop workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Pillar 1 */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs hover:shadow-lg transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              1. T-24h Proactive Barrier Detection
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Automated screening opens exactly 24 hours prior to appointment. Patients report transit viability and new symptoms in under 2 minutes, well before expensive antineoplastic drug preparation begins.
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Catches transit cancellations &amp; vehicle lift requirements</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Captures neuropathy, fever, and acute gastrointestinal toxicities</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs hover:shadow-lg transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              2. Dual-Path Clinical &amp; Navigation Triage
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Single patient submission splits automatically into concurrent streams: symptom text routes verbatim to licensed oncology triage nurses, while transportation needs route to patient navigators.
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Preserves unaltered clinical text for human nurse review</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Direct dispatch to medical transit (Med-Van) services</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs hover:shadow-lg transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              3. Data-Minimized Caregiver Logistics
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Family members and ride proxies receive vehicle pickup times and driver arrival links without exposing the patient's sensitive diagnosis, symptom complaints, or oncology triage advice.
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Strict allowlist-only projection of transit coordinates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero clinical note exposure to unauthorized third parties</span>
              </li>
            </ul>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs hover:shadow-lg transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
              <Network className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              4. Treatment Readiness Graph &amp; Audit Engine
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              A directed acyclic graph anchors every infusion session to its prerequisite clearance nodes. Closed-loop transitions are permanently recorded in an append-only causal audit log.
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Real-time visual dependency graph with active blocker states</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Immutable audit history tracking all human actions</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* 5. SUBSCRIPTION & PRICING PLANS */}
      <section id="pricing-section" className="max-w-6xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-bold font-mono uppercase tracking-widest text-indigo-600">
            ENTERPRISE SUBSCRIPTION TIERS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Predictable Pricing per Infusion Chair
          </h2>
          <p className="text-sm text-slate-600">
            Transparent enterprise licensing scaled to your cancer center's volume with zero hidden implementation fees.
          </p>

          {/* Billing Cycle Switcher */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-4 py-2 rounded-xl transition ${
                billingCycle === 'ANNUAL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual Billing <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full ml-1 font-mono">SAVE 20%</span>
            </button>
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-4 py-2 rounded-xl transition ${
                billingCycle === 'MONTHLY' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Plan 1: Community Cancer Center */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs hover:shadow-xl transition space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider font-mono">
                Community Clinic
              </span>
              <h3 className="text-2xl font-bold text-slate-900">Community Cancer Center</h3>
              <p className="text-xs text-slate-500">
                Ideal for regional outpatient clinics and community infusion centers up to 15 chairs.
              </p>

              <div className="pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {billingCycle === 'ANNUAL' ? '$200' : '$250'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ chair / month</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {billingCycle === 'ANNUAL' ? 'Billed annually ($2,400/yr per chair)' : 'Billed monthly'}
                </div>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                <div className="font-bold text-slate-900">Included Capabilities:</div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Up to 15 Infusion Chairs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Automated T-24h Patient SMS Screening</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Oncology Nurse Triage Workbench</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Standard Epic / Cerner FHIR Sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Standard 8x5 Email Support</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenAuthModal}
              className="w-full py-3.5 rounded-xl border-2 border-slate-300 hover:border-slate-900 font-bold text-xs transition"
            >
              Get Started with Community
            </button>
          </div>

          {/* Plan 2: Health System Enterprise (Featured) */}
          <div className="bg-white rounded-3xl border-2 border-indigo-600 p-8 shadow-2xl space-y-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest font-mono">
              MOST POPULAR
            </div>

            <div className="space-y-4">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 uppercase tracking-wider font-mono">
                Health System
              </span>
              <h3 className="text-2xl font-bold text-slate-900">Enterprise Cancer Center</h3>
              <p className="text-xs text-slate-500">
                Full-scale clinical continuity and transit automation for hospital oncology departments.
              </p>

              <div className="pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {billingCycle === 'ANNUAL' ? '$315' : '$390'}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ chair / month</span>
                </div>
                <div className="text-[11px] text-indigo-700 font-semibold mt-0.5">
                  {billingCycle === 'ANNUAL' ? 'Billed annually ($3,780/yr per chair)' : 'Billed monthly'}
                </div>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                <div className="font-bold text-slate-900">Everything in Community, plus:</div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Unlimited Infusion Chairs &amp; Suites</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Interactive Treatment Readiness Graph Engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Automated Medical Transit (Med-Van) API</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Caregiver Data-Minimization Logistics Portal</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>24/7 Dedicated SLA &amp; Signed HIPAA BAA</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenAuthModal}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md shadow-indigo-500/25 cursor-pointer"
            >
              Launch Enterprise Trial
            </button>
          </div>

          {/* Plan 3: National Oncology Network */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs hover:shadow-xl transition space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider font-mono">
                Multi-Facility
              </span>
              <h3 className="text-2xl font-bold text-slate-900">National Network</h3>
              <p className="text-xs text-slate-500">
                Custom federated architecture for multi-hospital oncology networks &amp; NCI comprehensive centers.
              </p>

              <div className="pt-2">
                <div className="text-4xl font-extrabold text-slate-900">Custom</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Volume discounting &amp; multi-center SLA
                </div>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-700">
                <div className="font-bold text-slate-900">Enterprise Capabilities:</div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Multi-Hospital Federated Architecture</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cross-Center Chair Load Balancing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Custom Bi-Directional Order Interfaces</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dedicated Medical &amp; Technical Director</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenAuthModal}
              className="w-full py-3.5 rounded-xl border-2 border-slate-300 hover:border-slate-900 font-bold text-xs transition cursor-pointer"
            >
              Contact Sales &amp; Solution Architects
            </button>
          </div>

        </div>
      </section>

      {/* 6. INTERACTIVE FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500">
            Everything you need to know about OncoReady's barrier detection and hospital integration.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-900 hover:bg-slate-50 transition"
              >
                <span>{faq.q}</span>
                {activeFaq === idx ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {activeFaq === idx && (
                <div className="p-5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. BOTTOM ENTERPRISE CTA BANNER */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-2 max-w-2xl mx-auto relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold">
              Ready to eliminate day-of infusion chair loss?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Experience the full treatment readiness golden path in our live clinical simulation workspace.
            </p>
          </div>

          <button
            onClick={onOpenAuthModal}
            className="px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 font-extrabold rounded-2xl text-sm transition shadow-lg cursor-pointer"
          >
            Explore Workspace →
          </button>
        </div>
      </section>

    </div>
  );
};
