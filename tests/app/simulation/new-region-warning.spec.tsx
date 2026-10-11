import { cleanup, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it } from 'vitest';

import { NewRegionWarning } from '@/app/simulation/components/new-region-warning';
import { NEW_REGION_START_DOC_HREF } from '@/app/simulation/simulation-public.constants';

const dutchWarning =
  'Opgelet: {town} is een nieuwe regio voor Dégage. Opstart in een nieuwe regio doen we niet automatisch, daar hebben we jou voor nodig. Meer info kan je in <link>dit startdocument</link> vinden. Zie je een dergelijk engagement zitten? [Dan horen we graag van je!](mailto:deeljeauto@degage.be)';

const renderWarning = (message: string) => {
  render(
    <NextIntlClientProvider locale="nl" messages={{ simulationPublic: { newRegionWarning: message } }}>
      <NewRegionWarning town="Erpe-Mere" />
    </NextIntlClientProvider>,
  );
};

describe('NewRegionWarning', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders a markdown mail link next to the starter document link', () => {
    renderWarning(dutchWarning);

    expect(screen.getByRole('note').textContent).toContain('Erpe-Mere');

    const startDoc = screen.getByRole('link', { name: 'dit startdocument' });
    expect(startDoc.getAttribute('href')).toBe(NEW_REGION_START_DOC_HREF);
    expect(startDoc.getAttribute('target')).toBe('_blank');
    expect(startDoc.getAttribute('rel')).toBe('noopener noreferrer');

    const email = screen.getByRole('link', { name: 'Dan horen we graag van je!' });
    expect(email.getAttribute('href')).toBe('mailto:deeljeauto@degage.be');
    expect(email.getAttribute('target')).toBeNull();
    expect(screen.queryByText(/mailto:deeljeauto@degage.be/)).toBeNull();
  });

  it('keeps the starter document link when the warning has no markdown', () => {
    renderWarning(
      'Opgelet: {town} is een nieuwe regio voor Dégage. Meer info kan je in <link>dit startdocument</link> vinden. Dan horen we graag van je!',
    );

    expect(screen.getByRole('link', { name: 'dit startdocument' }).getAttribute('href')).toBe(NEW_REGION_START_DOC_HREF);
    expect(screen.getByRole('note').textContent).toContain('Dan horen we graag van je!');
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });
});
