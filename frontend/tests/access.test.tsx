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

  const signIn = (email: string) => {
    fireEvent.click(screen.getAllByRole('button', { name: /Access workspace/i })[0]);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '1234' } });
    fireEvent.click(screen.getAllByRole('button', { name: /^Sign in$/i }).at(-1)!);
  };

  it('routes prepared accounts through login to their correct workspaces', () => {
    render(<App />);

    signIn('abcn@oncoready.me');
    expect(screen.getByText(/Care Navigator Workspace/i)).toBeDefined();

    fireEvent.click(screen.getByTitle(/Reset Workspace/i));
    signIn('abct@oncoready.me');
    expect(screen.getByRole('heading', { name: /CareLink Transportation Workspace/i })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'CareLink' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Uber Health' })).toBeDefined();
    expect(screen.getByText('Integration-ready preview · not connected')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /Request synthetic ride/i }));
    expect(screen.getByRole('button', { name: /Assign fictional CareLink Partner A/i })).toBeDefined();
  });

  it('preserves scenario progress across personas and reset restores the public start', () => {
    render(<App />);

    signIn('abcp@oncoready.me');
    fireEvent.click(screen.getByRole('button', { name: /Start Readiness Check/i }));
    fireEvent.click(screen.getByRole('button', { name: /Submit Readiness Report/i }));
    fireEvent.click(screen.getByRole('button', { name: /View Care Team Workbench/i }));

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
    localStorage.setItem('oncoready_workflow_state_v4', JSON.stringify({
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
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeDefined();
  });

  it('preserves the sign-in perspective as the login route', () => {
    localStorage.setItem('oncoready_workflow_state_v4', JSON.stringify({
      ...INITIAL_STATE,
      currentPerspective: 'SIGN_IN',
    }));

    render(<App />);

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeDefined();
    expect(document.body.textContent).not.toContain('Camila Lopez');
  });
});
