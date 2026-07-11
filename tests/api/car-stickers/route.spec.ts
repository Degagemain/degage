import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/car-sticker/search', () => ({
  searchCarStickers: vi.fn(),
}));

vi.mock('@/actions/car-sticker/create', () => ({
  createCarSticker: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
  cookies: vi.fn().mockResolvedValue({ get: () => undefined }),
}));

import { GET, POST } from '@/api/car-stickers/route';
import { auth } from '@/auth';
import { searchCarStickers } from '@/actions/car-sticker/search';
import { createCarSticker } from '@/actions/car-sticker/create';
import { carSticker } from '../../builders/car-sticker.builder';

describe('API Route - GET /api/car-stickers', () => {
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
        nextUrl: new URL('http://localhost/api/car-stickers'),
      } as any;

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(searchCarStickers).not.toHaveBeenCalled();
    });

    it('returns 401 when session has no user', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: null } as any);

      const request = {
        nextUrl: new URL('http://localhost/api/car-stickers'),
      } as any;

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(searchCarStickers).not.toHaveBeenCalled();
    });
  });

  describe('GET returns list for authenticated users', () => {
    it('returns 200 when regular user requests list', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);
      vi.mocked(searchCarStickers).mockResolvedValueOnce({
        records: [carSticker({ name: 'Classic Dégage' })],
        total: 1,
      });

      const request = {
        nextUrl: new URL('http://localhost/api/car-stickers'),
      } as any;

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.records).toHaveLength(1);
      expect(json.total).toBe(1);
      expect(searchCarStickers).toHaveBeenCalledTimes(1);
    });

    it('returns 200 when admin requests list', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      vi.mocked(searchCarStickers).mockResolvedValueOnce({
        records: [carSticker({ name: 'Minimal' })],
        total: 1,
      });

      const request = {
        nextUrl: new URL('http://localhost/api/car-stickers'),
      } as any;

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(searchCarStickers).toHaveBeenCalledTimes(1);
    });
  });
});

describe('API Route - POST /api/car-stickers', () => {
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

  const validCarStickerBody = {
    id: null,
    name: 'Classic Dégage',
    isActive: true,
    isAlwaysIncluded: false,
    image: null,
    createdAt: null,
    updatedAt: null,
  };

  describe('authentication', () => {
    it('returns 401 when no session exists', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const request = {
        nextUrl: new URL('http://localhost/api/car-stickers'),
        json: vi.fn().mockResolvedValue(validCarStickerBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(createCarSticker).not.toHaveBeenCalled();
    });

    it('returns 401 when session has no user', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: null } as any);

      const request = {
        nextUrl: new URL('http://localhost/api/car-stickers'),
        json: vi.fn().mockResolvedValue(validCarStickerBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
      expect(createCarSticker).not.toHaveBeenCalled();
    });
  });

  describe('authorization - POST admin only', () => {
    it('returns 403 when regular user attempts to create', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockRegularUser } as any);

      const request = {
        nextUrl: new URL('http://localhost/api/car-stickers'),
        json: vi.fn().mockResolvedValue(validCarStickerBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.code).toBe('forbidden');
      expect(json.errors[0].message).toBe('Access denied');
      expect(createCarSticker).not.toHaveBeenCalled();
    });

    it('returns 201 when admin creates sticker', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockAdminUser } as any);
      const created = carSticker({ id: 'new-id', name: 'Classic Dégage' });
      vi.mocked(createCarSticker).mockResolvedValueOnce(created);

      const request = {
        nextUrl: new URL('http://localhost/api/car-stickers'),
        json: vi.fn().mockResolvedValue(validCarStickerBody),
      } as any;

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.name).toBe('Classic Dégage');
      expect(createCarSticker).toHaveBeenCalledTimes(1);
    });
  });
});
