import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PREVIEW_BANNER_DISMISS_KEY, PreviewEnvironmentBanner } from '@/app/components/preview-environment-banner';

const storage = new Map<string, string>();

const localStorageMock: Storage = {
  get length() {
    return storage.size;
  },
  clear: () => storage.clear(),
  getItem: (key) => storage.get(key) ?? null,
  key: (index) => [...storage.keys()][index] ?? null,
  removeItem: (key) => {
    storage.delete(key);
  },
  setItem: (key, value) => {
    storage.set(key, String(value));
  },
};

const messages = {
  previewEnvironment: {
    message: 'You are on the test environment. This is not the live site.',
    dismiss: 'Dismiss',
  },
};

const renderBanner = () => {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <PreviewEnvironmentBanner />
    </NextIntlClientProvider>,
  );
};

describe('PreviewEnvironmentBanner', () => {
  beforeEach(() => {
    storage.clear();
    Object.defineProperty(window, 'localStorage', { configurable: true, value: localStorageMock });
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    storage.clear();
    document.documentElement.style.removeProperty('--preview-banner-offset');
  });

  it('stays hidden outside preview', () => {
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production');
    renderBanner();

    expect(screen.queryByRole('status')).toBeNull();
  });

  it('shows on preview deployments', async () => {
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'preview');
    renderBanner();

    const banner = await screen.findByRole('status');
    expect(banner.textContent).toContain('You are on the test environment');
  });

  it('hides for 24 hours after dismiss', async () => {
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'preview');
    renderBanner();

    fireEvent.click(await screen.findByRole('button', { name: 'Dismiss' }));

    expect(screen.queryByRole('status')).toBeNull();
    const dismissedAt = Number(window.localStorage.getItem(PREVIEW_BANNER_DISMISS_KEY));
    expect(Number.isFinite(dismissedAt)).toBe(true);

    cleanup();
    renderBanner();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('shows again once the dismissal is older than 24 hours', async () => {
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'preview');
    window.localStorage.setItem(PREVIEW_BANNER_DISMISS_KEY, String(Date.now() - 24 * 60 * 60 * 1000 - 1));
    renderBanner();

    expect(await screen.findByRole('status')).toBeTruthy();
  });
});
