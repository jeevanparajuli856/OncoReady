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
    expect(screen.getAllByRole('button', { name: /Access workspace/i }).length).toBeGreaterThan(0);
    expect(screen.getByText(/SaaS business model/i)).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Pilot' })).toBeDefined();
    expect(screen.getByText('$1,500/month')).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Network' })).toBeDefined();
    expect((screen.getByRole('button', { name: 'Buy now' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('link', { name: 'Contact us' }) as HTMLAnchorElement).href).toBe('mailto:support@oncoready.me');

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
    expect(screen.getAllByRole('button', { name: /Access workspace/i }).length).toBeGreaterThan(0);
    expect(document.querySelectorAll('[data-reveal-state="pending"]')).toHaveLength(0);
  });

  it('executes full interactive golden path from landing page to auth modal, dual triage, caregiver privacy, and plan confirmation', async () => {
    render(<App />);

    // 1. Open Auth Modal from Landing CTA
    const exploreWorkspaceBtn = screen.getAllByText(/Access workspace/i)[0];
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

    // 5. Switch to the Care Team perspective via the readiness CTA
    const staffBtn = screen.getByRole('button', { name: /View Care Team Workbench/i });
    fireEvent.click(staffBtn);

    const exceptionsNav = screen.getByRole('button', { name: /^Exceptions$/i });
    fireEvent.click(exceptionsNav);

    expect(screen.getByText(/Pre-Treatment Exception Queue/i)).toBeDefined();
    expect(screen.getAllByText(/Camila Lopez/i).length).toBeGreaterThan(0);

    // 6. Open Case Workspace
    const openCaseBtn = screen.getByRole('button', { name: /Open Case Workspace/i });
    fireEvent.click(openCaseBtn);

    expect(screen.getByRole('heading', { name: /Clinical contact/i })).toBeDefined();

    // 7. Staff Action 1: Nurse Acknowledges Clinical Task
    const ackClinicalBtn = screen.getByRole('button', { name: /Accept ownership/i });
    fireEvent.click(ackClinicalBtn);
    fireEvent.click(screen.getByRole('button', { name: /Record human disposition/i }));
    expect(screen.getByText(/Human disposition recorded/i)).toBeDefined();

    // 8. Switch to Marcus's workspace for transportation dispatch
    fireEvent.click(screen.getByRole('button', { name: /Sarah Jenkins, RN/i }));
    fireEvent.click(screen.getByText(/Care Navigator \(Marcus Vance, MSW\)/i));
    const confirmTransportBtn = screen.getByRole('button', { name: /Complete current transport plan/i });
    fireEvent.click(confirmTransportBtn);
    expect(screen.getByText(/Current plan complete/i)).toBeDefined();

    // 9. Caregiver Perspective & Strict Privacy Assertion via Header dropdown
    const switcherBtn = screen.getByRole('button', { name: /Marcus Vance, MSW/i });
    fireEvent.click(switcherBtn);

    const caregiverOption = screen.getByText(/Caregiver Portal \(Ana Hernandez\)/i);
    fireEvent.click(caregiverOption);

    expect(screen.getByText(/Caregiver Portal • Ana Hernandez/i)).toBeDefined();
    expect(screen.getByText(/Current plan v1/i)).toBeDefined();
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
    const agreeCheckbox = screen.getByRole('checkbox', { name: /I acknowledge current transportation plan v1/i });
    fireEvent.click(agreeCheckbox);

    const finalizeBtn = screen.getByRole('button', { name: /Acknowledge & Confirm Treatment Plan/i });
    fireEvent.click(finalizeBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Continuity Plan Confirmed' })).toBeDefined();
    });

    // 11. Reset Journey
    const resetBtn = screen.getByTitle(/Reset Workspace/i);
    fireEvent.click(resetBtn);

    expect(screen.getByRole('heading', { name: /Tomorrow’s treatment.*Every blocker owned/i })).toBeDefined();
  });
});
