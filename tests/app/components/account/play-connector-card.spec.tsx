import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const push = vi.hoisted(() => vi.fn());
const translate = vi.hoisted(() => (key: string, values?: Record<string, string>) => (values?.email ? `${key}:${values.email}` : key));

vi.mock('next-intl', () => ({
  useTranslations: () => translate,
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
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

  const connect = async (returnPath: string) => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        if (init?.method === 'PUT') {
          return {
            ok: true,
            json: async () => ({ status: 'success', email: 'user@example.com', sessionExpiresAt: null }),
          };
        }
        return { ok: true, json: async () => ({ status: 'missing', email: null, sessionExpiresAt: null }) };
      }),
    );
    render(<PlayConnectorCard returnPath={returnPath} />);
    fireEvent.change(await screen.findByLabelText('email'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText('password'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'connect' }));
    await screen.findByText('connectedAs:user@example.com');
  };

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

  it('returns to the car-sharing page after a successful connect', async () => {
    await connect('/app/car-sharing');

    expect(push).toHaveBeenCalledWith('/app/car-sharing');
    expect(screen.queryByLabelText('password')).toBeNull();
  });

  it('ignores a return path that is not the car-sharing page', async () => {
    await connect('https://evil.example');

    expect(push).not.toHaveBeenCalled();
  });
});
