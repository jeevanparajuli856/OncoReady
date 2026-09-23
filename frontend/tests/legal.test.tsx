import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LegalPage } from '../src/components/LegalPage';

describe('LEGAL-001 support contact', () => {
  it.each(['terms', 'privacy'] as const)('%s page links only to support@oncoready.me', (page) => {
    render(<LegalPage document={page} />);

    const links = screen.getAllByRole('link', { name: 'support@oncoready.me' });
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => expect(link.getAttribute('href')).toBe('mailto:support@oncoready.me'));
    expect(document.body.textContent).not.toContain('oncoready.com');
  });
});
