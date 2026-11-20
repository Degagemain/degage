import { cleanup, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PublicLoginDialog } from '@/app/components/public/public-login-dialog';
import { type CarSharingAvailability } from '@/app/lib/use-car-sharing-enabled';

const availability = vi.hoisted(() => ({ current: 'disabled' as CarSharingAvailability }));

vi.mock('@/app/lib/use-car-sharing-enabled', () => ({
  useCarSharingEnabled: () => availability.current,
}));

const messages = {
  landing: {
    header: {
      loginDialog: {
        title: 'Sign in',
        degapp: { title: 'Degapp', badge: 'Most people', description: 'Book on Degapp.' },
        onboarding: { title: 'New owner onboarding', description: 'Enrol your car.' },
        carSharing: { title: 'Car sharing', description: 'Sign in here to use the new car-sharing app.' },
      },
    },
  },
};

const renderDialog = () => {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <PublicLoginDialog open onOpenChange={() => undefined} />
    </NextIntlClientProvider>,
  );
};

describe('PublicLoginDialog car sharing choice', () => {
  afterEach(() => {
    cleanup();
    availability.current = 'disabled';
  });

  it('hides the car-sharing choice while the flag is off or still loading', () => {
    availability.current = 'disabled';
    renderDialog();
    expect(screen.queryByRole('link', { name: /Car sharing/ })).toBeNull();

    cleanup();
    availability.current = 'loading';
    renderDialog();
    expect(screen.queryByRole('link', { name: /Car sharing/ })).toBeNull();
    expect(screen.getByRole('link', { name: /Degapp/ }).getAttribute('href')).toBe('https://degapp.be/');
    expect(screen.getByRole('link', { name: /New owner onboarding/ }).getAttribute('href')).toContain('/app/auth/sign-in');
  });

  it('shows the car-sharing choice when the flag is on', () => {
    availability.current = 'enabled';
    renderDialog();

    const carSharing = screen.getByRole('link', { name: /Car sharing/ });
    expect(carSharing.getAttribute('href')).toBe('/app/auth/sign-in?redirectTo=%2Fapp%2Fcar-sharing');
    expect(screen.getByRole('link', { name: /Degapp/ }).getAttribute('target')).toBe('_blank');
  });
});
