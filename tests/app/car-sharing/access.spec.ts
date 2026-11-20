import { describe, expect, it } from 'vitest';

import { carSharingAccess } from '@/app/car-sharing/access';

describe('carSharingAccess', () => {
  it('sends a signed-out visitor to sign in', () => {
    expect(carSharingAccess(false, 'enabled')).toBe('sign-in');
    expect(carSharingAccess(false, 'loading')).toBe('sign-in');
    expect(carSharingAccess(false, 'disabled')).toBe('sign-in');
  });

  it('waits while the flag is loading for a signed-in visitor', () => {
    expect(carSharingAccess(true, 'loading')).toBe('wait');
  });

  it('sends a signed-in visitor home when the flag is off', () => {
    expect(carSharingAccess(true, 'disabled')).toBe('home');
  });

  it('shows the page when the visitor is signed in and the flag is on', () => {
    expect(carSharingAccess(true, 'enabled')).toBe('page');
  });
});
