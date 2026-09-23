import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { App } from '../src/App';

describe('PATIENT-001 report a problem from the patient portal', () => {
  beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });

  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('appears only after the readiness check and sends a blank-start report', () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: /Access workspace/i })[0]);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'abcp@oncoready.me' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '1234' } });
    fireEvent.click(screen.getAllByRole('button', { name: /^Sign in$/i }).at(-1)!);

    expect(screen.queryByRole('button', { name: 'Report a problem' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Start Readiness Check/i }));
    fireEvent.click(screen.getByRole('button', { name: /Submit Readiness Report/i }));

    fireEvent.click(screen.getByRole('button', { name: 'Report a problem' }));
    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByRole('heading', { name: 'Report a Problem' })).toBeDefined();
    expect(dialog.queryByLabelText(/Describe what you are experiencing/i)).toBeNull();

    fireEvent.click(dialog.getByRole('button', { name: /Send to Care Team/i }));
    expect(dialog.getByRole('alert').textContent).toMatch(/Choose a ride problem, a symptom, or both/);

    fireEvent.click(dialog.getByRole('button', { name: /Yes, I have symptoms to report/i }));
    const concern = dialog.getByLabelText(/Describe what you are experiencing/i) as HTMLTextAreaElement;
    expect(concern.value).toBe('');
    fireEvent.change(concern, { target: { value: 'I have a fever of 101 tonight.' } });
    fireEvent.click(dialog.getByRole('button', { name: /Send to Care Team/i }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: 'Report a problem' })).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /View Care Team Workbench/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /Review Case/i })[0]);
    expect(screen.getByText(/I have a fever of 101 tonight\./)).toBeDefined();
    expect(screen.getByText(/New patient report, verbatim/)).toBeDefined();
  });
});
