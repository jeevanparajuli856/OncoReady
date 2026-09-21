import React, { useEffect } from 'react';
import { ArrowLeft, Mail, MessageSquare, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';

type LegalDocument = 'terms' | 'privacy';

const SUPPORT_EMAIL = 'support@oncoready.com';

const documentContent: Record<LegalDocument, { eyebrow: string; title: string; intro: string }> = {
  terms: {
    eyebrow: 'OncoReady legal',
    title: 'Terms of Service',
    intro: 'These terms govern your use of OncoReady and the OncoReady messaging program.',
  },
  privacy: {
    eyebrow: 'OncoReady legal',
    title: 'Privacy Policy',
    intro: 'This policy explains what information OncoReady collects, how it is used, and the choices available to you.',
  },
};

export const LegalPage: React.FC<{ document: LegalDocument }> = ({ document }) => {
  const content = documentContent[document];

  useEffect(() => {
    window.document.title = `${content.title} | OncoReady`;
  }, [content.title]);

  return (
    <div className="legal-page min-h-screen bg-cream text-ink">
      <header className="legal-header border-b border-line bg-white/80">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <a href="/" aria-label="Back to OncoReady home">
            <Logo size={34} />
          </a>
          <a href="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to OncoReady
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-16">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-accent">{content.eyebrow}</p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-6xl">{content.title}</h1>
          <p className="mt-5 text-lg leading-8 text-muted-fg">{content.intro}</p>
          <p className="mt-3 text-sm text-muted-fg">Last updated: September 21, 2026</p>
        </div>

        <article className="legal-document space-y-10 rounded-3xl border border-line bg-white/85 p-6 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.45)] sm:p-10">
          {document === 'terms' ? <TermsContent /> : <PrivacyContent />}
        </article>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-line bg-white/70 p-5 text-sm text-muted-fg sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex items-center gap-2"><Mail size={16} aria-hidden="true" /> Questions about this page?</span>
          <a className="font-semibold text-accent hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </div>
      </main>
    </div>
  );
};

const TermsContent: React.FC = () => (
  <>
    <LegalSection title="1. Using OncoReady">
      <p>OncoReady provides treatment-readiness and continuity workflow tools for patients, caregivers, care teams, and operational staff. You agree to use the service lawfully, protect your account information, and provide information that is accurate to the best of your knowledge.</p>
      <p>OncoReady is not a substitute for emergency services, medical advice, diagnosis, or treatment. For an emergency, contact local emergency services. Clinical decisions remain with the patient and their qualified care team.</p>
    </LegalSection>

    <LegalSection title="2. SMS messaging program">
      <div className="rounded-2xl border border-accent/20 bg-indigo-50/70 p-5">
        <div className="flex items-start gap-3">
          <MessageSquare className="mt-0.5 shrink-0 text-accent" size={20} aria-hidden="true" />
          <div className="space-y-3">
            <p className="font-semibold text-ink">OncoReady SMS Program Terms</p>
            <p>By opting in to OncoReady text messages, you agree to receive appointment readiness, care coordination, and service updates at the mobile number you provide. Message frequency varies based on your activity and the status of your care coordination, generally no more than 10 messages per month.</p>
            <p><strong>Msg &amp; data rates may apply.</strong> Consent is not a condition of purchase.</p>
            <p>Reply <strong>STOP</strong> to any message to cancel SMS messages. After you send STOP, you may receive one final confirmation message and no further messages will be sent unless you opt in again.</p>
            <p>Reply <strong>HELP</strong> for help, or contact support at <a className="font-semibold text-accent underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. For questions about your mobile plan, contact your wireless carrier.</p>
          </div>
        </div>
      </div>
    </LegalSection>

    <LegalSection title="3. Accounts and acceptable use">
      <p>Keep your login credentials confidential and notify us promptly if you believe your account has been used without permission. Do not interfere with the service, attempt unauthorized access, submit malicious code, or use OncoReady to send unlawful, deceptive, or abusive content.</p>
    </LegalSection>

    <LegalSection title="4. Availability and changes">
      <p>We may update, suspend, or discontinue parts of the service when reasonably necessary. We may update these terms by posting a revised version on this page. Your continued use after an update means you accept the revised terms.</p>
    </LegalSection>

    <LegalSection title="5. Contact">
      <p>For questions about these terms or the SMS program, contact <a className="font-semibold text-accent underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
    </LegalSection>
  </>
);

const PrivacyContent: React.FC = () => (
  <>
    <LegalSection title="1. Information we collect">
      <p>We may collect information you provide directly, such as your name, contact details, account credentials, appointment or care-coordination details, messages, and communication preferences.</p>
      <p>We may also collect limited technical information, such as browser type, device information, approximate usage activity, and security logs needed to operate and protect the service.</p>
    </LegalSection>

    <LegalSection title="2. How we use information">
      <p>We use information to provide treatment-readiness workflows, coordinate requested services, send communications you have authorized, respond to support requests, maintain security, improve the service, and comply with legal obligations.</p>
      <p>We do not use text-message content to make medical diagnoses or treatment decisions. Clinical concerns are handled through human-controlled care-team workflows.</p>
    </LegalSection>

    <LegalSection title="3. SMS and communications">
      <p>If you opt in to SMS messages, we use your phone number and messaging preferences to deliver the requested program messages. Message frequency varies. <strong>Msg &amp; data rates may apply.</strong> Reply STOP to opt out or HELP for help. You can also contact <a className="font-semibold text-accent underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
    </LegalSection>

    <LegalSection title="4. Sharing and disclosure">
      <p>We may share information with service providers that help us host, secure, support, and deliver the service, including messaging providers, when they are authorized to process information for these purposes. We may disclose information when required by law, to protect rights and safety, or as part of a business transfer.</p>
      <p>We do not sell personal information or share it for third-party behavioral advertising.</p>
    </LegalSection>

    <LegalSection title="5. Retention and security">
      <p>We retain information for as long as needed to provide the service, meet legal and operational requirements, resolve disputes, and enforce our agreements. We use reasonable administrative, technical, and organizational safeguards, but no internet transmission or storage system can be guaranteed completely secure.</p>
    </LegalSection>

    <LegalSection title="6. Your choices and contact">
      <p>You may opt out of SMS messages by replying STOP, update certain account information through the service, or ask questions about your information by contacting <a className="font-semibold text-accent underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. We may need to verify your identity before completing a request.</p>
    </LegalSection>
  </>
);

const LegalSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section>
    <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-ink sm:text-2xl">
      <ShieldCheck size={20} className="text-mint" aria-hidden="true" />
      {title}
    </h2>
    <div className="mt-4 space-y-4 text-[0.98rem] leading-8 text-muted-fg">{children}</div>
  </section>
);