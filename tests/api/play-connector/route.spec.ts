import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/play-connector/read-status', () => ({
  readPlayConnectorStatus: vi.fn(),
}));

vi.mock('@/actions/play-connector/link', () => ({
  linkPlayConnector: vi.fn(),
}));

vi.mock('@/actions/play-connector/disconnect', () => ({
  disconnectPlayConnector: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { DELETE, GET, PUT } from '@/api/play-connector/route';
import { auth } from '@/auth';
import { disconnectPlayConnector } from '@/actions/play-connector/disconnect';
import { linkPlayConnector } from '@/actions/play-connector/link';
import { readPlayConnectorStatus } from '@/actions/play-connector/read-status';

describe('API Route - /api/play-connector', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockUser = {
    id: 'user-id',
    name: 'User',
    email: 'user@example.com',
    role: 'user',
    banned: false,
  };

  it('GET returns 401 when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

    const response = await GET({} as any);
    expect(response.status).toBe(401);
  });

  it('GET returns connector status for current user', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockUser } as any);
    vi.mocked(readPlayConnectorStatus).mockResolvedValueOnce({
      status: 'success',
      email: 'user@example.com',
      loginBlockedUntil: null,
      sessionExpiresAt: null,
    });

    const response = await GET({} as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('success');
    expect(readPlayConnectorStatus).toHaveBeenCalledWith('user-id');
  });

  it('PUT links connector and returns success status', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockUser } as any);
    vi.mocked(linkPlayConnector).mockResolvedValueOnce({
      status: 'success',
      email: 'user@example.com',
      loginBlockedUntil: null,
      sessionExpiresAt: null,
    });

    const request = {
      json: async () => ({ email: 'user@example.com', password: 'secret' }),
    } as any;

    const response = await PUT(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('success');
  });

  it('DELETE disconnects and returns missing status', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockUser } as any);
    vi.mocked(disconnectPlayConnector).mockResolvedValueOnce({
      status: 'missing',
      email: null,
      loginBlockedUntil: null,
      sessionExpiresAt: null,
    });

    const response = await DELETE({} as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('missing');
  });
});
