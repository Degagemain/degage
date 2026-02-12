import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/car-brand/search', () => ({
  searchCarBrands: vi.fn(),
}));

vi.mock('@/actions/car-brand/create', () => ({
  createCarBrand: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET, POST } from '@/api/car-brands/route';
import { auth } from '@/auth';
import { searchCarBrands } from '@/actions/car-brand/search';
import { createCarBrand } from '@/actions/car-brand/create';
import { carBrand } from '../../builders/car-brand.builder';

describe('API Route - GET /api/car-brands', () => {
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
        nextUrl: new URL('http://localhost/api/car-brands'),
      } as any;

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(searchCarBrands).not.toHaveBeenCalled();
    });

    it('returns 401 when session has no user', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: null } as any);

      const request = {
        nextUrl: new URL('http://localhost/api/car-brands'),
      } as any;

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(searchCarBrands).not.toHaveBeenCalled();
    });
  });

  describe('authorization - GET allowed for any authenticated user', () => {
    it('returns 200 when regular user requests list', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);
      vi.mocked(searchCarBrands).mockResolvedValueOnce({
        records: [carBrand({ code: 'audi', name: 'Audi' })],
        total: 1,
      });

      const request = {
        nextUrl: new URL('http://localhost/api/car-brands'),
      } as any;

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.records).toHaveLength(1);
      expect(json.total).toBe(1);
      expect(searchCarBrands).toHaveBeenCalledTimes(1);
    });

    it('returns 200 when admin requests list', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      vi.mocked(searchCarBrands).mockResolvedValueOnce({
        records: [carBrand({ code: 'bmw' })],
        total: 1,
      });

      const request = {
        nextUrl: new URL('http://localhost/api/car-brands'),
      } as any;

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(searchCarBrands).toHaveBeenCalledTimes(1);
    });
  });
});

describe('API Route - POST /api/car-brands', () => {
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

  const validCarBrandBody = {
    id: null,
    code: 'audi',
    name: 'Audi',
    isActive: true,
    translations: [
      { locale: 'en', name: 'Audi' },
      { locale: 'nl', name: 'Audi' },
      { locale: 'fr', name: 'Audi' },
    ],
    createdAt: null,
    updatedAt: null,
  };

  describe('authentication', () => {
    it('returns 401 when no session exists', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const request = {
        nextUrl: new URL('http://localhost/api/car-brands'),
        json: vi.fn().mockResolvedValue(validCarBrandBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(createCarBrand).not.toHaveBeenCalled();
    });

    it('returns 401 when session has no user', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: null } as any);

      const request = {
        nextUrl: new URL('http://localhost/api/car-brands'),
        json: vi.fn().mockResolvedValue(validCarBrandBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(createCarBrand).not.toHaveBeenCalled();
    });
  });

  describe('authorization - POST admin only', () => {
    it('returns 403 when regular user attempts to create', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);

      const request = {
        nextUrl: new URL('http://localhost/api/car-brands'),
        json: vi.fn().mockResolvedValue(validCarBrandBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.code).toBe('forbidden');
      expect(json.errors[0].message).toBe('Admin access required');
      expect(createCarBrand).not.toHaveBeenCalled();
    });

    it('returns 201 when admin creates car brand', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      const created = carBrand({ id: 'new-id', code: 'audi' });
      vi.mocked(createCarBrand).mockResolvedValueOnce(created);

      const request = {
        nextUrl: new URL('http://localhost/api/car-brands'),
        json: vi.fn().mockResolvedValue(validCarBrandBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.code).toBe('audi');
      expect(createCarBrand).toHaveBeenCalledTimes(1);
    });
  });
});
