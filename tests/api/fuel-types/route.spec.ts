import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/fuel-type/search', () => ({
  searchFuelTypes: vi.fn(),
}));

vi.mock('@/actions/fuel-type/create', () => ({
  createFuelType: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET, POST } from '@/api/fuel-types/route';
import { auth } from '@/auth';
import { searchFuelTypes } from '@/actions/fuel-type/search';
import { createFuelType } from '@/actions/fuel-type/create';
import { fuelType } from '../../builders/fuel-type.builder';

describe('API Route - GET /api/fuel-types', () => {
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

      const request = {
        nextUrl: new URL('http://localhost/api/fuel-types'),
      } as any;

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(searchFuelTypes).not.toHaveBeenCalled();
    });

    it('returns 401 when session has no user', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: null } as any);

      const request = {
        nextUrl: new URL('http://localhost/api/fuel-types'),
      } as any;

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(searchFuelTypes).not.toHaveBeenCalled();
    });
  });

  describe('authorization - GET allowed for any authenticated user', () => {
    it('returns 200 when regular user requests list', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);
      vi.mocked(searchFuelTypes).mockResolvedValueOnce({
        records: [fuelType({ code: 'electric', name: 'Electric' })],
        total: 1,
      });

      const request = {
        nextUrl: new URL('http://localhost/api/fuel-types'),
      } as any;

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.records).toHaveLength(1);
      expect(json.total).toBe(1);
      expect(searchFuelTypes).toHaveBeenCalledTimes(1);
    });

    it('returns 200 when admin requests list', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      vi.mocked(searchFuelTypes).mockResolvedValueOnce({
        records: [fuelType({ code: 'diesel' })],
        total: 1,
      });

      const request = {
        nextUrl: new URL('http://localhost/api/fuel-types'),
      } as any;

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(searchFuelTypes).toHaveBeenCalledTimes(1);
    });
  });
});

describe('API Route - POST /api/fuel-types', () => {
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

  const validFuelTypeBody = {
    id: null,
    code: 'electric',
    name: 'Electric',
    isActive: true,
    translations: [
      { locale: 'en', name: 'Electric' },
      { locale: 'nl', name: 'Elektrisch' },
      { locale: 'fr', name: 'Électrique' },
    ],
    createdAt: null,
    updatedAt: null,
  };

  describe('authentication', () => {
    it('returns 401 when no session exists', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const request = {
        nextUrl: new URL('http://localhost/api/fuel-types'),
        json: vi.fn().mockResolvedValue(validFuelTypeBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(createFuelType).not.toHaveBeenCalled();
    });

    it('returns 401 when session has no user', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: null } as any);

      const request = {
        nextUrl: new URL('http://localhost/api/fuel-types'),
        json: vi.fn().mockResolvedValue(validFuelTypeBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(createFuelType).not.toHaveBeenCalled();
    });
  });

  describe('authorization - POST admin only', () => {
    it('returns 403 when regular user attempts to create', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);

      const request = {
        nextUrl: new URL('http://localhost/api/fuel-types'),
        json: vi.fn().mockResolvedValue(validFuelTypeBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.code).toBe('forbidden');
      expect(json.errors[0].message).toBe('Admin access required');
      expect(createFuelType).not.toHaveBeenCalled();
    });

    it('returns 201 when admin creates fuel type', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      const created = fuelType({ id: 'new-id', code: 'electric' });
      vi.mocked(createFuelType).mockResolvedValueOnce(created);

      const request = {
        nextUrl: new URL('http://localhost/api/fuel-types'),
        json: vi.fn().mockResolvedValue(validFuelTypeBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.code).toBe('electric');
      expect(createFuelType).toHaveBeenCalledTimes(1);
    });
  });
});
