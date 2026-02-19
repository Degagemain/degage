import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/euro-norm/read', () => ({
  readEuroNorm: vi.fn(),
}));

vi.mock('@/actions/euro-norm/update', () => ({
  updateEuroNorm: vi.fn(),
}));

vi.mock('@/actions/euro-norm/delete', () => ({
  deleteEuroNorm: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { DELETE, GET, PUT } from '@/api/euro-norms/[id]/route';
import { auth } from '@/auth';
import { readEuroNorm } from '@/actions/euro-norm/read';
import { updateEuroNorm } from '@/actions/euro-norm/update';
import { deleteEuroNorm } from '@/actions/euro-norm/delete';
import { euroNorm } from '../../../builders/euro-norm.builder';

const validId = '550e8400-e29b-41d4-a716-446655440000';

describe('API Route - GET /api/euro-norms/[id]', () => {
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

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await GET(request, route);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(readEuroNorm).not.toHaveBeenCalled();
    });

    it('returns 401 when session has no user', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: null } as any);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await GET(request, route);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(readEuroNorm).not.toHaveBeenCalled();
    });
  });

  describe('authorization - GET allowed for any authenticated user', () => {
    it('returns 200 when regular user requests by id', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);
      const mockEuroNorm = euroNorm({ id: validId, code: 'euro-6d', name: 'Euro 6d' });
      vi.mocked(readEuroNorm).mockResolvedValueOnce(mockEuroNorm);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await GET(request, route);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.id).toBe(validId);
      expect(json.code).toBe('euro-6d');
      expect(readEuroNorm).toHaveBeenCalledWith(validId);
    });

    it('returns 200 when admin requests by id', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      const mockEuroNorm = euroNorm({ id: validId, code: 'euro-5' });
      vi.mocked(readEuroNorm).mockResolvedValueOnce(mockEuroNorm);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await GET(request, route);

      expect(response.status).toBe(200);
      expect(readEuroNorm).toHaveBeenCalledWith(validId);
    });
  });
});

describe('API Route - PUT /api/euro-norms/[id]', () => {
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

  const updateBody = {
    id: validId,
    code: 'euro-6d',
    name: 'Euro 6d',
    group: 6,
    isActive: true,
    start: '2021-01-01',
    end: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('authorization - PUT admin only', () => {
    it('returns 401 when no session exists', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const request = { json: vi.fn().mockResolvedValue(updateBody) } as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await PUT(request, route);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(updateEuroNorm).not.toHaveBeenCalled();
    });

    it('returns 403 when regular user attempts to update', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);

      const request = { json: vi.fn().mockResolvedValue(updateBody) } as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await PUT(request, route);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.code).toBe('forbidden');
      expect(json.errors[0].message).toBe('Admin access required');
      expect(updateEuroNorm).not.toHaveBeenCalled();
    });

    it('returns 204 when admin updates', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      vi.mocked(updateEuroNorm).mockResolvedValueOnce(euroNorm(updateBody));

      const request = { json: vi.fn().mockResolvedValue(updateBody) } as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await PUT(request, route);

      expect(response.status).toBe(204);
      expect(updateEuroNorm).toHaveBeenCalledTimes(1);
    });
  });
});

describe('API Route - DELETE /api/euro-norms/[id]', () => {
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

  describe('authorization - DELETE admin only', () => {
    it('returns 401 when no session exists', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await DELETE(request, route);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(deleteEuroNorm).not.toHaveBeenCalled();
    });

    it('returns 403 when regular user attempts to delete', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await DELETE(request, route);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.code).toBe('forbidden');
      expect(json.errors[0].message).toBe('Admin access required');
      expect(deleteEuroNorm).not.toHaveBeenCalled();
    });

    it('returns 204 when admin deletes', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      vi.mocked(deleteEuroNorm).mockResolvedValueOnce(undefined);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await DELETE(request, route);

      expect(response.status).toBe(204);
      expect(deleteEuroNorm).toHaveBeenCalledWith(validId);
    });
  });
});
