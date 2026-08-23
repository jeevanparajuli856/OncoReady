import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
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

  it('renders initial OncoReady Portal Gateway on launch', () => {
    render(<App />);

    expect(screen.getByText(/OncoReady Gateway/i)).toBeDefined();
    expect(screen.getByText(/Select your clinical role or portal/i)).toBeDefined();
    expect(screen.getAllByText(/Maria Hernandez/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Enter Patient View/i)).toBeDefined();
    expect(screen.getByText(/Open Staff Workspace/i)).toBeDefined();
    expect(screen.getByText(/Enter Caregiver View/i)).toBeDefined();
    expect(screen.getByText(/Inspect Readiness Graph/i)).toBeDefined();
  });

  it('executes full interactive golden path with dual task creation, staff actions, caregiver privacy, and plan confirmation', async () => {
    render(<App />);

    // 1. Enter Patient View from Gateway
    const enterPatientBtn = screen.getByText(/Enter Patient View/i);
    fireEvent.click(enterPatientBtn);

    expect(screen.getByText(/Complete Your Pre-Infusion Readiness Check/i)).toBeDefined();

    // 2. Open readiness check modal
    const startBtn = screen.getByRole('button', { name: /Start Readiness Check/i });
    fireEvent.click(startBtn);

    expect(screen.getByText(/2-Minute Pre-Infusion Readiness Check/i)).toBeDefined();

    // 3. Submit readiness check
    const submitBtn = screen.getByRole('button', { name: /Submit Readiness Report/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Your Reported Barriers are Being Resolved/i)).toBeDefined();
    });

    // 4. Switch to Staff perspective via "View Staff Workbench" CTA
    const staffBtn = screen.getByRole('button', { name: /View Staff Workbench/i });
    fireEvent.click(staffBtn);

    expect(screen.getByText(/Pre-Treatment Exception Queue/i)).toBeDefined();
    expect(screen.getAllByText(/Maria Hernandez/i).length).toBeGreaterThan(0);

    // 5. Open Case Workspace
    const openCaseBtn = screen.getByRole('button', { name: /Open Case Workspace/i });
    fireEvent.click(openCaseBtn);

    expect(screen.getByText(/Task 1: Clinical Symptom Review/i)).toBeDefined();
    expect(screen.getByText(/Task 2: Transportation Navigation/i)).toBeDefined();

    // 6. Staff Action 1: Nurse Acknowledges Clinical Task
    const ackClinicalBtn = screen.getByRole('button', { name: /Acknowledge Concern & Authorize Pre-Med Labs/i });
    fireEvent.click(ackClinicalBtn);

    expect(screen.getByText(/Clinical Clearance & Advice Recorded/i)).toBeDefined();

    // 7. Staff Action 2: Navigator Confirms Transportation Dispatch
    const confirmTransportBtn = screen.getByRole('button', { name: /Confirm & Dispatch Med-Van/i });
    fireEvent.click(confirmTransportBtn);

    expect(screen.getByText(/Simulated Medical Transport Dispatched/i)).toBeDefined();

    // 8. Caregiver Perspective & Strict Privacy Assertion via Header dropdown or Switch
    // Click header switcher
    const switcherBtn = screen.getByText(/Sarah Jenkins, RN/i);
    fireEvent.click(switcherBtn);

    const caregiverOption = screen.getByText(/Caregiver Portal \(Ana Hernandez\)/i);
    fireEvent.click(caregiverOption);

    expect(screen.getByText(/Caregiver Portal • Ana Hernandez/i)).toBeDefined();
    expect(screen.getByText(/Ride Confirmed/i)).toBeDefined();
    expect(screen.getByText(/Ochsner Med-Van #402/i)).toBeDefined();
    expect(screen.getByText(/Patient Privacy Boundary Enforced/i)).toBeDefined();

    // Verify clinical symptoms are NOT rendered in Caregiver view
    const caregiverHtml = document.body.innerHTML.toLowerCase();
    expect(caregiverHtml).not.toContain('fever 100.4');
    expect(caregiverHtml).not.toContain('tingling in fingers');
    expect(caregiverHtml).not.toContain('peripheral neuropathy');

    // 9. Patient Perspective & Final Plan Acknowledgment
    const caregiverSwitcherBtn = screen.getAllByText(/Ana Hernandez/i)[0];
    fireEvent.click(caregiverSwitcherBtn);

    const patientOption = screen.getByText(/Patient Portal \(Maria Hernandez\)/i);
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

    // 10. Reset Journey
    const resetBtn = screen.getByTitle(/Reset Workflow State/i);
    fireEvent.click(resetBtn);

    expect(screen.getByText(/OncoReady Gateway/i)).toBeDefined();
  });
});
