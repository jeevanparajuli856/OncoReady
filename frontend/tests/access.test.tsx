import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { App } from '../src/App';
import { INITIAL_STATE } from '../src/state/workflowState';

describe('ACCESS-001 prepared workspace entry', () => {
  beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps the public story record-free and renders exactly the approved two plans', () => {
    render(<App />);

    const publicCopy = document.body.textContent || '';
    expect(publicCopy).not.toContain('Camila Lopez');
    expect(publicCopy).not.toContain('OR-882914');
    expect(publicCopy).not.toContain('Colorectal Adenocarcinoma');
    expect(publicCopy).not.toContain('mFOLFOX6');

    const plans = within(screen.getByTestId('pricing-plans'));
    expect(plans.getAllByRole('article')).toHaveLength(2);
    expect(plans.getByRole('heading', { name: 'Pilot' })).toBeDefined();
    expect(plans.getByText('$1,500/month')).toBeDefined();
    expect(plans.getByText('5 staff seats')).toBeDefined();
    expect(plans.getByText('1 site')).toBeDefined();
    expect(plans.getByRole('heading', { name: 'Network' })).toBeDefined();
    expect((plans.getByRole('button', { name: 'Buy now' }) as HTMLButtonElement).disabled).toBe(true);
    expect((plans.getByRole('link', { name: 'Contact us' }) as HTMLAnchorElement).href).toBe('mailto:support@oncoready.me');
  });

  it('routes every prepared destination through one truthful gateway', () => {
    render(<App />);

    fireEvent.click(screen.getAllByRole('button', { name: /Access workspace/i })[0]);
    const dialog = screen.getByRole('dialog', { name: 'Prepared workspaces' });
    expect(within(dialog).getByText(/does not sign you in or grant provider access/i)).toBeDefined();
    expect(within(dialog).getAllByRole('button')).toHaveLength(5);
    expect(screen.getByTestId('auth-staff-card')).toBeDefined();
    expect(screen.getByTestId('auth-patient-card')).toBeDefined();
    expect(screen.getByTestId('auth-caregiver-card')).toBeDefined();
    expect(screen.getByTestId('auth-transport-card')).toBeDefined();

    fireEvent.click(screen.getByTestId('auth-transport-card'));
    expect(screen.getByRole('heading', { name: /Prepared reply has not opened work yet/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /Graph/i })).toBeDefined();
  });

  it('preserves scenario progress across personas and reset restores the public start', () => {
    render(<App />);

    fireEvent.click(screen.getAllByRole('button', { name: /Access workspace/i })[0]);
    fireEvent.click(screen.getByTestId('auth-patient-card'));
    fireEvent.click(screen.getByRole('button', { name: /Start Readiness Check/i }));
    fireEvent.click(screen.getByRole('button', { name: /Submit Readiness Report/i }));
    fireEvent.click(screen.getByRole('button', { name: /View Staff Workbench/i }));

    expect(screen.getAllByText(/Camila Lopez/i).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByTitle(/Reset Workspace/i));
    expect(screen.getByRole('heading', { name: /Tomorrow’s treatment.*Every blocker owned/i })).toBeDefined();
    expect(document.body.textContent).not.toContain('Camila Lopez');
  });

  it('rejects legacy and malformed persisted scenarios before public rendering', () => {
    localStorage.setItem('oncoready_workflow_state_v2', JSON.stringify({
      version: 3,
      currentPerspective: 'SIGN_IN',
      patient: { name: 'Maria Hernandez', mrn: 'OCH-882914' },
    }));
    localStorage.setItem('oncoready_workflow_state_v3', JSON.stringify({
      ...INITIAL_STATE,
      currentPerspective: 'PATIENT',
      appointment: {
        ...INITIAL_STATE.appointment,
        drugs: undefined,
      },
    }));

    render(<App />);

    expect(screen.getByRole('heading', { name: /Tomorrow’s treatment.*Every blocker owned/i })).toBeDefined();
    expect(document.body.textContent).not.toContain('Maria Hernandez');
    expect(document.body.textContent).not.toContain('OCH-882914');

    fireEvent.click(screen.getAllByRole('button', { name: /Access workspace/i })[0]);
    expect(screen.getByRole('dialog', { name: 'Prepared workspaces' })).toBeDefined();
    expect(screen.getByTestId('auth-patient-card').textContent).toContain('Camila Lopez');
  });

  it('normalizes the retired sign-in perspective to the record-free landing', () => {
    localStorage.setItem('oncoready_workflow_state_v3', JSON.stringify({
      ...INITIAL_STATE,
      currentPerspective: 'SIGN_IN',
    }));

    render(<App />);

    expect(screen.getByRole('heading', { name: /Tomorrow’s treatment.*Every blocker owned/i })).toBeDefined();
    expect(document.body.textContent).not.toContain('Camila Lopez');
  });
});
