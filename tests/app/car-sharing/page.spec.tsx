import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

import { CarSharingContent } from '@/app/car-sharing/page';

describe('CarSharingContent', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows the connect button when the connection is missing', () => {
    render(<CarSharingContent status="missing" />);

    const link = screen.getByRole('link', { name: 'connect' });
    expect(link.getAttribute('href')).toBe('/app/account/settings?tab=play-connector&redirectTo=%2Fapp%2Fcar-sharing');
  });

  it('shows the connect button when the connection is failing', () => {
    render(<CarSharingContent status="failing" />);

    expect(screen.getByRole('link', { name: 'connect' })).toBeTruthy();
  });

  it('hides the connect button when the connection succeeded', () => {
    render(<CarSharingContent status="success" />);

    expect(screen.queryByRole('link', { name: 'connect' })).toBeNull();
  });

  it('shows a load error and hides the connect button when the connection could not be read', () => {
    render(<CarSharingContent status="load-error" />);

    expect(screen.getByText('loadError')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'connect' })).toBeNull();
  });
});
