import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/play-infosession/unenroll', () => ({
  unenrollPlayInfosession: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { PUT } from '@/api/play-infosessions/unenroll/route';
import { auth } from '@/auth';
import { unenrollPlayInfosession } from '@/actions/play-infosession/unenroll';

describe('API Route - PUT /api/play-infosessions/unenroll', () => {
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

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

    const response = await PUT({} as any);
    expect(response.status).toBe(401);
  });

  it('unenrolls from Play for authenticated user', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockUser } as any);
    vi.mocked(unenrollPlayInfosession).mockResolvedValueOnce(undefined);

    const response = await PUT({} as any);

    expect(response.status).toBe(204);
    expect(unenrollPlayInfosession).toHaveBeenCalledWith('user-id');
  });
});
