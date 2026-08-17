import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, string>) => {
    if (values?.email) return `${key}:${values.email}`;
    return key;
  },
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock('@/app/lib/auth', () => ({
  authClient: {
    useSession: () => ({ data: { user: { email: 'user@example.com' } } }),
  },
}));

import { PlayConnectorCard } from '@/app/components/account/play-connector-card';

describe('PlayConnectorCard', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'success', email: 'user@example.com', sessionExpiresAt: null }),
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('shows disconnect when connected by default', async () => {
    render(<PlayConnectorCard />);

    await screen.findByText('connectedAs:user@example.com');
    expect(screen.getByRole('button', { name: 'disconnect' })).toBeTruthy();
  });

  it('hides disconnect when allowDisconnect is false', async () => {
    render(<PlayConnectorCard allowDisconnect={false} />);

    await screen.findByText('connectedAs:user@example.com');
    expect(screen.queryByRole('button', { name: 'disconnect' })).toBeNull();
  });
});
