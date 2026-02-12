import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/car-brand/read', () => ({
  readCarBrand: vi.fn(),
}));

vi.mock('@/actions/car-brand/update', () => ({
  updateCarBrand: vi.fn(),
}));

vi.mock('@/actions/car-brand/delete', () => ({
  deleteCarBrand: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { DELETE, GET, PUT } from '@/api/car-brands/[id]/route';
import { auth } from '@/auth';
import { readCarBrand } from '@/actions/car-brand/read';
import { updateCarBrand } from '@/actions/car-brand/update';
import { deleteCarBrand } from '@/actions/car-brand/delete';
import { carBrand } from '../../../builders/car-brand.builder';

const validId = '550e8400-e29b-41d4-a716-446655440000';

describe('API Route - GET /api/car-brands/[id]', () => {
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
      expect(readCarBrand).not.toHaveBeenCalled();
    });

    it('returns 401 when session has no user', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: null } as any);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await GET(request, route);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(readCarBrand).not.toHaveBeenCalled();
    });
  });

  describe('authorization - GET allowed for any authenticated user', () => {
    it('returns 200 when regular user requests by id', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);
      const mockCarBrand = carBrand({ id: validId, code: 'audi', name: 'Audi' });
      vi.mocked(readCarBrand).mockResolvedValueOnce(mockCarBrand);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await GET(request, route);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.id).toBe(validId);
      expect(json.code).toBe('audi');
      expect(readCarBrand).toHaveBeenCalledWith(validId);
    });

    it('returns 200 when admin requests by id', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      const mockCarBrand = carBrand({ id: validId, code: 'bmw' });
      vi.mocked(readCarBrand).mockResolvedValueOnce(mockCarBrand);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await GET(request, route);

      expect(response.status).toBe(200);
      expect(readCarBrand).toHaveBeenCalledWith(validId);
    });
  });
});

describe('API Route - PUT /api/car-brands/[id]', () => {
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
    code: 'audi',
    name: 'Audi',
    isActive: true,
    translations: [
      { locale: 'en', name: 'Audi' },
      { locale: 'nl', name: 'Audi' },
    ],
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
      expect(updateCarBrand).not.toHaveBeenCalled();
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
      expect(updateCarBrand).not.toHaveBeenCalled();
    });

    it('returns 204 when admin updates', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      vi.mocked(updateCarBrand).mockResolvedValueOnce(carBrand(updateBody));

      const request = { json: vi.fn().mockResolvedValue(updateBody) } as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await PUT(request, route);

      expect(response.status).toBe(204);
      expect(updateCarBrand).toHaveBeenCalledTimes(1);
    });
  });
});

describe('API Route - DELETE /api/car-brands/[id]', () => {
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
      expect(deleteCarBrand).not.toHaveBeenCalled();
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
      expect(deleteCarBrand).not.toHaveBeenCalled();
    });

    it('returns 204 when admin deletes', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      vi.mocked(deleteCarBrand).mockResolvedValueOnce(undefined);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await DELETE(request, route);

      expect(response.status).toBe(204);
      expect(deleteCarBrand).toHaveBeenCalledWith(validId);
    });
  });
});
