import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/euro-norm/search', () => ({
  searchEuroNorms: vi.fn(),
}));

vi.mock('@/actions/euro-norm/create', () => ({
  createEuroNorm: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET, POST } from '@/api/euro-norms/route';
import { auth } from '@/auth';
import { searchEuroNorms } from '@/actions/euro-norm/search';
import { createEuroNorm } from '@/actions/euro-norm/create';
import { euroNorm } from '../../builders/euro-norm.builder';

describe('API Route - GET /api/euro-norms', () => {
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

      const request = { nextUrl: new URL('http://localhost/api/euro-norms') } as any;

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(searchEuroNorms).not.toHaveBeenCalled();
    });

    it('returns 401 when session has no user', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: null } as any);

      const request = { nextUrl: new URL('http://localhost/api/euro-norms') } as any;

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(searchEuroNorms).not.toHaveBeenCalled();
    });
  });

  describe('authorization - GET allowed for any authenticated user', () => {
    it('returns 200 when regular user requests list', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);
      vi.mocked(searchEuroNorms).mockResolvedValueOnce({
        records: [euroNorm({ code: 'euro-6d', name: 'Euro 6d' })],
        total: 1,
      });

      const request = { nextUrl: new URL('http://localhost/api/euro-norms') } as any;

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.records).toHaveLength(1);
      expect(json.total).toBe(1);
      expect(searchEuroNorms).toHaveBeenCalledTimes(1);
    });

    it('returns 200 when admin requests list', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      vi.mocked(searchEuroNorms).mockResolvedValueOnce({
        records: [euroNorm({ code: 'euro-5' })],
        total: 1,
      });

      const request = { nextUrl: new URL('http://localhost/api/euro-norms') } as any;

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(searchEuroNorms).toHaveBeenCalledTimes(1);
    });
  });
});

describe('API Route - POST /api/euro-norms', () => {
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

  const validEuroNormBody = {
    id: null,
    code: 'euro-6d',
    name: 'Euro 6d',
    isActive: true,
    start: '2021-01-01',
    end: null,
    createdAt: null,
    updatedAt: null,
  };

  describe('authentication', () => {
    it('returns 401 when no session exists', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const request = {
        nextUrl: new URL('http://localhost/api/euro-norms'),
        json: vi.fn().mockResolvedValue(validEuroNormBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(createEuroNorm).not.toHaveBeenCalled();
    });

    it('returns 401 when session has no user', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: null } as any);

      const request = {
        nextUrl: new URL('http://localhost/api/euro-norms'),
        json: vi.fn().mockResolvedValue(validEuroNormBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(createEuroNorm).not.toHaveBeenCalled();
    });
  });

  describe('authorization - POST admin only', () => {
    it('returns 403 when regular user attempts to create', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);

      const request = {
        nextUrl: new URL('http://localhost/api/euro-norms'),
        json: vi.fn().mockResolvedValue(validEuroNormBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.code).toBe('forbidden');
      expect(json.errors[0].message).toBe('Admin access required');
      expect(createEuroNorm).not.toHaveBeenCalled();
    });

    it('returns 201 when admin creates euro norm', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      const created = euroNorm({ id: 'new-id', code: 'euro-6d' });
      vi.mocked(createEuroNorm).mockResolvedValueOnce(created);

      const request = {
        nextUrl: new URL('http://localhost/api/euro-norms'),
        json: vi.fn().mockResolvedValue(validEuroNormBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.code).toBe('euro-6d');
      expect(createEuroNorm).toHaveBeenCalledTimes(1);
    });
  });
});
