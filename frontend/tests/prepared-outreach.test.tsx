import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { AuditTimeline } from '../src/components/AuditTimeline';
import { PREPARED_OUTREACH_EVENTS, PREPARED_OUTREACH_THREADS } from '../src/data/preparedOutreach';

describe('prepared outreach history', () => {
  it('opens message, reply, and follow-up from the same timeline fixture without showing future reply early', () => {
    const { rerender } = render(<AuditTimeline events={PREPARED_OUTREACH_EVENTS} />);
    const first = PREPARED_OUTREACH_THREADS[0];
    fireEvent.click(screen.getAllByRole('button', { name: 'Open message thread' })[0]);
    const firstDetail = document.getElementById(`prepared-thread-${first.eventIds[0]}`)!;
    expect(within(firstDetail).getByText(`“${first.message}”`)).toBeDefined();
    expect(within(firstDetail).getByText(`“${first.reply}”`)).toBeDefined();
    expect(within(firstDetail).getByText(first.followUp)).toBeDefined();
    expect(PREPARED_OUTREACH_EVENTS.find((event) => event.id === first.eventIds[1])?.timestamp).toBe(first.sentAt);

    fireEvent.click(screen.getAllByRole('button', { name: 'Open message thread' }).at(-1)!);
    const second = PREPARED_OUTREACH_THREADS[1];
    const secondDetail = document.getElementById(`prepared-thread-${second.eventIds[0]}`)!;
    expect(within(secondDetail).queryByText(`“${second.reply}”`)).toBeNull();
    rerender(<AuditTimeline events={PREPARED_OUTREACH_EVENTS} showFinalReply />);
    expect(within(secondDetail).getByText(`“${second.reply}”`)).toBeDefined();
    expect(within(secondDetail).getByText(second.followUp)).toBeDefined();
  });
});
