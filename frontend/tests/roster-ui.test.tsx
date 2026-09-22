import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { App } from '../src/App';
import { INITIAL_STATE } from '../src/state/workflowState';

/**
 * These run against the committed roster, which may legitimately be empty.
 * They pin the behaviour that must hold either way: the directory and the
 * vitals panel stay correct, and the prepared scenario case stays the only
 * playable one.
 */
describe('EPIC-002 roster directory and captured vitals', () => {
  beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });

  beforeEach(() => {
    localStorage.clear();
  });

  const signIn = (email: string) => {
    fireEvent.click(screen.getAllByRole('button', { name: /Access workspace/i })[0]);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '1234' } });
    fireEvent.click(screen.getAllByRole('button', { name: /^Sign in$/i }).at(-1)!);
  };

  const openPatients = () => {
    fireEvent.click(screen.getByRole('button', { name: /^Patients$/i }));
  };

  it('renders the patient directory with the prepared case present', () => {
    render(<App />);
    signIn('abcs@oncoready.me');
    openPatients();

    expect(screen.getByRole('heading', { name: /Patient Directory/i })).toBeDefined();
    expect(screen.getByText(INITIAL_STATE.patient.name)).toBeDefined();
    expect(screen.getByText(`MRN: ${INITIAL_STATE.patient.mrn}`)).toBeDefined();
  });

  it('does not invent placeholder patients in the directory', () => {
    render(<App />);
    signIn('abcs@oncoready.me');
    openPatients();

    const directoryCopy = document.body.textContent || '';
    for (const placeholder of ['James Wilson', 'David Chen', 'Renee Sutton']) {
      expect(directoryCopy).not.toContain(placeholder);
    }
  });

  it('keeps every prepared vital visible in the Care Team labs tab', () => {
    render(<App />);
    signIn('abcs@oncoready.me');
    fireEvent.click(screen.getByRole('button', { name: /^Patients$/i }));
    fireEvent.click(screen.getByText(INITIAL_STATE.patient.name));
    fireEvent.click(screen.getByRole('tab', { name: /Labs/i }));

    for (const vital of INITIAL_STATE.vitals) {
      expect(screen.getAllByText(vital.name).length).toBeGreaterThan(0);
      expect(screen.getAllByText(vital.value).length).toBeGreaterThan(0);
    }
  });

  it('gives the Care Navigator the directory without any captured vital signs', () => {
    render(<App />);
    signIn('abcn@oncoready.me');
    openPatients();

    expect(screen.getByRole('heading', { name: /Patient Directory/i })).toBeDefined();
    // The navigator has no Labs tab at all, and no vitals reach its directory.
    expect(screen.queryByRole('tab', { name: /Labs/i })).toBeNull();
    expect((document.body.textContent || '')).not.toContain('Vital signs');
  });
});
