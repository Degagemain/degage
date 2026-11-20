import { describe, expect, it } from 'vitest';

import { carSharingAccess, carSharingConnectReturnPath, carSharingShowsConnectPrompt } from '@/app/car-sharing/access';

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

describe('carSharingConnectReturnPath', () => {
  it('accepts only the car-sharing page', () => {
    expect(carSharingConnectReturnPath('/app/car-sharing')).toBe('/app/car-sharing');
  });

  it('rejects other paths, protocol-relative URLs, and off-site URLs', () => {
    expect(carSharingConnectReturnPath(null)).toBeNull();
    expect(carSharingConnectReturnPath('')).toBeNull();
    expect(carSharingConnectReturnPath('/app')).toBeNull();
    expect(carSharingConnectReturnPath('/app/dashboard')).toBeNull();
    expect(carSharingConnectReturnPath('/app/car-sharing/extra')).toBeNull();
    expect(carSharingConnectReturnPath('//evil.example')).toBeNull();
    expect(carSharingConnectReturnPath('https://evil.example')).toBeNull();
    expect(carSharingConnectReturnPath('/app/car-sharing?next=https://evil.example')).toBeNull();
  });
});

describe('carSharingShowsConnectPrompt', () => {
  it('shows the prompt only when the connection is missing or failing', () => {
    expect(carSharingShowsConnectPrompt('missing')).toBe(true);
    expect(carSharingShowsConnectPrompt('failing')).toBe(true);
    expect(carSharingShowsConnectPrompt('success')).toBe(false);
  });
});
