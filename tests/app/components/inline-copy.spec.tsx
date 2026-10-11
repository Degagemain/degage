import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { InlineCopy, renderInlineCopyRich } from '@/app/components/inline-copy';

describe('InlineCopy', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders markdown links as anchors', () => {
    render(
      <p>
        <InlineCopy>Visit [our website](https://www.example.com) or [email us](mailto:hello@example.com).</InlineCopy>
      </p>,
    );

    const website = screen.getByRole('link', { name: 'our website' });
    expect(website.getAttribute('href')).toBe('https://www.example.com');
    expect(website.getAttribute('target')).toBe('_blank');
    expect(website.getAttribute('rel')).toBe('noopener noreferrer');

    const email = screen.getByRole('link', { name: 'email us' });
    expect(email.getAttribute('href')).toBe('mailto:hello@example.com');
    expect(email.getAttribute('target')).toBeNull();
  });

  it('renders plain text without anchors', () => {
    render(
      <p>
        <InlineCopy>No links here</InlineCopy>
      </p>,
    );

    expect(screen.getByText('No links here')).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders markdown links in the text around a rich-text anchor', () => {
    render(
      <p>
        {renderInlineCopyRich([
          'Meer info kan je in ',
          <a key="start" href="https://www.degage.be/start.pdf">
            dit startdocument
          </a>,
          ' vinden. [Dan horen we graag van je!](mailto:deeljeauto@degage.be)',
        ])}
      </p>,
    );

    const startDoc = screen.getByRole('link', { name: 'dit startdocument' });
    expect(startDoc.getAttribute('href')).toBe('https://www.degage.be/start.pdf');

    const email = screen.getByRole('link', { name: 'Dan horen we graag van je!' });
    expect(email.getAttribute('href')).toBe('mailto:deeljeauto@degage.be');
    expect(email.getAttribute('target')).toBeNull();
    expect(screen.queryByText(/\[Dan horen we graag van je!\]/)).toBeNull();
  });
});
