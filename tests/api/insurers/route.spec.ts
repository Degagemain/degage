import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/insurer/search', () => ({
  searchInsurers: vi.fn(),
}));

vi.mock('@/actions/insurer/create', () => ({
  createInsurer: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET, POST } from '@/api/insurers/route';
import { auth } from '@/auth';
import { searchInsurers } from '@/actions/insurer/search';
import { createInsurer } from '@/actions/insurer/create';
import { insurer } from '../../builders/insurer.builder';

describe('API Route - GET /api/insurers', () => {
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

  describe('GET is public (no auth required)', () => {
    it('returns 200 when unauthenticated', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
      vi.mocked(searchInsurers).mockResolvedValueOnce({
        records: [insurer({ name: 'Ethias' })],
        total: 1,
      });

      const request = {
        nextUrl: new URL('http://localhost/api/insurers'),
      } as any;

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.records).toHaveLength(1);
      expect(json.total).toBe(1);
      expect(searchInsurers).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET returns list for any caller', () => {
    it('returns 200 when regular user requests list', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);
      vi.mocked(searchInsurers).mockResolvedValueOnce({
        records: [insurer({ name: 'Ethias' })],
        total: 1,
      });

      const request = {
        nextUrl: new URL('http://localhost/api/insurers'),
      } as any;

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.records).toHaveLength(1);
      expect(json.total).toBe(1);
      expect(searchInsurers).toHaveBeenCalledTimes(1);
    });

    it('returns 200 when admin requests list', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      vi.mocked(searchInsurers).mockResolvedValueOnce({
        records: [insurer({ name: 'AXA' })],
        total: 1,
      });

      const request = {
        nextUrl: new URL('http://localhost/api/insurers'),
      } as any;

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(searchInsurers).toHaveBeenCalledTimes(1);
    });
  });
});

describe('API Route - POST /api/insurers', () => {
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

  const validInsurerBody = {
    id: null,
    name: 'Ethias',
    createdAt: null,
    updatedAt: null,
  };

  describe('authentication', () => {
    it('returns 401 when no session exists', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const request = {
        nextUrl: new URL('http://localhost/api/insurers'),
        json: vi.fn().mockResolvedValue(validInsurerBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(createInsurer).not.toHaveBeenCalled();
    });

    it('returns 401 when session has no user', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: null } as any);

      const request = {
        nextUrl: new URL('http://localhost/api/insurers'),
        json: vi.fn().mockResolvedValue(validInsurerBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(createInsurer).not.toHaveBeenCalled();
    });
  });

  describe('authorization - POST admin only', () => {
    it('returns 403 when regular user attempts to create', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);

      const request = {
        nextUrl: new URL('http://localhost/api/insurers'),
        json: vi.fn().mockResolvedValue(validInsurerBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.code).toBe('forbidden');
      expect(json.errors[0].message).toBe('Access denied');
      expect(createInsurer).not.toHaveBeenCalled();
    });

    it('returns 201 when admin creates insurer', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      const created = insurer({ id: 'new-id', name: 'Ethias' });
      vi.mocked(createInsurer).mockResolvedValueOnce(created);

      const request = {
        nextUrl: new URL('http://localhost/api/insurers'),
        json: vi.fn().mockResolvedValue(validInsurerBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.name).toBe('Ethias');
      expect(createInsurer).toHaveBeenCalledTimes(1);
    });
  });
});
