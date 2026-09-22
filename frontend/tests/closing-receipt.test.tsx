import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { ClosingReceipt } from '../src/components/ClosingReceipt';
import { buildCheckpoint, workflowReducer } from '../src/state/workflowState';

describe('closing receipt', () => {
  it('links only current completed work to the shared timeline and reopens after plan failure', () => {
    const initial = buildCheckpoint('START', 'CARE_TEAM', 'CASE_WORKSPACE');
    const { rerender } = render(<ClosingReceipt state={initial} />);
    expect(screen.getByText('0 of 3 recorded')).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Open timeline evidence' })).toBeNull();

    const complete = buildCheckpoint('FINAL_CONFIRMATION', 'CARE_TEAM', 'CASE_WORKSPACE');
    rerender(<ClosingReceipt state={complete} />);
    expect(screen.getByText('3 of 3 recorded')).toBeDefined();
    const buttons = screen.getAllByRole('button', { name: 'Open timeline evidence' });
    expect(buttons).toHaveLength(3);
    fireEvent.click(buttons[1]);
    const evidence = document.getElementById('receipt-evidence-transport')!;
    expect(within(evidence).getByText('EVT-RIDE-RECOVERED-V2', { exact: false })).toBeDefined();
    expect(within(evidence).getByRole('link', { name: 'Jump to timeline' }).getAttribute('href')).toBe('#timeline-EVT-RIDE-RECOVERED-V2');

    const navigator = workflowReducer(complete, { type: 'SET_PERSPECTIVE', payload: 'CARE_NAVIGATOR' });
    const reopened = workflowReducer(navigator, { type: 'FAIL_CURRENT_RIDE' });
    rerender(<ClosingReceipt state={reopened} />);
    expect(screen.getByText('1 of 3 recorded')).toBeDefined();
    expect(screen.getAllByRole('button', { name: 'Open timeline evidence' })).toHaveLength(1);
    expect(screen.queryByText('EVT-RIDE-RECOVERED-V2', { exact: false })).toBeNull();
  });
});
