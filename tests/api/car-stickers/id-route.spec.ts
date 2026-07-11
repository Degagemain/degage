import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/car-sticker/read', () => ({
  readCarSticker: vi.fn(),
}));

vi.mock('@/actions/car-sticker/update', () => ({
  updateCarSticker: vi.fn(),
}));

vi.mock('@/actions/car-sticker/delete', () => ({
  deleteCarSticker: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { DELETE, GET, PUT } from '@/api/car-stickers/[id]/route';
import { auth } from '@/auth';
import { readCarSticker } from '@/actions/car-sticker/read';
import { updateCarSticker } from '@/actions/car-sticker/update';
import { deleteCarSticker } from '@/actions/car-sticker/delete';
import { carSticker } from '../../builders/car-sticker.builder';

const validId = '550e8400-e29b-41d4-a716-446655440000';

describe('API Route - GET /api/car-stickers/[id]', () => {
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
      expect(readCarSticker).not.toHaveBeenCalled();
    });

    it('returns 401 when session has no user', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: null } as any);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await GET(request, route);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(readCarSticker).not.toHaveBeenCalled();
    });
  });

  describe('authorization - GET allowed for any authenticated user', () => {
    it('returns 200 when regular user requests by id', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);
      const mockCarSticker = carSticker({ id: validId, name: 'Classic Dégage' });
      vi.mocked(readCarSticker).mockResolvedValueOnce(mockCarSticker);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await GET(request, route);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.id).toBe(validId);
      expect(json.name).toBe('Classic Dégage');
      expect(readCarSticker).toHaveBeenCalledWith(validId);
    });

    it('returns 200 when admin requests by id', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      const mockCarSticker = carSticker({ id: validId, name: 'Minimal' });
      vi.mocked(readCarSticker).mockResolvedValueOnce(mockCarSticker);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await GET(request, route);

      expect(response.status).toBe(200);
      expect(readCarSticker).toHaveBeenCalledWith(validId);
    });
  });
});

describe('API Route - PUT /api/car-stickers/[id]', () => {
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
    name: 'Classic Dégage',
    isActive: true,
    isAlwaysIncluded: false,
    image: null,
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
      expect(updateCarSticker).not.toHaveBeenCalled();
    });

    it('returns 403 when regular user attempts to update', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);

      const request = { json: vi.fn().mockResolvedValue(updateBody) } as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await PUT(request, route);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.code).toBe('forbidden');
      expect(json.errors[0].message).toBe('Access denied');
      expect(updateCarSticker).not.toHaveBeenCalled();
    });

    it('returns 204 when admin updates', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      vi.mocked(updateCarSticker).mockResolvedValueOnce(carSticker(updateBody));

      const request = { json: vi.fn().mockResolvedValue(updateBody) } as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await PUT(request, route);

      expect(response.status).toBe(204);
      expect(updateCarSticker).toHaveBeenCalledTimes(1);
    });
  });
});

describe('API Route - DELETE /api/car-stickers/[id]', () => {
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
      expect(deleteCarSticker).not.toHaveBeenCalled();
    });

    it('returns 403 when regular user attempts to delete', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await DELETE(request, route);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.code).toBe('forbidden');
      expect(json.errors[0].message).toBe('Access denied');
      expect(deleteCarSticker).not.toHaveBeenCalled();
    });

    it('returns 204 when admin deletes', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      vi.mocked(deleteCarSticker).mockResolvedValueOnce(undefined);

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await DELETE(request, route);

      expect(response.status).toBe(204);
      expect(deleteCarSticker).toHaveBeenCalledWith(validId);
    });

    it('returns 409 when sticker is linked to car onboardings', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      vi.mocked(deleteCarSticker).mockRejectedValueOnce({ code: 'P2003' });

      const request = {} as any;
      const route = { params: Promise.resolve({ id: validId }) };

      const response = await DELETE(request, route);
      const json = await response.json();

      expect(response.status).toBe(409);
      expect(json.code).toBe('conflict');
      expect(json.errors[0].message).toBe('Resource is linked to other records and cannot be deleted');
    });
  });
});
