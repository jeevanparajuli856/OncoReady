import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { App } from '../src/App';
import { ReadinessInsights } from '../src/components/ReadinessInsights';
import bundledArtifact from '../src/data/ml-insights.json';
import {
  computeMlInsightsIntegrity,
  parseMlInsights,
} from '../src/data/mlInsights';

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const reseal = (value: Record<string, unknown>): Record<string, unknown> => {
  const next = clone(value);
  delete next.integrity_hash;
  next.integrity_hash = computeMlInsightsIntegrity(next);
  return next;
};

const openStaffCase = () => {
  fireEvent.click(screen.getAllByRole('button', { name: /Access workspace/i })[0]);
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'abcs@oncoready.me' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: '1234' } });
  fireEvent.click(screen.getAllByRole('button', { name: /^Sign in$/i }).at(-1)!);
  fireEvent.click(screen.getByRole('button', { name: /Review Case/i }));
};

describe('ML-001 saved staff insights', () => {
  beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps the bundled and public result byte-identical to the canonical ML artifact', () => {
    const canonical = readFileSync(resolve(process.cwd(), '../ml/artifacts/demo-insights.json'));
    const bundled = readFileSync(resolve(process.cwd(), 'src/data/ml-insights.json'));
    const published = readFileSync(resolve(process.cwd(), 'public/evidence/ml/demo-insights.json'));

    expect(bundled.equals(canonical)).toBe(true);
    expect(published.equals(canonical)).toBe(true);
    expect(readFileSync(resolve(process.cwd(), 'public/evidence/ml/readiness-demo.ipynb')).length).toBeGreaterThan(0);
    expect(readFileSync(resolve(process.cwd(), 'public/evidence/ml/synthetic-readiness.csv')).length).toBeGreaterThan(0);
    expect(readFileSync(resolve(process.cwd(), 'public/evidence/ml/DATA_DICTIONARY.md')).length).toBeGreaterThan(0);
  });

  it('validates the saved checkpoints, factors, metrics and comparison', () => {
    const result = parseMlInsights(bundledArtifact as unknown);
    expect(result.status).toBe('ready');
    if (result.status !== 'ready') return;

    expect(result.data.checkpoints.map((item) => [item.checkpoint, item.score])).toEqual([
      ['T-7', 13.8],
      ['T-2', 20.5],
      ['T-1', 26.4],
    ]);
    expect(result.data.checkpoints.every((item) => item.factors.length === 3)).toBe(true);
    expect(result.data.evaluation.modelAccuracy).toBe(0.641667);
    expect(result.data.evaluation.baselineAccuracy).toBe(0.603333);
    expect(result.data.whatIf?.baseline.score).toBe(45.2);
    expect(result.data.whatIf?.transportationAvailable.score).toBe(26.4);
    expect(result.data.whatIf?.scoreDelta).toBe(-18.8);
  });

  it('fails closed when a saved score is tampered with', () => {
    const tampered = clone(bundledArtifact) as typeof bundledArtifact;
    tampered.checkpoints[0].score = 99;
    const result = parseMlInsights(tampered as unknown);
    expect(result.status).toBe('unavailable');
    if (result.status === 'unavailable') expect(result.reason).toMatch(/integrity/i);
  });

  it('renders every checkpoint disclosure, honest evidence, and the isolated comparison', () => {
    render(<ReadinessInsights />);

    expect(screen.getByRole('heading', { name: /Saved readiness trajectory/i })).toBeDefined();
    expect(screen.getByText('ReadySignal')).toBeDefined();
    expect(screen.getByText('ReadySignal 1.0')).toBeDefined();
    expect(document.body.textContent).not.toMatch(/synthetic/i);
    for (const [checkpoint, score] of [['T-7', '13.8'], ['T-2', '20.5'], ['T-1', '26.4']]) {
      expect(screen.getByRole('button', { name: new RegExp(`${checkpoint}.*model score ${score}`, 'i') })).toBeDefined();
      const why = screen.getByRole('button', { name: new RegExp(`Why flagged at ${checkpoint}`, 'i') });
      fireEvent.click(why);
      const disclosure = screen.getByRole('region', { name: new RegExp(`${checkpoint} factors`, 'i') });
      expect(within(disclosure).getAllByRole('listitem')).toHaveLength(3);
      expect(disclosure.textContent).toMatch(/associated with (higher|lower) model output/i);
      expect(disclosure.textContent).toContain('Workflow suggestion · not model-derived');
    }

    expect(screen.getByText('64.2%')).toBeDefined();
    expect(screen.getByText('60.3%')).toBeDefined();
    expect(screen.queryByRole('link')).toBeNull();
    expect(document.body.textContent).not.toMatch(/synthetic/i);

    const available = screen.getByRole('button', { name: /Transportation available.*26.4/i });
    fireEvent.click(available);
    expect(available.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText(/Saved difference: -18.8 model-score points/i)).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /Reset comparison/i }));
    expect(screen.getByRole('button', { name: /Actual comparison.*45.2/i }).getAttribute('aria-pressed')).toBe('true');
  });

  it('shows scoped factor/comparison fallbacks and a whole-panel malformed fallback', () => {
    const missingOptional = clone(bundledArtifact) as unknown as Record<string, unknown>;
    const checkpoints = missingOptional.checkpoints as Array<Record<string, unknown>>;
    checkpoints[0].factors = [];
    delete missingOptional.what_if;
    const optionalArtifact = reseal(missingOptional);
    const { unmount } = render(<ReadinessInsights artifact={optionalArtifact} />);

    fireEvent.click(screen.getByRole('button', { name: /Why flagged at T-7/i }));
    expect(screen.getByText(/No exported factors are available for this checkpoint/i)).toBeDefined();
    expect(screen.getByText(/Transportation comparison unavailable in the saved model output/i)).toBeDefined();
    expect(screen.queryByRole('button', { name: /Transportation available.*model score/i })).toBeNull();

    unmount();
    render(<ReadinessInsights artifact={{ checkpoints: [] }} />);
    expect(screen.getByRole('alert').textContent).toMatch(/Insights unavailable/i);
    expect(screen.getByRole('alert').textContent).toMatch(/staff workflow remains available/i);
    expect(document.body.textContent).not.toContain('13.8');
  });

  it('adds Insights to roving tab order and keeps workflow state unchanged', () => {
    render(<App />);
    openStaffCase();

    const tabs = screen.getByRole('tablist', { name: /Case information/i });
    const epic = within(tabs).getByRole('tab', { name: /^Epic$/i });
    const insights = within(tabs).getByRole('tab', { name: /^Insights$/i });
    epic.focus();
    fireEvent.keyDown(epic, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(insights);
    fireEvent.keyDown(insights, { key: 'Enter' });
    expect(insights.getAttribute('aria-selected')).toBe('true');

    const before = localStorage.getItem('oncoready_workflow_state_v4');
    fireEvent.click(screen.getByRole('button', { name: /Why flagged at T-1/i }));
    fireEvent.click(screen.getByRole('button', { name: /Transportation available.*26.4/i }));
    expect(localStorage.getItem('oncoready_workflow_state_v4')).toBe(before);

    fireEvent.click(within(tabs).getByRole('tab', { name: /^Graph$/i }));
    fireEvent.click(insights);
    expect(screen.getByRole('button', { name: /Actual comparison.*45.2/i }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: /Why flagged at T-1/i }).getAttribute('aria-expanded')).toBe('false');
    expect(localStorage.getItem('oncoready_workflow_state_v4')).toBe(before);
  });
});
