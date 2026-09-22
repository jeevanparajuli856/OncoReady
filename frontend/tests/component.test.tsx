import { describe, it, expect, beforeEach, beforeAll, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../src/App';

describe('OncoReady React UI & DOM Integration Tests', () => {
  beforeAll(() => {
    // Mock canvas getContext for headless jsdom test environment
    HTMLCanvasElement.prototype.getContext = () => null;
  });

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ['is unavailable', undefined],
    ['construction fails', class {
      constructor() {
        throw new Error('IntersectionObserver unavailable');
      }
    }],
  ])('keeps the full landing and static fallbacks visible when IntersectionObserver %s', (_label, observerImpl) => {
    vi.stubGlobal('IntersectionObserver', observerImpl);
    render(<App />);

    expect(screen.getByRole('heading', { name: /Tomorrow’s treatment.*Every blocker owned/i })).toBeDefined();
    expect(screen.getByRole('img', { name: /continuity ribbon connects patient signals/i })).toBeDefined();
    expect(screen.getByText('Treatment-day corridor')).toBeDefined();
    expect(document.querySelector('.ride-map-boundary svg')).not.toBeNull();

    const reveals = Array.from(document.querySelectorAll('[data-reveal-state]'));
    expect(reveals.length).toBeGreaterThan(0);
    expect(reveals.every((node) => node.getAttribute('data-reveal-state') === 'visible')).toBe(true);
  });

  it('renders the OncoReady enterprise landing page and workspace entry', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /Tomorrow’s treatment.*Every blocker owned/i })).toBeDefined();
    expect(screen.getByText(/Treatment readiness before the chair/i)).toBeDefined();
    expect(screen.getByRole('img', { name: /continuity ribbon connects patient signals/i })).toBeDefined();
    expect(screen.getAllByAltText(/OncoReady — Keep tomorrow on the calendar/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Explore Workspace/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/SaaS business model/i)).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Pilot' })).toBeDefined();
    expect(screen.getByText('$18,000/year')).toBeDefined();
    expect(screen.getByText('$1,500/month billed annually')).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Network' })).toBeDefined();
    expect(screen.getByText('Talk to us')).toBeDefined();

    const landingCopy = document.body.textContent?.toLowerCase() || '';
    ['demo', 'prototype', 'preview', 'portfolio', 'training environment'].forEach((term) => {
      expect(landingCopy).not.toContain(term);
    });
  });

  it('keeps the continuity story available when motion is turned off', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Reduce motion/i }));

    expect(document.querySelector('.motion-reduce')).not.toBeNull();
    expect(screen.getByRole('button', { name: /Motion off/i })).toBeDefined();
    expect(screen.getByRole('img', { name: /continuity ribbon connects patient signals/i })).toBeDefined();
    expect(screen.getAllByRole('button', { name: /Explore the workspace/i }).length).toBeGreaterThan(0);
    expect(document.querySelectorAll('[data-reveal-state="pending"]')).toHaveLength(0);
  });

  it('executes full interactive golden path from landing page to auth modal, dual triage, caregiver privacy, and plan confirmation', async () => {
    render(<App />);

    // 1. Open Auth Modal from Landing CTA
    const exploreWorkspaceBtn = screen.getAllByText(/Explore Workspace/i)[0];
    fireEvent.click(exploreWorkspaceBtn);

    expect(screen.getByText(/Prepared workspaces/i)).toBeDefined();

    // 2. Select Patient Portal from Auth Modal
    const patientCard = screen.getByTestId('auth-patient-card');
    fireEvent.click(patientCard);

    expect(screen.getByText(/Complete Your Pre-Infusion Readiness Check/i)).toBeDefined();

    // 3. Open readiness check modal
    const startBtn = screen.getByRole('button', { name: /Start Readiness Check/i });
    fireEvent.click(startBtn);

    expect(screen.getByText(/2-Minute Pre-Infusion Readiness Check/i)).toBeDefined();

    // 4. Submit readiness check
    const submitBtn = screen.getByRole('button', { name: /Submit Readiness Report/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Your Reported Barriers are Being Resolved/i)).toBeDefined();
    });

    // 5. Switch to Staff perspective via "View Staff Workbench" CTA
    const staffBtn = screen.getByRole('button', { name: /View Staff Workbench/i });
    fireEvent.click(staffBtn);

    const exceptionsNav = screen.getByRole('button', { name: /^Exceptions$/i });
    fireEvent.click(exceptionsNav);

    expect(screen.getByText(/Pre-Treatment Exception Queue/i)).toBeDefined();
    expect(screen.getAllByText(/Camila Lopez/i).length).toBeGreaterThan(0);

    // 6. Open Case Workspace
    const openCaseBtn = screen.getByRole('button', { name: /Open Case Workspace/i });
    fireEvent.click(openCaseBtn);

    expect(screen.getByText(/Task 1: Clinical Symptom Review/i)).toBeDefined();
    expect(screen.getByText(/Task 2: Transportation Navigation/i)).toBeDefined();

    // 7. Staff Action 1: Nurse Acknowledges Clinical Task
    const ackClinicalBtn = screen.getByRole('button', { name: /Acknowledge Review & Record Disposition/i });
    fireEvent.click(ackClinicalBtn);

    expect(screen.getByText(/Clinical Review & Disposition Recorded/i)).toBeDefined();

    // 8. Staff Action 2: Navigator Confirms Transportation Dispatch
    const confirmTransportBtn = screen.getByRole('button', { name: /Confirm & Dispatch Med-Van/i });
    fireEvent.click(confirmTransportBtn);

    expect(screen.getByText(/Transportation Coordination Confirmed/i)).toBeDefined();

    // 9. Caregiver Perspective & Strict Privacy Assertion via Header dropdown
    const switcherBtn = screen.getByText(/Sarah Jenkins, RN/i);
    fireEvent.click(switcherBtn);

    const caregiverOption = screen.getByText(/Caregiver Portal \(Ana Hernandez\)/i);
    fireEvent.click(caregiverOption);

    expect(screen.getByText(/Caregiver Portal • Ana Hernandez/i)).toBeDefined();
    expect(screen.getByText(/Ride Confirmed/i)).toBeDefined();
    expect(screen.getByText(/CareLink Vehicle #402/i)).toBeDefined();
    expect(screen.getByText(/Patient Privacy Boundary Enforced/i)).toBeDefined();

    // Verify clinical symptoms are NOT rendered in Caregiver view
    const caregiverHtml = document.body.innerHTML.toLowerCase();
    expect(caregiverHtml).not.toContain('fever 100.4');
    expect(caregiverHtml).not.toContain('tingling in fingers');
    expect(caregiverHtml).not.toContain('peripheral neuropathy');

    // 10. Patient Perspective & Final Plan Acknowledgment
    const caregiverSwitcherBtn = screen.getAllByText(/Ana Hernandez/i)[0];
    fireEvent.click(caregiverSwitcherBtn);

    const patientOption = screen.getByText(/Patient Portal \(Camila Lopez\)/i);
    fireEvent.click(patientOption);

    expect(screen.getByText(/Your Updated Treatment Plan is Ready for Review/i)).toBeDefined();
    const reviewPlanBtn = screen.getByRole('button', { name: /Review & Confirm Plan/i });
    fireEvent.click(reviewPlanBtn);

    expect(screen.getByText(/Review Updated Treatment Plan/i)).toBeDefined();

    // Check agreement
    const agreeCheckbox = screen.getByRole('checkbox', { name: /I acknowledge the 7:45 AM Med-Van/i });
    fireEvent.click(agreeCheckbox);

    const finalizeBtn = screen.getByRole('button', { name: /Acknowledge & Confirm Treatment Plan/i });
    fireEvent.click(finalizeBtn);

    await waitFor(() => {
      expect(screen.getByText(/Everything is Set for Tomorrow Morning!/i)).toBeDefined();
    });

    // 11. Reset Journey
    const resetBtn = screen.getByTitle(/Reset Workspace/i);
    fireEvent.click(resetBtn);

    expect(screen.getByRole('heading', { name: /Tomorrow’s treatment.*Every blocker owned/i })).toBeDefined();
  });
});
