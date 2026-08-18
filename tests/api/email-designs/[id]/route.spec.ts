import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/email-design/read', () => ({
  readEmailDesign: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET } from '@/api/email-designs/[id]/route';
import { auth } from '@/auth';
import { readEmailDesign } from '@/actions/email-design/read';
import { NotFoundError } from '@/actions/app.error';

const mockAdminUser = {
  id: 'admin-id',
  name: 'Admin',
  email: 'admin@example.com',
  role: 'admin',
  banned: false,
};

describe('API Route - GET /api/email-designs/[id]', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when no session exists', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const response = await GET({} as never, { params: Promise.resolve({ id: 'button-email' }) });
    expect(response.status).toBe(401);
    expect(readEmailDesign).not.toHaveBeenCalled();
  });

  it('returns 200 when admin reads a design by alias', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdminUser } as never);
    vi.mocked(readEmailDesign).mockResolvedValueOnce({
      id: 'tmpl-1',
      name: 'Button',
      alias: 'button-email',
      status: 'published',
      variables: [{ key: 'SUBJECT', type: 'string', fallbackValue: '' }],
    });

    const response = await GET({} as never, { params: Promise.resolve({ id: 'button-email' }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.alias).toBe('button-email');
    expect(readEmailDesign).toHaveBeenCalledWith('button-email');
  });

  it('returns 404 when the design is missing', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdminUser } as never);
    vi.mocked(readEmailDesign).mockRejectedValueOnce(new NotFoundError('Email design not found'));

    const response = await GET({} as never, { params: Promise.resolve({ id: 'missing' }) });
    expect(response.status).toBe(404);
  });
});
