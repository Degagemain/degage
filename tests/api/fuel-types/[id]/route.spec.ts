import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/fuel-type/read', () => ({
  readFuelType: vi.fn(),
}));

vi.mock('@/actions/fuel-type/update', () => ({
  updateFuelType: vi.fn(),
}));

vi.mock('@/actions/fuel-type/delete', () => ({
  deleteFuelType: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET, PUT, DELETE } from '@/api/fuel-types/[id]/route';
import { auth } from '@/auth';
import { readFuelType } from '@/actions/fuel-type/read';
import { updateFuelType } from '@/actions/fuel-type/update';
import { deleteFuelType } from '@/actions/fuel-type/delete';
import { fuelType } from '../../../builders/fuel-type.builder';

const validId = '550e8400-e29b-41d4-a716-446655440000';

describe('API Route - GET /api/fuel-types/[id]', () => {
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
      expect(readFuelType).not.toHaveBeenCalled();
    });

    it('returns 401 when session has no user', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: null } as any);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await GET(request, route);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(readFuelType).not.toHaveBeenCalled();
    });
  });

  describe('authorization - GET allowed for any authenticated user', () => {
    it('returns 200 when regular user requests by id', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);
      const mockFuelType = fuelType({ id: validId, code: 'ELECTRIC', name: 'Electric' });
      vi.mocked(readFuelType).mockResolvedValueOnce(mockFuelType);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await GET(request, route);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.id).toBe(validId);
      expect(json.code).toBe('ELECTRIC');
      expect(readFuelType).toHaveBeenCalledWith(validId);
    });

    it('returns 200 when admin requests by id', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      const mockFuelType = fuelType({ id: validId, code: 'DIESEL' });
      vi.mocked(readFuelType).mockResolvedValueOnce(mockFuelType);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await GET(request, route);

      expect(response.status).toBe(200);
      expect(readFuelType).toHaveBeenCalledWith(validId);
    });
  });
});

describe('API Route - PUT /api/fuel-types/[id]', () => {
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
    code: 'ELECTRIC',
    name: 'Electric',
    isActive: true,
    translations: [
      { locale: 'en', name: 'Electric' },
      { locale: 'nl', name: 'Elektrisch' },
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
      expect(updateFuelType).not.toHaveBeenCalled();
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
      expect(updateFuelType).not.toHaveBeenCalled();
    });

    it('returns 204 when admin updates', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      vi.mocked(updateFuelType).mockResolvedValueOnce(fuelType(updateBody));

      const request = { json: vi.fn().mockResolvedValue(updateBody) } as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await PUT(request, route);

      expect(response.status).toBe(204);
      expect(updateFuelType).toHaveBeenCalledTimes(1);
    });
  });
});

describe('API Route - DELETE /api/fuel-types/[id]', () => {
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
      expect(deleteFuelType).not.toHaveBeenCalled();
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
      expect(deleteFuelType).not.toHaveBeenCalled();
    });

    it('returns 204 when admin deletes', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      vi.mocked(deleteFuelType).mockResolvedValueOnce(undefined);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await DELETE(request, route);

      expect(response.status).toBe(204);
      expect(deleteFuelType).toHaveBeenCalledWith(validId);
    });
  });
});
