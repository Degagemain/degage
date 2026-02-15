import { describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { auth } from '@/auth';
import { GET } from '@/api/system-parameters/route';

describe('GET /api/system-parameters', () => {
  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const request = new Request('http://localhost/api/system-parameters');
    const response = await GET(request as any);
    expect(response.status).toBe(401);
  });

  it('returns 403 when user is not admin', async () => {
    const session = {
      user: { id: '1', role: 'user', name: 'U', email: 'u@x.com' },
      session: {} as any,
    };
    vi.mocked(auth.api.getSession).mockResolvedValue(session);
    const request = new Request('http://localhost/api/system-parameters');
    const response = await GET(request as any);
    expect(response.status).toBe(403);
  });
});
