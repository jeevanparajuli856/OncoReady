import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { App } from '../src/App';

const PATIENT_RESOURCE_ID = 'erXuFYUfucBZaryVksYEcMg3';
const MEDICATION_RESOURCE_ID = 'ePDJ.zsf3Jfg2.MKkAMgW9EcIbsaiB.y-OTrPS5v2h8Q3';
const CAPTURE_ID = 'epic-sandbox-20260922T070125Z-0dac7d6b';

const openStaffCase = () => {
  fireEvent.click(screen.getAllByRole('button', { name: /Access workspace/i })[0]);
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'abcs@oncoready.me' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: '1234' } });
  fireEvent.click(screen.getAllByRole('button', { name: /^Sign in$/i }).at(-1)!);
  fireEvent.click(screen.getByRole('button', { name: /Review Case/i }));
};

describe('EPIC-001 reviewed Epic Sandbox capture', () => {
  beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps OncoReady scenario facts separate from the captured Epic tab', () => {
    render(<App />);
    openStaffCase();

    const tabs = screen.getByRole('tablist', { name: /Case information/i });
    const regimenTab = within(tabs).getByRole('tab', { name: /Regimen/i });
    fireEvent.click(regimenTab);

    expect(screen.getByText('Care plan')).toBeDefined();
    expect(screen.getByText(/mFOLFOX6 \+ Bevacizumab/i)).toBeDefined();

    const epicTab = within(tabs).getByRole('tab', { name: /Epic/i });
    fireEvent.click(epicTab);

    const epicPanel = screen.getByRole('tabpanel', { name: /Epic/i });
      expect(within(epicPanel).getByRole('heading', { name: 'Epic FHIR R4 record · read-only' })).toBeDefined();
    expect(within(epicPanel).getByAltText('Epic')).toBeDefined();
    expect(epicPanel.textContent).toContain('Camila Maria Lopez');
    expect(epicPanel.textContent).toContain('Female');
    expect(epicPanel.textContent).toContain('drospirenone-ethinyl estradiol');
    expect(epicPanel.textContent).toContain('Hemoglobin A1C');
    expect(epicPanel.textContent).toContain('5.1');
    expect(epicPanel.textContent).toContain('MyChart Video Visit');
    expect(epicPanel.textContent).not.toContain('mFOLFOX6');
    expect(epicPanel.textContent).not.toContain('Cycle 4 of 12');
  });

  it('preserves the immutable capture timestamp and renders missing source values truthfully', () => {
    render(<App />);
    openStaffCase();

    fireEvent.click(screen.getByRole('tab', { name: /Epic/i }));
    const epicPanel = screen.getByRole('tabpanel', { name: /Epic/i });

      expect(epicPanel.textContent).toMatch(/Retrieved.*Sep.*22.*2026.*2:01.*CT/i);
      expect(epicPanel.textContent).toContain('Connected to Hospital Epic Sandbox');
    expect(epicPanel.textContent).not.toMatch(/\bLive synchronization\b/i);

    const labs = within(epicPanel).getByRole('region', { name: /Laboratory results/i });
    expect(within(labs).getByText('Genotype:')).toBeDefined();
    expect(within(labs).getByText('Not recorded')).toBeDefined();
  });

  it('supports keyboard tab navigation and an accessible provenance drawer with focus return', () => {
    render(<App />);
    openStaffCase();

    const tabs = screen.getByRole('tablist', { name: /Case information/i });
    const labsTab = within(tabs).getByRole('tab', { name: /Labs/i });
    const epicTab = within(tabs).getByRole('tab', { name: /Epic/i });
    labsTab.focus();
    fireEvent.keyDown(labsTab, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(epicTab);
    fireEvent.keyDown(epicTab, { key: 'Enter' });
    expect(epicTab.getAttribute('aria-selected')).toBe('true');

    const sourceButton = screen.getByRole('button', { name: 'View source details' });
    sourceButton.focus();
    fireEvent.click(sourceButton);

    const drawer = screen.getByRole('dialog', { name: /Epic source details/i });
    expect(drawer.contains(document.activeElement)).toBe(true);
    expect(drawer.textContent).toContain('Epic FHIR Sandbox');
    expect(drawer.textContent).toContain('Non-Production Sandbox');
    expect(drawer.textContent).toContain('FHIR 4.0.1');
      expect(drawer.textContent).toContain('2026-09-22T07:01:25Z');
    expect(drawer.textContent).toContain(CAPTURE_ID);
    expect(drawer.textContent).toContain(`Patient/${PATIENT_RESOURCE_ID}`);
    expect(drawer.textContent).toContain(`MedicationRequest/${MEDICATION_RESOURCE_ID}`);
    expect(drawer.textContent).toMatch(/GET-only|GET only/i);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: /Epic source details/i })).toBeNull();
    expect(document.activeElement).toBe(sourceButton);
  });

  it('keeps Epic evidence in the patient case without a separate staff navigation page', () => {
    render(<App />);
    openStaffCase();
    expect(screen.queryByRole('button', { name: 'Epic context' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Admin' })).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: /Epic/i }));
    expect(screen.getByRole('tabpanel', { name: /Epic/i }).textContent).toContain('Connected to Hospital Epic Sandbox');
    fireEvent.click(screen.getByRole('button', { name: 'View source details' }));
    expect(screen.getByRole('dialog', { name: /Epic source details/i }).textContent).toContain(CAPTURE_ID);
  });

  it('does not expose Epic clinical capture content in public or patient presentation', () => {
    render(<App />);

    expect(document.body.textContent).not.toContain(PATIENT_RESOURCE_ID);
    expect(document.body.textContent).not.toContain(CAPTURE_ID);
    expect(document.body.textContent).not.toContain('Camila Maria Lopez');

    fireEvent.click(screen.getAllByRole('button', { name: /Access workspace/i })[0]);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'abcp@oncoready.me' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '1234' } });
    fireEvent.click(screen.getAllByRole('button', { name: /^Sign in$/i }).at(-1)!);

    expect(document.body.textContent).not.toContain(PATIENT_RESOURCE_ID);
    expect(document.body.textContent).not.toContain(CAPTURE_ID);
    expect(document.body.textContent).not.toContain('drospirenone-ethinyl estradiol');
  });
});
