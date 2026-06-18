import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/play-infosession/list', () => ({
  listPlayInfosessions: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET } from '@/api/play-infosessions/route';
import { auth } from '@/auth';
import { listPlayInfosessions } from '@/actions/play-infosession/list';
import { playInfosessionSchema } from '@/domain/play-infosession.model';

describe('API Route - GET /api/play-infosessions', () => {
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

    const response = await GET({} as any);
    expect(response.status).toBe(401);
  });

  it('returns infosessions for authenticated user', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockUser } as any);
    vi.mocked(listPlayInfosessions).mockResolvedValueOnce([
      playInfosessionSchema.parse({
        scheduledAt: 'za 20 jun 2026 09:25',
        district: 'Gent - Wondelgem',
        type: 'Voor Leners van auto of fiets',
        registrations: '14 / 20',
        host: 'Host Alpha',
        enrollId: '1359',
        enrollUrl: 'https://degapp.be/infosession/enroll?id=1359',
      }),
    ]);

    const response = await GET({} as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.infosessions).toHaveLength(1);
    expect(listPlayInfosessions).toHaveBeenCalledWith('user-id');
  });
});
