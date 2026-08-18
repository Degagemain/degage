import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/email-design/search', () => ({
  searchEmailDesigns: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET } from '@/api/email-designs/route';
import { auth } from '@/auth';
import { searchEmailDesigns } from '@/actions/email-design/search';
import { ResendNotConfiguredError } from '@/actions/email-design/resend-not-configured.error';

const mockAdminUser = {
  id: 'admin-id',
  name: 'Admin',
  email: 'admin@example.com',
  role: 'admin',
  banned: false,
};

const mockRegularUser = {
  id: 'user-id',
  name: 'User',
  email: 'user@example.com',
  role: 'user',
  banned: false,
};

describe('API Route - GET /api/email-designs', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when no session exists', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const response = await GET({} as never);
    expect(response.status).toBe(401);
    expect(searchEmailDesigns).not.toHaveBeenCalled();
  });

  it('returns 403 when a regular user requests designs', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockRegularUser } as never);
    const response = await GET({} as never);
    expect(response.status).toBe(403);
    expect(searchEmailDesigns).not.toHaveBeenCalled();
  });

  it('returns 200 when admin lists designs', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdminUser } as never);
    vi.mocked(searchEmailDesigns).mockResolvedValueOnce({
      records: [{ id: 'tmpl-1', name: 'Button', alias: 'button-email', status: 'published', variables: [] }],
      total: 1,
    });

    const response = await GET({} as never);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.total).toBe(1);
    expect(json.records[0].alias).toBe('button-email');
  });

  it('returns 503 when Resend is not configured', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdminUser } as never);
    vi.mocked(searchEmailDesigns).mockRejectedValueOnce(new ResendNotConfiguredError());

    const response = await GET({} as never);
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json.code).toBe('resend_not_configured');
  });
});
