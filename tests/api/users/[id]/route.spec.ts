import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/user/read', () => ({
  readUser: vi.fn(),
}));

vi.mock('@/actions/user/update', () => ({
  updateUser: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET, PUT } from '@/api/users/[id]/route';
import { auth } from '@/auth';
import { readUser } from '@/actions/user/read';
import { updateUser } from '@/actions/user/update';
import { AppError } from '@/actions/app.error';
import { Role } from '@/domain/role.model';
import { user } from '../../../builders/user.builder';

const validId = '550e8400-e29b-41d4-a716-446655440000';
const nanoidId = 'better-auth-user-id';

describe('API Route - GET /api/users/[id]', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

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

  describe('authentication', () => {
    it('returns 401 when no session exists', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

      const response = await GET({} as never, { params: Promise.resolve({ id: validId }) });
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(readUser).not.toHaveBeenCalled();
    });
  });

  describe('authorization', () => {
    it('returns 403 when a regular user requests by id', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockRegularUser } as never);

      const response = await GET({} as never, { params: Promise.resolve({ id: validId }) });
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.code).toBe('forbidden');
      expect(readUser).not.toHaveBeenCalled();
    });

    it('returns 200 when an admin requests by id', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdminUser } as never);
      const mockUser = user({ id: validId, role: Role.USER });
      vi.mocked(readUser).mockResolvedValueOnce(mockUser);

      const response = await GET({} as never, { params: Promise.resolve({ id: validId }) });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.id).toBe(validId);
      expect(readUser).toHaveBeenCalledWith(validId);
    });

    it('accepts a non-uuid better-auth id', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdminUser } as never);
      vi.mocked(readUser).mockResolvedValueOnce(user({ id: nanoidId }));

      const response = await GET({} as never, { params: Promise.resolve({ id: nanoidId }) });

      expect(response.status).toBe(200);
      expect(readUser).toHaveBeenCalledWith(nanoidId);
    });
  });
});

describe('API Route - PUT /api/users/[id]', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

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

  const updateBody = user({ id: validId, role: Role.ADMIN, name: 'Promoted' });

  it('returns 401 when no session exists', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const request = { json: vi.fn().mockResolvedValue(updateBody) } as never;
    const response = await PUT(request, { params: Promise.resolve({ id: validId }) });
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.code).toBe('unauthorized');
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('returns 403 when a regular user attempts to update', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as never);

    const request = { json: vi.fn().mockResolvedValue(updateBody) } as never;
    const response = await PUT(request, { params: Promise.resolve({ id: validId }) });
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.code).toBe('forbidden');
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('returns 204 when an admin updates', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as never);
    vi.mocked(updateUser).mockResolvedValueOnce(updateBody);

    const request = { json: vi.fn().mockResolvedValue(updateBody) } as never;
    const response = await PUT(request, { params: Promise.resolve({ id: validId }) });

    expect(response.status).toBe(204);
    expect(updateUser).toHaveBeenCalledTimes(1);
  });

  it('returns 409 when updating would remove the last admin', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as never);
    vi.mocked(updateUser).mockRejectedValueOnce(new AppError('last_admin', 'Cannot remove the last remaining admin.', 409));

    const request = { json: vi.fn().mockResolvedValue(updateBody) } as never;
    const response = await PUT(request, { params: Promise.resolve({ id: validId }) });
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json.code).toBe('last_admin');
  });
});
